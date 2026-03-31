import { registerEnricher } from '../../enrichment/registry.js';
import { MelissaResidenceEnricher } from './residence-enricher.js';
import { MelissaPropertyEnricher } from './property-enricher.js';

export function registerMelissaProvider(): void {
  registerEnricher(new MelissaResidenceEnricher());
  registerEnricher(new MelissaPropertyEnricher());
}
