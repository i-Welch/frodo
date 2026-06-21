import type { RateEstimate, WhiteLabelConfig, WLProduct } from './types';
import {
  computeDti,
  computeLtv,
  generateMockProfile,
  type MockProfile,
  type MockSeedInput,
} from './mock-engine';
import { evaluateRate, selectTerm } from './types';

/**
 * The end-of-journey application record. This is exactly the payload that, in
 * the live product, would create the LO-dashboard entry, the Application
 * object, and the core-banking sync. Built deterministically so the demo is
 * reproducible.
 */
export interface ApplicationSummary {
  applicationId: string;
  product: WLProduct;
  amount: number;
  purpose: string;
  purposeLabel: string;
  profile: MockProfile;
  ltv: number | null;
  dti: number | null;
  estimate: RateEstimate | null;
  /** Modules verified, derived from provider routing. */
  verified: { module: string; provider: string; label: string }[];
  coreRef: string;
  /** Relative time shown in the loan-officer queue, e.g. "12m ago". */
  age?: string;
}

/** A few representative completed applications, so the loan-officer view has a
 * populated queue in the demo even before anyone runs the borrower flow. */
export function sampleApplications(config: WhiteLabelConfig): ApplicationSummary[] {
  const pick = (id: string) => config.products.find((p) => p.id === id) ?? config.products[0];
  const seeds: { product: string; amount: number; purpose: string; applicant: MockSeedInput; age: string }[] = [
    { product: 'auto', amount: 38000, purpose: 'vehicle', age: '12m ago', applicant: { fullName: 'Maria Alvarez', email: 'maria.alvarez@example.com', phone: '(864) 555-0188', amount: 38000 } },
    { product: 'personal', amount: 15000, purpose: 'debt-consolidation', age: '1h ago', applicant: { fullName: 'Devon Brooks', email: 'devon.brooks@example.com', phone: '(803) 555-0143', amount: 15000 } },
    { product: 'home-equity', amount: 60000, purpose: 'home-improvement', age: '3h ago', applicant: { fullName: 'Priya Nair', email: 'priya.nair@example.com', phone: '(864) 555-0207', amount: 60000 } },
  ];
  return seeds
    .filter((s) => config.products.some((p) => p.id === s.product))
    .map((s) => {
      const summary = buildApplicationSummary(config, pick(s.product), s.amount, s.purpose, s.applicant);
      return { ...summary, age: s.age };
    });
}

function applicationId(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `ASB-${100000 + (h % 900000)}`;
}

export function buildApplicationSummary(
  config: WhiteLabelConfig,
  product: WLProduct,
  amount: number,
  purpose: string,
  applicant: MockSeedInput,
): ApplicationSummary {
  const profile = generateMockProfile({ ...applicant, amount });
  const card = config.rateCard[product.id];

  const isEquity = product.type === 'heloc' || product.type === 'home-equity' || product.type === 'mortgage';
  const ltv = isEquity ? computeLtv(profile, amount) : null;

  // Tier is selected on credit score (and combined LTV for equity); the term
  // the borrower chooses then sets the APR and payment. DTI is informational.
  const estimate = evaluateRate(card, {
    amount,
    score: profile.credit.score,
    ltv: ltv ?? undefined,
  });
  const dti = estimate ? computeDti(profile, estimate.monthlyPayment) : null;

  const routing = config.providerRouting[product.id] ?? [];
  const id = applicationId(`${applicant.fullName}|${applicant.email}|${product.id}`);

  return {
    applicationId: id,
    product,
    amount,
    purpose,
    purposeLabel: config.purposes.find((p) => p.value === purpose)?.label ?? purpose,
    profile,
    ltv,
    dti,
    estimate,
    verified: routing.map((s) => ({ module: s.module, provider: s.provider, label: s.label })),
    coreRef: `${config.coreSync.system.toUpperCase()}-${id.replace('ASB-', '')}`,
  };
}

/** Apply a borrower-chosen term to a summary, recomputing the payment and DTI. */
export function withChosenTerm(summary: ApplicationSummary, termMonths: number): ApplicationSummary {
  if (!summary.estimate) return summary;
  const estimate = selectTerm(summary.estimate, termMonths);
  return { ...summary, estimate, dti: computeDti(summary.profile, estimate.monthlyPayment) };
}
