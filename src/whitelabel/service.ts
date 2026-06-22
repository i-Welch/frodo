import { randomUUID } from 'node:crypto';
import type { FlowKind, Intake, ModuleName, PullStep, SubmitResult, WhiteLabelConfig } from './types.js';
import { resolveSlug, getConfigByTenant } from './config-store.js';
import { getFlow } from './flows.js';
import { providerSetForMode, MODULE_PROVIDERS } from './mock.js';
import { evaluateRate, selectTerm as selectTermOnEstimate, computeLtv, computeDti } from './rate-engine.js';
import {
  putIntake,
  getStoredIntake,
  updateIntakeEstimate,
  updateIntakeStatus,
  listIntakesByTenant,
} from './intake-store.js';

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

function stepsForLoan(config: WhiteLabelConfig, productId: string): PullStep[] {
  return (config.providerRouting[productId] ?? []).map((s) => ({
    module: s.module,
    provider: s.provider,
    label: s.label,
    interactive: s.interactive,
  }));
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

  const steps = product
    ? stepsForLoan(config, product.id)
    : stepsForModules(input.modules ?? DEFAULT_DATA_ONLY_MODULES);

  const profile = await providers.enrich({ applicant: input.applicant, amount: amount ?? 0, steps });

  let estimate = null;
  let ltv: number | null = null;
  let dti: number | null = null;
  if (product && amount !== undefined) {
    if (EQUITY_TYPES.has(product.type)) ltv = computeLtv(profile, amount);
    estimate = evaluateRate(config.rateCard[product.id], { amount, score: profile.credit.score, ltv: ltv ?? undefined });
    if (estimate) dti = computeDti(profile, estimate.monthlyPayment);
  }

  const intake: Intake = {
    intakeId: randomUUID(),
    applicationId: product ? applicationId(`${input.applicant.fullName}|${input.applicant.email}|${product.id}`) : undefined,
    slug: input.slug,
    flow: input.flow,
    mode: tenant.mode,
    status: estimate ? 'rate_ready' : 'data_ready',
    steps,
    profile,
    applicant: input.applicant,
    product,
    amount,
    purpose: input.purpose,
    estimate,
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
  if (!intake.estimate) return intake;
  const estimate = selectTermOnEstimate(intake.estimate, termMonths);
  const dti = computeDti(intake.profile, estimate.monthlyPayment);
  await updateIntakeEstimate(intakeId, estimate, dti);
  return { ...intake, estimate, dti, status: 'rate_ready' };
}

export async function submitIntake(intakeId: string): Promise<SubmitResult | undefined> {
  const intake = await getStoredIntake(intakeId);
  if (!intake) return undefined;
  const flowDef = getFlow(intake.flow);
  switch (flowDef.terminal) {
    case 'rateRange':
      await updateIntakeStatus(intakeId, 'routed');
      // A rate_range product without a configured rate card has no estimate;
      // fall through to a loan-officer handoff rather than asserting one.
      if (intake.estimate) return { terminal: 'rateRange', estimate: intake.estimate };
      return { terminal: 'routeToLo' };
    case 'decision':
      await updateIntakeStatus(intakeId, 'under_review');
      return { terminal: 'decision', status: 'under_review' };
    case 'routeToLo':
    default:
      await updateIntakeStatus(intakeId, 'routed');
      return { terminal: 'routeToLo' };
  }
}

/** LO queue listing (used by the dashboard). */
export async function listIntakes(tenantId: string, opts?: { limit?: number; cursor?: string }) {
  return listIntakesByTenant(tenantId, opts);
}
