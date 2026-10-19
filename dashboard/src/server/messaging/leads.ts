import { sendEmail } from './email';
import { logger } from '../logger';
import { describeInstitution, type BankSnapshot } from './lead-enrichment';

/**
 * Lead notifications for the marketing site: an alert to the founder and a
 * plain-text confirmation to the lead, sent from the founder's address so
 * replies land in a real inbox.
 *
 * Env vars:
 * - LEAD_ALERT_TO   (default: isaac@reportraven.tech)
 * - LEAD_REPLY_FROM (default: Isaac Welch <isaac@reportraven.tech>)
 */

export type LeadKind = 'subscribe' | 'audit' | 'demo';

export interface Lead {
  kind: LeadKind;
  email: string;
  name?: string;
  bank?: string;
  source?: string;
  /** Latest call report figures for a confident FDIC match (audit requests). */
  snapshot?: BankSnapshot;
}

const ALERT_TO = process.env.LEAD_ALERT_TO ?? 'isaac@reportraven.tech';
const FOUNDER_FROM = process.env.LEAD_REPLY_FROM ?? 'Isaac Welch <isaac@reportraven.tech>';
const FOUNDER_EMAIL = FOUNDER_FROM.match(/<(.+)>/)?.[1] ?? FOUNDER_FROM;
const SITE = 'https://reportraven.tech';
const CALENDLY_URL = 'https://calendly.com/welchcisaac/raven-intro';

const KIND_LABEL: Record<LeadKind, string> = {
  subscribe: 'Newsletter signup',
  audit: 'Free audit request',
  demo: 'Demo request',
};

/** Turns a source like "article:robins-financial-20-million-rebate" into a page URL. */
function sourceUrl(source?: string): string | undefined {
  const match = source?.match(/^(article|audit):([a-z0-9-]+)/);
  if (!match) return undefined;
  return `${SITE}/${match[1] === 'article' ? 'blog' : 'audit'}/${match[2]}`;
}

function alertMessage(lead: Lead, institution: string[]) {
  const lines = [
    `${KIND_LABEL[lead.kind]} on reportraven.tech`,
    '',
    `Name:   ${lead.name ?? '(not given)'}`,
    `Email:  ${lead.email}`,
    lead.bank ? `Bank:   ${lead.bank}` : null,
    `Source: ${lead.source ?? 'unknown'}`,
    sourceUrl(lead.source) ? `Page:   ${sourceUrl(lead.source)}` : null,
    ...(institution.length ? ['', ...institution] : []),
    '',
    lead.kind === 'audit'
      ? 'They were told the audit arrives within a few business days.'
      : 'They received an automatic confirmation from you. Reply to this email to reach them directly.',
  ].filter((l): l is string => l !== null);
  const who = lead.bank ? `${lead.name ?? lead.email} (${lead.bank})` : (lead.name ?? lead.email);
  return {
    to: ALERT_TO,
    replyTo: lead.email,
    subject: `New lead: ${KIND_LABEL[lead.kind].toLowerCase()} from ${who}`,
    text: lines.join('\n'),
  };
}

function snapshotParagraph(s: BankSnapshot | undefined): string {
  if (!s) return '';
  const growth =
    s.loanGrowthPct === undefined ? '' : ` (${s.loanGrowthPct > 0 ? 'up' : 'down'} ${Math.abs(s.loanGrowthPct)}% over the past year)`;
  return (
    `While I work on it, here's where ${s.name} stood in its ${s.quarter} FDIC call report: ${s.assets} in total assets, ` +
    `${s.loans} in net loans${growth}, and a ${s.roaPct}% return on assets. The audit adds what the call report can't show: ` +
    `how borrowers apply online today and what's missing from that journey.\n\n`
  );
}

