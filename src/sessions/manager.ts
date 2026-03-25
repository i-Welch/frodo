import crypto from 'node:crypto';
import {
  putSession,
  getSessionItem,
  updateSessionExpiry,
  deleteSession,
} from '../store/session-store.js';
import { createChildLogger } from '../logger.js';
import type { VerificationTier } from '../types.js';
import type { UserSession } from './types.js';

const log = createChildLogger({ module: 'session-manager' });

/** Session sliding window: 15 minutes. */
const SESSION_WINDOW_MS = 15 * 60 * 1000;

/** Maximum session lifetime from creation: 1 hour. */
const SESSION_MAX_LIFETIME_MS = 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a new session for a user within a specific tenant context.
 * The session expires 15 minutes from now.
 */
export async function createSession(
  userId: string,
  tenantId: string,
  tier: VerificationTier,
): Promise<UserSession> {
  const now = new Date();
  const sessionId = crypto.randomUUID();

  const session: UserSession = {
    sessionId,
    userId,
    verifiedTier: tier,
    tenantId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_WINDOW_MS).toISOString(),
  };

  await putSession(session);

  log.debug(
    { sessionId, userId, tenantId, tier },
    'Session created',
  );

  return session;
}

/**
 * Retrieve a session by ID. Returns null if the session does not exist
 * or has expired.
 *
 * DynamoDB TTL deletion is eventually consistent, so we always check
 * the expiresAt field explicitly.
 */
export async function getSession(
  sessionId: string,
): Promise<UserSession | null> {
  const session = await getSessionItem(sessionId);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    log.debug({ sessionId }, 'Session expired');
    return null;
  }

  return session;
}

/**
 * Extend a session's expiry by another 15-minute window, capped at
 * 1 hour from the original createdAt.
 *
 * Returns the updated session, or null if the session doesn't exist
 * or has already expired.
 */
export async function extendSession(
  sessionId: string,
): Promise<UserSession | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  const now = Date.now();
  const createdAtMs = new Date(session.createdAt).getTime();
  const maxExpiry = createdAtMs + SESSION_MAX_LIFETIME_MS;

  const newExpiry = Math.min(now + SESSION_WINDOW_MS, maxExpiry);
  const newExpiresAt = new Date(newExpiry).toISOString();

  await updateSessionExpiry(sessionId, newExpiresAt);

  log.debug({ sessionId, newExpiresAt }, 'Session extended');

  return { ...session, expiresAt: newExpiresAt };
}

/**
 * Invalidate (delete) a session immediately.
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await deleteSession(sessionId);
  log.debug({ sessionId }, 'Session invalidated');
}
