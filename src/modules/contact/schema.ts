import { z } from 'zod';
import { VerificationTier } from '../../types.js';
import { registerModule, type FieldDefinition } from '../registry.js';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const contactSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  socialProfiles: z
    .array(
      z.object({
        platform: z.string(),
        handle: z.string(),
        url: z.string().optional(),
      }),
    )
    .optional(),
  communicationPreferences: z
    .object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// Field definitions
// ---------------------------------------------------------------------------

const fields: Record<string, FieldDefinition> = {
  email: { tier: VerificationTier.BasicOTP, type: 'string' },
  phone: { tier: VerificationTier.BasicOTP, type: 'string' },
  socialProfiles: { tier: VerificationTier.BasicOTP, type: 'array' },
  communicationPreferences: {
    tier: VerificationTier.BasicOTP,
    type: 'object',
  },
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerModule({ name: 'contact', fields });
