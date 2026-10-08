import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import crypto from 'node:crypto';
import { ensureTables, TABLE_NAME } from '../../../src/store/db.js';
import { putModule } from '../../../src/store/user-store.js';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { TrueworkEmploymentEnricher } from '../../../src/providers/truework/employment-enricher.js';

import '../../../src/modules/index.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/truework/verification.json');

async function ensureTable(): Promise<void> {
  await ensureTables();
}

describe('TrueworkEmploymentEnricher', () => {
  let userId: string;

  beforeAll(async () => {
    await ensureTable();
  });

  beforeEach(async () => {
    userId = crypto.randomUUID();
    process.env.PROVIDER_TRUEWORK_API_KEY = 'test-truework-key';
    process.env.TRUEWORK_ENV = 'sandbox';

    // Seed identity data (Truework enricher reads this)
    await putModule(userId, 'identity', {
      firstName: 'Peregrin',
      lastName: 'Took',
      ssn: '123456789',
      dateOfBirth: '1990-01-01',
    });
  });

  afterEach(() => {
    delete process.env.PROVIDER_TRUEWORK_API_KEY;
    delete process.env.TRUEWORK_ENV;
  });

  it('enriches employment data from fixture', async () => {
    const enricher = createFixtureEnricher(TrueworkEmploymentEnricher, FIXTURE);
    const result = await enricher.enrich(userId, { employer: 'Tookland Farms' });

    expect(result.data.employer).toBe('Tookland Farms');
    expect(result.data.title).toBe('Thain');
    expect(result.data.startDate).toBe('2023-01-15');
    expect(result.data.salary).toBe(95000);

    // Employment history (2 reports)
    expect(result.data.history).toHaveLength(2);
    expect(result.data.history![0].employer).toBe('Tookland Farms');
    expect(result.data.history![1].employer).toBe('The Green Dragon');
    expect(result.data.history![1].endDate).toBe('2021-05-30');

    // Employee status and pay frequency (now in data)
    expect(result.data.employeeStatus).toBe('active');
    expect(result.data.payFrequency).toBe('annual');

    expect(result.metadata?.verificationId).toBe('tw-ver-001');
  });
});
