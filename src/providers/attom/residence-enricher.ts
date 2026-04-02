import { BaseEnricher } from '../base-enricher.js';
import { getModule } from '../../store/user-store.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape — matches the residence schema
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
  propertyDetails: Record<string, unknown>;
  valuation: Record<string, unknown>;
  geo: Record<string, unknown>;
  legalDescription: string;
  parcelNumber: string;
  fipsCode: string;
}

// ---------------------------------------------------------------------------
// ATTOM Property API response types
// Base URL: https://api.gateway.attomdata.com/propertyapi/v1.0.0
// Auth: apikey header
//
// GET /property/detail?address1=...&address2=...
// GET /avm/detail?address1=...&address2=...
// ---------------------------------------------------------------------------

interface AttomPropertyDetailResponse {
  status: { code: number; msg: string; total: number };
  property: AttomProperty[];
}

interface AttomProperty {
  identifier: {
    obPropId: number;
    fips: string;
    apn: string;
    attomId: number;
  };
  address: {
    country: string;
    countrySubd: string;
    line1: string;
    line2: string;
    locality: string;
    matchCode: string;
    oneLine: string;
    postal1: string;
    postal2: string;
    postal3: string;
  };
  location: {
    accuracy: string;
    elevation: number;
    latitude: string;
    longitude: string;
  };
  lot: {
    depth: number;
    frontage: number;
    lotnum: string;
    lotsize1: number;
    lotsize2: number;
  };
  building: {
    rooms: {
      beds: number;
      bathstotal: number;
      bathsfull: number;
      bathshalf: number;
    };
    size: {
      bldgsize: number;
      grosssize: number;
      livingsize: number;
      universalsize: number;
    };
    construction: {
      constructiontype: string;
      foundationtype: string;
      roofcover: string;
      roofShape: string;
    };
    summary: {
      archStyle: string;
      levels: number;
      storyDesc: string;
      yearbuilt: number;
    };
  };
  summary: {
    propclass: string;
    proptype: string;
    propsubtype: string;
    yearbuilt: number;
    legal1: string;
  };
  vintage: {
    lastModified: string;
    pubDate: string;
  };
}

