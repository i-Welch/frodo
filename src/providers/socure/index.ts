import { registerEnricher } from '../../enrichment/registry.js';
import { SocureIdentityEnricher } from './identity-enricher.js';

export function registerSocureProvider(): void {
  registerEnricher(new SocureIdentityEnricher());
}
