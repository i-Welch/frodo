import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { TrueworkEmploymentEnricher } from '../../../src/providers/truework/employment-enricher.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/truework/verification.json');

describe('TrueworkEmploymentEnricher', () => {
  beforeEach(() => {
    process.env.PROVIDER_TRUEWORK_API_KEY = 'test-truework-key';
  });

  afterEach(() => {
    delete process.env.PROVIDER_TRUEWORK_API_KEY;
  });

  it('enriches employment data from fixture', async () => {
    const enricher = createFixtureEnricher(TrueworkEmploymentEnricher, FIXTURE);
    const result = await enricher.enrich('user-001', { employer: 'Tookland Farms' });

    expect(result.data.employer).toBe('Tookland Farms');
    expect(result.data.title).toBe('Thain');
    expect(result.data.startDate).toBe('2023-01-15');
    expect(result.data.salary).toBe(95000);

    // Employment history (2 reports)
    expect(result.data.history).toHaveLength(2);
    expect(result.data.history![0].employer).toBe('Tookland Farms');
    expect(result.data.history![1].employer).toBe('The Green Dragon');
    expect(result.data.history![1].endDate).toBe('2021-05-30');

    expect(result.metadata?.verificationId).toBe('tw-ver-001');
    expect(result.metadata?.employeeStatus).toBe('active');
  });
});
