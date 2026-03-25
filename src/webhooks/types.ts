export interface WebhookHandler {
  /** Provider name (e.g., "plaid", "finicity") */
  provider: string;
  /** Validate the incoming request (signature verification, etc.) */
  validate(headers: Record<string, string>, body: unknown): boolean;
  /** Parse the webhook payload into field changes for one or more users */
  parse(body: unknown): WebhookEvent[];
}

export interface WebhookEvent {
  /** Frodo user ID (resolved from provider-specific ID) */
  userId: string;
  module: string;
  fields: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
