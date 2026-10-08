import {
  keys,
  gsiKeys,
  putItem,
  getItem,
  queryItems,
  deleteItem,
  updateItem,
  scanItems,
} from './base-store';
import type { Tenant, StoredApiKey } from '../tenancy/types';

// ---------------------------------------------------------------------------
// Tenant CRUD
// ---------------------------------------------------------------------------

/**
 * Diligence fields populated through PATCH /api/v1/tenants/:id and
 * checked by isProductionEligible() before issuing a production API key.
 * Keep this list in sync with the Tenant type in src/tenancy/types.ts.
 */
const DILIGENCE_FIELDS = [
  'fdicCertNumber',
  'occCharterNumber',
  'ncuaCharterNumber',
  'stateCharter',
  'ein',
  'lei',
  'primaryRegulator',
  'beneficialOwners',
  'agreementVersionId',
  'agreementSignedAt',
  'agreementSignerName',
  'agreementSignerTitle',
  'permissiblePurposes',
  'permissiblePurposeAttestedAt',
  'sanctionsScreenedAt',
  'sanctionsScreenResult',
  'chartersVerifiedAt',
  'securityReviewCompletedAt',
  'insuranceVerifiedAt',
  'nextRecertificationDue',
] as const;

function hydrateTenant(item: Record<string, unknown>): Tenant {
  const tenant: Tenant = {
    tenantId: item.tenantId as string,
    name: item.name as string,
    permissions: (item.permissions as Tenant['permissions']) ?? [],
    callbackUrls: (item.callbackUrls as string[]) ?? [],
    consentAddendum: item.consentAddendum as string | undefined,
    webhookUrl: item.webhookUrl as string | undefined,
    createdAt: item.createdAt as string,
  };
  for (const field of DILIGENCE_FIELDS) {
    if (item[field] !== undefined) {
      (tenant as unknown as Record<string, unknown>)[field] = item[field];
    }
  }
  return tenant;
}

export async function createTenant(tenant: Tenant): Promise<void> {
  const key = keys.tenant(tenant.tenantId);
  const item: Record<string, unknown> = {
    ...key,
    ...tenant,
  };

  await putItem(item);
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const key = keys.tenant(tenantId);
  const item = await getItem(key);
  if (!item) return null;

  return hydrateTenant(item);
}

/**
 * Patch tenant diligence fields. Only updates fields present in `patch`.
 */
export async function updateTenant(tenantId: string, patch: Partial<Tenant>): Promise<void> {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return;

  await updateItem(keys.tenant(tenantId), Object.fromEntries(entries));
}

export async function deleteTenant(tenantId: string): Promise<void> {
  const key = keys.tenant(tenantId);
  await deleteItem(key);
}

/**
 * Scan all tenants. Intended for low-frequency ops jobs (recertification
 * checks, audits) — bank cardinality is small, so a Scan is acceptable.
 */
export async function listTenants(): Promise<Tenant[]> {
  const items = await scanItems({ pkPrefix: 'TENANT#', sk: 'METADATA' });
  return items.map(hydrateTenant);
}

// ---------------------------------------------------------------------------
// API Key CRUD
// ---------------------------------------------------------------------------

export async function storeApiKey(apiKey: StoredApiKey): Promise<void> {
  const key = keys.apiKey(apiKey.tenantId, apiKey.keyId);
  const gsi = gsiKeys.apiKeyPrefix(apiKey.prefix);

  await putItem({
    ...key,
    ...gsi,
    GSI1SK: `APIKEY#${apiKey.keyId}`,
    ...apiKey,
  });
}

export async function lookupApiKeyByPrefix(prefix: string): Promise<StoredApiKey | null> {
  const gsi = gsiKeys.apiKeyPrefix(prefix);

  const result = await queryItems({
    pk: gsi.GSI1PK,
    indexName: 'GSI1',
    limit: 1,
  });

  if (result.items.length === 0) return null;

  const item = result.items[0];
  return {
    keyId: item.keyId as string,
    tenantId: item.tenantId as string,
    prefix: item.prefix as string,
    hash: item.hash as string,
    environment: item.environment as 'sandbox' | 'production',
    active: item.active as boolean,
    createdAt: item.createdAt as string,
    lastUsedAt: item.lastUsedAt as string | undefined,
  };
}

export async function revokeApiKey(tenantId: string, keyId: string): Promise<void> {
  const key = keys.apiKey(tenantId, keyId);

  await updateItem(key, { active: false });
}

export async function updateApiKeyLastUsed(tenantId: string, keyId: string): Promise<void> {
  const key = keys.apiKey(tenantId, keyId);

  await updateItem(key, { lastUsedAt: new Date().toISOString() });
}
