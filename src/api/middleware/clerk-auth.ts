import { createRemoteJWKSet, jwtVerify } from 'jose';
import { getTenantByClerkOrgId } from '../../store/tenant-store.js';
import { createChildLogger } from '../../logger.js';
import type { Tenant } from '../../tenancy/types.js';

const log = createChildLogger({ module: 'clerk-auth' });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClerkAuthContext {
  tenant: Tenant;
  clerkUserId: string;
  clerkOrgId: string;
  clerkOrgRole: string;       // "org:admin", "org:loan_officer", "org:viewer"
  environment: 'production';  // Clerk auth is always "production" context
}

// ---------------------------------------------------------------------------
// JWKS cache
// ---------------------------------------------------------------------------

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(): ReturnType<typeof createRemoteJWKSet> {
  if (!jwks) {
    // Clerk's JWKS endpoint is derived from the publishable key's frontend API domain
    // Format: pk_test_<base64 encoded domain>
    const pk = process.env.CLERK_PUBLISHABLE_KEY ?? '';
    const encoded = pk.replace(/^pk_(test|live)_/, '');
    let domain: string;
    try {
      domain = atob(encoded).replace(/\$$/, '');
    } catch {
      domain = 'clerk.accounts.dev';
    }
    const jwksUrl = `https://${domain}/.well-known/jwks.json`;
    log.debug({ jwksUrl }, 'Initializing Clerk JWKS');
    jwks = createRemoteJWKSet(new URL(jwksUrl));
  }
  return jwks;
}

// ---------------------------------------------------------------------------
// JWT verification
// ---------------------------------------------------------------------------

/**
 * Verify a Clerk JWT and resolve the associated RAVEN tenant.
 * Returns null if the token is not a valid Clerk JWT (allows fallback to API key auth).
 * Throws AuthError if the token is a Clerk JWT but invalid/expired/no org.
 */
export async function resolveClerkAuth(
  token: string,
): Promise<ClerkAuthContext | null> {
  // Quick check: Clerk JWTs are standard JWTs starting with "eyJ"
  if (!token.startsWith('eyJ')) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getJwks());

    const clerkUserId = payload.sub as string;

    // Clerk v2 JWT uses compact claims: org data under "o" field
    const orgClaim = payload.o as { id?: string; rol?: string } | undefined;
    const clerkOrgId = (orgClaim?.id ?? payload.org_id) as string | undefined;
    const clerkOrgRole = (orgClaim?.rol ?? payload.org_role) as string | undefined;
    // Normalize role: Clerk v2 uses "admin", v1 uses "org:admin"
    const normalizedRole = clerkOrgRole?.startsWith('org:') ? clerkOrgRole : clerkOrgRole ? `org:${clerkOrgRole}` : undefined;

    if (!clerkUserId) {
      log.warn('Clerk JWT missing sub claim');
      return null;
    }

    if (!clerkOrgId) {
      // User is signed in but not in an org context — can't map to a tenant
      log.debug({ clerkUserId, payload: JSON.stringify(payload) }, 'Clerk JWT has no org_id — dumping full payload');
      throw new Error('No organization selected. Please select an organization.');
    }

    // Look up the RAVEN tenant by Clerk org ID
    const tenant = await getTenantByClerkOrgId(clerkOrgId);
    if (!tenant) {
      log.warn({ clerkOrgId }, 'No RAVEN tenant found for Clerk org');
      throw new Error('Organization not provisioned. Contact your administrator.');
    }

    return {
      tenant,
      clerkUserId,
      clerkOrgId,
      clerkOrgRole: normalizedRole ?? 'org:viewer',
      environment: 'production',
    };
  } catch (err) {
    // If it's our own error (not a JWT verification error), re-throw
    if (err instanceof Error && !err.message.includes('JW')) {
      throw err;
    }
    // JWT verification failed — not a valid Clerk token
    log.debug({ error: String(err) }, 'Clerk JWT verification failed');
    return null;
  }
}
