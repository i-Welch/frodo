import { registerEnricher } from '../../enrichment/registry.js';
import { registerWebhookHandler } from '../../webhooks/registry.js';
import { SocureIdentityEnricher } from './identity-enricher.js';
import { socureWebhookHandler } from './webhook-handler.js';

export function registerSocureProvider(): void {
  registerEnricher(new SocureIdentityEnricher());
  registerWebhookHandler(socureWebhookHandler);
}
