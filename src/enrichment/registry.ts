import type { Enricher } from './types.js';

/** module name -> enrichers */
const enricherRegistry = new Map<string, Enricher[]>();

/**
 * Register an enricher. Keyed by the enricher's module field.
 */
export function registerEnricher(enricher: Enricher): void {
  const list = enricherRegistry.get(enricher.module) ?? [];
  list.push(enricher);
  enricherRegistry.set(enricher.module, list);
}

/**
 * Get all enrichers registered for a given module.
 */
export function getEnrichers(module: string): Enricher[] {
  return enricherRegistry.get(module) ?? [];
}

/**
 * Get all enrichers whose source matches the given source name.
 */
export function getEnrichersForSource(source: string): Enricher[] {
  const result: Enricher[] = [];
  for (const enrichers of enricherRegistry.values()) {
    for (const enricher of enrichers) {
      if (enricher.source === source) {
        result.push(enricher);
      }
    }
  }
  return result;
}

/**
 * Get all module names that have registered enrichers.
 */
export function getEnrichedModuleNames(): string[] {
  return Array.from(enricherRegistry.keys());
}

/**
 * Clear all registered enrichers (useful for testing).
 */
export function clearEnrichers(): void {
  enricherRegistry.clear();
}
