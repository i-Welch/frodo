import crypto from 'node:crypto';
import { Elysia, t } from 'elysia';
import { createTenant, getTenant, storeApiKey, revokeApiKey } from '../../store/tenant-store.js';
import { generateApiKey, hashApiKey, parseApiKey } from '../../tenancy/api-key.js';
import type { Tenant, StoredApiKey } from '../../tenancy/types.js';
import type { ApiError } from '../../types.js';

/**
 * Admin routes for tenant and API key management.
 *
 * These routes are NOT protected by API key auth — they are admin endpoints.
 */
export const tenantRoutes = new Elysia({ prefix: '/api/v1/tenants' })
  // -----------------------------------------------------------------------
  // POST /api/v1/tenants — create a tenant
  // -----------------------------------------------------------------------
  .post(
    '/',
    async ({ body, set }) => {
      const tenantId = crypto.randomUUID();
      const tenant: Tenant = {
        tenantId,
        name: body.name,
        permissions: body.permissions ?? [],
        callbackUrls: body.callbackUrls ?? [],
        createdAt: new Date().toISOString(),
      };

      await createTenant(tenant);
      set.status = 201;
      return tenant;
    },
    {
      body: t.Object({
        name: t.String(),
        callbackUrls: t.Optional(t.Array(t.String())),
        permissions: t.Optional(
          t.Array(
            t.Object({
              module: t.String(),
              requiredTier: t.Number(),
            }),
          ),
        ),
      }),
    },
  )
  // -----------------------------------------------------------------------
  // POST /api/v1/tenants/:id/api-keys — generate an API key
  // -----------------------------------------------------------------------
  .post(
    '/:id/api-keys',
    async ({ params, body, set }) => {
      const tenant = await getTenant(params.id);
      if (!tenant) {
        set.status = 404;
        const err: ApiError = {
          status: 404,
          code: 'NOT_FOUND',
          message: `Tenant ${params.id} not found`,
        };
        return err;
      }

      const generated = generateApiKey(body.environment);
      const parsed = parseApiKey(generated.rawKey)!;

      const storedKey: StoredApiKey = {
        keyId: generated.keyId,
        tenantId: params.id,
        prefix: parsed.prefix,
        hash: hashApiKey(generated.rawKey),
        environment: generated.environment,
        active: true,
        createdAt: new Date().toISOString(),
      };

      await storeApiKey(storedKey);
      set.status = 201;
      return generated;
    },
    {
      body: t.Object({
        environment: t.Union([t.Literal('sandbox'), t.Literal('production')]),
      }),
    },
  )
  // -----------------------------------------------------------------------
  // DELETE /api/v1/tenants/:id/api-keys/:keyId — revoke an API key
  // -----------------------------------------------------------------------
  .delete('/:id/api-keys/:keyId', async ({ params }) => {
    await revokeApiKey(params.id, params.keyId);
    return new Response(null, { status: 204 });
  });
