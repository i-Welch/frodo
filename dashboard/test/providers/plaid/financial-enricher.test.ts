import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/server/providers/test-utils';
import { PlaidFinancialEnricher } from '../../../src/server/providers/plaid/financial-enricher';
import { storeProviderToken, deleteProviderTokens } from '../../../src/server/providers/token-store';
import { ensureTables, TABLE_NAME } from '../../../src/server/store/db';
import crypto from 'node:crypto';

async function ensureTable(): Promise<void> {
  await ensureTables();
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
