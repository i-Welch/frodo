import { registerEnricher } from '../../enrichment/registry.js';
import { registerWebhookHandler } from '../../webhooks/registry.js';
import { PlaidFinancialEnricher } from './financial-enricher.js';
import { PlaidBuyingPatternsEnricher } from './buying-patterns-enricher.js';
import { PlaidIncomeEnricher } from './income-enricher.js';
import { PlaidLiabilitiesEnricher } from './liabilities-enricher.js';
import { PlaidIdentityEnricher } from './identity-enricher.js';
import { plaidWebhookHandler } from './webhook-handler.js';

export function registerPlaidProvider(): void {
  registerEnricher(new PlaidFinancialEnricher());
  registerEnricher(new PlaidBuyingPatternsEnricher());
  registerEnricher(new PlaidIncomeEnricher());
  registerEnricher(new PlaidLiabilitiesEnricher());
  registerEnricher(new PlaidIdentityEnricher());
  registerWebhookHandler(plaidWebhookHandler);
}
