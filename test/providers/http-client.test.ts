import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { ProviderHttpClient } from '../../src/providers/http-client.js';
import {
  ProviderAuthError,
  ProviderRateLimitError,
  ProviderTimeoutError,
  ProviderUnavailableError,
  ProviderError,
} from '../../src/providers/errors.js';

// ---------------------------------------------------------------------------
// Tiny test server using Node http
// ---------------------------------------------------------------------------

let server: http.Server;
let baseUrl: string;

let retryCount = 0;

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
  });
}

beforeAll(async () => {
  server = http.createServer(async (req, res) => {
    const url = new URL(req.url!, `http://localhost`);
    const path = url.pathname;

    res.setHeader('Content-Type', 'application/json');

    if (path === '/ok' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'hello' }));
      return;
    }

    if (path === '/echo' && req.method === 'POST') {
      const body = await readBody(req);
      res.writeHead(200);
      res.end(body);
      return;
    }

    if (path === '/401') {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'unauthorized' }));
      return;
    }

    if (path === '/429') {
      res.writeHead(429);
      res.end(JSON.stringify({ error: 'rate limited' }));
      return;
    }

    if (path === '/500') {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'server error' }));
      return;
    }

    if (path === '/422') {
      res.writeHead(422);
      res.end(JSON.stringify({ error: 'validation' }));
      return;
    }

    if (path === '/slow') {
      await new Promise((r) => setTimeout(r, 3000));
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'slow' }));
      return;
    }

    if (path === '/retry-then-ok') {
      retryCount++;
      if (retryCount < 3) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: 'unavailable' }));
        return;
      }
      retryCount = 0;
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'ok after retries' }));
      return;
    }

    if (path === '/reset-retry') {
      retryCount = 0;
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'not found' }));
  });

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const addr = server.address() as { port: number };
  baseUrl = `http://localhost:${addr.port}`;
});

afterAll(() => {
  server.close();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProviderHttpClient', () => {
  it('makes a successful GET request', async () => {
    const client = new ProviderHttpClient({ baseUrl });
    const res = await client.request<{ message: string }>('/ok');

    expect(res.status).toBe(200);
    expect(res.data.message).toBe('hello');
    expect(res.durationMs).toBeGreaterThanOrEqual(0);
    expect(res.retryCount).toBe(0);
  });

  it('makes a POST request with body', async () => {
    const client = new ProviderHttpClient({ baseUrl });
    const res = await client.request<{ name: string }>('/echo', {
      method: 'POST',
      body: { name: 'frodo' },
    });

    expect(res.status).toBe(200);
    expect(res.data.name).toBe('frodo');
  });

  it('includes default headers', async () => {
    const client = new ProviderHttpClient({
      baseUrl,
      defaultHeaders: { 'X-Custom': 'test-value' },
    });
    const res = await client.request('/ok');
    expect(res.status).toBe(200);
  });

  it('throws ProviderAuthError on 401', async () => {
    const client = new ProviderHttpClient({ baseUrl });
    await expect(client.request('/401')).rejects.toThrow(ProviderAuthError);
  });

  it('throws ProviderRateLimitError on 429', async () => {
    const client = new ProviderHttpClient({ baseUrl });
    await expect(client.request('/429')).rejects.toThrow(ProviderRateLimitError);
  });

  it('throws ProviderUnavailableError on 500 after exhausting retries', async () => {
    const client = new ProviderHttpClient({ baseUrl });
    await expect(
      client.request('/500', { retries: 0 }),
    ).rejects.toThrow(ProviderUnavailableError);
  });

  it('throws ProviderError on 4xx (non-auth, non-rate-limit)', async () => {
    const client = new ProviderHttpClient({ baseUrl });
    try {
      await client.request('/422', { retries: 0 });
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ProviderError);
      expect((err as ProviderError).statusCode).toBe(422);
      expect((err as ProviderError).retryable).toBe(false);
    }
  });

  it('throws ProviderTimeoutError on timeout', async () => {
    const client = new ProviderHttpClient({ baseUrl });
    await expect(
      client.request('/slow', { timeoutMs: 100, retries: 0 }),
    ).rejects.toThrow(ProviderTimeoutError);
  });

  it('retries on 500 and succeeds', async () => {
    // Reset the retry counter
    const client = new ProviderHttpClient({ baseUrl });
    await client.request('/reset-retry');

    const res = await client.request<{ message: string }>('/retry-then-ok', {
      retries: 3,
      retryDelayMs: 50,
    });

    expect(res.status).toBe(200);
    expect(res.data.message).toBe('ok after retries');
    expect(res.retryCount).toBeGreaterThan(0);
  });

  it('does not retry on non-retryable errors (401)', async () => {
    const client = new ProviderHttpClient({ baseUrl });
    const start = Date.now();
    await expect(
      client.request('/401', { retries: 3, retryDelayMs: 1000 }),
    ).rejects.toThrow(ProviderAuthError);
    // Should not have waited for retries
    expect(Date.now() - start).toBeLessThan(500);
  });
});
