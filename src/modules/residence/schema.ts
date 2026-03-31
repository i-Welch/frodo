import { z } from 'zod';
import { VerificationTier } from '../../types.js';
import { registerModule, type FieldDefinition } from '../registry.js';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const residenceSchema = z.object({
  currentAddress: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  addressHistory: z
    .array(
      z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
        moveInDate: z.string().optional(),
        moveOutDate: z.string().optional(),
      }),
    )
    .optional(),
  ownershipStatus: z.string().optional(),
  propertyType: z.string().optional(),
  moveInDate: z.string().optional(),
  propertyDetails: z
    .object({
      yearBuilt: z.number().optional(),
      stories: z.number().optional(),
      bedrooms: z.number().optional(),
      bathrooms: z.number().optional(),
      buildingSqFt: z.number().optional(),
      lotSqFt: z.number().optional(),
      lotAcres: z.number().optional(),
      propertyUseGroup: z.string().optional(),
      zoning: z.string().optional(),
      construction: z.string().optional(),
    })
    .optional(),
  valuation: z
    .object({
      estimatedValue: z.number().optional(),
      estimatedMinValue: z.number().optional(),
      estimatedMaxValue: z.number().optional(),
      confidenceScore: z.number().optional(),
      valuationDate: z.string().optional(),
      assessedValueTotal: z.number().optional(),
      assessedValueLand: z.number().optional(),
      assessedValueImprovements: z.number().optional(),
      marketValueTotal: z.number().optional(),
      taxYear: z.number().optional(),
      taxBilledAmount: z.number().optional(),
    })
    .optional(),
  ownership: z
    .object({
      ownerName: z.string().optional(),
      ownerType: z.string().optional(),
      companyFlag: z.boolean().optional(),
      ownerOccupied: z.boolean().optional(),
    })
    .optional(),
  saleHistory: z
    .object({
      lastSaleDate: z.string().optional(),
      lastSalePrice: z.number().optional(),
      priorSaleDate: z.string().optional(),
      priorSalePrice: z.number().optional(),
    })
    .optional(),
  legalDescription: z.string().optional(),
  parcelNumber: z.string().optional(),
  fipsCode: z.string().optional(),
  demographics: z
    .object({
      householdIncome: z.number().optional(),
      medianHouseholdIncome: z.number().optional(),
      householdSize: z.number().optional(),
      maritalStatus: z.string().optional(),
      presenceOfChildren: z.boolean().optional(),
      education: z.string().optional(),
      occupation: z.string().optional(),
      companyName: z.string().optional(),
      lengthOfResidence: z.number().optional(),
    })
    .optional(),
  geo: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      countyName: z.string().optional(),
      censusTract: z.string().optional(),
      countyFIPS: z.string().optional(),
      cbsaName: z.string().optional(),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// Field definitions
// ---------------------------------------------------------------------------

const fields: Record<string, FieldDefinition> = {
  currentAddress: { tier: VerificationTier.EnhancedOTP, type: 'object' },
  addressHistory: { tier: VerificationTier.EnhancedOTP, type: 'array' },
  ownershipStatus: { tier: VerificationTier.EnhancedOTP, type: 'string' },
  propertyType: { tier: VerificationTier.EnhancedOTP, type: 'string' },
  moveInDate: { tier: VerificationTier.EnhancedOTP, type: 'date' },
  propertyDetails: { tier: VerificationTier.EnhancedOTP, type: 'object' },
  valuation: { tier: VerificationTier.EnhancedOTP, type: 'object' },
  ownership: { tier: VerificationTier.EnhancedOTP, type: 'object' },
  saleHistory: { tier: VerificationTier.EnhancedOTP, type: 'object' },
  legalDescription: { tier: VerificationTier.EnhancedOTP, type: 'string' },
  parcelNumber: { tier: VerificationTier.EnhancedOTP, type: 'string' },
  fipsCode: { tier: VerificationTier.EnhancedOTP, type: 'string' },
  demographics: { tier: VerificationTier.EnhancedOTP, type: 'object' },
  geo: { tier: VerificationTier.EnhancedOTP, type: 'object' },
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerModule({ name: 'residence', fields });
