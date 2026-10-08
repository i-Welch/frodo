import { describe, it, expect, beforeAll } from 'vitest';
import { Elysia } from 'elysia';
import { ensureTables, TABLE_NAME, LOOKUP_TABLE_NAME } from '../../src/server/store/db';
import { tenantRoutes } from '../../src/server/api/routes/tenants';
import { userRoutes } from '../../src/server/api/routes/users';
import { moduleRoutes } from '../../src/server/api/routes/modules';
import type { GeneratedApiKey } from '../../src/server/tenancy/types';

// Side-effect import — registers module schemas
import '../../src/server/modules/index';

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
// Test app
// ---------------------------------------------------------------------------

function createTestApp() {
  return new Elysia().use(tenantRoutes).use(userRoutes).use(moduleRoutes);
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
    (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  return new Request(`http://localhost${path}`, init);
}

/**
 * Creates a tenant + API key + a linked user.
 */
async function setupTenantWithUserAndKey(
  app: ReturnType<typeof createTestApp>,
  tenantName: string,
): Promise<{ tenantId: string; rawKey: string; userId: string }> {
  // Create tenant
  const createRes = await app.handle(
    jsonRequest('/api/v1/tenants', {
      method: 'POST',
      body: { name: tenantName },
    }),
  );
  const tenant = await createRes.json();

  // Generate API key
  const keyRes = await app.handle(
    jsonRequest(`/api/v1/tenants/${tenant.tenantId}/api-keys`, {
      method: 'POST',
      body: { environment: 'sandbox' },
    }),
  );
  const generated: GeneratedApiKey = await keyRes.json();

  // Create a user linked to this tenant
  const userRes = await app.handle(
    jsonRequest('/api/v1/users', {
      method: 'POST',
      body: { email: `module-test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com` },
      headers: { Authorization: `Bearer ${generated.rawKey}` },
    }),
  );
  const user = await userRes.json();

  return {
    tenantId: tenant.tenantId,
    rawKey: generated.rawKey,
    userId: user.userId,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('module API routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(async () => {
    await ensureMainTable();
    await ensureLookupTable();
    app = createTestApp();
  });

  describe('PUT + GET /api/v1/users/:id/modules/:module', () => {
    it('stores and retrieves module data', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(app, 'Module PUT+GET Tenant');

      const moduleData = {
        firstName: 'Bilbo',
        lastName: 'Baggins',
        dateOfBirth: '2890-09-22',
      };

      // PUT the module data
      const putRes = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/modules/identity`, {
          method: 'PUT',
          body: moduleData,
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(putRes.status).toBe(200);
      const putBody = await putRes.json();
      expect(putBody.status).toBe('updated');
      expect(putBody.module).toBe('identity');

      // GET the module data back
      const getRes = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/modules/identity`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(getRes.status).toBe(200);
      const getBody = await getRes.json();
      expect(getBody.userId).toBe(userId);
      expect(getBody.module).toBe('identity');
      expect(getBody.data).toEqual(moduleData);
    });
  });

  describe('GET /api/v1/users/:id/modules/:module — 404 cases', () => {
    it('returns 404 for nonexistent module data', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(app, 'Module 404 Data Tenant');

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/modules/identity`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/v1/users/:id/modules/:module — validation', () => {
    it('returns 404 for unknown module name', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(app, 'Module Unknown Tenant');

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/modules/nonexistent-module`, {
          method: 'PUT',
          body: { foo: 'bar' },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.code).toBe('NOT_FOUND');
      expect(body.message).toContain('nonexistent-module');
    });
  });

  describe('authentication', () => {
    it('returns 401 without an API key', async () => {
      const res = await app.handle(
        jsonRequest('/api/v1/users/some-user/modules/identity', {
          method: 'PUT',
          body: { firstName: 'Test' },
        }),
      );

      expect(res.status).toBe(401);
    });
  });
});
