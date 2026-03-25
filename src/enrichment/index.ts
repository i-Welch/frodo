// Re-export public API
export type { Enricher, EnrichmentResult, EnrichmentReport } from './types.js';
export { registerEnricher, getEnrichers, getEnrichersForSource, getEnrichedModuleNames, clearEnrichers } from './registry.js';
export { enrichModule } from './engine.js';
