import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { Elysia } from 'elysia';
import { ensureTables } from '../../src/server/store/db';
import { getItem, queryItems, updateItem } from '../../src/server/store/base-store';

const sendEmail = vi.fn().mockResolvedValue('msg_123');
vi.mock('../../src/server/messaging/email', () => ({ sendEmail, EMAIL_FROM: 'noreply@reportraven.tech' }));

const { interestRoutes } = await import('../../src/server/api/routes/interest');
const { leadsAdminRoutes } = await import('../../src/server/api/routes/leads-admin');

const SECRET = 'test-admin-secret';
const app = new Elysia().use(interestRoutes).use(leadsAdminRoutes);

function request(path: string, init: { method?: string; body?: unknown; auth?: string | null } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (init.auth !== null) headers.Authorization = `Bearer ${init.auth ?? SECRET}`;
  return app.handle(
    new Request(`http://localhost${path}`, {
      method: init.method ?? 'GET',
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    }),
  );
}

async function requestAudit(email: string) {
  await request('/api/v1/interest', {
    method: 'POST',
    auth: null,
    body: { kind: 'audit', email, name: 'Dana Smith', bank: 'Example Bank', source: 'article:some-slug' },
  });
  const { items } = await queryItems({ pk: 'INTEREST', skPrefix: 'SIGNUP#', scanForward: false, limit: 100 });
  return items.find((i) => i.email === email)!.SK as string;
}

