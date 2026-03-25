import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { Elysia } from 'elysia';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import { appendEvent } from '../../src/store/event-store.js';
import { putItem } from '../../src/store/base-store.js';
import { adminRefreshRoute } from '../../src/api/routes/staleness.js';
import {
  registerEnricher,
  clearEnrichers,
} from '../../src/enrichment/registry.js';
import type { DataEvent } from '../../src/events/types.js';

// Side-effect import — registers module schemas
import '../../src/modules/index.js';

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

describe('admin refresh API', () => {
  let app: Elysia;

  beforeAll(async () => {
    await ensureTable();
    app = new Elysia().use(adminRefreshRoute);
  });

  afterEach(() => {
    clearEnrichers();
  });

  it('POST /api/v1/admin/refresh-stale returns a refresh job result', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/admin/refresh-stale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5 }),
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('scannedUsers');
    expect(body).toHaveProperty('usersWithStaleData');
    expect(body).toHaveProperty('staleFieldCount');
    expect(body).toHaveProperty('byModule');
    expect(body).toHaveProperty('bySource');
    expect(body).toHaveProperty('durationMs');
  });
});
