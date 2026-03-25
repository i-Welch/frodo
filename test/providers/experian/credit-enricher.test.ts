import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { ExperianCreditEnricher } from '../../../src/providers/experian/credit-enricher.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/experian/credit-report.json');

describe('ExperianCreditEnricher', () => {
  beforeEach(() => {
    process.env.PROVIDER_EXPERIAN_CLIENT_ID = 'test-exp-client';
    process.env.PROVIDER_EXPERIAN_CLIENT_SECRET = 'test-exp-secret';
    process.env.PROVIDER_EXPERIAN_SUBSCRIBER_CODE = 'test-sub-code';
  });

  afterEach(() => {
    delete process.env.PROVIDER_EXPERIAN_CLIENT_ID;
    delete process.env.PROVIDER_EXPERIAN_CLIENT_SECRET;
    delete process.env.PROVIDER_EXPERIAN_SUBSCRIBER_CODE;
  });

  it('enriches credit data from fixture', async () => {
    const enricher = createFixtureEnricher(ExperianCreditEnricher, FIXTURE);
    const result = await enricher.enrich('user-001', {});

    // Scores
    expect(result.data.scores).toHaveLength(1);
    expect(result.data.scores![0].bureau).toBe('experian');
    expect(result.data.scores![0].score).toBe(742);

    // Open accounts (3 tradelines)
    expect(result.data.openAccounts).toHaveLength(3);
    expect(result.data.openAccounts![0].creditor).toBe('CHASE CARD SERVICES');
    expect(result.data.openAccounts![0].balance).toBe(2340);
    expect(result.data.openAccounts![0].limit).toBe(15000);

    // Payment history
    expect(result.data.paymentHistory).toHaveLength(3);
    expect(result.data.paymentHistory![0].status).toBe('current');

    // Inquiries
    expect(result.data.inquiries).toHaveLength(1);
    expect(result.data.inquiries![0].creditor).toBe('CAPITAL ONE');

    // Utilization
    expect(result.data.utilization).toBeGreaterThan(0);

    expect(result.metadata?.requestId).toBe('exp-req-xyz789');
  });
});
