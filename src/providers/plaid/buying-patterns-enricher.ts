import { BaseEnricher } from '../base-enricher.js';
import { getProviderToken } from '../token-store.js';
import { getPlaidBaseUrl } from './config.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape
// ---------------------------------------------------------------------------

interface BuyingPatternsData {
  spendingCategories: { category: string; amount?: number; percentage?: number }[];
  purchaseFrequency: { daily?: number; weekly?: number; monthly?: number };
  averageTransactionSize: number;
}

// ---------------------------------------------------------------------------
// Plaid API response types
// ---------------------------------------------------------------------------

interface PlaidTransaction {
  transaction_id: string;
  amount: number;
  date: string;
  category: string[] | null;
  merchant_name: string | null;
  personal_finance_category: {
    primary: string;
    detailed: string;
  } | null;
}

interface PlaidTransactionsResponse {
  accounts: unknown[];
  transactions: PlaidTransaction[];
  total_transactions: number;
  request_id: string;
}

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class PlaidBuyingPatternsEnricher extends BaseEnricher<BuyingPatternsData> {
  source = 'plaid';
  module = 'buying-patterns';
  timeoutMs = 20_000;

  protected getBaseUrl(): string {
    return getPlaidBaseUrl();
  }

  protected async fetchData(
    userId: string,
    _current: Partial<BuyingPatternsData>,
  ): Promise<EnrichmentResult<BuyingPatternsData>> {
    const token = await getProviderToken(userId, 'plaid', 'access_token');
    if (!token) {
      throw new Error('No Plaid access token — user must complete Plaid Link');
    }

    // Fetch last 30 days of transactions
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0];

    const res = await this.http.request<PlaidTransactionsResponse>('/transactions/get', {
      method: 'POST',
      body: {
        access_token: token.value,
        client_id: this.credentials.get('CLIENT_ID'),
        secret: this.credentials.get('SECRET'),
        start_date: startDate,
        end_date: endDate,
        options: { count: 500 },
      },
    });

    const transactions = res.data.transactions;
    const data = analyzeTransactions(transactions);

    return {
      data,
      metadata: {
        plaidRequestId: res.data.request_id,
        transactionCount: transactions.length,
        dateRange: { start: startDate, end: endDate },
      },
    };
  }
}

/**
 * Analyze raw transactions into spending patterns.
 */
function analyzeTransactions(
  transactions: PlaidTransaction[],
): Partial<BuyingPatternsData> {
  if (transactions.length === 0) return {};

  // Aggregate by category
  const categoryTotals = new Map<string, number>();
  let totalSpend = 0;

  for (const tx of transactions) {
    // Plaid amounts are positive for debits
    if (tx.amount <= 0) continue;
    const category =
      tx.personal_finance_category?.primary ??
      tx.category?.[0] ??
      'uncategorized';
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + tx.amount);
    totalSpend += tx.amount;
  }

  const spendingCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalSpend > 0
        ? Math.round((amount / totalSpend) * 1000) / 10
        : 0,
    }));

  // Transaction frequency
  const debitTxns = transactions.filter((tx) => tx.amount > 0);
  const daySpan = Math.max(1, 30);
  const daily = Math.round((debitTxns.length / daySpan) * 10) / 10;
  const weekly = Math.round(daily * 7 * 10) / 10;
  const monthly = debitTxns.length;

  // Average transaction size
  const averageTransactionSize =
    debitTxns.length > 0
      ? Math.round((totalSpend / debitTxns.length) * 100) / 100
      : 0;

  return {
    spendingCategories,
    purchaseFrequency: { daily, weekly, monthly },
    averageTransactionSize,
  };
}
