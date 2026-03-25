import { keys, gsiKeys, putItem, getItem, queryItems, deleteItem } from './base-store.js';
import type { TenantUserLink } from '../identity/types.js';

// ---------------------------------------------------------------------------
// Tenant-User link CRUD (main table)
// ---------------------------------------------------------------------------

/**
 * Create a tenant-user link in the main table.
 *
 * PK  = `TENANT#<tenantId>`, SK  = `USERLINK#<userId>`
 * GSI1PK = `USER#<userId>`,  GSI1SK = `TENANTLINK#<tenantId>`
 */
export async function createLink(link: TenantUserLink): Promise<void> {
  const key = keys.tenantUserLink(link.tenantId, link.userId);
  const gsi = gsiKeys.tenantsForUser(link.userId);

  await putItem({
    ...key,
    ...gsi,
    GSI1SK: `TENANTLINK#${link.tenantId}`,
    ...link,
  });
}

/**
 * Get a specific tenant-user link.
 */
export async function getLink(
  tenantId: string,
  userId: string,
): Promise<TenantUserLink | null> {
  const key = keys.tenantUserLink(tenantId, userId);
  const item = await getItem(key);
  if (!item) return null;

  return {
    tenantId: item.tenantId as string,
    userId: item.userId as string,
    providedIdentifiers: (item.providedIdentifiers as TenantUserLink['providedIdentifiers']) ?? {},
    createdAt: item.createdAt as string,
  };
}

/**
 * Get all tenants linked to a user (via GSI1).
 *
 * GSI1PK = `USER#<userId>`, GSI1SK begins_with `TENANTLINK#`
 */
export async function getTenantsForUser(
  userId: string,
): Promise<TenantUserLink[]> {
  const gsi = gsiKeys.tenantsForUser(userId);

  const result = await queryItems({
    pk: gsi.GSI1PK,
    skPrefix: 'TENANTLINK#',
    indexName: 'GSI1',
  });

  return result.items.map((item) => ({
    tenantId: item.tenantId as string,
    userId: item.userId as string,
    providedIdentifiers: (item.providedIdentifiers as TenantUserLink['providedIdentifiers']) ?? {},
    createdAt: item.createdAt as string,
  }));
}

/**
 * Get all users linked to a tenant (main table query).
 *
 * PK = `TENANT#<tenantId>`, SK begins_with `USERLINK#`
 */
export async function getUsersForTenant(
  tenantId: string,
): Promise<TenantUserLink[]> {
  const result = await queryItems({
    pk: `TENANT#${tenantId}`,
    skPrefix: 'USERLINK#',
  });

  return result.items.map((item) => ({
    tenantId: item.tenantId as string,
    userId: item.userId as string,
    providedIdentifiers: (item.providedIdentifiers as TenantUserLink['providedIdentifiers']) ?? {},
    createdAt: item.createdAt as string,
  }));
}

/**
 * Delete a tenant-user link.
 */
export async function deleteLink(
  tenantId: string,
  userId: string,
): Promise<void> {
  const key = keys.tenantUserLink(tenantId, userId);
  await deleteItem(key);
}
