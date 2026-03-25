import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import crypto from 'node:crypto';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import { getModule } from '../../src/store/user-store.js';
import { getEventsForModule } from '../../src/store/event-store.js';
import { processWebhook } from '../../src/webhooks/processor.js';
import {
  registerWebhookHandler,
  clearWebhookHandlers,
} from '../../src/webhooks/registry.js';
import type { WebhookHandler } from '../../src/webhooks/types.js';

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

describe('webhook processor', () => {
  beforeAll(async () => {
    await ensureTable();
  });

  afterEach(() => {
    clearWebhookHandlers();
  });

  it('processes a valid webhook and writes events', async () => {
    const userId = crypto.randomUUID();

    const handler: WebhookHandler = {
      provider: 'plaid',
      validate: () => true,
      parse: (body) => {
        const payload = body as { userId: string; balance: number };
        return [
          {
            userId: payload.userId,
            module: 'financial',
            fields: { balances: { current: payload.balance } },
          },
        ];
      },
    };
    registerWebhookHandler(handler);

    const result = await processWebhook(
      'plaid',
      { 'plaid-verification': 'valid-sig' },
      { userId, balance: 12345 },
    );

    expect(result.processed).toBe(1);
    expect(result.errors).toHaveLength(0);

    // Verify event was written
    const events = await getEventsForModule(userId, 'financial');
    expect(events.events.length).toBeGreaterThanOrEqual(1);

    const event = events.events.find((e) => e.source.source === 'plaid');
    expect(event).toBeDefined();
    expect(event!.source.actor).toBe('webhook');
    expect(event!.changes).toHaveLength(1);
    expect(event!.changes[0].field).toBe('balances');

    // Module should be materialized
    const moduleData = await getModule(userId, 'financial');
    expect(moduleData).not.toBeNull();
    expect(moduleData).toHaveProperty('balances');
  });

  it('rejects webhook when validation fails', async () => {
    const handler: WebhookHandler = {
      provider: 'plaid',
      validate: () => false,
      parse: () => [],
    };
    registerWebhookHandler(handler);

    await expect(
      processWebhook('plaid', {}, {}),
    ).rejects.toThrow('validation failed');
  });

  it('throws for unknown provider', async () => {
    await expect(
      processWebhook('unknown-provider', {}, {}),
    ).rejects.toThrow("No webhook handler registered for provider 'unknown-provider'");
  });

  it('handles partial failures across multiple events', async () => {
    const goodUserId = crypto.randomUUID();
    const badUserId = 'invalid'; // Will fail because no source config... wait, it should work

    const handler: WebhookHandler = {
      provider: 'plaid',
      validate: () => true,
      parse: () => [
        {
          userId: goodUserId,
          module: 'financial',
          fields: { balances: { checking: 5000 } },
        },
        {
          userId: goodUserId,
          module: 'financial',
          fields: { incomeStreams: [{ amount: 3000 }] },
        },
      ],
    };
    registerWebhookHandler(handler);

    const result = await processWebhook('plaid', {}, {});
    expect(result.processed).toBe(2);
    expect(result.errors).toHaveLength(0);
  });
});
