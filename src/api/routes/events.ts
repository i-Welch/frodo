import { Elysia } from 'elysia';
import { AuthError } from '../middleware/api-key-auth.js';
import { resolveCombinedAuth } from '../middleware/combined-auth.js';
import { getLink } from '../../store/tenant-user-store.js';
import {
  getEventsForUser,
  getEventsForModule,
  getEventsForField,
} from '../../store/event-store.js';
import type { ApiError } from '../../types.js';

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

/**
 * Event routes — protected by API key auth.
 */
export const eventRoutes = new Elysia({ prefix: '/api/v1/users' })
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
  // GET /api/v1/users/:id/events — Get all events for a user
  // -----------------------------------------------------------------------
  .get('/:id/events', async ({ params, query, tenant, set }) => {
    // Verify tenant-user link
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

    const limit = Math.min(
      Math.max(1, Number(query.limit) || DEFAULT_LIMIT),
      MAX_LIMIT,
    );
    const cursor = query.cursor as string | undefined;
    const moduleFilter = query.module as string | undefined;

    // If a module filter is provided, query by module; otherwise query all events
    const result = moduleFilter
      ? await getEventsForModule(params.id, moduleFilter, { limit, cursor })
      : await getEventsForUser(params.id, { limit, cursor });

    return {
      data: result.events,
      pagination: {
        cursor: result.cursor,
        hasMore: !!result.cursor,
      },
    };
  })
  // -----------------------------------------------------------------------
  // GET /api/v1/users/:id/events/:module — Get events for a specific module
  // -----------------------------------------------------------------------
  .get('/:id/events/:module', async ({ params, query, tenant, set }) => {
    // Verify tenant-user link
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

    const limit = Math.min(
      Math.max(1, Number(query.limit) || DEFAULT_LIMIT),
      MAX_LIMIT,
    );
    const cursor = query.cursor as string | undefined;

    const result = await getEventsForModule(params.id, params.module, {
      limit,
      cursor,
    });

    return {
      data: result.events,
      pagination: {
        cursor: result.cursor,
        hasMore: !!result.cursor,
      },
    };
  })
  // -----------------------------------------------------------------------
  // GET /api/v1/users/:id/events/:module/:field — Get field event history
  // -----------------------------------------------------------------------
  .get('/:id/events/:module/:field', async ({ params, tenant, set }) => {
    // Verify tenant-user link
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

    const events = await getEventsForField(
      params.id,
      params.module,
      params.field,
    );

    return {
      data: events,
      // TODO: resolvedValue will be populated in Phase 3c (enrichment engine)
      resolvedValue: null,
    };
  });
