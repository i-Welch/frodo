import { z } from 'zod';
import { VerificationTier } from '../../types.js';
import { registerModule, type FieldDefinition } from '../registry.js';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const buyingPatternsSchema = z.object({
  spendingCategories: z
    .array(
      z.object({
        category: z.string(),
        amount: z.number().optional(),
        percentage: z.number().optional(),
      }),
    )
    .optional(),
  purchaseFrequency: z
    .object({
      daily: z.number().optional(),
      weekly: z.number().optional(),
      monthly: z.number().optional(),
    })
    .optional(),
  averageTransactionSize: z.number().optional(),
  merchantAffinity: z
    .array(
      z.object({
        merchant: z.string(),
        frequency: z.number().optional(),
        totalSpend: z.number().optional(),
      }),
    )
    .optional(),
  seasonalTrends: z
    .array(
      z.object({
        season: z.string(),
        spendingChange: z.number().optional(),
        topCategories: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

// ---------------------------------------------------------------------------
// Field definitions
// ---------------------------------------------------------------------------

const fields: Record<string, FieldDefinition> = {
  spendingCategories: { tier: VerificationTier.EnhancedOTP, type: 'array' },
  purchaseFrequency: { tier: VerificationTier.EnhancedOTP, type: 'object' },
  averageTransactionSize: {
    tier: VerificationTier.EnhancedOTP,
    type: 'currency',
  },
  merchantAffinity: { tier: VerificationTier.EnhancedOTP, type: 'array' },
  seasonalTrends: { tier: VerificationTier.EnhancedOTP, type: 'array' },
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerModule({ name: 'buying-patterns', fields });
