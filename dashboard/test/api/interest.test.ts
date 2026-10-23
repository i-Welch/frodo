import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { Elysia } from 'elysia';
import { ensureTables } from '../../src/server/store/db';
import { queryItems } from '../../src/server/store/base-store';

const sendEmail = vi.fn().mockResolvedValue('msg_123');
vi.mock('../../src/server/messaging/email', () => ({ sendEmail, EMAIL_FROM: 'noreply@reportraven.tech' }));

const { interestRoutes } = await import('../../src/server/api/routes/interest');
const { notifyLead } = await import('../../src/server/messaging/leads');

function createTestApp() {
  return new Elysia().use(interestRoutes);
}

async function post(body: Record<string, unknown>) {
  return createTestApp().handle(
    new Request('http://localhost/api/v1/interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

async function storedFor(email: string) {
  const { items } = await queryItems({ pk: 'INTEREST', skPrefix: 'SIGNUP#', scanForward: false, limit: 100 });
  return items.filter((i) => i.email === email);
}

describe('interest API', () => {
  beforeAll(async () => {
    await ensureTables();
  });

  beforeEach(() => {
    sendEmail.mockClear();
  });

  it('stores an audit request and emails the founder and the lead', async () => {
    const email = `audit-${Date.now()}@examplebank.com`;
    const res = await post({ kind: 'audit', email, name: 'Dana Smith', bank: 'Example Bank', source: 'article:some-slug' });

    expect(res.status).toBe(201);
    const [item] = await storedFor(email);
    expect(item).toMatchObject({ kind: 'audit', bank: 'Example Bank', source: 'article:some-slug' });

    expect(sendEmail).toHaveBeenCalledTimes(2);
    const [alert, confirmation] = sendEmail.mock.calls.map((c) => c[0]);
    expect(alert.to).toBe('isaac@reportraven.tech');
    expect(alert.replyTo).toBe(email);
    expect(alert.text).toContain('Example Bank');
    expect(alert.text).toContain('https://reportraven.tech/blog/some-slug');
    expect(confirmation.to).toBe(email);
    expect(confirmation.subject).toContain('Example Bank');
    expect(confirmation.text).toMatch(/^Hi Dana,/);
  });

  it('puts the FDIC snapshot in the audit confirmation and reuses it in the alert', async () => {
    const snapshot = {
      name: 'Example Bank', city: 'Mullins', state: 'SC', cert: 9923, quarter: 'Q2 2026',
      assets: '$2.38B', deposits: '$2.13B', loans: '$1.85B', loanGrowthPct: 13.9, roaPct: 1.52,
    };
    await notifyLead({ kind: 'audit', email: 'dana@examplebank.com', name: 'Dana', bank: 'Example Bank', snapshot });
    const [alert, confirmation] = sendEmail.mock.calls.map((c) => c[0]);
    expect(alert.text).toContain('FDIC match: Example Bank, Mullins, SC: $2.38B assets, FDIC cert 9923');
    expect(confirmation.text).toContain('Q2 2026 FDIC call report: $2.38B in total assets, $1.85B in net loans (up 13.9% over the past year), and a 1.52% return on assets');
    expect(confirmation.text).toContain('How it compares with banks its size in SC: https://reportraven.tech/bank-snapshot/9923');
    expect(alert.text).toContain('Peer snapshot: https://reportraven.tech/bank-snapshot/9923');
  });

  it('tells De Novo Watch subscribers the issue includes tracker updates', async () => {
    await notifyLead({ kind: 'subscribe', email: 'reader@example.org', source: 'de-novo-watch' });
    await notifyLead({ kind: 'subscribe', email: 'other@example.org', source: 'article:robins-financial-20-million-rebate' });
    const confirmations = sendEmail.mock.calls.map((c) => c[0]).filter((m) => m.to !== 'isaac@reportraven.tech');
    expect(confirmations[0].text).toContain('every new bank filing, approval and opening');
    expect(confirmations[1].text).not.toContain('De Novo Watch');
  });

  it('accepts an email-only newsletter signup', async () => {
    const email = `sub-${Date.now()}@examplecu.org`;
    const res = await post({ kind: 'subscribe', email, source: 'audit:example-cu' });

    expect(res.status).toBe(201);
    expect(await storedFor(email)).toHaveLength(1);
    expect(sendEmail.mock.calls[1][0].text).toMatch(/^Hi,/);
  });

  it('keeps the original demo request shape working', async () => {
    const res = await post({ name: 'Pat Lee', email: `demo-${Date.now()}@examplebank.com` });
    expect(res.status).toBe(201);
    expect(sendEmail.mock.calls[0][0].subject).toContain('demo request');
  });

  it('silently drops honeypot submissions', async () => {
    const email = `bot-${Date.now()}@spam.example`;
    const res = await post({ kind: 'subscribe', email, website: 'http://spam.example' });

    expect(res.status).toBe(201);
    expect(await storedFor(email)).toHaveLength(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('still succeeds when email delivery fails', async () => {
    sendEmail.mockRejectedValueOnce(new Error('resend down'));
    const res = await post({ kind: 'subscribe', email: `fail-${Date.now()}@examplebank.com` });
    expect(res.status).toBe(201);
  });

  it('rejects an invalid email', async () => {
    const res = await post({ kind: 'subscribe', email: 'not-an-email' });
    expect(res.status).toBe(422);
  });
});
