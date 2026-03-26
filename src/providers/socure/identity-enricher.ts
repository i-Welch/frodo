import crypto from 'node:crypto';
import { BaseEnricher } from '../base-enricher.js';
import { getSocureBaseUrl, getSocureWorkflowName } from './config.js';
import { getModule } from '../../store/user-store.js';
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
// Socure RiskOS Evaluation API response
// ---------------------------------------------------------------------------

interface SocureEvaluationResponse {
  eval_id: string;
  decision: 'ACCEPT' | 'REJECT' | 'REVIEW';
  status: 'CLOSED' | 'ON_HOLD';
  sub_status?: string;
  tags?: string[];
  data_enrichments?: {
    enrichment_name: string;
    enrichment_provider: string;
    status_code: number;
    response: Record<string, unknown>;
    is_source_cache: boolean;
  }[];
  eval_status?: string;
}

// ---------------------------------------------------------------------------
// Enricher
//
// Submits full PII to the RiskOS Evaluation API for KYC + Fraud + Watchlist
// screening. Pulls contact and residence data from the user's existing modules
// to improve match quality.
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

    // Pull contact and residence data for better Socure match quality
    const contact = await getModule(userId, 'contact');
    const residence = await getModule(userId, 'residence');
    const address = residence?.currentAddress as Record<string, string> | undefined;

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
              ...(contact?.email ? { email: contact.email as string } : {}),
              ...(contact?.phone ? { phone_number: contact.phone as string } : {}),
              address: {
                country: 'US',
                ...(address?.street ? { line_1: address.street } : {}),
                ...(address?.city ? { locality: address.city } : {}),
                ...(address?.state ? { major_admin_division: address.state } : {}),
                ...(address?.zip ? { postal_code: address.zip } : {}),
              },
            },
          },
        },
      },
    );

    const data: Partial<IdentityData> = {};

    // Extract prefilled data from enrichments if available
    for (const enrichment of res.data.data_enrichments ?? []) {
      const respData = enrichment.response as Record<string, unknown>;

      // Check for prefill/name data
      if (respData.nameAddressPhone) {
        const nap = respData.nameAddressPhone as Record<string, unknown>;
        const name = nap.name as Record<string, string> | undefined;
        if (name?.first) data.firstName = name.first;
        if (name?.last) data.lastName = name.last;
        if (nap.dob) data.dateOfBirth = nap.dob as string;
      }

      // Check for individual-level prefill
      if (respData.individual) {
        const ind = respData.individual as Record<string, unknown>;
        if (ind.given_name) data.firstName = ind.given_name as string;
        if (ind.family_name) data.lastName = ind.family_name as string;
        if (ind.date_of_birth) data.dateOfBirth = ind.date_of_birth as string;
      }
    }

    // Extract all risk scores and signals from every enrichment
    const riskScores: Record<string, unknown> = {};

    for (const enrichment of res.data.data_enrichments ?? []) {
      if (enrichment.status_code !== 200) continue;
      const resp = enrichment.response as Record<string, unknown>;

      // Phone Risk module
      if (resp.phoneRisk) {
        const pr = resp.phoneRisk as Record<string, unknown>;
        riskScores.phoneRiskScore = pr.score;
        riskScores.phoneRiskReasonCodes = pr.reasonCodes;
      }
      if (resp.namePhoneCorrelation) {
        const npc = resp.namePhoneCorrelation as Record<string, unknown>;
        riskScores.namePhoneCorrelationScore = npc.score;
        riskScores.namePhoneCorrelationReasonCodes = npc.reasonCodes;
      }

      // Email Risk module
      if (resp.emailRisk) {
        const er = resp.emailRisk as Record<string, unknown>;
        riskScores.emailRiskScore = er.score;
        riskScores.emailRiskReasonCodes = er.reasonCodes;
      }

      // Address Risk module
      if (resp.addressRisk) {
        const ar = resp.addressRisk as Record<string, unknown>;
        riskScores.addressRiskScore = ar.score;
        riskScores.addressRiskReasonCodes = ar.reasonCodes;
      }

      // Fraud module (Sigma / synthetic identity)
      if (resp.fraud) {
        const fr = resp.fraud as Record<string, unknown>;
        riskScores.fraudScore = fr.score;
        riskScores.fraudReasonCodes = fr.reasonCodes;
      }
      if (resp.synthetic) {
        const syn = resp.synthetic as Record<string, unknown>;
        riskScores.syntheticIdentityScore = syn.score;
        riskScores.syntheticReasonCodes = syn.reasonCodes;
      }
      if (resp.sigma) {
        const sig = resp.sigma as Record<string, unknown>;
        riskScores.sigmaScore = sig.score;
        riskScores.sigmaReasonCodes = sig.reasonCodes;
      }

      // KYC module
      if (resp.kyc) {
        const kyc = resp.kyc as Record<string, unknown>;
        riskScores.kycScore = kyc.score;
        riskScores.kycReasonCodes = kyc.reasonCodes;
        if (kyc.fieldValidations) {
          riskScores.kycFieldValidations = kyc.fieldValidations;
        }
      }

      // Watchlist / Global Watchlist module
      if (resp.watchlist) {
        const wl = resp.watchlist as Record<string, unknown>;
        riskScores.watchlistScore = wl.score;
        riskScores.watchlistReasonCodes = wl.reasonCodes;
        if (wl.hits) riskScores.watchlistHits = wl.hits;
      }
      if (resp.globalWatchlist) {
        const gw = resp.globalWatchlist as Record<string, unknown>;
        riskScores.globalWatchlistScore = gw.score;
        riskScores.globalWatchlistReasonCodes = gw.reasonCodes;
        if (gw.hits) riskScores.globalWatchlistHits = gw.hits;
      }

      // Name-Address correlation
      if (resp.nameAddressCorrelation) {
        const nac = resp.nameAddressCorrelation as Record<string, unknown>;
        riskScores.nameAddressCorrelationScore = nac.score;
        riskScores.nameAddressCorrelationReasonCodes = nac.reasonCodes;
      }

      // Digital Intelligence (device/network risk)
      if (resp.digitalIntelligence) {
        const di = resp.digitalIntelligence as Record<string, unknown>;
        riskScores.digitalIntelligenceScore = di.score;
        riskScores.digitalIntelligenceReasonCodes = di.reasonCodes;
      }
    }

    return {
      data,
      metadata: {
        // Socure evaluation
        evalId: res.data.eval_id,
        decision: res.data.decision,
        status: res.data.status,
        subStatus: res.data.sub_status,
        tags: res.data.tags,

        // All risk scores from every module
        ...riskScores,

        // Enrichment details
        enrichmentsRun: res.data.data_enrichments?.map((e) => ({
          name: e.enrichment_name,
          provider: e.enrichment_provider,
          statusCode: e.status_code,
          cached: e.is_source_cache,
        })),
      },
    };
  }
}
