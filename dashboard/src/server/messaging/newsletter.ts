import { createHmac, timingSafeEqual } from 'node:crypto';
import { articles, type Article } from '../../app/(marketing)/blog/articles-index';
import { BLOG_DATES, BLOG_SLUGS } from '../../app/(marketing)/blog/published';
import { DE_NOVO_BANKS, STATUS_LABELS, type DeNovoBank } from '../../app/(marketing)/de-novo-watch/de-novo-data';
import type { EmailMessage } from './email';

/**
 * The weekly RAVEN newsletter: the articles published in the past week, plus
 * any De Novo Watch status changes, sent from the founder to everyone who
 * subscribed on the site.
 *
 * Env vars:
 * - NEWSLETTER_SECRET          signs unsubscribe links (falls back to RAVEN_AUTOMATION_SECRET)
 * - NEWSLETTER_POSTAL_ADDRESS  mailing address for the footer; required by CAN-SPAM, so issues
 *                              are not sent without it
 * - LEAD_REPLY_FROM            sender (default: Isaac Welch <isaac@reportraven.tech>)
 */

const SITE = 'https://reportraven.tech';
const FROM = process.env.LEAD_REPLY_FROM ?? 'Isaac Welch <isaac@reportraven.tech>';
const REPLY_TO = FROM.match(/<(.+)>/)?.[1] ?? FROM;

export function postalAddress(): string | undefined {
  return process.env.NEWSLETTER_POSTAL_ADDRESS?.trim() || undefined;
}

function signingKey(): string {
  const key = process.env.NEWSLETTER_SECRET ?? process.env.RAVEN_AUTOMATION_SECRET;
  if (!key) throw new Error('NEWSLETTER_SECRET is not set');
  return key.trim();
}

