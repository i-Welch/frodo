import { registerEnricher } from '../../enrichment/registry';
import { FullContactContactEnricher } from './contact-enricher';

export function registerFullContactProvider(): void {
  registerEnricher(new FullContactContactEnricher());
}
