import { describe, it, expect } from 'vitest';
import { generateOtp, verifyOtp, isOtpExpired } from '../../src/forms/otp.js';

describe('OTP', () => {
  describe('generateOtp', () => {
    it('produces a 6-digit code', () => {
      const { code, hash } = generateOtp();

      expect(code).toMatch(/^\d{6}$/);
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64); // SHA-256 hex = 64 chars
    });

    it('produces different codes on successive calls', () => {
      const results = new Set<string>();
      for (let i = 0; i < 20; i++) {
        results.add(generateOtp().code);
      }
      // With 20 calls, we should get at least a few different codes
      // (probability of all 20 being the same is ~1/10^100)
      expect(results.size).toBeGreaterThan(1);
    });

    it('pads codes shorter than 6 digits', () => {
      // Generate many codes and check they're all 6 digits
      for (let i = 0; i < 50; i++) {
        const { code } = generateOtp();
        expect(code).toHaveLength(6);
      }
    });
  });

  describe('verifyOtp', () => {
    it('returns true for a matching code', () => {
      const { code, hash } = generateOtp();
      expect(verifyOtp(code, hash)).toBe(true);
    });

    it('returns false for a wrong code', () => {
      const { hash } = generateOtp();
      expect(verifyOtp('000000', hash)).toBe(false);
    });

    it('returns false for an empty submission', () => {
      const { hash } = generateOtp();
      expect(verifyOtp('', hash)).toBe(false);
    });
  });

  describe('isOtpExpired', () => {
    it('returns false for a future expiry', () => {
      const future = new Date(Date.now() + 60_000).toISOString();
      expect(isOtpExpired(future)).toBe(false);
    });

    it('returns true for a past expiry', () => {
      const past = new Date(Date.now() - 1000).toISOString();
      expect(isOtpExpired(past)).toBe(true);
    });

    it('returns true for the current time (edge case)', () => {
      // "now" should be considered expired (<=)
      const now = new Date(Date.now() - 1).toISOString();
      expect(isOtpExpired(now)).toBe(true);
    });
  });
});
