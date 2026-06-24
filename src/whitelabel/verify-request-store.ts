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

export async function getVerifyRequest(token: string): Promise<VerifyRequest | undefined> {
  const item = await getItem(verifyKey(token));
  if (!item) return undefined;
  // Enforce the short-lived window at read time: DynamoDB TTL deletion is lazy
  // (can lag by hours), so an expired record may still be present. Treat it as
  // gone rather than honoring a stale link.
  const ttl = item.ttl as number | undefined;
  if (ttl && ttl < Math.floor(Date.now() / 1000)) {
    log.debug({ token }, 'Verify request expired');
    return undefined;
  }

  const encryptedDek = Buffer.from(item.encryptedDek as string, 'base64');
  const plaintextDek = await kmsService.decryptDataKey(encryptedDek, token);
  const applicant = decryptField(plaintextDek, item.encApplicant as EncryptedField) as VerifyRequest['applicant'];
  return {
    token,
    tenantId: item.tenantId as string,
    slug: item.slug as string,
    modules: (item.modules as ModuleName[]) ?? [],
    applicant,
    createdAt: item.createdAt as string,
  };
}
