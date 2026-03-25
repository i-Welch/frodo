import { getEventsForModule } from '../store/event-store.js';
import { resolveFields } from '../events/resolver.js';
import { getEnrichedModuleNames } from './registry.js';
import { queryItems } from '../store/base-store.js';
import { createChildLogger } from '../logger.js';
import type { DataEvent } from '../events/types.js';
import type { ResolvedField } from '../events/resolver.js';

const log = createChildLogger({ module: 'staleness' });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StaleField {
  userId: string;
  module: string;
  field: string;
  source: string;
  goodBy: string;
  lastUpdated: string;
  confidence: number;
}

export interface StalenessReport {
  userId: string;
  staleModules: {
    module: string;
    staleFields: StaleField[];
    freshFields: number;
    totalFields: number;
  }[];
}

export interface RefreshJobResult {
  scannedUsers: number;
  usersWithStaleData: number;
  staleFieldCount: number;
  byModule: Record<string, number>;
  bySource: Record<string, number>;
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Check staleness for a single user across all (or specified) modules.
 */
export async function checkStaleness(
  userId: string,
  modules?: string[],
): Promise<StalenessReport> {
  const moduleNames = modules ?? getEnrichedModuleNames();
  const now = new Date();

  const report: StalenessReport = {
    userId,
    staleModules: [],
  };

  for (const moduleName of moduleNames) {
    const allEvents = await getAllEventsForModule(userId, moduleName);
    // Resolve all fields (including expired ones for staleness tracking)
    const resolvedCurrent = resolveFields(allEvents, now);
    const resolvedAll = resolveFieldsIncludingExpired(allEvents);

    const staleFields: StaleField[] = [];
    let freshCount = 0;

    // Check each field that has ever been set
    for (const [field, data] of Object.entries(resolvedAll)) {
      const current = resolvedCurrent[field];
      if (current) {
        // Field still has a valid value
        freshCount++;
      } else {
        // Field existed but is now expired
        staleFields.push({
          userId,
          module: moduleName,
          field,
          source: data.source,
          goodBy: data.goodBy,
          lastUpdated: data.timestamp,
          confidence: data.confidence,
        });
      }
    }

    if (staleFields.length > 0 || freshCount > 0) {
      report.staleModules.push({
        module: moduleName,
        staleFields,
        freshFields: freshCount,
        totalFields: staleFields.length + freshCount,
      });
    }
  }

  return report;
}

/**
 * Get stale fields for a specific user + module.
 */
export async function getStaleFields(
  userId: string,
  module: string,
): Promise<StaleField[]> {
  const report = await checkStaleness(userId, [module]);
  const moduleReport = report.staleModules.find((m) => m.module === module);
  return moduleReport?.staleFields ?? [];
}

/**
 * Batch staleness scan. Scans users and flags stale data.
 * Emits structured logs for CloudWatch metric filters.
 * Does NOT auto-enrich.
 */
export async function runRefreshJob(
  options?: { limit?: number },
): Promise<RefreshJobResult> {
  const start = Date.now();
  const limit = options?.limit;

  // Find distinct user IDs that have module data
  const userIds = await scanUserIds(limit);

  const result: RefreshJobResult = {
    scannedUsers: userIds.length,
    usersWithStaleData: 0,
    staleFieldCount: 0,
    byModule: {},
    bySource: {},
    durationMs: 0,
  };

  for (const userId of userIds) {
    const report = await checkStaleness(userId);
    let userHasStale = false;

    for (const mod of report.staleModules) {
      for (const field of mod.staleFields) {
        userHasStale = true;
        result.staleFieldCount++;
        result.byModule[field.module] = (result.byModule[field.module] ?? 0) + 1;
        result.bySource[field.source] = (result.bySource[field.source] ?? 0) + 1;

        // Structured log for CloudWatch metric filters
        log.info(
          {
            type: 'stale_field',
            userId: field.userId,
            module: field.module,
            field: field.field,
            source: field.source,
            goodBy: field.goodBy,
            lastUpdated: field.lastUpdated,
          },
          'Stale field detected',
        );
      }
    }

    if (userHasStale) {
      result.usersWithStaleData++;
    }
  }

  result.durationMs = Date.now() - start;

  log.info(
    {
      type: 'refresh_job_complete',
      scannedUsers: result.scannedUsers,
      usersWithStaleData: result.usersWithStaleData,
      staleFieldCount: result.staleFieldCount,
      durationMs: result.durationMs,
    },
    'Refresh job completed',
  );

  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAllEventsForModule(
  userId: string,
  module: string,
): Promise<DataEvent[]> {
  const allEvents: DataEvent[] = [];
  let cursor: string | undefined;

  do {
    const result = await getEventsForModule(userId, module, { cursor });
    allEvents.push(...result.events);
    cursor = result.cursor;
  } while (cursor);

  return allEvents;
}

/**
 * Resolve fields ignoring expiry — returns the most recent value for every field
 * that has ever been set, regardless of goodBy date.
 * Uses epoch (1970) as `now` so the filter `goodByDate < currentTime` never triggers.
 */
function resolveFieldsIncludingExpired(
  events: DataEvent[],
): Record<string, ResolvedField> {
  return resolveFields(events, new Date(0));
}

/**
 * Scan for distinct user IDs that have module data.
 * Uses a simple scan of USER# PKs (in production you'd use a secondary index or user table).
 */
async function scanUserIds(limit?: number): Promise<string[]> {
  const userIds = new Set<string>();
  let cursor: string | undefined;

  // Query for MODULE# items grouped by user
  // We scan for USER# PKs with MODULE# sort keys
  do {
    const result = await queryItems({
      pk: 'USER#',
      // We can't query with just a PK prefix on the main table,
      // so we use a different approach: query events by each known module
      cursor,
    });

    for (const item of result.items) {
      const pk = item.PK as string;
      if (pk.startsWith('USER#')) {
        const userId = pk.slice(5);
        userIds.add(userId);
        if (limit && userIds.size >= limit) {
          return Array.from(userIds);
        }
      }
    }
    cursor = result.cursor;
  } while (cursor);

  return Array.from(userIds);
}
