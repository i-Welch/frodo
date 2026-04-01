import { Elysia } from 'elysia';
import { AuthError } from '../middleware/api-key-auth.js';
import { resolveCombinedAuth } from '../middleware/combined-auth.js';
import { getLink } from '../../store/tenant-user-store.js';
import { getModule } from '../../store/user-store.js';
import { getSession } from '../../sessions/manager.js';
import { filterByTier, getRequiredTier } from '../../tenancy/permissions.js';
import { logAccess } from '../../store/access-log-store.js';
import { getModule as getModuleDef } from '../../modules/registry.js';
import type { ApiError } from '../../types.js';
import { createChildLogger } from '../../logger.js';

const log = createChildLogger({ module: 'access-routes' });

/**
 * Resolve a session ID from the request.
 * Checks (in order): query param, X-Session-Id header, cookie.
 */
function resolveSessionId(
  query: Record<string, string | undefined>,
  headers: Record<string, string | undefined>,
): string | null {
  // 1. Query parameter (for testing)
  if (query.sessionId) return query.sessionId;

  // 2. Custom header (for testing)
  const headerVal = headers['x-session-id'];
  if (headerVal) return headerVal;

  // 3. Cookie (for browser-based flow)
  const cookieHeader = headers['cookie'];
  if (cookieHeader) {
    const match = cookieHeader.match(/frodo_session=([^;]+)/);
    if (match) return match[1];
  }

  return null;
}

/**
 * Access routes -- the Frodo Link integration endpoint.
 * Protected by API key auth.
 */
export const accessRoutes = new Elysia({ prefix: '/api/v1/users' })
  .onError(({ error, set }) => {
    if (error instanceof AuthError) {
      set.status = 401;
      return error.apiError;
    }
  })
  .derive(async ({ headers }) => {
    return resolveCombinedAuth(headers);
  })
  // -----------------------------------------------------------------------
  // POST /api/v1/users/:id/access — Request module data
  // -----------------------------------------------------------------------
  .post('/:id/access', async ({ params, body, query, headers, tenant, apiKey, clerkUserId, set }) => {
    const { modules, callbackUrl } = body as {
      modules: string[];
      callbackUrl?: string;
    };

    // Validate request body
    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      set.status = 400;
      const err: ApiError = {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'Request body must include a non-empty "modules" array',
      };
      return err;
    }

    // Validate all requested modules exist in the registry
    for (const mod of modules) {
      if (!getModuleDef(mod)) {
        set.status = 400;
        const err: ApiError = {
          status: 400,
          code: 'BAD_REQUEST',
          message: `Module '${mod}' does not exist`,
        };
        return err;
      }
    }

    // Step 1: Verify tenant has link to user
    const link = await getLink(tenant.tenantId, params.id);
    if (!link) {
      set.status = 404;
      const err: ApiError = {
        status: 404,
        code: 'NOT_FOUND',
        message: `User ${params.id} not found or not linked to this tenant`,
      };
      return err;
    }

    // Step 2: Validate callbackUrl against tenant's configured URLs
    if (
      callbackUrl &&
      tenant.callbackUrls.length > 0 &&
      !tenant.callbackUrls.includes(callbackUrl)
    ) {
      set.status = 400;
      const err: ApiError = {
        status: 400,
        code: 'BAD_REQUEST',
        message: 'callbackUrl is not in the tenant\'s configured callback URLs',
      };
      return err;
    }

    // Step 3: Determine required verification tier
    const requiredTier = getRequiredTier(modules, tenant.permissions);

    // Step 4: Check for existing session
    const sessionId = resolveSessionId(
      query as Record<string, string | undefined>,
      headers as Record<string, string | undefined>,
    );

    let session = sessionId ? await getSession(sessionId) : null;

    // Ensure session belongs to this user and tenant
    if (session && (session.userId !== params.id || session.tenantId !== tenant.tenantId)) {
      session = null;
    }

    // Step 5: Check session tier sufficiency
    if (!session || session.verifiedTier < requiredTier) {
      return {
        status: 'verification_required',
        verificationUrl: `/verify/${params.id}?tenant=${tenant.tenantId}`,
        requiredTier,
        currentTier: session?.verifiedTier ?? null,
      };
    }

    // Step 6: Session is valid and has sufficient tier — return data
    const data: Record<string, Record<string, unknown>> = {};
    const allFields: string[] = [];

    for (const mod of modules) {
      const moduleData = await getModule(params.id, mod);
      if (moduleData) {
        const filtered = filterByTier(mod, moduleData, session.verifiedTier);
        data[mod] = filtered;
        allFields.push(...Object.keys(filtered));
      } else {
        data[mod] = {};
      }
    }

    // Step 7: Log the access (fire and forget)
    logAccess({
      tenantId: tenant.tenantId,
      userId: params.id,
      modules,
      fields: allFields,
      verifiedTier: session.verifiedTier,
      apiKeyId: apiKey?.keyId ?? clerkUserId ?? 'unknown',
    }).catch((err) => {
      log.warn({ err, userId: params.id }, 'Failed to log access');
    });

    return {
      status: 'success',
      data,
      sessionExpiresAt: session.expiresAt,
    };
  })
  // -----------------------------------------------------------------------
  // GET /api/v1/users/:id/access/status — Check verification status
  // -----------------------------------------------------------------------
  .get('/:id/access/status', async ({ params, query, headers, tenant, set }) => {
    // Verify tenant has link to user
    const link = await getLink(tenant.tenantId, params.id);
    if (!link) {
      set.status = 404;
      const err: ApiError = {
        status: 404,
        code: 'NOT_FOUND',
        message: `User ${params.id} not found or not linked to this tenant`,
      };
      return err;
    }

    const sessionId = resolveSessionId(
      query as Record<string, string | undefined>,
      headers as Record<string, string | undefined>,
    );

    if (!sessionId) {
      return { verified: false };
    }

    const session = await getSession(sessionId);

    if (!session || session.userId !== params.id || session.tenantId !== tenant.tenantId) {
      return { verified: false };
    }

    return {
      verified: true,
      verifiedTier: session.verifiedTier,
      expiresAt: session.expiresAt,
    };
  });
