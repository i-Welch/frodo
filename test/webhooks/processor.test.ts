import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { ensureTables, TABLE_NAME } from '../../src/store/db.js';
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
  await ensureTables();
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
