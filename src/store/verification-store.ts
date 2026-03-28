import crypto from 'node:crypto';
import { keys, putItem, getItem, queryItems } from './base-store.js';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamo-client.js';
import { createChildLogger } from '../logger.js';

const log = createChildLogger({ module: 'verification-store' });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VerificationStatus =
  | 'created'
  | 'form_sent'
  | 'form_started'
  | 'form_completed'
  | 'enriching'
  | 'complete';

export interface VerificationRequest {
  requestId: string;
  tenantId: string;
  userId: string;
  status: VerificationStatus;
  modules: string[];
  borrowerName?: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  formToken?: string;
  formUrl?: string;
  createdBy?: string;        // Clerk user ID or API key ID
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Key builders
// ---------------------------------------------------------------------------

/** PK: TENANT#<tenantId>, SK: VERIFICATION#<requestId> */
function verificationKey(tenantId: string, requestId: string) {
  return {
    PK: `TENANT#${tenantId}`,
    SK: `VERIFICATION#${requestId}`,
  };
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

export async function createVerification(
  params: Omit<VerificationRequest, 'requestId' | 'createdAt' | 'updatedAt'>,
): Promise<VerificationRequest> {
  const requestId = crypto.randomUUID();
  const now = new Date().toISOString();

  const verification: VerificationRequest = {
    ...params,
    requestId,
    createdAt: now,
    updatedAt: now,
  };

  const key = verificationKey(params.tenantId, requestId);

  await putItem({
    ...key,
    // GSI1 for looking up verifications by user
    GSI1PK: `USER#${params.userId}`,
    GSI1SK: `VERIFICATION#${now}`,
    ...verification,
  });

  log.debug(
    { requestId, tenantId: params.tenantId, userId: params.userId, status: params.status },
    'Verification request created',
  );

  return verification;
}

export async function getVerification(
  tenantId: string,
  requestId: string,
): Promise<VerificationRequest | null> {
  const key = verificationKey(tenantId, requestId);
  const item = await getItem(key);
  if (!item) return null;
  return itemToVerification(item);
}

export async function updateVerificationStatus(
  tenantId: string,
  requestId: string,
  status: VerificationStatus,
): Promise<void> {
  const key = verificationKey(tenantId, requestId);

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key,
      UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString(),
      },
    }),
  );

  log.debug({ requestId, tenantId, status }, 'Verification status updated');
}

export async function listVerifications(
  tenantId: string,
  options?: { limit?: number; cursor?: string; status?: VerificationStatus },
): Promise<{ verifications: VerificationRequest[]; cursor?: string }> {
  const result = await queryItems({
    pk: `TENANT#${tenantId}`,
    skPrefix: 'VERIFICATION#',
    limit: options?.limit ?? 50,
    cursor: options?.cursor,
    scanForward: false, // newest first
  });

  let verifications = result.items.map(itemToVerification);

  // Filter by status if specified (client-side — DynamoDB doesn't support filter on query efficiently)
  if (options?.status) {
    verifications = verifications.filter((v) => v.status === options.status);
  }

  return {
    verifications,
    cursor: result.cursor,
  };
}

export async function getVerificationStats(
  tenantId: string,
): Promise<{ total: number; byStatus: Record<string, number> }> {
  // Query all verifications for the tenant (may need pagination for large tenants)
  const allVerifications: VerificationRequest[] = [];
  let cursor: string | undefined;

  do {
    const result = await queryItems({
      pk: `TENANT#${tenantId}`,
      skPrefix: 'VERIFICATION#',
      cursor,
    });
    allVerifications.push(...result.items.map(itemToVerification));
    cursor = result.cursor;
  } while (cursor);

  const byStatus: Record<string, number> = {};
  for (const v of allVerifications) {
    byStatus[v.status] = (byStatus[v.status] ?? 0) + 1;
  }

  return { total: allVerifications.length, byStatus };
}

/**
 * Find the verification request associated with a form token.
 */
export async function getVerificationByFormToken(
  tenantId: string,
  formToken: string,
): Promise<VerificationRequest | null> {
  // This is a scan with filter — fine for now, could add a GSI later
  const result = await queryItems({
    pk: `TENANT#${tenantId}`,
    skPrefix: 'VERIFICATION#',
  });

  const item = result.items.find((i) => i.formToken === formToken);
  if (!item) return null;
  return itemToVerification(item);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function itemToVerification(item: Record<string, unknown>): VerificationRequest {
  return {
    requestId: item.requestId as string,
    tenantId: item.tenantId as string,
    userId: item.userId as string,
    status: item.status as VerificationStatus,
    modules: (item.modules as string[]) ?? [],
    borrowerName: item.borrowerName as string | undefined,
    borrowerEmail: item.borrowerEmail as string | undefined,
    borrowerPhone: item.borrowerPhone as string | undefined,
    formToken: item.formToken as string | undefined,
    formUrl: item.formUrl as string | undefined,
    createdBy: item.createdBy as string | undefined,
    createdAt: item.createdAt as string,
    updatedAt: item.updatedAt as string,
  };
}
