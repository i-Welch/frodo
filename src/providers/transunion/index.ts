import { registerEnricher } from '../../enrichment/registry.js';
import { TransUnionCreditEnricher } from './credit-enricher.js';

export function registerTransUnionProvider(): void {
  registerEnricher(new TransUnionCreditEnricher());
}
