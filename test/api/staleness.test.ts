import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { Elysia } from 'elysia';
import { ensureTables, TABLE_NAME } from '../../src/store/db.js';
import { appendEvent } from '../../src/store/event-store.js';
import { putItem } from '../../src/store/base-store.js';
import { adminRefreshRoute } from '../../src/api/routes/staleness.js';
import { registerEnricher, clearEnrichers } from '../../src/enrichment/registry.js';
import type { DataEvent } from '../../src/events/types.js';

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
