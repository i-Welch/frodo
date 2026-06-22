import { randomUUID } from 'node:crypto';
import type { FlowKind, Intake, ModuleName, PullStep, SubmitResult, WhiteLabelConfig } from './types.js';
import { getConfig, modeForSlug } from './config-store.js';
import { getFlow } from './flows.js';
import { providerSetForMode, MODULE_PROVIDERS } from './mock.js';
import { evaluateRate, selectTerm as selectTermOnEstimate, computeLtv, computeDti } from './rate-engine.js';

/**
 * Intake store + orchestration. In-memory for sandbox/demo; the production
 * store persists the single Intake entity to DynamoDB (PK=TENANT#<id>,
 * SK=INTAKE#<id>) and lists it for the LO queue. The orchestration is the same
 * regardless of store or mode.
 */
const INTAKES = new Map<string, Intake>();

const EQUITY_TYPES = new Set(['heloc', 'home-equity', 'mortgage']);
const DEFAULT_DATA_ONLY_MODULES: ModuleName[] = ['identity', 'employment', 'financial'];

/** Deterministic friendly application id for loan flows. */
function applicationId(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `APP-${100000 + (h % 900000)}`;
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

function stepsForLoan(config: WhiteLabelConfig, productId: string): PullStep[] {
  return (config.providerRouting[productId] ?? []).map((s) => ({
    module: s.module,
    provider: s.provider,
    label: s.label,
    interactive: s.interactive,
  }));
}

function stepsForModules(modules: ModuleName[]): PullStep[] {
  return modules
    .filter((m) => MODULE_PROVIDERS[m])
    .map((m) => ({ module: m, ...MODULE_PROVIDERS[m] }));
}

export async function startIntake(input: StartIntakeInput): Promise<Intake> {
  const config = getConfig(input.slug);
  if (!config) throw new Error(`Unknown white-label slug: ${input.slug}`);
  const flowDef = getFlow(input.flow);
  const mode = modeForSlug(input.slug);
  const providers = providerSetForMode(mode);

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
    estimate = evaluateRate(config.rateCard[product.id], {
      amount,
      score: profile.credit.score,
      ltv: ltv ?? undefined,
    });
    if (estimate) dti = computeDti(profile, estimate.monthlyPayment);
  }

  const intake: Intake = {
    intakeId: randomUUID(),
    applicationId: product ? applicationId(`${input.applicant.fullName}|${input.applicant.email}|${product.id}`) : undefined,
    slug: input.slug,
    flow: input.flow,
    mode,
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
  INTAKES.set(intake.intakeId, intake);
  return intake;
}

export function getIntake(intakeId: string): Intake | undefined {
  return INTAKES.get(intakeId);
}

export function chooseTerm(intakeId: string, termMonths: number): Intake | undefined {
  const intake = INTAKES.get(intakeId);
  if (!intake || !intake.estimate) return intake;
  const estimate = selectTermOnEstimate(intake.estimate, termMonths);
  intake.estimate = estimate;
  intake.dti = computeDti(intake.profile, estimate.monthlyPayment);
  INTAKES.set(intakeId, intake);
  return intake;
}

export function submitIntake(intakeId: string): SubmitResult | undefined {
  const intake = INTAKES.get(intakeId);
  if (!intake) return undefined;
  const flowDef = getFlow(intake.flow);
  switch (flowDef.terminal) {
    case 'rateRange':
      intake.status = 'routed';
      INTAKES.set(intakeId, intake);
      return { terminal: 'rateRange', estimate: intake.estimate! };
    case 'decision':
      // Async, bank-owned decisioning: in-session we only reach "under review".
      intake.status = 'under_review';
      INTAKES.set(intakeId, intake);
      return { terminal: 'decision', status: 'under_review' };
    case 'routeToLo':
    default:
      intake.status = 'routed';
      INTAKES.set(intakeId, intake);
      return { terminal: 'routeToLo' };
  }
}
