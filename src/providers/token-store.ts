import { keys, putItem, getItem, queryItems, deleteItem } from '../store/base-store.js';
import { encryptField, decryptField } from '../crypto/encryption.js';
import { getOrCreateDek } from '../store/user-store.js';
import { kmsService } from '../crypto/kms.js';
import { createChildLogger } from '../logger.js';
import type { EncryptedField } from '../crypto/types.js';

const log = createChildLogger({ module: 'token-store' });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProviderToken {
  userId: string;
  provider: string;
  tokenType: string;
  value: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Key builder
// ---------------------------------------------------------------------------

/** PK: USER#<userId>, SK: PROVIDERTOKEN#<provider>#<tokenType> */
function tokenKey(userId: string, provider: string, tokenType: string) {
  return {
    PK: `USER#${userId}`,
    SK: `PROVIDERTOKEN#${provider}#${tokenType}`,
  };
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

export async function storeProviderToken(
  token: Omit<ProviderToken, 'createdAt' | 'updatedAt'>,
): Promise<void> {
  const { plaintextDek, encryptedDek } = await getOrCreateDek(token.userId);
  const encryptedValue = encryptField(plaintextDek, token.value);
  const now = new Date().toISOString();

  const key = tokenKey(token.userId, token.provider, token.tokenType);

  // Check if record already exists (to preserve createdAt)
  const existing = await getItem(key);
  const createdAt = existing ? (existing.createdAt as string) : now;

  await putItem({
    ...key,
    userId: token.userId,
    provider: token.provider,
    tokenType: token.tokenType,
    encryptedValue,
    encryptedDek,
    expiresAt: token.expiresAt,
    metadata: token.metadata,
    createdAt,
    updatedAt: now,
  });

  log.debug(
    { userId: token.userId, provider: token.provider, tokenType: token.tokenType },
    'Stored provider token',
  );
}

export async function getProviderToken(
  userId: string,
  provider: string,
  tokenType: string,
): Promise<ProviderToken | null> {
  const key = tokenKey(userId, provider, tokenType);
  const item = await getItem(key);
  if (!item) return null;

  const encryptedDekBase64 = item.encryptedDek as string;
  const encryptedDekBuffer = Buffer.from(encryptedDekBase64, 'base64');
  const plaintextDek = await kmsService.decryptDataKey(encryptedDekBuffer, userId);

  const decryptedValue = decryptField(
    plaintextDek,
    item.encryptedValue as EncryptedField,
  ) as string;

  return {
    userId: item.userId as string,
    provider: item.provider as string,
    tokenType: item.tokenType as string,
    value: decryptedValue,
    expiresAt: item.expiresAt as string | undefined,
    metadata: item.metadata as Record<string, unknown> | undefined,
    createdAt: item.createdAt as string,
    updatedAt: item.updatedAt as string,
  };
}

/**
 * Get all tokens of a given type prefix for a provider (e.g., all "access_token" entries for "plaid").
 * Supports multi-institution: tokenType can be "access_token#item1", "access_token#item2", etc.
 */
export async function getProviderTokensByPrefix(
  userId: string,
  provider: string,
  tokenTypePrefix: string,
): Promise<ProviderToken[]> {
  const skPrefix = `PROVIDERTOKEN#${provider}#${tokenTypePrefix}`;
  const result = await queryItems({
    pk: `USER#${userId}`,
    skPrefix,
  });

  if (result.items.length === 0) return [];

  const dekCache = new Map<string, Buffer>();
  const tokens: ProviderToken[] = [];

  for (const item of result.items) {
    const encryptedDekBase64 = item.encryptedDek as string;
    let plaintextDek = dekCache.get(encryptedDekBase64);
    if (!plaintextDek) {
      const encryptedDekBuffer = Buffer.from(encryptedDekBase64, 'base64');
      plaintextDek = await kmsService.decryptDataKey(encryptedDekBuffer, userId);
      dekCache.set(encryptedDekBase64, plaintextDek);
    }

    const decryptedValue = decryptField(
      plaintextDek,
      item.encryptedValue as EncryptedField,
    ) as string;

    tokens.push({
      userId: item.userId as string,
      provider: item.provider as string,
      tokenType: item.tokenType as string,
      value: decryptedValue,
      expiresAt: item.expiresAt as string | undefined,
      metadata: item.metadata as Record<string, unknown> | undefined,
      createdAt: item.createdAt as string,
      updatedAt: item.updatedAt as string,
    });
  }

  return tokens;
}

export async function deleteProviderTokens(
  userId: string,
  provider?: string,
): Promise<void> {
  const skPrefix = provider
    ? `PROVIDERTOKEN#${provider}#`
    : 'PROVIDERTOKEN#';

  const result = await queryItems({
    pk: `USER#${userId}`,
    skPrefix,
  });

  for (const item of result.items) {
    await deleteItem({
      PK: item.PK as string,
      SK: item.SK as string,
    });
  }

  log.debug(
    { userId, provider, deleted: result.items.length },
    'Deleted provider tokens',
  );
}

export async function listProviderTokens(
  userId: string,
): Promise<ProviderToken[]> {
  const result = await queryItems({
    pk: `USER#${userId}`,
    skPrefix: 'PROVIDERTOKEN#',
  });

  if (result.items.length === 0) return [];

  // Each token may have been encrypted with a different DEK (depending on
  // whether MODULE# records existed when it was stored), so decrypt each
  // token with its own encryptedDek.
  const dekCache = new Map<string, Buffer>();
  const tokens: ProviderToken[] = [];

  for (const item of result.items) {
    const encryptedDekBase64 = item.encryptedDek as string;
    let plaintextDek = dekCache.get(encryptedDekBase64);
    if (!plaintextDek) {
      const encryptedDekBuffer = Buffer.from(encryptedDekBase64, 'base64');
      plaintextDek = await kmsService.decryptDataKey(encryptedDekBuffer, userId);
      dekCache.set(encryptedDekBase64, plaintextDek);
    }

    const decryptedValue = decryptField(
      plaintextDek,
      item.encryptedValue as EncryptedField,
    ) as string;

    tokens.push({
      userId: item.userId as string,
      provider: item.provider as string,
      tokenType: item.tokenType as string,
      value: decryptedValue,
      expiresAt: item.expiresAt as string | undefined,
      metadata: item.metadata as Record<string, unknown> | undefined,
      createdAt: item.createdAt as string,
      updatedAt: item.updatedAt as string,
    });
  }

  return tokens;
}
