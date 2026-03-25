import crypto from 'node:crypto';
import type { GeneratedApiKey } from './types.js';

const KEY_PATTERN = /^frodo_(live|test)_([a-f0-9]{32})$/;

/**
 * Generate a new API key for the given environment.
 *
 * Format: `frodo_live_<32 hex chars>` (production) or `frodo_test_<32 hex chars>` (sandbox).
 */
export function generateApiKey(
  environment: 'sandbox' | 'production',
): GeneratedApiKey {
  const keyId = crypto.randomUUID();
  const randomPart = crypto.randomBytes(16).toString('hex'); // 32 hex chars
  const envPrefix = environment === 'production' ? 'live' : 'test';
  const rawKey = `frodo_${envPrefix}_${randomPart}`;

  return { keyId, rawKey, environment };
}

/**
 * SHA-256 hex digest of the raw API key.
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Parse a raw API key string, extracting the prefix (first 8 hex chars of the
 * random part) and the environment.
 *
 * Returns `null` if the format is invalid.
 */
export function parseApiKey(
  rawKey: string,
): { prefix: string; environment: 'sandbox' | 'production' } | null {
  const match = rawKey.match(KEY_PATTERN);
  if (!match) return null;

  const envLabel = match[1]; // 'live' or 'test'
  const randomPart = match[2]; // 32 hex chars
  const prefix = randomPart.slice(0, 8);
  const environment: 'sandbox' | 'production' =
    envLabel === 'live' ? 'production' : 'sandbox';

  return { prefix, environment };
}
