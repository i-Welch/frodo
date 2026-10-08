import { createRemoteJWKSet, jwtVerify } from 'jose';
import { getTenant } from '../../store/tenant-store';
import { listMembershipsForUser } from '../../store/tenant-member-store';
import { createChildLogger } from '../../logger';
import { config } from '../../config/app-config';
import type { TenantRole } from '../../store/tenant-member-store';
import type { Tenant } from '../../tenancy/types';

const log = createChildLogger({ module: 'neon-auth' });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionAuthContext {
  tenant: Tenant;
  userId: string;
  role: TenantRole;
  environment: 'production'; // dashboard sessions are always the production context
}

// ---------------------------------------------------------------------------
// JWKS cache
// ---------------------------------------------------------------------------

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(): ReturnType<typeof createRemoteJWKSet> {
  if (!jwks) {
    if (!config.neonAuthBaseUrl) {
      throw new Error('NEON_AUTH_BASE_URL is not configured');
    }
    const jwksUrl = `${config.neonAuthBaseUrl.replace(/\/$/, '')}/.well-known/jwks.json`;
    log.debug({ jwksUrl }, 'Initializing Neon Auth JWKS');
    jwks = createRemoteJWKSet(new URL(jwksUrl));
  }
  return jwks;
}

// ---------------------------------------------------------------------------
// JWT verification
// ---------------------------------------------------------------------------

/**
 * Verify a Neon Auth JWT and resolve the RAVEN tenant it acts on.
 *
 * Returns null when the token is not a valid Neon Auth JWT (callers fall back
 * to API key auth). Throws when the token is valid but the user cannot be
 * mapped to a tenant. `requestedTenantId` (the X-Tenant-Id header) selects
 * among multiple memberships; it is optional when the user has exactly one.
 */
export async function resolveSessionAuth(
  token: string,
  requestedTenantId?: string,
): Promise<SessionAuthContext | null> {
  if (!token.startsWith('eyJ') || !config.neonAuthBaseUrl) {
    return null;
  }

  let userId: string | undefined;
  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: new URL(config.neonAuthBaseUrl).origin,
    });
    userId = payload.sub;
  } catch (err) {
    log.debug({ error: String(err) }, 'Neon Auth JWT verification failed');
    return null;
  }

  if (!userId) {
    log.warn('Neon Auth JWT missing sub claim');
    return null;
  }

  const memberships = await listMembershipsForUser(userId);
  if (memberships.length === 0) {
    throw new Error('Account is not a member of any organization. Contact your administrator.');
  }

  const membership = requestedTenantId
    ? memberships.find((m) => m.tenantId === requestedTenantId)
    : memberships.length === 1
      ? memberships[0]
      : undefined;

  if (!membership) {
    throw new Error(
      requestedTenantId
        ? 'You are not a member of the requested organization.'
        : 'Multiple organizations found. Send an X-Tenant-Id header to choose one.',
    );
  }

  const tenant = await getTenant(membership.tenantId);
  if (!tenant) {
    log.warn({ tenantId: membership.tenantId }, 'Membership references a missing tenant');
    throw new Error('Organization not provisioned. Contact your administrator.');
  }

  return { tenant, userId, role: membership.role, environment: 'production' };
}
