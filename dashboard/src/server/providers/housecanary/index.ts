import { registerEnricher } from '../../enrichment/registry';
import { HouseCanaryResidenceEnricher } from './residence-enricher';

export function registerHouseCanaryProvider(): void {
  registerEnricher(new HouseCanaryResidenceEnricher());
}