interface AttomAvmResponse {
  status: { code: number; msg: string; total: number };
  property: {
    identifier: AttomProperty['identifier'];
    address: AttomProperty['address'];
    avm: {
      eventDate: string;
      amount: {
        scr: number;
        value: number;
        high: number;
        low: number;
        valueRange: number;
      };
      calculations: {
        perSizeUnit: number;
        ratioTaxAmt: number;
        ratioTaxValue: number;
        monthlyChgPct: number;
        monthlyChgValue: number;
        rangePctOfValue: number;
      };
    };
  }[];
}

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class AttomResidenceEnricher extends BaseEnricher<ResidenceData> {
  source = 'attom';
  module = 'residence';
  timeoutMs = 15_000;

  protected getBaseUrl(): string {
    return 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';
  }

  protected getDefaultHeaders(): Record<string, string> {
    // ATTOM uses a custom "apikey" header
    return {
      'apikey': this.credentials.get('API_KEY'),
      'Accept': 'application/json',
    };
  }

  protected async fetchData(
    userId: string,
    current: Partial<ResidenceData>,
  ): Promise<EnrichmentResult<ResidenceData>> {
    // Use current address from enrichment input, or pull from residence module
    let addr = current.currentAddress as { street?: string; city?: string; state?: string; zip?: string } | undefined;
    if (!addr?.street) {
      const residence = await getModule(userId, 'residence');
      addr = residence?.currentAddress as typeof addr;
    }
    if (!addr?.street) {
      throw new Error('ATTOM enrichment requires a verified address (run Personator or Plaid first)');
    }

    // ATTOM uses address1 (street) and address2 (city, state or city, state zip)
    const address2Parts = [addr.city, addr.state].filter(Boolean).join(', ');
    const address2 = addr.zip ? `${address2Parts} ${addr.zip}` : address2Parts;

    if (!address2) {
      throw new Error('ATTOM enrichment requires city/state or zip code');
    }

    const params = new URLSearchParams({
      address1: addr.street,
      address2,
    });
    const qs = params.toString();

    // Fetch property detail and AVM in parallel
    const [detailRes, avmRes] = await Promise.all([
      this.http.request<AttomPropertyDetailResponse>(`/property/detail?${qs}`),
      this.http.request<AttomAvmResponse>(`/avm/detail?${qs}`).catch(() => null),
    ]);

    const properties = detailRes.data.property;
    if (!properties || properties.length === 0) {
      return { data: {} };
    }

    const prop = properties[0];
    const data: Partial<ResidenceData> = {};

    // Verified address from ATTOM's matched record
    if (prop.address) {
      data.currentAddress = {
        street: prop.address.line1,
        city: prop.address.locality,
        state: prop.address.countrySubd,
        zip: prop.address.postal1,
        country: prop.address.country || 'US',
      };
    }

    // Property type from ATTOM's classification
    if (prop.summary?.proptype) {
      data.propertyType = normalizeAttomPropertyType(
        prop.summary.proptype,
        prop.summary.propsubtype,
      );
    }

    // Property details
    const building = prop.building;
    if (building) {
      data.propertyDetails = {
        yearBuilt: String(building.summary?.yearbuilt || prop.summary?.yearbuilt || ''),
        stories: building.summary?.levels ? String(building.summary.levels) : undefined,
        bedrooms: building.rooms?.beds ? String(building.rooms.beds) : undefined,
        bathrooms: building.rooms?.bathstotal ? String(building.rooms.bathstotal) : undefined,
        buildingSqFt: String(building.size?.universalsize || building.size?.livingsize || ''),
        lotSqFt: prop.lot?.lotsize1 ? String(prop.lot.lotsize1) : undefined,
        construction: building.construction?.constructiontype || undefined,
        propertyUseGroup: prop.summary?.proptype || undefined,
      };
    }

    // AVM / valuation
    const avm = avmRes?.data?.property?.[0]?.avm;
    if (avm) {
      data.valuation = {
        estimatedValue: String(avm.amount.value),
        estimatedMinValue: String(avm.amount.low),
        estimatedMaxValue: String(avm.amount.high),
        confidenceScore: String(avm.amount.scr),
        valuationDate: avm.eventDate,
      };
    }

    // Geo
    if (prop.location?.latitude) {
      data.geo = {
        latitude: prop.location.latitude,
        longitude: prop.location.longitude,
      };
    }

    // Legal / parcel
    if (prop.summary?.legal1) data.legalDescription = prop.summary.legal1;
    if (prop.identifier?.apn) data.parcelNumber = prop.identifier.apn;
    if (prop.identifier?.fips) data.fipsCode = prop.identifier.fips;

    return {
      data,
      metadata: {
        attomId: prop.identifier?.attomId,
        lastModified: prop.vintage?.lastModified,
      },
    };
  }
}

function normalizeAttomPropertyType(
  proptype: string,
  propsubtype?: string,
): string {
  const sub = propsubtype?.toUpperCase() ?? '';
  const main = proptype?.toUpperCase() ?? '';

  if (sub.includes('CONDO') || main.includes('CONDO')) return 'condo';
  if (sub.includes('TOWNHOUSE') || sub.includes('TOWNHOME')) return 'townhouse';
  if (sub.includes('DUPLEX')) return 'duplex';
  if (sub.includes('TRIPLEX')) return 'triplex';
  if (sub.includes('APARTMENT') || main.includes('APARTMENT')) return 'apartment';
  if (sub.includes('MOBILE') || sub.includes('MANUFACTURED')) return 'mobile-home';
  if (main.includes('SFR') || sub.includes('SINGLE')) return 'single-family';
  if (main.includes('RESIDENTIAL')) return 'single-family';
  if (main.includes('MULTI')) return 'multi-family';
  if (main.includes('COMMERCIAL')) return 'commercial';

  return proptype.toLowerCase().replace(/\s+/g, '-');
}
