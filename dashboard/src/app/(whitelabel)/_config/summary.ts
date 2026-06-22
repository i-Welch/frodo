import type { RateRange, WhiteLabelConfig, WLProduct } from './types';
import {
  computeDti,
  computeLtv,
  generateMockProfile,
  type MockProfile,
  type MockSeedInput,
} from './mock-engine';
import { evaluateRange, selectRangeTerm } from './types';
import type { Intake } from '../_client/client';

/**
 * The loan-officer view of an intake (and the narrated-handoff payload). For
 * the demo's static surfaces (the /audit sample and the officer-view sample
 * queue) this is built directly; for the live journey it's adapted from the
 * Intake the backend returns. Rate-bearing flows carry a no-credit `range`.
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
  creditPulled: boolean;
  range: RateRange | null;
  /** Modules verified, derived from the data-pull steps. */
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

const EQUITY = new Set(['heloc', 'home-equity', 'mortgage']);

/**
 * Build a representative rate_range-style summary (no credit pull, a no-credit
 * band) for the demo's static surfaces.
 */
export function buildApplicationSummary(
  config: WhiteLabelConfig,
  product: WLProduct,
  amount: number,
  purpose: string,
  applicant: MockSeedInput,
): ApplicationSummary {
  const profile = generateMockProfile({ ...applicant, amount });
  const ltv = EQUITY.has(product.type) ? computeLtv(profile, amount) : null;
  const range = evaluateRange(config.rateCard[product.id], { amount, ltv: ltv ?? undefined });
  const dti = range ? computeDti(profile, range.highPayment) : null;

  // rate_range style: no credit step.
  const routing = (config.providerRouting[product.id] ?? []).filter((s) => s.module !== 'credit');
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
    creditPulled: false,
    range,
    verified: routing.map((s) => ({ module: s.module, provider: s.provider, label: s.label })),
    coreRef: `${config.coreSync.system.toUpperCase()}-${id.replace('ASB-', '')}`,
  };
}

/** Apply a borrower-chosen term to a summary, recomputing the band's DTI. */
export function withChosenTerm(summary: ApplicationSummary, termMonths: number): ApplicationSummary {
  if (!summary.range) return summary;
  const range = selectRangeTerm(summary.range, termMonths);
  return { ...summary, range, dti: computeDti(summary.profile, range.highPayment) };
}

/** Pseudo-product used to render a data_only intake (no loan) in the LO view. */
const VERIFICATION_PRODUCT: WLProduct = {
  id: 'verification',
  type: 'deposit',
  label: 'Identity & data verification',
  blurb: 'Borrower data verification (no loan product).',
  iconPath: 'M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z M9 12l2 2 4-4',
  minAmount: 0,
  maxAmount: 0,
  defaultAmount: 0,
  purposes: [],
};

/**
 * Adapt an Intake (any flow) into an ApplicationSummary for the LO view and the
 * narrated handoff. data_only intakes carry no product/amount, so a
 * verification pseudo-product is used and loan fields are left empty.
 */
export function intakeToSummary(config: WhiteLabelConfig, intake: Intake): ApplicationSummary {
  const product = intake.product ?? VERIFICATION_PRODUCT;
  const id = intake.applicationId ?? `VER-${intake.intakeId}`;
  return {
    applicationId: id,
    product,
    amount: intake.amount ?? 0,
    purpose: intake.purpose ?? '',
    purposeLabel: intake.purpose
      ? config.purposes.find((p) => p.value === intake.purpose)?.label ?? intake.purpose
      : 'Verification',
    profile: intake.profile,
    ltv: intake.ltv ?? null,
    dti: intake.dti ?? null,
    creditPulled: Boolean(intake.creditPulled),
    range: intake.range ?? null,
    verified: intake.steps.map((s) => ({ module: s.module, provider: s.provider, label: s.label })),
    coreRef: `${config.coreSync.system.toUpperCase()}-${id.replace(/^[A-Z]+-/, '')}`,
    age: 'Just now',
  };
}
