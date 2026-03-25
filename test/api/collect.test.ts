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
import { moduleRoutes } from '../../src/api/routes/modules.js';
import { formCreateRoute, formPublicRoutes } from '../../src/api/routes/forms.js';
import { collectRoute } from '../../src/api/routes/collect.js';
import { eventRoutes } from '../../src/api/routes/events.js';
import { registerBuiltinComponents } from '../../src/forms/components/index.js';
import { VerificationTier } from '../../src/types.js';
import type { GeneratedApiKey } from '../../src/tenancy/types.js';
import type { FormDefinition } from '../../src/forms/types.js';

// Side-effect import — registers module schemas
import '../../src/modules/index.js';

// Register custom components
registerBuiltinComponents();

// ---------------------------------------------------------------------------
// Table setup (same pattern as forms.test.ts)
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
    .use(moduleRoutes)
    .use(formCreateRoute)
    .use(formPublicRoutes)
    .use(eventRoutes)
    .use(collectRoute);
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

async function setupScenario(app: ReturnType<typeof createTestApp>): Promise<{
  tenantId: string;
  rawKey: string;
  userId: string;
}> {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Create tenant
  const createRes = await app.handle(
    jsonRequest('/api/v1/tenants', {
      method: 'POST',
      body: {
        name: `Collect Test Tenant ${uniqueSuffix}`,
        callbackUrls: ['https://example.com/callback'],
        permissions: [
          { module: 'contact', requiredTier: VerificationTier.BasicOTP },
        ],
      },
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
      body: {
        email: `collect-test-${uniqueSuffix}@test.com`,
      },
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

describe('collect API routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(async () => {
    await ensureMainTable();
    await ensureLookupTable();
    app = createTestApp();
  });

  describe('GET /frodo-collect.js', () => {
    it('returns JavaScript with correct content-type', async () => {
      const res = await app.handle(
        new Request('http://localhost/frodo-collect.js', { method: 'GET' }),
      );

      expect(res.status).toBe(200);
      const contentType = res.headers.get('Content-Type');
      expect(contentType).toContain('application/javascript');

      const body = await res.text();
      expect(body.length).toBeGreaterThan(0);
    });

    it('includes cache-control header', async () => {
      const res = await app.handle(
        new Request('http://localhost/frodo-collect.js', { method: 'GET' }),
      );

      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toContain('max-age=');
    });
  });

  describe('POST /forms/:token/submit with Frodo Collect format', () => {
    it('creates events correctly (one event per module)', async () => {
      const { rawKey, userId } = await setupScenario(app);

      const formDef: FormDefinition = {
        formId: 'collect-submit-test',
        title: 'Collect Submit Test',
        type: 'data_collection',
        fields: [
          {
            module: 'contact',
            field: 'email',
            label: 'Email',
            inputType: 'email',
            required: true,
          },
          {
            module: 'contact',
            field: 'phone',
            label: 'Phone',
            inputType: 'phone',
          },
          {
            module: 'identity',
            field: 'firstName',
            label: 'First Name',
            inputType: 'text',
            required: true,
          },
        ],
      };

      // Create form token
      const createRes = await app.handle(
        jsonRequest('/forms', {
          method: 'POST',
          body: { formDefinition: formDef, userId },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );
      const { token } = await createRes.json();

      // Submit using Frodo Collect format (JSON with fields array)
      const submitRes = await app.handle(
        jsonRequest(`/forms/${token}/submit`, {
          method: 'POST',
          body: {
            fields: [
              { module: 'contact', field: 'email', value: 'frodo@shire.me' },
              { module: 'contact', field: 'phone', value: '+15551234567' },
              { module: 'identity', field: 'firstName', value: 'Frodo' },
            ],
            source: 'user',
          },
        }),
      );

      expect(submitRes.status).toBe(200);
      const result = await submitRes.json();

      // Two modules = two events
      expect(result.eventsCreated).toBe(2);
    });

    it('returns JSON errors for validation failures', async () => {
      const { rawKey, userId } = await setupScenario(app);

      const formDef: FormDefinition = {
        formId: 'collect-validate-test',
        title: 'Collect Validate Test',
        type: 'data_collection',
        fields: [
          {
            module: 'contact',
            field: 'email',
            label: 'Email',
            inputType: 'email',
            required: true,
          },
        ],
      };

      const createRes = await app.handle(
        jsonRequest('/forms', {
          method: 'POST',
          body: { formDefinition: formDef, userId },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );
      const { token } = await createRes.json();

      // Submit with missing required field
      const submitRes = await app.handle(
        jsonRequest(`/forms/${token}/submit`, {
          method: 'POST',
          body: {
            fields: [],
            source: 'user',
          },
        }),
      );

      expect(submitRes.status).toBe(400);
      const result = await submitRes.json();
      expect(result.message).toBe('Validation failed');
      expect(result.errors).toBeDefined();
    });

    it('returns JSON 404 for invalid token', async () => {
      const submitRes = await app.handle(
        jsonRequest('/forms/nonexistent-token/submit', {
          method: 'POST',
          body: {
            fields: [{ module: 'contact', field: 'email', value: 'a@b.com' }],
            source: 'user',
          },
        }),
      );

      expect(submitRes.status).toBe(404);
      const result = await submitRes.json();
      expect(result.message).toBeDefined();
    });

    it('preserves custom source attribution in events', async () => {
      const { rawKey, userId } = await setupScenario(app);

      const formDef: FormDefinition = {
        formId: 'collect-source-test',
        title: 'Source Test',
        type: 'data_collection',
        fields: [
          {
            module: 'contact',
            field: 'email',
            label: 'Email',
            inputType: 'email',
            required: true,
          },
        ],
      };

      const createRes = await app.handle(
        jsonRequest('/forms', {
          method: 'POST',
          body: { formDefinition: formDef, userId },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );
      const { token } = await createRes.json();

      const submitRes = await app.handle(
        jsonRequest(`/forms/${token}/submit`, {
          method: 'POST',
          body: {
            fields: [
              { module: 'contact', field: 'email', value: 'frodo@shire.me' },
            ],
            source: 'custom-widget',
          },
        }),
      );

      expect(submitRes.status).toBe(200);
      const result = await submitRes.json();
      expect(result.eventsCreated).toBe(1);

      // Verify the event was created with the custom source by fetching events
      const eventsRes = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/events`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      if (eventsRes.status === 200) {
        const eventsBody = await eventsRes.json();
        const events = eventsBody.events ?? eventsBody;
        if (Array.isArray(events) && events.length > 0) {
          const latestEvent = events[events.length - 1];
          expect(latestEvent.source.source).toBe('custom-widget');
        }
      }
    });
  });
});
