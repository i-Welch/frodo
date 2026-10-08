import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { ensureTables, TABLE_NAME } from '../../src/server/store/db';
import { appendEvent } from '../../src/server/store/event-store';
import { registerEnricher, clearEnrichers } from '../../src/server/enrichment/registry';
import { checkStaleness, getStaleFields } from '../../src/server/enrichment/staleness';
import type { DataEvent } from '../../src/server/events/types';

// Side-effect import — registers module schemas
import '../../src/server/modules/index';

// ---------------------------------------------------------------------------
// Table setup
// ---------------------------------------------------------------------------

async function ensureTable(): Promise<void> {
  await ensureTables();
}

function makeEvent(
  userId: string,
  module: string,
  field: string,
  value: unknown,
  goodBy: string,
  source = 'plaid',
): DataEvent {
  return {
    eventId: crypto.randomUUID(),
    userId,
    module,
    source: { source, actor: 'test' },
    changes: [
      {
        field,
        previousValue: null,
        newValue: value,
        confidence: 0.9,
        goodBy,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('staleness detection', () => {
  beforeAll(async () => {
    await ensureTable();
  });

  afterEach(() => {
    clearEnrichers();
  });

  it('detects stale fields (expired goodBy)', async () => {
    const userId = crypto.randomUUID();

    // Register enricher so getEnrichedModuleNames returns 'financial'
    registerEnricher({
      source: 'plaid',
      module: 'financial',
      async enrich() {
        return { data: {} };
      },
    });

    // Write an event with an expired goodBy
    const pastDate = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
    await appendEvent(makeEvent(userId, 'financial', 'balances', 5000, pastDate));

    // Write a fresh event
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString(); // 30 days from now
    await appendEvent(makeEvent(userId, 'financial', 'incomeStreams', [], futureDate));

    const report = await checkStaleness(userId, ['financial']);
    expect(report.userId).toBe(userId);
    expect(report.staleModules).toHaveLength(1);

    const financialMod = report.staleModules[0];
    expect(financialMod.module).toBe('financial');
    expect(financialMod.staleFields).toHaveLength(1);
    expect(financialMod.staleFields[0].field).toBe('balances');
    expect(financialMod.freshFields).toBe(1);
    expect(financialMod.totalFields).toBe(2);
  });

  it('getStaleFields returns only stale fields for a module', async () => {
    const userId = crypto.randomUUID();

    const pastDate = new Date(Date.now() - 86400000).toISOString();
    await appendEvent(makeEvent(userId, 'financial', 'balances', 5000, pastDate, 'plaid'));

    const stale = await getStaleFields(userId, 'financial');
    expect(stale).toHaveLength(1);
    expect(stale[0].field).toBe('balances');
    expect(stale[0].source).toBe('plaid');
  });

  it('reports no staleness when all fields are fresh', async () => {
    const userId = crypto.randomUUID();

    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
    await appendEvent(makeEvent(userId, 'financial', 'balances', 5000, futureDate));

    const report = await checkStaleness(userId, ['financial']);
    const financialMod = report.staleModules.find((m) => m.module === 'financial');
    expect(financialMod?.staleFields ?? []).toHaveLength(0);
    expect(financialMod?.freshFields).toBe(1);
  });

  it('reports empty for user with no events', async () => {
    const userId = crypto.randomUUID();
    const report = await checkStaleness(userId, ['financial']);
    expect(report.staleModules).toHaveLength(0);
  });
});
