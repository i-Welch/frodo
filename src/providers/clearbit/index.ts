import { registerEnricher } from '../../enrichment/registry.js';
import { ClearbitContactEnricher } from './contact-enricher.js';

export function registerClearbitProvider(): void {
  registerEnricher(new ClearbitContactEnricher());
}
