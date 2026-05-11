/**
 * Recertification check — flags tenants whose §1033 / FFIEC TPRM diligence
 * is overdue or about to expire.
 *
 * Intended to run on a daily/weekly schedule (cron or scheduled Lambda).
 *
 * Output is structured JSON to stdout so it can be piped into alerting
 * (Slack webhook, PagerDuty, etc.). Exits non-zero if any tenant has
 * overdue diligence and is currently holding a production key — that
 * means we are asserting to Plaid we have something we no longer have.
 *
 * Usage:
 *   bun scripts/recertification-check.ts
 *   bun scripts/recertification-check.ts --warn-days=30
 */

import { listTenants } from '../src/store/tenant-store.js';
import { isProductionEligible } from '../src/tenancy/permissions.js';
import type { Tenant } from '../src/tenancy/types.js';

const args = process.argv.slice(2);
const warnDaysArg = args.find((a) => a.startsWith('--warn-days='));
const WARN_DAYS = warnDaysArg ? Number(warnDaysArg.split('=')[1]) : 30;

interface TenantStatus {
  tenantId: string;
  name: string;
  status: 'ok' | 'expiring-soon' | 'overdue';
  eligible: boolean;
  missing: string[];
  stale: string[];
  nextRecertificationDue?: string;
  daysUntilDue?: number;
}

function daysUntil(iso: string | undefined): number | undefined {
  if (!iso) return undefined;
  const due = Date.parse(iso);
  if (Number.isNaN(due)) return undefined;
  return Math.round((due - Date.now()) / (24 * 60 * 60 * 1000));
}

function classify(tenant: Tenant): TenantStatus {
  const eligibility = isProductionEligible(tenant);
  const days = daysUntil(tenant.nextRecertificationDue);

  let status: TenantStatus['status'] = 'ok';
  if (eligibility.stale.length > 0 || (days !== undefined && days < 0)) {
    status = 'overdue';
  } else if (days !== undefined && days <= WARN_DAYS) {
    status = 'expiring-soon';
  }

  return {
    tenantId: tenant.tenantId,
    name: tenant.name,
    status,
    eligible: eligibility.eligible,
    missing: eligibility.missing,
    stale: eligibility.stale,
    nextRecertificationDue: tenant.nextRecertificationDue,
    daysUntilDue: days,
  };
}

async function main() {
  const tenants = await listTenants();
  const statuses = tenants.map(classify);

  const overdue = statuses.filter((s) => s.status === 'overdue');
  const expiring = statuses.filter((s) => s.status === 'expiring-soon');

  const summary = {
    checkedAt: new Date().toISOString(),
    totalTenants: statuses.length,
    overdue: overdue.length,
    expiringSoon: expiring.length,
    ok: statuses.length - overdue.length - expiring.length,
    tenants: statuses,
  };

  console.log(JSON.stringify(summary, null, 2));

  // Exit non-zero if any tenant is overdue — surface a failure to whatever
  // scheduler is running this script so on-call gets paged.
  if (overdue.length > 0) {
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('recertification-check failed', err);
  process.exit(1);
});
