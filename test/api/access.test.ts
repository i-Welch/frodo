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
import { accessRoutes } from '../../src/api/routes/access.js';
import { createSession } from '../../src/sessions/manager.js';
import { updateSessionExpiry } from '../../src/store/session-store.js';
import { getAccessLogsForTenant } from '../../src/store/access-log-store.js';
import { VerificationTier } from '../../src/types.js';
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
    .use(moduleRoutes)
    .use(accessRoutes);
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
 * Creates a tenant + API key + a linked user + stores module data.
 */
async function setupFullScenario(
  app: ReturnType<typeof createTestApp>,
): Promise<{
  tenantId: string;
  rawKey: string;
  userId: string;
  apiKeyId: string;
}> {
  // Create tenant with permissions and callback URLs
  const createRes = await app.handle(
    jsonRequest('/api/v1/tenants', {
      method: 'POST',
      body: {
        name: `Access Test Tenant ${Date.now()}`,
        callbackUrls: ['https://example.com/callback'],
        permissions: [
          { module: 'employment', requiredTier: VerificationTier.BasicOTP },
          { module: 'contact', requiredTier: VerificationTier.BasicOTP },
          { module: 'financial', requiredTier: VerificationTier.Identity },
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
        email: `access-test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
      },
      headers: { Authorization: `Bearer ${generated.rawKey}` },
    }),
  );
  const user = await userRes.json();

  // Store employment data for the user
  await app.handle(
    jsonRequest(`/api/v1/users/${user.userId}/modules/employment`, {
      method: 'PUT',
      body: {
        employer: 'Bag End Industries',
        title: 'Chief Hobbit',
        startDate: '2890-09-22',
        salary: 100000,
      },
      headers: { Authorization: `Bearer ${generated.rawKey}` },
    }),
  );

  // Store contact data for the user
  await app.handle(
    jsonRequest(`/api/v1/users/${user.userId}/modules/contact`, {
      method: 'PUT',
      body: {
        email: 'bilbo@shire.me',
        phone: '+15551234567',
      },
      headers: { Authorization: `Bearer ${generated.rawKey}` },
    }),
  );

  return {
    tenantId: tenant.tenantId,
    rawKey: generated.rawKey,
    userId: user.userId,
    apiKeyId: generated.keyId,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('access API routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(async () => {
    await ensureMainTable();
    await ensureLookupTable();
    app = createTestApp();
  });

  describe('POST /api/v1/users/:id/access', () => {
    it('returns verification_required with no session', async () => {
      const { rawKey, userId } = await setupFullScenario(app);

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/access`, {
          method: 'POST',
          body: { modules: ['employment'] },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('verification_required');
      expect(body.requiredTier).toBeGreaterThan(VerificationTier.None);
      expect(body.verificationUrl).toBeDefined();
    });

    it('returns data with a valid session', async () => {
      const { rawKey, userId, tenantId } = await setupFullScenario(app);

      // Create a session with sufficient tier (EnhancedOTP covers employment)
      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.EnhancedOTP,
      );

      const res = await app.handle(
        jsonRequest(
          `/api/v1/users/${userId}/access?sessionId=${session.sessionId}`,
          {
            method: 'POST',
            body: { modules: ['employment'] },
            headers: { Authorization: `Bearer ${rawKey}` },
          },
        ),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('success');
      expect(body.data).toBeDefined();
      expect(body.data.employment).toBeDefined();
      expect(body.data.employment.employer).toBe('Bag End Industries');
    });

    it('returned data is filtered by tier', async () => {
      const { rawKey, userId, tenantId } = await setupFullScenario(app);

      // Create a BasicOTP session (tier 1)
      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.BasicOTP,
      );

      const res = await app.handle(
        jsonRequest(
          `/api/v1/users/${userId}/access?sessionId=${session.sessionId}`,
          {
            method: 'POST',
            body: { modules: ['employment'] },
            headers: { Authorization: `Bearer ${rawKey}` },
          },
        ),
      );

      expect(res.status).toBe(200);
      const body = await res.json();

      // But the session tier (1) is below requiredTier for employment
      // Employment fields: employer(1), title(1), startDate(2), salary(2), history(2)
      // getRequiredTier returns 2 for employment, so BasicOTP (1) is insufficient
      // This should return verification_required
      // Actually: tier 1 < tier 2 required → verification_required
      expect(body.status).toBe('verification_required');
    });

    it('returns tier-filtered data when session tier is sufficient', async () => {
      const { rawKey, userId, tenantId } = await setupFullScenario(app);

      // Create an Identity session (tier 3) — sufficient for everything
      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.Identity,
      );

      const res = await app.handle(
        jsonRequest(
          `/api/v1/users/${userId}/access?sessionId=${session.sessionId}`,
          {
            method: 'POST',
            body: { modules: ['employment'] },
            headers: { Authorization: `Bearer ${rawKey}` },
          },
        ),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('success');

      // Tier 3 sees all fields
      expect(body.data.employment.employer).toBe('Bag End Industries');
      expect(body.data.employment.title).toBe('Chief Hobbit');
      expect(body.data.employment.startDate).toBe('2890-09-22');
      expect(body.data.employment.salary).toBe(100000);
    });

    it('access is logged', async () => {
      const { rawKey, userId, tenantId } = await setupFullScenario(app);

      // Create a session with tier 3
      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.Identity,
      );

      await app.handle(
        jsonRequest(
          `/api/v1/users/${userId}/access?sessionId=${session.sessionId}`,
          {
            method: 'POST',
            body: { modules: ['employment'] },
            headers: { Authorization: `Bearer ${rawKey}` },
          },
        ),
      );

      // Give the fire-and-forget log a moment to settle
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { logs } = await getAccessLogsForTenant(tenantId, { limit: 10 });
      expect(logs.length).toBeGreaterThan(0);

      const latestLog = logs[0];
      expect(latestLog.tenantId).toBe(tenantId);
      expect(latestLog.userId).toBe(userId);
      expect(latestLog.modules).toContain('employment');
      expect(latestLog.verifiedTier).toBe(VerificationTier.Identity);
    });

    it('returns 401 without an API key', async () => {
      const res = await app.handle(
        jsonRequest('/api/v1/users/some-user/access', {
          method: 'POST',
          body: { modules: ['employment'] },
        }),
      );

      expect(res.status).toBe(401);
    });

    it('returns 404 for a user not linked to the tenant', async () => {
      const { rawKey } = await setupFullScenario(app);

      const res = await app.handle(
        jsonRequest('/api/v1/users/nonexistent-user/access', {
          method: 'POST',
          body: { modules: ['employment'] },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.code).toBe('NOT_FOUND');
    });

    it('returns 400 for an empty modules array', async () => {
      const { rawKey, userId } = await setupFullScenario(app);

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/access`, {
          method: 'POST',
          body: { modules: [] },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(400);
    });

    it('returns 400 for an unknown module name', async () => {
      const { rawKey, userId } = await setupFullScenario(app);

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/access`, {
          method: 'POST',
          body: { modules: ['nonexistent-module'] },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(400);
    });

    it('rejects invalid callbackUrl', async () => {
      const { rawKey, userId } = await setupFullScenario(app);

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/access`, {
          method: 'POST',
          body: {
            modules: ['employment'],
            callbackUrl: 'https://evil.com/callback',
          },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('BAD_REQUEST');
    });

    it('accepts session ID from X-Session-Id header', async () => {
      const { rawKey, userId, tenantId } = await setupFullScenario(app);

      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.Identity,
      );

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/access`, {
          method: 'POST',
          body: { modules: ['employment'] },
          headers: {
            Authorization: `Bearer ${rawKey}`,
            'X-Session-Id': session.sessionId,
          },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('success');
    });

    it('returns verification_required when session belongs to a different user', async () => {
      const { rawKey, userId, tenantId } = await setupFullScenario(app);

      // Create a session for a different user
      const session = await createSession(
        'different-user-id',
        tenantId,
        VerificationTier.Identity,
      );

      const res = await app.handle(
        jsonRequest(
          `/api/v1/users/${userId}/access?sessionId=${session.sessionId}`,
          {
            method: 'POST',
            body: { modules: ['employment'] },
            headers: { Authorization: `Bearer ${rawKey}` },
          },
        ),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('verification_required');
    });
  });

  describe('GET /api/v1/users/:id/access/status', () => {
    it('returns { verified: false } with no session', async () => {
      const { rawKey, userId } = await setupFullScenario(app);

      const res = await app.handle(
        jsonRequest(`/api/v1/users/${userId}/access/status`, {
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.verified).toBe(false);
    });

    it('returns session info with a valid session', async () => {
      const { rawKey, userId, tenantId } = await setupFullScenario(app);

      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.EnhancedOTP,
      );

      const res = await app.handle(
        jsonRequest(
          `/api/v1/users/${userId}/access/status?sessionId=${session.sessionId}`,
          {
            headers: { Authorization: `Bearer ${rawKey}` },
          },
        ),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.verified).toBe(true);
      expect(body.verifiedTier).toBe(VerificationTier.EnhancedOTP);
      expect(body.expiresAt).toBeDefined();
    });

    it('returns { verified: false } with an expired session', async () => {
      const { rawKey, userId, tenantId } = await setupFullScenario(app);

      const session = await createSession(
        userId,
        tenantId,
        VerificationTier.BasicOTP,
      );

      // Expire the session
      const pastDate = new Date(Date.now() - 1000).toISOString();
      await updateSessionExpiry(session.sessionId, pastDate);

      const res = await app.handle(
        jsonRequest(
          `/api/v1/users/${userId}/access/status?sessionId=${session.sessionId}`,
          {
            headers: { Authorization: `Bearer ${rawKey}` },
          },
        ),
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.verified).toBe(false);
    });

    it('requires API key authentication', async () => {
      const res = await app.handle(
        jsonRequest('/api/v1/users/some-user/access/status'),
      );

      expect(res.status).toBe(401);
    });
  });
});
