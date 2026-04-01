import {
  KMSClient,
  GenerateDataKeyCommand,
  DecryptCommand,
} from '@aws-sdk/client-kms';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { config } from '../config/app-config.js';
import { createChildLogger } from '../logger.js';

const log = createChildLogger({ module: 'kms' });

// ---------------------------------------------------------------------------
// Local fallback — deterministic static key derived from a fixed seed
// ---------------------------------------------------------------------------

const LOCAL_SEED = 'frodo-local-dev-static-kms-seed-do-not-use-in-prod';
const LOCAL_STATIC_KEY = createHash('sha256').update(LOCAL_SEED).digest(); // 32 bytes

function localEncrypt(plaintext: Buffer): {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
} {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', LOCAL_STATIC_KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { ciphertext, iv, authTag };
}

function localDecrypt(
  ciphertext: Buffer,
  iv: Buffer,
  authTag: Buffer,
): Buffer {
  const decipher = createDecipheriv('aes-256-gcm', LOCAL_STATIC_KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Pack local-encrypted DEK into a single buffer:
 * [1 byte ivLen][iv][16 bytes authTag][ciphertext]
 */
function packLocalEncrypted(encrypted: {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
}): Buffer {
  const ivLen = Buffer.alloc(1);
  ivLen.writeUInt8(encrypted.iv.length);
  return Buffer.concat([
    ivLen,
    encrypted.iv,
    encrypted.authTag,
    encrypted.ciphertext,
  ]);
}

/**
 * Unpack a local-encrypted DEK buffer.
 */
function unpackLocalEncrypted(packed: Buffer): {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
} {
  const ivLen = packed.readUInt8(0);
  const iv = packed.subarray(1, 1 + ivLen);
  const authTag = packed.subarray(1 + ivLen, 1 + ivLen + 16);
  const ciphertext = packed.subarray(1 + ivLen + 16);
  return { ciphertext, iv, authTag };
}

// ---------------------------------------------------------------------------
// Real KMS client
// ---------------------------------------------------------------------------

function createKmsClient(): KMSClient | null {
  if (config.kmsEndpoint === 'local') {
    return null;
  }

  const clientConfig: ConstructorParameters<typeof KMSClient>[0] = {};
  if (config.kmsEndpoint) {
    clientConfig.endpoint = config.kmsEndpoint;
  }

  return new KMSClient(clientConfig);
}

const kmsClient = createKmsClient();

// ---------------------------------------------------------------------------
// DEK cache — in-memory LRU with TTL
// ---------------------------------------------------------------------------

const dekCache = new Map<string, { key: Buffer; expiresAt: number }>();
const DEK_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEK_CACHE_MAX = 1000;

function getCachedDek(encryptedDek: Buffer): Buffer | null {
  const cacheKey = encryptedDek.toString('base64');
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

function setCachedDek(encryptedDek: Buffer, plaintextDek: Buffer): void {
  const cacheKey = encryptedDek.toString('base64');
  // Evict oldest entries if at capacity
  if (dekCache.size >= DEK_CACHE_MAX) {
    const firstKey = dekCache.keys().next().value!;
    dekCache.delete(firstKey);
  }
  dekCache.set(cacheKey, { key: plaintextDek, expiresAt: Date.now() + DEK_CACHE_TTL });
}

// ---------------------------------------------------------------------------
// Service API
// ---------------------------------------------------------------------------

export interface KmsGenerateResult {
  plaintextDek: Buffer;
  encryptedDek: Buffer;
}

async function generateDataKey(userId: string): Promise<KmsGenerateResult> {
  if (!kmsClient) {
    // Local fallback
    log.debug('Using local KMS fallback for generateDataKey');
    const plaintextDek = randomBytes(32);
    const encrypted = localEncrypt(plaintextDek);
    const encryptedDek = packLocalEncrypted(encrypted);
    return { plaintextDek, encryptedDek };
  }

  log.debug({ userId }, 'Generating data key via KMS');
  const response = await kmsClient.send(
    new GenerateDataKeyCommand({
      KeyId: config.kmsKeyId,
      KeySpec: 'AES_256',
      EncryptionContext: {
        userId,
        environment: config.nodeEnv,
      },
    }),
  );

  if (!response.Plaintext || !response.CiphertextBlob) {
    throw new Error('KMS GenerateDataKey returned empty response');
  }

  return {
    plaintextDek: Buffer.from(response.Plaintext),
    encryptedDek: Buffer.from(response.CiphertextBlob),
  };
}

async function decryptDataKey(
  encryptedDek: Buffer,
  userId: string,
): Promise<Buffer> {
  // Check cache first
  const cached = getCachedDek(encryptedDek);
  if (cached) {
    log.debug({ userId }, 'DEK cache hit');
    return cached;
  }

  let plaintext: Buffer;

  if (!kmsClient) {
    // Local fallback
    log.debug('Using local KMS fallback for decryptDataKey');
    const unpacked = unpackLocalEncrypted(encryptedDek);
    plaintext = localDecrypt(unpacked.ciphertext, unpacked.iv, unpacked.authTag);
  } else {
    log.debug({ userId }, 'Decrypting data key via KMS');
    const response = await kmsClient.send(
      new DecryptCommand({
        CiphertextBlob: encryptedDek,
        EncryptionContext: {
          userId,
          environment: config.nodeEnv,
        },
      }),
    );

    if (!response.Plaintext) {
      throw new Error('KMS Decrypt returned empty response');
    }

    plaintext = Buffer.from(response.Plaintext);
  }

  setCachedDek(encryptedDek, plaintext);
  return plaintext;
}

export const kmsService = {
  generateDataKey,
  decryptDataKey,
};
