import crypto from 'node:crypto';
import { Elysia, t } from 'elysia';
import { createTenant, getTenant, storeApiKey, revokeApiKey } from '../../store/tenant-store.js';
import { generateApiKey, hashApiKey, parseApiKey } from '../../tenancy/api-key.js';
import { createChildLogger } from '../../logger.js';
import type { Tenant, StoredApiKey } from '../../tenancy/types.js';
import type { ApiError } from '../../types.js';

const log = createChildLogger({ module: 'tenants' });

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
 * Admin routes for tenant and API key management.
 *
 * These routes are protected by admin secret auth.
 */
export const tenantRoutes = new Elysia({ prefix: '/api/v1/tenants' })
  .onBeforeHandle(({ headers, set }) => {
    const result = adminAuth(headers as Record<string, string | undefined>, set);
    if (result) return result;
  })
  // -----------------------------------------------------------------------
  // POST /api/v1/tenants — create a tenant
  // -----------------------------------------------------------------------
  .post(
    '/',
    async ({ body, set }) => {
      const tenantId = crypto.randomUUID();

      // Create the Clerk organization
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      let clerkOrgId: string | undefined;

      if (clerkSecretKey) {
        try {
          const clerkRes = await fetch('https://api.clerk.com/v1/organizations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${clerkSecretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: body.name,
              slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
              max_allowed_memberships: body.maxMembers ?? 50,
            }),
          });

          if (!clerkRes.ok) {
            const err = await clerkRes.json().catch(() => ({}));
            log.error({ status: clerkRes.status, err }, 'Failed to create Clerk organization');
            set.status = 502;
            return { error: `Failed to create Clerk organization: ${(err as Record<string, unknown>).message ?? clerkRes.statusText}` };
          }

          const clerkOrg = await clerkRes.json() as { id: string };
          clerkOrgId = clerkOrg.id;
          log.info({ clerkOrgId, name: body.name }, 'Created Clerk organization');
        } catch (err) {
          log.error({ err }, 'Clerk API request failed');
          set.status = 502;
          return { error: 'Failed to reach Clerk API' };
        }
      } else {
        log.warn('CLERK_SECRET_KEY not set — skipping Clerk org creation');
      }

      const tenant: Tenant = {
        tenantId,
        name: body.name,
        clerkOrgId,
        permissions: body.permissions ?? [
          { module: 'identity', requiredTier: 0 },
          { module: 'contact', requiredTier: 0 },
          { module: 'financial', requiredTier: 0 },
          { module: 'credit', requiredTier: 0 },
          { module: 'employment', requiredTier: 0 },
          { module: 'residence', requiredTier: 0 },
          { module: 'buying-patterns', requiredTier: 0 },
          { module: 'education', requiredTier: 0 },
        ],
        callbackUrls: body.callbackUrls ?? [],
        webhookUrl: body.webhookUrl,
        createdAt: new Date().toISOString(),
      };

      await createTenant(tenant);

      // Auto-generate a sandbox API key for the new tenant
      const generated = generateApiKey('sandbox');
      const parsed = parseApiKey(generated.rawKey)!;
      const storedKey: StoredApiKey = {
        keyId: generated.keyId,
        tenantId,
        prefix: parsed.prefix,
        hash: hashApiKey(generated.rawKey),
        environment: 'sandbox',
        active: true,
        createdAt: new Date().toISOString(),
      };
      await storeApiKey(storedKey);

      set.status = 201;
      return {
        ...tenant,
        apiKey: generated.rawKey,
      };
    },
    {
      body: t.Object({
        name: t.String(),
        callbackUrls: t.Optional(t.Array(t.String())),
        webhookUrl: t.Optional(t.String()),
        maxMembers: t.Optional(t.Number()),
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
