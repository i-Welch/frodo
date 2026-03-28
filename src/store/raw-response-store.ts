import crypto from 'node:crypto';
import { putItem, queryItems } from './base-store.js';
import { encryptField, decryptField } from '../crypto/encryption.js';
import { getOrCreateDek } from './user-store.js';
import { kmsService } from '../crypto/kms.js';
import { createChildLogger } from '../logger.js';
import type { EncryptedField } from '../crypto/types.js';

const log = createChildLogger({ module: 'raw-response-store' });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RawProviderResponse {
  responseId: string;
  userId: string;
  provider: string;
  endpoint: string;
  method: string;
  statusCode: number;
  requestBody?: unknown;
  responseBody: unknown;
  durationMs: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Key builder
// ---------------------------------------------------------------------------

/** PK: USER#<userId>, SK: RAWRESPONSE#<provider>#<timestamp>#<responseId> */
function rawResponseKey(userId: string, provider: string, timestamp: string, responseId: string) {
  return {
    PK: `USER#${userId}`,
    SK: `RAWRESPONSE#${provider}#${timestamp}#${responseId}`,
  };
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/**
 * Store a raw provider API response, encrypted at rest with the user's DEK.
 * Fire and forget — errors are logged but don't block the enrichment.
 */
export async function storeRawResponse(
  userId: string,
  response: Omit<RawProviderResponse, 'responseId' | 'timestamp' | 'userId'>,
): Promise<void> {
  try {
    const responseId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const { plaintextDek, encryptedDek } = await getOrCreateDek(userId);

    // Encrypt the request and response bodies
    const encryptedRequestBody = response.requestBody !== undefined
      ? encryptField(plaintextDek, response.requestBody)
      : undefined;
    const encryptedResponseBody = encryptField(plaintextDek, response.responseBody);

    const key = rawResponseKey(userId, response.provider, timestamp, responseId);

    await putItem({
      ...key,
      responseId,
      userId,
      provider: response.provider,
      endpoint: response.endpoint,
      method: response.method,
      statusCode: response.statusCode,
      durationMs: response.durationMs,
      encryptedDek,
      encryptedRequestBody,
      encryptedResponseBody,
      timestamp,
    });

    log.debug(
      { userId, provider: response.provider, endpoint: response.endpoint, responseId },
      'Raw response stored',
    );
  } catch (err) {
    log.warn(
      { userId, provider: response.provider, error: String(err) },
      'Failed to store raw response (non-blocking)',
    );
  }
}

/**
 * List raw responses for a user, optionally filtered by provider.
 * Returns decrypted responses. For internal/developer use only.
 */
export async function listRawResponses(
  userId: string,
  provider?: string,
  limit?: number,
): Promise<RawProviderResponse[]> {
  const skPrefix = provider
    ? `RAWRESPONSE#${provider}#`
    : 'RAWRESPONSE#';

  const result = await queryItems({
    pk: `USER#${userId}`,
    skPrefix,
    limit: limit ?? 50,
    scanForward: false, // newest first
  });

  if (result.items.length === 0) return [];

  const responses: RawProviderResponse[] = [];

  for (const item of result.items) {
    try {
      const encryptedDekBase64 = item.encryptedDek as string;
      const encryptedDekBuffer = Buffer.from(encryptedDekBase64, 'base64');
      const plaintextDek = await kmsService.decryptDataKey(encryptedDekBuffer, userId);

      const responseBody = decryptField(
        plaintextDek,
        item.encryptedResponseBody as EncryptedField,
      );

      let requestBody: unknown = undefined;
      if (item.encryptedRequestBody) {
        requestBody = decryptField(
          plaintextDek,
          item.encryptedRequestBody as EncryptedField,
        );
      }

      responses.push({
        responseId: item.responseId as string,
        userId: item.userId as string,
        provider: item.provider as string,
        endpoint: item.endpoint as string,
        method: item.method as string,
        statusCode: item.statusCode as number,
        durationMs: item.durationMs as number,
        requestBody,
        responseBody,
        timestamp: item.timestamp as string,
      });
    } catch (err) {
      log.warn({ responseId: item.responseId, error: String(err) }, 'Failed to decrypt raw response');
    }
  }

  return responses;
}
