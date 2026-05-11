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

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { listTenants } from '../src/store/tenant-store.js';
import { isProductionEligible } from '../src/tenancy/permissions.js';
import type { Tenant } from '../src/tenancy/types.js';

const AWS_REGION = process.env.AWS_REGION ?? 'us-east-2';
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL ?? 'noreply@reportraven.tech';
const ALERT_TO_EMAIL = process.env.RECERT_ALERT_TO ?? 'isaac@reportraven.tech';

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

function renderEmailBody(
  overdue: TenantStatus[],
  expiring: TenantStatus[],
  total: number,
): { text: string; html: string } {
  const lines: string[] = [];
  lines.push(`RAVEN recertification check — ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`Total tenants: ${total}`);
  lines.push(`Overdue: ${overdue.length}`);
  lines.push(`Expiring within ${WARN_DAYS} days: ${expiring.length}`);
  lines.push('');

  if (overdue.length > 0) {
    lines.push('--- OVERDUE ---');
    for (const t of overdue) {
      lines.push(`${t.name} (${t.tenantId})`);
      if (t.missing.length > 0) lines.push(`  missing: ${t.missing.join(', ')}`);
      if (t.stale.length > 0) lines.push(`  stale:   ${t.stale.join(', ')}`);
      if (t.daysUntilDue !== undefined) lines.push(`  due:     ${t.daysUntilDue} days`);
      lines.push('');
    }
  }

  if (expiring.length > 0) {
    lines.push('--- EXPIRING SOON ---');
    for (const t of expiring) {
      lines.push(`${t.name} (${t.tenantId}) — due in ${t.daysUntilDue} days`);
    }
    lines.push('');
  }

  const text = lines.join('\n');
  const html = `<pre style="font-family:ui-monospace,Menlo,monospace;font-size:13px">${text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')}</pre>`;
  return { text, html };
}

async function sendAlertEmail(
  subject: string,
  body: { text: string; html: string },
): Promise<void> {
  const ses = new SESClient({ region: AWS_REGION });
  await ses.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: { ToAddresses: [ALERT_TO_EMAIL] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: body.text, Charset: 'UTF-8' },
          Html: { Data: body.html, Charset: 'UTF-8' },
        },
      },
    }),
  );
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

  // Email an alert if anything needs attention.
  if (overdue.length > 0 || expiring.length > 0) {
    const subject =
      overdue.length > 0
        ? `[RAVEN] ${overdue.length} tenant(s) OVERDUE for recertification`
        : `[RAVEN] ${expiring.length} tenant(s) expiring within ${WARN_DAYS} days`;
    try {
      await sendAlertEmail(subject, renderEmailBody(overdue, expiring, statuses.length));
      console.error(`alert email sent to ${ALERT_TO_EMAIL}`);
    } catch (err) {
      console.error('failed to send alert email', err);
      // Don't swallow the failure — still exit non-zero below if overdue.
    }
  }

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
