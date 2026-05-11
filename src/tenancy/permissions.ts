import { VerificationTier } from '../types.js';
import { getModule } from '../modules/registry.js';
import type { Tenant, TenantPermission } from './types.js';

// ---------------------------------------------------------------------------
// Production-eligibility gate
// ---------------------------------------------------------------------------

/**
 * Required diligence artifacts before a tenant may receive a production API key.
 * Maps to the answers given to Plaid in
 * docs/compliance/plaid-1033-customer-onboarding.md.
 */
export interface ProductionEligibilityResult {
  eligible: boolean;
  missing: string[];
  stale: string[];
}

const STALE_DAYS = 365; // annual recertification cadence

function olderThan(iso: string | undefined, days: number): boolean {
  if (!iso) return true;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return true;
  return Date.now() - then > days * 24 * 60 * 60 * 1000;
}

/**
 * Check whether a tenant satisfies the §1033 / FFIEC TPRM diligence
 * requirements needed to issue a production API key.
 */
export function isProductionEligible(tenant: Tenant): ProductionEligibilityResult {
  const missing: string[] = [];
  const stale: string[] = [];

  const hasCharter =
    Boolean(tenant.fdicCertNumber) ||
    Boolean(tenant.occCharterNumber) ||
    Boolean(tenant.ncuaCharterNumber) ||
    Boolean(tenant.stateCharter);
  if (!hasCharter) missing.push('charter (FDIC, OCC, NCUA, or state)');

  if (!tenant.ein) missing.push('ein');
  if (!tenant.primaryRegulator) missing.push('primaryRegulator');
  if (!tenant.beneficialOwners || tenant.beneficialOwners.length === 0) {
    missing.push('beneficialOwners');
  }

  if (!tenant.agreementSignedAt) missing.push('agreementSignedAt');
  if (!tenant.agreementVersionId) missing.push('agreementVersionId');
  if (!tenant.agreementSignerName) missing.push('agreementSignerName');
  if (!tenant.agreementSignerTitle) missing.push('agreementSignerTitle');

  if (!tenant.permissiblePurposes || tenant.permissiblePurposes.length === 0) {
    missing.push('permissiblePurposes');
  }
  if (!tenant.permissiblePurposeAttestedAt) missing.push('permissiblePurposeAttestedAt');

  if (!tenant.sanctionsScreenedAt) {
    missing.push('sanctionsScreenedAt');
  } else if (olderThan(tenant.sanctionsScreenedAt, STALE_DAYS)) {
    stale.push('sanctionsScreenedAt');
  }
  if (tenant.sanctionsScreenResult && tenant.sanctionsScreenResult !== 'clear') {
    missing.push(`sanctionsScreenResult (current=${tenant.sanctionsScreenResult})`);
  }

  if (!tenant.chartersVerifiedAt) {
    missing.push('chartersVerifiedAt');
  } else if (olderThan(tenant.chartersVerifiedAt, STALE_DAYS)) {
    stale.push('chartersVerifiedAt');
  }

  if (!tenant.securityReviewCompletedAt) missing.push('securityReviewCompletedAt');
  if (!tenant.insuranceVerifiedAt) missing.push('insuranceVerifiedAt');

  if (tenant.nextRecertificationDue && Date.parse(tenant.nextRecertificationDue) < Date.now()) {
    stale.push('nextRecertificationDue');
  }

  return {
    eligible: missing.length === 0 && stale.length === 0,
    missing,
    stale,
  };
}

/**
 * Filter module data based on the user's verified tier.
 * Removes fields that require a higher tier than the session has.
 *
 * If the module is not found in the registry (unknown module),
 * all data is returned unfiltered.
 */
export function filterByTier(
  moduleName: string,
  data: Record<string, unknown>,
  verifiedTier: VerificationTier,
): Record<string, unknown> {
  const moduleDef = getModule(moduleName);
  if (!moduleDef) return data;

  const filtered: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(data)) {
    const fieldDef = moduleDef.fields[field];
    // If the field isn't in the schema, include it (backwards compat).
    // If the field's tier is at or below the session tier, include it.
    if (!fieldDef || fieldDef.tier <= verifiedTier) {
      filtered[field] = value;
    }
  }
  return filtered;
}

/**
 * Determine the highest tier needed to access all requested modules.
 *
 * Checks both tenant-level permissions and the individual field
 * definitions within each module schema.
 */
export function getRequiredTier(
  modules: string[],
  tenantPermissions: TenantPermission[],
): VerificationTier {
  let maxTier = VerificationTier.None;

  for (const mod of modules) {
    // Check tenant-level permission for this module
    const perm = tenantPermissions.find((p) => p.module === mod);
    if (perm && perm.requiredTier > maxTier) {
      maxTier = perm.requiredTier;
    }

    // Check individual field definitions for the highest tier
    const moduleDef = getModule(mod);
    if (moduleDef) {
      for (const field of Object.values(moduleDef.fields)) {
        if (field.tier > maxTier) {
          maxTier = field.tier;
        }
      }
    }
  }

  return maxTier;
}
