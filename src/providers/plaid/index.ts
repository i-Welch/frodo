import { registerEnricher } from '../../enrichment/registry.js';
import { registerWebhookHandler } from '../../webhooks/registry.js';
import { PlaidFinancialEnricher } from './financial-enricher.js';
import { PlaidBuyingPatternsEnricher } from './buying-patterns-enricher.js';
import { plaidWebhookHandler } from './webhook-handler.js';

export function registerPlaidProvider(): void {
  registerEnricher(new PlaidFinancialEnricher());
  registerEnricher(new PlaidBuyingPatternsEnricher());
  registerWebhookHandler(plaidWebhookHandler);
}
