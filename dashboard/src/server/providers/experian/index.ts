import { registerEnricher } from '../../enrichment/registry';
import { ExperianCreditEnricher } from './credit-enricher';

export function registerExperianProvider(): void {
  registerEnricher(new ExperianCreditEnricher());
}
