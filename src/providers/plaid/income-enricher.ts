import { BaseEnricher } from '../base-enricher.js';
import { getProviderToken } from '../token-store.js';
import { getPlaidBaseUrl } from './config.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape — targets financial.incomeStreams
// ---------------------------------------------------------------------------

interface FinancialData {
  incomeStreams: {
    source: string;
    amount?: number;
    frequency?: string;
    incomeCategory?: string;
    startDate?: string;
    endDate?: string;
    transactionCount?: number;
  }[];
}

// ---------------------------------------------------------------------------
// Plaid Bank Income API response
// POST /credit/bank_income/get
// ---------------------------------------------------------------------------

interface PlaidBankIncomeResponse {
  bank_income: {
    bank_income_id: string;
    generated_time: string;
    days_requested: number;
    items: {
      bank_income_accounts: {
        account_id: string;
        name: string;
        mask: string;
        type: string;
      }[];
      bank_income_sources: {
        income_source_id: string;
        income_description: string;
        income_category: string;       // "SALARY", "GIG_ECONOMY", "RETIREMENT", etc.
        start_date: string;
        end_date: string | null;
        pay_frequency: string;          // "MONTHLY", "BI_WEEKLY", "WEEKLY", etc.
        total_amount: number;
        transaction_count: number;
        historical_average_monthly_gross_income: {
          amount: number;
          currency: string;
        };
        forecast_average_monthly_gross_income: {
          amount: number;
          currency: string;
        } | null;
        employer: { name: string } | null;
      }[];
      institution_id: string;
      institution_name: string;
    }[];
    bank_income_summary: {
      total_amount: number;
      total_transaction_count: number;
      start_date: string;
      end_date: string;
      income_sources_count: number;
      income_categories_count: number;
    };
  };
  request_id: string;
}

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class PlaidIncomeEnricher extends BaseEnricher<FinancialData> {
  source = 'plaid';
  module = 'financial';
  timeoutMs = 30_000;

  protected getBaseUrl(): string {
    return getPlaidBaseUrl();
  }

  protected async fetchData(
    userId: string,
    _current: Partial<FinancialData>,
  ): Promise<EnrichmentResult<FinancialData>> {
    const token = await getProviderToken(userId, 'plaid', 'access_token');
    if (!token) {
      throw new Error('No Plaid access token — user must complete Plaid Link');
    }

    const res = await this.http.request<PlaidBankIncomeResponse>(
      '/credit/bank_income/get',
      {
        method: 'POST',
        body: {
          user_token: null,
          options: {
            count: 1,
          },
          client_id: this.credentials.get('CLIENT_ID'),
          secret: this.credentials.get('SECRET'),
          access_tokens: [token.value],
        },
      },
    );

    const income = res.data.bank_income;
    const incomeStreams = income.items.flatMap((item) =>
      item.bank_income_sources.map((src) => ({
        source: src.employer?.name ?? src.income_description,
        amount: Math.round(src.historical_average_monthly_gross_income.amount * 12),
        frequency: normalizeFrequency(src.pay_frequency),
        incomeCategory: src.income_category,
        startDate: src.start_date,
        endDate: src.end_date ?? undefined,
        transactionCount: src.transaction_count,
      })),
    );

    return {
      data: { incomeStreams },
      metadata: {
        plaidRequestId: res.data.request_id,
        bankIncomeId: income.bank_income_id,
        totalAmount: income.bank_income_summary?.total_amount,
        daysRequested: income.days_requested,
        sourceCount: incomeStreams.length,
      },
    };
  }
}

function normalizeFrequency(plaidFreq: string): string {
  const map: Record<string, string> = {
    MONTHLY: 'monthly',
    BI_WEEKLY: 'biweekly',
    WEEKLY: 'weekly',
    SEMI_MONTHLY: 'semi-monthly',
    DAILY: 'daily',
    ANNUALLY: 'annual',
  };
  return map[plaidFreq] ?? plaidFreq.toLowerCase();
}
