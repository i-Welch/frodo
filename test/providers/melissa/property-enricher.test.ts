import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import crypto from 'node:crypto';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../../src/store/dynamo-client.js';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { MelissaPropertyEnricher } from '../../../src/providers/melissa/property-enricher.js';
import { putModule } from '../../../src/store/user-store.js';

import '../../../src/modules/index.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/melissa/property.json');

async function ensureTable(): Promise<void> {
  try {
    await dynamoClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
  } catch (err) {
    if (!(err instanceof ResourceNotFoundException)) throw err;
    await dynamoClient.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' },
          { AttributeName: 'GSI1PK', AttributeType: 'S' },
          { AttributeName: 'GSI1SK', AttributeType: 'S' },
          { AttributeName: 'GSI2PK', AttributeType: 'S' },
          { AttributeName: 'GSI2SK', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
          { IndexName: 'GSI1', KeySchema: [{ AttributeName: 'GSI1PK', KeyType: 'HASH' }, { AttributeName: 'GSI1SK', KeyType: 'RANGE' }], Projection: { ProjectionType: 'ALL' } },
          { IndexName: 'GSI2', KeySchema: [{ AttributeName: 'GSI2PK', KeyType: 'HASH' }, { AttributeName: 'GSI2SK', KeyType: 'RANGE' }], Projection: { ProjectionType: 'ALL' } },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
  }
}

describe('MelissaPropertyEnricher', () => {
  let userId: string;

  beforeAll(async () => {
    await ensureTable();
  });

  beforeEach(async () => {
    userId = crypto.randomUUID();
    process.env.PROVIDER_MELISSA_API_KEY = 'test-api-key';

    // Seed a residence module with a verified address (as Personator would)
    await putModule(userId, 'residence', {
      currentAddress: {
        street: '1 Bag End',
        city: 'Hobbiton',
        state: 'SH',
        zip: '00001',
      },
    });
  });

  afterEach(() => {
    delete process.env.PROVIDER_MELISSA_API_KEY;
  });

  it('enriches property data from fixture', async () => {
    const enricher = createFixtureEnricher(MelissaPropertyEnricher, FIXTURE);
    const result = await enricher.enrich(userId, {});

    // Property details
    expect(result.data.propertyDetails).toEqual({
      yearBuilt: '1840',
      stories: '2',
      bedrooms: '4',
      bathrooms: '2',
      buildingSqFt: '2400',
      lotSqFt: '10890.00',
      lotAcres: '0.2500',
      propertyUseGroup: 'Single Family Residential',
      zoning: 'R1',
      construction: 'Wood Frame',
    });

    // AVM / valuation
    expect(result.data.valuation).toEqual({
      estimatedValue: '510000',
      estimatedMinValue: '460000',
      estimatedMaxValue: '560000',
      confidenceScore: '85',
      valuationDate: '20260301',
      assessedValueTotal: '450000',
      assessedValueLand: '130000',
      assessedValueImprovements: '320000',
      marketValueTotal: '525000',
      taxYear: '2025',
      taxBilledAmount: '5625.00',
    });

    // Ownership
    expect(result.data.ownership).toEqual({
      ownerName: 'Baggins Bilbo',
      ownerType: 'Individual',
      ownerOccupied: 'Y',
    });

    // Sale history
    expect(result.data.saleHistory).toEqual({
      lastSaleDate: '20011219',
      lastSalePrice: '300000',
      priorSaleDate: '19680922',
      priorSalePrice: '25000',
    });

    // Legal / parcel
    expect(result.data.legalDescription).toBe('LOT:1 SUBD:BAG END CITY/MUNI/TWP:HOBBITON');
    expect(result.data.parcelNumber).toBe('00010001');
    expect(result.data.fipsCode).toBe('06001');

    // Metadata
    expect(result.metadata?.county).toBe('Shire County');
    expect(result.metadata?.latitude).toBe('37.8721');
    expect(result.metadata?.longitude).toBe('-122.2578');
    expect(result.metadata?.cbsaName).toBe('Shire Metro Area');
  });

  it('throws when no address is available', async () => {
    const noAddrUserId = crypto.randomUUID();
    const enricher = createFixtureEnricher(MelissaPropertyEnricher, FIXTURE);

    await expect(enricher.enrich(noAddrUserId, {})).rejects.toThrow(
      'requires a verified address',
    );
  });
});
