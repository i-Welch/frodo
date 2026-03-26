import crypto from 'node:crypto';
import { BaseEnricher } from '../base-enricher.js';
import { getSocureBaseUrl, getSocureWorkflowName } from './config.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape
// ---------------------------------------------------------------------------

interface IdentityData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
}

// ---------------------------------------------------------------------------
// Socure RiskOS Evaluation API response types
// POST /api/evaluation
// PATCH /api/evaluation/:eval_id
// ---------------------------------------------------------------------------

interface SocureEvaluationResponse {
  eval_id: string;
  decision: 'ACCEPT' | 'REJECT' | 'REVIEW';
  status: 'CLOSED' | 'ON_HOLD';
  tags?: string[];
  data_enrichments?: {
    name: string;
    response: {
      data: Record<string, unknown>;
    };
  }[];
}

// ---------------------------------------------------------------------------
// Enricher
//
// This enricher submits full PII to the RiskOS Evaluation API for KYC +
// Watchlist screening. It does NOT handle OTP or DocV — those are interactive
// flows handled by the Socure form component and API routes.
//
// For the full interactive flow (Prefill → OTP → KYC → DocV), use the
// Socure form component and /socure/* API routes.
//
// This enricher is for server-side KYC when you already have the user's PII
// (e.g., after form collection or from another source).
// ---------------------------------------------------------------------------

export class SocureIdentityEnricher extends BaseEnricher<IdentityData> {
  source = 'socure';
  module = 'identity';
  timeoutMs = 20_000;

  protected getBaseUrl(): string {
    return getSocureBaseUrl();
  }

  protected getDefaultHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.credentials.get('API_KEY')}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  protected async fetchData(
    userId: string,
    current: Partial<IdentityData>,
  ): Promise<EnrichmentResult<IdentityData>> {
    if (!current.firstName || !current.lastName) {
      throw new Error('Socure KYC requires at least first name and last name');
    }

    // Submit full PII for KYC evaluation (skipping OTP/Prefill — direct KYC)
    const res = await this.http.request<SocureEvaluationResponse>(
      '/api/evaluation',
      {
        method: 'POST',
        body: {
          id: `raven-kyc-${crypto.randomUUID()}`,
          timestamp: new Date().toISOString(),
          workflow: getSocureWorkflowName(),
          data: {
            individual: {
              given_name: current.firstName,
              family_name: current.lastName,
              ...(current.dateOfBirth ? { date_of_birth: current.dateOfBirth } : {}),
              ...(current.ssn ? { national_id: current.ssn } : {}),
              address: { country: 'US' },
            },
          },
        },
      },
    );

    const data: Partial<IdentityData> = {};

    // Extract prefilled data from enrichments if available
    const prefillEnrichment = res.data.data_enrichments?.find(
      (e) => e.name === 'prefill' || e.name === 'Prefill',
    );
    if (prefillEnrichment?.response?.data) {
      const prefill = prefillEnrichment.response.data as Record<string, unknown>;
      const individual = prefill.individual as Record<string, unknown> | undefined;
      if (individual) {
        if (individual.given_name) data.firstName = individual.given_name as string;
        if (individual.family_name) data.lastName = individual.family_name as string;
        if (individual.date_of_birth) data.dateOfBirth = individual.date_of_birth as string;
      }
    }

    return {
      data,
      metadata: {
        evalId: res.data.eval_id,
        decision: res.data.decision,
        status: res.data.status,
        tags: res.data.tags,
        kycDecision: res.data.decision,
      },
    };
  }
}
