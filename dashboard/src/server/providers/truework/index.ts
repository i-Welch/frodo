import { registerEnricher } from '../../enrichment/registry';
import { registerWebhookHandler } from '../../webhooks/registry';
import { TrueworkEmploymentEnricher } from './employment-enricher';
import { trueworkWebhookHandler } from './webhook-handler';

export function registerTrueworkProvider(): void {
  registerEnricher(new TrueworkEmploymentEnricher());
  registerWebhookHandler(trueworkWebhookHandler);
}
