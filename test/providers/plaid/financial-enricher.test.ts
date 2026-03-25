import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { PlaidFinancialEnricher } from '../../../src/providers/plaid/financial-enricher.js';
import { storeProviderToken, deleteProviderTokens } from '../../../src/providers/token-store.js';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../../src/store/dynamo-client.js';
import crypto from 'node:crypto';

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

const FIXTURE = join(import.meta.dirname, '../../fixtures/plaid/get-accounts.json');

describe('PlaidFinancialEnricher', () => {
  let userId: string;

  beforeEach(async () => {
    await ensureTable();
    userId = crypto.randomUUID();

    // Set up env vars for credential lookup
    process.env.PROVIDER_PLAID_CLIENT_ID = 'test-client-id';
    process.env.PROVIDER_PLAID_SECRET = 'test-secret';

    // Store a Plaid access token for the test user
    await storeProviderToken({
      userId,
      provider: 'plaid',
      tokenType: 'access_token',
      value: 'access-sandbox-test',
    });
  });

  afterEach(async () => {
    await deleteProviderTokens(userId);
    delete process.env.PROVIDER_PLAID_CLIENT_ID;
    delete process.env.PROVIDER_PLAID_SECRET;
  });

  it('enriches financial data from fixture', async () => {
    const enricher = createFixtureEnricher(PlaidFinancialEnricher, FIXTURE);
    const result = await enricher.enrich(userId, {});

    expect(result.data.bankAccounts).toHaveLength(2);
    expect(result.data.bankAccounts![0]).toEqual({
      institution: 'Chase Total Checking',
      accountType: 'checking',
      last4: '0000',
    });
    expect(result.data.bankAccounts![1]).toEqual({
      institution: 'Chase Savings',
      accountType: 'savings',
      last4: '1111',
    });

    expect(result.data.balances).toEqual({
      checking: 11050.25,
      savings: 25000,
      investment: 0,
      total: 36050.25,
    });

    expect(result.metadata?.plaidRequestId).toBe('plaid-req-abc123');
    expect(result.metadata?.accountCount).toBe(2);
  });
});
