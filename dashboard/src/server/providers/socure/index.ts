import { registerEnricher } from '../../enrichment/registry';
import { registerWebhookHandler } from '../../webhooks/registry';
import { SocureIdentityEnricher } from './identity-enricher';
import { socureWebhookHandler } from './webhook-handler';

export function registerSocureProvider(): void {
  registerEnricher(new SocureIdentityEnricher());
  registerWebhookHandler(socureWebhookHandler);
}
