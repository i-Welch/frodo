import { z } from 'zod';
import { VerificationTier } from '../../types.js';
import { registerModule, type FieldDefinition } from '../registry.js';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const identitySchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  ssn: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  governmentIds: z
    .array(
      z.object({
        type: z.string(),
        value: z.string(),
        country: z.string().optional(),
      }),
    )
    .optional(),
  kycDecision: z.string().optional(),
  fraudScore: z.number().optional(),
  syntheticIdentityScore: z.number().optional(),
  watchlistScreening: z
    .object({
      watchlistScore: z.number().optional(),
      watchlistHits: z.array(z.string()).optional(),
      globalWatchlistScore: z.number().optional(),
      globalWatchlistHits: z.array(z.string()).optional(),
    })
    .optional(),
  kycScore: z.number().optional(),
  riskScores: z
    .object({
      phoneRiskScore: z.number().optional(),
      emailRiskScore: z.number().optional(),
      addressRiskScore: z.number().optional(),
      namePhoneCorrelation: z.number().optional(),
      nameAddressCorrelation: z.number().optional(),
      sigmaScore: z.number().optional(),
    })
    .optional(),
  bankVerified: z
    .object({
      email: z.boolean().optional(),
      phone: z.boolean().optional(),
      address: z.boolean().optional(),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// Field definitions
// ---------------------------------------------------------------------------

const fields: Record<string, FieldDefinition> = {
  firstName: { tier: VerificationTier.Identity, type: 'string' },
  lastName: { tier: VerificationTier.Identity, type: 'string' },
  dateOfBirth: { tier: VerificationTier.Identity, type: 'date' },
  ssn: { tier: VerificationTier.Identity, type: 'string' },
  aliases: { tier: VerificationTier.Identity, type: 'array' },
  governmentIds: { tier: VerificationTier.Identity, type: 'array' },
  kycDecision: { tier: VerificationTier.Identity, type: 'string' },
  fraudScore: { tier: VerificationTier.Identity, type: 'number' },
  syntheticIdentityScore: { tier: VerificationTier.Identity, type: 'number' },
  watchlistScreening: { tier: VerificationTier.Identity, type: 'object' },
  kycScore: { tier: VerificationTier.Identity, type: 'number' },
  riskScores: { tier: VerificationTier.Identity, type: 'object' },
  bankVerified: { tier: VerificationTier.Identity, type: 'object' },
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerModule({ name: 'identity', fields });
