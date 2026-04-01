import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

// ---------------------------------------------------------------------------
// OTP generation + verification
// ---------------------------------------------------------------------------

/**
 * Generate a 6-digit OTP code and its SHA-256 hash.
 * The plain-text code is returned so it can be sent to the user;
 * only the hash is persisted.
 */
export function generateOtp(): { code: string; hash: string } {
  // randomInt is cryptographically secure
  const num = randomInt(0, 1_000_000);
  const code = String(num).padStart(6, '0');
  const hash = hashOtp(code);
  return { code, hash };
}

/**
 * Verify a submitted OTP against a stored hash.
 */
export function verifyOtp(submitted: string, hash: string): boolean {
  const submittedHash = hashOtp(submitted);
  const a = Buffer.from(submittedHash, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Check whether the OTP has expired.
 */
export function isOtpExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function hashOtp(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}
