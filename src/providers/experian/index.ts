import { registerEnricher } from '../../enrichment/registry.js';
import { ExperianCreditEnricher } from './credit-enricher.js';

export function registerExperianProvider(): void {
  registerEnricher(new ExperianCreditEnricher());
}
