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
  derogatoryMarks: { type: string; date?: string; amount?: number }[];
  utilization: number;
}

// ---------------------------------------------------------------------------
// TransUnion TrueVision API response types
//
// TransUnion's consumer credit API returns XML by default but supports JSON
// via the TrueVision / CreditVision product line. The response structure
// groups data under creditReport → tradelines, inquiries, publicRecords, and
// a top-level score array.
// ---------------------------------------------------------------------------

interface TUCreditResponse {
  creditReport: {
    borrower: {
      borrowerName: { firstName: string; lastName: string };
      borrowerAddress: {
        streetAddress: string;
        city: string;
        state: string;
        postalCode: string;
      };
    };
    scores: TUScore[];
    tradelines: TUTradeline[];
    inquiries: TUInquiry[];
    publicRecords: TUPublicRecord[];
  };
  transactionId: string;
}

interface TUScore {
  modelName: string;
  value: number;
  factors: { code: string; description: string }[];
  scoreDate: string;
}

interface TUTradeline {
  subscriberName: string;
  accountType: string;        // "Revolving", "Installment", "Mortgage", etc.
  currentBalance: number;
  creditLimit: number;
  highBalance: number;
  paymentStatus: string;      // "Current", "Late30", "Late60", etc.
  dateOpened: string;
  dateReported: string;
  accountCondition: string;   // "Open", "Closed", "Paid"
}

interface TUInquiry {
  subscriberName: string;
  inquiryDate: string;
  inquiryType: string;        // "Individual", "Joint"
}

interface TUPublicRecord {
  type: string;               // "Bankruptcy", "Judgment", "TaxLien"
  dateFiled: string;
  amount: number | null;
  status: string;
}

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

const tuCreditMapper = createMapper({
  provider: 'transunion',
  module: 'credit',
  mappings: [
    {
      from: 'creditReport.scores',
      to: 'scores',
      transform: (scores) =>
        (scores as TUScore[]).map((s) => ({
          bureau: 'transunion',
          score: s.value,
          date: s.scoreDate,
        })),
    },
    {
      from: 'creditReport.tradelines',
      to: 'openAccounts',
      transform: (tradelines) =>
        (tradelines as TUTradeline[])
          .filter((t) => t.accountCondition === 'Open')
          .map((t) => ({
            creditor: t.subscriberName,
            accountType: normalizeTUAccountType(t.accountType),
            balance: t.currentBalance,
            limit: t.creditLimit > 0 ? t.creditLimit : t.highBalance,
          })),
    },
    {
      from: 'creditReport.tradelines',
      to: 'paymentHistory',
      transform: (tradelines) =>
        (tradelines as TUTradeline[]).map((t) => ({
          creditor: t.subscriberName,
          status: normalizeTUPaymentStatus(t.paymentStatus),
          date: t.dateReported,
        })),
    },
    {
      from: 'creditReport.inquiries',
      to: 'inquiries',
      transform: (inquiries) =>
        (inquiries as TUInquiry[]).map((i) => ({
          creditor: i.subscriberName,
          date: i.inquiryDate,
          type: i.inquiryType.toLowerCase(),
        })),
    },
    {
      from: 'creditReport.publicRecords',
      to: 'derogatoryMarks',
      transform: (records) =>
        (records as TUPublicRecord[]).map((r) => ({
          type: r.type.toLowerCase(),
          date: r.dateFiled,
          amount: r.amount ?? undefined,
        })),
    },
    {
      from: 'creditReport.tradelines',
      to: 'utilization',
      transform: (tradelines) => {
        const revolving = (tradelines as TUTradeline[]).filter(
          (t) => t.accountType === 'Revolving' && t.accountCondition === 'Open',
        );
        let totalBalance = 0;
        let totalLimit = 0;
        for (const t of revolving) {
          totalBalance += t.currentBalance;
          const limit = t.creditLimit > 0 ? t.creditLimit : t.highBalance;
          totalLimit += limit;
        }
        return totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 1000) / 10 : 0;
      },
    },
  ],
});

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class TransUnionCreditEnricher extends BaseEnricher<CreditData> {
  source = 'transunion';
  module = 'credit';
  timeoutMs = 20_000;

  protected getBaseUrl(): string {
    return 'https://netaccess-test.transunion.com';
  }

  protected getDefaultHeaders(): Record<string, string> {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }

  protected async fetchData(
    userId: string,
    _current: Partial<CreditData>,
  ): Promise<EnrichmentResult<CreditData>> {
    // TransUnion uses certificate-based mutual TLS in production.
    // The sandbox accepts API key + subscriber credentials.
    const res = await this.http.request<TUCreditResponse>(
      '/creditreport/v2/report',
      {
        method: 'POST',
        headers: {
          'X-TransUnion-ApiKey': this.credentials.get('API_KEY'),
        },
        body: {
          subscriberInfo: {
            subscriberCode: this.credentials.get('SUBSCRIBER_CODE'),
            subscriberPrefix: this.credentials.get('SUBSCRIBER_PREFIX'),
          },
          requestor: {
            permissiblePurpose: '08',
          },
          consumer: {
            // In production, populated from the user's identity module
            userReference: userId,
          },
          addOns: {
            creditVisionScore: true,
          },
        },
      },
    );

    const data = tuCreditMapper(res.data);

    return {
      data: data as Partial<CreditData>,
      metadata: {
        transactionId: res.data.transactionId,
        responseTimeMs: res.durationMs,
        tradelineCount: res.data.creditReport.tradelines.length,
        publicRecordCount: res.data.creditReport.publicRecords.length,
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeTUAccountType(tuType: string): string {
  const map: Record<string, string> = {
    Revolving: 'revolving',
    Installment: 'installment',
    Mortgage: 'mortgage',
    Open: 'open',
    LineOfCredit: 'line_of_credit',
  };
  return map[tuType] ?? tuType.toLowerCase();
}

function normalizeTUPaymentStatus(tuStatus: string): string {
  const map: Record<string, string> = {
    Current: 'current',
    Late30: 'late_30',
    Late60: 'late_60',
    Late90: 'late_90',
    Late120: 'late_120',
    CollectionOrChargeOff: 'collections',
  };
  return map[tuStatus] ?? tuStatus.toLowerCase();
}
