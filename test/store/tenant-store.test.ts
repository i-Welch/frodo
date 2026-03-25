import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import {
  createTenant,
  getTenant,
  deleteTenant,
  storeApiKey,
  lookupApiKeyByPrefix,
  revokeApiKey,
  updateApiKeyLastUsed,
} from '../../src/store/tenant-store.js';
import { getItem } from '../../src/store/base-store.js';
import { keys } from '../../src/store/base-store.js';
import type { Tenant, StoredApiKey } from '../../src/tenancy/types.js';
import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// Table setup — create the table once for the entire test file
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
// Helpers
// ---------------------------------------------------------------------------

function makeTenant(overrides?: Partial<Tenant>): Tenant {
  return {
    tenantId: crypto.randomUUID(),
    name: 'Test Tenant',
    permissions: [],
    callbackUrls: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeStoredApiKey(
  tenantId: string,
  overrides?: Partial<StoredApiKey>,
): StoredApiKey {
  return {
    keyId: crypto.randomUUID(),
    tenantId,
    prefix: crypto.randomBytes(4).toString('hex'), // 8 hex chars
    hash: crypto.randomBytes(32).toString('hex'),
    environment: 'sandbox' as const,
    active: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('tenant-store', () => {
  beforeAll(async () => {
    await ensureTable();
  });

  describe('tenant CRUD', () => {
    it('creates and retrieves a tenant', async () => {
      const tenant = makeTenant({ name: 'Acme Corp' });

      await createTenant(tenant);
      const retrieved = await getTenant(tenant.tenantId);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.tenantId).toBe(tenant.tenantId);
      expect(retrieved!.name).toBe('Acme Corp');
      expect(retrieved!.permissions).toEqual([]);
      expect(retrieved!.callbackUrls).toEqual([]);
      expect(retrieved!.createdAt).toBe(tenant.createdAt);
    });

    it('returns null for nonexistent tenant', async () => {
      const result = await getTenant('nonexistent-tenant-id');
      expect(result).toBeNull();
    });

    it('deletes a tenant', async () => {
      const tenant = makeTenant();
      await createTenant(tenant);

      // Verify it exists
      const before = await getTenant(tenant.tenantId);
      expect(before).not.toBeNull();

      await deleteTenant(tenant.tenantId);

      const after = await getTenant(tenant.tenantId);
      expect(after).toBeNull();
    });

    it('preserves optional fields', async () => {
      const tenant = makeTenant({
        consentAddendum: 'Extra consent text',
        webhookUrl: 'https://example.com/webhook',
        callbackUrls: ['https://example.com/callback'],
        permissions: [{ module: 'steps', requiredTier: 2 }],
      });

      await createTenant(tenant);
      const retrieved = await getTenant(tenant.tenantId);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.consentAddendum).toBe('Extra consent text');
      expect(retrieved!.webhookUrl).toBe('https://example.com/webhook');
      expect(retrieved!.callbackUrls).toEqual([
        'https://example.com/callback',
      ]);
      expect(retrieved!.permissions).toEqual([
        { module: 'steps', requiredTier: 2 },
      ]);
    });
  });

  describe('API key operations', () => {
    it('stores and looks up an API key by prefix', async () => {
      const tenant = makeTenant();
      await createTenant(tenant);

      const apiKey = makeStoredApiKey(tenant.tenantId);
      await storeApiKey(apiKey);

      const found = await lookupApiKeyByPrefix(apiKey.prefix);

      expect(found).not.toBeNull();
      expect(found!.keyId).toBe(apiKey.keyId);
      expect(found!.tenantId).toBe(tenant.tenantId);
      expect(found!.prefix).toBe(apiKey.prefix);
      expect(found!.hash).toBe(apiKey.hash);
      expect(found!.environment).toBe('sandbox');
      expect(found!.active).toBe(true);
    });

    it('returns null for nonexistent prefix', async () => {
      const found = await lookupApiKeyByPrefix('nonexist');
      expect(found).toBeNull();
    });

    it('revokes an API key', async () => {
      const tenant = makeTenant();
      await createTenant(tenant);

      const apiKey = makeStoredApiKey(tenant.tenantId);
      await storeApiKey(apiKey);

      // Verify active before revoke
      const before = await lookupApiKeyByPrefix(apiKey.prefix);
      expect(before!.active).toBe(true);

      await revokeApiKey(tenant.tenantId, apiKey.keyId);

      const after = await lookupApiKeyByPrefix(apiKey.prefix);
      expect(after!.active).toBe(false);
    });

    it('updates lastUsedAt on an API key', async () => {
      const tenant = makeTenant();
      await createTenant(tenant);

      const apiKey = makeStoredApiKey(tenant.tenantId);
      await storeApiKey(apiKey);

      // Initially no lastUsedAt
      const before = await lookupApiKeyByPrefix(apiKey.prefix);
      expect(before!.lastUsedAt).toBeUndefined();

      await updateApiKeyLastUsed(tenant.tenantId, apiKey.keyId);

      const after = await lookupApiKeyByPrefix(apiKey.prefix);
      expect(after!.lastUsedAt).toBeDefined();
    });
  });
});
