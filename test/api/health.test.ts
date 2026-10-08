import { describe, it, expect, beforeAll } from 'vitest';
import { Elysia } from 'elysia';
import { ensureTables, pool, TABLE_NAME, LOOKUP_TABLE_NAME } from '../../src/store/db.js';
import { requestIdMiddleware } from '../../src/api/middleware/request-id.js';
import { errorHandler } from '../../src/api/middleware/error-handler.js';
import {
  AppError,
  NotFoundError,
} from '../../src/api/middleware/error-handler.js';
import { kmsService } from '../../src/crypto/kms.js';

// ---------------------------------------------------------------------------
// Table setup
// ---------------------------------------------------------------------------

async function ensureMainTable(): Promise<void> {
  await ensureTables();
}

async function ensureLookupTable(): Promise<void> {
  await ensureTables();
}

// ---------------------------------------------------------------------------
// Test app — with health endpoints, request-id, and error handler
// ---------------------------------------------------------------------------

const startTime = Date.now();

function createTestApp() {
  return new Elysia()
    .use(requestIdMiddleware)
    .use(errorHandler)
    .get('/health', () => ({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: '1.0.0',
    }))
    .get('/health/deep', async ({ set }) => {
      const checks: Record<string, { status: string; latencyMs: number; error?: string }> = {};

      // DynamoDB main table
      const dynStart = Date.now();
      try {
        await pool.query(`SELECT 1 FROM "${TABLE_NAME}" LIMIT 1`);
        checks.database = { status: 'ok', latencyMs: Date.now() - dynStart };
      } catch (err) {
        checks.database = {
          status: 'error',
          latencyMs: Date.now() - dynStart,
          error: err instanceof Error ? err.message : String(err),
        };
      }

      // DynamoDB lookup table
      const lookupStart = Date.now();
      try {
        await pool.query(`SELECT 1 FROM "${LOOKUP_TABLE_NAME}" LIMIT 1`);
        checks.databaseLookup = { status: 'ok', latencyMs: Date.now() - lookupStart };
      } catch (err) {
        checks.databaseLookup = {
          status: 'error',
          latencyMs: Date.now() - lookupStart,
          error: err instanceof Error ? err.message : String(err),
        };
      }

      // KMS (local mode = always ok)
      const kmsStart = Date.now();
      checks.encryption = { status: 'ok', latencyMs: Date.now() - kmsStart };

      const allOk = Object.values(checks).every((c) => c.status === 'ok');
      if (!allOk) {
        set.status = 503;
      }

      return {
        status: allOk ? 'ok' : 'degraded',
        checks,
      };
    })
    .get('/test-error', () => {
      throw new NotFoundError('Test resource not found');
    })
    .get('/test-generic-error', () => {
      throw new Error('Something went wrong');
    });
}

function makeRequest(path: string, headers: Record<string, string> = {}): Request {
  return new Request(`http://localhost${path}`, { headers });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('health endpoints', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(async () => {
    await ensureMainTable();
    await ensureLookupTable();
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('returns ok with uptime and version', async () => {
      const res = await app.handle(makeRequest('/health'));
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.status).toBe('ok');
      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThanOrEqual(0);
      expect(body.version).toBe('1.0.0');
    });

    it('returns X-Request-Id header', async () => {
      const res = await app.handle(makeRequest('/health'));
      expect(res.status).toBe(200);

      const requestId = res.headers.get('x-request-id');
      expect(requestId).toBeDefined();
      expect(requestId).not.toBe('');
      // Should be a valid UUID format
      expect(requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe('GET /health/deep', () => {
    it('returns ok with all checks passing', async () => {
      const res = await app.handle(makeRequest('/health/deep'));
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.status).toBe('ok');
      expect(body.checks.database.status).toBe('ok');
      expect(typeof body.checks.database.latencyMs).toBe('number');
      expect(body.checks.databaseLookup.status).toBe('ok');
      expect(typeof body.checks.databaseLookup.latencyMs).toBe('number');
      expect(body.checks.encryption.status).toBe('ok');
      expect(typeof body.checks.encryption.latencyMs).toBe('number');
    });

    it('returns X-Request-Id header', async () => {
      const res = await app.handle(makeRequest('/health/deep'));
      expect(res.status).toBe(200);

      const requestId = res.headers.get('x-request-id');
      expect(requestId).toBeDefined();
      expect(requestId).not.toBe('');
    });
  });

  describe('error responses', () => {
    it('formats AppError subclasses as ApiError JSON', async () => {
      const res = await app.handle(makeRequest('/test-error'));
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.status).toBe(404);
      expect(body.code).toBe('not_found');
      expect(body.message).toBe('Test resource not found');
    });

    it('formats unknown errors as 500 ApiError JSON', async () => {
      const res = await app.handle(makeRequest('/test-generic-error'));
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.status).toBe(500);
      expect(body.code).toBe('internal_error');
      expect(body.message).toBe('Internal server error');
    });

    it('includes X-Request-Id header on error responses', async () => {
      const res = await app.handle(makeRequest('/test-error'));
      const requestId = res.headers.get('x-request-id');
      expect(requestId).toBeDefined();
      expect(requestId).not.toBe('');
    });
  });
});
