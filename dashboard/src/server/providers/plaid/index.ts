import { registerEnricher } from '../../enrichment/registry';
import { registerWebhookHandler } from '../../webhooks/registry';
import { PlaidFinancialEnricher } from './financial-enricher';
import { PlaidBuyingPatternsEnricher } from './buying-patterns-enricher';
import { PlaidIncomeEnricher } from './income-enricher';
import { PlaidLiabilitiesEnricher } from './liabilities-enricher';
import { PlaidIdentityEnricher } from './identity-enricher';
import { plaidWebhookHandler } from './webhook-handler';

export function registerPlaidProvider(): void {
  registerEnricher(new PlaidFinancialEnricher());
  registerEnricher(new PlaidBuyingPatternsEnricher());
  registerEnricher(new PlaidIncomeEnricher());
  registerEnricher(new PlaidLiabilitiesEnricher());
  registerEnricher(new PlaidIdentityEnricher());
  registerWebhookHandler(plaidWebhookHandler);
}
