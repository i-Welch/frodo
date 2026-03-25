import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { MelissaResidenceEnricher } from '../../../src/providers/melissa/residence-enricher.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/melissa/personator.json');

describe('MelissaResidenceEnricher', () => {
  beforeEach(() => {
    process.env.PROVIDER_MELISSA_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.PROVIDER_MELISSA_API_KEY;
  });

  it('enriches residence data from fixture', async () => {
    const enricher = createFixtureEnricher(MelissaResidenceEnricher, FIXTURE);
    const result = await enricher.enrich('user-001', {
      currentAddress: {
        street: '1 Bag End',
        city: 'Hobbiton',
        state: 'SH',
        zip: '00001',
        country: 'US',
      },
    });

    expect(result.data.currentAddress).toEqual({
      street: '1 Bag End',
      city: 'Hobbiton',
      state: 'SH',
      zip: '00001',
      country: 'US',
    });

    expect(result.data.ownershipStatus).toBe('own');
    expect(result.data.propertyType).toBe('single-family');
    expect(result.data.moveInDate).toBe('2001-12-19');

    expect(result.metadata?.addressKey).toBe('addr-key-001');
  });
});
