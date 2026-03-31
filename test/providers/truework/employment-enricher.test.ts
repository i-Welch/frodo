import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import crypto from 'node:crypto';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../../src/store/dynamo-client.js';
import { putModule } from '../../../src/store/user-store.js';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { TrueworkEmploymentEnricher } from '../../../src/providers/truework/employment-enricher.js';

import '../../../src/modules/index.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/truework/verification.json');

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
