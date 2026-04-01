import { Elysia } from 'elysia';
import { AuthError } from '../middleware/api-key-auth.js';
import { resolveCombinedAuth } from '../middleware/combined-auth.js';
import { getLink } from '../../store/tenant-user-store.js';
import { checkStaleness, getStaleFields, runRefreshJob } from '../../enrichment/staleness.js';
import type { ApiError } from '../../types.js';

/**
 * Staleness routes — per-user endpoints require API key auth,
 * admin refresh endpoint is separate.
 */
export const stalenessRoutes = new Elysia({ prefix: '/api/v1' })
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
  // GET /api/v1/users/:id/staleness — full staleness report
  // -----------------------------------------------------------------------
  .get('/users/:id/staleness', async ({ params, tenant, set }) => {
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

    return checkStaleness(params.id);
  })
  // -----------------------------------------------------------------------
  // GET /api/v1/users/:id/staleness/:module — per-module stale fields
  // -----------------------------------------------------------------------
  .get('/users/:id/staleness/:module', async ({ params, tenant, set }) => {
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

    const staleFields = await getStaleFields(params.id, params.module);
    return { staleFields };
  });

/**
 * Admin auth middleware — verifies Authorization: Bearer <RAVEN_ADMIN_SECRET>.
 */
function adminAuth(headers: Record<string, string | undefined>, set: { status?: number | string }) {
  const secret = process.env.RAVEN_ADMIN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      set.status = 503;
      return { error: 'RAVEN_ADMIN_SECRET is not configured' } as const;
    }
    // Allow in non-production without secret
    return null;
  }

  const authHeader = headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    set.status = 401;
    return { error: 'Missing or invalid Authorization header' } as const;
  }

  const token = authHeader.slice(7);
  if (token !== secret) {
    set.status = 401;
    return { error: 'Invalid admin secret' } as const;
  }

  return null;
}

/**
 * Admin refresh endpoint — intended to be called by an external scheduler (cron).
 * Protected by admin secret auth.
 */
export const adminRefreshRoute = new Elysia()
  .onBeforeHandle(({ headers, set }) => {
    const result = adminAuth(headers as Record<string, string | undefined>, set);
    if (result) return result;
  })
  .post('/api/v1/admin/refresh-stale', async ({ body }) => {
    const options = body as { limit?: number } | null;
    const result = await runRefreshJob(options ?? undefined);
    return result;
  });
