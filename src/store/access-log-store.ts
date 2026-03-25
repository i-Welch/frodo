import { keys, putItem, queryItems } from './base-store.js';
import type { VerificationTier } from '../types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccessLogEntry {
  tenantId: string;
  userId: string;
  modules: string[];
  fields: string[];
  verifiedTier: VerificationTier;
  apiKeyId: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Log a data access event.
 *
 * PK  = ACCESSLOG#<tenantId>,  SK = <timestamp>#<userId>
 * GSI1PK = USER#<userId>,  GSI1SK = ACCESSLOG#<tenantId>#<timestamp>
 */
export async function logAccess(entry: {
  tenantId: string;
  userId: string;
  modules: string[];
  fields: string[];
  verifiedTier: VerificationTier;
  apiKeyId: string;
}): Promise<void> {
  const ts = new Date().toISOString();
  const key = keys.accessLog(entry.tenantId, ts, entry.userId);

  await putItem({
    ...key,
    GSI1PK: `USER#${entry.userId}`,
    GSI1SK: `ACCESSLOG#${entry.tenantId}#${ts}`,
    tenantId: entry.tenantId,
    userId: entry.userId,
    modules: entry.modules,
    fields: entry.fields,
    verifiedTier: entry.verifiedTier,
    apiKeyId: entry.apiKeyId,
    timestamp: ts,
  });
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get access logs for a tenant, newest first.
 */
export async function getAccessLogsForTenant(
  tenantId: string,
  options?: { limit?: number; cursor?: string },
): Promise<{ logs: AccessLogEntry[]; cursor?: string }> {
  const result = await queryItems({
    pk: `ACCESSLOG#${tenantId}`,
    limit: options?.limit,
    cursor: options?.cursor,
    scanForward: false,
  });

  return {
    logs: result.items.map(toAccessLogEntry),
    cursor: result.cursor,
  };
}

/**
 * Get access logs for a user across all tenants, newest first.
 * Uses GSI1.
 */
export async function getAccessLogsForUser(
  userId: string,
  options?: { limit?: number; cursor?: string },
): Promise<{ logs: AccessLogEntry[]; cursor?: string }> {
  const result = await queryItems({
    pk: `USER#${userId}`,
    skPrefix: 'ACCESSLOG#',
    indexName: 'GSI1',
    limit: options?.limit,
    cursor: options?.cursor,
    scanForward: false,
  });

  return {
    logs: result.items.map(toAccessLogEntry),
    cursor: result.cursor,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toAccessLogEntry(item: Record<string, unknown>): AccessLogEntry {
  return {
    tenantId: item.tenantId as string,
    userId: item.userId as string,
    modules: (item.modules as string[]) ?? [],
    fields: (item.fields as string[]) ?? [],
    verifiedTier: item.verifiedTier as number,
    apiKeyId: item.apiKeyId as string,
    timestamp: item.timestamp as string,
  };
}
