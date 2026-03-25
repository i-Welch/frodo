import crypto from 'node:crypto';
import { getModule } from '../store/user-store.js';
import { appendEvent } from '../store/event-store.js';
import { materializeModule } from '../events/materializer.js';
import { getSourceConfig } from '../config/source-configs.js';
import { durationToMs } from '../types.js';
import { getEnrichers } from './registry.js';
import { createChildLogger } from '../logger.js';
import type { DataEvent, FieldChange } from '../events/types.js';
import type { Enricher, EnrichmentResult, EnrichmentReport } from './types.js';
import type { SourceConfig } from '../config/source-configs.js';

const log = createChildLogger({ module: 'enrichment-engine' });

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Run all enrichers for a single module on a user, persist events,
 * rematerialize, and return a report.
 */
export async function enrichModule(
  userId: string,
  moduleName: string,
  actor: string,
  tenantId?: string,
  sandbox?: boolean,
): Promise<EnrichmentReport> {
  // 1. Load current module data (may be null for first enrichment)
  const currentData = await getModule(userId, moduleName);

  // 2. Get registered enrichers for this module
  const enrichers = getEnrichers(moduleName);

  log.debug(
    { userId, module: moduleName, enricherCount: enrichers.length, sandbox },
    'Starting module enrichment',
  );

  const report: EnrichmentReport = {
    userId,
    module: moduleName,
    successes: [],
    failures: [],
  };

  if (enrichers.length === 0) {
    return report;
  }

  // 3. Run all enrichers concurrently with timeout
  const results = await Promise.allSettled(
    enrichers.map(async (enricher) => {
      const timeoutMs = enricher.timeoutMs ?? DEFAULT_TIMEOUT_MS;
      const result = await withTimeout(
        enricher.enrich(userId, (currentData ?? {}) as Partial<Record<string, unknown>>),
        timeoutMs,
      );
      return { enricher, result };
    }),
  );

  // 4. Process each result
  for (let i = 0; i < results.length; i++) {
    const settled = results[i];
    const enricher = enrichers[i];

    if (settled.status === 'fulfilled') {
      const { result } = settled.value;
      const sourceConfig = getSourceConfig(enricher.source);

      if (!sourceConfig) {
        log.warn(
          { source: enricher.source },
          'No source config found for enricher source, skipping',
        );
        report.failures.push({
          source: enricher.source,
          error: `No source config for source '${enricher.source}'`,
        });
        continue;
      }

      // Build and append the data event
      const event = buildDataEvent(
        userId,
        moduleName,
        enricher.source,
        actor,
        tenantId,
        result,
        sourceConfig,
        currentData,
      );

      await appendEvent(event);

      const fields = Object.keys(result.data);
      report.successes.push({ source: enricher.source, fields });

      log.debug(
        { source: enricher.source, fields },
        'Enricher succeeded',
      );
    } else {
      // FAILURE: build error event and add to failures
      const errorMessage =
        settled.reason instanceof Error
          ? settled.reason.message
          : String(settled.reason);

      const errorEvent = buildErrorEvent(
        userId,
        moduleName,
        enricher.source,
        actor,
        tenantId,
        errorMessage,
      );

      await appendEvent(errorEvent);

      report.failures.push({
        source: enricher.source,
        error: errorMessage,
      });

      log.warn(
        { source: enricher.source, error: errorMessage },
        'Enricher failed',
      );
    }
  }

  // 5. Rematerialize the module (persist=true)
  await materializeModule(userId, moduleName, { persist: true });

  // 6. Return the report
  return report;
}

/**
 * Build a DataEvent from a successful enrichment result.
 */
function buildDataEvent(
  userId: string,
  moduleName: string,
  source: string,
  actor: string,
  tenantId: string | undefined,
  result: EnrichmentResult,
  sourceConfig: SourceConfig,
  currentData: Record<string, unknown> | null,
): DataEvent {
  const now = new Date().toISOString();
  const changes: FieldChange[] = [];

  for (const [field, newValue] of Object.entries(result.data)) {
    const confidence =
      sourceConfig.fieldConfidence?.[field] ?? sourceConfig.confidence;
    const ttl = sourceConfig.fieldTtls?.[field] ?? sourceConfig.defaultTtl;
    const goodBy = new Date(Date.now() + durationToMs(ttl)).toISOString();

    changes.push({
      field,
      previousValue: currentData?.[field] ?? null,
      newValue,
      confidence,
      goodBy,
    });
  }

  return {
    eventId: crypto.randomUUID(),
    userId,
    module: moduleName,
    source: { source, actor, tenantId },
    changes,
    timestamp: now,
    metadata: result.metadata,
  };
}

/**
 * Build a DataEvent for a failed enrichment (empty changes, error in metadata).
 */
function buildErrorEvent(
  userId: string,
  moduleName: string,
  source: string,
  actor: string,
  tenantId: string | undefined,
  error: string,
): DataEvent {
  return {
    eventId: crypto.randomUUID(),
    userId,
    module: moduleName,
    source: { source, actor, tenantId },
    changes: [],
    timestamp: new Date().toISOString(),
    metadata: { error, enrichmentFailed: true },
  };
}

/**
 * Race a promise against a timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms),
    ),
  ]);
}
