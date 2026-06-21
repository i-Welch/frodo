/**
 * Deterministic mock data engine for the white-label demo.
 *
 * Given a borrower's name/email (the seed), this returns a believable enriched
 * profile across RAVEN's modules — the same data the live product would pull
 * from Plaid / Socure / Truework / Melissa. It is deterministic so that live
 * demos, screenshots, and re-recorded videos are stable and repeatable.
 *
 * In production this module is swapped for the live enrichment engine; the
 * shape returned here matches what the journey UI and rate engine consume.
 */

export interface MockProfile {
  identity: {
    fullName: string;
    dobMasked: string;
    ssnLast4: string;
    verified: true;
    kycDecision: 'pass';
    fraudScore: number; // 0-1, lower is safer
  };
  contact: {
    email: string;
    phone: string;
    phoneVerified: true;
  };
  residence: {
    address: string;
    ownership: 'own' | 'rent';
    propertyType: string;
    estimatedValue: number;
    mortgageBalance: number;
    moveInYear: number;
  };
  employment: {
    employer: string;
    title: string;
    verified: true;
    annualIncome: number;
    tenureYears: number;
  };
  financial: {
    institution: string;
    checkingBalance: number;
    savingsBalance: number;
    monthlyIncome: number;
    monthlyDebt: number;
  };
  credit: {
    score: number;
    bureau: 'Experian';
    openTradelines: number;
    derogatories: number;
  };
}

/** Stable string hash → unsigned 32-bit int. */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32) seeded off the borrower. */
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
  const raw = min + rng() * (max - min);
  return Math.round(raw / step) * step;
}

export interface MockSeedInput {
  fullName: string;
  email: string;
  phone?: string;
  /** Requested amount, used to make property value / income plausibly proportional. */
  amount: number;
}

export function generateMockProfile(input: MockSeedInput): MockProfile {
  const rng = makeRng(hashSeed(`${input.fullName}|${input.email}`));

  const score = between(rng, 648, 802); // realistic spread
  const annualIncome = between(rng, 58000, 165000, 1000);
  const monthlyIncome = Math.round(annualIncome / 12);
  const monthlyDebt = Math.round(monthlyIncome * (0.12 + rng() * 0.22));
  const propertyValue = between(rng, 215000, 540000, 1000);
  const mortgageBalance = Math.round(propertyValue * (0.25 + rng() * 0.45));
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

/** Combined LTV for an equity product, given requested draw + existing lien. */
export function computeLtv(profile: MockProfile, requestedAmount: number): number {
  if (profile.residence.estimatedValue <= 0) return 1;
  return (
    (profile.residence.mortgageBalance + requestedAmount) /
    profile.residence.estimatedValue
  );
}

/** Back-end DTI including the estimated new payment. */
export function computeDti(profile: MockProfile, newMonthlyPayment: number): number {
  if (profile.financial.monthlyIncome <= 0) return 1;
  return (profile.financial.monthlyDebt + newMonthlyPayment) / profile.financial.monthlyIncome;
}
