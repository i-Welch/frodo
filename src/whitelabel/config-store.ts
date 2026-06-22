import { putItem, getItem } from '../store/base-store.js';
import type { PublicWhiteLabelConfig, WhiteLabelConfig } from './types.js';

/**
 * White-label config + tenant resolution, persisted in DynamoDB (main table).
 *
 *   PK=TENANT#<tenantId>  SK=WLCONFIG          -> the config (not PII, plaintext)
 *   PK=WLSLUG#<slug>      SK=METADATA          -> { tenantId, mode }  (path entry)
 *   PK=HOST#<hostname>    SK=METADATA          -> { tenantId, slug, mode }  (subdomain/custom domain)
 *
 * Resolution: slug/host -> tenantId(+mode) -> WLCONFIG. Seed with
 * scripts/seed-whitelabel.ts. (Intake PII lives in its own encrypted store.)
 */

export interface TenantRef {
  tenantId: string;
  mode: 'demo' | 'live';
}

function configKey(tenantId: string) {
  return { PK: `TENANT#${tenantId}`, SK: 'WLCONFIG' };
}
function slugKey(slug: string) {
  return { PK: `WLSLUG#${slug}`, SK: 'METADATA' };
}
function hostKey(host: string) {
  return { PK: `HOST#${host.toLowerCase()}`, SK: 'METADATA' };
}

// --- reads -----------------------------------------------------------------

export async function resolveSlug(slug: string): Promise<TenantRef | undefined> {
  const item = await getItem(slugKey(slug));
  if (!item) return undefined;
  return { tenantId: item.tenantId as string, mode: item.mode as 'demo' | 'live' };
}

export async function resolveHost(
  host: string,
): Promise<{ tenantId: string; slug: string; mode: 'demo' | 'live' } | undefined> {
  const item = await getItem(hostKey(host));
  if (!item) return undefined;
  return {
    tenantId: item.tenantId as string,
    slug: item.slug as string,
    mode: item.mode as 'demo' | 'live',
  };
}

export async function getConfigByTenant(tenantId: string): Promise<WhiteLabelConfig | undefined> {
  const item = await getItem(configKey(tenantId));
  return item ? (item.config as WhiteLabelConfig) : undefined;
}

/** Convenience: resolve a slug and load its config in one call. */
export async function getConfig(slug: string): Promise<WhiteLabelConfig | undefined> {
  const ref = await resolveSlug(slug);
  if (!ref) return undefined;
  return getConfigByTenant(ref.tenantId);
}

// --- writes (seed / admin) -------------------------------------------------

export async function putWhiteLabelConfig(tenantId: string, config: WhiteLabelConfig): Promise<void> {
  await putItem({ ...configKey(tenantId), config, version: 1, updatedAt: new Date().toISOString() });
}

export async function putSlugRecord(slug: string, tenantId: string, mode: 'demo' | 'live'): Promise<void> {
  await putItem({ ...slugKey(slug), tenantId, mode });
}

export async function putHostRecord(
  host: string,
  tenantId: string,
  slug: string,
  mode: 'demo' | 'live',
): Promise<void> {
  await putItem({ ...hostKey(host), tenantId, slug, mode });
}

// --- projection ------------------------------------------------------------

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
