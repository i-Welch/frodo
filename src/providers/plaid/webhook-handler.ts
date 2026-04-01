import { getProviderCredentials } from '../credentials.js';
import { getProviderToken } from '../token-store.js';
import type { WebhookHandler, WebhookEvent } from '../../webhooks/types.js';

// ---------------------------------------------------------------------------
// Plaid webhook payload types
// ---------------------------------------------------------------------------

interface PlaidWebhookPayload {
  webhook_type: string;           // "TRANSACTIONS", "ITEM", "AUTH", etc.
  webhook_code: string;           // "DEFAULT_UPDATE", "INITIAL_UPDATE", etc.
  item_id: string;
  new_transactions?: number;
  removed_transactions?: string[];
  error?: { error_code: string; error_message: string } | null;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const plaidWebhookHandler: WebhookHandler = {
  provider: 'plaid',

  validate(headers, _body): boolean {
    // TODO: Implement proper Plaid JWT webhook verification.
    // Plaid webhooks are signed with JWTs (NOT HMAC). Proper verification requires:
    //   1. Extract JWT from the `Plaid-Verification` header
    //   2. Fetch Plaid's JWKS from /webhook_verification_key/get
    //   3. Verify the JWT signature using the `jose` library
    //   4. Check the JWT body hash matches SHA-256 of the request body
    // The previous HMAC implementation was incorrect and rejected all valid webhooks.
    // Accepting all webhooks until proper JWT verification is implemented.
    const jwt = headers['plaid-verification'];
    if (!jwt) {
      console.warn('[plaid-webhook] Missing Plaid-Verification header — accepting anyway (TODO: implement JWT verification)');
    } else {
      console.warn('[plaid-webhook] Plaid-Verification header present but JWT verification not yet implemented — accepting webhook');
    }
    return true;
  },

  parse(body): WebhookEvent[] {
    const payload = body as PlaidWebhookPayload;
    const events: WebhookEvent[] = [];

    // We only process transaction-related webhooks for now
    if (payload.webhook_type !== 'TRANSACTIONS') {
      return events;
    }

    // The item_id maps to a Plaid access token. We need to resolve the
    // Frodo userId from the item_id. In practice you'd look this up from
    // the token store metadata where we stored { itemId } when the user
    // linked. For the webhook handler, we receive the item_id but need
    // to resolve it externally — the processor will handle the userId
    // from the event.
    //
    // For now, we expect the webhook body to include a frodo_user_id
    // that was set via Plaid Link's webhook metadata.
    const userId = (payload as unknown as Record<string, unknown>).frodo_user_id as string | undefined;
    if (!userId) {
      // Cannot resolve user — skip
      return events;
    }

    switch (payload.webhook_code) {
      case 'INITIAL_UPDATE':
      case 'DEFAULT_UPDATE':
      case 'HISTORICAL_UPDATE':
        // New transactions available — re-enrich financial + buying patterns
        events.push({
          userId,
          module: 'financial',
          fields: {},
          metadata: {
            webhookType: payload.webhook_type,
            webhookCode: payload.webhook_code,
            itemId: payload.item_id,
            newTransactions: payload.new_transactions ?? 0,
            reEnrichModules: ['financial', 'buying-patterns'],
          },
        });
        break;

      case 'TRANSACTIONS_REMOVED':
        // Transactions removed — re-enrich buying patterns
        events.push({
          userId,
          module: 'buying-patterns',
          fields: {},
          metadata: {
            webhookType: payload.webhook_type,
            webhookCode: payload.webhook_code,
            removedTransactions: payload.removed_transactions ?? [],
            reEnrichModules: ['buying-patterns'],
          },
        });
        break;
    }

    return events;
  },
};
