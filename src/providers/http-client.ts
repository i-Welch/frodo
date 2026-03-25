import { createChildLogger } from '../logger.js';
import {
  ProviderError,
  ProviderAuthError,
  ProviderRateLimitError,
  ProviderTimeoutError,
  ProviderUnavailableError,
} from './errors.js';

const log = createChildLogger({ module: 'provider-http-client' });

export interface ProviderRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

export interface ProviderResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
  durationMs: number;
  retryCount: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 1_000;

export class ProviderHttpClient {
  constructor(
    private config: {
      baseUrl: string;
      defaultHeaders?: Record<string, string>;
    },
  ) {}

  async request<T>(
    path: string,
    options?: ProviderRequestOptions,
  ): Promise<ProviderResponse<T>> {
    const method = options?.method ?? 'GET';
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const maxRetries = options?.retries ?? DEFAULT_RETRIES;
    const retryDelayMs = options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
    const headers: Record<string, string> = {
      ...this.config.defaultHeaders,
      ...options?.headers,
    };

    if (options?.body !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const url = `${this.config.baseUrl}${path}`;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        await sleep(retryDelayMs * attempt);
      }

      const start = Date.now();

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          method,
          headers,
          body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);

        const durationMs = Date.now() - start;
        const responseHeaders = toRecord(response.headers);
        const data = await parseResponseBody<T>(response);

        // Non-retryable HTTP errors
        if (response.status === 401 || response.status === 403) {
          throw new ProviderAuthError(
            this.providerName(),
            `Authentication failed: ${response.status}`,
            data,
          );
        }

        if (response.status === 429) {
          throw new ProviderRateLimitError(
            this.providerName(),
            'Rate limit exceeded',
            data,
          );
        }

        if (response.status >= 500) {
          throw new ProviderUnavailableError(
            this.providerName(),
            `Server error: ${response.status}`,
            data,
          );
        }

        if (response.status >= 400) {
          throw new ProviderError(
            this.providerName(),
            response.status,
            `Request failed: ${response.status}`,
            false,
            data,
          );
        }

        return {
          status: response.status,
          data,
          headers: responseHeaders,
          durationMs,
          retryCount: attempt,
        };
      } catch (err) {
        lastError = err;

        if (err instanceof ProviderError && !err.retryable) {
          throw err;
        }

        if (err instanceof DOMException && err.name === 'AbortError') {
          lastError = new ProviderTimeoutError(
            this.providerName(),
            `Request to ${path} timed out after ${timeoutMs}ms`,
          );
          // Timeouts are retryable — continue loop
          if (attempt === maxRetries) throw lastError;
          continue;
        }

        // Network errors and retryable provider errors — retry
        if (attempt === maxRetries) {
          if (err instanceof ProviderError) throw err;
          throw new ProviderError(
            this.providerName(),
            null,
            err instanceof Error ? err.message : String(err),
            false,
            err,
          );
        }

        log.warn(
          { attempt, maxRetries, error: String(err) },
          'Request failed, retrying',
        );
      }
    }

    // Should not reach here, but just in case
    throw lastError;
  }

  private providerName(): string {
    // Extract provider name from baseUrl hostname
    try {
      const hostname = new URL(this.config.baseUrl).hostname;
      return hostname.split('.')[0];
    } catch {
      return 'unknown';
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toRecord(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return (await response.text()) as T;
}
