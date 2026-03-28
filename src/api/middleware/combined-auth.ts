import { resolveAuth, AuthError } from './api-key-auth.js';
import { resolveClerkAuth } from './clerk-auth.js';
import type { AuthContext } from './api-key-auth.js';
import type { ClerkAuthContext } from './clerk-auth.js';
import type { Tenant, StoredApiKey } from '../../tenancy/types.js';

// ---------------------------------------------------------------------------
// Combined auth context
// ---------------------------------------------------------------------------

export interface CombinedAuthContext {
  [key: string]: unknown;
  tenant: Tenant;
  /** Which auth method was used */
  authMethod: 'api_key' | 'clerk';
  /** Present when auth method is 'api_key' */
  apiKey?: StoredApiKey;
  /** Present when auth method is 'clerk' */
  clerkUserId?: string;
  clerkOrgId?: string;
  clerkOrgRole?: string;
  environment: 'sandbox' | 'production';
}

// ---------------------------------------------------------------------------
// Combined resolver
// ---------------------------------------------------------------------------

/**
 * Resolve authentication from either a Clerk JWT or an API key.
 *
 * - If the Bearer token looks like a JWT (starts with "eyJ"), try Clerk first.
 * - If Clerk fails or the token doesn't look like a JWT, try API key auth.
 * - If both fail, throw AuthError.
 *
 * This allows the dashboard (Clerk sessions) and programmatic access (API keys)
 * to use the same endpoints.
 */
export async function resolveCombinedAuth(
  headers: Record<string, string | undefined>,
): Promise<CombinedAuthContext> {
  const authHeader = headers['authorization'] ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing or malformed Authorization header');
  }

  const token = authHeader.slice('Bearer '.length);

  // Try Clerk JWT first (if it looks like a JWT)
  if (token.startsWith('eyJ')) {
    try {
      const clerkAuth = await resolveClerkAuth(token);
      if (clerkAuth) {
        return {
          tenant: clerkAuth.tenant,
          authMethod: 'clerk',
          clerkUserId: clerkAuth.clerkUserId,
          clerkOrgId: clerkAuth.clerkOrgId,
          clerkOrgRole: clerkAuth.clerkOrgRole,
          environment: clerkAuth.environment,
        };
      }
    } catch (err) {
      // If it's a Clerk-specific error (no org, not provisioned), throw it
      if (err instanceof Error && !(err instanceof AuthError)) {
        throw new AuthError(err.message);
      }
    }
  }

  // Fall back to API key auth
  const apiKeyAuth: AuthContext = await resolveAuth(headers);
  return {
    tenant: apiKeyAuth.tenant,
    authMethod: 'api_key',
    apiKey: apiKeyAuth.apiKey,
    environment: apiKeyAuth.environment,
  };
}
