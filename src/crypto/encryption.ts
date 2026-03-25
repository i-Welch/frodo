import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import type { EncryptedField } from './types.js';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;

/**
 * Encrypt a single value using AES-256-GCM with the provided DEK.
 * The value is JSON-stringified before encryption so any serialisable
 * type can be round-tripped.
 */
export function encryptField(
  plaintextDek: Buffer,
  value: unknown,
): EncryptedField {
  const plaintext = JSON.stringify(value);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, plaintextDek, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypt a single encrypted field back to its original value.
 */
export function decryptField(
  plaintextDek: Buffer,
  encrypted: EncryptedField,
): unknown {
  const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
  const iv = Buffer.from(encrypted.iv, 'base64');
  const authTag = Buffer.from(encrypted.authTag, 'base64');

  const decipher = createDecipheriv(ALGORITHM, plaintextDek, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}

/**
 * Encrypt multiple fields independently. Each field gets its own random IV.
 */
export function encryptFields(
  plaintextDek: Buffer,
  fields: Record<string, unknown>,
): Record<string, EncryptedField> {
  const result: Record<string, EncryptedField> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = encryptField(plaintextDek, value);
  }
  return result;
}

/**
 * Decrypt multiple encrypted fields.
 */
export function decryptFields(
  plaintextDek: Buffer,
  fields: Record<string, EncryptedField>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, encrypted] of Object.entries(fields)) {
    result[key] = decryptField(plaintextDek, encrypted);
  }
  return result;
}
