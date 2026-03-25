import type { WebhookHandler } from './types.js';

const handlers = new Map<string, WebhookHandler>();

export function registerWebhookHandler(handler: WebhookHandler): void {
  handlers.set(handler.provider, handler);
}

export function getWebhookHandler(provider: string): WebhookHandler | undefined {
  return handlers.get(provider);
}

export function getRegisteredWebhookProviders(): string[] {
  return Array.from(handlers.keys());
}

/** Clear all handlers (for testing). */
export function clearWebhookHandlers(): void {
  handlers.clear();
}
