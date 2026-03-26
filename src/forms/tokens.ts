import crypto from 'node:crypto';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../store/dynamo-client.js';
import { keys, putItem, getItem, deleteItem } from '../store/base-store.js';
import { durationToMs } from '../types.js';
import { createChildLogger } from '../logger.js';
import type { FormDefinition, FormToken } from './types.js';
import type { VerificationTier } from '../types.js';

const log = createChildLogger({ module: 'form-tokens' });

/** Default form expiry: 1 hour. */
const DEFAULT_EXPIRY_MS = 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a form token and persist it to DynamoDB.
 * Returns the raw token string.
 */
export async function createFormToken(params: {
  formDefinition: FormDefinition;
  userId: string;
  tenantId: string;
  callbackUrl?: string;
  requestedModules?: string[];
  requiredTier?: VerificationTier;
}): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date();

  // Calculate expiry
  let expiresAt: string | null;
  if (params.formDefinition.expiresIn === null) {
    // Explicitly null = never expires
    expiresAt = null;
  } else if (params.formDefinition.expiresIn) {
    const ms = durationToMs(params.formDefinition.expiresIn);
    expiresAt = ms > 0 ? new Date(now.getTime() + ms).toISOString() : new Date(now.getTime() + DEFAULT_EXPIRY_MS).toISOString();
  } else {
    // undefined = default 1 hour
    expiresAt = new Date(now.getTime() + DEFAULT_EXPIRY_MS).toISOString();
  }

  const formToken: FormToken = {
    token,
    formDefinition: params.formDefinition,
    userId: params.userId,
    tenantId: params.tenantId,
    callbackUrl: params.callbackUrl,
    requestedModules: params.requestedModules,
    requiredTier: params.requiredTier,
    createdAt: now.toISOString(),
    expiresAt,
  };

  const key = keys.formToken(token);

  const item: Record<string, unknown> = {
    ...key,
    ...formToken,
  };

  // Set DynamoDB TTL if the token expires
  if (expiresAt) {
    item.ttl = Math.floor(new Date(expiresAt).getTime() / 1000);
  }

  await putItem(item);

  log.debug(
    { token: token.slice(0, 8), userId: params.userId, expiresAt },
    'Form token created',
  );

  return token;
}

/**
 * Retrieve a form token. Returns null if the token does not exist
 * or has expired.
 */
export async function getFormToken(token: string): Promise<FormToken | null> {
  const key = keys.formToken(token);
  const item = await getItem(key);
  if (!item) return null;

  const expiresAt = (item.expiresAt as string | null) ?? null;

  // Check expiry (DynamoDB TTL deletion is eventually consistent)
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    log.debug({ token: token.slice(0, 8) }, 'Form token expired');
    return null;
  }

  return {
    token: item.token as string,
    formDefinition: item.formDefinition as FormToken['formDefinition'],
    userId: item.userId as string,
    tenantId: item.tenantId as string,
    callbackUrl: item.callbackUrl as string | undefined,
    requestedModules: item.requestedModules as string[] | undefined,
    requiredTier: item.requiredTier as VerificationTier | undefined,
    createdAt: item.createdAt as string,
    expiresAt,
    otpState: item.otpState as FormToken['otpState'],
    currentStep: item.currentStep as number | undefined,
  };
}

/**
 * Update fields on an existing form token (e.g. storing OTP state).
 */
export async function updateFormToken(
  token: string,
  updates: Partial<FormToken>,
): Promise<void> {
  const key = keys.formToken(token);

  const expressionParts: string[] = [];
  const expressionNames: Record<string, string> = {};
  const expressionValues: Record<string, unknown> = {};

  let idx = 0;
  for (const [field, value] of Object.entries(updates)) {
    if (field === 'token') continue; // don't overwrite the key
    if (value === undefined) continue; // skip undefined values
    const alias = `#f${idx}`;
    const valAlias = `:v${idx}`;
    expressionNames[alias] = field;
    expressionValues[valAlias] = value;
    expressionParts.push(`${alias} = ${valAlias}`);
    idx++;
  }

  if (expressionParts.length === 0) return;

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key,
      UpdateExpression: `SET ${expressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionNames,
      ExpressionAttributeValues: expressionValues,
    }),
  );

  log.debug({ token: token.slice(0, 8) }, 'Form token updated');
}

/**
 * Delete a form token.
 */
export async function deleteFormToken(token: string): Promise<void> {
  const key = keys.formToken(token);
  await deleteItem(key);
  log.debug({ token: token.slice(0, 8) }, 'Form token deleted');
}
