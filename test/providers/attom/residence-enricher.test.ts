import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { AttomResidenceEnricher } from '../../../src/providers/attom/residence-enricher.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/attom/property-detail.json');

describe('AttomResidenceEnricher', () => {
  beforeEach(() => {
    process.env.PROVIDER_ATTOM_API_KEY = 'test-attom-key';
  });

  afterEach(() => {
    delete process.env.PROVIDER_ATTOM_API_KEY;
  });

  it('enriches residence data with property details and AVM from fixture', async () => {
    const enricher = createFixtureEnricher(AttomResidenceEnricher, FIXTURE);
    const result = await enricher.enrich('user-001', {
      currentAddress: {
        street: '3 Bagshot Row',
        city: 'Hobbiton',
        state: 'SH',
        zip: '00001',
      },
    });

    // Verified address from ATTOM
    expect(result.data.currentAddress).toEqual({
      street: '3 Bagshot Row',
      city: 'Hobbiton',
      state: 'SH',
      zip: '00001',
      country: 'US',
    });

    // Property type normalized from ATTOM's "SFR" classification
    expect(result.data.propertyType).toBe('single-family');

    // ATTOM ID in metadata
    expect(result.metadata?.attomId).toBe(55501234);

    // AVM valuation in metadata
    const valuation = result.metadata?.valuation as Record<string, number>;
    expect(valuation.estimatedValue).toBe(195000);
    expect(valuation.valueLow).toBe(175500);
    expect(valuation.valueHigh).toBe(214500);
    expect(valuation.confidenceScore).toBe(82);
    expect(valuation.valuePerSqFt).toBe(198.98);

    // Property details in metadata
    const details = result.metadata?.propertyDetails as Record<string, unknown>;
    expect(details.bedrooms).toBe(2);
    expect(details.bathrooms).toBe(1);
    expect(details.sqft).toBe(980);
    expect(details.yearBuilt).toBe(1320);
    expect(details.stories).toBe(1);
    expect(details.construction).toBe('Earth Sheltered');
  });
});
