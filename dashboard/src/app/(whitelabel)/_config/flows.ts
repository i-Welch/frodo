/**
 * Flow framework for the white-label borrower experience.
 *
 * The three flows (see docs/whitelabel-platform-design.md) are not three
 * systems: they are one journey parameterized by two pluggable points (credit
 * pull + terminal outcome) plus a legal-weight flag. A flow is a declarative
 * bundle; the journey is a generic runner over its `stages`.
 *
 * Which flow a borrower gets is decided by the entry context (path or signed
 * link), validated against what the tenant/product config permits. This module
 * defines the flows themselves and the path <-> flow mapping; capability gating
 * lives in the config (allowedFlows).
 */

export type FlowKind = 'data_only' | 'rate_range' | 'full_application';

/** The ordered steps a journey can render. Each flow uses a subset. */
export type Stage =
  | 'frontDoor' // amount + purpose
  | 'product' // product selection
  | 'modulePicker' // data_only: requester/borrower picks which modules to pull
  | 'applicant' // name / email / phone
  | 'consent' // flow-specific consent + permissible purpose
  | 'dataPull' // provider enrichment (the animation)
  | 'rate' // rate range (rate_range)
  | 'decision' // bank decision terminal (full_application, async)
  | 'confirmation';

export type CreditPull = 'none' | 'soft' | 'hard';
export type Terminal = 'routeToLo' | 'rateRange' | 'decision';

export interface FlowDefinition {
  kind: FlowKind;
  /** Human label for the demo flow switcher and analytics. */
  label: string;
  /** Public path segment that selects this flow, e.g. /apply, /check-rate. */
  path: string;
  /** Ordered stages the journey runs for this flow. */
  stages: Stage[];
  creditPull: CreditPull;
  terminal: Terminal;
  /** Whether reaching the terminal constitutes a legal application (ECOA/TRID). */
  isLegalApplication: boolean;
  /** Consent template key captured before any data pull. */
  consentTemplate: string;
}

export const FLOWS: Record<FlowKind, FlowDefinition> = {
  data_only: {
    kind: 'data_only',
    label: 'Data verification',
    path: 'verify',
    stages: ['applicant', 'modulePicker', 'consent', 'dataPull', 'confirmation'],
    creditPull: 'none',
    terminal: 'routeToLo',
    isLegalApplication: false,
    consentTemplate: 'data-pull',
  },
  rate_range: {
    kind: 'rate_range',
    label: 'Check your rate',
    path: 'check-rate',
    stages: ['frontDoor', 'product', 'applicant', 'consent', 'dataPull', 'rate', 'confirmation'],
    creditPull: 'none',
    terminal: 'rateRange',
    isLegalApplication: false,
    consentTemplate: 'data-pull',
  },
  full_application: {
    kind: 'full_application',
    label: 'Apply',
    path: 'apply',
    // No `rate` stage: full_application submits to async bank decisioning rather
    // than quoting a self-serve rate. The decision + any AAN arrive later.
    stages: ['frontDoor', 'product', 'applicant', 'consent', 'dataPull', 'confirmation'],
    creditPull: 'hard',
    terminal: 'decision',
    isLegalApplication: true,
    consentTemplate: 'application-fcra',
  },
};

export const ALL_FLOWS: FlowDefinition[] = Object.values(FLOWS);

export function getFlow(kind: FlowKind): FlowDefinition {
  return FLOWS[kind];
}

/** Reverse the public path segment (apply | check-rate | verify) to a flow. */
export function flowForPath(pathSegment: string): FlowKind | undefined {
  return ALL_FLOWS.find((f) => f.path === pathSegment)?.kind;
}

/**
 * Resolve the flow a borrower actually gets. Server-authoritative in
 * production: a requested flow is honored only if it is in `allowedFlows`,
 * otherwise we fall back to the first allowed flow (never silently escalate to
 * a more permissive / credit-pulling flow). Returns undefined if nothing is
 * allowed.
 */
export function resolveFlow(
  requested: FlowKind | undefined,
  allowedFlows: FlowKind[],
): FlowKind | undefined {
  if (allowedFlows.length === 0) return undefined;
  if (requested && allowedFlows.includes(requested)) return requested;
  return allowedFlows[0];
}
