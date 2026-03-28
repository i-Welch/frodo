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
    return resolveCombinedAuth(headers) as Promise<ReturnType<typeof resolveCombinedAuth> & Record<string, unknown>>;
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
 * Admin refresh endpoint — intended to be called by an external scheduler (cron).
 * Separate from the auth-protected routes since admin endpoints may use different auth.
 */
export const adminRefreshRoute = new Elysia()
  .post('/api/v1/admin/refresh-stale', async ({ body }) => {
    const options = body as { limit?: number } | null;
    const result = await runRefreshJob(options ?? undefined);
    return result;
  });
