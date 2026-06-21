import type { PublicWhiteLabelConfig, WhiteLabelConfig } from './types.js';
import { arthurStateBank } from './arthur-state-bank.js';

/**
 * White-label config store. Seeded in-memory for now (mirrors the front-end
 * demo); the production implementation reads WhiteLabelConfig per tenant from
 * DynamoDB (PK=TENANT#<id>, SK=WLCONFIG) and resolves host -> tenant via the
 * lookup table. Swapping this out does not touch the service or routes.
 */
const CONFIGS: WhiteLabelConfig[] = [arthurStateBank];

/** host -> { slug, mode }. In production this is a DynamoDB lookup record. */
const HOST_MAP: Record<string, { slug: string; mode: 'demo' | 'live' }> = {
  'arthur-state-bank.submit.loans': { slug: 'arthur-state-bank', mode: 'demo' },
};

export function getConfig(slug: string): WhiteLabelConfig | undefined {
  return CONFIGS.find((c) => c.slug === slug);
}

export function resolveHost(host: string): { slug: string; mode: 'demo' | 'live' } | undefined {
  return HOST_MAP[host.toLowerCase()];
}

/** Mode for a slug. For now everything seeded is demo; real tenants set this on the host record. */
export function modeForSlug(slug: string): 'demo' | 'live' {
  const hostEntry = Object.values(HOST_MAP).find((h) => h.slug === slug);
  return hostEntry?.mode ?? 'demo';
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
