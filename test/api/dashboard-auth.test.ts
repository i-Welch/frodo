import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
import { resolveDashboardAuth } from '../../src/api/middleware/dashboard-auth.js';
import { getTenantByNeonOrgId } from '../../src/store/tenant-store.js';

vi.mock('../../src/store/tenant-store.js', () => ({ getTenantByNeonOrgId: vi.fn() }));

const secret = 'test-dashboard-signing-secret-at-least-32-chars';

async function issue(claims: { organizationId?: string; audience?: string } = {}) {
  return new SignJWT({ organizationId: claims.organizationId ?? 'org-bank-1' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('user-1')
    .setIssuer('raven-dashboard')
    .setAudience(claims.audience ?? 'raven-api')
    .setIssuedAt()
    .setExpirationTime('60s')
    .sign(new TextEncoder().encode(secret));
}

describe('dashboard authentication', () => {
  beforeEach(() => {
    process.env.RAVEN_DASHBOARD_TOKEN_SECRET = secret;
    vi.mocked(getTenantByNeonOrgId).mockReset();
  });

  it('resolves a signed user only to the linked tenant', async () => {
    const tenant = { tenantId: 'tenant-bank-1', neonOrgId: 'org-bank-1' };
    vi.mocked(getTenantByNeonOrgId).mockResolvedValue(tenant as never);
    const result = await resolveDashboardAuth(await issue());
    expect(result.tenant).toBe(tenant);
    expect(result.userId).toBe('user-1');
    expect(getTenantByNeonOrgId).toHaveBeenCalledWith('org-bank-1');
  });

  it('rejects a valid assertion for an unlinked organization', async () => {
    vi.mocked(getTenantByNeonOrgId).mockResolvedValue(null);
    await expect(resolveDashboardAuth(await issue())).rejects.toThrow('not linked');
  });

  it('rejects assertions for another audience', async () => {
    await expect(resolveDashboardAuth(await issue({ audience: 'other-api' }))).rejects.toThrow();
    expect(getTenantByNeonOrgId).not.toHaveBeenCalled();
  });

  it('rejects tampered assertions', async () => {
    const token = await issue();
    await expect(resolveDashboardAuth(`${token.slice(0, -2)}XX`)).rejects.toThrow();
    expect(getTenantByNeonOrgId).not.toHaveBeenCalled();
  });
});
