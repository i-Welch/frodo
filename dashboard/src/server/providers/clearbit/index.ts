import { registerEnricher } from '../../enrichment/registry';
import { ClearbitContactEnricher } from './contact-enricher';

export function registerClearbitProvider(): void {
  registerEnricher(new ClearbitContactEnricher());
}
