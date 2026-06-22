import type { FlowDefinition, FlowKind } from './types.js';

/** The three flows as declarative bundles. Mirrors the front-end flow registry. */
export const FLOWS: Record<FlowKind, FlowDefinition> = {
  data_only: {
    kind: 'data_only',
    label: 'Data verification',
    path: 'verify',
    stages: ['applicant', 'consent', 'dataPull', 'confirmation'],
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
    stages: ['frontDoor', 'product', 'applicant', 'consent', 'dataPull', 'rate', 'confirmation'],
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

export function flowForPath(pathSegment: string): FlowKind | undefined {
  return ALL_FLOWS.find((f) => f.path === pathSegment)?.kind;
}

/**
 * Server-authoritative flow resolution: honor the requested flow only if it is
 * permitted; otherwise fall back to the first allowed flow. Never escalate.
 */
export function resolveFlow(
  requested: FlowKind | undefined,
  allowedFlows: FlowKind[],
): FlowKind | undefined {
  if (allowedFlows.length === 0) return undefined;
  if (requested && allowedFlows.includes(requested)) return requested;
  return allowedFlows[0];
}