describe('audit request admin API', () => {
  const prevSecret = process.env.RAVEN_ADMIN_SECRET;

  beforeAll(async () => {
    await ensureTables();
  });

  beforeEach(() => {
    process.env.RAVEN_ADMIN_SECRET = SECRET;
    sendEmail.mockClear();
  });

  afterEach(() => {
    process.env.RAVEN_ADMIN_SECRET = prevSecret;
  });

  it('rejects requests without the admin secret', async () => {
    expect((await request('/api/v1/admin/audit-requests', { auth: null })).status).toBe(401);
    expect((await request('/api/v1/admin/audit-requests', { auth: 'wrong' })).status).toBe(401);
  });

  it('lists new audit requests as pending', async () => {
    const email = `pending-${Date.now()}@examplebank.com`;
    const id = await requestAudit(email);

    const res = await request('/api/v1/admin/audit-requests');
    expect(res.status).toBe(200);
    const { requests } = await res.json();
    expect(requests).toContainEqual(
      expect.objectContaining({ id, email, bank: 'Example Bank', status: 'pending', source: 'article:some-slug' }),
    );
  });

  it('moves a request to in_progress without emailing', async () => {
    const id = await requestAudit(`progress-${Date.now()}@examplebank.com`);
    sendEmail.mockClear();

    const res = await request('/api/v1/admin/audit-requests/status', { method: 'POST', body: { id, status: 'in_progress' } });
    expect(res.status).toBe(200);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(await getItem({ PK: 'INTEREST', SK: id })).toMatchObject({ status: 'in_progress' });

    const { requests } = await (await request('/api/v1/admin/audit-requests?status=in_progress')).json();
    expect(requests.map((r: { id: string }) => r.id)).toContain(id);
  });

  it('emails the audit link on delivery, once', async () => {
    const email = `deliver-${Date.now()}@examplebank.com`;
    const id = await requestAudit(email);
    sendEmail.mockClear();

    const body = { id, status: 'delivered', auditSlug: 'example-bank', institutionName: 'Example Bank' };
    const res = await request('/api/v1/admin/audit-requests/status', { method: 'POST', body });
    expect(res.status).toBe(200);

    expect(sendEmail).toHaveBeenCalledTimes(2);
    const [delivery, alert] = sendEmail.mock.calls.map((c) => c[0]);
    expect(delivery.to).toBe(email);
    expect(delivery.text).toMatch(/^Hi Dana,/);
    expect(delivery.text).toContain('https://reportraven.tech/audit/example-bank');
    expect(alert.to).toBe('isaac@reportraven.tech');
    expect(await getItem({ PK: 'INTEREST', SK: id })).toMatchObject({ status: 'delivered', auditSlug: 'example-bank' });

    sendEmail.mockClear();
    const again = await (await request('/api/v1/admin/audit-requests/status', { method: 'POST', body })).json();
    expect(again).toMatchObject({ alreadyDelivered: true });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('leaves the request undelivered when the email fails', async () => {
    const id = await requestAudit(`fail-${Date.now()}@examplebank.com`);
    sendEmail.mockClear();
    sendEmail.mockRejectedValueOnce(new Error('resend down'));

    const body = { id, status: 'delivered', auditSlug: 'example-bank', institutionName: 'Example Bank' };
    const res = await request('/api/v1/admin/audit-requests/status', { method: 'POST', body });
    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(await getItem({ PK: 'INTEREST', SK: id })).toMatchObject({ status: 'pending' });
  });

  it('delivers with the slug recorded at claim time', async () => {
    const id = await requestAudit(`claimed-${Date.now()}@examplebank.com`);
    const claim = { id, status: 'in_progress', auditSlug: 'example-bank', institutionName: 'Example Bank' };
    await request('/api/v1/admin/audit-requests/status', { method: 'POST', body: claim });

    const { requests } = await (await request('/api/v1/admin/audit-requests?status=in_progress')).json();
    expect(requests).toContainEqual(expect.objectContaining({ id, auditSlug: 'example-bank', institutionName: 'Example Bank' }));

    sendEmail.mockClear();
    const res = await request('/api/v1/admin/audit-requests/status', { method: 'POST', body: { id, status: 'delivered' } });
    expect(res.status).toBe(200);
    expect(sendEmail.mock.calls[0][0].text).toContain('https://reportraven.tech/audit/example-bank');
  });

  it('accepts the automation secret', async () => {
    process.env.RAVEN_AUTOMATION_SECRET = 'automation-secret';
    try {
      expect((await request('/api/v1/admin/audit-requests', { auth: 'automation-secret' })).status).toBe(200);
    } finally {
      delete process.env.RAVEN_AUTOMATION_SECRET;
    }
  });

  it('sends one follow-up, only after the follow-up window', async () => {
    const id = await requestAudit(`followup-${Date.now()}@examplebank.com`);
    const deliver = { id, status: 'delivered', auditSlug: 'example-bank', institutionName: 'Example Bank' };
    await request('/api/v1/admin/audit-requests/status', { method: 'POST', body: deliver });
    sendEmail.mockClear();

    const early = await request('/api/v1/admin/audit-requests/follow-up', { method: 'POST', body: { id } });
    expect(early.status).toBe(409);
    expect(sendEmail).not.toHaveBeenCalled();

    await updateItem({ PK: 'INTEREST', SK: id }, { statusUpdatedAt: new Date(Date.now() - 6 * 86_400_000).toISOString() });
    const res = await request('/api/v1/admin/audit-requests/follow-up', { method: 'POST', body: { id } });
    expect(res.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0][0].subject).toBe('Re: Your digital lending audit: Example Bank');
    expect(sendEmail.mock.calls[0][0].text).toContain('https://reportraven.tech/audit/example-bank');

    const again = await (await request('/api/v1/admin/audit-requests/follow-up', { method: 'POST', body: { id } })).json();
    expect(again).toMatchObject({ alreadySent: true });
    expect(sendEmail).toHaveBeenCalledTimes(1);

    const { requests } = await (await request('/api/v1/admin/audit-requests?status=delivered')).json();
    expect(requests.find((r: { id: string }) => r.id === id).followUpSentAt).toBeTruthy();
  });

  it('requires an audit slug to deliver and 404s unknown ids', async () => {
    const id = await requestAudit(`noslug-${Date.now()}@examplebank.com`);
    expect((await request('/api/v1/admin/audit-requests/status', { method: 'POST', body: { id, status: 'delivered' } })).status).toBe(400);
    expect(
      (await request('/api/v1/admin/audit-requests/status', { method: 'POST', body: { id: 'SIGNUP#nope', status: 'declined' } })).status,
    ).toBe(404);
  });
});
