/**
 * MockClient — the demo/sandbox implementation of WhiteLabelClient.
 *
 * Deterministic (seeded by name+email). Mirrors the backend service's
 * flow-aware logic: rate_range pulls no credit and shows a no-credit BAND,
 * full_application pulls credit and shows no rate (async decision), data_only
 * pulls only the chosen modules. Used only when NEXT_PUBLIC_WL_BACKEND is unset;
 * production goes through the ApiClient to the real backend.
 */

import type {
  WhiteLabelClient,
  Intake,
  StartIntakeInput,
  SubmitResult,
  PullStep,
  VerifyApplicant,
  VerifyRequestData,
} from './client';
import { MODULE_PROVIDERS } from './client';
import { getWlConfig } from '../_config/registry';
import { getFlow } from '../_config/flows';
import { generateMockProfile, computeLtv, computeDti } from '../_config/mock-engine';
import { evaluateRange, evaluatePoint, selectRangeTerm } from '../_config/types';

const EQUITY = new Set(['heloc', 'home-equity', 'mortgage']);
const DEFAULT_MODULES = ['identity', 'employment', 'financial'];

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter.toString().padStart(4, '0')}`;
}
function appId(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `APP-${100000 + (h % 900000)}`;
}
function requireConfig(slug: string) {
  const config = getWlConfig(slug);
  if (!config) throw new Error(`Unknown white-label slug: ${slug}`);
  return config;
}

export class MockClient implements WhiteLabelClient {
  private intakes = new Map<string, Intake>();

  async startIntake(input: StartIntakeInput): Promise<Intake> {
    const config = requireConfig(input.slug);
    const flowDef = getFlow(input.flow);
    const product = input.product;
    const amount = product ? input.amount ?? product.defaultAmount : undefined;

    const pullCredit =
      flowDef.creditPull !== 'none' ||
      (input.flow === 'data_only' && (input.modules ?? DEFAULT_MODULES).includes('credit'));

    let steps: PullStep[];
    if (product) {
      steps = (config.providerRouting[product.id] ?? [])
        .filter((s) => pullCredit || s.module !== 'credit')
        .map((s) => ({ module: s.module, provider: s.provider, label: s.label, interactive: s.interactive }));
    } else {
      steps = (input.modules ?? DEFAULT_MODULES)
        .filter((m) => MODULE_PROVIDERS[m])
        .map((m) => ({ module: m, ...MODULE_PROVIDERS[m] }));
    }
    const creditPulled = steps.some((s) => s.module === 'credit');

    const profile = generateMockProfile({ ...input.applicant, amount: amount ?? 0 });

    let range = null;
    let ltv: number | null = null;
    let dti: number | null = null;
    if (product && amount !== undefined) {
      if (EQUITY.has(product.type)) ltv = computeLtv(profile, amount);
      const card = config.rateCard[product.id];
      if (flowDef.terminal === 'rateRange') {
        range = evaluateRange(card, { amount, ltv: ltv ?? undefined });
      } else if (creditPulled) {
        range = evaluatePoint(card, { amount, score: profile.credit.score, ltv: ltv ?? undefined });
      }
      if (range) dti = computeDti(profile, range.highPayment);
    }

    const intake: Intake = {
      intakeId: nextId('INTAKE'),
      slug: input.slug,
      flow: input.flow,
      status: range ? 'rate_ready' : 'data_ready',
      steps,
      profile,
      product,
      amount,
      purpose: input.purpose,
      creditPulled,
      range,
      ltv,
      dti,
      applicationId: product ? appId(`${input.applicant.fullName}|${input.applicant.email}|${product.id}`) : undefined,
    };
    this.intakes.set(intake.intakeId, intake);
    return intake;
  }

  async selectTerm(intakeId: string, termMonths: number): Promise<Intake> {
    const intake = this.intakes.get(intakeId);
    if (!intake) throw new Error(`Unknown intake: ${intakeId}`);
    if (intake.range) {
      const range = selectRangeTerm(intake.range, termMonths);
      intake.range = range;
      intake.dti = computeDti(intake.profile, range.highPayment);
      intake.status = 'rate_ready';
      this.intakes.set(intakeId, intake);
    }
    return intake;
  }

  async submit(intakeId: string): Promise<SubmitResult> {
    const intake = this.intakes.get(intakeId);
    if (!intake) throw new Error(`Unknown intake: ${intakeId}`);
    const flow = getFlow(intake.flow);
    switch (flow.terminal) {
      case 'rateRange':
        intake.status = 'routed';
        this.intakes.set(intakeId, intake);
        return intake.range ? { terminal: 'rateRange', range: intake.range } : { terminal: 'routeToLo' };
      case 'decision':
        intake.status = 'under_review';
        this.intakes.set(intakeId, intake);
        return { terminal: 'decision', status: 'under_review' };
      case 'routeToLo':
      default:
        intake.status = 'routed';
        this.intakes.set(intakeId, intake);
        return { terminal: 'routeToLo' };
    }
  }

  // Verification links. The demo has no backend, so requests are kept in
  // localStorage keyed by token — same-origin, so the link resolves even when
  // opened in a new tab. (Production uses the ApiClient + encrypted DynamoDB.)
  async createVerifyRequest(input: { slug: string; modules: string[]; applicant: VerifyApplicant }): Promise<{ token: string }> {
    const rand = Math.random().toString(36).slice(2, 12);
    const token = `vr_${Date.now().toString(36)}${rand}`;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VERIFY_KEY(token), JSON.stringify(input));
    }
    return { token };
  }

  async getVerifyRequest(token: string): Promise<VerifyRequestData | null> {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(VERIFY_KEY(token));
    return raw ? (JSON.parse(raw) as VerifyRequestData) : null;
  }
}

const VERIFY_KEY = (token: string) => `raven_vr_${token}`;

/** Singleton used by the demo journey when the backend is not enabled. */
export const mockClient = new MockClient();
