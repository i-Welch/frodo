import type { PublicWhiteLabelConfig, WhiteLabelConfig } from './types.js';
import { arthurStateBank } from './arthur-state-bank.js';

/**
 * White-label config + tenant resolution.
 *
 * Config and the slug/host -> tenant resolution are seeded in-memory here
 * (config is bank branding/rates, not PII). Persisting WhiteLabelConfig per
 * tenant (PK=TENANT#<id>, SK=WLCONFIG) and the WLSLUG#/HOST# lookup records to
 * DynamoDB is the documented next step; the intake store (the PII-bearing
 * entity) is already DynamoDB-backed and encrypted. Resolution returns the
 * tenantId + mode used to key and partition intakes.
 */

interface TenantResolution {
  tenantId: string;
  slug: string;
  mode: 'demo' | 'live';
  hosts: string[];
}

const TENANTS: TenantResolution[] = [
  {
    tenantId: 'tnt_arthur_state',
    slug: 'arthur-state-bank',
    mode: 'demo',
    hosts: ['arthur-state-bank.submit.loans'],
  },
];

const CONFIGS: WhiteLabelConfig[] = [arthurStateBank];

export function getConfig(slug: string): WhiteLabelConfig | undefined {
  return CONFIGS.find((c) => c.slug === slug);
}

/** Resolve a path slug to its tenant + mode. */
export function resolveSlug(slug: string): { tenantId: string; mode: 'demo' | 'live' } | undefined {
  const t = TENANTS.find((x) => x.slug === slug);
  return t ? { tenantId: t.tenantId, mode: t.mode } : undefined;
}

/** Resolve a hostname (submit.loans subdomain or custom domain) to its tenant. */
export function resolveHost(host: string): { tenantId: string; slug: string; mode: 'demo' | 'live' } | undefined {
  const t = TENANTS.find((x) => x.hosts.includes(host.toLowerCase()));
  return t ? { tenantId: t.tenantId, slug: t.slug, mode: t.mode } : undefined;
}

/** Strip server-only internals (rate grid, provider routing, core internals). */
export function toPublicConfig(config: WhiteLabelConfig): PublicWhiteLabelConfig {
  return {
    slug: config.slug,
    branding: config.branding,
    products: config.products,
    defaultFlows: config.defaultFlows ?? ['rate_range'],
    purposes: config.purposes,
    coreSyncDisplayName: config.coreSync.displayName,
    loTeam: config.loTeam,
  };
}
