// Re-export public API
export type { Enricher, EnrichmentResult, EnrichmentReport } from './types';
export { registerEnricher, getEnrichers, getEnrichersForSource, getEnrichedModuleNames, clearEnrichers } from './registry';
export { enrichModule } from './engine';
