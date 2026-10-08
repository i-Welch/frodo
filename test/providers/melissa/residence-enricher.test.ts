import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import crypto from 'node:crypto';
import { ensureTables, TABLE_NAME } from '../../../src/store/db.js';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { MelissaResidenceEnricher } from '../../../src/providers/melissa/residence-enricher.js';

import '../../../src/modules/index.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/melissa/personator.json');

async function ensureTable(): Promise<void> {
  await ensureTables();
}

describe('MelissaResidenceEnricher', () => {
  let userId: string;

  beforeAll(async () => {
    await ensureTable();
  });

  beforeEach(() => {
    userId = crypto.randomUUID();
    process.env.PROVIDER_MELISSA_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.PROVIDER_MELISSA_API_KEY;
  });

  it('enriches residence data from fixture', async () => {
    const enricher = createFixtureEnricher(MelissaResidenceEnricher, FIXTURE);
    const result = await enricher.enrich(userId, {
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

    // Demographics (now in data)
    expect(result.data.demographics).toEqual({
      householdIncome: '75000-100000',
      medianHouseholdIncome: '85000',
      householdSize: '1',
      maritalStatus: 'S',
      presenceOfChildren: 'N',
      education: 'Bachelors',
      occupation: 'Gentleman of Leisure',
      companyName: 'Bag End Estate',
      lengthOfResidence: '60',
    });

    // Geo (now in data)
    expect(result.data.geo).toEqual({
      latitude: '37.8721',
      longitude: '-122.2578',
      countyName: 'Shire County',
      censusTract: '1234.56',
      countyFIPS: '06001',
    });

    // Metadata
    expect(result.metadata?.addressKey).toBe('addr-key-001');
  });
});
