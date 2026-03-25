import { Elysia } from 'elysia';
import { providerTracker } from '../../providers/status.js';

/**
 * Provider status routes — public health dashboard endpoints.
 */
export const providerStatusRoutes = new Elysia({ prefix: '/api/v1/providers/status' })
  .get('/', () => {
    return providerTracker.getAllStatuses();
  })
  .get('/:provider', ({ params, set }) => {
    const status = providerTracker.getStatus(params.provider);
    if (status.status === 'unknown' && status.recentCalls === 0) {
      // Provider exists but has no data — still return it
    }
    return status;
  });
