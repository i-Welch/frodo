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
import { firstRelianceBank } from '../src/whitelabel/first-reliance-bank.js';
import { colonyBankcorp } from '../src/whitelabel/colony-bankcorp.js';
import { carolinaBankTrust } from '../src/whitelabel/carolina-bank-trust.js';
import { coastalStatesBank } from '../src/whitelabel/coastal-states-bank.js';
import { oconeeFederal } from '../src/whitelabel/oconee-federal.js';
import { andersonBrothersBank } from '../src/whitelabel/anderson-brothers-bank.js';
import { southernFirstBank } from '../src/whitelabel/southern-first-bank.js';
import { ravenBank } from '../src/whitelabel/raven-bank.js';
import type { WhiteLabelConfig } from '../src/whitelabel/types.js';

interface Seed {
  tenantId: string;
  mode: 'demo' | 'live';
  hosts: string[];
  config: WhiteLabelConfig;
}

const SEEDS: Seed[] = [
  { tenantId: 'tnt_arthur_state', mode: 'demo', hosts: ['arthur-state-bank.submit.loans'], config: arthurStateBank },
  { tenantId: 'tnt_first_reliance', mode: 'demo', hosts: ['first-reliance-bank.submit.loans'], config: firstRelianceBank },
  { tenantId: 'tnt_colony_bankcorp', mode: 'demo', hosts: ['colony-bankcorp.submit.loans'], config: colonyBankcorp },
  { tenantId: 'tnt_carolina_bank_trust', mode: 'demo', hosts: ['carolina-bank-trust.submit.loans'], config: carolinaBankTrust },
  { tenantId: 'tnt_coastal_states', mode: 'demo', hosts: ['coastal-states-bank.submit.loans'], config: coastalStatesBank },
  { tenantId: 'tnt_oconee_federal', mode: 'demo', hosts: ['oconee-federal.submit.loans'], config: oconeeFederal },
  { tenantId: 'tnt_anderson_brothers', mode: 'demo', hosts: ['anderson-brothers-bank.submit.loans'], config: andersonBrothersBank },
  { tenantId: 'tnt_southern_first', mode: 'demo', hosts: ['southern-first-bank.submit.loans'], config: southernFirstBank },
  { tenantId: 'tnt_raven_bank', mode: 'demo', hosts: ['raven-bank.submit.loans'], config: ravenBank },
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
