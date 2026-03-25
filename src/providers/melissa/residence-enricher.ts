import { BaseEnricher } from '../base-enricher.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape
// ---------------------------------------------------------------------------

interface ResidenceData {
  currentAddress: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  ownershipStatus: string;
  propertyType: string;
  moveInDate: string;
}

// ---------------------------------------------------------------------------
// Melissa Personator API response types
// ---------------------------------------------------------------------------

interface MelissaPersonatorResponse {
  Version: string;
  TransmissionReference: string;
  TransmissionResults: string;
  TotalRecords: string;
  Records: MelissaRecord[];
}

interface MelissaRecord {
  RecordID: string;
  Results: string;
  AddressLine1: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
  AddressDeliveryInstallation: string;
  AddressKey: string;
  // Property fields
  PropertyOwnerType: string;          // "O" = owner, "R" = renter
  PropertyUseType: string;            // "SFR", "Condo", "Apartment", etc.
  DateOfBirth: string;
  MoveDate: string;
  // Parsed name
  NameFirst: string;
  NameLast: string;
}

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class MelissaResidenceEnricher extends BaseEnricher<ResidenceData> {
  source = 'melissa';
  module = 'residence';
  timeoutMs = 10_000;

  protected getBaseUrl(): string {
    return 'https://personator.melissadata.net/v3';
  }

  protected async fetchData(
    userId: string,
    current: Partial<ResidenceData>,
  ): Promise<EnrichmentResult<ResidenceData>> {
    // Melissa's Personator API takes an address and returns verified/enriched data
    const addr = current.currentAddress;
    if (!addr?.street && !addr?.zip) {
      throw new Error('Melissa enrichment requires at least a street address or zip code');
    }

    const params = new URLSearchParams({
      id: this.credentials.get('API_KEY'),
      act: 'Check,Verify,Append',
      cols: 'GrpPropertyData,GrpAddressDetails,GrpNameDetails,GrpDemographicDetails',
      a1: addr.street ?? '',
      city: addr.city ?? '',
      state: addr.state ?? '',
      postal: addr.zip ?? '',
      ctry: addr.country ?? 'US',
      format: 'json',
    });

    const res = await this.http.request<MelissaPersonatorResponse>(
      `/WEB/ContactVerify/doContactVerify?${params.toString()}`,
    );

    const records = res.data.Records;
    if (!records || records.length === 0) {
      return { data: {} };
    }

    const record = records[0];
    const data: Partial<ResidenceData> = {};

    // Verified address
    if (record.AddressLine1) {
      data.currentAddress = {
        street: record.AddressLine1,
        city: record.City,
        state: record.State,
        zip: record.PostalCode,
        country: record.Country || 'US',
      };
    }

    // Ownership
    if (record.PropertyOwnerType) {
      data.ownershipStatus = record.PropertyOwnerType === 'O' ? 'own' : 'rent';
    }

    // Property type
    if (record.PropertyUseType) {
      data.propertyType = normalizePropertyType(record.PropertyUseType);
    }

    // Move date
    if (record.MoveDate) {
      data.moveInDate = record.MoveDate;
    }

    return {
      data,
      metadata: {
        melissaResults: record.Results,
        transmissionResults: res.data.TransmissionResults,
        addressKey: record.AddressKey,
      },
    };
  }
}

function normalizePropertyType(melissaType: string): string {
  const map: Record<string, string> = {
    SFR: 'single-family',
    Condo: 'condo',
    Apartment: 'apartment',
    Townhouse: 'townhouse',
    Duplex: 'duplex',
    Mobile: 'mobile-home',
  };
  return map[melissaType] ?? melissaType.toLowerCase();
}
