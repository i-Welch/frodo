import { Elysia } from 'elysia';
import { AuthError } from '../middleware/api-key-auth.js';
import { resolveCombinedAuth } from '../middleware/combined-auth.js';
import { getLink } from '../../store/tenant-user-store.js';
import {
  putModule,
  getModule,
  getAllModules,
} from '../../store/user-store.js';
import { getModule as getModuleDef } from '../../modules/registry.js';
import type { ApiError } from '../../types.js';

/**
 * Module data routes — protected by API key auth.
 */
export const moduleRoutes = new Elysia({ prefix: '/api/v1/users' })
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
  // GET /api/v1/users/:id/modules — Get all module data
  // -----------------------------------------------------------------------
  .get('/:id/modules', async ({ params, tenant, set }) => {
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

    const modules = await getAllModules(params.id);
    return { userId: params.id, modules };
  })
  // -----------------------------------------------------------------------
  // GET /api/v1/users/:id/modules/:module — Get module data
  // -----------------------------------------------------------------------
  .get('/:id/modules/:module', async ({ params, tenant, set }) => {
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

    // Verify module exists in registry
    const moduleDef = getModuleDef(params.module);
    if (!moduleDef) {
      set.status = 404;
      const err: ApiError = {
        status: 404,
        code: 'NOT_FOUND',
        message: `Module '${params.module}' does not exist`,
      };
      return err;
    }

    const data = await getModule(params.id, params.module);
    if (!data) {
      set.status = 404;
      const err: ApiError = {
        status: 404,
        code: 'NOT_FOUND',
        message: `No data for module '${params.module}' on user ${params.id}`,
      };
      return err;
    }

    return { userId: params.id, module: params.module, data };
  })
  // -----------------------------------------------------------------------
  // PUT /api/v1/users/:id/modules/:module — Update module data
  // -----------------------------------------------------------------------
  .put('/:id/modules/:module', async ({ params, body, tenant, set }) => {
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

    // Verify module exists in registry
    const moduleDef = getModuleDef(params.module);
    if (!moduleDef) {
      set.status = 404;
      const err: ApiError = {
        status: 404,
        code: 'NOT_FOUND',
        message: `Module '${params.module}' does not exist`,
      };
      return err;
    }

    await putModule(params.id, params.module, body as Record<string, unknown>);

    return { userId: params.id, module: params.module, status: 'updated' };
  });
