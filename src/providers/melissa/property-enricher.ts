import { BaseEnricher } from '../base-enricher.js';
import { getModule } from '../../store/user-store.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// ---------------------------------------------------------------------------
// Module shape — property details for residence module
// ---------------------------------------------------------------------------

interface PropertyData {
  propertyDetails: {
    yearBuilt?: string;
    stories?: string;
    bedrooms?: string;
    bathrooms?: string;
    buildingSqFt?: string;
    lotSqFt?: string;
    lotAcres?: string;
    propertyUseGroup?: string;
    zoning?: string;
    construction?: string;
  };
  valuation: {
    estimatedValue?: string;
    estimatedMinValue?: string;
    estimatedMaxValue?: string;
    confidenceScore?: string;
    valuationDate?: string;
    assessedValueTotal?: string;
    assessedValueLand?: string;
    assessedValueImprovements?: string;
    marketValueTotal?: string;
    taxYear?: string;
    taxBilledAmount?: string;
  };
  ownership: {
    ownerName?: string;
    ownerType?: string;
    companyFlag?: string;
    ownerOccupied?: string;
  };
  saleHistory: {
    lastSaleDate?: string;
    lastSalePrice?: string;
    priorSaleDate?: string;
    priorSalePrice?: string;
  };
  legalDescription?: string;
  parcelNumber?: string;
  fipsCode?: string;
}

// ---------------------------------------------------------------------------
// Melissa Property API V4 response types
// ---------------------------------------------------------------------------

interface MelissaPropertyResponse {
  Version: string;
  TransmissionResults: string;
  TotalRecords: number;
  Records: MelissaPropertyRecord[];
}

interface MelissaPropertyRecord {
  Results: string;
  Parcel?: {
    FIPSCode?: string;
    UnformattedAPN?: string;
    FormattedAPN?: string;
    County?: string;
    CensusTract?: string;
    CensusBlock?: string;
    CBSAName?: string;
  };
  Legal?: {
    LegalDescription?: string;
    Subdivision?: string;
    Block1?: string;
    LotNumber1?: string;
  };
  PropertyAddress?: {
    Address?: string;
    City?: string;
    State?: string;
    Zip?: string;
    AddressKey?: string;
    MAK?: string;
    Latitude?: string;
    Longitude?: string;
  };
  PrimaryOwner?: {
    Name1Full?: string;
    CompanyFlag?: string;
    Type?: string;
  };
  OwnerAddress?: {
    OwnerOccupied?: string;
  };
  Tax?: {
    YearAssessed?: string;
    AssessedValueTotal?: string;
    AssessedValueImprovements?: string;
    AssessedValueLand?: string;
    MarketValueYear?: string;
    MarketValueTotal?: string;
    MarketValueImprovements?: string;
    MarketValueLand?: string;
    TaxFiscalYear?: string;
    TaxBilledAmount?: string;
  };
  PropertyUseInfo?: {
    YearBuilt?: string;
    YearBuiltEffective?: string;
    ZonedCodeLocal?: string;
    PropertyUseGroup?: string;
    PropertyUseStandardized?: string;
  };
  SaleInfo?: {
    AssessorLastSaleDate?: string;
    AssessorLastSaleAmount?: string;
    AssessorPriorSaleDate?: string;
    AssessorPriorSaleAmount?: string;
    DeedLastSaleDate?: string;
    DeedLastSalePrice?: string;
  };
  PropertySize?: {
    AreaBuilding?: string;
    AreaLotSF?: string;
    AreaLotAcres?: string;
  };
  IntStructInfo?: {
    Construction?: string;
  };
  IntRoomInfo?: {
    BathCount?: string;
    BathPartialCount?: string;
    BedroomsCount?: string;
    RoomsCount?: string;
    StoriesCount?: string;
    UnitsCount?: string;
  };
  EstimatedValue?: {
    EstimatedValue?: string;
    EstimatedMinValue?: string;
    EstimatedMaxValue?: string;
    ConfidenceScore?: string;
    ValuationDate?: string;
  };
}

// ---------------------------------------------------------------------------
// Column groups we request
// ---------------------------------------------------------------------------

