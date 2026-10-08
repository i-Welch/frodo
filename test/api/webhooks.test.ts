import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { Elysia } from 'elysia';
import { ensureTables, TABLE_NAME } from '../../src/store/db.js';
import { webhookRoutes } from '../../src/api/routes/webhooks.js';
import { registerWebhookHandler, clearWebhookHandlers } from '../../src/webhooks/registry.js';
import type { WebhookHandler } from '../../src/webhooks/types.js';

// Side-effect import — registers module schemas
import '../../src/modules/index.js';

// ---------------------------------------------------------------------------
// Table setup
// ---------------------------------------------------------------------------

async function ensureTable(): Promise<void> {
  await ensureTables();
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
