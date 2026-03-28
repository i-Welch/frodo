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
import { MelissaResidenceEnricher } from '../../../src/providers/melissa/residence-enricher.js';

import '../../../src/modules/index.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/melissa/personator.json');

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

    // Metadata includes demographics and geo
    expect(result.metadata?.addressKey).toBe('addr-key-001');
    expect(result.metadata?.householdIncome).toBe('75000-100000');
    expect(result.metadata?.occupation).toBe('Gentleman of Leisure');
    expect(result.metadata?.lengthOfResidence).toBe('60');
  });
});