const PROPERTY_COLS = [
  'grpParcel',
  'grpLegal',
  'grpPrimaryOwner',
  'grpOwnerAddress',
  'grpTax',
  'grpPropertyUseInfo',
  'grpPropertySize',
  'grpIntStructInfo',
  'grpIntRoomInfo',
  'grpEstimatedValue',
  'grpSaleInfo',
].join(',');

// ---------------------------------------------------------------------------
// Enricher
// ---------------------------------------------------------------------------

export class MelissaPropertyEnricher extends BaseEnricher<PropertyData> {
  source = 'melissa';
  module = 'residence';
  timeoutMs = 10_000;

  protected getBaseUrl(): string {
    return 'https://property.melissadata.net/v4';
  }

  protected async fetchData(
    userId: string,
    _current: Partial<PropertyData>,
  ): Promise<EnrichmentResult<PropertyData>> {
    // Try to get the address from the residence module (set by Personator enricher)
    const residence = await getModule(userId, 'residence');

    const addr = residence?.currentAddress as {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
    } | undefined;

    if (!addr?.street) {
      throw new Error('Melissa Property enrichment requires a verified address (run Personator first)');
    }

    // Build free-form address string for lookup
    const ff = [addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(' ');

    const params = new URLSearchParams({
      id: this.credentials.get('API_KEY'),
      format: 'JSON',
      cols: PROPERTY_COLS,
      ff,
    });

    const res = await this.http.request<MelissaPropertyResponse>(
      `/WEB/LookupProperty/?${params.toString()}`,
    );

    const records = res.data.Records;
    if (!records || records.length === 0 || !records[0].Parcel) {
      return { data: {} };
    }

    const r = records[0];

    // Check for valid results (YS = success codes, YE = errors)
    if (r.Results?.startsWith('YE') && !r.Results.includes('YS')) {
      return { data: {} };
    }

    const data: Partial<PropertyData> = {};

    // Property details
    const details: PropertyData['propertyDetails'] = {};
    if (nonEmpty(r.PropertyUseInfo?.YearBuilt)) details.yearBuilt = r.PropertyUseInfo!.YearBuilt!;
    if (nonEmpty(r.IntRoomInfo?.StoriesCount)) details.stories = r.IntRoomInfo!.StoriesCount!;
    if (nonEmpty(r.IntRoomInfo?.BedroomsCount) && r.IntRoomInfo!.BedroomsCount !== '0') details.bedrooms = r.IntRoomInfo!.BedroomsCount!;
    if (nonEmpty(r.IntRoomInfo?.BathCount) && r.IntRoomInfo!.BathCount !== '0') details.bathrooms = r.IntRoomInfo!.BathCount!;
    if (nonEmpty(r.PropertySize?.AreaBuilding) && r.PropertySize!.AreaBuilding !== '0') details.buildingSqFt = r.PropertySize!.AreaBuilding!;
    if (nonEmpty(r.PropertySize?.AreaLotSF) && r.PropertySize!.AreaLotSF !== '0' && r.PropertySize!.AreaLotSF !== '0.00') details.lotSqFt = r.PropertySize!.AreaLotSF!;
    if (nonEmpty(r.PropertySize?.AreaLotAcres) && r.PropertySize!.AreaLotAcres !== '0' && r.PropertySize!.AreaLotAcres !== '0.0000') details.lotAcres = r.PropertySize!.AreaLotAcres!;
    if (nonEmpty(r.PropertyUseInfo?.PropertyUseGroup)) details.propertyUseGroup = r.PropertyUseInfo!.PropertyUseGroup!;
    if (nonEmpty(r.PropertyUseInfo?.ZonedCodeLocal)) details.zoning = r.PropertyUseInfo!.ZonedCodeLocal!;
    if (nonEmpty(r.IntStructInfo?.Construction)) details.construction = r.IntStructInfo!.Construction!;
    if (Object.keys(details).length > 0) data.propertyDetails = details;

    // Valuation
    const val: PropertyData['valuation'] = {};
    if (nonEmpty(r.EstimatedValue?.EstimatedValue)) val.estimatedValue = r.EstimatedValue!.EstimatedValue!;
    if (nonEmpty(r.EstimatedValue?.EstimatedMinValue)) val.estimatedMinValue = r.EstimatedValue!.EstimatedMinValue!;
    if (nonEmpty(r.EstimatedValue?.EstimatedMaxValue)) val.estimatedMaxValue = r.EstimatedValue!.EstimatedMaxValue!;
    if (nonEmpty(r.EstimatedValue?.ConfidenceScore)) val.confidenceScore = r.EstimatedValue!.ConfidenceScore!;
    if (nonEmpty(r.EstimatedValue?.ValuationDate)) val.valuationDate = r.EstimatedValue!.ValuationDate!;
    if (nonEmpty(r.Tax?.AssessedValueTotal) && r.Tax!.AssessedValueTotal !== '0') val.assessedValueTotal = r.Tax!.AssessedValueTotal!;
    if (nonEmpty(r.Tax?.AssessedValueLand) && r.Tax!.AssessedValueLand !== '0') val.assessedValueLand = r.Tax!.AssessedValueLand!;
    if (nonEmpty(r.Tax?.AssessedValueImprovements) && r.Tax!.AssessedValueImprovements !== '0') val.assessedValueImprovements = r.Tax!.AssessedValueImprovements!;
    if (nonEmpty(r.Tax?.MarketValueTotal) && r.Tax!.MarketValueTotal !== '0') val.marketValueTotal = r.Tax!.MarketValueTotal!;
    if (nonEmpty(r.Tax?.TaxFiscalYear)) val.taxYear = r.Tax!.TaxFiscalYear!;
    if (nonEmpty(r.Tax?.TaxBilledAmount) && r.Tax!.TaxBilledAmount !== '0' && r.Tax!.TaxBilledAmount !== '0.00') val.taxBilledAmount = r.Tax!.TaxBilledAmount!;
    if (Object.keys(val).length > 0) data.valuation = val;

    // Ownership
    const own: PropertyData['ownership'] = {};
    if (nonEmpty(r.PrimaryOwner?.Name1Full)) own.ownerName = r.PrimaryOwner!.Name1Full!;
    if (nonEmpty(r.PrimaryOwner?.Type)) own.ownerType = r.PrimaryOwner!.Type!;
    if (nonEmpty(r.PrimaryOwner?.CompanyFlag)) own.companyFlag = r.PrimaryOwner!.CompanyFlag!;
    if (nonEmpty(r.OwnerAddress?.OwnerOccupied)) own.ownerOccupied = r.OwnerAddress!.OwnerOccupied!;
    if (Object.keys(own).length > 0) data.ownership = own;

    // Sale history
    const sale: PropertyData['saleHistory'] = {};
    const lastSaleDate = r.SaleInfo?.DeedLastSaleDate || r.SaleInfo?.AssessorLastSaleDate;
    const lastSalePrice = r.SaleInfo?.DeedLastSalePrice || r.SaleInfo?.AssessorLastSaleAmount;
    if (nonEmpty(lastSaleDate)) sale.lastSaleDate = lastSaleDate!;
    if (nonEmpty(lastSalePrice) && lastSalePrice !== '0') sale.lastSalePrice = lastSalePrice!;
    if (nonEmpty(r.SaleInfo?.AssessorPriorSaleDate)) sale.priorSaleDate = r.SaleInfo!.AssessorPriorSaleDate!;
    if (nonEmpty(r.SaleInfo?.AssessorPriorSaleAmount) && r.SaleInfo!.AssessorPriorSaleAmount !== '0') sale.priorSalePrice = r.SaleInfo!.AssessorPriorSaleAmount!;
    if (Object.keys(sale).length > 0) data.saleHistory = sale;

    // Legal / parcel
    if (nonEmpty(r.Legal?.LegalDescription)) data.legalDescription = r.Legal!.LegalDescription!;
    if (nonEmpty(r.Parcel?.FormattedAPN || r.Parcel?.UnformattedAPN)) data.parcelNumber = (r.Parcel!.FormattedAPN || r.Parcel!.UnformattedAPN)!;
    if (nonEmpty(r.Parcel?.FIPSCode)) data.fipsCode = r.Parcel!.FIPSCode!;

    return {
      data,
      metadata: {
        melissaResults: r.Results,
        county: r.Parcel?.County,
        censusTract: r.Parcel?.CensusTract,
        cbsaName: r.Parcel?.CBSAName,
        latitude: r.PropertyAddress?.Latitude,
        longitude: r.PropertyAddress?.Longitude,
      },
    };
  }
}

function nonEmpty(val: string | undefined | null): boolean {
  return val !== undefined && val !== null && val.trim() !== '';
}
