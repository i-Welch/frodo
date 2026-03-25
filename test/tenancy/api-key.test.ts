import { describe, it, expect } from 'vitest';
import {
  generateApiKey,
  hashApiKey,
  parseApiKey,
} from '../../src/tenancy/api-key.js';

// ---------------------------------------------------------------------------
// generateApiKey
// ---------------------------------------------------------------------------

describe('generateApiKey', () => {
  it('produces correct format for production', () => {
    const key = generateApiKey('production');

    expect(key.keyId).toBeDefined();
    expect(key.environment).toBe('production');
    expect(key.rawKey).toMatch(/^frodo_live_[a-f0-9]{32}$/);
  });

  it('produces correct format for sandbox', () => {
    const key = generateApiKey('sandbox');

    expect(key.keyId).toBeDefined();
    expect(key.environment).toBe('sandbox');
    expect(key.rawKey).toMatch(/^frodo_test_[a-f0-9]{32}$/);
  });

  it('generates unique keys each time', () => {
    const a = generateApiKey('production');
    const b = generateApiKey('production');

    expect(a.keyId).not.toBe(b.keyId);
    expect(a.rawKey).not.toBe(b.rawKey);
  });
});

// ---------------------------------------------------------------------------
// parseApiKey
// ---------------------------------------------------------------------------

describe('parseApiKey', () => {
  it('extracts prefix and environment for production key', () => {
    const key = generateApiKey('production');
    const parsed = parseApiKey(key.rawKey);

    expect(parsed).not.toBeNull();
    expect(parsed!.environment).toBe('production');
    // Prefix should be first 8 hex chars of the random part
    const randomPart = key.rawKey.split('_')[2];
    expect(parsed!.prefix).toBe(randomPart.slice(0, 8));
    expect(parsed!.prefix).toHaveLength(8);
  });

  it('extracts prefix and environment for sandbox key', () => {
    const key = generateApiKey('sandbox');
    const parsed = parseApiKey(key.rawKey);

    expect(parsed).not.toBeNull();
    expect(parsed!.environment).toBe('sandbox');
    const randomPart = key.rawKey.split('_')[2];
    expect(parsed!.prefix).toBe(randomPart.slice(0, 8));
  });

  it('returns null for invalid keys', () => {
    expect(parseApiKey('')).toBeNull();
    expect(parseApiKey('not-a-key')).toBeNull();
    expect(parseApiKey('frodo_live_tooshort')).toBeNull();
    expect(parseApiKey('frodo_bad_abcdef0123456789abcdef0123456789')).toBeNull();
    expect(parseApiKey('frodo_live_ABCDEF0123456789abcdef0123456789')).toBeNull(); // uppercase
    expect(parseApiKey('other_live_abcdef0123456789abcdef0123456789')).toBeNull(); // wrong prefix
  });

  it('returns null for key with wrong length random part', () => {
    expect(parseApiKey('frodo_live_abcdef01234567')).toBeNull();
    expect(
      parseApiKey('frodo_live_abcdef0123456789abcdef0123456789extra'),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// hashApiKey
// ---------------------------------------------------------------------------

describe('hashApiKey', () => {
  it('produces consistent hashes', () => {
    const key = generateApiKey('production');
    const hash1 = hashApiKey(key.rawKey);
    const hash2 = hashApiKey(key.rawKey);

    expect(hash1).toBe(hash2);
  });

  it('produces a 64-char hex string (SHA-256)', () => {
    const key = generateApiKey('sandbox');
    const hash = hashApiKey(key.rawKey);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces different hashes for different keys', () => {
    const a = generateApiKey('production');
    const b = generateApiKey('production');

    expect(hashApiKey(a.rawKey)).not.toBe(hashApiKey(b.rawKey));
  });
});

// ---------------------------------------------------------------------------
// Full flow: generate -> parse -> hash -> compare
// ---------------------------------------------------------------------------

describe('full API key flow', () => {
  it('generate -> parse -> hash -> compare', () => {
    const generated = generateApiKey('production');

    // Parse the generated key
    const parsed = parseApiKey(generated.rawKey);
    expect(parsed).not.toBeNull();
    expect(parsed!.environment).toBe('production');

    // Hash should be deterministic
    const hash = hashApiKey(generated.rawKey);
    expect(hashApiKey(generated.rawKey)).toBe(hash);

    // Prefix should match
    const randomPart = generated.rawKey.split('_')[2];
    expect(parsed!.prefix).toBe(randomPart.slice(0, 8));
  });
});
