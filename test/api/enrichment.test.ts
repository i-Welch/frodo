import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { Elysia } from 'elysia';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME, LOOKUP_TABLE_NAME } from '../../src/store/dynamo-client.js';
import { tenantRoutes } from '../../src/api/routes/tenants.js';
import { userRoutes } from '../../src/api/routes/users.js';
import { enrichmentRoutes } from '../../src/api/routes/enrichment.js';
import {
  registerEnricher,
  clearEnrichers,
} from '../../src/enrichment/registry.js';
import { registerMockEnrichers } from '../../src/enrichment/mock/mock-enricher.js';
import type { GeneratedApiKey } from '../../src/tenancy/types.js';

// Side-effect import -- registers module schemas
import '../../src/modules/index.js';

// ---------------------------------------------------------------------------
// Table setup
// ---------------------------------------------------------------------------

async function ensureMainTable(): Promise<void> {
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

async function ensureLookupTable(): Promise<void> {
  try {
    await dynamoClient.send(
      new DescribeTableCommand({ TableName: LOOKUP_TABLE_NAME }),
    );
  } catch (err) {
    if (!(err instanceof ResourceNotFoundException)) throw err;

    await dynamoClient.send(
      new CreateTableCommand({
        TableName: LOOKUP_TABLE_NAME,
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
  }
}

// ---------------------------------------------------------------------------
// Test app
// ---------------------------------------------------------------------------

function createTestApp() {
  return new Elysia()
    .use(tenantRoutes)
    .use(userRoutes)
    .use(enrichmentRoutes);
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
      body: { email: `enrich-test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com` },
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

describe('enrichment API routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(async () => {
    await ensureMainTable();
    await ensureLookupTable();
    app = createTestApp();
  });

  afterEach(() => {
    clearEnrichers();
  });

  describe('POST /api/v1/users/:id/enrich/:module', () => {
    it('enriches a specific module and returns report', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(
        app,
        'Enrich Module Tenant',
      );

      // Register a mock enricher for this test
      registerEnricher({
        source: 'socure',
        module: 'identity',
        async enrich() {
          return {
            data: { firstName: 'Frodo', lastName: 'Baggins' },
            metadata: { mockProvider: 'socure' },
          };
        },
      });

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/enrich/identity`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.report).toBeDefined();
      expect(body.report.userId).toBe(userId);
      expect(body.report.module).toBe('identity');
      expect(body.report.successes).toHaveLength(1);
      expect(body.report.successes[0].source).toBe('socure');
      expect(body.report.successes[0].fields).toContain('firstName');
      expect(body.report.successes[0].fields).toContain('lastName');
    });

    it('returns 404 for unknown module', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(
        app,
        'Enrich Unknown Module Tenant',
      );

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/enrich/nonexistent-module`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.code).toBe('NOT_FOUND');
      expect(body.message).toContain('nonexistent-module');
    });
  });

  describe('POST /api/v1/users/:id/enrich', () => {
    it('enriches all modules and returns reports', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(
        app,
        'Enrich All Tenant',
      );

      // Register mock enrichers for a couple of modules
      registerEnricher({
        source: 'socure',
        module: 'identity',
        async enrich() {
          return { data: { firstName: 'Bilbo' } };
        },
      });
      registerEnricher({
        source: 'clearbit',
        module: 'contact',
        async enrich() {
          return { data: { email: 'bilbo@shire.me' } };
        },
      });

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/enrich`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.reports).toBeDefined();
      expect(Array.isArray(body.reports)).toBe(true);
      expect(body.reports.length).toBeGreaterThanOrEqual(2);

      // Check identity report
      const identityReport = body.reports.find(
        (r: { module: string }) => r.module === 'identity',
      );
      expect(identityReport).toBeDefined();
      expect(identityReport.successes).toHaveLength(1);
      expect(identityReport.successes[0].source).toBe('socure');

      // Check contact report
      const contactReport = body.reports.find(
        (r: { module: string }) => r.module === 'contact',
      );
      expect(contactReport).toBeDefined();
      expect(contactReport.successes).toHaveLength(1);
      expect(contactReport.successes[0].source).toBe('clearbit');
    });
  });

  describe('GET /api/v1/users/:id/enrichment-status', () => {
    it('returns enrichment timestamps', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(
        app,
        'Enrich Status Tenant',
      );

      // Register and run an enrichment first
      registerEnricher({
        source: 'socure',
        module: 'identity',
        async enrich() {
          return { data: { firstName: 'Pippin' } };
        },
      });

      await app.handle(
        jsonRequest(`/api/v1/users/${userId}/enrich/identity`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/enrichment-status`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.userId).toBe(userId);
      expect(body.status).toBeDefined();

      // identity should have a timestamp since we enriched it
      expect(body.status.identity).toBeDefined();
      expect(body.status.identity).not.toBeNull();
    });
  });

  describe('authentication', () => {
    it('returns 401 without an API key', async () => {
      const res = await app.handle(
        jsonRequest('/api/v1/users/some-user/enrich/identity', {
          method: 'POST',
        }),
      );

      expect(res.status).toBe(401);
    });
  });

  describe('tenant-user link verification', () => {
    it('returns 404 for user not linked to tenant', async () => {
      const { rawKey } = await setupTenantWithUserAndKey(
        app,
        'Enrich Unlinked Tenant',
      );

      const res = await app.handle(
        jsonRequest('/api/v1/users/nonexistent-user-id/enrich/identity', {
          method: 'POST',
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.code).toBe('NOT_FOUND');
    });
  });
});
