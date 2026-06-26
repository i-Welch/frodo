/**
 * WhiteLabelConfig — the single config object that drives the RAVEN white-label
 * borrower journey.
 *
 * This same shape powers two things:
 *   1. The MOCK demo (data backend = deterministic fixtures) used for sales:
 *      live walkthroughs, screenshot articles, and videos.
 *   2. The REAL product (data backend = live providers + core sync), later.
 *
 * Mock vs. live is purely which adapter sits behind `providerRouting` and
 * `coreSync`. The front-end, the product catalog, the rate-card math, and the
 * config schema are identical, so every demo we build converges toward the
 * shippable product rather than being throwaway.
 *
 * For the demo, each prospect bank is one config file under _config/ (mirroring
 * how roi-data.ts holds per-bank ROI inputs). Spinning up a new branded demo is
 * authoring one of these.
 */

import type { FlowKind } from './flows';

/* ------------------------------------------------------------------ */
/* Branding                                                            */
/* ------------------------------------------------------------------ */

export interface WLBranding {
  /** Legal/display name, e.g. "Arthur State Bank". */
  name: string;
  /** Short name used in body copy, e.g. "Arthur State". */
  shortName: string;
  /** Wordmark shown in the journey header (text logo). */
  wordmark: string;
  /** Optional tagline shown under the wordmark on the front door. */
  tagline?: string;
  /** Primary brand color (buttons, accents). */
  primary: string;
  /** Darker shade of primary for hovers / gradients. */
  primaryDark: string;
  /** Accent / secondary color (highlights, progress). */
  accent: string;
  /** Page background. */
  bg: string;
  /** Card / surface background. */
  surface: string;
  /** Primary text color. */
  text: string;
  /** Muted text color. */
  textMuted: string;
  /** Hairline / border color. */
  border: string;
  /** Body font stack (loaded via Google Fonts link in the journey host). */
  font: string;
  /** Optional Google Fonts family name to load, e.g. "Source Sans 3". */
  googleFont?: string;
  /** Corner radius for cards/inputs, e.g. "10px". */
  radius: string;
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export type ProductType =
  | 'heloc'
  | 'home-equity'
  | 'mortgage'
  | 'personal'
  | 'auto'
  | 'business'
  | 'deposit';

export interface WLProduct {
  id: string;
  type: ProductType;
  /** Card title, e.g. "Home Equity Line of Credit". */
  label: string;
  /** One-line value prop shown on the product card. */
  blurb: string;
  /** Inline SVG path (24x24, stroke) for the product icon. */
  iconPath: string;
  minAmount: number;
  maxAmount: number;
  /** Default position of the amount slider on the front door. */
  defaultAmount: number;
  /** Purposes this product is matched to (front-door dropdown values). */
  purposes: string[];
  /** Short range/rate teaser shown on the card, e.g. "Rates from 7.49% APR". */
  rateTeaser?: string;
  /** Compliance/footnote copy specific to this product. */
  disclosure?: string;
  /**
   * Flows permitted for this product (capability gate). If unset, the config's
   * `defaultFlows` applies. The actual flow a borrower gets is resolved from the
   * entry path against this list (see flows.ts `resolveFlow`).
   */
  allowedFlows?: FlowKind[];
  /** Flow a public web entry initiates for this product (defaults to first allowed). */
  webDefaultFlow?: FlowKind;
}

/* ------------------------------------------------------------------ */
/* Provider routing (which data we pull, per product)                  */
/* ------------------------------------------------------------------ */

/** A data-pull step the journey runs, mapped to a RAVEN provider. */
export interface ProviderStep {
  /** RAVEN data module this step populates. */
  module:
    | 'identity'
    | 'contact'
    | 'residence'
    | 'employment'
    | 'financial'
    | 'credit';
  /** Provider that fulfils it (drives the label + logo in the pull animation). */
  provider:
    | 'Plaid'
    | 'Socure'
    | 'Truework'
    | 'FullContact'
    | 'Melissa'
    | 'Experian'
    | 'TransUnion';
  /** What the borrower sees while this runs, e.g. "Verifying your identity". */
  label: string;
  /** Whether this step requires borrower interaction (e.g. Plaid Link). */
  interactive?: boolean;
}

/* ------------------------------------------------------------------ */
/* Rate card (optional borrower-facing estimate)                       */
/* ------------------------------------------------------------------ */

/** A single term offered within a tier, with the APR priced for that term.
 * Real pricing moves with term (a 10-year HELOC is priced differently from a
 * 20-year one), so each tier carries a list of these. */
export interface RateTermOption {
  /** Term length in months, e.g. 120 for 10 years. */
  termMonths: number;
  /** APR for this term (annual, e.g. 0.0749 for 7.49%). */
  apr: number;
}

/**
 * A rate-card tier. The engine picks the first tier whose criteria the pulled
 * + entered data satisfies, then offers that tier's term options. Banks
 * configure this at onboarding; for the demo it is hand-authored to be
 * realistic.
 */
export interface RateTier {
  /** Human label, e.g. "Excellent credit, low LTV". */
  label: string;
  /** Minimum credit score for this tier (inclusive). */
  minScore: number;
  /** Maximum combined loan-to-value for this tier (0-1), if applicable. */
  maxLtv?: number;
  /** Term options for this tier, each with its own APR. Ordered shortest-first. */
  terms: RateTermOption[];
}

export interface RateCard {
  tiers: RateTier[];
  /** Term options used when no tier matches (highest-risk pricing). */
  fallbackTerms: RateTermOption[];
  /** Default term to preselect on the estimate screen; falls back to the
   * longest available term if unset or absent. */
  defaultTermMonths?: number;
}

/* ------------------------------------------------------------------ */
/* Core banking sync                                                   */
/* ------------------------------------------------------------------ */

export type CoreSystem = 'fis' | 'fiserv' | 'jackhenry' | 'none' | 'unknown';

export interface CoreSyncConfig {
  system: CoreSystem;
  /** Product name shown in the confirmation, e.g. "Jack Henry SilverLake". */
  displayName: string;
  /** 'mock' returns a realistic confirmation with no real integration. */
  mode: 'mock' | 'live';
}

/* ------------------------------------------------------------------ */
/* The config object                                                   */
/* ------------------------------------------------------------------ */

export interface WhiteLabelConfig {
  /** URL slug: /wl/<slug> and /audit/<slug>. */
  slug: string;
  branding: WLBranding;
  products: WLProduct[];
  /** Flows offered when a product does not declare its own `allowedFlows`. */
  defaultFlows?: FlowKind[];
  /** Front-door "what are you looking to do?" options. */
  purposes: { value: string; label: string }[];
  /** Which providers/data steps we pull, keyed by product id. */
  providerRouting: Record<string, ProviderStep[]>;
  /** Optional rate estimate, keyed by product id. Omit a product to skip. */
  rateCard: Record<string, RateCard>;
  coreSync: CoreSyncConfig;
  /** Loan-officer routing line shown on the confirmation screen. */
  loTeam: { name: string; title: string; nmls?: string };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function matchProducts(
  config: WhiteLabelConfig,
  amount: number,
  purpose: string,
): WLProduct[] {
  const matched = config.products.filter(
    (p) =>
      p.purposes.includes(purpose) &&
      amount >= p.minAmount &&
      amount <= p.maxAmount,
  );
  // Fall back to purpose-only matches if the amount falls outside every band,
  // so the borrower is never shown a dead end.
  if (matched.length > 0) return matched;
  return config.products.filter((p) => p.purposes.includes(purpose));
}

/**
 * No-credit rate band (rate_range flow). Low = best tier the borrower's LTV
 * qualifies for (excellent credit); high = standard/fallback pricing. Credit is
 * the unknown the band spans. Mirrors the backend rate engine.
 */
export interface RateRangeOption {
  termMonths: number;
  lowApr: number;
  highApr: number;
  lowPayment: number;
  highPayment: number;
}

export interface RateRange {
  tierLow: string;
  options: RateRangeOption[];
  selectedTermMonths: number;
  lowApr: number;
  highApr: number;
  lowPayment: number;
  highPayment: number;
  termMonths: number;
}

function rangeSelected(o: RateRangeOption) {
  return {
    selectedTermMonths: o.termMonths,
    lowApr: o.lowApr,
    highApr: o.highApr,
    lowPayment: o.lowPayment,
    highPayment: o.highPayment,
    termMonths: o.termMonths,
  };
}

export function evaluateRange(
  card: RateCard | undefined,
  opts: { amount: number; ltv?: number },
): RateRange | null {
  if (!card) return null;
  const applicable = card.tiers.filter(
    (t) => t.maxLtv === undefined || (opts.ltv ?? 0) <= t.maxLtv,
  );
  const terms = card.fallbackTerms.map((t) => t.termMonths);
  if (terms.length === 0) return null;

  const options: RateRangeOption[] = terms.map((term) => {
    const tierAprs = applicable
      .map((t) => t.terms.find((x) => x.termMonths === term)?.apr)
      .filter((a): a is number => a !== undefined);
    const fallbackApr = card.fallbackTerms.find((x) => x.termMonths === term)?.apr ?? 0;
    const lowApr = tierAprs.length ? Math.min(...tierAprs) : fallbackApr;
    const highApr = fallbackApr;
    return {
      termMonths: term,
      lowApr,
      highApr,
      lowPayment: amortizedPayment(opts.amount, lowApr, term),
      highPayment: amortizedPayment(opts.amount, highApr, term),
    };
  });

  const longest = options.reduce((a, b) => (b.termMonths > a.termMonths ? b : a));
  const preferred = options.find((o) => o.termMonths === card.defaultTermMonths) ?? longest;

  return {
    tierLow: applicable[0]?.label ?? 'Standard pricing',
    options,
    ...rangeSelected(preferred),
  };
}

export function selectRangeTerm(range: RateRange, termMonths: number): RateRange {
  const opt = range.options.find((o) => o.termMonths === termMonths);
  if (!opt) return range;
  return { ...range, ...rangeSelected(opt) };
}

/** Individualized POINT rate (low === high) from a credit score. Used by
 * full_application (credit pulled). Same RateRange shape so displays share one
 * code path (single value rendered when lowApr === highApr). */
export function evaluatePoint(
  card: RateCard | undefined,
  opts: { amount: number; score: number; ltv?: number },
): RateRange | null {
  if (!card) return null;
  const tier = card.tiers.find(
    (t) => opts.score >= t.minScore && (t.maxLtv === undefined || (opts.ltv ?? 0) <= t.maxLtv),
  );
  const terms = tier ? tier.terms : card.fallbackTerms;
  if (terms.length === 0) return null;
  const options: RateRangeOption[] = terms.map((t) => ({
    termMonths: t.termMonths,
    lowApr: t.apr,
    highApr: t.apr,
    lowPayment: amortizedPayment(opts.amount, t.apr, t.termMonths),
    highPayment: amortizedPayment(opts.amount, t.apr, t.termMonths),
  }));
  const longest = options.reduce((a, b) => (b.termMonths > a.termMonths ? b : a));
  const preferred = options.find((o) => o.termMonths === card.defaultTermMonths) ?? longest;
  return { tierLow: tier ? tier.label : 'Standard pricing', options, ...rangeSelected(preferred) };
}

/** Standard fixed-payment amortization. */
export function amortizedPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
): number {
  const r = annualRate / 12;
  if (r === 0) return principal / termMonths;
  const factor = Math.pow(1 + r, termMonths);
  return (principal * r * factor) / (factor - 1);
}
