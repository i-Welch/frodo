import { registerEnricher } from '../../enrichment/registry.js';
import { MelissaResidenceEnricher } from './residence-enricher.js';

export function registerMelissaProvider(): void {
  registerEnricher(new MelissaResidenceEnricher());
}
