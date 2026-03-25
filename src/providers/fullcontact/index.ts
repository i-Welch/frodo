import { registerEnricher } from '../../enrichment/registry.js';
import { FullContactContactEnricher } from './contact-enricher.js';

export function registerFullContactProvider(): void {
  registerEnricher(new FullContactContactEnricher());
}
