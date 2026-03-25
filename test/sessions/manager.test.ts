import { describe, it, expect, beforeAll } from 'vitest';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import {
  createSession,
  getSession,
  extendSession,
  invalidateSession,
} from '../../src/sessions/manager.js';
import { VerificationTier } from '../../src/types.js';

// ---------------------------------------------------------------------------
// Table setup
// ---------------------------------------------------------------------------

async function ensureTable(): Promise<void> {
  try {
    await dynamoClient.send(
      new DescribeTableCommand({ TableName: TABLE_NAME }),
    );
  } catch (err) {
    if (!(err instanceof ResourceNotFoundException)) throw err;

    await dynamoClient.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' },
          { AttributeName: 'GSI1PK', AttributeType: 'S' },
          { AttributeName: 'GSI1SK', AttributeType: 'S' },
          { AttributeName: 'GSI2PK', AttributeType: 'S' },
          { AttributeName: 'GSI2SK', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'GSI1',
            KeySchema: [
              { AttributeName: 'GSI1PK', KeyType: 'HASH' },
              { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
          {
            IndexName: 'GSI2',
            KeySchema: [
              { AttributeName: 'GSI2PK', KeyType: 'HASH' },
              { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('session manager', () => {
  beforeAll(async () => {
    await ensureTable();
  });

  describe('createSession + getSession', () => {
    it('creates a session and retrieves it', async () => {
      const userId = `user-sess-${Date.now()}`;
      const tenantId = `tenant-sess-${Date.now()}`;

      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.BasicOTP,
      );

      expect(session.sessionId).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.tenantId).toBe(tenantId);
      expect(session.verifiedTier).toBe(VerificationTier.BasicOTP);
      expect(session.createdAt).toBeDefined();
      expect(session.expiresAt).toBeDefined();

      // expiresAt should be ~15 minutes from createdAt
      const createdMs = new Date(session.createdAt).getTime();
      const expiresMs = new Date(session.expiresAt).getTime();
      const diffMinutes = (expiresMs - createdMs) / 60_000;
      expect(diffMinutes).toBeCloseTo(15, 0);

      // Retrieve it
      const retrieved = await getSession(session.sessionId);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.sessionId).toBe(session.sessionId);
      expect(retrieved!.userId).toBe(userId);
      expect(retrieved!.tenantId).toBe(tenantId);
      expect(retrieved!.verifiedTier).toBe(VerificationTier.BasicOTP);
    });
  });

  describe('session expiry', () => {
    it('returns null for an expired session', async () => {
      const userId = `user-exp-${Date.now()}`;
      const tenantId = `tenant-exp-${Date.now()}`;

      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.EnhancedOTP,
      );

      // Manually set expiresAt to the past via the store layer
      const { updateSessionExpiry } = await import(
        '../../src/store/session-store.js'
      );
      const pastDate = new Date(Date.now() - 1000).toISOString();
      await updateSessionExpiry(session.sessionId, pastDate);

      // getSession should return null for expired session
      const retrieved = await getSession(session.sessionId);
      expect(retrieved).toBeNull();
    });
  });

  describe('extendSession', () => {
    it('extends a session by another 15-minute window', async () => {
      const userId = `user-ext-${Date.now()}`;
      const tenantId = `tenant-ext-${Date.now()}`;

      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.BasicOTP,
      );

      const originalExpiresAt = session.expiresAt;

      // Small delay so "now" has moved forward
      await new Promise((resolve) => setTimeout(resolve, 50));

      const extended = await extendSession(session.sessionId);
      expect(extended).not.toBeNull();
      expect(extended!.sessionId).toBe(session.sessionId);

      // New expiresAt should be >= original
      const newExpiresMs = new Date(extended!.expiresAt).getTime();
      const origExpiresMs = new Date(originalExpiresAt).getTime();
      expect(newExpiresMs).toBeGreaterThanOrEqual(origExpiresMs);
    });

    it('respects the 1-hour max lifetime', async () => {
      const userId = `user-max-${Date.now()}`;
      const tenantId = `tenant-max-${Date.now()}`;

      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.Identity,
      );

      // Manually set createdAt to 55 minutes ago so the 1-hour cap kicks in
      const { putSession: overwriteSession } = await import(
        '../../src/store/session-store.js'
      );
      const createdAt55MinAgo = new Date(
        Date.now() - 55 * 60 * 1000,
      ).toISOString();
      await overwriteSession({
        ...session,
        createdAt: createdAt55MinAgo,
      });

      const extended = await extendSession(session.sessionId);
      expect(extended).not.toBeNull();

      // The expiresAt should be capped at createdAt + 1 hour
      const createdMs = new Date(createdAt55MinAgo).getTime();
      const maxExpiry = createdMs + 60 * 60 * 1000;
      const actualExpiry = new Date(extended!.expiresAt).getTime();

      // actualExpiry should be <= maxExpiry (with 1s tolerance for timing)
      expect(actualExpiry).toBeLessThanOrEqual(maxExpiry + 1000);

      // And it should NOT be createdAt + 15 min from now (which would be ~70 min total)
      const fifteenMinFromNow = Date.now() + 15 * 60 * 1000;
      expect(actualExpiry).toBeLessThanOrEqual(fifteenMinFromNow);
    });

    it('returns null for a non-existent session', async () => {
      const result = await extendSession('nonexistent-session-id');
      expect(result).toBeNull();
    });
  });

  describe('invalidateSession', () => {
    it('deletes the session so getSession returns null', async () => {
      const userId = `user-inv-${Date.now()}`;
      const tenantId = `tenant-inv-${Date.now()}`;

      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.BasicOTP,
      );

      // Confirm it exists
      const before = await getSession(session.sessionId);
      expect(before).not.toBeNull();

      // Invalidate
      await invalidateSession(session.sessionId);

      // Confirm it's gone
      const after = await getSession(session.sessionId);
      expect(after).toBeNull();
    });
  });
});
