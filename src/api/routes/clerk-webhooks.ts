import { Elysia } from 'elysia';
import { Webhook } from 'svix';
import { createChildLogger } from '../../logger.js';

const log = createChildLogger({ module: 'clerk-webhooks' });

/**
 * Clerk webhook routes — handles org lifecycle events.
 *
 * When a new organization is created in Clerk, this webhook
 * auto-provisions a RAVEN tenant with the Clerk org ID.
 *
 * Webhook URL: https://app.reportraven.tech/clerk/webhooks
 * Events: organization.created
 */
export const clerkWebhookRoutes = new Elysia({ prefix: '/clerk' })
  .post('/webhooks', async ({ body, headers, set, request }) => {
    // --- Svix webhook signature verification ---
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      if (process.env.NODE_ENV === 'production') {
        set.status = 503;
        return { error: 'CLERK_WEBHOOK_SECRET is not configured' };
      }
      // Allow unverified in non-production
    } else {
      const svixId = (headers as Record<string, string | undefined>)['svix-id'];
      const svixTimestamp = (headers as Record<string, string | undefined>)['svix-timestamp'];
      const svixSignature = (headers as Record<string, string | undefined>)['svix-signature'];

      if (!svixId || !svixTimestamp || !svixSignature) {
        set.status = 401;
        return { error: 'Missing Svix verification headers' };
      }

      try {
        const wh = new Webhook(webhookSecret);
        const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
        wh.verify(rawBody, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch (err) {
        log.warn({ err }, 'Clerk webhook signature verification failed');
        set.status = 401;
        return { error: 'Webhook signature verification failed' };
      }
    }
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
        // Tenant provisioning is handled via the admin API (POST /api/v1/tenants),
        // which creates both the Clerk org and the RAVEN tenant in one call.
        // This webhook is kept as a no-op for Clerk orgs created outside that flow.
        const orgId = payload.data.id as string;
        const orgName = payload.data.name as string;
        log.info({ clerkOrgId: orgId, orgName }, 'Clerk org created (tenant provisioning handled via admin API)');
        return { ok: true };
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
