import { putItem, queryItems, deleteItem } from './base-store.js';

/**
 * Tenant membership: maps a Neon Auth user to a tenant with a role.
 *
 * PK = TENANT#<tenantId>, SK = MEMBER#<userId>
 * GSI1PK = MEMBER#<userId>, GSI1SK = TENANT#<tenantId>   (tenants for a user)
 */
export type TenantRole = 'admin' | 'loan_officer' | 'viewer';

export const TENANT_ROLES: readonly TenantRole[] = ['admin', 'loan_officer', 'viewer'];

export interface TenantMember {
  tenantId: string;
  userId: string;
  role: TenantRole;
  createdAt: string;
}

function hydrate(item: Record<string, unknown>): TenantMember {
  return {
    tenantId: item.tenantId as string,
    userId: item.userId as string,
    role: item.role as TenantRole,
    createdAt: item.createdAt as string,
  };
}

export async function addTenantMember(
  tenantId: string,
  userId: string,
  role: TenantRole,
): Promise<TenantMember> {
  const member: TenantMember = {
    tenantId,
    userId,
    role,
    createdAt: new Date().toISOString(),
  };
  await putItem({
    PK: `TENANT#${tenantId}`,
    SK: `MEMBER#${userId}`,
    GSI1PK: `MEMBER#${userId}`,
    GSI1SK: `TENANT#${tenantId}`,
    ...member,
  });
  return member;
}

export async function removeTenantMember(tenantId: string, userId: string): Promise<void> {
  await deleteItem({ PK: `TENANT#${tenantId}`, SK: `MEMBER#${userId}` });
}

export async function listTenantMembers(tenantId: string): Promise<TenantMember[]> {
  const result = await queryItems({ pk: `TENANT#${tenantId}`, skPrefix: 'MEMBER#' });
  return result.items.map(hydrate);
}

export async function listMembershipsForUser(userId: string): Promise<TenantMember[]> {
  const result = await queryItems({
    pk: `MEMBER#${userId}`,
    indexName: 'GSI1',
    skPrefix: 'TENANT#',
  });
  return result.items.map(hydrate);
}
