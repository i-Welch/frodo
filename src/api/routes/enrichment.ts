import { Elysia } from 'elysia';
import { AuthError } from '../middleware/api-key-auth.js';
import { resolveCombinedAuth } from '../middleware/combined-auth.js';
import { getLink } from '../../store/tenant-user-store.js';
import { getModule as getModuleDef } from '../../modules/registry.js';
import { getEnrichers, getEnrichedModuleNames, enrichModule } from '../../enrichment/index.js';
import { getEventsForModule } from '../../store/event-store.js';
import type { ApiError } from '../../types.js';
import type { EnrichmentReport } from '../../enrichment/types.js';

/**
 * Enrichment routes -- protected by API key auth.
 */
export const enrichmentRoutes = new Elysia({ prefix: '/api/v1/users' })
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
  // POST /api/v1/users/:id/enrich -- Enrich all modules
  // -----------------------------------------------------------------------
  .post('/:id/enrich', async ({ params, tenant, apiKey, clerkUserId, environment, set }) => {
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

    const sandbox = environment === 'sandbox';
    const moduleNames = getEnrichedModuleNames();

    const reports: EnrichmentReport[] = [];
    for (const moduleName of moduleNames) {
      const report = await enrichModule(
        params.id,
        moduleName,
        apiKey?.keyId ?? clerkUserId ?? 'unknown',
        tenant.tenantId,
        sandbox,
      );
      reports.push(report);
    }

    return { reports };
  })
  // -----------------------------------------------------------------------
  // POST /api/v1/users/:id/enrich/:module -- Enrich specific module
  // -----------------------------------------------------------------------
  .post('/:id/enrich/:module', async ({ params, tenant, apiKey, clerkUserId, environment, set }) => {
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

    // Validate module exists in registry
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

    const sandbox = environment === 'sandbox';

    const report = await enrichModule(
      params.id,
      params.module,
      apiKey!.keyId,
      tenant.tenantId,
      sandbox,
    );

    return { report };
  })
  // -----------------------------------------------------------------------
  // GET /api/v1/users/:id/enrichment-status -- Last enrichment timestamps
  // -----------------------------------------------------------------------
  .get('/:id/enrichment-status', async ({ params, tenant, set }) => {
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

    const moduleNames = getEnrichedModuleNames();
    const status: Record<string, string | null> = {};

    for (const moduleName of moduleNames) {
      // Get the most recent event for this module
      const result = await getEventsForModule(params.id, moduleName, {
        limit: 1,
      });

      if (result.events.length > 0) {
        // Events are returned sorted by SK (which includes timestamp),
        // so the first one with limit=1 is the latest
        status[moduleName] = result.events[0].timestamp;
      } else {
        status[moduleName] = null;
      }
    }

    return { userId: params.id, status };
  });
