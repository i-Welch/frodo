import type { MockProfile, ModuleName, ProviderName, PullStep } from './types.js';

/**
 * Deterministic mock provider set for sandbox/demo mode. Seeded by name+email
 * so demos, screenshots, and videos are reproducible. In production this is
 * swapped for a LiveProviderSet that calls the real enrichment engine; the
 * white-label service only depends on the ProviderSet interface.
 */

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EMPLOYERS = [
  { name: 'Milliken & Company', title: 'Operations Manager' },
  { name: 'Prisma Health', title: 'Registered Nurse' },
  { name: 'BMW Manufacturing', title: 'Process Engineer' },
  { name: 'Spartanburg School District 7', title: 'Teacher' },
  { name: 'Self-employed', title: 'Owner, Upstate Contracting LLC' },
];
const BANKS = ['Wells Fargo', 'Bank of America', 'Truist', 'Regions Bank'];
const STREETS = ['Maple Ridge Dr', 'Union St', 'Pine Hollow Ln', 'Carolina Ave', 'Magnolia Ct'];
const CITIES = ['Union, SC 29379', 'Spartanburg, SC 29302', 'Greenville, SC 29607', 'Rock Hill, SC 29730'];

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function between(rng: () => number, min: number, max: number, step = 1): number {
  return Math.round((min + rng() * (max - min)) / step) * step;
}

export function generateMockProfile(input: { fullName: string; email: string; phone?: string; amount: number }): MockProfile {
  const rng = makeRng(hashSeed(`${input.fullName}|${input.email}`));
  const score = between(rng, 648, 802);
  const annualIncome = between(rng, 58000, 165000, 1000);
  const monthlyIncome = Math.round(annualIncome / 12);
  const monthlyDebt = Math.round(monthlyIncome * (0.12 + rng() * 0.22));
  const propertyValue = between(rng, 215000, 540000, 1000);
  const mortgageBalance = Math.round(propertyValue * (0.18 + rng() * 0.32));
  const emp = pick(rng, EMPLOYERS);

  return {
    identity: {
      fullName: input.fullName,
      dobMasked: `**/**/19${between(rng, 72, 95)}`,
      ssnLast4: String(between(rng, 1000, 9999)),
      verified: true,
      kycDecision: 'pass',
      fraudScore: Math.round((0.01 + rng() * 0.06) * 100) / 100,
    },
    contact: {
      email: input.email,
      phone: input.phone || `(864) 555-${String(between(rng, 1000, 9999))}`,
      phoneVerified: true,
    },
    residence: {
      address: `${between(rng, 100, 4800)} ${pick(rng, STREETS)}, ${pick(rng, CITIES)}`,
      ownership: 'own',
      propertyType: 'Single family residence',
      estimatedValue: propertyValue,
      mortgageBalance,
      moveInYear: between(rng, 2009, 2022),
    },
    employment: {
      employer: emp.name,
      title: emp.title,
      verified: true,
      annualIncome,
      tenureYears: between(rng, 2, 14),
    },
    financial: {
      institution: pick(rng, BANKS),
      checkingBalance: between(rng, 2400, 28000, 100),
      savingsBalance: between(rng, 5000, 95000, 100),
      monthlyIncome,
      monthlyDebt,
    },
    credit: {
      score,
      bureau: 'Experian',
      openTradelines: between(rng, 4, 16),
      derogatories: rng() > 0.8 ? 1 : 0,
    },
  };
}

/** Default module -> provider/label mapping for product-agnostic data_only pulls. */
export const MODULE_PROVIDERS: Record<ModuleName, { provider: ProviderName; label: string; interactive?: boolean }> = {
  identity: { provider: 'Socure', label: 'Verifying your identity' },
  contact: { provider: 'Socure', label: 'Confirming contact details' },
  employment: { provider: 'Truework', label: 'Verifying income & employment' },
  residence: { provider: 'Melissa', label: 'Verifying your property' },
  financial: { provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
  credit: { provider: 'Experian', label: 'Checking your credit profile' },
};

export interface EnrichInput {
  applicant: { fullName: string; email: string; phone?: string };
  amount: number;
  steps: PullStep[];
}

export interface ProviderSet {
  readonly mode: 'demo' | 'live';
  /** Run the given provider steps and return an enriched profile. */
  enrich(input: EnrichInput): Promise<MockProfile>;
}

/** Sandbox/demo: deterministic, instant. */
export class MockProviderSet implements ProviderSet {
  readonly mode = 'demo' as const;
  async enrich(input: EnrichInput): Promise<MockProfile> {
    return generateMockProfile({ ...input.applicant, amount: input.amount });
  }
}

/** Production stub. Wire to src/enrichment/engine.ts + real providers when a bank goes live. */
export class LiveProviderSet implements ProviderSet {
  readonly mode = 'live' as const;
  async enrich(): Promise<MockProfile> {
    throw new Error('LiveProviderSet not implemented — production enrichment is not yet wired.');
  }
}

export function providerSetForMode(mode: 'demo' | 'live'): ProviderSet {
  return mode === 'live' ? new LiveProviderSet() : new MockProviderSet();
}
