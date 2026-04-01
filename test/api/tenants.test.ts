import { describe, it, expect, beforeAll } from 'vitest';
import { Elysia } from 'elysia';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import { tenantRoutes } from '../../src/api/routes/tenants.js';
import { resolveAuth, AuthError } from '../../src/api/middleware/api-key-auth.js';
import type { GeneratedApiKey } from '../../src/tenancy/types.js';

// ---------------------------------------------------------------------------
// Table setup
// ---------------------------------------------------------------------------

async function ensureTable(): Promise<void> {
  try {
    await dynamoClient.send(
      new DescribeTableCommand({ TableName: TABLE_NAME }),
    );
  } catch (err) {
    if (!(err instanceof ResourceNotFoundException)) throw err;

    await dynamoClient.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' },
          { AttributeName: 'GSI1PK', AttributeType: 'S' },
          { AttributeName: 'GSI1SK', AttributeType: 'S' },
          { AttributeName: 'GSI2PK', AttributeType: 'S' },
          { AttributeName: 'GSI2SK', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'GSI1',
            KeySchema: [
              { AttributeName: 'GSI1PK', KeyType: 'HASH' },
              { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
          {
            IndexName: 'GSI2',
            KeySchema: [
              { AttributeName: 'GSI2PK', KeyType: 'HASH' },
              { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
            ],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
  }
}

// ---------------------------------------------------------------------------
// Test app — mirrors the real app but does NOT listen on a port
// ---------------------------------------------------------------------------

function createTestApp() {
  return new Elysia()
    .use(tenantRoutes)
    // Inline onError + derive on the same Elysia instance.
    // Elysia requires this pattern so the error handler catches derive errors.
    .onError(({ error, set }) => {
      if (error instanceof AuthError) {
        set.status = 401;
        return error.apiError;
      }
    })
    .guard((app) =>
      app
        .derive(async ({ headers }) => resolveAuth(headers))
        .get('/api/v1/users/me', ({ tenant }) => ({
          tenantId: tenant.tenantId,
          tenantName: tenant.name,
        })),
    );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonRequest(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Request {
  const { method = 'GET', body, headers = {} } = options;

  const init: RequestInit = { method, headers: { ...headers } };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
    (init.headers as Record<string, string>)['Content-Type'] =
      'application/json';
  }

  return new Request(`http://localhost${path}`, init);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('tenant API routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(async () => {
    await ensureTable();
    app = createTestApp();
  });

  describe('POST /api/v1/tenants', () => {
    it('creates a tenant and returns it', async () => {
      const res = await app.handle(
        jsonRequest('/api/v1/tenants', {
          method: 'POST',
          body: { name: 'Route Test Tenant' },
        }),
      );

      expect(res.status).toBe(201);

      const tenant = await res.json();
      expect(tenant.tenantId).toBeDefined();
      expect(tenant.name).toBe('Route Test Tenant');
      expect(tenant.permissions.length).toBeGreaterThan(0);
      expect(tenant.callbackUrls).toEqual([]);
      expect(tenant.createdAt).toBeDefined();
      expect(tenant.apiKey).toBeDefined();
    });

    it('creates a tenant with optional fields', async () => {
      const res = await app.handle(
        jsonRequest('/api/v1/tenants', {
          method: 'POST',
          body: {
            name: 'Full Tenant',
            callbackUrls: ['https://example.com/cb'],
            permissions: [{ module: 'steps', requiredTier: 1 }],
          },
        }),
      );

      expect(res.status).toBe(201);
      const tenant = await res.json();
      expect(tenant.callbackUrls).toEqual(['https://example.com/cb']);
      expect(tenant.permissions).toEqual([
        { module: 'steps', requiredTier: 1 },
      ]);
    });
  });

  describe('POST /api/v1/tenants/:id/api-keys', () => {
    it('generates an API key for an existing tenant', async () => {
      // First create a tenant
      const createRes = await app.handle(
        jsonRequest('/api/v1/tenants', {
          method: 'POST',
          body: { name: 'Key Test Tenant' },
        }),
      );
      const tenant = await createRes.json();

      // Then generate an API key
      const keyRes = await app.handle(
        jsonRequest(`/api/v1/tenants/${tenant.tenantId}/api-keys`, {
          method: 'POST',
          body: { environment: 'sandbox' },
        }),
      );

      expect(keyRes.status).toBe(201);

      const generated: GeneratedApiKey = await keyRes.json();
      expect(generated.keyId).toBeDefined();
      expect(generated.rawKey).toMatch(/^frodo_test_[a-f0-9]{32}$/);
      expect(generated.environment).toBe('sandbox');
    });

    it('returns 404 for nonexistent tenant', async () => {
      const res = await app.handle(
        jsonRequest('/api/v1/tenants/nonexistent-id/api-keys', {
          method: 'POST',
          body: { environment: 'production' },
        }),
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/v1/tenants/:id/api-keys/:keyId', () => {
    it('revokes an API key', async () => {
      // Create tenant
      const createRes = await app.handle(
        jsonRequest('/api/v1/tenants', {
          method: 'POST',
          body: { name: 'Revoke Test Tenant' },
        }),
      );
      const tenant = await createRes.json();

      // Generate a key
      const keyRes = await app.handle(
        jsonRequest(`/api/v1/tenants/${tenant.tenantId}/api-keys`, {
          method: 'POST',
          body: { environment: 'production' },
        }),
      );
      const generated: GeneratedApiKey = await keyRes.json();

      // Revoke the key
      const revokeRes = await app.handle(
        jsonRequest(
          `/api/v1/tenants/${tenant.tenantId}/api-keys/${generated.keyId}`,
          { method: 'DELETE' },
        ),
      );

      expect(revokeRes.status).toBe(204);
    });
  });

  describe('API key auth middleware', () => {
    it('blocks requests with no Authorization header', async () => {
      const res = await app.handle(jsonRequest('/api/v1/users/me'));

      expect(res.status).toBe(401);
    });

    it('blocks requests with an invalid key format', async () => {
      const res = await app.handle(
        jsonRequest('/api/v1/users/me', {
          headers: { Authorization: 'Bearer invalid-key' },
        }),
      );

      expect(res.status).toBe(401);
    });

    it('blocks requests with a revoked key', async () => {
      // Create tenant + key
      const createRes = await app.handle(
        jsonRequest('/api/v1/tenants', {
          method: 'POST',
          body: { name: 'Auth Test Tenant' },
        }),
      );
      const tenant = await createRes.json();

      const keyRes = await app.handle(
        jsonRequest(`/api/v1/tenants/${tenant.tenantId}/api-keys`, {
          method: 'POST',
          body: { environment: 'sandbox' },
        }),
      );
      const generated: GeneratedApiKey = await keyRes.json();

      // Revoke the key
      await app.handle(
        jsonRequest(
          `/api/v1/tenants/${tenant.tenantId}/api-keys/${generated.keyId}`,
          { method: 'DELETE' },
        ),
      );

      // Try to use the revoked key
      const res = await app.handle(
        jsonRequest('/api/v1/users/me', {
          headers: { Authorization: `Bearer ${generated.rawKey}` },
        }),
      );

      expect(res.status).toBe(401);
    });

    it('allows requests with a valid API key', async () => {
      // Create tenant + key
      const createRes = await app.handle(
        jsonRequest('/api/v1/tenants', {
          method: 'POST',
          body: { name: 'Valid Auth Tenant' },
        }),
      );
      const tenant = await createRes.json();

      const keyRes = await app.handle(
        jsonRequest(`/api/v1/tenants/${tenant.tenantId}/api-keys`, {
          method: 'POST',
          body: { environment: 'sandbox' },
        }),
      );
      const generated: GeneratedApiKey = await keyRes.json();

      // Use the valid key
      const res = await app.handle(
        jsonRequest('/api/v1/users/me', {
          headers: { Authorization: `Bearer ${generated.rawKey}` },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.tenantId).toBe(tenant.tenantId);
      expect(body.tenantName).toBe('Valid Auth Tenant');
    });
  });
});
