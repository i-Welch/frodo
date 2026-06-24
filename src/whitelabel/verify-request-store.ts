import { randomBytes } from 'node:crypto';
import { putItem, getItem } from '../store/base-store.js';
import { encryptField, decryptField } from '../crypto/encryption.js';
import { kmsService } from '../crypto/kms.js';
import type { EncryptedField } from '../crypto/types.js';
import { createChildLogger } from '../logger.js';
import type { ModuleName, VerifyRequest } from './types.js';

const log = createChildLogger({ module: 'wl-verify-request-store' });

/**
 * DynamoDB-backed store for loan-officer verification requests (the "send a
 * link" feature). The link carries only an opaque token; the borrower's contact
 * info is encrypted at rest with a per-record KMS data key (same envelope scheme
 * as intake-store) and resolved server-side. Records are short-lived: a TTL
 * auto-expires them and reads enforce the window even before DynamoDB sweeps.
 *
 *   PK = VERIFYREQ#<token>   SK = METADATA
 */

const TTL_SECONDS = 48 * 60 * 60; // 48h: a sent verification link is short-lived

function verifyKey(token: string) {
  return { PK: `VERIFYREQ#${token}`, SK: 'METADATA' };
}

/** Opaque, unguessable token. base64url so it's URL-safe in a path segment. */
function newToken(): string {
  return `vr_${randomBytes(24).toString('base64url')}`;
}

export interface CreateVerifyRequestInput {
  tenantId: string;
  slug: string;
  modules: ModuleName[];
  applicant: { fullName: string; email: string; phone?: string };
}

export async function createVerifyRequest(input: CreateVerifyRequestInput): Promise<VerifyRequest> {
  const token = newToken();
  const createdAt = new Date().toISOString();
  const { plaintextDek, encryptedDek } = await kmsService.generateDataKey(token);
  const encApplicant = encryptField(plaintextDek, input.applicant);

  await putItem({
    ...verifyKey(token),
    token,
    tenantId: input.tenantId,
    slug: input.slug,
    modules: input.modules,
    createdAt,
    encryptedDek: encryptedDek.toString('base64'),
    encApplicant,
    ttl: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  });

  log.debug({ token, tenantId: input.tenantId, slug: input.slug }, 'Verify request created');
  return { token, tenantId: input.tenantId, slug: input.slug, modules: input.modules, applicant: input.applicant, createdAt };
}

export type ResolveResult =
  | { status: 'ok'; slug: string; modules: ModuleName[]; applicant: VerifyRequest['applicant'] }
  | { status: 'expired' }
  | { status: 'used_elsewhere' };

/**
 * Resolve a verification link, binding it to the first device that opens it.
 *
 * The link is single-use across devices: the first open binds the request to a
 * persistent, client-supplied `deviceId`. The same device can re-open and resume
 * for the life of the token (48h TTL), which covers "opened it, closed it, came
 * back five minutes later." Any other device (a forwarded link, a link pulled
 * from history on a different machine) is locked out once bound.
 */
export async function resolveVerifyRequest(token: string, deviceId: string): Promise<ResolveResult> {
  const item = await getItem(verifyKey(token));
  if (!item) return { status: 'expired' };
  // Read-time expiry: DynamoDB TTL deletion is lazy, so an expired record may
  // still be present. Treat it as gone.
  const ttl = item.ttl as number | undefined;
  if (ttl && ttl < Math.floor(Date.now() / 1000)) {
    log.debug({ token }, 'Verify request expired');
    return { status: 'expired' };
  }

  let bound = item.boundDeviceId as string | undefined;
  if (!bound) {
    // First open: bind to this device. Conditional so concurrent first-opens
    // don't both bind; re-puts the existing (encrypted) item plus the binding.
    try {
      await putItem(
        { ...item, boundDeviceId: deviceId },
        { conditionExpression: 'attribute_not_exists(boundDeviceId)' },
      );
      bound = deviceId;
    } catch (err) {
      if (err instanceof Error && err.name === 'ConditionalCheckFailedException') {
        const fresh = await getItem(verifyKey(token));
        bound = fresh?.boundDeviceId as string | undefined;
      } else {
        throw err;
      }
    }
  }
  if (bound !== deviceId) return { status: 'used_elsewhere' };

  const encryptedDek = Buffer.from(item.encryptedDek as string, 'base64');
  const plaintextDek = await kmsService.decryptDataKey(encryptedDek, token);
  const applicant = decryptField(plaintextDek, item.encApplicant as EncryptedField) as VerifyRequest['applicant'];
  return {
    status: 'ok',
    slug: item.slug as string,
    modules: (item.modules as ModuleName[]) ?? [],
    applicant,
  };
}
