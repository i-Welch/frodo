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

    // Property details in data
    expect(result.data.propertyDetails).toEqual({
      yearBuilt: '1320',
      stories: '1',
      bedrooms: '2',
      bathrooms: '1',
      buildingSqFt: '980',
      lotSqFt: '6000',
      construction: 'Earth Sheltered',
      propertyUseGroup: 'SFR',
    });

    // AVM valuation in data
    expect(result.data.valuation).toEqual({
      estimatedValue: '195000',
      estimatedMinValue: '175500',
      estimatedMaxValue: '214500',
      confidenceScore: '82',
      valuationDate: '2026-03-15',
    });

    // Geo in data
    expect(result.data.geo).toEqual({
      latitude: '37.8715',
      longitude: '-122.2580',
    });

    // ATTOM ID in metadata
    expect(result.metadata?.attomId).toBe(55501234);
  });
});
