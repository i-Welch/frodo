import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamo-client.js';
import { keys, gsiKeys, putItem, getItem, deleteItem } from './base-store.js';
import type { UserSession } from '../sessions/types.js';

// ---------------------------------------------------------------------------
// Session CRUD (low-level DynamoDB operations)
// ---------------------------------------------------------------------------

/**
 * Write a session to DynamoDB with TTL and GSI keys.
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
export async function getSessionItem(
  sessionId: string,
): Promise<UserSession | null> {
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
export async function updateSessionExpiry(
  sessionId: string,
  expiresAt: string,
): Promise<void> {
  const key = keys.session(sessionId);

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key,
      UpdateExpression: 'SET #expiresAt = :expiresAt, #ttl = :ttl',
      ExpressionAttributeNames: {
        '#expiresAt': 'expiresAt',
        '#ttl': 'ttl',
      },
      ExpressionAttributeValues: {
        ':expiresAt': expiresAt,
        ':ttl': Math.floor(new Date(expiresAt).getTime() / 1000),
      },
    }),
  );
}

/**
 * Delete a session by sessionId.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const key = keys.session(sessionId);
  await deleteItem(key);
}
