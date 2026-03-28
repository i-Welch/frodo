import { Elysia, t } from 'elysia';
import { AuthError } from '../middleware/api-key-auth.js';
import { resolveCombinedAuth } from '../middleware/combined-auth.js';
import { resolveIdentity } from '../../identity/resolver.js';
import { addIdentifier, removeIdentifiers } from '../../store/identity-lookup-store.js';
import { createLink, getLink, deleteLink, getTenantsForUser } from '../../store/tenant-user-store.js';
import type { TenantUserLink } from '../../identity/types.js';
import type { ApiError } from '../../types.js';

/**
 * User management routes — protected by API key auth.
 */
export const userRoutes = new Elysia({ prefix: '/api/v1/users' })
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
  // POST /api/v1/users — Create or link a user
  // -----------------------------------------------------------------------
  .post(
    '/',
    async ({ body, tenant, set }) => {
      const identifiers = {
        email: body.email,
        phone: body.phone,
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth,
      };

      const match = await resolveIdentity(identifiers);

      if (match.type === 'conflict') {
        set.status = 409;
        const err: ApiError = {
          status: 409,
          code: 'CONFLICT',
          message: 'Identifiers resolve to multiple existing users',
        };
        return { ...err, candidateIds: match.candidateIds };
      }

      const userId = match.userId!;

      if (match.type === 'new') {
        // Write lookup entries for new identifiers
        if (identifiers.email) {
          await addIdentifier('EMAIL', identifiers.email, userId);
        }
        if (identifiers.phone) {
          await addIdentifier('PHONE', identifiers.phone, userId);
        }

        // Create the tenant-user link
        const link: TenantUserLink = {
          tenantId: tenant.tenantId,
          userId,
          providedIdentifiers: identifiers,
          createdAt: new Date().toISOString(),
        };
        await createLink(link);

        set.status = 201;
        return { userId, status: 'created' as const };
      }

      // match.type === 'existing'
      // Check if already linked to this tenant
      const existingLink = await getLink(tenant.tenantId, userId);
      if (existingLink) {
        return { userId, status: 'linked' as const };
      }

      // Create a new link for this tenant
      const link: TenantUserLink = {
        tenantId: tenant.tenantId,
        userId,
        providedIdentifiers: identifiers,
        createdAt: new Date().toISOString(),
      };
      await createLink(link);

      set.status = 201;
      return { userId, status: 'linked' as const };
    },
    {
      body: t.Object({
        email: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        firstName: t.Optional(t.String()),
        lastName: t.Optional(t.String()),
        dateOfBirth: t.Optional(t.String()),
      }),
    },
  )
  // -----------------------------------------------------------------------
  // GET /api/v1/users/:id — Get user metadata
  // -----------------------------------------------------------------------
  .get('/:id', async ({ params, tenant, set }) => {
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

    return {
      userId: link.userId,
      tenantLink: {
        tenantId: link.tenantId,
        providedIdentifiers: link.providedIdentifiers,
      },
      createdAt: link.createdAt,
    };
  })
  // -----------------------------------------------------------------------
  // DELETE /api/v1/users/:id — Delete user (admin operation)
  // -----------------------------------------------------------------------
  .delete('/:id', async ({ params, tenant, set }) => {
    const userId = params.id;

    // Get all tenant links for this user so we can remove them
    const tenantLinks = await getTenantsForUser(userId);

    // Verify the requesting tenant actually has a link
    const hasLink = tenantLinks.some((l) => l.tenantId === tenant.tenantId);
    if (!hasLink) {
      set.status = 404;
      const err: ApiError = {
        status: 404,
        code: 'NOT_FOUND',
        message: `User ${userId} not found or not linked to this tenant`,
      };
      return err;
    }

    // Delete all tenant-user links
    for (const link of tenantLinks) {
      await deleteLink(link.tenantId, link.userId);
    }

    // Remove all identity lookup entries
    await removeIdentifiers(userId);

    return new Response(null, { status: 204 });
  });
