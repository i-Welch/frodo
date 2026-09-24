import crypto from 'node:crypto';
import { Elysia, t } from 'elysia';
import { createTenant, getTenant, getTenantByNeonOrgId, linkTenantToNeonOrg, storeApiKey, revokeApiKey, updateTenant } from '../../store/tenant-store.js';
import { generateApiKey, hashApiKey, parseApiKey } from '../../tenancy/api-key.js';
import { isProductionEligible } from '../../tenancy/permissions.js';
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

      if (body.neonOrgId && await getTenantByNeonOrgId(body.neonOrgId)) {
        set.status = 409;
        return { error: 'Organization is already linked to another tenant' };
      }

      const tenant: Tenant = {
        tenantId,
        name: body.name,
        neonOrgId: body.neonOrgId,
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
        neonOrgId: t.Optional(t.String({ minLength: 1 })),
        callbackUrls: t.Optional(t.Array(t.String())),
        webhookUrl: t.Optional(t.String()),
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

      // §1033 / FFIEC TPRM diligence gate — block production key issuance
      // until KYB, agreement, attestation, sanctions, security review,
      // and insurance evidence are all on file and not stale.
      if (body.environment === 'production') {
        const eligibility = isProductionEligible(tenant);
        if (!eligibility.eligible) {
          log.warn(
            { tenantId: params.id, missing: eligibility.missing, stale: eligibility.stale },
            'Blocked production API key issuance — diligence incomplete',
          );
          set.status = 412;
          return {
            status: 412,
            code: 'DILIGENCE_INCOMPLETE',
            message:
              'Production access requires completed onboarding diligence (charter verification, signed Customer Agreement, permissible-purpose attestation, OFAC screen, security review, insurance evidence). Use PATCH /api/v1/tenants/:id to record them.',
            missing: eligibility.missing,
            stale: eligibility.stale,
          };
        }
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
  // PATCH /api/v1/tenants/:id/auth-organization — link a Neon Auth organization
  // -----------------------------------------------------------------------
  .patch('/:id/auth-organization', async ({ params, body, set }) => {
    const tenant = await getTenant(params.id);
    if (!tenant) {
      set.status = 404;
      return { error: 'Tenant not found' };
    }
    const existing = await getTenantByNeonOrgId(body.neonOrgId);
    if (existing && existing.tenantId !== params.id) {
      set.status = 409;
      return { error: 'Organization is already linked to another tenant' };
    }
    await linkTenantToNeonOrg(params.id, body.neonOrgId);
    return { tenantId: params.id, neonOrgId: body.neonOrgId };
  }, { body: t.Object({ neonOrgId: t.String({ minLength: 1 }) }) })
  // -----------------------------------------------------------------------
  // PATCH /api/v1/tenants/:id — record §1033 / FFIEC TPRM diligence fields
  //
  // Used by RAVEN ops staff after running KYB, executing the Customer
  // Agreement, screening OFAC, completing the security review, and
  // collecting insurance evidence. Once these are populated and not
  // stale, the tenant becomes eligible for a production API key.
  // -----------------------------------------------------------------------
  .patch(
    '/:id',
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

      await updateTenant(params.id, body);
      const updated = await getTenant(params.id);
      log.info({ tenantId: params.id, fields: Object.keys(body) }, 'Tenant diligence patched');
      return {
        ...updated,
        eligibility: updated ? isProductionEligible(updated) : null,
      };
    },
    {
      body: t.Partial(
        t.Object({
          fdicCertNumber: t.String(),
          occCharterNumber: t.String(),
          ncuaCharterNumber: t.String(),
          stateCharter: t.String(),
          ein: t.String(),
          lei: t.String(),
          primaryRegulator: t.Union([
            t.Literal('FDIC'),
            t.Literal('OCC'),
            t.Literal('NCUA'),
            t.Literal('FRB'),
            t.Literal('STATE'),
          ]),
          beneficialOwners: t.Array(
            t.Object({
              name: t.String(),
              title: t.Optional(t.String()),
              ownershipPercent: t.Optional(t.Number()),
              sanctionsScreenResult: t.Optional(
                t.Union([t.Literal('clear'), t.Literal('hit'), t.Literal('review')]),
              ),
            }),
          ),
          agreementVersionId: t.String(),
          agreementSignedAt: t.String(),
          agreementSignerName: t.String(),
          agreementSignerTitle: t.String(),
          permissiblePurposes: t.Array(t.String()),
          permissiblePurposeAttestedAt: t.String(),
          sanctionsScreenedAt: t.String(),
          sanctionsScreenResult: t.Union([
            t.Literal('clear'),
            t.Literal('hit'),
            t.Literal('review'),
          ]),
          chartersVerifiedAt: t.String(),
          securityReviewCompletedAt: t.String(),
          insuranceVerifiedAt: t.String(),
          nextRecertificationDue: t.String(),
        }),
      ),
    },
  )
  // -----------------------------------------------------------------------
  // GET /api/v1/tenants/:id/eligibility — production-eligibility report
  // -----------------------------------------------------------------------
  .get('/:id/eligibility', async ({ params, set }) => {
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
    return isProductionEligible(tenant);
  })
  // -----------------------------------------------------------------------
  // DELETE /api/v1/tenants/:id/api-keys/:keyId — revoke an API key
  // -----------------------------------------------------------------------
  .delete('/:id/api-keys/:keyId', async ({ params }) => {
    await revokeApiKey(params.id, params.keyId);
    return new Response(null, { status: 204 });
  });
