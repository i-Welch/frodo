import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'node:crypto';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import {
  storeProviderToken,
  getProviderToken,
  deleteProviderTokens,
  listProviderTokens,
} from '../../src/providers/token-store.js';

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

describe('ProviderTokenStore', () => {
  beforeAll(async () => {
    await ensureTable();
  });

  it('stores and retrieves a provider token', async () => {
    const userId = crypto.randomUUID();

    await storeProviderToken({
      userId,
      provider: 'plaid',
      tokenType: 'access_token',
      value: 'access-plaid-sandbox-abc123',
      expiresAt: '2027-01-01T00:00:00Z',
      metadata: { institutionId: 'ins_1' },
    });

    const token = await getProviderToken(userId, 'plaid', 'access_token');
    expect(token).not.toBeNull();
    expect(token!.userId).toBe(userId);
    expect(token!.provider).toBe('plaid');
    expect(token!.tokenType).toBe('access_token');
    expect(token!.value).toBe('access-plaid-sandbox-abc123');
    expect(token!.expiresAt).toBe('2027-01-01T00:00:00Z');
    expect(token!.metadata).toEqual({ institutionId: 'ins_1' });
    expect(token!.createdAt).toBeDefined();
    expect(token!.updatedAt).toBeDefined();
  });

  it('returns null for non-existent token', async () => {
    const userId = crypto.randomUUID();
    const token = await getProviderToken(userId, 'plaid', 'access_token');
    expect(token).toBeNull();
  });

  it('updates existing token and preserves createdAt', async () => {
    const userId = crypto.randomUUID();

    await storeProviderToken({
      userId,
      provider: 'plaid',
      tokenType: 'access_token',
      value: 'original-token',
    });

    const original = await getProviderToken(userId, 'plaid', 'access_token');
    expect(original!.value).toBe('original-token');

    // Small delay to ensure different updatedAt
    await new Promise((r) => setTimeout(r, 10));

    await storeProviderToken({
      userId,
      provider: 'plaid',
      tokenType: 'access_token',
      value: 'updated-token',
    });

    const updated = await getProviderToken(userId, 'plaid', 'access_token');
    expect(updated!.value).toBe('updated-token');
    expect(updated!.createdAt).toBe(original!.createdAt);
    expect(updated!.updatedAt).not.toBe(original!.updatedAt);
  });

  it('lists all tokens for a user', async () => {
    const userId = crypto.randomUUID();

    await storeProviderToken({
      userId,
      provider: 'plaid',
      tokenType: 'access_token',
      value: 'plaid-token',
    });

    await storeProviderToken({
      userId,
      provider: 'finicity',
      tokenType: 'customer_id',
      value: 'fin-customer-123',
    });

    const tokens = await listProviderTokens(userId);
    expect(tokens).toHaveLength(2);

    const providers = tokens.map((t) => t.provider).sort();
    expect(providers).toEqual(['finicity', 'plaid']);
  });

  it('deletes all tokens for a user', async () => {
    const userId = crypto.randomUUID();

    await storeProviderToken({
      userId,
      provider: 'plaid',
      tokenType: 'access_token',
      value: 'token-1',
    });

    await storeProviderToken({
      userId,
      provider: 'finicity',
      tokenType: 'customer_id',
      value: 'token-2',
    });

    await deleteProviderTokens(userId);

    const tokens = await listProviderTokens(userId);
    expect(tokens).toHaveLength(0);
  });

  it('deletes tokens for a specific provider only', async () => {
    const userId = crypto.randomUUID();

    await storeProviderToken({
      userId,
      provider: 'plaid',
      tokenType: 'access_token',
      value: 'plaid-token',
    });

    await storeProviderToken({
      userId,
      provider: 'finicity',
      tokenType: 'customer_id',
      value: 'fin-token',
    });

    await deleteProviderTokens(userId, 'plaid');

    const tokens = await listProviderTokens(userId);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].provider).toBe('finicity');
  });

  it('encrypts token value at rest', async () => {
    const userId = crypto.randomUUID();

    await storeProviderToken({
      userId,
      provider: 'plaid',
      tokenType: 'access_token',
      value: 'super-secret-token',
    });

    // Read the raw DynamoDB item — the value should be encrypted
    const { getItem } = await import('../../src/store/base-store.js');
    const rawItem = await getItem({
      PK: `USER#${userId}`,
      SK: 'PROVIDERTOKEN#plaid#access_token',
    });

    expect(rawItem).not.toBeNull();
    // encryptedValue should have ciphertext/iv/authTag structure
    const encrypted = rawItem!.encryptedValue as Record<string, string>;
    expect(encrypted).toHaveProperty('ciphertext');
    expect(encrypted).toHaveProperty('iv');
    expect(encrypted).toHaveProperty('authTag');
    // Should NOT contain the plaintext
    expect(encrypted.ciphertext).not.toContain('super-secret-token');
  });
});
