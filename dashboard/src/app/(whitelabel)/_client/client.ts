/**
 * The single data seam for the white-label borrower journey.
 *
 * The journey talks ONLY to a WhiteLabelClient. Today that is the MockClient
 * (deterministic fixtures, demo mode). In production it becomes an ApiClient
 * that calls the Elysia /api/v1/wl/* endpoints; the journey does not change.
 * Demo vs live is entirely behind this interface (see
 * docs/whitelabel-platform-design.md, Section 4.6).
 */

import type { WLProduct, RateRange } from '../_config/types';
import type { FlowKind } from '../_config/flows';
import type { MockProfile } from '../_config/mock-engine';

export type IntakeStatus =
  | 'data_ready'
  | 'rate_ready'
  | 'under_review'
  | 'routed';

/** One step in the data-pull animation. */
export interface PullStep {
  module: string;
  provider: string;
  label: string;
  interactive?: boolean;
}

/** The single intake record (mirrors the backend Intake entity, decision B). */
export interface Intake {
  intakeId: string;
  slug: string;
  flow: FlowKind;
  status: IntakeStatus;
  steps: PullStep[];
  profile: MockProfile;
  // Loan-intent fields (rate_range / full_application only):
  product?: WLProduct;
  amount?: number;
  purpose?: string;
  /** Whether credit was actually pulled (drives the LO view + display). */
  creditPulled?: boolean;
  /** No-credit rate band; present for rate_range only. */
  range?: RateRange | null;
  ltv?: number | null;
  dti?: number | null;
  applicationId?: string;
}

export interface StartIntakeInput {
  slug: string;
  flow: FlowKind;
  applicant: { fullName: string; email: string; phone?: string };
  /** Loan flows: */
  product?: WLProduct;
  amount?: number;
  purpose?: string;
  /** data_only: modules the requester chose to pull. */
  modules?: string[];
}

export type SubmitResult =
  | { terminal: 'routeToLo' }
  | { terminal: 'rateRange'; range: RateRange }
  | { terminal: 'decision'; status: 'under_review' };

/** Borrower contact info captured by the LO when requesting verification. */
export interface VerifyApplicant {
  fullName: string;
  email: string;
  phone?: string;
}

/** Data a verification link resolves to (drives the data_only journey). */
export interface VerifyRequestData {
  slug: string;
  modules: string[];
  applicant: VerifyApplicant;
}

/** What selecting a term returns: only the rate fields change, and the server
 * deliberately does not echo back PII (the caller already holds the profile). */
export type TermUpdate = Pick<Intake, 'intakeId' | 'status' | 'range' | 'dti'>;

export interface WhiteLabelClient {
  /** Create the intake and run enrichment (mock returns it ready). */
  startIntake(input: StartIntakeInput): Promise<Intake>;
  /** Rate flows: choose a term, recompute the offered rate. Returns rate fields only. */
  selectTerm(intakeId: string, termMonths: number): Promise<TermUpdate>;
  /** Reach the flow's terminal (route to LO, show range, or submit for decision). */
  submit(intakeId: string): Promise<SubmitResult>;
  /** LO "send a link": store a verification request, return an opaque token. */
  createVerifyRequest(input: { slug: string; modules: string[]; applicant: VerifyApplicant }): Promise<{ token: string }>;
  /** Resolve a verification token to the journey prefill, or null if invalid/expired. */
  getVerifyRequest(token: string): Promise<VerifyRequestData | null>;
}

/** Default module -> provider/label mapping for product-agnostic data_only pulls. */
export const MODULE_PROVIDERS: Record<string, Omit<PullStep, 'module'>> = {
  identity: { provider: 'Socure', label: 'Verifying your identity' },
  contact: { provider: 'Socure', label: 'Confirming contact details' },
  employment: { provider: 'Truework', label: 'Verifying income & employment' },
  residence: { provider: 'Melissa', label: 'Verifying your property' },
  financial: { provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
  credit: { provider: 'Experian', label: 'Checking your credit profile' },
};
