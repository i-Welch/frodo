import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { HouseCanaryResidenceEnricher } from '../../../src/providers/housecanary/residence-enricher.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/housecanary/property-lookup.json');

describe('HouseCanaryResidenceEnricher', () => {
  beforeEach(() => {
    process.env.PROVIDER_HOUSECANARY_API_KEY = 'test-hc-key';
    process.env.PROVIDER_HOUSECANARY_API_SECRET = 'test-hc-secret';
  });

  afterEach(() => {
    delete process.env.PROVIDER_HOUSECANARY_API_KEY;
    delete process.env.PROVIDER_HOUSECANARY_API_SECRET;
  });

  it('enriches residence data with property details, valuation, and ownership', async () => {
    const enricher = createFixtureEnricher(HouseCanaryResidenceEnricher, FIXTURE);
    const result = await enricher.enrich('user-001', {
      currentAddress: { street: '1 Bag End', zip: '00001' },
    });

    // Address verified via HouseCanary geocode
    expect(result.data.currentAddress).toEqual({
      street: '1 Bag End',
      city: 'Hobbiton',
      state: 'SH',
      zip: '00001',
      country: 'US',
    });

    // Owner-occupied → "own"
    expect(result.data.ownershipStatus).toBe('own');

    // Property type normalized
    expect(result.data.propertyType).toBe('single-family');

    // Valuation in metadata
    const valuation = result.metadata?.valuation as Record<string, number>;
    expect(valuation.estimatedValue).toBe(425000);
    expect(valuation.valueLow).toBe(391000);
    expect(valuation.valueHigh).toBe(459000);
    expect(valuation.forecastStdDev).toBe(0.08);

    // Property details in metadata
    const details = result.metadata?.propertyDetails as Record<string, number>;
    expect(details.bedrooms).toBe(3);
    expect(details.bathrooms).toBe(2.5);
    expect(details.sqft).toBe(1850);
    expect(details.yearBuilt).toBe(1290);

    // Assessment in metadata
    const assessment = result.metadata?.assessment as Record<string, number>;
    expect(assessment.totalAssessedValue).toBe(285000);
    expect(assessment.taxAmount).toBe(3200);
  });
});
