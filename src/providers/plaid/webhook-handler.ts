import crypto from 'node:crypto';
import { decodeProtectedHeader, importJWK, jwtVerify } from 'jose';
import { getPlaidBaseUrl } from './config.js';
import { createChildLogger } from '../../logger.js';
import type { WebhookHandler, WebhookEvent } from '../../webhooks/types.js';

const log = createChildLogger({ module: 'plaid-webhook' });

// ---------------------------------------------------------------------------
// Plaid webhook payload types
// ---------------------------------------------------------------------------

interface PlaidWebhookPayload {
  webhook_type: string;           // "TRANSACTIONS", "ITEM", "AUTH", etc.
  webhook_code: string;           // "DEFAULT_UPDATE", "INITIAL_UPDATE", etc.
  item_id: string;
  new_transactions?: number;
  removed_transactions?: string[];
  error?: { error_code: string; error_message: string } | null;
}

// ---------------------------------------------------------------------------
// Plaid JWKS key cache
// ---------------------------------------------------------------------------

type JWKKey = Awaited<ReturnType<typeof importJWK>>;

interface CachedKey {
  key: JWKKey;
  expiresAt: number;
}

const keyCache = new Map<string, CachedKey>();
const KEY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch a Plaid webhook verification key by kid.
 * Uses the Plaid API endpoint /webhook_verification_key/get.
 * Caches keys for 24 hours.
 */
async function getPlaidVerificationKey(kid: string): Promise<JWKKey> {
  const cached = keyCache.get(kid);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.key;
  }

  const clientId = process.env.PROVIDER_PLAID_CLIENT_ID;
  const secret = process.env.PROVIDER_PLAID_SECRET;

  if (!clientId || !secret) {
    throw new Error('Missing PROVIDER_PLAID_CLIENT_ID or PROVIDER_PLAID_SECRET for webhook verification');
  }

  const baseUrl = getPlaidBaseUrl();
  const res = await fetch(`${baseUrl}/webhook_verification_key/get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, secret, key_id: kid }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to fetch Plaid verification key: ${res.status} ${(err as Record<string, unknown>).error_message ?? ''}`);
  }

  const data = await res.json() as { key: { alg: string; crv: string; kid: string; kty: string; use: string; x: string; y: string } };
  const jwk = data.key;

  // Import the JWK as a KeyLike for jose
  const keyObject = await importJWK(jwk, 'ES256');

  // Cache it
  keyCache.set(kid, {
    key: keyObject,
    expiresAt: Date.now() + KEY_CACHE_TTL,
  });

  return keyObject;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const plaidWebhookHandler: WebhookHandler = {
  provider: 'plaid',

  async validate(headers, body): Promise<boolean> {
    const jwt = headers['plaid-verification'];

    if (!jwt) {
      log.warn('Missing Plaid-Verification header');
      return false;
    }

    try {
      // 1. Decode the JWT header to get the kid
      const protectedHeader = decodeProtectedHeader(jwt);
      const kid = protectedHeader.kid;
      if (!kid) {
        log.warn('Plaid-Verification JWT missing kid in header');
        return false;
      }

      // 2. Fetch the verification key from Plaid
      const key = await getPlaidVerificationKey(kid);

      // 3. Verify the JWT signature
      const { payload } = await jwtVerify(jwt, key, {
        algorithms: ['ES256'],
        maxTokenAge: '5 minutes',
      });

      // 4. Verify the request body hash
      const claimedHash = payload.request_body_sha256 as string;
      if (!claimedHash) {
        log.warn('Plaid JWT missing request_body_sha256 claim');
        return false;
      }

      const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
      const actualHash = crypto
        .createHash('sha256')
        .update(rawBody)
        .digest('hex');

      if (claimedHash !== actualHash) {
        log.warn({ claimedHash, actualHash }, 'Plaid webhook body hash mismatch');
        return false;
      }

      return true;
    } catch (err) {
      log.warn({ err: String(err) }, 'Plaid webhook JWT verification failed');
      // In non-production, accept the webhook anyway for testing
      if (process.env.NODE_ENV !== 'production') {
        log.warn('Accepting unverified webhook in non-production environment');
        return true;
      }
      return false;
    }
  },

  parse(body): WebhookEvent[] {
    const payload = body as PlaidWebhookPayload;
    const events: WebhookEvent[] = [];

    // We only process transaction-related webhooks for now
    if (payload.webhook_type !== 'TRANSACTIONS') {
      return events;
    }

    const userId = (payload as unknown as Record<string, unknown>).frodo_user_id as string | undefined;
    if (!userId) {
      return events;
    }

    switch (payload.webhook_code) {
      case 'INITIAL_UPDATE':
      case 'DEFAULT_UPDATE':
      case 'HISTORICAL_UPDATE':
        events.push({
          userId,
          module: 'financial',
          fields: {},
          metadata: {
            webhookType: payload.webhook_type,
            webhookCode: payload.webhook_code,
            itemId: payload.item_id,
            newTransactions: payload.new_transactions ?? 0,
            reEnrichModules: ['financial', 'buying-patterns'],
          },
        });
        break;

      case 'TRANSACTIONS_REMOVED':
        events.push({
          userId,
          module: 'buying-patterns',
          fields: {},
          metadata: {
            webhookType: payload.webhook_type,
            webhookCode: payload.webhook_code,
            removedTransactions: payload.removed_transactions ?? [],
            reEnrichModules: ['buying-patterns'],
          },
        });
        break;
    }

    return events;
  },
};
