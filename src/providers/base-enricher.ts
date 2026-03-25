import { ProviderHttpClient } from './http-client.js';
import { getProviderCredentials, type ProviderCredentials } from './credentials.js';
import { ProviderError } from './errors.js';
import { createChildLogger } from '../logger.js';
import type { Enricher, EnrichmentResult } from '../enrichment/types.js';

/**
 * Abstract base class for provider-backed enrichers.
 * Provides shared HTTP client, credential lookup, and error normalization.
 * Subclasses implement getBaseUrl() and fetchData().
 */
export abstract class BaseEnricher<T = Record<string, unknown>> implements Enricher<T> {
  abstract source: string;
  abstract module: string;
  timeoutMs = 30_000;

  protected http!: ProviderHttpClient;
  protected credentials!: ProviderCredentials;

  constructor() {
    // Defer initialization to allow abstract getBaseUrl() to be defined by subclass
    // The init happens lazily on first enrich() call
  }

  private ensureInitialized(): void {
    if (!this.http) {
      this.http = new ProviderHttpClient({
        baseUrl: this.getBaseUrl(),
        defaultHeaders: this.getDefaultHeaders(),
      });
      this.credentials = getProviderCredentials(this.source);
    }
  }

  protected abstract getBaseUrl(): string;
  protected abstract fetchData(userId: string, current: Partial<T>): Promise<EnrichmentResult<T>>;

  /** Override to add default headers (e.g., API key auth). */
  protected getDefaultHeaders(): Record<string, string> {
    return {};
  }

  async enrich(userId: string, current: Partial<T>): Promise<EnrichmentResult<T>> {
    this.ensureInitialized();

    const log = createChildLogger({
      module: this.module,
      source: this.source,
      userId,
    });

    const start = Date.now();

    try {
      log.debug('Starting enrichment fetch');
      const result = await this.fetchData(userId, current);
      const durationMs = Date.now() - start;
      log.debug({ durationMs, fields: Object.keys(result.data) }, 'Enrichment fetch succeeded');
      return result;
    } catch (err) {
      const durationMs = Date.now() - start;

      if (err instanceof ProviderError) {
        log.warn(
          { durationMs, provider: err.provider, statusCode: err.statusCode, retryable: err.retryable },
          `Provider error: ${err.message}`,
        );
        throw err;
      }

      log.error({ durationMs, err }, 'Unexpected enrichment error');
      throw new ProviderError(
        this.source,
        null,
        err instanceof Error ? err.message : String(err),
        false,
        err,
      );
    }
  }
}
