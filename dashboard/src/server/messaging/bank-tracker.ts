import type { EmailMessage } from './email';
import type { BankSnapshot } from './lead-enrichment';
import { unsubscribeUrl } from './newsletter';

/**
 * Bank tracker: visitors to a bank's peer snapshot can ask for an email when
 * that bank's next FDIC call report posts. One plain-text email per tracked
 * bank per quarter, from the founder, with the same unsubscribe link and
 * postal address as the newsletter.
 */

const SITE = 'https://reportraven.tech';
const FROM = process.env.LEAD_REPLY_FROM ?? 'Isaac Welch <isaac@reportraven.tech>';
const REPLY_TO = FROM.match(/<(.+)>/)?.[1] ?? FROM;

export function trackerUrl(s: BankSnapshot, quarter: string): string {
  const campaign = `tracker-${quarter.toLowerCase().replace(/\s+/g, '-')}`;
  return `${SITE}/bank-snapshot/${s.cert}?utm_source=tracker&utm_medium=email&utm_campaign=${campaign}`;
}

export function trackerMessage(s: BankSnapshot, to: string, address: string): EmailMessage {
  const unsub = unsubscribeUrl(to);
  const growth =
    s.loanGrowthPct === undefined ? '' : `, ${s.loanGrowthPct >= 0 ? 'up' : 'down'} ${Math.abs(s.loanGrowthPct)}% from a year earlier`;
  const text = [
    'Hi,',
    '',
    `${s.name}'s ${s.quarter} call report is out. The headline numbers:`,
    '',
    `- Total assets: ${s.assets}`,
    `- Deposits: ${s.deposits}`,
    `- Net loans: ${s.loans}${growth}`,
    `- Return on assets: ${s.roaPct}%`,
    '',
    `How that compares with banks its size in ${s.state}, including efficiency ratio and the closest peers:`,
    trackerUrl(s, s.quarter),
    '',
    `If you want to see how ${s.name}'s online lending journey stacks up as well, reply and I'll build a free digital lending audit from its call report and HMDA data.`,
    '',
    'Isaac Welch',
    'Founder, RAVEN',
    '',
    '--',
    `You asked for quarterly updates on ${s.name} at reportraven.tech. Unsubscribe: ${unsub}`,
    address,
  ].join('\n');
  return {
    to,
    from: FROM,
    replyTo: REPLY_TO,
    subject: `${s.name}: ${s.quarter} call report is out`,
    text,
    headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}
