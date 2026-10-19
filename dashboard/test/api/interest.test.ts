import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { Elysia } from 'elysia';
import { ensureTables } from '../../src/server/store/db';
import { queryItems } from '../../src/server/store/base-store';

const sendEmail = vi.fn().mockResolvedValue('msg_123');
vi.mock('../../src/server/messaging/email', () => ({ sendEmail, EMAIL_FROM: 'noreply@reportraven.tech' }));

const { interestRoutes } = await import('../../src/server/api/routes/interest');

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
