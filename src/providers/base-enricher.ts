import { ProviderHttpClient, type ProviderRequestOptions, type ProviderResponse } from './http-client.js';
import { getProviderCredentials, type ProviderCredentials } from './credentials.js';
import { ProviderError } from './errors.js';
import { storeRawResponse } from '../store/raw-response-store.js';
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
  private _currentUserId?: string;
  private _rawHttp!: ProviderHttpClient;

  constructor() {
    // Defer initialization to allow abstract getBaseUrl() to be defined by subclass
    // The init happens lazily on first enrich() call
  }

  private ensureInitialized(): void {
    // Skip if already initialized (either via normal init or createFixtureEnricher)
    if (this._rawHttp || this.http) return;
      this.credentials = getProviderCredentials(this.source);
      this._rawHttp = new ProviderHttpClient({
        baseUrl: this.getBaseUrl(),
        defaultHeaders: this.getDefaultHeaders(),
      });

      // Wrap the HTTP client to capture raw responses for debugging
      const source = this.source;
      const self = this;
      this.http = new Proxy(this._rawHttp, {
        get(target, prop) {
          if (prop === 'request') {
            return async <R>(path: string, options?: ProviderRequestOptions): Promise<ProviderResponse<R>> => {
              const response = await target.request<R>(path, options);

              // Store raw response (fire and forget — never blocks enrichment)
              if (self._currentUserId) {
                storeRawResponse(self._currentUserId, {
                  provider: source,
                  endpoint: path,
                  method: options?.method ?? 'GET',
                  statusCode: response.status,
                  requestBody: options?.body,
                  responseBody: response.data,
                  durationMs: response.durationMs,
                });
              }

              return response;
            };
          }
          return Reflect.get(target, prop);
        },
      });
  }

  protected abstract getBaseUrl(): string;
  protected abstract fetchData(userId: string, current: Partial<T>): Promise<EnrichmentResult<T>>;

  /** Override to add default headers (e.g., API key auth). */
  protected getDefaultHeaders(): Record<string, string> {
    return {};
  }

  async enrich(userId: string, current: Partial<T>): Promise<EnrichmentResult<T>> {
    this.ensureInitialized();
    this._currentUserId = userId;

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
