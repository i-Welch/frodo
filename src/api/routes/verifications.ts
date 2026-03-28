import { Elysia } from 'elysia';
import { AuthError } from '../middleware/api-key-auth.js';
import { resolveCombinedAuth } from '../middleware/combined-auth.js';
import {
  getVerification,
  listVerifications,
  getVerificationStats,
} from '../../store/verification-store.js';
import type { VerificationStatus } from '../../store/verification-store.js';
import type { ApiError } from '../../types.js';

/**
 * Verification routes — supports both API key and Clerk auth.
 */
export const verificationRoutes = new Elysia({ prefix: '/api/v1/verifications' })
  .onError(({ error, set }) => {
    if (error instanceof AuthError) {
      set.status = 401;
      return (error as AuthError).apiError;
    }
  })
  .derive(async ({ headers }) => {
    return resolveCombinedAuth(headers) as Promise<ReturnType<typeof resolveCombinedAuth> & Record<string, unknown>>;
  })

  // -----------------------------------------------------------------------
  // GET /api/v1/verifications/stats — verification counts by status
  // -----------------------------------------------------------------------
  .get('/stats', async ({ tenant }) => {
    return getVerificationStats(tenant.tenantId);
  })

  // -----------------------------------------------------------------------
  // GET /api/v1/verifications — list verifications for tenant
  // -----------------------------------------------------------------------
  .get('/', async ({ tenant, query }) => {
    const status = query.status as VerificationStatus | undefined;
    const limit = query.limit ? Number(query.limit) : 50;
    const cursor = query.cursor as string | undefined;

    return listVerifications(tenant.tenantId, { limit, cursor, status });
  })

  // -----------------------------------------------------------------------
  // GET /api/v1/verifications/:id — single verification
  // -----------------------------------------------------------------------
  .get('/:id', async ({ params, tenant, set }) => {
    const verification = await getVerification(tenant.tenantId, params.id);
    if (!verification) {
      set.status = 404;
      const err: ApiError = {
        status: 404,
        code: 'NOT_FOUND',
        message: `Verification ${params.id} not found`,
      };
      return err;
    }
    return verification;
  });
