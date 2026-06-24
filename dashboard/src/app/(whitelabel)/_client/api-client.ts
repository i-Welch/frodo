/**
 * ApiClient — talks to the Elysia white-label backend (/api/v1/wl/*).
 *
 * Implements the same WhiteLabelClient seam as MockClient, so swapping the two
 * is transparent to the journey (see _client/index.ts). Requests go to a
 * relative path by default so the Next dev/prod rewrite proxies them to the
 * backend (no CORS); set NEXT_PUBLIC_API_URL to call a backend origin directly.
 */

import type {
  Intake,
  StartIntakeInput,
  SubmitResult,
  WhiteLabelClient,
  TermUpdate,
  VerifyApplicant,
  VerifyRequestData,
} from './client';
import { getDeviceId } from './device';

// Always relative: the browser hits the same origin (e.g. <bank>.submit.loans)
// and Next's rewrite proxies /api/* to the backend server-side, so there is no
// cross-origin request and no CORS to manage. The proxy target is configured by
// NEXT_PUBLIC_API_URL in next.config (used server-side, not here).
const BASE = '/api/v1/wl';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error ?? `white-label API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Map the backend intake payload onto the front-end Intake shape. */
function toIntake(d: Record<string, unknown>): Intake {
  return {
    intakeId: d.intakeId as string,
    slug: d.slug as string,
    flow: d.flow as Intake['flow'],
    status: d.status as Intake['status'],
    steps: (d.steps as Intake['steps']) ?? [],
    profile: d.profile as Intake['profile'],
    product: d.product as Intake['product'],
    amount: d.amount as number | undefined,
    purpose: d.purpose as string | undefined,
    creditPulled: Boolean(d.creditPulled),
    range: (d.range as Intake['range']) ?? null,
    ltv: (d.ltv as number | null) ?? null,
    dti: (d.dti as number | null) ?? null,
    applicationId: d.applicationId as string | undefined,
  };
}

export class ApiClient implements WhiteLabelClient {
  async startIntake(input: StartIntakeInput): Promise<Intake> {
    const body = {
      slug: input.slug,
      flow: input.flow,
      applicant: input.applicant,
      productId: input.product?.id,
      amount: input.product ? input.amount : undefined,
      purpose: input.product ? input.purpose : undefined,
      modules: input.modules,
    };
    return toIntake(await req('/intake', { method: 'POST', body: JSON.stringify(body) }));
  }

  async selectTerm(intakeId: string, termMonths: number): Promise<TermUpdate> {
    const d = await req<Record<string, unknown>>(`/intake/${intakeId}/term`, {
      method: 'POST',
      body: JSON.stringify({ termMonths }),
    });
    return {
      intakeId: d.intakeId as string,
      status: d.status as Intake['status'],
      range: (d.range as Intake['range']) ?? null,
      dti: (d.dti as number | null) ?? null,
    };
  }

  async submit(intakeId: string): Promise<SubmitResult> {
    return req<SubmitResult>(`/intake/${intakeId}/submit`, { method: 'POST' });
  }

  async createVerifyRequest(input: { slug: string; modules: string[]; applicant: VerifyApplicant }): Promise<{ token: string }> {
    return req<{ token: string }>('/verify-request', { method: 'POST', body: JSON.stringify(input) });
  }

  async getVerifyRequest(token: string): Promise<VerifyRequestData | null> {
    try {
      return await req<VerifyRequestData>(`/verify-request/${encodeURIComponent(token)}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ deviceId: getDeviceId() }),
      });
    } catch {
      // 404 (expired), 409 (bound to another device), or any transient error
      // all mean "can't resume here".
      return null;
    }
  }
}