function confirmationMessage(lead: Lead) {
  const first = lead.name?.trim().split(/\s+/)[0];
  const greeting = first ? `Hi ${first},` : 'Hi,';
  const signoff = `\n\nIsaac Welch\nFounder, RAVEN\n${SITE}`;
  const bodies: Record<LeadKind, { subject: string; text: string }> = {
    subscribe: {
      subject: "You're on the RAVEN list",
      text:
        `${greeting}\n\nThanks for subscribing. You'll get RAVEN's new analyses of community banks and credit unions by email: ` +
        `deep dives built from FDIC, NCUA, HMDA and SEC filings, plus the occasional market read.\n\n` +
        `If there's an institution or question you want us to dig into, just reply. I read every response.` +
        signoff,
    },
    audit: {
      subject: `Your digital lending audit${lead.bank ? ` for ${lead.bank}` : ''}`,
      text:
        `${greeting}\n\nThanks for requesting a free digital lending audit${lead.bank ? ` of ${lead.bank}` : ''}. ` +
        `I'll build it from your public call report and HMDA data and send it within a few business days.\n\n` +
        snapshotParagraph(lead.snapshot) +
        `Here's an example of what you'll get:\n${SITE}/audit/robins-financial-credit-union\n\n` +
        `If you'd rather walk through it live, grab 20 minutes here:\n${CALENDLY_URL}` +
        signoff,
    },
    demo: {
      subject: 'Your RAVEN demo',
      text:
        `${greeting}\n\nThanks for your interest in RAVEN. The fastest way to see it is a 20-minute call; pick any time that works:\n${CALENDLY_URL}\n\n` +
        `Or reply with a couple of times and I'll send an invite.` +
        signoff,
    },
  };
  return { to: lead.email, from: FOUNDER_FROM, replyTo: FOUNDER_EMAIL, ...bodies[lead.kind] };
}

/** Emails a requester their finished audit, copying the founder. Throws on
 *  failure so the caller can leave the request undelivered and retry. */
export async function deliverAudit(lead: Lead, auditSlug: string, institutionName: string): Promise<void> {
  const first = lead.name?.trim().split(/\s+/)[0];
  const url = `${SITE}/audit/${auditSlug}`;
  await sendEmail({
    to: lead.email,
    from: FOUNDER_FROM,
    replyTo: FOUNDER_EMAIL,
    subject: `Your digital lending audit: ${institutionName}`,
    text:
      `${first ? `Hi ${first},` : 'Hi,'}\n\nYour free digital lending audit for ${institutionName} is ready:\n${url}\n\n` +
      `It walks through your current borrower journey, where applicants drop off or wait, and what source-verified intake would ` +
      `save across your lending lines, with every figure tied to your public call report and HMDA filings (methodology at the bottom of the page).\n\n` +
      `If any number looks off against what you see internally, reply and I'll rerun it. Happy to walk through it live, too:\n${CALENDLY_URL}` +
      `\n\nIsaac Welch\nFounder, RAVEN\n${SITE}`,
  });
  await sendEmail({
    to: ALERT_TO,
    replyTo: lead.email,
    subject: `Audit delivered: ${institutionName} to ${lead.name ?? lead.email}`,
    text: `The audit for ${institutionName} was emailed to ${lead.name ?? ''} <${lead.email}>.\n\n${url}\n\nReply to this email to follow up with them directly.`,
  });
}

/** One personal check-in a few days after an audit is delivered. Throws on
 *  failure so the request stays eligible for the next run. */
export async function auditFollowUp(lead: Lead, auditSlug: string, institutionName: string): Promise<void> {
  const first = lead.name?.trim().split(/s+/)[0];
  await sendEmail({
    to: lead.email,
    from: FOUNDER_FROM,
    replyTo: FOUNDER_EMAIL,
    subject: `Re: Your digital lending audit: ${institutionName}`,
    text:
      `${first ? `Hi ${first},` : 'Hi,'}

Checking in on the ${institutionName} audit I sent last week:
${SITE}/audit/${auditSlug}

` +
      `Two sections are worth a closer look: the comparison table, which sets each step of today's borrower journey against the same step with verification automated, and the ROI estimate, which runs on your own HMDA and call report volumes.

` +
      `If it would help to walk through the numbers together, or to see the white-label demo branded for ${institutionName}, here's my calendar:
${CALENDLY_URL}

` +
      `And if the timing isn't right, no problem at all. Just reply and let me know.` +
      `

Isaac Welch
Founder, RAVEN
${SITE}`,
  });
}

/** Sends the founder alert and the lead confirmation. Never throws: a failed
 *  email must not fail the signup, which is already stored. */
export async function notifyLead(lead: Lead): Promise<void> {
  // A snapshot already identifies the bank; skip the second FDIC lookup.
  const institution = lead.snapshot
    ? [`FDIC match: ${lead.snapshot.name}, ${lead.snapshot.city}, ${lead.snapshot.state}: ${lead.snapshot.assets} assets, FDIC cert ${lead.snapshot.cert}`]
    : await describeInstitution(lead);
  const results = await Promise.allSettled([
    sendEmail(alertMessage(lead, institution)),
    sendEmail(confirmationMessage(lead)),
  ]);
  for (const r of results) {
    if (r.status === 'rejected') logger.error({ err: r.reason, kind: lead.kind }, 'Lead email failed');
  }
}
