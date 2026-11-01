import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { Elysia } from 'elysia';
import { ensureTables, pool, TABLE_NAME } from '../../src/server/store/db';
import { BLOG_DATES } from '../../src/app/(marketing)/blog/published';

const sendEmail = vi.fn().mockResolvedValue('msg_123');
const sendEmailBatch = vi.fn().mockResolvedValue(undefined);
vi.mock('../../src/server/messaging/email', () => ({ sendEmail, sendEmailBatch, EMAIL_FROM: 'noreply@reportraven.tech' }));

const { interestRoutes } = await import('../../src/server/api/routes/interest');
const { newsletterAdminRoutes, unsubscribeRoutes, activeSubscribers } = await import('../../src/server/api/routes/newsletter');
const { buildIssue, issueMessage, unsubscribeToken, weeklyArticles, weeklyTrackerChanges } = await import('../../src/server/messaging/newsletter');

const SECRET = 'test-admin-secret';
const app = new Elysia().use(interestRoutes).use(unsubscribeRoutes).use(newsletterAdminRoutes);

// A date with articles in the preceding week: the newest publish date in the data.
const LATEST = Object.values(BLOG_DATES).sort().at(-1)!;

function call(path: string, init: { method?: string; body?: unknown } = {}) {
  return app.handle(
    new Request(`http://localhost${path}`, {
      method: init.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SECRET}` },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    }),
  );
}

async function subscribe(email: string) {
  await call('/api/v1/interest', { method: 'POST', body: { kind: 'subscribe', email } });
}

describe('newsletter', () => {
  const saved = { ...process.env };

  beforeAll(async () => {
    await ensureTables();
  });

  beforeEach(async () => {
    process.env.RAVEN_ADMIN_SECRET = SECRET;
    process.env.NEWSLETTER_SECRET = 'newsletter-secret';
    process.env.NEWSLETTER_POSTAL_ADDRESS = '123 Main St, Columbia, SC 29201';
    sendEmail.mockClear();
    sendEmailBatch.mockClear();
    // Each test controls issue records itself.
    await pool.query(`DELETE FROM ${TABLE_NAME} WHERE pk = 'NEWSLETTER'`);
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it('picks only articles published in the week ending on the issue date', () => {
    const list = weeklyArticles(LATEST);
    expect(list.length).toBeGreaterThan(0);
    for (const a of list) {
      expect(a.publishedOn <= LATEST).toBe(true);
      expect(Date.parse(LATEST) - Date.parse(a.publishedOn)).toBeLessThan(7 * 86_400_000);
    }
    expect(weeklyArticles('2020-01-01')).toEqual([]);
  });

  it('includes De Novo Watch rows whose status changed that week', () => {
    const row = { name: 'New Bank', location: 'Tampa, FL', status: 'open' as const, statusDetail: 'Opened Oct 14.', asOf: '2026-10-15' };
    const rows = [
      { ...row, statusChanged: '2026-10-14' },
      { ...row, name: 'Old Bank', statusChanged: '2026-09-01' },
      { ...row, name: 'Unchanged Bank' },
    ];
    expect(weeklyTrackerChanges('2026-10-16', rows)).toEqual([
      { name: 'New Bank', location: 'Tampa, FL', status: 'Open', detail: 'Opened Oct 14.' },
    ]);

    // A week with tracker news but no articles still gets an issue.
    const issue = buildIssue('2020-01-03', weeklyTrackerChanges('2020-01-03', [{ ...row, statusChanged: '2020-01-02' }]))!;
    expect(issue.subject).toBe('De Novo Watch: New Bank (Open)');
    const msg = issueMessage(issue, '2020-01-03', 'reader@example.org', '123 Main St');
    expect(msg.text).toContain('De Novo Watch this week');
    expect(msg.html).toContain('New Bank');
    expect(msg.html).toContain('/de-novo-watch?utm_source=newsletter');
    expect(buildIssue('2020-01-03', [])).toBeNull();
  });

  it('unsubscribes with a valid token and rejects a forged one', async () => {
    const email = `unsub-${Date.now()}@examplebank.com`;
    await subscribe(email);
    expect(await activeSubscribers()).toContain(email);

    const bad = await call(`/api/v1/unsubscribe?e=${encodeURIComponent(email)}&t=forged`);
    expect(await bad.text()).toContain('not recognized');
    expect(await activeSubscribers()).toContain(email);

    const ok = await call(`/api/v1/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`);
    expect(await ok.text()).toContain("You're unsubscribed");
    expect(await activeSubscribers()).not.toContain(email);

    await new Promise((r) => setTimeout(r, 5));
    await subscribe(email);
    expect(await activeSubscribers()).toContain(email);
  });

  it('supports one-click POST unsubscribe', async () => {
    const email = `oneclick-${Date.now()}@examplebank.com`;
    await subscribe(email);
    const res = await call(`/api/v1/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`, { method: 'POST' });
    expect(res.status).toBe(200);
    expect(await activeSubscribers()).not.toContain(email);
  });

  it('sends an issue once, with per-recipient unsubscribe links', async () => {
    const email = `reader-${Date.now()}@examplecu.org`;
    await subscribe(email);

    const dry = await (await call('/api/v1/admin/newsletter/send', { method: 'POST', body: { issueDate: LATEST, dryRun: true } })).json();
    expect(dry.recipients).toBeGreaterThan(0);
    expect(sendEmailBatch).not.toHaveBeenCalled();

    const res = await (await call('/api/v1/admin/newsletter/send', { method: 'POST', body: { issueDate: LATEST } })).json();
    expect(res.sent).toBe(dry.recipients);
    const msgs = sendEmailBatch.mock.calls.flatMap((c) => c[0]);
    const mine = msgs.find((m) => m.to === email)!;
    expect(mine.headers['List-Unsubscribe']).toContain(unsubscribeToken(email));
    expect(mine.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    expect(mine.text).toContain('123 Main St');
    expect(mine.html).toContain(`utm_campaign=weekly-${LATEST}`);

    sendEmailBatch.mockClear();
    const again = await (await call('/api/v1/admin/newsletter/send', { method: 'POST', body: { issueDate: LATEST } })).json();
    expect(again).toMatchObject({ alreadySent: true });
    expect(sendEmailBatch).not.toHaveBeenCalled();
  });

  it('skips weeks with no new articles and refuses without a postal address', async () => {
    const empty = await (await call('/api/v1/admin/newsletter/send', { method: 'POST', body: { issueDate: '2020-01-01' } })).json();
    expect(empty.sent).toBe(0);

    delete process.env.NEWSLETTER_POSTAL_ADDRESS;
    expect((await call('/api/v1/admin/newsletter/send', { method: 'POST', body: { issueDate: LATEST } })).status).toBe(412);
  });

  it('sends a test copy without recording the issue', async () => {
    const res = await (
      await call('/api/v1/admin/newsletter/send', { method: 'POST', body: { issueDate: LATEST, testTo: 'isaac@reportraven.tech' } })
    ).json();
    expect(res).toMatchObject({ sent: 1, test: true });
    const real = await (await call('/api/v1/admin/newsletter/send', { method: 'POST', body: { issueDate: LATEST, dryRun: true } })).json();
    expect(real.dryRun).toBe(true);
  });
});
