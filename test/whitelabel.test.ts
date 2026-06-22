import { describe, it, expect } from 'vitest';
import { randomBytes } from 'node:crypto';
import { encryptField, decryptField } from '../src/crypto/encryption.js';
import { evaluateRate, selectTerm, amortizedPayment } from '../src/whitelabel/rate-engine.js';
import { generateMockProfile } from '../src/whitelabel/mock.js';
import type { RateCard } from '../src/whitelabel/types.js';

describe('white-label intake encryption', () => {
  it('round-trips an encrypted profile', () => {
    const dek = randomBytes(32);
    const profile = generateMockProfile({ fullName: 'Jordan Carter', email: 'jordan@example.com', amount: 50000 });
    const enc = encryptField(dek, profile);
    expect(enc.ciphertext).toBeTruthy();
    expect(decryptField(dek, enc)).toEqual(profile);
  });

  it('does not leak plaintext PII in ciphertext', () => {
    const dek = randomBytes(32);
    const applicant = { fullName: 'Maria Alvarez', email: 'maria@example.com', phone: '(864) 555-0188' };
    const enc = encryptField(dek, applicant);
    const raw = Buffer.from(enc.ciphertext, 'base64').toString('utf8');
    expect(raw).not.toContain('Maria');
    expect(raw).not.toContain('maria@example.com');
  });

  it('a wrong key fails to decrypt (auth tag)', () => {
    const enc = encryptField(randomBytes(32), { x: 1 });
    expect(() => decryptField(randomBytes(32), enc)).toThrow();
  });
});

describe('white-label rate engine', () => {
  const card: RateCard = {
    defaultTermMonths: 180,
    tiers: [
      { label: 'Strong', minScore: 720, maxLtv: 0.8, terms: [
        { termMonths: 120, apr: 0.0824 }, { termMonths: 180, apr: 0.0849 }, { termMonths: 240, apr: 0.0874 },
      ] },
    ],
    fallbackTerms: [{ termMonths: 120, apr: 0.1099 }, { termMonths: 180, apr: 0.1124 }],
  };

  it('picks the tier by score + LTV and defaults to the configured term', () => {
    const est = evaluateRate(card, { amount: 50000, score: 740, ltv: 0.68 })!;
    expect(est.tierLabel).toBe('Strong');
    expect(est.selectedTermMonths).toBe(180);
    expect(est.options).toHaveLength(3);
    expect(est.fallback).toBe(false);
  });

  it('falls back when no tier matches (low score)', () => {
    const est = evaluateRate(card, { amount: 50000, score: 600 })!;
    expect(est.fallback).toBe(true);
  });

  it('selectTerm switches the offered option', () => {
    const est = evaluateRate(card, { amount: 50000, score: 740, ltv: 0.68 })!;
    const updated = selectTerm(est, 240);
    expect(updated.termMonths).toBe(240);
    expect(updated.apr).toBe(0.0874);
  });

  it('amortized payment is positive and below principal', () => {
    const pay = amortizedPayment(50000, 0.0849, 180);
    expect(pay).toBeGreaterThan(0);
    expect(pay).toBeLessThan(50000);
  });
});
