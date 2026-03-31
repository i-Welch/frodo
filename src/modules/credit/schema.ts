import { z } from 'zod';
import { VerificationTier } from '../../types.js';
import { registerModule, type FieldDefinition } from '../registry.js';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const creditSchema = z.object({
  scores: z
    .array(
      z.object({
        bureau: z.string(),
        score: z.number(),
        date: z.string().optional(),
      }),
    )
    .optional(),
  openAccounts: z
    .array(
      z.object({
        creditor: z.string(),
        accountType: z.string().optional(),
        balance: z.number().optional(),
        limit: z.number().optional(),
        interestRate: z.number().optional(),
        isOverdue: z.boolean().optional(),
        lastPaymentAmount: z.number().optional(),
        lastPaymentDate: z.string().optional(),
        minimumPayment: z.number().optional(),
        nextPaymentDueDate: z.string().optional(),
        maturityDate: z.string().optional(),
        originationDate: z.string().optional(),
        pastDueAmount: z.number().optional(),
      }),
    )
    .optional(),
  paymentHistory: z
    .array(
      z.object({
        creditor: z.string(),
        status: z.string(),
        date: z.string().optional(),
      }),
    )
    .optional(),
  inquiries: z
    .array(
      z.object({
        creditor: z.string(),
        date: z.string(),
        type: z.string().optional(),
      }),
    )
    .optional(),
  derogatoryMarks: z
    .array(
      z.object({
        type: z.string(),
        date: z.string().optional(),
        amount: z.number().optional(),
      }),
    )
    .optional(),
  utilization: z.number().optional(),
});

// ---------------------------------------------------------------------------
// Field definitions
// ---------------------------------------------------------------------------

const fields: Record<string, FieldDefinition> = {
  scores: { tier: VerificationTier.Identity, type: 'array' },
  openAccounts: { tier: VerificationTier.Identity, type: 'array' },
  paymentHistory: { tier: VerificationTier.Identity, type: 'array' },
  inquiries: { tier: VerificationTier.Identity, type: 'array' },
  derogatoryMarks: { tier: VerificationTier.Identity, type: 'array' },
  utilization: { tier: VerificationTier.Identity, type: 'number' },
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerModule({ name: 'credit', fields });
