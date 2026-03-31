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
  fullName: z.string().optional(),
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  location: z.string().optional(),
  jobTitle: z.string().optional(),
  organization: z.string().optional(),
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
  fullName: { tier: VerificationTier.BasicOTP, type: 'string' },
  ageRange: { tier: VerificationTier.BasicOTP, type: 'string' },
  gender: { tier: VerificationTier.BasicOTP, type: 'string' },
  location: { tier: VerificationTier.BasicOTP, type: 'string' },
  jobTitle: { tier: VerificationTier.BasicOTP, type: 'string' },
  organization: { tier: VerificationTier.BasicOTP, type: 'string' },
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerModule({ name: 'contact', fields });
