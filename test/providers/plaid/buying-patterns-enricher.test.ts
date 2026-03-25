import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { PlaidBuyingPatternsEnricher } from '../../../src/providers/plaid/buying-patterns-enricher.js';
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

const FIXTURE = join(import.meta.dirname, '../../fixtures/plaid/get-transactions.json');

describe('PlaidBuyingPatternsEnricher', () => {
  let userId: string;

  beforeEach(async () => {
    await ensureTable();
    userId = crypto.randomUUID();
    process.env.PROVIDER_PLAID_CLIENT_ID = 'test-client-id';
    process.env.PROVIDER_PLAID_SECRET = 'test-secret';
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

  it('analyzes transactions into spending patterns', async () => {
    const enricher = createFixtureEnricher(PlaidBuyingPatternsEnricher, FIXTURE);
    const result = await enricher.enrich(userId, {});

    // Fixture has 5 debit transactions (tx_004 is negative/income, excluded)
    expect(result.data.spendingCategories).toBeDefined();
    expect(result.data.spendingCategories!.length).toBeGreaterThan(0);

    // Should have FOOD_AND_DRINK as top category (45.50 + 125.00 = 170.50)
    const foodCategory = result.data.spendingCategories!.find(
      (c) => c.category === 'FOOD_AND_DRINK',
    );
    expect(foodCategory).toBeDefined();
    expect(foodCategory!.amount).toBe(170.5);

    expect(result.data.purchaseFrequency).toBeDefined();
    expect(result.data.averageTransactionSize).toBeGreaterThan(0);

    expect(result.metadata?.transactionCount).toBe(6);
  });
});
