import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamo-client.js';
import { keys, gsiKeys, putItem, getItem, queryItems, deleteItem } from './base-store.js';
import type { Tenant, StoredApiKey } from '../tenancy/types.js';

// ---------------------------------------------------------------------------
// Tenant CRUD
// ---------------------------------------------------------------------------

export async function createTenant(tenant: Tenant): Promise<void> {
  const key = keys.tenant(tenant.tenantId);
  const item: Record<string, unknown> = {
    ...key,
    ...tenant,
  };

  // Add GSI2 for Clerk org lookup if clerkOrgId is present
  if (tenant.clerkOrgId) {
    item.GSI2PK = `CLERKORG#${tenant.clerkOrgId}`;
    item.GSI2SK = `TENANT#${tenant.tenantId}`;
  }

  await putItem(item);
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const key = keys.tenant(tenantId);
  const item = await getItem(key);
  if (!item) return null;

  return {
    tenantId: item.tenantId as string,
    name: item.name as string,
    permissions: (item.permissions as Tenant['permissions']) ?? [],
    callbackUrls: (item.callbackUrls as string[]) ?? [],
    consentAddendum: item.consentAddendum as string | undefined,
    webhookUrl: item.webhookUrl as string | undefined,
    clerkOrgId: item.clerkOrgId as string | undefined,
    createdAt: item.createdAt as string,
  };
}

/**
 * Look up a tenant by its Clerk Organization ID.
 * Uses GSI2: GSI2PK = CLERKORG#<orgId>
 */
export async function getTenantByClerkOrgId(clerkOrgId: string): Promise<Tenant | null> {
  const result = await queryItems({
    pk: `CLERKORG#${clerkOrgId}`,
    indexName: 'GSI2',
    pkField: 'GSI2PK',
    skField: 'GSI2SK',
    limit: 1,
  });

  if (result.items.length === 0) return null;
  const item = result.items[0];

  return {
    tenantId: item.tenantId as string,
    name: item.name as string,
    permissions: (item.permissions as Tenant['permissions']) ?? [],
    callbackUrls: (item.callbackUrls as string[]) ?? [],
    consentAddendum: item.consentAddendum as string | undefined,
    webhookUrl: item.webhookUrl as string | undefined,
    clerkOrgId: item.clerkOrgId as string | undefined,
    createdAt: item.createdAt as string,
  };
}

export async function deleteTenant(tenantId: string): Promise<void> {
  const key = keys.tenant(tenantId);
  await deleteItem(key);
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

export async function lookupApiKeyByPrefix(
  prefix: string,
): Promise<StoredApiKey | null> {
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

export async function revokeApiKey(
  tenantId: string,
  keyId: string,
): Promise<void> {
  const key = keys.apiKey(tenantId, keyId);

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key,
      UpdateExpression: 'SET #active = :active',
      ExpressionAttributeNames: { '#active': 'active' },
      ExpressionAttributeValues: { ':active': false },
    }),
  );
}

export async function updateApiKeyLastUsed(
  tenantId: string,
  keyId: string,
): Promise<void> {
  const key = keys.apiKey(tenantId, keyId);

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key,
      UpdateExpression: 'SET #lastUsedAt = :lastUsedAt',
      ExpressionAttributeNames: { '#lastUsedAt': 'lastUsedAt' },
      ExpressionAttributeValues: { ':lastUsedAt': new Date().toISOString() },
    }),
  );
}
