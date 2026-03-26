import { BaseEnricher } from '../base-enricher.js';
import { getProviderToken } from '../token-store.js';
import { getPlaidBaseUrl } from './config.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape — targets credit module
// ---------------------------------------------------------------------------

interface CreditData {
  openAccounts: { creditor: string; accountType?: string; balance?: number; limit?: number }[];
}

// ---------------------------------------------------------------------------
// Plaid Liabilities API response
// POST /liabilities/get
// ---------------------------------------------------------------------------

interface PlaidLiabilitiesResponse {
  accounts: {
    account_id: string;
    name: string;
    official_name: string | null;
    type: string;
    subtype: string | null;
    balances: {
      current: number | null;
      limit: number | null;
    };
  }[];
  liabilities: {
    credit: {
      account_id: string;
      aprs: { apr_percentage: number; apr_type: string }[];
      is_overdue: boolean;
      last_payment_amount: number;
      last_payment_date: string;
      last_statement_balance: number;
      last_statement_issue_date: string;
      minimum_payment_amount: number;
      next_payment_due_date: string;
    }[] | null;
    mortgage: {
      account_id: string;
      account_number: string;
      current_late_fee: number | null;
      escrow_balance: number | null;
      has_pmi: boolean;
      interest_rate: { percentage: number; type: string };
      last_payment_amount: number;
      last_payment_date: string;
      loan_type_description: string;
      maturity_date: string;
      next_monthly_payment: number;
      next_payment_due_date: string;
      origination_date: string;
      origination_principal_amount: number;
      past_due_amount: number | null;
      property_address: {
        street: string;
        city: string;
        region: string;
        postal_code: string;
        country: string;
      };
      ytd_interest_paid: number | null;
      ytd_principal_paid: number | null;
    }[] | null;
    student: {
      account_id: string;
      account_number: string | null;
      disbursement_dates: string[];
      expected_payoff_date: string | null;
      guarantor: string | null;
      interest_rate_percentage: number;
      is_overdue: boolean;
      last_payment_amount: number;
      last_payment_date: string;
      loan_name: string;
      loan_status: { type: string; end_date: string | null };
      minimum_payment_amount: number;
      next_payment_due_date: string;
      origination_date: string | null;
      origination_principal_amount: number | null;
      outstanding_interest_amount: number | null;
      payment_reference_number: string | null;
      repayment_plan: { type: string; description: string };
      servicer_address: { street: string; city: string; region: string; postal_code: string; country: string };
      ytd_interest_paid: number | null;
      ytd_principal_paid: number | null;
    }[] | null;
  };
  request_id: string;
}

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class PlaidLiabilitiesEnricher extends BaseEnricher<CreditData> {
  source = 'plaid';
  module = 'credit';
  timeoutMs = 20_000;

  protected getBaseUrl(): string {
    return getPlaidBaseUrl();
  }

  protected async fetchData(
    userId: string,
    _current: Partial<CreditData>,
  ): Promise<EnrichmentResult<CreditData>> {
    const token = await getProviderToken(userId, 'plaid', 'access_token');
    if (!token) {
      throw new Error('No Plaid access token — user must complete Plaid Link');
    }

    const res = await this.http.request<PlaidLiabilitiesResponse>(
      '/liabilities/get',
      {
        method: 'POST',
        body: {
          access_token: token.value,
          client_id: this.credentials.get('CLIENT_ID'),
          secret: this.credentials.get('SECRET'),
        },
      },
    );

    const { accounts, liabilities } = res.data;
    const accountMap = new Map(accounts.map((a) => [a.account_id, a]));

    const openAccounts: CreditData['openAccounts'] = [];

    // Credit cards
    if (liabilities.credit) {
      for (const cc of liabilities.credit) {
        const acct = accountMap.get(cc.account_id);
        openAccounts.push({
          creditor: acct?.official_name ?? acct?.name ?? 'Credit Card',
          accountType: 'credit_card',
          balance: acct?.balances.current ?? cc.last_statement_balance,
          limit: acct?.balances.limit ?? undefined,
        });
      }
    }

    // Mortgages
    if (liabilities.mortgage) {
      for (const mort of liabilities.mortgage) {
        const acct = accountMap.get(mort.account_id);
        openAccounts.push({
          creditor: acct?.official_name ?? acct?.name ?? 'Mortgage',
          accountType: 'mortgage',
          balance: acct?.balances.current ?? undefined,
          limit: mort.origination_principal_amount,
        });
      }
    }

    // Student loans
    if (liabilities.student) {
      for (const loan of liabilities.student) {
        const acct = accountMap.get(loan.account_id);
        openAccounts.push({
          creditor: acct?.official_name ?? acct?.name ?? loan.loan_name,
          accountType: 'student_loan',
          balance: acct?.balances.current ?? undefined,
          limit: loan.origination_principal_amount ?? undefined,
        });
      }
    }

    return {
      data: { openAccounts },
      metadata: {
        plaidRequestId: res.data.request_id,
        creditCards: liabilities.credit?.length ?? 0,
        mortgages: liabilities.mortgage?.length ?? 0,
        studentLoans: liabilities.student?.length ?? 0,
      },
    };
  }
}
