import { registerEnricher } from '../../enrichment/registry.js';
import { registerWebhookHandler } from '../../webhooks/registry.js';
import { TrueworkEmploymentEnricher } from './employment-enricher.js';
import { trueworkWebhookHandler } from './webhook-handler.js';

export function registerTrueworkProvider(): void {
  registerEnricher(new TrueworkEmploymentEnricher());
  registerWebhookHandler(trueworkWebhookHandler);
}
