import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { Elysia } from 'elysia';
import { ensureTables, pool, TABLE_NAME } from '../../src/server/store/db';

const sendEmail = vi.fn().mockResolvedValue('msg_123');
vi.mock('../../src/server/messaging/email', () => ({ sendEmail, sendEmailBatch: vi.fn(), EMAIL_FROM: 'noreply@reportraven.tech' }));

// The quarter FDIC currently reports; tests move it forward to simulate a new call report.
let quarter = 'Q2 2026';
const snapshotFor = (cert: number) => ({
  name: 'Example Bank',
  city: 'Columbia',
  state: 'SC',
  cert,
  quarter,
  assets: '$512.0M',
  deposits: '$450.0M',
  loans: '$380.0M',
  loanGrowthPct: 4.2,
  roaPct: 1.1,
});
vi.mock('../../src/server/messaging/lead-enrichment', () => ({
  bankSnapshot: vi.fn(async (lead: { cert?: number }) => (lead.cert ? snapshotFor(lead.cert) : undefined)),
  describeInstitution: vi.fn(async () => []),
}));

const { interestRoutes } = await import('../../src/server/api/routes/interest');
const { bankTrackerAdminRoutes, activeTrackers } = await import('../../src/server/api/routes/bank-tracker');
const { unsubscribeRoutes } = await import('../../src/server/api/routes/newsletter');
const { unsubscribeToken } = await import('../../src/server/messaging/newsletter');

const SECRET = 'test-admin-secret';
const app = new Elysia().use(interestRoutes).use(unsubscribeRoutes).use(bankTrackerAdminRoutes);

function call(path: string, body?: unknown, method = 'POST') {
  return app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SECRET}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

const send = async () => (await call('/api/v1/admin/bank-tracker/send', {})).json();

describe('bank tracker', () => {
  const saved = { ...process.env };

  beforeAll(async () => {
    await ensureTables();
  });

  beforeEach(async () => {
    process.env.RAVEN_ADMIN_SECRET = SECRET;
    process.env.NEWSLETTER_SECRET = 'newsletter-secret';
    process.env.NEWSLETTER_POSTAL_ADDRESS = '123 Main St, Columbia, SC 29201';
    quarter = 'Q2 2026';
    sendEmail.mockClear();
    await pool.query(`DELETE FROM ${TABLE_NAME} WHERE pk = 'TRACKER'`);
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it('requires a cert to track a bank', async () => {
    const res = await call('/api/v1/interest', { kind: 'track', email: `nocert-${Date.now()}@examplebank.com` });
    expect(res.status).toBe(400);
  });

  it('confirms the signup and flags it to the founder as a warm lead', async () => {
    const email = `track-${Date.now()}@examplebank.com`;
    const res = await call('/api/v1/interest', { kind: 'track', email, bank: 'Example Bank', cert: 4242, source: 'bank-snapshot-4242' });
    expect(res.status).toBe(201);

    const [alert, confirmation] = sendEmail.mock.calls.map((c) => c[0]);
    expect(alert.subject).toContain('bank tracker signup');
    expect(alert.text).toContain('warm lead');
    expect(confirmation.subject).toBe("You're tracking Example Bank");
    expect(confirmation.text).toContain('https://reportraven.tech/bank-snapshot/4242');
    expect(await activeTrackers()).toContainEqual({ email, cert: 4242, seenQuarter: 'Q2 2026' });
  });

  it('emails each tracker once when a new quarter posts, never for the quarter they saw', async () => {
    const email = `quarterly-${Date.now()}@examplebank.com`;
    await call('/api/v1/interest', { kind: 'track', email, bank: 'Example Bank', cert: 5151 });
    sendEmail.mockClear();

    await send();
    expect(sendEmail.mock.calls.some((c) => c[0].to === email)).toBe(false);

    quarter = 'Q3 2026';
    await send();
    const mine = sendEmail.mock.calls.map((c) => c[0]).find((m) => m.to === email)!;
    expect(mine.subject).toBe('Example Bank: Q3 2026 call report is out');
    expect(mine.text).toContain('up 4.2% from a year earlier');
    expect(mine.text).toContain('utm_campaign=tracker-q3-2026');
    expect(mine.text).toContain('123 Main St');
    expect(mine.headers['List-Unsubscribe']).toContain(unsubscribeToken(email));

    sendEmail.mockClear();
    await send();
    expect(sendEmail.mock.calls.some((c) => c[0].to === email)).toBe(false);
  });

  it('stops after an unsubscribe', async () => {
    const email = `untrack-${Date.now()}@examplebank.com`;
    await call('/api/v1/interest', { kind: 'track', email, bank: 'Example Bank', cert: 6161 });
    await call(`/api/v1/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`, undefined, 'POST');
    expect((await activeTrackers()).some((t) => t.email === email)).toBe(false);
  });

  it('refuses to send without a postal address', async () => {
    await call('/api/v1/interest', { kind: 'track', email: `noaddr-${Date.now()}@examplebank.com`, bank: 'Example Bank', cert: 7171 });
    delete process.env.NEWSLETTER_POSTAL_ADDRESS;
    const res = await call('/api/v1/admin/bank-tracker/send', {});
    expect(res.status).toBe(412);
  });
});
