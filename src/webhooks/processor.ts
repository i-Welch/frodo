import crypto from 'node:crypto';
import { getWebhookHandler } from './registry.js';
import { getSourceConfig } from '../config/source-configs.js';
import { appendEvent } from '../store/event-store.js';
import { getModule } from '../store/user-store.js';
import { materializeModule } from '../events/materializer.js';
import { durationToMs } from '../types.js';
import { enrichModule } from '../enrichment/engine.js';
import { createChildLogger } from '../logger.js';
import type { WebhookEvent } from './types.js';
import type { DataEvent, FieldChange } from '../events/types.js';

const log = createChildLogger({ module: 'webhook-processor' });

export interface WebhookProcessResult {
  processed: number;
  errors: { userId: string; error: string }[];
}

/**
 * Process an incoming webhook from a provider.
 * 1. Validate via handler
 * 2. Parse into WebhookEvents
 * 3. For each event: build DataEvent, append, rematerialize
 */
export async function processWebhook(
  provider: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<WebhookProcessResult> {
  const handler = getWebhookHandler(provider);
  if (!handler) {
    throw new Error(`No webhook handler registered for provider '${provider}'`);
  }

  // 1. Validate
  if (!await handler.validate(headers, body)) {
    throw new Error(`Webhook validation failed for provider '${provider}'`);
  }

  // 2. Parse
  const events = handler.parse(body);

  log.debug(
    { provider, eventCount: events.length },
    'Parsed webhook events',
  );

  // 3. Process each event
  const result: WebhookProcessResult = { processed: 0, errors: [] };

  for (const event of events) {
    try {
      await processWebhookEvent(provider, event);
      result.processed++;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      result.errors.push({ userId: event.userId, error: errorMessage });
      log.warn(
        { provider, userId: event.userId, error: errorMessage },
        'Failed to process webhook event',
      );
    }
  }

  return result;
}

async function processWebhookEvent(
  provider: string,
  event: WebhookEvent,
): Promise<void> {
  const sourceConfig = getSourceConfig(provider);
  if (!sourceConfig) {
    throw new Error(`No source config for provider '${provider}'`);
  }

  const currentData = await getModule(event.userId, event.module);
  const now = new Date().toISOString();
  const changes: FieldChange[] = [];

  for (const [field, newValue] of Object.entries(event.fields)) {
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

  const dataEvent: DataEvent = {
    eventId: crypto.randomUUID(),
    userId: event.userId,
    module: event.module,
    source: { source: provider, actor: 'webhook' },
    changes,
    timestamp: now,
    metadata: event.metadata,
  };

  if (changes.length > 0) {
    await appendEvent(dataEvent);
    await materializeModule(event.userId, event.module, { persist: true });
  }

  // Auto re-enrichment: if the webhook signals modules should be refreshed
  const reEnrichModules = (event.metadata?.reEnrichModules as string[]) ?? [];
  if (reEnrichModules.length > 0) {
    log.info(
      { provider, userId: event.userId, modules: reEnrichModules },
      'Webhook triggering re-enrichment',
    );
    for (const mod of reEnrichModules) {
      enrichModule(event.userId, mod, 'webhook', undefined)
        .catch((err) => log.warn({ module: mod, error: String(err) }, 'Webhook re-enrichment failed'));
    }
  }

  log.debug(
    { provider, userId: event.userId, module: event.module, fields: Object.keys(event.fields) },
    'Processed webhook event',
  );
}
