import { registerEnricher } from '../../enrichment/registry.js';
import { TrueworkEmploymentEnricher } from './employment-enricher.js';

export function registerTrueworkProvider(): void {
  registerEnricher(new TrueworkEmploymentEnricher());
}
