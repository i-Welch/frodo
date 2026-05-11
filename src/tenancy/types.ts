import type { VerificationTier } from '../types.js';

export interface Tenant {
  tenantId: string;
  name: string;
  permissions: TenantPermission[];
  callbackUrls: string[];
  consentAddendum?: string;
  webhookUrl?: string;
  clerkOrgId?: string;
  createdAt: string; // ISO date

  // ---------------------------------------------------------------------
  // §1033 / FFIEC TPRM / GLBA Safeguards Rule diligence fields
  //
  // Required to be populated before a production API key may be issued.
  // See isProductionEligible() in src/tenancy/permissions.ts.
  // ---------------------------------------------------------------------

  /** Legal entity identifiers — at least one charter number must be present. */
  fdicCertNumber?: string;
  occCharterNumber?: string;
  ncuaCharterNumber?: string;
  stateCharter?: string;
  ein?: string;
  lei?: string;
  primaryRegulator?: 'FDIC' | 'OCC' | 'NCUA' | 'FRB' | 'STATE';

  /** Beneficial owners disclosed at onboarding (FinCEN CDD-style). */
  beneficialOwners?: BeneficialOwner[];

  /** Customer Agreement execution record. */
  agreementVersionId?: string;
  agreementSignedAt?: string; // ISO date
  agreementSignerName?: string;
  agreementSignerTitle?: string;

  /** Permissible-purpose attestation captured at agreement execution. */
  permissiblePurposes?: string[];
  permissiblePurposeAttestedAt?: string; // ISO date

  /** OFAC / SDN / Consolidated Sanctions screening result. */
  sanctionsScreenedAt?: string; // ISO date
  sanctionsScreenResult?: 'clear' | 'hit' | 'review';

  /** Charter and good-standing verification record. */
  chartersVerifiedAt?: string; // ISO date

  /** Security review (SOC 2 review, questionnaire) record. */
  securityReviewCompletedAt?: string; // ISO date

  /** Insurance evidence (cyber + professional liability) record. */
  insuranceVerifiedAt?: string; // ISO date

  /** Annual recertification cadence. */
  nextRecertificationDue?: string; // ISO date
}

export interface BeneficialOwner {
  name: string;
  title?: string;
  ownershipPercent?: number;
  sanctionsScreenResult?: 'clear' | 'hit' | 'review';
}

export interface TenantPermission {
  module: string;
  requiredTier: VerificationTier;
}

export interface StoredApiKey {
  keyId: string;
  tenantId: string;
  prefix: string; // first 8 chars of the random part, for GSI lookup
  hash: string; // SHA-256 of the full raw key
  environment: 'sandbox' | 'production';
  active: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface GeneratedApiKey {
  keyId: string;
  rawKey: string; // only returned once at creation time
  environment: 'sandbox' | 'production';
}
