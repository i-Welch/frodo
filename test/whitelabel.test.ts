import { describe, it, expect } from 'vitest';
import { randomBytes } from 'node:crypto';
import { encryptField, decryptField } from '../src/crypto/encryption.js';
import { evaluateRange, selectRangeTerm, amortizedPayment } from '../src/whitelabel/rate-engine.js';
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

describe('white-label rate engine (no-credit range)', () => {
  const card: RateCard = {
    defaultTermMonths: 180,
    tiers: [
      { label: 'Excellent', minScore: 760, maxLtv: 0.7, terms: [
        { termMonths: 120, apr: 0.0749 }, { termMonths: 180, apr: 0.0774 }, { termMonths: 240, apr: 0.0799 },
      ] },
      { label: 'Strong', minScore: 720, maxLtv: 0.8, terms: [
        { termMonths: 120, apr: 0.0824 }, { termMonths: 180, apr: 0.0849 }, { termMonths: 240, apr: 0.0874 },
      ] },
    ],
    fallbackTerms: [{ termMonths: 120, apr: 0.1099 }, { termMonths: 180, apr: 0.1124 }, { termMonths: 240, apr: 0.1149 }],
  };

  it('low = best applicable tier, high = fallback (no score used)', () => {
    const r = evaluateRange(card, { amount: 50000, ltv: 0.68 })!;
    expect(r.tierLow).toBe('Excellent'); // 0.68 <= 0.7, ordered best-first
    expect(r.selectedTermMonths).toBe(180);
    const o = r.options.find((x) => x.termMonths === 180)!;
    expect(o.lowApr).toBe(0.0774); // min(Excellent, Strong) for 180
    expect(o.highApr).toBe(0.1124); // fallback 180
    expect(o.lowPayment).toBeLessThan(o.highPayment);
  });

  it('higher LTV drops the excellent tier from the band', () => {
    const r = evaluateRange(card, { amount: 50000, ltv: 0.78 })!; // excludes Excellent (>0.7)
    expect(r.tierLow).toBe('Strong');
    expect(r.options.find((x) => x.termMonths === 180)!.lowApr).toBe(0.0849);
  });

  it('selectRangeTerm switches the selected term', () => {
    const r = evaluateRange(card, { amount: 50000, ltv: 0.5 })!;
    const u = selectRangeTerm(r, 240);
    expect(u.termMonths).toBe(240);
    expect(u.lowApr).toBe(0.0799); // Excellent 240
  });

  it('amortized payment is positive and below principal', () => {
    const pay = amortizedPayment(50000, 0.0849, 180);
    expect(pay).toBeGreaterThan(0);
    expect(pay).toBeLessThan(50000);
  });
});
