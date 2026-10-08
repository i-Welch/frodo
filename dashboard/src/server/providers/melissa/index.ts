import { registerEnricher } from '../../enrichment/registry';
import { MelissaResidenceEnricher } from './residence-enricher';
import { MelissaPropertyEnricher } from './property-enricher';

export function registerMelissaProvider(): void {
  registerEnricher(new MelissaResidenceEnricher());
  registerEnricher(new MelissaPropertyEnricher());
}
