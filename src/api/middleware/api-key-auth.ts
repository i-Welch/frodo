import { Elysia } from 'elysia';
import { parseApiKey, hashApiKey } from '../../tenancy/api-key.js';
import {
  lookupApiKeyByPrefix,
  updateApiKeyLastUsed,
  getTenant,
} from '../../store/tenant-store.js';
import { logger } from '../../logger.js';
import type { Tenant, StoredApiKey } from '../../tenancy/types.js';
import type { ApiError } from '../../types.js';

export interface AuthContext {
  tenant: Tenant;
  apiKey: StoredApiKey;
  environment: 'sandbox' | 'production';
}

/**
 * Custom error class for authentication failures.
 * Caught by the `authErrorHandler` plugin at the app root.
 */
export class AuthError extends Error {
  public readonly apiError: ApiError;

  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
    this.apiError = {
      status: 401,
      code: 'UNAUTHORIZED',
      message,
    };
  }
}

/**
 * Global error handler that converts AuthErrors into 401 JSON responses.
 * Mount this on the top-level Elysia instance (before any guards).
 */
export const authErrorHandler = new Elysia({ name: 'auth-error-handler' })
  .onError({ as: 'global' }, ({ error, set }) => {
    if (error instanceof AuthError) {
      set.status = 401;
      return error.apiError;
    }
  });

/**
 * Derive function that performs API key validation.
 * Use inside a `.guard()` or `.group()` to scope it to specific routes.
 */
export async function resolveAuth(headers: Record<string, string | undefined>): Promise<AuthContext> {
  const authHeader = headers['authorization'] ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing or malformed Authorization header');
  }

  const rawKey = authHeader.slice('Bearer '.length);

  // Step 1: Parse the key format
  const parsed = parseApiKey(rawKey);
  if (!parsed) {
    throw new AuthError('Invalid API key format');
  }

  // Step 2: Look up by prefix via GSI1
  const storedKey = await lookupApiKeyByPrefix(parsed.prefix);
  if (!storedKey) {
    throw new AuthError('API key not found');
  }

  // Step 3: Compare SHA-256 hash
  const incomingHash = hashApiKey(rawKey);
  if (incomingHash !== storedKey.hash) {
    throw new AuthError('API key not found');
  }

  // Step 4: Check active
  if (!storedKey.active) {
    throw new AuthError('API key has been revoked');
  }

  // Step 5: Load the tenant
  const tenant = await getTenant(storedKey.tenantId);
  if (!tenant) {
    logger.error(
      { tenantId: storedKey.tenantId, keyId: storedKey.keyId },
      'API key references a missing tenant',
    );
    throw new AuthError('Tenant not found');
  }

  // Step 6: Update last used (fire and forget -- don't block the request)
  updateApiKeyLastUsed(storedKey.tenantId, storedKey.keyId).catch((err) => {
    logger.warn(
      { err, keyId: storedKey.keyId },
      'Failed to update API key lastUsedAt',
    );
  });

  return {
    tenant,
    apiKey: storedKey,
    environment: parsed.environment,
  };
}

/**
 * Elysia plugin that adds API key authentication via `.derive()`.
 *
 * Usage: Mount `authErrorHandler` at the app root, then use `apiKeyAuth`
 * inside a `.guard()` to protect specific route groups.
 *
 * ```ts
 * const app = new Elysia()
 *   .use(authErrorHandler)
 *   .use(publicRoutes)
 *   .guard((app) => app.use(apiKeyAuth).get('/protected', ...))
 * ```
 */
export const apiKeyAuth = new Elysia({ name: 'api-key-auth' }).derive(
  async ({ headers }) => {
    return resolveAuth(headers) as Promise<AuthContext & Record<string, unknown>>;
  },
);
