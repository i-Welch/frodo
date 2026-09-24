import { jwtVerify } from 'jose';
import { getTenantByNeonOrgId } from '../../store/tenant-store.js';
import type { Tenant } from '../../tenancy/types.js';

export interface DashboardAuthContext {
  tenant: Tenant;
  userId: string;
  organizationId: string;
  environment: 'production';
}

/** The dashboard signs a short-lived assertion only after checking Neon membership. */
export async function resolveDashboardAuth(token: string): Promise<DashboardAuthContext> {
  const secret = process.env.RAVEN_DASHBOARD_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('Dashboard authentication is not configured');
  }

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
    issuer: 'raven-dashboard',
    audience: 'raven-api',
    algorithms: ['HS256'],
  });
  const organizationId = payload.organizationId;
  if (typeof payload.sub !== 'string' || typeof organizationId !== 'string') {
    throw new Error('Invalid dashboard identity');
  }

  const tenant = await getTenantByNeonOrgId(organizationId);
  if (!tenant) {
    throw new Error('Organization is not linked to a RAVEN tenant');
  }
  return { tenant, userId: payload.sub, organizationId, environment: 'production' };
}
