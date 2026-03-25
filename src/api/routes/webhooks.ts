import { Elysia } from 'elysia';
import { processWebhook } from '../../webhooks/processor.js';
import { getWebhookHandler } from '../../webhooks/registry.js';
import { createChildLogger } from '../../logger.js';
import type { ApiError } from '../../types.js';

const log = createChildLogger({ module: 'webhook-route' });

/**
 * Webhook routes — no API key auth (providers call these directly).
 * Each provider handler validates via its own mechanism (signature verification, etc.).
 */
export const webhookRoutes = new Elysia({ prefix: '/webhooks' })
  .post('/:provider', async ({ params, headers, body, set }) => {
    const { provider } = params;

    // Check handler exists
    const handler = getWebhookHandler(provider);
    if (!handler) {
      set.status = 404;
      const err: ApiError = {
        status: 404,
        code: 'NOT_FOUND',
        message: `No webhook handler for provider '${provider}'`,
      };
      return err;
    }

    try {
      // Normalize headers to lowercase string record
      const headerRecord: Record<string, string> = {};
      for (const [key, value] of Object.entries(headers)) {
        if (typeof value === 'string') {
          headerRecord[key.toLowerCase()] = value;
        }
      }

      const result = await processWebhook(provider, headerRecord, body);

      log.info(
        { provider, processed: result.processed, errors: result.errors.length },
        'Webhook processed',
      );

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (message.includes('validation failed')) {
        set.status = 401;
        const apiErr: ApiError = {
          status: 401,
          code: 'WEBHOOK_VALIDATION_FAILED',
          message,
        };
        return apiErr;
      }

      log.error({ provider, err }, 'Webhook processing error');
      set.status = 500;
      const apiErr: ApiError = {
        status: 500,
        code: 'WEBHOOK_ERROR',
        message: 'Failed to process webhook',
      };
      return apiErr;
    }
  });
