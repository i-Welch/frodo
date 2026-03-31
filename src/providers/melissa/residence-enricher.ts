import { BaseEnricher } from '../base-enricher.js';
import { getModule } from '../../store/user-store.js';
import type { EnrichmentResult, CrossModuleWrite } from '../../enrichment/types.js';

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
  demographics: {
    householdIncome?: string;
    medianHouseholdIncome?: string;
    householdSize?: string;
    maritalStatus?: string;
    presenceOfChildren?: string;
    education?: string;
    occupation?: string;
    companyName?: string;
    lengthOfResidence?: string;
  };
  geo: {
    latitude?: string;
    longitude?: string;
    countyName?: string;
    censusTract?: string;
    countyFIPS?: string;
  };
}

// ---------------------------------------------------------------------------
// Melissa Personator Consumer API response
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
  // Address
  AddressLine1: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
  AddressKey: string;
  AddressTypeCode: string;
  DeliveryIndicator: string;
  CountyName: string;
  // Parsed name
  NameFirst: string;
  NameLast: string;
  NameMiddle: string;
  NamePrefix: string;
  NameSuffix: string;
  Gender: string;
  // Contact
  PhoneNumber: string;
  AreaCode: string;
  EmailAddress: string;
  MailboxName: string;
  DomainName: string;
  TopLevelDomain: string;
  // Demographics
  DateOfBirth: string;
  DateOfDeath: string;
  DemographicsGender: string;
  HouseholdIncome: string;
  MedianHouseholdIncome: string;
  HouseholdSize: string;
  MaritalStatus: string;
  PresenceOfChildren: string;
  ChildrenAgeRange: string;
  Education: string;
  EthnicCode: string;
  EthnicGroup: string;
  LengthOfResidence: string;
  OwnRent: string;
  CreditCardUser: string;
  Occupation: string;
  CompanyName: string;
  // Geo
  Latitude: string;
  Longitude: string;
  CensusTract: string;
  CensusBlock: string;
  CountyFIPS: string;
  // Property
  PropertyOwnerType: string;
  PropertyUseType: string;
  MoveDate: string;
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
    // Pull all available PII to send to Melissa for better match quality
    const identity = await getModule(userId, 'identity');
    const contact = await getModule(userId, 'contact');
    const addr = current.currentAddress;

    if (!addr?.street && !addr?.zip && !contact?.email && !contact?.phone) {
      throw new Error('Melissa enrichment requires at least an address, email, or phone');
    }

    const params = new URLSearchParams({
      id: this.credentials.get('API_KEY'),
      act: 'Check,Verify,Append',
      cols: 'GrpDemographicBasic,GrpNameDetails,GrpAddressDetails,GrpParsedPhone,GrpParsedEmail,GrpCensus,GrpGeocode',
      format: 'json',
    });

    // Add whatever PII we have
    if (identity?.firstName) params.set('first', identity.firstName as string);
    if (identity?.lastName) params.set('last', identity.lastName as string);
    if (addr?.street) params.set('a1', addr.street);
    if (addr?.city) params.set('city', addr.city);
    if (addr?.state) params.set('state', addr.state);
    if (addr?.zip) params.set('postal', addr.zip);
    params.set('ctry', addr?.country ?? 'US');
    if (contact?.email) params.set('email', contact.email as string);
    if (contact?.phone) params.set('phone', contact.phone as string);

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
    if (record.AddressLine1 && record.AddressLine1.trim()) {
      data.currentAddress = {
        street: record.AddressLine1.trim(),
        city: record.City?.trim(),
        state: record.State?.trim(),
        zip: record.PostalCode?.trim(),
        country: record.Country?.trim() || 'US',
      };
    }

    // Ownership
    if (record.OwnRent?.trim()) {
      data.ownershipStatus = record.OwnRent.trim().toLowerCase() === 'own' ? 'own' : 'rent';
    } else if (record.PropertyOwnerType?.trim()) {
      data.ownershipStatus = record.PropertyOwnerType.trim() === 'O' ? 'own' : 'rent';
    }

    // Property type
    if (record.PropertyUseType?.trim()) {
      data.propertyType = normalizePropertyType(record.PropertyUseType.trim());
    }

    // Move date
    if (record.MoveDate?.trim()) {
      data.moveInDate = record.MoveDate.trim();
    }

    // Cross-module writes (processed by engine through event system)
    const crossModuleWrites: CrossModuleWrite[] = [];

    const identityUpdates: Record<string, unknown> = {};
    if (record.NameFirst?.trim() && !identity?.firstName) identityUpdates.firstName = record.NameFirst.trim();
    if (record.NameLast?.trim() && !identity?.lastName) identityUpdates.lastName = record.NameLast.trim();
    if (record.DateOfBirth?.trim() && !identity?.dateOfBirth) identityUpdates.dateOfBirth = record.DateOfBirth.trim();

    if (Object.keys(identityUpdates).length > 0) {
      crossModuleWrites.push({ module: 'identity', data: identityUpdates });
    }

    const contactUpdates: Record<string, unknown> = {};
    if (record.PhoneNumber?.trim() && !contact?.phone) contactUpdates.phone = record.PhoneNumber.trim();
    if (record.EmailAddress?.trim() && !contact?.email) contactUpdates.email = record.EmailAddress.trim();

    if (Object.keys(contactUpdates).length > 0) {
      crossModuleWrites.push({ module: 'contact', data: contactUpdates });
    }

    // Demographics
    data.demographics = {
      householdIncome: record.HouseholdIncome?.trim() || undefined,
      medianHouseholdIncome: record.MedianHouseholdIncome?.trim() || undefined,
      householdSize: record.HouseholdSize?.trim() || undefined,
      maritalStatus: record.MaritalStatus?.trim() || undefined,
      presenceOfChildren: record.PresenceOfChildren?.trim() || undefined,
      education: record.Education?.trim() || undefined,
      occupation: record.Occupation?.trim() || undefined,
      companyName: record.CompanyName?.trim() || undefined,
      lengthOfResidence: record.LengthOfResidence?.trim() || undefined,
    };

    // Geo
    data.geo = {
      latitude: record.Latitude?.trim() || undefined,
      longitude: record.Longitude?.trim() || undefined,
      countyName: record.CountyName?.trim() || undefined,
      censusTract: record.CensusTract?.trim() || undefined,
      countyFIPS: record.CountyFIPS?.trim() || undefined,
    };

    return {
      data,
      crossModuleWrites,
      metadata: {
        melissaResults: record.Results,
        addressKey: record.AddressKey,
        addressType: record.AddressTypeCode,
        deliveryIndicator: record.DeliveryIndicator,
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
