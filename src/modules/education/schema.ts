import { z } from 'zod';
import { VerificationTier } from '../../types.js';
import { registerModule, type FieldDefinition } from '../registry.js';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const educationSchema = z.object({
  highestDegree: z
    .object({
      level: z.string(),               // "bachelor", "master", "doctorate", "associate", etc.
      field: z.string().optional(),     // "Computer Science", "Business Administration"
      institution: z.string(),
      graduationDate: z.string().optional(),
      verified: z.boolean().optional(),
    })
    .optional(),
  enrollments: z
    .array(
      z.object({
        institution: z.string(),
        level: z.string().optional(),   // "undergraduate", "graduate", "professional"
        field: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.string().optional(),  // "enrolled", "graduated", "withdrawn", "leave"
        fullTime: z.boolean().optional(),
      }),
    )
    .optional(),
  degrees: z
    .array(
      z.object({
        level: z.string(),              // "bachelor", "master", "doctorate", "associate"
        field: z.string().optional(),
        institution: z.string(),
        graduationDate: z.string().optional(),
        honors: z.string().optional(),  // "cum laude", "magna cum laude", etc.
      }),
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string().optional(),
        issueDate: z.string().optional(),
        expirationDate: z.string().optional(),
        credentialId: z.string().optional(),
      }),
    )
    .optional(),
  currentlyEnrolled: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Field definitions
// ---------------------------------------------------------------------------

const fields: Record<string, FieldDefinition> = {
  highestDegree: { tier: VerificationTier.BasicOTP, type: 'object' },
  enrollments: { tier: VerificationTier.EnhancedOTP, type: 'array' },
  degrees: { tier: VerificationTier.EnhancedOTP, type: 'array' },
  certifications: { tier: VerificationTier.BasicOTP, type: 'array' },
  currentlyEnrolled: { tier: VerificationTier.BasicOTP, type: 'boolean' },
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

registerModule({ name: 'education', fields });
