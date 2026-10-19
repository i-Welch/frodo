import { Elysia, t } from 'elysia';
import { ConditionalCheckFailedError, putItem, queryItems, updateItem } from '../../store/base-store';
import { sendEmailBatch } from '../../messaging/email';
import { buildIssue, issueMessage, postalAddress, verifyUnsubscribeToken } from '../../messaging/newsletter';
import { createChildLogger } from '../../logger';
import { adminAuth } from './leads-admin';

type Item = Record<string, unknown>;

const log = createChildLogger({ module: 'newsletter' });

async function queryAll(pk: string, skPrefix?: string): Promise<Item[]> {
  const all: Item[] = [];
  let cursor: string | undefined;
  do {
    const page = await queryItems({ pk, skPrefix, cursor, limit: 500 });
    all.push(...page.items);
    cursor = page.cursor;
  } while (cursor);
  return all;
}

/** Everyone who subscribed and has not unsubscribed since. Re-subscribing after an unsubscribe counts. */
export async function activeSubscribers(): Promise<string[]> {
  const latestSignup = new Map<string, string>();
  for (const i of await queryAll('INTEREST', 'SIGNUP#')) {
    if (i.kind !== 'subscribe' || typeof i.email !== 'string') continue;
    const email = i.email.trim().toLowerCase();
    const ts = i.timestamp as string;
    if (!latestSignup.has(email) || latestSignup.get(email)! < ts) latestSignup.set(email, ts);
  }
  const unsubAt = new Map((await queryAll('UNSUB')).map((u) => [u.SK as string, u.unsubscribedAt as string]));
  return [...latestSignup].filter(([email, ts]) => !unsubAt.has(email) || unsubAt.get(email)! < ts).map(([email]) => email);
}

async function unsubscribe(email: string, token: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!verifyUnsubscribeToken(normalized, token)) return false;
  await putItem({ PK: 'UNSUB', SK: normalized, email: normalized, unsubscribedAt: new Date().toISOString() });
  log.info({ email: normalized }, 'Newsletter unsubscribe');
  return true;
}

const page = (title: string, body: string) =>
  new Response(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>` +
      `<body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:80px auto;padding:0 16px;color:#111827">` +
      `<h1 style="font-size:22px">${title}</h1><p style="line-height:1.6;color:#374151">${body}</p>` +
      `<p><a href="https://reportraven.tech/blog" style="color:#2563eb">Back to RAVEN</a></p></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );

const unsubQuery = t.Object({ e: t.String({ maxLength: 254 }), t: t.String({ maxLength: 64 }) });

/**
 * GET  /api/v1/unsubscribe  — link in every issue's footer.
 * POST /api/v1/unsubscribe  — RFC 8058 one-click unsubscribe from the mail client.
 */
export const unsubscribeRoutes = new Elysia({ prefix: '/api/v1' })
  .get(
    '/unsubscribe',
    async ({ query }) =>
      (await unsubscribe(query.e, query.t))
        ? page("You're unsubscribed", "You won't get the RAVEN newsletter anymore. If that was a mistake, you can subscribe again at the bottom of any article.")
        : page('Link not recognized', 'This unsubscribe link is invalid. Reply to any newsletter email and we will remove you by hand.'),
    { query: unsubQuery },
  )
  .post(
    '/unsubscribe',
    async ({ query, set }) => {
      if (!(await unsubscribe(query.e, query.t))) set.status = 400;
      return { ok: set.status !== 400 };
    },
    { query: unsubQuery },
  );

/**
 * POST /api/v1/admin/newsletter/send — sends the weekly issue (articles published
 * in the 7 days ending on issueDate). Each issue date sends at most once.
 * dryRun reports what would go out; testTo sends a single copy without recording.
 */
export const newsletterAdminRoutes = new Elysia({ prefix: '/api/v1/admin/newsletter' })
  .onBeforeHandle(({ headers, set }) => {
    const result = adminAuth(headers as Record<string, string | undefined>, set);
    if (result) return result;
  })
  .post(
    '/send',
    async ({ body, set }) => {
      const issueDate = body.issueDate ?? new Date().toISOString().slice(0, 10);
      const address = postalAddress();
      if (!address) {
        set.status = 412;
        return { error: 'NEWSLETTER_POSTAL_ADDRESS is not set (CAN-SPAM requires a mailing address in every issue)' };
      }
      const issue = buildIssue(issueDate);
      if (!issue) return { sent: 0, skipped: 'no articles published this week' };
      const slugs = issue.articles.map((a) => a.slug);

      if (body.testTo) {
        await sendEmailBatch([issueMessage(issue, issueDate, body.testTo, address)]);
        return { sent: 1, test: true, subject: issue.subject, slugs };
      }

      const recipients = await activeSubscribers();
      if (body.dryRun) return { dryRun: true, recipients: recipients.length, subject: issue.subject, slugs };

      const key = { PK: 'NEWSLETTER', SK: `ISSUE#${issueDate}` };
      try {
        await putItem({ ...key, status: 'sending', subject: issue.subject, slugs, startedAt: new Date().toISOString() }, { ifNotExists: true });
      } catch (err) {
        if (err instanceof ConditionalCheckFailedError) return { sent: 0, alreadySent: true };
        throw err;
      }

      let sent = 0;
      for (let i = 0; i < recipients.length; i += 100) {
        await sendEmailBatch(recipients.slice(i, i + 100).map((to) => issueMessage(issue, issueDate, to, address)));
        sent += Math.min(100, recipients.length - i);
      }
      await updateItem(key, { status: 'sent', recipients: sent, sentAt: new Date().toISOString() });
      log.info({ issueDate, sent, slugs }, 'Newsletter issue sent');
      return { sent, subject: issue.subject, slugs };
    },
    {
      body: t.Object({
        issueDate: t.Optional(t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })),
        dryRun: t.Optional(t.Boolean()),
        testTo: t.Optional(t.String({ format: 'email' })),
      }),
    },
  );
