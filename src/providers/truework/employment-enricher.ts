import { BaseEnricher } from '../base-enricher.js';
import { getTrueworkBaseUrl } from './config.js';
import { getModule } from '../../store/user-store.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape
// ---------------------------------------------------------------------------

interface EmploymentData {
  employer: string;
  title: string;
  startDate: string;
  salary: number;
  employeeStatus: string;
  payFrequency: string;
  history: { employer: string; title?: string; startDate?: string; endDate?: string }[];
}

// ---------------------------------------------------------------------------
// Truework API response types
// ---------------------------------------------------------------------------

interface TrueworkVerificationResponse {
  id: string;
  state: 'completed' | 'processing' | 'action_required' | 'invalid';
  target: {
    first_name: string;
    last_name: string;
    social_security_number: string;
  };
  employer: {
    name: string;
    address: { line_1: string; city: string; state: string; zip: string } | null;
  };
  reports: TrueworkReport[];
  created: string;
}

interface TrueworkReport {
  employer: { name: string };
  employee: {
    first_name: string;
    last_name: string;
    status: 'active' | 'inactive';
    hire_date: string | null;
    termination_date: string | null;
  };
  position: {
    title: string;
    start_date: string | null;
    end_date: string | null;
  };
  salary: {
    gross_pay: number | null;
    pay_frequency: string | null;  // "annual", "monthly", "bi-weekly", etc.
    hours_per_week: number | null;
  };
}

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class TrueworkEmploymentEnricher extends BaseEnricher<EmploymentData> {
  source = 'truework';
  module = 'employment';
  timeoutMs = 20_000;

  protected getBaseUrl(): string {
    return getTrueworkBaseUrl();
  }

  protected getDefaultHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.credentials.get('API_KEY')}`,
      'Accept': 'application/json',
    };
  }

  protected async fetchData(
    userId: string,
    current: Partial<EmploymentData>,
  ): Promise<EnrichmentResult<EmploymentData>> {
    // Pull identity data to populate the verification request
    const identity = await getModule(userId, 'identity');
    const firstName = (identity?.firstName as string) ?? '';
    const lastName = (identity?.lastName as string) ?? '';
    const ssn = (identity?.ssn as string) ?? '';
    const dob = (identity?.dateOfBirth as string) ?? '';

    if (!firstName || !lastName) {
      throw new Error('Truework requires first name and last name (from identity module)');
    }

    // Employer is optional — if not provided, Truework searches across all employers
    const companyName = current.employer ?? '';
    const companyPayload = companyName ? { company: { name: companyName } } : {};

    // Create a verification request
    const createRes = await this.http.request<TrueworkVerificationResponse>(
      '/verification-requests/',
      {
        method: 'POST',
        body: {
          type: 'employment-income',
          permissible_purpose: 'credit-application',
          use_case: 'lending',
          target: {
            first_name: firstName,
            last_name: lastName,
            ...(ssn ? { social_security_number: ssn } : {}),
            ...(dob ? { date_of_birth: dob } : {}),
            ...companyPayload,
          },
          metadata: { ravenUserId: userId },
        },
      },
    );

    // If the verification is still processing, we can't get data yet
    if (createRes.data.state !== 'completed') {
      return {
        data: {},
        metadata: {
          verificationId: createRes.data.id,
          state: createRes.data.state,
          message: 'Verification is still processing',
        },
      };
    }

    const reports = createRes.data.reports;
    if (reports.length === 0) {
      return { data: {} };
    }

    // Use the most recent report
    const primary = reports[0];
    const data: Partial<EmploymentData> = {};

    data.employer = primary.employer.name;
    if (primary.position.title) data.title = primary.position.title;
    if (primary.position.start_date) data.startDate = primary.position.start_date;

    // Normalize salary to annual
    if (primary.salary.gross_pay !== null) {
      data.salary = normalizeToAnnual(
        primary.salary.gross_pay,
        primary.salary.pay_frequency,
      );
    }

    // Build employment history from all reports
    if (reports.length > 1) {
      data.history = reports.map((r) => ({
        employer: r.employer.name,
        title: r.position.title || undefined,
        startDate: r.position.start_date || undefined,
        endDate: r.position.end_date || undefined,
      }));
    }

    data.employeeStatus = primary.employee.status;
    if (primary.salary.pay_frequency) {
      data.payFrequency = primary.salary.pay_frequency;
    }

    return {
      data,
      metadata: {
        verificationId: createRes.data.id,
        reportCount: reports.length,
      },
    };
  }
}

function normalizeToAnnual(
  grossPay: number,
  frequency: string | null,
): number {
  switch (frequency) {
    case 'annual':
      return grossPay;
    case 'monthly':
      return grossPay * 12;
    case 'bi-weekly':
      return grossPay * 26;
    case 'weekly':
      return grossPay * 52;
    case 'semi-monthly':
      return grossPay * 24;
    default:
      // Assume annual if unknown
      return grossPay;
  }
}
