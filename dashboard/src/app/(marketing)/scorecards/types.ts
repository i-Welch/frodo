// Product Scorecards: types shared by every product type.
// Design: docs/superpowers/specs/2026-11-26-product-scorecards-design.md

export const SCORECARD_STATES = ['SC', 'NC', 'GA', 'FL'] as const;
export type StateCode = (typeof SCORECARD_STATES)[number];
/** A state page, or 'all' for the Southeast-wide view (access averaged across the states). */
export type ScorecardView = StateCode | 'all';

export const STATE_LABELS: Record<StateCode, { name: string; slug: string }> = {
  SC: { name: 'South Carolina', slug: 'south-carolina' },
  NC: { name: 'North Carolina', slug: 'north-carolina' },
  GA: { name: 'Georgia', slug: 'georgia' },
  FL: { name: 'Florida', slug: 'florida' },
};

export type InstitutionKind = 'fintech' | 'online-bank' | 'big-bank' | 'community-bank' | 'credit-union';

export const KIND_LABELS: Record<InstitutionKind, string> = {
  fintech: 'Fintech app',
  'online-bank': 'Online bank',
  'big-bank': 'Big five bank',
  'community-bank': 'Community bank',
  'credit-union': 'Credit union',
};

/** Fintechs, online banks and the big five appear on every state page; local institutions only where they are. */
export const NATIONAL_KINDS: InstitutionKind[] = ['fintech', 'online-bank', 'big-bank'];

export type SupportLevel = 'phone-24-7' | 'chat-24-7' | 'extended' | 'business-hours' | 'unknown';

export interface Source {
  url: string;
  what: string;
}

export interface Institution {
  slug: string;
  name: string;
  kind: InstitutionKind;
  /** FDIC main office for chartered banks, otherwise headquarters. */
  hq: string;
  hqState: string;
  fdicCert: number | null;
  /** Plain words, e.g. "FDIC via partner bank: Cross River Bank". */
  insurance: string;
  insuranceKind: 'direct' | 'partner-bank' | 'sweep' | 'none';
  insuranceLimit: string | null;
  /** Coverage above $250,000 through a sweep network. */
  extendedCoverage: boolean;
  support: string;
  supportLevel: SupportLevel;
  /** Credit unions: who can join. */
  membership: string | null;
  branches: Record<StateCode, number>;
  branchesSource: string | null;
  branchesNote: string | null;
  branchesAsOf: string;
}

export interface ProductRow<F> {
  institution: string;
  name: string;
  url: string;
  /** Date every fact in the row was last verified against its sources (YYYY-MM-DD). */
  asOf: string;
  facts: F;
  sources: Source[];
  /** What could not be verified, or a judgment call, in plain words. */
  notes: string[];
}

export interface SavingsFacts {
  /** APY a $10,000 balance earns with no conditions (blended if tiered). Null if not published. */
  apy: number | null;
  /** Best APY a $10,000 balance can earn by meeting a condition. */
  conditionalApy: number | null;
  condition: string | null;
  /** Monthly cost of a subscription the condition requires (Robinhood Gold), 0 for free conditions. */
  conditionMonthlyCost: number;
  /** True when the account earns nothing unless the condition is met. */
  noRateWithoutCondition: boolean;
  apyNote: string;
  /** Date the institution's own rate page gives for the rate, if any. */
  rateAsOf: string | null;
  /** Monthly maintenance fee, as a monthly figure (a quarterly fee is divided by three). */
  monthlyFee: number | null;
  waive: 'none-needed' | 'easy' | 'balance' | 'linked-account' | 'not-waivable';
  waiveBalance: number | null;
  feeWaiver: string | null;
  minOpen: number | null;
  minBalanceForApy: number | null;
  /** Free withdrawals per month (a quarterly allowance divided by three), 'unlimited', or null if not stated. */
  withdrawalsPerMonth: number | 'unlimited' | null;
  excessWithdrawalFee: number | null;
  withdrawalLimit: string | null;
  externalTransfers: boolean | null;
  /** Zelle, a pay-a-person service, or instant (RTP/FedNow) transfers. */
  instantTransfers: boolean | null;
  transferNotes: string | null;
  atmAccess: boolean | null;
  subAccounts: boolean | null;
  jointAccounts: boolean | null;
  cashDeposit: boolean | null;
}

export interface Criterion<F> {
  key: string;
  label: string;
  /** What the criterion measures, shown on the page (never the weight). */
  description: string;
  /** 0-10, or null when the deciding fact is not published. */
  score: (row: ProductRow<F>, inst: Institution, state: StateCode) => number | null;
}

/** An institution checked for a scorecard whose own pages publish no rate for the product. */
export interface UnpublishedRate {
  name: string;
  kind: InstitutionKind;
  /** Headquarters state. */
  state: StateCode;
  fdicCert: number | null;
  /** The product page that was checked. */
  url: string;
  checked: string;
  /** What the page says instead of a rate, in plain words. */
  note: string;
}

export interface ProductType<F> {
  slug: string;
  /** "Savings accounts" */
  label: string;
  /** "savings account" */
  singular: string;
  updated: string;
  rows: ProductRow<F>[];
  criteria: Criterion<F>[];
  /** Criteria that must be scored for a row to be ranked. */
  required: string[];
  /** The fact shown first in tables (e.g. APY). */
  headline: { label: string; value: (row: ProductRow<F>) => string };
  /** Facts shown in each row's detail panel and the CSV. */
  facts: { label: string; value: (row: ProductRow<F>, inst: Institution) => string }[];
  /** One sentence each on how the scorecard defines the product, for the method section. */
  method: string[];
  /** Institutions checked that publish no rate online, so cannot be scored. */
  unpublished: UnpublishedRate[];
}
