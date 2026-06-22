import type { MockProfile, RateCard, RateRange, RateRangeOption } from './types.js';

/** Standard fixed-payment amortization. */
export function amortizedPayment(principal: number, annualRate: number, termMonths: number): number {
  const r = annualRate / 12;
  if (r === 0) return principal / termMonths;
  const factor = Math.pow(1 + r, termMonths);
  return (principal * r * factor) / (factor - 1);
}

function selectedFields(o: RateRangeOption) {
  return {
    selectedTermMonths: o.termMonths,
    lowApr: o.lowApr,
    highApr: o.highApr,
    lowPayment: o.lowPayment,
    highPayment: o.highPayment,
    termMonths: o.termMonths,
  };
}

/**
 * Evaluate a rate card WITHOUT a credit score: produce a low-to-high band per
 * term. The low end is the best tier the borrower's LTV qualifies for (e.g.
 * excellent credit); the high end is standard/fallback pricing. Credit is the
 * unknown the band spans; LTV (which we do know) narrows which tiers apply.
 * This is the prequalification-safe model for the rate_range flow.
 */
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
    // Tiers are ordered best-first in config, so applicable[0] is the best.
    tierLow: applicable[0]?.label ?? 'Standard pricing',
    options,
    ...selectedFields(preferred),
  };
}

export function selectRangeTerm(range: RateRange, termMonths: number): RateRange {
  const opt = range.options.find((o) => o.termMonths === termMonths);
  if (!opt) return range;
  return { ...range, ...selectedFields(opt) };
}

export function computeLtv(profile: MockProfile, requestedAmount: number): number {
  if (profile.residence.estimatedValue <= 0) return 1;
  return (profile.residence.mortgageBalance + requestedAmount) / profile.residence.estimatedValue;
}

export function computeDti(profile: MockProfile, newMonthlyPayment: number): number {
  if (profile.financial.monthlyIncome <= 0) return 1;
  return (profile.financial.monthlyDebt + newMonthlyPayment) / profile.financial.monthlyIncome;
}
