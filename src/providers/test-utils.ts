import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { ProviderHttpClient, type ProviderRequestOptions, type ProviderResponse } from './http-client.js';
import { getProviderCredentials } from './credentials.js';
import type { BaseEnricher } from './base-enricher.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecordedResponse {
  provider: string;
  endpoint: string;
  method: string;
  requestBody?: unknown;
  status: number;
  responseBody: unknown;
  headers: Record<string, string>;
  recordedAt: string;
}

// ---------------------------------------------------------------------------
// Recording client
// ---------------------------------------------------------------------------

/**
 * Create a recording HTTP client that wraps ProviderHttpClient.
 * Records all requests/responses to a JSON fixture file.
 */
export function createRecordingClient(
  client: ProviderHttpClient,
  fixturePath: string,
): ProviderHttpClient {
  const recordings: RecordedResponse[] = [];

  // Load existing recordings if file exists
  if (existsSync(fixturePath)) {
    const existing = JSON.parse(readFileSync(fixturePath, 'utf-8'));
    recordings.push(...(Array.isArray(existing) ? existing : []));
  }

  // Create a proxy that intercepts the request method
  const proxy = new Proxy(client, {
    get(target, prop) {
      if (prop === 'request') {
        return async <T>(path: string, options?: ProviderRequestOptions): Promise<ProviderResponse<T>> => {
          const response = await target.request<T>(path, options);

          recordings.push({
            provider: 'recorded',
            endpoint: path,
            method: options?.method ?? 'GET',
            requestBody: options?.body,
            status: response.status,
            responseBody: response.data,
            headers: response.headers,
            recordedAt: new Date().toISOString(),
          });

          // Write to fixture file after each request
          const dir = dirname(fixturePath);
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
          writeFileSync(fixturePath, JSON.stringify(recordings, null, 2));

          return response;
        };
      }
      return Reflect.get(target, prop);
    },
  });

  return proxy;
}

// ---------------------------------------------------------------------------
// Replay client
// ---------------------------------------------------------------------------

/**
 * Create a replay HTTP client that serves responses from a fixture file.
 * Matches requests by method + path. Throws if no matching fixture found.
 */
export function createReplayClient(fixturePath: string): ProviderHttpClient {
  if (!existsSync(fixturePath)) {
    throw new Error(`Fixture file not found: ${fixturePath}`);
  }

  const recordings: RecordedResponse[] = JSON.parse(
    readFileSync(fixturePath, 'utf-8'),
  );

  // Track which recordings have been consumed for ordered replay
  const consumed = new Set<number>();

  const fakeClient = {
    request: async <T>(path: string, options?: ProviderRequestOptions): Promise<ProviderResponse<T>> => {
      const method = options?.method ?? 'GET';

      // Find matching fixture (first unconsumed match by method + path)
      const matchIndex = recordings.findIndex(
        (r, i) => !consumed.has(i) && r.method === method && r.endpoint === path,
      );

      if (matchIndex === -1) {
        throw new Error(
          `No matching fixture for ${method} ${path}. ` +
          `Available fixtures: ${recordings.map((r) => `${r.method} ${r.endpoint}`).join(', ')}`,
        );
      }

      consumed.add(matchIndex);
      const recording = recordings[matchIndex];

      return {
        status: recording.status,
        data: recording.responseBody as T,
        headers: recording.headers,
        durationMs: 0,
        retryCount: 0,
      };
    },
  } as ProviderHttpClient;

  return fakeClient;
}

// ---------------------------------------------------------------------------
// Fixture enricher helper
// ---------------------------------------------------------------------------

/**
 * Helper to create a mock enricher from a fixture file.
 * Replaces the enricher's HTTP client with a replay client for integration testing.
 */
export function createFixtureEnricher<T extends BaseEnricher>(
  EnricherClass: new () => T,
  fixturePath: string,
): T {
  const enricher = new EnricherClass();
  const replayClient = createReplayClient(fixturePath);

  // Replace the http client and initialize credentials so ensureInitialized() is satisfied
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = enricher as any;
  e.http = replayClient;
  e.credentials = getProviderCredentials(e.source);

  return enricher;
}
