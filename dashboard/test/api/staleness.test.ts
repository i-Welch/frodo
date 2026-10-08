import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { Elysia } from 'elysia';
import { ensureTables, TABLE_NAME } from '../../src/server/store/db';
import { appendEvent } from '../../src/server/store/event-store';
import { putItem } from '../../src/server/store/base-store';
import { adminRefreshRoute } from '../../src/server/api/routes/staleness';
import { registerEnricher, clearEnrichers } from '../../src/server/enrichment/registry';
import type { DataEvent } from '../../src/server/events/types';

// Side-effect import — registers module schemas
import '../../src/server/modules/index';

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
