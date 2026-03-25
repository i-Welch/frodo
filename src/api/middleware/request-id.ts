import { Elysia } from 'elysia';
import { createChildLogger } from '../../logger.js';
import type { Logger } from 'pino';

/**
 * Request ID middleware.
 *
 * Generates a unique request ID for each request (or propagates the
 * X-Request-Id header if one is provided). Attaches `requestId` and
 * a child pino `log` instance to the Elysia context.
 */
export const requestIdMiddleware = new Elysia({ name: 'request-id' })
  .derive({ as: 'global' }, ({ headers, set }): { requestId: string; log: Logger } => {
    const requestId = headers['x-request-id'] || crypto.randomUUID();

    // Set the response header
    set.headers['x-request-id'] = requestId;

    // Create a child logger scoped to this request
    const log = createChildLogger({ requestId });

    return { requestId, log };
  });
