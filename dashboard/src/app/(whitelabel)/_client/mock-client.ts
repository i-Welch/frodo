/**
 * MockClient — the demo/sandbox implementation of WhiteLabelClient.
 *
 * Deterministic (seeded by name+email) so live demos, screenshots, and videos
 * are reproducible. Holds intakes in memory for the session. In production this
 * is replaced by an ApiClient hitting /api/v1/wl/*; the journey is unchanged.
 */

import type {
  WhiteLabelClient,
  Intake,
  StartIntakeInput,
  SubmitResult,
  PullStep,
} from './client';
import { MODULE_PROVIDERS } from './client';
import { getWlConfig } from '../_config/registry';
import { getFlow, type FlowKind } from '../_config/flows';
import { generateMockProfile } from '../_config/mock-engine';
import { buildApplicationSummary, withChosenTerm } from '../_config/summary';

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter.toString().padStart(4, '0')}`;
}

function requireConfig(slug: string) {
  const config = getWlConfig(slug);
  if (!config) throw new Error(`Unknown white-label slug: ${slug}`);
  return config;
}

export class MockClient implements WhiteLabelClient {
  private intakes = new Map<string, Intake>();

  async getContext(slug: string, flow: FlowKind) {
    return { config: requireConfig(slug), flow: getFlow(flow) };
  }

  async startIntake(input: StartIntakeInput): Promise<Intake> {
    const config = requireConfig(input.slug);
    const intakeId = nextId('INTAKE');

    // Loan flows (rate_range / full_application): reuse the application summary
    // builder for profile + provider routing + rate + LTV/DTI.
    if (input.product) {
      const summary = buildApplicationSummary(
        config,
        input.product,
        input.amount ?? input.product.defaultAmount,
        input.purpose ?? input.product.purposes[0],
        { ...input.applicant, amount: input.amount ?? input.product.defaultAmount },
      );
      const routing = config.providerRouting[input.product.id] ?? [];
      const steps: PullStep[] = routing.map((s) => ({
        module: s.module,
        provider: s.provider,
        label: s.label,
        interactive: s.interactive,
      }));
      const intake: Intake = {
        intakeId,
        slug: input.slug,
        flow: input.flow,
        status: 'data_ready',
        steps,
        profile: summary.profile,
        product: input.product,
        amount: summary.amount,
        purpose: input.purpose,
        estimate: summary.estimate,
        ltv: summary.ltv,
        dti: summary.dti,
        applicationId: summary.applicationId,
      };
      this.intakes.set(intakeId, intake);
      return intake;
    }

    // data_only: product-agnostic; steps come from the chosen modules.
    const modules = input.modules ?? ['identity', 'employment', 'financial'];
    const steps: PullStep[] = modules
      .filter((m) => MODULE_PROVIDERS[m])
      .map((m) => ({ module: m, ...MODULE_PROVIDERS[m] }));
    const intake: Intake = {
      intakeId,
      slug: input.slug,
      flow: input.flow,
      status: 'data_ready',
      steps,
      profile: generateMockProfile({ ...input.applicant, amount: 0 }),
    };
    this.intakes.set(intakeId, intake);
    return intake;
  }

  async selectTerm(intakeId: string, termMonths: number): Promise<Intake> {
    const intake = this.intakes.get(intakeId);
    if (!intake) throw new Error(`Unknown intake: ${intakeId}`);
    if (intake.estimate) {
      const config = requireConfig(intake.slug);
      // Rebuild the summary so DTI is recomputed for the chosen term.
      const summary = buildApplicationSummary(
        config,
        intake.product!,
        intake.amount ?? intake.product!.defaultAmount,
        intake.purpose ?? intake.product!.purposes[0],
        {
          fullName: intake.profile.identity.fullName,
          email: intake.profile.contact.email,
          phone: intake.profile.contact.phone,
          amount: intake.amount ?? intake.product!.defaultAmount,
        },
      );
      const chosen = withChosenTerm(summary, termMonths);
      intake.estimate = chosen.estimate;
      intake.dti = chosen.dti;
      intake.status = 'rate_ready';
    }
    this.intakes.set(intakeId, intake);
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
        return { terminal: 'rateRange', estimate: intake.estimate! };
      case 'decision':
        // Async, bank-owned: we only ever reach "under review" in-session.
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
}

/** Singleton used by the demo journey. */
export const mockClient = new MockClient();
