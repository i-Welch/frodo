import { describe, it, expect, beforeAll } from 'vitest';
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
import { eventRoutes } from '../../src/api/routes/events.js';
import { appendEvent } from '../../src/store/event-store.js';
import type { DataEvent } from '../../src/events/types.js';
import type { GeneratedApiKey } from '../../src/tenancy/types.js';

// Side-effect import — registers module schemas
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
    .use(eventRoutes);
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
      body: { email: `event-test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com` },
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

function makeEvent(
  userId: string,
  overrides: Partial<DataEvent> = {},
): DataEvent {
  return {
    eventId: overrides.eventId ?? crypto.randomUUID(),
    userId,
    module: overrides.module ?? 'identity',
    source: overrides.source ?? {
      source: 'user',
      actor: 'test-key',
      tenantId: 'test-tenant',
    },
    changes: overrides.changes ?? [
      {
        field: 'firstName',
        previousValue: null,
        newValue: 'Frodo',
        confidence: 1,
        goodBy: '2027-01-01T00:00:00.000Z',
      },
    ],
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    ...(overrides.metadata !== undefined
      ? { metadata: overrides.metadata }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('event API routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(async () => {
    await ensureMainTable();
    await ensureLookupTable();
    app = createTestApp();
  });

  describe('GET /api/v1/users/:id/events', () => {
    it('returns empty array for user with no events', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(
        app,
        'Event Empty Tenant',
      );

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/events`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toEqual([]);
      expect(body.pagination.hasMore).toBe(false);
      expect(body.pagination.cursor).toBeUndefined();
    });

    it('returns events after appending them', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(
        app,
        'Event Append Tenant',
      );

      const event1 = makeEvent(userId, {
        module: 'identity',
        timestamp: '2025-06-01T00:00:01.000Z',
      });
      const event2 = makeEvent(userId, {
        module: 'contact',
        timestamp: '2025-06-01T00:00:02.000Z',
        changes: [
          {
            field: 'email',
            previousValue: null,
            newValue: 'frodo@shire.me',
            confidence: 1,
            goodBy: '2027-01-01T00:00:00.000Z',
          },
        ],
      });

      await appendEvent(event1);
      await appendEvent(event2);

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/events`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(2);
      expect(body.data[0].eventId).toBe(event2.eventId);
      expect(body.data[1].eventId).toBe(event1.eventId);
    });

    it('filters by module query param', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(
        app,
        'Event Module Filter Tenant',
      );

      await appendEvent(
        makeEvent(userId, {
          module: 'identity',
          timestamp: '2025-06-01T00:00:01.000Z',
        }),
      );
      await appendEvent(
        makeEvent(userId, {
          module: 'contact',
          timestamp: '2025-06-01T00:00:02.000Z',
        }),
      );

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/events?module=contact`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].module).toBe('contact');
    });

    it('supports pagination params', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(
        app,
        'Event Pagination Tenant',
      );

      // Insert 3 events
      for (let i = 0; i < 3; i++) {
        await appendEvent(
          makeEvent(userId, {
            module: 'identity',
            timestamp: `2025-06-01T00:00:0${i}.000Z`,
          }),
        );
      }

      // First page: limit 2
      const res1 = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/events?limit=2`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res1.status).toBe(200);
      const body1 = await res1.json();
      expect(body1.data).toHaveLength(2);
      expect(body1.pagination.hasMore).toBe(true);
      expect(body1.pagination.cursor).toBeDefined();

      // Second page: use cursor
      const cursor = encodeURIComponent(body1.pagination.cursor);
      const res2 = await app.handle(
        jsonRequest(
          `/api/v1/users/${userId}/events?limit=2&cursor=${cursor}`,
          {
            headers: { Authorization: `Bearer ${rawKey}` },
          },
        ),
      );

      expect(res2.status).toBe(200);
      const body2 = await res2.json();
      expect(body2.data).toHaveLength(1);
      expect(body2.pagination.hasMore).toBe(false);
    });
  });

  describe('GET /api/v1/users/:id/events/:module', () => {
    it('returns events for a specific module', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(
        app,
        'Event Module Route Tenant',
      );

      await appendEvent(
        makeEvent(userId, {
          module: 'identity',
          timestamp: '2025-06-01T00:00:01.000Z',
        }),
      );
      await appendEvent(
        makeEvent(userId, {
          module: 'contact',
          timestamp: '2025-06-01T00:00:02.000Z',
        }),
      );

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/events/identity`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].module).toBe('identity');
    });
  });

  describe('GET /api/v1/users/:id/events/:module/:field', () => {
    it('returns events for a specific field', async () => {
      const { rawKey, userId } = await setupTenantWithUserAndKey(
        app,
        'Event Field Route Tenant',
      );

      await appendEvent(
        makeEvent(userId, {
          module: 'identity',
          timestamp: '2025-06-01T00:00:01.000Z',
          changes: [
            {
              field: 'firstName',
              previousValue: null,
              newValue: 'Frodo',
              confidence: 1,
              goodBy: '2027-01-01T00:00:00.000Z',
            },
          ],
        }),
      );
      await appendEvent(
        makeEvent(userId, {
          module: 'identity',
          timestamp: '2025-06-01T00:00:02.000Z',
          changes: [
            {
              field: 'lastName',
              previousValue: null,
              newValue: 'Baggins',
              confidence: 1,
              goodBy: '2027-01-01T00:00:00.000Z',
            },
          ],
        }),
      );

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/events/identity/firstName`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].changes[0].field).toBe('firstName');
      expect(body.resolvedValue).toBeNull(); // Stub — Phase 3c
    });
  });

  describe('authentication', () => {
    it('returns 401 without an API key', async () => {
      const res = await app.handle(
        jsonRequest('/api/v1/users/some-user/events'),
      );

      expect(res.status).toBe(401);
    });
  });

  describe('tenant-user link verification', () => {
    it('returns 404 for user not linked to tenant', async () => {
      const { rawKey } = await setupTenantWithUserAndKey(
        app,
        'Event Unlinked Tenant',
      );

      const res = await app.handle(
        jsonRequest('/api/v1/users/nonexistent-user-id/events', {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.code).toBe('NOT_FOUND');
    });
  });
});
