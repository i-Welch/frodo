import { describe, it, expect } from 'vitest';
import { randomBytes } from 'crypto';
import {
  encryptField,
  decryptField,
  encryptFields,
  decryptFields,
} from '../../src/crypto/encryption.js';
import { kmsService } from '../../src/crypto/kms.js';
import type { EncryptedField } from '../../src/crypto/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a random 32-byte AES-256 key for testing. */
function randomDek(): Buffer {
  return randomBytes(32);
}

// ---------------------------------------------------------------------------
// encryptField / decryptField
// ---------------------------------------------------------------------------

describe('encryptField / decryptField', () => {
  it('round-trips a string', () => {
    const dek = randomDek();
    const original = 'hello, world!';

    const encrypted = encryptField(dek, original);
    const decrypted = decryptField(dek, encrypted);

    expect(decrypted).toBe(original);
  });

  it('round-trips a complex object', () => {
    const dek = randomDek();
    const original = { name: 'Alice', age: 30, address: { city: 'NYC' } };

    const encrypted = encryptField(dek, original);
    const decrypted = decryptField(dek, encrypted);

    expect(decrypted).toEqual(original);
  });

  it('produces a unique IV for each encryption', () => {
    const dek = randomDek();
    const value = 'same-value';

    const a = encryptField(dek, value);
    const b = encryptField(dek, value);

    expect(a.iv).not.toBe(b.iv);
    // Ciphertexts will also differ because the IVs differ
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('fails to decrypt with the wrong key', () => {
    const dek1 = randomDek();
    const dek2 = randomDek();

    const encrypted = encryptField(dek1, 'secret');

    expect(() => decryptField(dek2, encrypted)).toThrow();
  });

  it('fails to decrypt with tampered ciphertext (auth tag verification)', () => {
    const dek = randomDek();
    const encrypted = encryptField(dek, 'important data');

    // Tamper with the ciphertext — flip a byte
    const ctBuf = Buffer.from(encrypted.ciphertext, 'base64');
    ctBuf[0] ^= 0xff;
    const tampered: EncryptedField = {
      ...encrypted,
      ciphertext: ctBuf.toString('base64'),
    };

    expect(() => decryptField(dek, tampered)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// encryptFields / decryptFields
// ---------------------------------------------------------------------------

describe('encryptFields / decryptFields', () => {
  it('round-trips multiple fields', () => {
    const dek = randomDek();
    const fields = {
      name: 'Bob',
      age: 42,
      preferences: { theme: 'dark', lang: 'en' },
      tags: ['admin', 'user'],
    };

    const encrypted = encryptFields(dek, fields);

    // Each field should be an EncryptedField
    for (const key of Object.keys(fields)) {
      expect(encrypted[key]).toHaveProperty('ciphertext');
      expect(encrypted[key]).toHaveProperty('iv');
      expect(encrypted[key]).toHaveProperty('authTag');
    }

    const decrypted = decryptFields(dek, encrypted);

    expect(decrypted).toEqual(fields);
  });

  it('each field gets its own IV', () => {
    const dek = randomDek();
    const fields = { a: 'same', b: 'same', c: 'same' };

    const encrypted = encryptFields(dek, fields);

    const ivs = Object.values(encrypted).map((e) => e.iv);
    const uniqueIvs = new Set(ivs);
    expect(uniqueIvs.size).toBe(ivs.length);
  });
});

// ---------------------------------------------------------------------------
// KMS local fallback
// ---------------------------------------------------------------------------

describe('kmsService local fallback', () => {
  it('generateDataKey returns a valid 32-byte DEK', async () => {
    const result = await kmsService.generateDataKey('test-user');

    expect(result.plaintextDek).toBeInstanceOf(Buffer);
    expect(result.plaintextDek.length).toBe(32);
    expect(result.encryptedDek).toBeInstanceOf(Buffer);
    expect(result.encryptedDek.length).toBeGreaterThan(0);
  });

  it('decryptDataKey round-trips the encrypted DEK', async () => {
    const { plaintextDek, encryptedDek } =
      await kmsService.generateDataKey('test-user');

    const decrypted = await kmsService.decryptDataKey(
      encryptedDek,
      'test-user',
    );

    expect(decrypted).toBeInstanceOf(Buffer);
    expect(Buffer.compare(decrypted, plaintextDek)).toBe(0);
  });

  it('full envelope encryption flow: KMS generate -> encrypt -> decrypt', async () => {
    const { plaintextDek } = await kmsService.generateDataKey('user-123');

    const original = { ssn: '123-45-6789', dob: '1990-01-15' };
    const encrypted = encryptField(plaintextDek, original);
    const decrypted = decryptField(plaintextDek, encrypted);

    expect(decrypted).toEqual(original);
  });
});
