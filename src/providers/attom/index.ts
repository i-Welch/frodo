import { registerEnricher } from '../../enrichment/registry.js';
import { AttomResidenceEnricher } from './residence-enricher.js';

export function registerAttomProvider(): void {
  registerEnricher(new AttomResidenceEnricher());
}
