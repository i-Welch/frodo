import { keys, gsiKeys, putItem, getItem, deleteItem, updateItem } from './base-store';
import type { UserSession } from '../sessions/types';

// ---------------------------------------------------------------------------
// Session CRUD (low-level storage operations)
// ---------------------------------------------------------------------------

/**
 * Write a session to the store with TTL and GSI keys.
 *
 * PK  = SESSION#<sessionId>,  SK  = METADATA
 * GSI1PK = USER#<userId>,  GSI1SK = SESSION#<tenantId>#<createdAt>
 * ttl = expiresAt as epoch seconds
 */
export async function putSession(session: UserSession): Promise<void> {
  const key = keys.session(session.sessionId);
  const gsi = gsiKeys.sessionsForUser(session.userId);

  await putItem({
    ...key,
    ...gsi,
    GSI1SK: `SESSION#${session.tenantId}#${session.createdAt}`,
    sessionId: session.sessionId,
    userId: session.userId,
    verifiedTier: session.verifiedTier,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    tenantId: session.tenantId,
    ttl: Math.floor(new Date(session.expiresAt).getTime() / 1000),
  });
}

/**
 * Retrieve a session by sessionId.
 * Returns null if the item doesn't exist (or was TTL-deleted).
 * Does NOT check expiry — caller must do that.
 */
export async function getSessionItem(sessionId: string): Promise<UserSession | null> {
  const key = keys.session(sessionId);
  const item = await getItem(key);
  if (!item) return null;

  return {
    sessionId: item.sessionId as string,
    userId: item.userId as string,
    verifiedTier: item.verifiedTier as number,
    createdAt: item.createdAt as string,
    expiresAt: item.expiresAt as string,
    tenantId: item.tenantId as string,
  };
}

/**
 * Update the expiresAt (and ttl) for an existing session.
 */
export async function updateSessionExpiry(sessionId: string, expiresAt: string): Promise<void> {
  const key = keys.session(sessionId);

  await updateItem(key, {
    expiresAt,
    ttl: Math.floor(new Date(expiresAt).getTime() / 1000),
  });
}

/**
 * Delete a session by sessionId.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const key = keys.session(sessionId);
  await deleteItem(key);
}
