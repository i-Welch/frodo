import { registerEnricher } from '../../enrichment/registry';
import { TransUnionCreditEnricher } from './credit-enricher';

export function registerTransUnionProvider(): void {
  registerEnricher(new TransUnionCreditEnricher());
}
