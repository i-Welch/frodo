export interface Enricher<T = Record<string, unknown>> {
  /** Source identifier -- must match a SourceConfig */
  source: string;
  /** Which module this enricher targets */
  module: string;
  /** Optional timeout in ms (default 30000) */
  timeoutMs?: number;
  /** Fetch enriched data from the provider */
  enrich(userId: string, current: Partial<T>): Promise<EnrichmentResult<T>>;
}

export interface EnrichmentResult<T = Record<string, unknown>> {
  data: Partial<T>;
  metadata?: Record<string, unknown>;
}

export interface EnrichmentReport {
  userId: string;
  module: string;
  successes: { source: string; fields: string[] }[];
  failures: { source: string; error: string }[];
}
