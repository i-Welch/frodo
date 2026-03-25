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
// HouseCanary API response types
// Base URL: https://api.housecanary.com
// Auth: HTTP Basic (API_KEY:API_SECRET)
//
// GET /v2/property/details?address=...&zipcode=...
// GET /v2/property/value?address=...&zipcode=...
// GET /v2/property/owner_occupied?address=...&zipcode=...
// ---------------------------------------------------------------------------

interface HCDetailsResponse {
  'property/details': {
    api_code: number;
    api_code_description: string;
    result: {
      property: {
        air_conditioning: string | null;
        attic: boolean | null;
        basement: string | null;
        bathrooms: number | null;
        bedrooms: number | null;
        building_area_sq_ft: number | null;
        fireplace: boolean | null;
        garage_parking_of_cars: number | null;
        garage_type_parking: string | null;
        heating: string | null;
        lot_size_acres: number | null;
        lot_size_sq_ft: number | null;
        no_of_buildings: number | null;
        no_of_stories: number | null;
        number_of_units: number | null;
        partial_bathrooms: number | null;
        pool: boolean | null;
        property_type: string | null;
        roof_cover: string | null;
        roof_type: string | null;
        site_description: string | null;
        style: string | null;
        total_bath_count: number | null;
        total_number_of_rooms: number | null;
        water: string | null;
        year_built: number | null;
      };
      assessment: {
        apn: string | null;
        assessment_year: number | null;
        tax_year: number | null;
        total_assessed_value: number | null;
        tax_amount: number | null;
      };
    };
  };
  address_info: HCAddressInfo;
}

interface HCValueResponse {
  'property/value': {
    api_code: number;
    api_code_description: string;
    result: {
      price_mean: number;
      price_upr: number;
      price_lwr: number;
      fsd: number;
    };
  };
  address_info: HCAddressInfo;
}

interface HCOwnerOccupiedResponse {
  'property/owner_occupied': {
    api_code: number;
    api_code_description: string;
    result: {
      owner_occupied: boolean;
    };
  };
  address_info: HCAddressInfo;
}

interface HCAddressInfo {
  address_full: string;
  slug: string;
  city: string;
  state: string;
  zipcode: string;
  lat: number;
  lng: number;
  block_id: string;
  blockgroup_id: string;
  county_fips: string;
  geo_precision: string;
}

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class HouseCanaryResidenceEnricher extends BaseEnricher<ResidenceData> {
  source = 'housecanary';
  module = 'residence';
  timeoutMs = 15_000;

  protected getBaseUrl(): string {
    return 'https://api.housecanary.com';
  }

  protected getDefaultHeaders(): Record<string, string> {
    // HouseCanary uses HTTP Basic Auth: API_KEY as username, API_SECRET as password
    const apiKey = this.credentials.get('API_KEY');
    const apiSecret = this.credentials.get('API_SECRET');
    const encoded = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    return {
      'Authorization': `Basic ${encoded}`,
    };
  }

  protected async fetchData(
    userId: string,
    current: Partial<ResidenceData>,
  ): Promise<EnrichmentResult<ResidenceData>> {
    const addr = current.currentAddress;
    if (!addr?.street || !addr?.zip) {
      throw new Error('HouseCanary enrichment requires a street address and zip code');
    }

    const params = new URLSearchParams({
      address: addr.street,
      zipcode: addr.zip,
    });
    const qs = params.toString();

    // Fetch property details, valuation, and owner-occupancy in parallel
    const [detailsRes, valueRes, ownerRes] = await Promise.all([
      this.http.request<HCDetailsResponse>(`/v2/property/details?${qs}`),
      this.http.request<HCValueResponse>(`/v2/property/value?${qs}`),
      this.http.request<HCOwnerOccupiedResponse>(`/v2/property/owner_occupied?${qs}`),
    ]);

    const details = detailsRes.data['property/details']?.result;
    const value = valueRes.data['property/value']?.result;
    const ownerOccupied = ownerRes.data['property/owner_occupied']?.result;
    const addressInfo = detailsRes.data.address_info;

    const data: Partial<ResidenceData> = {};

    // Verified address from HouseCanary's geocoded response
    if (addressInfo) {
      data.currentAddress = {
        street: addr.street,
        city: addressInfo.city,
        state: addressInfo.state,
        zip: addressInfo.zipcode,
        country: 'US',
      };
    }

    // Owner vs renter
    if (ownerOccupied) {
      data.ownershipStatus = ownerOccupied.owner_occupied ? 'own' : 'rent';
    }

    // Property type
    if (details?.property?.property_type) {
      data.propertyType = normalizeHCPropertyType(details.property.property_type);
    }

    return {
      data,
      metadata: {
        valuation: value ? {
          estimatedValue: value.price_mean,
          valueLow: value.price_lwr,
          valueHigh: value.price_upr,
          forecastStdDev: value.fsd,
        } : null,
        propertyDetails: details?.property ? {
          bedrooms: details.property.bedrooms,
          bathrooms: details.property.total_bath_count,
          sqft: details.property.building_area_sq_ft,
          yearBuilt: details.property.year_built,
          lotSizeAcres: details.property.lot_size_acres,
          stories: details.property.no_of_stories,
        } : null,
        assessment: details?.assessment ? {
          totalAssessedValue: details.assessment.total_assessed_value,
          taxAmount: details.assessment.tax_amount,
          taxYear: details.assessment.tax_year,
        } : null,
        geocode: addressInfo ? {
          lat: addressInfo.lat,
          lng: addressInfo.lng,
          geoPrecision: addressInfo.geo_precision,
        } : null,
      },
    };
  }
}

function normalizeHCPropertyType(hcType: string): string {
  const map: Record<string, string> = {
    'Single Family Residential': 'single-family',
    'Condominium': 'condo',
    'Townhouse': 'townhouse',
    'Multi-Family': 'multi-family',
    'Apartment': 'apartment',
    'Mobile/Manufactured Home': 'mobile-home',
    'Cooperative': 'coop',
    'Duplex': 'duplex',
    'Triplex': 'triplex',
  };
  return map[hcType] ?? hcType.toLowerCase().replace(/\s+/g, '-');
}
