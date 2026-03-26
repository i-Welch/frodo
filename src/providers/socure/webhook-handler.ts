import { createChildLogger } from '../../logger.js';
import type { WebhookHandler, WebhookEvent } from '../../webhooks/types.js';

const log = createChildLogger({ module: 'socure-webhook' });

/**
 * Socure RiskOS webhook handler.
 *
 * Receives evaluation_completed events from Socure after async DocV completes.
 * The eval_id correlates with the original evaluation started during onboarding.
 */
export const socureWebhookHandler: WebhookHandler = {
  provider: 'socure',

  validate(headers, body): boolean {
    // Socure webhooks can be validated via HMAC or IP allowlisting.
    // For now, accept all — in production, validate the signature.
    // TODO: implement HMAC signature verification with PROVIDER_SOCURE_WEBHOOK_SECRET
    return body !== null && body !== undefined;
  },

  parse(body): WebhookEvent[] {
    const payload = body as {
      event_type?: string;
      data?: {
        id?: string;
        eval_id?: string;
        eval_status?: string;
        decision?: string;
      };
    };

    if (payload.event_type !== 'evaluation_completed') {
      return [];
    }

    const { id, eval_id, decision } = payload.data ?? {};
    if (!eval_id || !decision) {
      log.warn({ payload }, 'Socure webhook missing eval_id or decision');
      return [];
    }

    log.info(
      { evalId: eval_id, decision, eventId: id },
      'Socure DocV evaluation completed',
    );

    // We can't directly map to a userId from the webhook alone —
    // the eval_id needs to be looked up from a stored form token or
    // a separate eval-to-user mapping. For now, emit the event with
    // the eval_id as metadata so it can be correlated.
    //
    // In production, you'd store a mapping of eval_id → userId when
    // the evaluation is created, then look it up here.
    return [{
      userId: '', // Will be resolved by the processor or skipped
      module: 'identity',
      fields: {},
      metadata: {
        socureEventType: payload.event_type,
        socureEvalId: eval_id,
        socureDecision: decision,
        socureEventId: id,
        reEnrichModules: decision === 'ACCEPT' ? ['identity'] : [],
      },
    }];
  },
};
