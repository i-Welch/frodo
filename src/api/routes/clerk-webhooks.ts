import crypto from 'node:crypto';
import { Elysia } from 'elysia';
import { createTenant } from '../../store/tenant-store.js';
import { createChildLogger } from '../../logger.js';
import type { Tenant } from '../../tenancy/types.js';

const log = createChildLogger({ module: 'clerk-webhooks' });

/**
 * Clerk webhook routes — handles org lifecycle events.
 *
 * When a new organization is created in Clerk, this webhook
 * auto-provisions a RAVEN tenant with the Clerk org ID.
 *
 * Webhook URL: https://reportraven.tech/clerk/webhooks
 * Events: organization.created
 */
export const clerkWebhookRoutes = new Elysia({ prefix: '/clerk' })
  .post('/webhooks', async ({ body, set }) => {
    const payload = body as {
      type?: string;
      data?: Record<string, unknown>;
    };

    if (!payload.type || !payload.data) {
      set.status = 400;
      return { error: 'Invalid webhook payload' };
    }

    switch (payload.type) {
      case 'organization.created': {
        const orgId = payload.data.id as string;
        const orgName = payload.data.name as string;

        if (!orgId || !orgName) {
          set.status = 400;
          return { error: 'Missing org id or name' };
        }

        // Create a RAVEN tenant for this Clerk org
        const tenant: Tenant = {
          tenantId: crypto.randomUUID(),
          name: orgName,
          permissions: [
            { module: 'identity', requiredTier: 0 },
            { module: 'contact', requiredTier: 0 },
            { module: 'financial', requiredTier: 0 },
            { module: 'credit', requiredTier: 0 },
            { module: 'employment', requiredTier: 0 },
            { module: 'residence', requiredTier: 0 },
            { module: 'buying-patterns', requiredTier: 0 },
            { module: 'education', requiredTier: 0 },
          ],
          callbackUrls: [],
          clerkOrgId: orgId,
          createdAt: new Date().toISOString(),
        };

        await createTenant(tenant);

        log.info(
          { tenantId: tenant.tenantId, clerkOrgId: orgId, orgName },
          'Provisioned RAVEN tenant for new Clerk organization',
        );

        return { tenantId: tenant.tenantId, clerkOrgId: orgId };
      }

      case 'organization.updated': {
        // Could update tenant name, etc.
        log.debug({ type: payload.type }, 'Clerk webhook received (not handled)');
        return { ok: true };
      }

      default:
        log.debug({ type: payload.type }, 'Clerk webhook received (not handled)');
        return { ok: true };
    }
  });
