import { z } from 'zod';
import { VerificationTier } from '../../types.js';
import { registerModule, type FieldDefinition } from '../registry.js';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const employmentSchema = z.object({
  employer: z.string().optional(),
  title: z.string().optional(),
  startDate: z.string().optional(),
  salary: z.number().optional(),
  history: z
    .array(
      z.object({
        employer: z.string(),
        title: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .optional(),
});

// ---------------------------------------------------------------------------
// Field definitions
// ---------------------------------------------------------------------------

const fields: Record<string, FieldDefinition> = {
  employer: { tier: VerificationTier.BasicOTP, type: 'string' },
  title: { tier: VerificationTier.BasicOTP, type: 'string' },
  startDate: { tier: VerificationTier.EnhancedOTP, type: 'date' },
  salary: { tier: VerificationTier.EnhancedOTP, type: 'currency' },
  history: { tier: VerificationTier.EnhancedOTP, type: 'array' },
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerModule({ name: 'employment', fields });
