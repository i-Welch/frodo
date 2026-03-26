import type { Duration, VerificationTier } from '../types.js';

export interface FormStep {
  /** Step title shown above the fields */
  title: string;
  /** Optional description shown below the title */
  description?: string;
  /** Fields for this step */
  fields: FormField[];
}

export interface FormDefinition {
  formId: string;
  title: string;
  type: 'data_collection' | 'identity_verification' | 'otp_verification';
  /** Flat field list — used for single-step forms (backwards compatible) */
  fields: FormField[];
  /** Multi-step form — when present, `fields` is ignored and each step defines its own fields */
  steps?: FormStep[];
  expiresIn?: Duration | null; // null = never expires, default 1 hour
}

export interface FormField {
  module: string;
  field: string;
  label: string;
  inputType: string; // standard types OR custom component name
  options?: { label: string; value: string }[];
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  /** Input mask (IMask format). Set to false to disable default mask. Auto-applied for ssn, phone, currency. */
  mask?: string | false;
  /** Custom component config — passed to the component renderer */
  componentConfig?: Record<string, unknown>;
}

export interface FormToken {
  token: string;
  formDefinition: FormDefinition;
  userId: string;
  tenantId: string;
  callbackUrl?: string;
  requestedModules?: string[];
  requiredTier?: VerificationTier;
  createdAt: string;
  expiresAt: string | null; // null = never
  /** OTP state if applicable */
  otpState?: OtpState;
  /** Current step index for multi-step forms (0-based). Undefined = single-step form. */
  currentStep?: number;
}

export interface OtpState {
  hashedOtp: string;
  channel: 'email' | 'phone';
  attempts: number;
  expiresAt: string;
  /** For tier 2, track which channels have been verified */
  verifiedChannels?: ('email' | 'phone')[];
}

/**
 * Custom field component registration.
 * Allows extending the forms system with custom input types
 * (e.g., SmartyStreets address autocomplete, Plaid account selector).
 */
export interface CustomFieldComponent {
  /** Unique component name (used as inputType in FormField) */
  name: string;
  /** Description for documentation */
  description: string;
  /**
   * Render the field HTML. Receives the field definition and returns an HTML string.
   * Should use HTMX attributes for interactivity.
   */
  render(field: FormField, formToken: string): string;
  /**
   * Validate the submitted value. Return null if valid, error message if invalid.
   */
  validate(value: unknown, field: FormField): string | null;
  /**
   * Extract/transform the submitted value before storing.
   * For example, a SmartyStreets component might submit a raw address string
   * but extract structured { street, city, state, zip } after validation.
   */
  transformValue?(value: unknown, field: FormField): unknown;
}
