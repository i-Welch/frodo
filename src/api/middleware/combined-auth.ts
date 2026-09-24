import { resolveAuth, AuthError } from './api-key-auth.js';
import { resolveDashboardAuth } from './dashboard-auth.js';
import type { AuthContext } from './api-key-auth.js';
import type { Tenant, StoredApiKey } from '../../tenancy/types.js';

// ---------------------------------------------------------------------------
// Combined auth context
// ---------------------------------------------------------------------------

export interface CombinedAuthContext {
  [key: string]: unknown;
  tenant: Tenant;
  /** Which auth method was used */
  authMethod: 'api_key' | 'dashboard';
  /** Present when auth method is 'api_key' */
  apiKey?: StoredApiKey;
  /** Present when auth method is 'dashboard' */
  userId?: string;
  organizationId?: string;
  environment: 'sandbox' | 'production';
}

// ---------------------------------------------------------------------------
// Combined resolver
// ---------------------------------------------------------------------------

/**
 * Resolve authentication from either a short-lived dashboard assertion or an API key.
 *
 * - JWTs are accepted only when signed by the dashboard and scoped to a linked tenant.
 * - Other tokens use API key auth.
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

  // Invalid JWTs must never fall back to API key authentication.
  if (token.startsWith('eyJ')) {
    try {
      const dashboard = await resolveDashboardAuth(token);
      return {
        tenant: dashboard.tenant,
        authMethod: 'dashboard',
        userId: dashboard.userId,
        organizationId: dashboard.organizationId,
        environment: dashboard.environment,
      };
    } catch {
      throw new AuthError('Invalid dashboard token or organization');
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
