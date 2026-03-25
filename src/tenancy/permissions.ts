import { VerificationTier } from '../types.js';
import { getModule } from '../modules/registry.js';
import type { TenantPermission } from './types.js';

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
