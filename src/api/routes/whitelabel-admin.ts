import { Elysia } from 'elysia';
import { AuthError } from '../middleware/api-key-auth.js';
import { resolveCombinedAuth } from '../middleware/combined-auth.js';
import { listIntakes } from '../../whitelabel/service.js';

/**
 * White-label loan-officer API (authenticated). Separate from the public
 * borrower routes: the LO queue is scoped to the caller's tenant, resolved from
 * the Clerk JWT (or an API key) via combined auth. Same /api/v1/wl prefix,
 * different paths.
 */
export const whitelabelAdminRoutes = new Elysia({ prefix: '/api/v1/wl' })
  .onError(({ error, set }) => {
    if (error instanceof AuthError) {
      set.status = 401;
      return (error as AuthError).apiError;
    }
  })
  .derive(async ({ headers }) => resolveCombinedAuth(headers))
  // GET /api/v1/wl/intakes — the tenant's intake queue, newest-first.
  .get('/intakes', async ({ tenant, query }) => {
    const limit = query.limit ? Number(query.limit) : 50;
    const cursor = query.cursor as string | undefined;
    return listIntakes(tenant.tenantId, { limit, cursor });
  });
