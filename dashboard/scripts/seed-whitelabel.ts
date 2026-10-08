/**
 * Seed white-label config + resolution records into Postgres.
 *
 *   bun scripts/seed-whitelabel.ts
 *
 * Writes, for each seeded tenant:
 *   TENANT#<tenantId> / WLCONFIG     -> the WhiteLabelConfig
 *   WLSLUG#<slug>      / METADATA     -> { tenantId, mode }
 *   HOST#<hostname>    / METADATA     -> { tenantId, slug, mode }
 *
 * Seeds every bank in the front-end registry (_config/registry.ts).
 * Idempotent (puts overwrite). Requires DATABASE_URL.
 */
import { putWhiteLabelConfig, putSlugRecord, putHostRecord } from '../src/server/whitelabel/config-store';
import { WL_CONFIGS } from '../src/app/(whitelabel)/_config/registry';
import { pool } from '../src/server/store/db';
import type { WhiteLabelConfig } from '../src/server/whitelabel/types';

// Tenant ids that were already in use before the registry-driven seed.
const LEGACY_TENANT_IDS: Record<string, string> = {
  'arthur-state-bank': 'tnt_arthur_state',
  'first-reliance-bank': 'tnt_first_reliance',
  'colony-bankcorp': 'tnt_colony_bankcorp',
  'carolina-bank-trust': 'tnt_carolina_bank_trust',
  'coastal-states-bank': 'tnt_coastal_states',
  'oconee-federal': 'tnt_oconee_federal',
  'anderson-brothers-bank': 'tnt_anderson_brothers',
  'southern-first-bank': 'tnt_southern_first',
  'raven-bank': 'tnt_raven_bank',
};

const WL_DOMAIN = 'submit.loans';

function tenantIdFor(slug: string): string {
  return LEGACY_TENANT_IDS[slug] ?? `tnt_${slug.replace(/-/g, '_')}`;
}

async function main() {
  for (const config of WL_CONFIGS) {
    const tenantId = tenantIdFor(config.slug);
    const host = `${config.slug}.${WL_DOMAIN}`;
    // The front-end and back-end config shapes are identical.
    await putWhiteLabelConfig(tenantId, config as unknown as WhiteLabelConfig);
    await putSlugRecord(config.slug, tenantId, 'demo');
    await putHostRecord(host, tenantId, config.slug, 'demo');
    console.log(`Seeded ${config.slug} (tenant ${tenantId}, mode demo, host ${host})`);
  }
  console.log(`White-label seed complete: ${WL_CONFIGS.length} banks.`);
  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
