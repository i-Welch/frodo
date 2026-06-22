/**
 * ApiClient — talks to the Elysia white-label backend (/api/v1/wl/*).
 *
 * Implements the same WhiteLabelClient seam as MockClient, so swapping the two
 * is transparent to the journey (see _client/index.ts). Requests go to a
 * relative path by default so the Next dev/prod rewrite proxies them to the
 * backend (no CORS); set NEXT_PUBLIC_API_URL to call a backend origin directly.
 */

import type { Intake, StartIntakeInput, SubmitResult, WhiteLabelClient } from './client';

const BASE = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/wl`;

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
    estimate: (d.estimate as Intake['estimate']) ?? null,
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

  async selectTerm(intakeId: string, termMonths: number): Promise<Intake> {
    return toIntake(
      await req(`/intake/${intakeId}/term`, { method: 'POST', body: JSON.stringify({ termMonths }) }),
    );
  }

  async submit(intakeId: string): Promise<SubmitResult> {
    return req<SubmitResult>(`/intake/${intakeId}/submit`, { method: 'POST' });
  }
}
