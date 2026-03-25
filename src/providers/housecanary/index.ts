import { registerEnricher } from '../../enrichment/registry.js';
import { HouseCanaryResidenceEnricher } from './residence-enricher.js';

export function registerHouseCanaryProvider(): void {
  registerEnricher(new HouseCanaryResidenceEnricher());
}
