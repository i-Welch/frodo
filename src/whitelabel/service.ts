import { randomUUID } from 'node:crypto';
import type { FlowKind, Intake, IntakeStatus, ModuleName, PullStep, SubmitResult, WhiteLabelConfig } from './types.js';
import { resolveSlug, getConfigByTenant } from './config-store.js';
import { getFlow } from './flows.js';
import { providerSetForMode, MODULE_PROVIDERS } from './mock.js';
import { evaluateRange, evaluatePoint, selectRangeTerm, computeLtv, computeDti } from './rate-engine.js';
import { putIntake, getStoredIntake, listIntakesByTenant } from './intake-store.js';

/**
 * Intake orchestration. The single Intake entity is persisted to DynamoDB
 * (encrypted; see intake-store.ts). Demo vs live is decided by the tenant/host
 * mode, which selects the ProviderSet. Async, DynamoDB-only.
 */

const EQUITY_TYPES = new Set(['heloc', 'home-equity', 'mortgage']);
const DEFAULT_DATA_ONLY_MODULES: ModuleName[] = ['identity', 'employment', 'financial'];

function applicationId(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `APP-${100000 + (h % 900000)}`;
}

function stepsForLoan(config: WhiteLabelConfig, productId: string, pullCredit: boolean): PullStep[] {
  return (config.providerRouting[productId] ?? [])
    // Honor the flow's credit-pull setting: rate_range (no credit) drops the
    // credit step so we never pull a bureau report for a prequalification.
    .filter((s) => pullCredit || s.module !== 'credit')
    .map((s) => ({ module: s.module, provider: s.provider, label: s.label, interactive: s.interactive }));
}

function stepsForModules(modules: ModuleName[]): PullStep[] {
  return modules.filter((m) => MODULE_PROVIDERS[m]).map((m) => ({ module: m, ...MODULE_PROVIDERS[m] }));
}

export interface StartIntakeInput {
  slug: string;
  flow: FlowKind;
  applicant: { fullName: string; email: string; phone?: string };
  productId?: string;
  amount?: number;
  purpose?: string;
  modules?: ModuleName[];
}

export async function startIntake(input: StartIntakeInput): Promise<Intake> {
  const tenant = await resolveSlug(input.slug);
  if (!tenant) throw new Error(`Unknown white-label slug: ${input.slug}`);
  const config = await getConfigByTenant(tenant.tenantId);
  if (!config) throw new Error(`No white-label config for tenant: ${tenant.tenantId}`);
  const flowDef = getFlow(input.flow);
  const providers = providerSetForMode(tenant.mode);

  const product = input.productId ? config.products.find((p) => p.id === input.productId) : undefined;
  const amount = product ? input.amount ?? product.defaultAmount : undefined;

  // Credit is pulled when the flow asks for it (full_application), or — for the
  // product-agnostic data_only flow — when the requester explicitly selects it.
  const pullCredit =
    flowDef.creditPull !== 'none' ||
    (input.flow === 'data_only' && (input.modules ?? DEFAULT_DATA_ONLY_MODULES).includes('credit'));

  const steps = product
    ? stepsForLoan(config, product.id, pullCredit)
    : stepsForModules(input.modules ?? DEFAULT_DATA_ONLY_MODULES);
  const creditPulled = steps.some((s) => s.module === 'credit');

  const profile = await providers.enrich({ applicant: input.applicant, amount: amount ?? 0, steps });

  // Only the rate_range flow shows a borrower-facing rate, and it does so as a
  // no-credit BAND. full_application goes to async bank decisioning (no quote);
  // data_only has no rate.
  // rate_range (no credit) shows a BAND; full_application (credit pulled) shows
  // an individualized POINT from the rate sheet; data_only shows no rate.
  let range = null;
  let ltv: number | null = null;
  let dti: number | null = null;
  if (product && amount !== undefined) {
    if (EQUITY_TYPES.has(product.type)) ltv = computeLtv(profile, amount);
    const card = config.rateCard[product.id];
    if (flowDef.terminal === 'rateRange') {
      range = evaluateRange(card, { amount, ltv: ltv ?? undefined });
    } else if (creditPulled) {
      range = evaluatePoint(card, { amount, score: profile.credit.score, ltv: ltv ?? undefined });
    }
    if (range) dti = computeDti(profile, range.highPayment);
  }

  const intake: Intake = {
    intakeId: randomUUID(),
    applicationId: product ? applicationId(`${input.applicant.fullName}|${input.applicant.email}|${product.id}`) : undefined,
    slug: input.slug,
    flow: input.flow,
    mode: tenant.mode,
    status: range ? 'rate_ready' : 'data_ready',
    steps,
    profile,
    applicant: input.applicant,
    product,
    amount,
    purpose: input.purpose,
    creditPulled,
    range,
    ltv,
    dti,
    isLegalApplication: flowDef.isLegalApplication,
    createdAt: new Date().toISOString(),
  };

  await putIntake({ ...intake, tenantId: tenant.tenantId });
  return intake;
}

export async function getIntake(intakeId: string): Promise<Intake | undefined> {
  return getStoredIntake(intakeId);
}

export async function chooseTerm(intakeId: string, termMonths: number): Promise<Intake | undefined> {
  const intake = await getStoredIntake(intakeId);
  if (!intake) return undefined;
  if (!intake.range) return intake;
  const tenant = await resolveSlug(intake.slug);
  if (!tenant) return intake;
  const range = selectRangeTerm(intake.range, termMonths);
  const dti = computeDti(intake.profile, range.highPayment);
  const updated: Intake = { ...intake, range, dti, status: 'rate_ready' };
  await putIntake({ ...updated, tenantId: tenant.tenantId });
  return updated;
}

export async function submitIntake(intakeId: string): Promise<SubmitResult | undefined> {
  const intake = await getStoredIntake(intakeId);
  if (!intake) return undefined;
  const tenant = await resolveSlug(intake.slug);
  if (!tenant) return undefined;
  const flowDef = getFlow(intake.flow);

  let status: IntakeStatus;
  let result: SubmitResult;
  switch (flowDef.terminal) {
    case 'decision':
      status = 'under_review';
      result = { terminal: 'decision', status: 'under_review' };
      break;
    case 'rateRange':
      status = 'routed';
      // A rate_range product without a configured rate card has no range;
      // fall through to a loan-officer handoff rather than asserting one.
      result = intake.range
        ? { terminal: 'rateRange', range: intake.range }
        : { terminal: 'routeToLo' };
      break;
    case 'routeToLo':
    default:
      status = 'routed';
      result = { terminal: 'routeToLo' };
  }

  await putIntake({ ...intake, status, tenantId: tenant.tenantId });
  return result;
}

/** LO queue listing (used by the dashboard). */
export async function listIntakes(tenantId: string, opts?: { limit?: number; cursor?: string }) {
  return listIntakesByTenant(tenantId, opts);
}
