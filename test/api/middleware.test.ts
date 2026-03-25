import { describe, it, expect } from 'vitest';
import { Elysia } from 'elysia';
import { requestIdMiddleware } from '../../src/api/middleware/request-id.js';
import {
  errorHandler,
  AppError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from '../../src/api/middleware/error-handler.js';
import { AuthError } from '../../src/api/middleware/api-key-auth.js';

// ---------------------------------------------------------------------------
// Test app
// ---------------------------------------------------------------------------

function createTestApp() {
  return new Elysia()
    .use(requestIdMiddleware)
    .use(errorHandler)
    .get('/echo-request-id', ({ requestId }) => ({ requestId }))
    .get('/throw-not-found', () => {
      throw new NotFoundError('Resource missing');
    })
    .get('/throw-not-found-default', () => {
      throw new NotFoundError();
    })
    .get('/throw-validation', () => {
      throw new ValidationError('Invalid input data');
    })
    .get('/throw-forbidden', () => {
      throw new ForbiddenError('Access denied');
    })
    .get('/throw-forbidden-default', () => {
      throw new ForbiddenError();
    })
    .get('/throw-app-error', () => {
      throw new AppError(418, 'teapot', 'I am a teapot');
    })
    .get('/throw-auth-error', () => {
      throw new AuthError('Invalid credentials');
    })
    .get('/throw-generic', () => {
      throw new Error('Unexpected failure');
    })
    .get('/throw-string', () => {
      throw 'string error' as unknown as Error;
    })
    .get('/ok', () => ({ message: 'success' }));
}

function makeRequest(
  path: string,
  headers: Record<string, string> = {},
): Request {
  return new Request(`http://localhost${path}`, { headers });
}

// ---------------------------------------------------------------------------
// Request ID middleware tests
// ---------------------------------------------------------------------------

describe('request-id middleware', () => {
  const app = createTestApp();

  it('generates a request ID and returns it in the response header', async () => {
    const res = await app.handle(makeRequest('/echo-request-id'));
    expect(res.status).toBe(200);

    const requestId = res.headers.get('x-request-id');
    expect(requestId).toBeDefined();
    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );

    const body = await res.json();
    expect(body.requestId).toBe(requestId);
  });

  it('propagates X-Request-Id header if provided', async () => {
    const customId = 'custom-request-id-12345';
    const res = await app.handle(
      makeRequest('/echo-request-id', { 'x-request-id': customId }),
    );
    expect(res.status).toBe(200);

    const requestId = res.headers.get('x-request-id');
    expect(requestId).toBe(customId);

    const body = await res.json();
    expect(body.requestId).toBe(customId);
  });

  it('generates unique IDs for different requests', async () => {
    const res1 = await app.handle(makeRequest('/echo-request-id'));
    const res2 = await app.handle(makeRequest('/echo-request-id'));

    const id1 = res1.headers.get('x-request-id');
    const id2 = res2.headers.get('x-request-id');

    expect(id1).not.toBe(id2);
  });

  it('sets X-Request-Id header on all responses including errors', async () => {
    const res = await app.handle(makeRequest('/throw-not-found'));
    const requestId = res.headers.get('x-request-id');
    expect(requestId).toBeDefined();
    expect(requestId).not.toBe('');
  });
});

// ---------------------------------------------------------------------------
// Error handler middleware tests
// ---------------------------------------------------------------------------

describe('error-handler middleware', () => {
  const app = createTestApp();

  describe('AppError subclasses', () => {
    it('formats NotFoundError as 404', async () => {
      const res = await app.handle(makeRequest('/throw-not-found'));
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body).toEqual({
        status: 404,
        code: 'not_found',
        message: 'Resource missing',
      });
    });

    it('uses default message for NotFoundError', async () => {
      const res = await app.handle(makeRequest('/throw-not-found-default'));
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.message).toBe('Not found');
    });

    it('formats ValidationError as 422', async () => {
      const res = await app.handle(makeRequest('/throw-validation'));
      expect(res.status).toBe(422);

      const body = await res.json();
      expect(body).toEqual({
        status: 422,
        code: 'validation_error',
        message: 'Invalid input data',
      });
    });

    it('formats ForbiddenError as 403', async () => {
      const res = await app.handle(makeRequest('/throw-forbidden'));
      expect(res.status).toBe(403);

      const body = await res.json();
      expect(body).toEqual({
        status: 403,
        code: 'forbidden',
        message: 'Access denied',
      });
    });

    it('uses default message for ForbiddenError', async () => {
      const res = await app.handle(makeRequest('/throw-forbidden-default'));
      expect(res.status).toBe(403);

      const body = await res.json();
      expect(body.message).toBe('Forbidden');
    });

    it('formats custom AppError with arbitrary status', async () => {
      const res = await app.handle(makeRequest('/throw-app-error'));
      expect(res.status).toBe(418);

      const body = await res.json();
      expect(body).toEqual({
        status: 418,
        code: 'teapot',
        message: 'I am a teapot',
      });
    });
  });

  describe('AuthError', () => {
    it('formats AuthError as 401', async () => {
      const res = await app.handle(makeRequest('/throw-auth-error'));
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body.status).toBe(401);
      expect(body.code).toBe('UNAUTHORIZED');
      expect(body.message).toBe('Invalid credentials');
    });
  });

  describe('generic errors', () => {
    it('formats unknown Error as 500 with generic message', async () => {
      const res = await app.handle(makeRequest('/throw-generic'));
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body).toEqual({
        status: 500,
        code: 'internal_error',
        message: 'Internal server error',
      });
    });

    it('does not leak internal error details to the client', async () => {
      const res = await app.handle(makeRequest('/throw-generic'));
      const body = await res.json();
      expect(body.message).not.toContain('Unexpected failure');
    });
  });

  describe('successful responses', () => {
    it('does not interfere with normal responses', async () => {
      const res = await app.handle(makeRequest('/ok'));
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toEqual({ message: 'success' });
    });
  });
});
