import { describe, it, expect, beforeAll } from 'vitest';
import { Elysia } from 'elysia';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME, LOOKUP_TABLE_NAME } from '../../src/store/dynamo-client.js';
import { tenantRoutes } from '../../src/api/routes/tenants.js';
import { userRoutes } from '../../src/api/routes/users.js';
import type { GeneratedApiKey } from '../../src/tenancy/types.js';

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
// Test app — mirrors the real app but does NOT listen on a port
// ---------------------------------------------------------------------------

function createTestApp() {
  return new Elysia()
    .use(tenantRoutes)
    .use(userRoutes);
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
 * Helper: creates a tenant and generates an API key.
 * Returns the tenant ID and raw API key for use in subsequent requests.
 */
async function setupTenantWithKey(
  app: ReturnType<typeof createTestApp>,
  tenantName: string,
): Promise<{ tenantId: string; rawKey: string }> {
  const createRes = await app.handle(
    jsonRequest('/api/v1/tenants', {
      method: 'POST',
      body: { name: tenantName },
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

  return { tenantId: tenant.tenantId, rawKey: generated.rawKey };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('user API routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(async () => {
    await ensureMainTable();
    await ensureLookupTable();
    app = createTestApp();
  });

  describe('POST /api/v1/users', () => {
    it('creates a new user', async () => {
      const { rawKey } = await setupTenantWithKey(app, 'User Create Tenant');

      const res = await app.handle(
        jsonRequest('/api/v1/users', {
          method: 'POST',
          body: { email: `new-user-${Date.now()}@test.com`, firstName: 'New', lastName: 'User' },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.userId).toBeDefined();
      expect(body.status).toBe('created');
    });

    it('links to an existing user with the same email', async () => {
      const email = `existing-${Date.now()}@test.com`;

      // First tenant creates the user
      const { rawKey: key1 } = await setupTenantWithKey(app, 'Link Tenant A');
      const createRes = await app.handle(
        jsonRequest('/api/v1/users', {
          method: 'POST',
          body: { email, firstName: 'Existing' },
          headers: { Authorization: `Bearer ${key1}` },
        }),
      );
      expect(createRes.status).toBe(201);
      const created = await createRes.json();

      // Second tenant links to the same user via email
      const { rawKey: key2 } = await setupTenantWithKey(app, 'Link Tenant B');
      const linkRes = await app.handle(
        jsonRequest('/api/v1/users', {
          method: 'POST',
          body: { email },
          headers: { Authorization: `Bearer ${key2}` },
        }),
      );

      expect(linkRes.status).toBe(201);
      const linked = await linkRes.json();
      expect(linked.userId).toBe(created.userId);
      expect(linked.status).toBe('linked');
    });

    it('returns 409 on identity conflict', async () => {
      const { rawKey } = await setupTenantWithKey(app, 'Conflict Tenant');

      // Create user A with email
      const emailA = `conflict-a-${Date.now()}@test.com`;
      const phoneB = `+1555${Date.now().toString().slice(-7)}`;

      await app.handle(
        jsonRequest('/api/v1/users', {
          method: 'POST',
          body: { email: emailA },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      // Create user B with phone
      await app.handle(
        jsonRequest('/api/v1/users', {
          method: 'POST',
          body: { phone: phoneB },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      // Try to create user with email from A and phone from B -> conflict
      const conflictRes = await app.handle(
        jsonRequest('/api/v1/users', {
          method: 'POST',
          body: { email: emailA, phone: phoneB },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(conflictRes.status).toBe(409);
      const body = await conflictRes.json();
      expect(body.code).toBe('CONFLICT');
      expect(body.candidateIds).toHaveLength(2);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('returns user metadata for a linked user', async () => {
      const { rawKey } = await setupTenantWithKey(app, 'Get User Tenant');

      // Create a user
      const createRes = await app.handle(
        jsonRequest('/api/v1/users', {
          method: 'POST',
          body: { email: `get-user-${Date.now()}@test.com`, firstName: 'Get', lastName: 'User' },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );
      const created = await createRes.json();

      // Get user metadata
      const getRes = await app.handle(
        jsonRequest(`/api/v1/users/${created.userId}`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(getRes.status).toBe(200);
      const body = await getRes.json();
      expect(body.userId).toBe(created.userId);
      expect(body.tenantLink).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    it('returns 404 for an unlinked user', async () => {
      const { rawKey } = await setupTenantWithKey(app, 'Get Unlinked Tenant');

      const getRes = await app.handle(
        jsonRequest('/api/v1/users/nonexistent-user-id', {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(getRes.status).toBe(404);
      const body = await getRes.json();
      expect(body.code).toBe('NOT_FOUND');
    });
  });

  describe('authentication', () => {
    it('returns 401 without an API key', async () => {
      const res = await app.handle(
        jsonRequest('/api/v1/users', {
          method: 'POST',
          body: { email: 'noauth@test.com' },
        }),
      );

      expect(res.status).toBe(401);
    });
  });
});
