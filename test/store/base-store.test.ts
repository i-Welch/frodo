import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  CreateTableCommand,
  DescribeTableCommand,
  UpdateTimeToLiveCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import {
  keys,
  gsiKeys,
  putItem,
  getItem,
  queryItems,
  deleteItem,
  batchWriteItems,
} from '../../src/store/base-store.js';
import { createTestContext, type TestContext } from '../setup.js';

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

    // TTL — ignore errors on local (some DynamoDB Local versions don't support it)
    try {
      await dynamoClient.send(
        new UpdateTimeToLiveCommand({
          TableName: TABLE_NAME,
          TimeToLiveSpecification: {
            AttributeName: 'ttl',
            Enabled: true,
          },
        }),
      );
    } catch {
      // DynamoDB Local may not support TTL — safe to ignore in tests
    }
  }
}

// ---------------------------------------------------------------------------
// Key builder tests
// ---------------------------------------------------------------------------

describe('key builders', () => {
  describe('keys', () => {
    it('tenant', () => {
      const k = keys.tenant('t1');
      expect(k).toEqual({ PK: 'TENANT#t1', SK: 'METADATA' });
    });

    it('apiKey', () => {
      const k = keys.apiKey('t1', 'k1');
      expect(k).toEqual({ PK: 'TENANT#t1', SK: 'APIKEY#k1' });
    });

    it('userModule', () => {
      const k = keys.userModule('u1', 'steps');
      expect(k).toEqual({ PK: 'USER#u1', SK: 'MODULE#steps' });
    });

    it('dataEvent', () => {
      const k = keys.dataEvent('u1', 'steps', '2025-01-01T00:00:00Z', 'e1');
      expect(k).toEqual({
        PK: 'USER#u1',
        SK: 'EVENT#steps#2025-01-01T00:00:00Z#e1',
      });
    });

    it('tenantUserLink', () => {
      const k = keys.tenantUserLink('t1', 'u1');
      expect(k).toEqual({ PK: 'TENANT#t1', SK: 'USERLINK#u1' });
    });

    it('session', () => {
      const k = keys.session('sess1');
      expect(k).toEqual({ PK: 'SESSION#sess1', SK: 'METADATA' });
    });

    it('formToken', () => {
      const k = keys.formToken('tok1');
      expect(k).toEqual({ PK: 'FORM#tok1', SK: 'METADATA' });
    });

    it('accessLog', () => {
      const k = keys.accessLog('t1', '2025-01-01T00:00:00Z', 'u1');
      expect(k).toEqual({
        PK: 'ACCESSLOG#t1',
        SK: '2025-01-01T00:00:00Z#u1',
      });
    });

    it('consent', () => {
      const k = keys.consent('u1', 't1', '2025-01-01T00:00:00Z');
      expect(k).toEqual({
        PK: 'USER#u1',
        SK: 'CONSENT#t1#2025-01-01T00:00:00Z',
      });
    });
  });

  describe('gsiKeys', () => {
    it('apiKeyPrefix', () => {
      expect(gsiKeys.apiKeyPrefix('abc123')).toEqual({
        GSI1PK: 'APIKEY#abc123',
      });
    });

    it('eventsBySource', () => {
      expect(gsiKeys.eventsBySource('fitbit')).toEqual({
        GSI1PK: 'EVENT#fitbit',
      });
    });

    it('tenantsForUser', () => {
      expect(gsiKeys.tenantsForUser('u1')).toEqual({
        GSI1PK: 'USER#u1',
      });
    });

    it('sessionsForUser', () => {
      expect(gsiKeys.sessionsForUser('u1')).toEqual({
        GSI1PK: 'USER#u1',
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Data operation tests (require DynamoDB Local)
// ---------------------------------------------------------------------------

describe('data operations', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    await ensureTable();
    ctx = await createTestContext();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  it('putItem + getItem round-trip', async () => {
    const pk = ctx.pk('USER#roundtrip');
    const item = { PK: pk, SK: 'METADATA', name: 'Alice', age: 30 };

    await putItem(item);
    const retrieved = await getItem({ PK: pk, SK: 'METADATA' });

    expect(retrieved).not.toBeNull();
    expect(retrieved!.PK).toBe(pk);
    expect(retrieved!.name).toBe('Alice');
    expect(retrieved!.age).toBe(30);
  });

  it('getItem returns null for missing items', async () => {
    const pk = ctx.pk('USER#does-not-exist');
    const result = await getItem({ PK: pk, SK: 'METADATA' });
    expect(result).toBeNull();
  });

  it('deleteItem removes an item', async () => {
    const pk = ctx.pk('USER#todelete');
    await putItem({ PK: pk, SK: 'METADATA', value: 'temp' });

    // Verify it exists first
    const before = await getItem({ PK: pk, SK: 'METADATA' });
    expect(before).not.toBeNull();

    await deleteItem({ PK: pk, SK: 'METADATA' });

    const after = await getItem({ PK: pk, SK: 'METADATA' });
    expect(after).toBeNull();
  });

  it('queryItems with SK prefix', async () => {
    const pk = ctx.pk('USER#querySK');

    await putItem({ PK: pk, SK: 'EVENT#steps#2025-01-01#e1', data: 1 });
    await putItem({ PK: pk, SK: 'EVENT#steps#2025-01-02#e2', data: 2 });
    await putItem({ PK: pk, SK: 'EVENT#heart#2025-01-01#e3', data: 3 });
    await putItem({ PK: pk, SK: 'MODULE#steps', data: 4 });

    // Query only EVENT# items
    const result = await queryItems({ pk, skPrefix: 'EVENT#' });
    expect(result.items).toHaveLength(3);
    expect(result.items.every((i) => (i.SK as string).startsWith('EVENT#'))).toBe(true);

    // Query only EVENT#steps items
    const stepsOnly = await queryItems({ pk, skPrefix: 'EVENT#steps' });
    expect(stepsOnly.items).toHaveLength(2);
  });

  it('queryItems with pagination (cursor)', async () => {
    const pk = ctx.pk('USER#paginate');

    // Insert 5 items
    for (let i = 0; i < 5; i++) {
      await putItem({
        PK: pk,
        SK: `ITEM#${String(i).padStart(3, '0')}`,
        index: i,
      });
    }

    // Fetch first page (limit 2)
    const page1 = await queryItems({ pk, skPrefix: 'ITEM#', limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.cursor).toBeDefined();

    // Fetch second page
    const page2 = await queryItems({
      pk,
      skPrefix: 'ITEM#',
      limit: 2,
      cursor: page1.cursor,
    });
    expect(page2.items).toHaveLength(2);
    expect(page2.cursor).toBeDefined();

    // Fetch third page — should have 1 item and no cursor
    const page3 = await queryItems({
      pk,
      skPrefix: 'ITEM#',
      limit: 2,
      cursor: page2.cursor,
    });
    expect(page3.items).toHaveLength(1);
    expect(page3.cursor).toBeUndefined();

    // All items accounted for
    const allItems = [...page1.items, ...page2.items, ...page3.items];
    expect(allItems).toHaveLength(5);
  });

  it('queryItems scanForward false returns items in reverse', async () => {
    const pk = ctx.pk('USER#reverse');

    await putItem({ PK: pk, SK: 'A#001', v: 1 });
    await putItem({ PK: pk, SK: 'A#002', v: 2 });
    await putItem({ PK: pk, SK: 'A#003', v: 3 });

    const result = await queryItems({
      pk,
      skPrefix: 'A#',
      scanForward: false,
    });

    expect(result.items).toHaveLength(3);
    expect(result.items[0].SK).toBe('A#003');
    expect(result.items[2].SK).toBe('A#001');
  });

  it('batchWriteItems writes multiple items', async () => {
    const pk = ctx.pk('USER#batch');

    const items = Array.from({ length: 30 }, (_, i) => ({
      PK: pk,
      SK: `BATCH#${String(i).padStart(3, '0')}`,
      index: i,
    }));

    // This should chunk into two batches (25 + 5)
    await batchWriteItems(items);

    const result = await queryItems({ pk, skPrefix: 'BATCH#' });
    expect(result.items).toHaveLength(30);
  });
});
