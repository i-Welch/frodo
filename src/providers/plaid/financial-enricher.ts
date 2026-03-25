import { BaseEnricher } from '../base-enricher.js';
import { getProviderToken } from '../token-store.js';
import { createMapper } from '../mapper.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape
// ---------------------------------------------------------------------------

interface FinancialData {
  bankAccounts: { institution: string; accountType?: string; last4?: string }[];
  balances: { checking?: number; savings?: number; investment?: number; total?: number };
  incomeStreams: { source: string; amount?: number; frequency?: string }[];
}

// ---------------------------------------------------------------------------
// Plaid API response types
// ---------------------------------------------------------------------------

interface PlaidAccount {
  account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
  balances: {
    current: number | null;
    available: number | null;
    limit: number | null;
    iso_currency_code: string | null;
  };
}

interface PlaidAccountsResponse {
  accounts: PlaidAccount[];
  item: { item_id: string; institution_id: string | null };
  request_id: string;
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

const plaidFinancialMapper = createMapper({
  provider: 'plaid',
  module: 'financial',
  mappings: [
    {
      from: 'accounts',
      to: 'bankAccounts',
      transform: (accounts) =>
        (accounts as PlaidAccount[]).map((a) => ({
          institution: a.official_name || a.name,
          accountType: a.subtype || a.type,
          last4: a.mask ?? undefined,
        })),
    },
    {
      from: 'accounts',
      to: 'balances',
      transform: (accounts) => {
        const accts = accounts as PlaidAccount[];
        let checking = 0;
        let savings = 0;
        let investment = 0;
        for (const a of accts) {
          const bal = a.balances.current ?? 0;
          if (a.type === 'depository' && (a.subtype === 'checking' || a.subtype === null)) {
            checking += bal;
          } else if (a.type === 'depository' && a.subtype === 'savings') {
            savings += bal;
          } else if (a.type === 'investment') {
            investment += bal;
          }
        }
        return { checking, savings, investment, total: checking + savings + investment };
      },
    },
  ],
});

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class PlaidFinancialEnricher extends BaseEnricher<FinancialData> {
  source = 'plaid';
  module = 'financial';
  timeoutMs = 15_000;

  protected getBaseUrl(): string {
    return 'https://sandbox.plaid.com';
  }

  protected async fetchData(
    userId: string,
    _current: Partial<FinancialData>,
  ): Promise<EnrichmentResult<FinancialData>> {
    const token = await getProviderToken(userId, 'plaid', 'access_token');
    if (!token) {
      throw new Error('No Plaid access token — user must complete Plaid Link');
    }

    const res = await this.http.request<PlaidAccountsResponse>('/accounts/get', {
      method: 'POST',
      body: {
        access_token: token.value,
        client_id: this.credentials.get('CLIENT_ID'),
        secret: this.credentials.get('SECRET'),
      },
    });

    const data = plaidFinancialMapper(res.data);

    return {
      data: data as Partial<FinancialData>,
      metadata: {
        plaidRequestId: res.data.request_id,
        institutionId: res.data.item.institution_id,
        accountCount: res.data.accounts.length,
      },
    };
  }
}
