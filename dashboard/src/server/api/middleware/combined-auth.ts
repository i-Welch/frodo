import { resolveAuth, AuthError } from './api-key-auth';
import { resolveSessionAuth } from './neon-auth';
import type { AuthContext } from './api-key-auth';
import type { Tenant, StoredApiKey } from '../../tenancy/types';

// ---------------------------------------------------------------------------
// Combined auth context
// ---------------------------------------------------------------------------

export interface CombinedAuthContext {
  [key: string]: unknown;
  tenant: Tenant;
  /** Which auth method was used */
  authMethod: 'api_key' | 'session';
  /** Present when auth method is 'api_key' */
  apiKey?: StoredApiKey;
  /** Present when auth method is 'session' (Neon Auth) */
  authUserId?: string;
  role?: string;
  environment: 'sandbox' | 'production';
}

// ---------------------------------------------------------------------------
// Combined resolver
// ---------------------------------------------------------------------------

/**
 * Resolve authentication from either a Neon Auth JWT or an API key.
 *
 * - If the Bearer token looks like a JWT (starts with "eyJ"), try Neon Auth first.
 * - If Neon Auth fails or the token doesn't look like a JWT, try API key auth.
 * - If both fail, throw AuthError.
 *
 * This allows the dashboard (Neon Auth sessions) and programmatic access (API keys)
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

  // Try Neon Auth JWT first (if it looks like a JWT)
  if (token.startsWith('eyJ')) {
    try {
      const sessionAuth = await resolveSessionAuth(token, headers['x-tenant-id']);
      if (sessionAuth) {
        return {
          tenant: sessionAuth.tenant,
          authMethod: 'session',
          authUserId: sessionAuth.userId,
          role: sessionAuth.role,
          environment: sessionAuth.environment,
        };
      }
    } catch (err) {
      // A valid session that cannot be mapped to a tenant is a hard failure
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
