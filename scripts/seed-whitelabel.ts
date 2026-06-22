/**
 * Seed white-label config + resolution records into DynamoDB.
 *
 *   bun scripts/seed-whitelabel.ts
 *
 * Writes, for each seeded tenant:
 *   TENANT#<tenantId> / WLCONFIG     -> the WhiteLabelConfig
 *   WLSLUG#<slug>      / METADATA     -> { tenantId, mode }
 *   HOST#<hostname>    / METADATA     -> { tenantId, slug, mode }
 *
 * Idempotent (puts overwrite). Requires DYNAMODB_ENDPOINT (local) or AWS creds.
 */
import { putWhiteLabelConfig, putSlugRecord, putHostRecord } from '../src/whitelabel/config-store.js';
import { arthurStateBank } from '../src/whitelabel/arthur-state-bank.js';
import type { WhiteLabelConfig } from '../src/whitelabel/types.js';

interface Seed {
  tenantId: string;
  mode: 'demo' | 'live';
  hosts: string[];
  config: WhiteLabelConfig;
}

const SEEDS: Seed[] = [
  {
    tenantId: 'tnt_arthur_state',
    mode: 'demo',
    hosts: ['arthur-state-bank.submit.loans'],
    config: arthurStateBank,
  },
];

async function main() {
  for (const s of SEEDS) {
    await putWhiteLabelConfig(s.tenantId, s.config);
    await putSlugRecord(s.config.slug, s.tenantId, s.mode);
    for (const host of s.hosts) {
      await putHostRecord(host, s.tenantId, s.config.slug, s.mode);
    }
    console.log(`Seeded ${s.config.slug} (tenant ${s.tenantId}, mode ${s.mode}, hosts: ${s.hosts.join(', ')})`);
  }
  console.log('White-label seed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
