import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { Elysia } from 'elysia';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import { webhookRoutes } from '../../src/api/routes/webhooks.js';
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

describe('webhook API routes', () => {
  let app: Elysia;

  beforeAll(async () => {
    await ensureTable();
    app = new Elysia().use(webhookRoutes);
  });

  afterEach(() => {
    clearWebhookHandlers();
  });

  it('POST /webhooks/:provider returns 404 for unregistered provider', async () => {
    const res = await app.handle(
      new Request('http://localhost/webhooks/unknown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.code).toBe('NOT_FOUND');
  });

  it('POST /webhooks/:provider processes valid webhook', async () => {
    const userId = crypto.randomUUID();

    const handler: WebhookHandler = {
      provider: 'plaid',
      validate: () => true,
      parse: (body) => {
        const payload = body as { userId: string };
        return [
          {
            userId: payload.userId,
            module: 'financial',
            fields: { balances: { current: 9999 } },
          },
        ];
      },
    };
    registerWebhookHandler(handler);

    const res = await app.handle(
      new Request('http://localhost/webhooks/plaid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.processed).toBe(1);
    expect(body.errors).toHaveLength(0);
  });

  it('POST /webhooks/:provider returns 401 when validation fails', async () => {
    const handler: WebhookHandler = {
      provider: 'plaid',
      validate: () => false,
      parse: () => [],
    };
    registerWebhookHandler(handler);

    const res = await app.handle(
      new Request('http://localhost/webhooks/plaid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe('WEBHOOK_VALIDATION_FAILED');
  });
});
