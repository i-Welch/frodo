import { z } from 'zod';
import { VerificationTier } from '../../types.js';
import { registerModule, type FieldDefinition } from '../registry.js';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const financialSchema = z.object({
  bankAccounts: z
    .array(
      z.object({
        institution: z.string(),
        accountType: z.string().optional(),
        last4: z.string().optional(),
      }),
    )
    .optional(),
  balances: z
    .object({
      checking: z.number().optional(),
      savings: z.number().optional(),
      investment: z.number().optional(),
      total: z.number().optional(),
    })
    .optional(),
  incomeStreams: z
    .array(
      z.object({
        source: z.string(),
        amount: z.number().optional(),
        frequency: z.string().optional(),
        incomeCategory: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        transactionCount: z.number().optional(),
      }),
    )
    .optional(),
  assets: z
    .array(
      z.object({
        type: z.string(),
        value: z.number().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  transactionHistory: z
    .array(
      z.object({
        date: z.string(),
        amount: z.number(),
        description: z.string().optional(),
        category: z.string().optional(),
      }),
    )
    .optional(),
});

// ---------------------------------------------------------------------------
// Field definitions
// ---------------------------------------------------------------------------

const fields: Record<string, FieldDefinition> = {
  bankAccounts: { tier: VerificationTier.Identity, type: 'array' },
  balances: { tier: VerificationTier.Identity, type: 'object' },
  incomeStreams: { tier: VerificationTier.Identity, type: 'array' },
  assets: { tier: VerificationTier.Identity, type: 'array' },
  transactionHistory: { tier: VerificationTier.Identity, type: 'array' },
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerModule({ name: 'financial', fields });
