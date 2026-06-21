import type { MockProfile, RateCard, RateEstimate, RateEstimateOption } from './types.js';

/** Standard fixed-payment amortization. */
export function amortizedPayment(principal: number, annualRate: number, termMonths: number): number {
  const r = annualRate / 12;
  if (r === 0) return principal / termMonths;
  const factor = Math.pow(1 + r, termMonths);
  return (principal * r * factor) / (factor - 1);
}

function selectedFields(o: RateEstimateOption) {
  return { selectedTermMonths: o.termMonths, apr: o.apr, termMonths: o.termMonths, monthlyPayment: o.monthlyPayment };
}

/**
 * Evaluate a rate card. Tier is chosen by credit score (+ combined LTV for
 * equity); each tier prices several terms. Returns every term priced for the
 * amount so the borrower can trade term against payment.
 */
export function evaluateRate(
  card: RateCard | undefined,
  opts: { amount: number; score: number; ltv?: number },
): RateEstimate | null {
  if (!card) return null;
  const tier = card.tiers.find(
    (t) => opts.score >= t.minScore && (t.maxLtv === undefined || (opts.ltv ?? 0) <= t.maxLtv),
  );
  const terms = tier ? tier.terms : card.fallbackTerms;
  if (terms.length === 0) return null;

  const options: RateEstimateOption[] = terms.map((t) => ({
    termMonths: t.termMonths,
    apr: t.apr,
    monthlyPayment: amortizedPayment(opts.amount, t.apr, t.termMonths),
  }));
  const longest = options.reduce((a, b) => (b.termMonths > a.termMonths ? b : a));
  const preferred = options.find((o) => o.termMonths === card.defaultTermMonths) ?? longest;

  return {
    tierLabel: tier ? tier.label : 'Standard pricing',
    fallback: !tier,
    options,
    ...selectedFields(preferred),
  };
}

export function selectTerm(estimate: RateEstimate, termMonths: number): RateEstimate {
  const opt = estimate.options.find((o) => o.termMonths === termMonths);
  if (!opt) return estimate;
  return { ...estimate, ...selectedFields(opt) };
}

export function computeLtv(profile: MockProfile, requestedAmount: number): number {
  if (profile.residence.estimatedValue <= 0) return 1;
  return (profile.residence.mortgageBalance + requestedAmount) / profile.residence.estimatedValue;
}

export function computeDti(profile: MockProfile, newMonthlyPayment: number): number {
  if (profile.financial.monthlyIncome <= 0) return 1;
  return (profile.financial.monthlyDebt + newMonthlyPayment) / profile.financial.monthlyIncome;
}
