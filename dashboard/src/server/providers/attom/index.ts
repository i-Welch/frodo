import { registerEnricher } from '../../enrichment/registry';
import { AttomResidenceEnricher } from './residence-enricher';

export function registerAttomProvider(): void {
  registerEnricher(new AttomResidenceEnricher());
}
