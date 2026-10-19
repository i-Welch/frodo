import { describe, it, expect, beforeAll, vi } from 'vitest';
import { Elysia } from 'elysia';
import { ensureTables } from '../../src/server/store/db';

const sendEmail = vi.fn().mockResolvedValue('msg_123');
vi.mock('../../src/server/messaging/email', () => ({ sendEmail, sendEmailBatch: vi.fn(), EMAIL_FROM: 'noreply@reportraven.tech' }));

const { interestRoutes } = await import('../../src/server/api/routes/interest');
const { digestAdminRoutes } = await import('../../src/server/api/routes/digest');

const app = new Elysia().use(interestRoutes).use(digestAdminRoutes);

function post(path: string, body: unknown) {
  return app.handle(
    new Request(`http://localhost${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-admin-secret' },
      body: JSON.stringify(body),
    }),
  );
}

describe('weekly digest', () => {
  beforeAll(async () => {
    await ensureTables();
    process.env.RAVEN_ADMIN_SECRET = 'test-admin-secret';
  });

  it('emails the founder this week’s leads and the automation status', async () => {
    const email = `digest-${Date.now()}@examplebank.com`;
    await post('/api/v1/interest', { kind: 'audit', email, name: 'Dana Smith', bank: 'Digest Bank' });
    sendEmail.mockClear();

    const res = await post('/api/v1/admin/digest/send', { automation: ['No failed runs in the logs.'] });
    expect(res.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const msg = sendEmail.mock.calls[0][0];
    expect(msg.to).toBe('isaac@reportraven.tech');
    expect(msg.text).toContain(`Dana Smith <${email}>, Digest Bank`);
    expect(msg.text).toContain('AUDIT QUEUE');
    expect(msg.text).toContain('No failed runs in the logs.');
    expect(msg.text).toContain('vercel.com/iwelchs-projects/frodo/analytics');
  });

  it('requires the admin secret', async () => {
    const res = await app.handle(new Request('http://localhost/api/v1/admin/digest/send', { method: 'POST', body: '{}' }));
    expect(res.status).toBe(401);
  });
});