export function unsubscribeToken(email: string): string {
  return createHmac('sha256', signingKey()).update(email.trim().toLowerCase()).digest('base64url').slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(email: string): string {
  return `${SITE}/api/v1/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

/** Published articles dated in the 7 days ending on `issueDate` (YYYY-MM-DD), newest first. */
export function weeklyArticles(issueDate: string): (Article & { publishedOn: string })[] {
  const end = Date.parse(`${issueDate}T23:59:59Z`);
  const start = end - 7 * 86_400_000;
  const published = new Set<string>(BLOG_SLUGS);
  return articles
    .filter((a) => published.has(a.slug) && BLOG_DATES[a.slug])
    .map((a) => ({ ...a, publishedOn: BLOG_DATES[a.slug] }))
    .filter((a) => {
      const t = Date.parse(`${a.publishedOn}T12:00:00Z`);
      return t > start && t <= end;
    })
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
}

export interface TrackerChange {
  name: string;
  location: string;
  status: string;
  detail: string;
}

/** De Novo Watch rows added or whose status changed in the 7 days ending on `issueDate`. */
export function weeklyTrackerChanges(issueDate: string, rows: DeNovoBank[] = DE_NOVO_BANKS): TrackerChange[] {
  const end = Date.parse(`${issueDate}T23:59:59Z`);
  const start = end - 7 * 86_400_000;
  return rows
    .filter((r) => {
      if (!r.statusChanged) return false;
      const t = Date.parse(`${r.statusChanged}T12:00:00Z`);
      return t > start && t <= end;
    })
    .map((r) => ({ name: r.name, location: r.location, status: STATUS_LABELS[r.status], detail: r.statusDetail }));
}

function articleUrl(slug: string, issueDate: string): string {
  return `${SITE}/blog/${slug}?utm_source=newsletter&utm_medium=email&utm_campaign=weekly-${issueDate}`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export interface Issue {
  subject: string;
  preview: string;
  articles: ReturnType<typeof weeklyArticles>;
  tracker: TrackerChange[];
}

export function buildIssue(issueDate: string, tracker: TrackerChange[] = weeklyTrackerChanges(issueDate)): Issue | null {
  const list = weeklyArticles(issueDate);
  if (list.length === 0 && tracker.length === 0) return null;
  if (list.length === 0) {
    const [first] = tracker;
    const subject =
      tracker.length === 1 ? `De Novo Watch: ${first.name} (${first.status})` : `De Novo Watch: ${tracker.length} new bank updates`;
    return { subject, preview: `${first.name}, ${first.location}: ${first.status}.`, articles: list, tracker };
  }
  const subject = list.length === 1 ? list[0].title : `${list[0].title} (+${list.length - 1} more from RAVEN)`;
  return { subject, preview: list[0].description, articles: list, tracker };
}

/** Renders one recipient's copy of an issue, with their own unsubscribe link. */
export function issueMessage(issue: Issue, issueDate: string, to: string, address: string): EmailMessage {
  const unsub = unsubscribeUrl(to);
  const count = issue.articles.length === 1 ? 'one new analysis' : `${issue.articles.length} new analyses`;
  const intro = issue.articles.length
    ? `This week on RAVEN: ${count} built from public filings on community banks and credit unions.`
    : 'This week on De Novo Watch: new bank filings, approvals and openings, from FDIC and state regulator records.';
  const trackerUrl = `${SITE}/de-novo-watch?utm_source=newsletter&utm_medium=email&utm_campaign=weekly-${issueDate}`;
  const trackerHeading = 'De Novo Watch this week';
  const audit =
    'Want this treatment for your own institution? Request a free digital lending audit and we will build it from your call report and HMDA data:';
  const auditUrl = `${SITE}/audit/robins-financial-credit-union?utm_source=newsletter&utm_medium=email&utm_campaign=weekly-${issueDate}`;

  const text = [
    intro,
    '',
    ...issue.articles.flatMap((a) => [a.title, a.description, articleUrl(a.slug, issueDate), '']),
    ...(issue.tracker.length
      ? [trackerHeading, ...issue.tracker.map((c) => `- ${c.name} (${c.location}): ${c.status}. ${c.detail}`), trackerUrl, '']
      : []),
    `${audit}\n${auditUrl}`,
    '',
    'Reply any time. I read every response.',
    '',
    'Isaac Welch',
    'Founder, RAVEN',
    '',
    '--',
    `You subscribed at reportraven.tech. Unsubscribe: ${unsub}`,
    address,
  ].join('\n');

  const items = issue.articles
    .map(
      (a) => `
      <tr><td style="padding:0 0 28px">
        <a href="${articleUrl(a.slug, issueDate)}" style="font-size:20px;line-height:1.3;font-weight:700;color:#111827;text-decoration:none">${escapeHtml(a.title)}</a>
        <p style="margin:8px 0 10px;font-size:15px;line-height:1.6;color:#374151">${escapeHtml(a.description)}</p>
        <a href="${articleUrl(a.slug, issueDate)}" style="font-size:14px;font-weight:600;color:#2563eb;text-decoration:none">Read the analysis (${escapeHtml(a.readTime)}) &rarr;</a>
      </td></tr>`,
    )
    .join('');

  const trackerHtml = issue.tracker.length
    ? `
    <tr><td style="padding:0 32px 24px">
      <div style="border-top:1px solid #e5e7eb;padding-top:20px">
        <div style="font-size:13px;font-weight:700;letter-spacing:.08em;color:#6b7280;margin-bottom:12px">${trackerHeading.toUpperCase()}</div>
        ${issue.tracker
          .map(
            (c) =>
              `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151"><strong style="color:#111827">${escapeHtml(c.name)}</strong> (${escapeHtml(c.location)}): ${escapeHtml(c.status)}. ${escapeHtml(c.detail)}</p>`,
          )
          .join('')}
        <a href="${trackerUrl}" style="font-size:14px;font-weight:600;color:#2563eb;text-decoration:none">See the full tracker &rarr;</a>
      </div>
    </td></tr>`
    : '';

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f3f4f6">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(issue.preview)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
    <tr><td style="padding:28px 32px 8px;font-size:13px;font-weight:700;letter-spacing:.08em;color:#6b7280">RAVEN WEEKLY</td></tr>
    <tr><td style="padding:0 32px 24px;font-size:15px;line-height:1.6;color:#374151">${escapeHtml(intro)}</td></tr>
    <tr><td style="padding:0 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table></td></tr>${trackerHtml}
    <tr><td style="padding:0 32px 28px">
      <div style="border-top:1px solid #e5e7eb;padding-top:20px;font-size:15px;line-height:1.6;color:#374151">
        ${escapeHtml(audit)} <a href="${auditUrl}" style="color:#2563eb;font-weight:600">see an example audit</a>.
        <p style="margin:16px 0 0">Reply any time. I read every response.<br><br>Isaac Welch<br>Founder, RAVEN</p>
      </div>
    </td></tr>
  </table>
  <p style="max-width:600px;margin:16px auto 0;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#6b7280">
    You subscribed at reportraven.tech. <a href="${unsub}" style="color:#6b7280">Unsubscribe</a><br>${escapeHtml(address)}
  </p>
</td></tr></table></body></html>`;

  return {
    to,
    from: FROM,
    replyTo: REPLY_TO,
    subject: issue.subject,
    text,
    html,
    headers: {
      'List-Unsubscribe': `<${unsub}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}
