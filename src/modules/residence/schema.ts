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
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerModule({ name: 'residence', fields });
