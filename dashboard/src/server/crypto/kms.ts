import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { config } from '../config/app-config';
import { createChildLogger } from '../logger';

const log = createChildLogger({ module: 'kms' });

// ---------------------------------------------------------------------------
// Envelope encryption: a per-record data key (DEK) is wrapped with an
// application master key (MASTER_ENCRYPTION_KEY, base64-encoded 32 bytes).
// The userId + environment are bound as AES-GCM additional authenticated
// data, so a wrapped DEK only unwraps for the context it was created in.
// ---------------------------------------------------------------------------

const LOCAL_SEED = 'frodo-local-dev-static-master-key-do-not-use-in-prod';

function loadMasterKey(): Buffer {
  const raw = config.masterEncryptionKey;
  if (raw) {
    const key = Buffer.from(raw, 'base64');
    if (key.length !== 32) {
      throw new Error('MASTER_ENCRYPTION_KEY must be 32 bytes, base64-encoded');
    }
    return key;
  }
  if (['production', 'staging'].includes(config.nodeEnv)) {
    throw new Error('MASTER_ENCRYPTION_KEY is required in production and staging');
  }
  return createHash('sha256').update(LOCAL_SEED).digest();
}

let masterKey: Buffer | null = null;
function getMasterKey(): Buffer {
  masterKey ??= loadMasterKey();
  return masterKey;
}

function aad(userId: string): Buffer {
  return Buffer.from(JSON.stringify({ userId, environment: config.nodeEnv }));
}

/** Wrap a DEK: [1 byte ivLen][iv][16 bytes authTag][ciphertext] */
function wrap(dek: Buffer, userId: string): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getMasterKey(), iv);
  cipher.setAAD(aad(userId));
  const ciphertext = Buffer.concat([cipher.update(dek), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from([iv.length]), iv, authTag, ciphertext]);
}

function unwrap(packed: Buffer, userId: string): Buffer {
  const ivLen = packed.readUInt8(0);
  const iv = packed.subarray(1, 1 + ivLen);
  const authTag = packed.subarray(1 + ivLen, 1 + ivLen + 16);
  const ciphertext = packed.subarray(1 + ivLen + 16);
  const decipher = createDecipheriv('aes-256-gcm', getMasterKey(), iv);
  decipher.setAAD(aad(userId));
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// ---------------------------------------------------------------------------
// DEK cache — in-memory LRU with TTL
// ---------------------------------------------------------------------------

const dekCache = new Map<string, { key: Buffer; expiresAt: number }>();
const DEK_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEK_CACHE_MAX = 1000;

function cacheKeyFor(encryptedDek: Buffer, userId: string): string {
  return `${userId}:${encryptedDek.toString('base64')}`;
}

function getCachedDek(encryptedDek: Buffer, userId: string): Buffer | null {
  const cacheKey = cacheKeyFor(encryptedDek, userId);
  const entry = dekCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    dekCache.delete(cacheKey);
    return null;
  }
  // Move to end for LRU behavior (Map preserves insertion order)
  dekCache.delete(cacheKey);
  dekCache.set(cacheKey, entry);
  return entry.key;
}

function setCachedDek(encryptedDek: Buffer, userId: string, plaintextDek: Buffer): void {
  if (dekCache.size >= DEK_CACHE_MAX) {
    const firstKey = dekCache.keys().next().value!;
    dekCache.delete(firstKey);
  }
  dekCache.set(cacheKeyFor(encryptedDek, userId), {
    key: plaintextDek,
    expiresAt: Date.now() + DEK_CACHE_TTL,
  });
}

// ---------------------------------------------------------------------------
// Service API
// ---------------------------------------------------------------------------

export interface KmsGenerateResult {
  plaintextDek: Buffer;
  encryptedDek: Buffer;
}

async function generateDataKey(userId: string): Promise<KmsGenerateResult> {
  log.debug({ userId }, 'Generating data key');
  const plaintextDek = randomBytes(32);
  return { plaintextDek, encryptedDek: wrap(plaintextDek, userId) };
}

async function decryptDataKey(encryptedDek: Buffer, userId: string): Promise<Buffer> {
  const cached = getCachedDek(encryptedDek, userId);
  if (cached) {
    log.debug({ userId }, 'DEK cache hit');
    return cached;
  }

  const plaintext = unwrap(encryptedDek, userId);
  setCachedDek(encryptedDek, userId, plaintext);
  return plaintext;
}

export const kmsService = {
  generateDataKey,
  decryptDataKey,
};
