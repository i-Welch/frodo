import { BaseEnricher } from '../base-enricher.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape
// ---------------------------------------------------------------------------

interface IdentityData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  aliases: string[];
  governmentIds: { type: string; value: string; country?: string }[];
}

// ---------------------------------------------------------------------------
// Socure ID+ API response types
// ---------------------------------------------------------------------------

interface SocureIdPlusResponse {
  referenceId: string;
  nameAddressCorrelation: {
    reasonCodes: string[];
    score: number;
  };
  kyc: {
    reasonCodes: string[];
    fieldValidations: {
      firstName: number;
      surName: number;
      streetAddress: number;
      city: number;
      state: number;
      zip: number;
      dob: number;
      ssn: number;
      mobileNumber: number;
    };
  };
  nameAddressPhone: {
    name: { first: string; middle: string; last: string };
    address: { street: string; city: string; state: string; zip: string };
    phone: string;
    dob: string;
  };
}

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class SocureIdentityEnricher extends BaseEnricher<IdentityData> {
  source = 'socure';
  module = 'identity';
  timeoutMs = 15_000;

  protected getBaseUrl(): string {
    return 'https://sandbox.socure.com/api/3.0';
  }

  protected getDefaultHeaders(): Record<string, string> {
    return {
      'Authorization': `SocureApiKey ${this.credentials.get('API_KEY')}`,
      'Content-Type': 'application/json',
    };
  }

  protected async fetchData(
    userId: string,
    current: Partial<IdentityData>,
  ): Promise<EnrichmentResult<IdentityData>> {
    // Socure's ID+ endpoint takes PII as input and validates/enriches it.
    // We send what we already have and get back verified data.
    const res = await this.http.request<SocureIdPlusResponse>('/EmailAuthScore', {
      method: 'POST',
      body: {
        modules: ['kyc', 'nameaddresscorrelation', 'nameaddressphone'],
        firstName: current.firstName,
        surName: current.lastName,
        dob: current.dateOfBirth,
        nationalId: current.ssn,
        userReference: userId,
      },
    });

    const nap = res.data.nameAddressPhone;
    const data: Partial<IdentityData> = {};

    // Only overwrite fields where Socure returned validated data
    if (nap.name.first) data.firstName = nap.name.first;
    if (nap.name.last) data.lastName = nap.name.last;
    if (nap.dob) data.dateOfBirth = nap.dob;

    return {
      data,
      metadata: {
        socureReferenceId: res.data.referenceId,
        kycScore: res.data.kyc?.fieldValidations,
        correlationScore: res.data.nameAddressCorrelation?.score,
      },
    };
  }
}
