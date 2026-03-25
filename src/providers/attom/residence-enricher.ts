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
    const addr = current.currentAddress;
    if (!addr?.street) {
      throw new Error('ATTOM enrichment requires a street address');
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

    return {
      data,
      metadata: {
        attomId: prop.identifier?.attomId,
        valuation: avmRes?.data?.property?.[0]?.avm ? {
          estimatedValue: avmRes.data.property[0].avm.amount.value,
          valueLow: avmRes.data.property[0].avm.amount.low,
          valueHigh: avmRes.data.property[0].avm.amount.high,
          confidenceScore: avmRes.data.property[0].avm.amount.scr,
          valuePerSqFt: avmRes.data.property[0].avm.calculations.perSizeUnit,
          valuationDate: avmRes.data.property[0].avm.eventDate,
        } : null,
        propertyDetails: {
          bedrooms: prop.building?.rooms?.beds,
          bathrooms: prop.building?.rooms?.bathstotal,
          sqft: prop.building?.size?.universalsize || prop.building?.size?.livingsize,
          yearBuilt: prop.building?.summary?.yearbuilt || prop.summary?.yearbuilt,
          lotSizeSqFt: prop.lot?.lotsize1,
          stories: prop.building?.summary?.levels,
          construction: prop.building?.construction?.constructiontype,
        },
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
