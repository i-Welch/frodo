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
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerModule({ name: 'identity', fields });
