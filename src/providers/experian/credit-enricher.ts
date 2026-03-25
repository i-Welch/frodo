import { BaseEnricher } from '../base-enricher.js';
import { createMapper } from '../mapper.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape
// ---------------------------------------------------------------------------

interface CreditData {
  scores: { bureau: string; score: number; date?: string }[];
  openAccounts: { creditor: string; accountType?: string; balance?: number; limit?: number }[];
  paymentHistory: { creditor: string; status: string; date?: string }[];
  inquiries: { creditor: string; date: string; type?: string }[];
  utilization: number;
}

// ---------------------------------------------------------------------------
// Experian Connect API response types
// ---------------------------------------------------------------------------

interface ExperianCreditResponse {
  consumerPii: {
    primaryAddress: { streetAddress: string; city: string; state: string; zip: string };
  };
  creditProfile: {
    riskModel: {
      modelIndicator: string;
      score: number;
      scoreFactors: { code: string; description: string }[];
    }[];
    tradeline: {
      creditorName: string;
      accountType: string;
      currentBalance: number;
      highCredit: number;
      paymentStatus: string;
      openDate: string;
      statusDate: string;
    }[];
    inquiry: {
      subscriberName: string;
      inquiryDate: string;
      inquiryType: string;
    }[];
  };
  request_id: string;
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

const experianCreditMapper = createMapper({
  provider: 'experian',
  module: 'credit',
  mappings: [
    {
      from: 'creditProfile.riskModel',
      to: 'scores',
      transform: (models) =>
        (models as ExperianCreditResponse['creditProfile']['riskModel']).map((m) => ({
          bureau: 'experian',
          score: m.score,
          date: new Date().toISOString().split('T')[0],
        })),
    },
    {
      from: 'creditProfile.tradeline',
      to: 'openAccounts',
      transform: (tradelines) =>
        (tradelines as ExperianCreditResponse['creditProfile']['tradeline']).map((t) => ({
          creditor: t.creditorName,
          accountType: t.accountType,
          balance: t.currentBalance,
          limit: t.highCredit,
        })),
    },
    {
      from: 'creditProfile.tradeline',
      to: 'paymentHistory',
      transform: (tradelines) =>
        (tradelines as ExperianCreditResponse['creditProfile']['tradeline']).map((t) => ({
          creditor: t.creditorName,
          status: t.paymentStatus,
          date: t.statusDate,
        })),
    },
    {
      from: 'creditProfile.inquiry',
      to: 'inquiries',
      transform: (inquiries) =>
        (inquiries as ExperianCreditResponse['creditProfile']['inquiry']).map((i) => ({
          creditor: i.subscriberName,
          date: i.inquiryDate,
          type: i.inquiryType,
        })),
    },
    {
      from: 'creditProfile.tradeline',
      to: 'utilization',
      transform: (tradelines) => {
        const trades = tradelines as ExperianCreditResponse['creditProfile']['tradeline'][];
        let totalBalance = 0;
        let totalLimit = 0;
        for (const t of trades) {
          if (t.highCredit > 0) {
            totalBalance += t.currentBalance;
            totalLimit += t.highCredit;
          }
        }
        return totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 1000) / 10 : 0;
      },
    },
  ],
});

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class ExperianCreditEnricher extends BaseEnricher<CreditData> {
  source = 'experian';
  module = 'credit';
  timeoutMs = 20_000;

  protected getBaseUrl(): string {
    return 'https://sandbox-us-api.experian.com';
  }

  protected getDefaultHeaders(): Record<string, string> {
    return {
      'Accept': 'application/json',
    };
  }

  protected async fetchData(
    userId: string,
    _current: Partial<CreditData>,
  ): Promise<EnrichmentResult<CreditData>> {
    // Experian uses an OAuth2 client credentials flow for the access token
    const accessToken = await this.getAccessToken();

    const res = await this.http.request<ExperianCreditResponse>('/consumerservices/credit-profile/v2/credit-report', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: {
        consumerPii: {
          // In production, these would come from the user's identity module
          primaryApplicant: { userId },
        },
        requestor: {
          subscriberCode: this.credentials.get('SUBSCRIBER_CODE'),
        },
        permissiblePurpose: { type: '08' },
        addOns: {
          riskModels: { modelIndicator: ['V4'] },
        },
      },
    });

    const data = experianCreditMapper(res.data);

    return {
      data: data as Partial<CreditData>,
      metadata: {
        requestId: res.data.request_id,
        responseTimeMs: res.durationMs,
      },
    };
  }

  /**
   * Exchange client credentials for an Experian access token.
   */
  private async getAccessToken(): Promise<string> {
    const res = await this.http.request<{ access_token: string }>('/oauth2/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        client_id: this.credentials.get('CLIENT_ID'),
        client_secret: this.credentials.get('CLIENT_SECRET'),
        grant_type: 'client_credentials',
      },
    });
    return res.data.access_token;
  }
}
