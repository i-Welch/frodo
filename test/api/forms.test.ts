import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
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
import { registerBuiltinComponents } from '../../src/forms/components/index.js';
import { setOtpProvider, type OtpProvider } from '../../src/forms/otp-provider.js';
import { createSession } from '../../src/sessions/manager.js';
import { putModule } from '../../src/store/user-store.js';
import { VerificationTier } from '../../src/types.js';
import type { GeneratedApiKey } from '../../src/tenancy/types.js';
import type { FormDefinition } from '../../src/forms/types.js';

// Side-effect import — registers module schemas
import '../../src/modules/index.js';

// Register custom components
registerBuiltinComponents();

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
    .use(formCreateRoute)
    .use(formPublicRoutes);
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

function formRequest(
  path: string,
  body: Record<string, string>,
  method = 'POST',
): Request {
  const params = new URLSearchParams(body);
  return new Request(`http://localhost${path}`, {
    method,
    body: params.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

/**
 * Capture OTP codes sent by the provider.
 */
class TestOtpProvider implements OtpProvider {
  public lastCode: string | null = null;
  public lastChannel: string | null = null;
  public lastDestination: string | null = null;

  async sendOtp(channel: 'email' | 'phone', destination: string, code: string): Promise<void> {
    this.lastCode = code;
    this.lastChannel = channel;
    this.lastDestination = destination;
  }
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
        name: `Forms Test Tenant ${uniqueSuffix}`,
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
        email: `forms-test-${uniqueSuffix}@test.com`,
      },
      headers: { Authorization: `Bearer ${generated.rawKey}` },
    }),
  );
  const user = await userRes.json();

  // Store contact data
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
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('forms API routes', () => {
  let app: ReturnType<typeof createTestApp>;
  let testOtp: TestOtpProvider;

  beforeAll(async () => {
    await ensureMainTable();
    await ensureLookupTable();
    app = createTestApp();
    testOtp = new TestOtpProvider();
    setOtpProvider(testOtp);
  });

  beforeEach(() => {
    testOtp.lastCode = null;
    testOtp.lastChannel = null;
    testOtp.lastDestination = null;
  });

  describe('POST /forms (create form token)', () => {
    it('creates a form token with API key auth', async () => {
      const { rawKey, userId } = await setupScenario(app);

      const formDef: FormDefinition = {
        formId: 'test-create',
        title: 'Test Form',
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

      const res = await app.handle(
        jsonRequest('/forms', {
          method: 'POST',
          body: { formDefinition: formDef, userId },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.token).toBeDefined();
      expect(body.url).toContain('/forms/');
    });

    it('returns 401 without API key', async () => {
      const res = await app.handle(
        jsonRequest('/forms', {
          method: 'POST',
          body: {
            formDefinition: {
              formId: 'x',
              title: 'X',
              type: 'data_collection',
              fields: [],
            },
            userId: 'u',
          },
        }),
      );

      expect(res.status).toBe(401);
    });
  });

  describe('GET /forms/:token (render form)', () => {
    it('renders HTML for a valid token', async () => {
      const { rawKey, userId } = await setupScenario(app);

      const formDef: FormDefinition = {
        formId: 'render-test',
        title: 'Render Test Form',
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

      const res = await app.handle(
        new Request(`http://localhost/forms/${token}`, { method: 'GET' }),
      );

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Render Test Form');
      expect(html).toContain('htmx.org');
    });

    it('returns 404 for an expired token', async () => {
      const { rawKey, userId } = await setupScenario(app);

      const formDef: FormDefinition = {
        formId: 'expired-test',
        title: 'Expired Form',
        type: 'data_collection',
        fields: [],
        expiresIn: { minutes: 1 },
      };

      const createRes = await app.handle(
        jsonRequest('/forms', {
          method: 'POST',
          body: { formDefinition: formDef, userId },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );
      const { token } = await createRes.json();

      // Manually expire the token
      const { updateFormToken } = await import('../../src/forms/tokens.js');
      await updateFormToken(token, {
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      });

      const res = await app.handle(
        new Request(`http://localhost/forms/${token}`, { method: 'GET' }),
      );

      expect(res.status).toBe(404);
      const html = await res.text();
      expect(html).toContain('expired');
    });

    it('returns 404 for a nonexistent token', async () => {
      const res = await app.handle(
        new Request('http://localhost/forms/nonexistent-token-xyz', { method: 'GET' }),
      );

      expect(res.status).toBe(404);
    });
  });

  describe('POST /forms/:token/submit (data collection)', () => {
    it('validates and stores submitted data', async () => {
      const { rawKey, userId } = await setupScenario(app);

      const formDef: FormDefinition = {
        formId: 'submit-test',
        title: 'Submit Test',
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

      const res = await app.handle(
        formRequest(`/forms/${token}/submit`, {
          'contact.email': 'frodo@shire.me',
        }),
      );

      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('Success');
      expect(html).toContain('submitted successfully');
    });

    it('returns error for missing required fields', async () => {
      const { rawKey, userId } = await setupScenario(app);

      const formDef: FormDefinition = {
        formId: 'required-test',
        title: 'Required Test',
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

      // Submit without the required field
      const res = await app.handle(
        formRequest(`/forms/${token}/submit`, {}),
      );

      expect(res.status).toBe(400);
      const html = await res.text();
      expect(html).toContain('Email is required');
    });
  });

  describe('identity verification flow', () => {
    it('consent -> submit -> success redirect', async () => {
      const { rawKey, userId, tenantId } = await setupScenario(app);

      // Store identity data
      await putModule(userId, 'identity', {
        firstName: 'Bilbo',
        lastName: 'Baggins',
        ssn: '123456789',
      });

      const formDef: FormDefinition = {
        formId: 'idv-test',
        title: 'Identity Verification',
        type: 'identity_verification',
        fields: [
          { module: 'identity', field: 'firstName', label: 'First Name', inputType: 'text', required: true },
          { module: 'identity', field: 'lastName', label: 'Last Name', inputType: 'text', required: true },
          { module: 'identity', field: 'ssn', label: 'SSN', inputType: 'ssn', required: true },
        ],
      };

      // Create form token
      const createRes = await app.handle(
        jsonRequest('/forms', {
          method: 'POST',
          body: {
            formDefinition: formDef,
            userId,
            callbackUrl: 'https://example.com/callback',
          },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );
      const { token } = await createRes.json();

      // Step 1: GET should show consent
      const getRes = await app.handle(
        new Request(`http://localhost/forms/${token}`, { method: 'GET' }),
      );
      expect(getRes.status).toBe(200);
      const consentHtml = await getRes.text();
      expect(consentHtml).toContain('Authorization Required');

      // Step 2: Accept consent
      const consentRes = await app.handle(
        formRequest(`/forms/${token}/consent`, { accepted: 'true' }),
      );
      expect(consentRes.status).toBe(200);
      const formHtml = await consentRes.text();
      expect(formHtml).toContain('Identity Verification');

      // Step 3: Submit identity data
      const submitRes = await app.handle(
        formRequest(`/forms/${token}/submit`, {
          'identity.firstName': 'Bilbo',
          'identity.lastName': 'Baggins',
          'identity.ssn': '123456789',
        }),
      );
      expect(submitRes.status).toBe(200);
      const successHtml = await submitRes.text();
      expect(successHtml).toContain('Success');
      expect(successHtml).toContain('verified successfully');
      expect(successHtml).toContain('example.com/callback');
    });

    it('returns error for wrong identity', async () => {
      const { rawKey, userId } = await setupScenario(app);

      // Store identity data
      await putModule(userId, 'identity', {
        firstName: 'Bilbo',
        lastName: 'Baggins',
        ssn: '123456789',
      });

      const formDef: FormDefinition = {
        formId: 'idv-fail-test',
        title: 'Identity Verification',
        type: 'identity_verification',
        fields: [
          { module: 'identity', field: 'firstName', label: 'First Name', inputType: 'text', required: true },
          { module: 'identity', field: 'lastName', label: 'Last Name', inputType: 'text', required: true },
          { module: 'identity', field: 'ssn', label: 'SSN', inputType: 'ssn', required: true },
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

      // Accept consent
      await app.handle(
        formRequest(`/forms/${token}/consent`, { accepted: 'true' }),
      );

      // Submit wrong SSN
      const submitRes = await app.handle(
        formRequest(`/forms/${token}/submit`, {
          'identity.firstName': 'Bilbo',
          'identity.lastName': 'Baggins',
          'identity.ssn': '999999999',
        }),
      );
      expect(submitRes.status).toBe(400);
      const html = await submitRes.text();
      expect(html).toContain('verification failed');
    });
  });

  describe('OTP verification flow', () => {
    it('consent -> send-otp -> verify-otp -> success redirect', async () => {
      const { rawKey, userId } = await setupScenario(app);

      const formDef: FormDefinition = {
        formId: 'otp-test',
        title: 'OTP Verification',
        type: 'otp_verification',
        fields: [],
      };

      const createRes = await app.handle(
        jsonRequest('/forms', {
          method: 'POST',
          body: {
            formDefinition: formDef,
            userId,
            callbackUrl: 'https://example.com/callback',
          },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );
      const { token } = await createRes.json();

      // Step 1: GET should show consent
      const getRes = await app.handle(
        new Request(`http://localhost/forms/${token}`, { method: 'GET' }),
      );
      expect(getRes.status).toBe(200);
      const consentHtml = await getRes.text();
      expect(consentHtml).toContain('Authorization Required');

      // Step 2: Accept consent — should show OTP send screen
      const consentRes = await app.handle(
        formRequest(`/forms/${token}/consent`, { accepted: 'true' }),
      );
      expect(consentRes.status).toBe(200);
      const sendHtml = await consentRes.text();
      expect(sendHtml).toContain('Verify your identity');

      // Step 3: Send OTP via email
      const sendRes = await app.handle(
        formRequest(`/forms/${token}/send-otp`, { channel: 'email' }),
      );
      expect(sendRes.status).toBe(200);
      const otpHtml = await sendRes.text();
      expect(otpHtml).toContain('Enter verification code');

      // Capture the OTP code from our test provider
      expect(testOtp.lastCode).not.toBeNull();
      expect(testOtp.lastChannel).toBe('email');
      const code = testOtp.lastCode!;

      // Step 4: Verify OTP
      const verifyRes = await app.handle(
        formRequest(`/forms/${token}/verify-otp`, { code }),
      );
      expect(verifyRes.status).toBe(200);
      const successHtml = await verifyRes.text();
      expect(successHtml).toContain('Success');
      expect(successHtml).toContain('example.com/callback');
    });

    it('rejects wrong OTP and tracks attempts', async () => {
      const { rawKey, userId } = await setupScenario(app);

      const formDef: FormDefinition = {
        formId: 'otp-fail-test',
        title: 'OTP Verification',
        type: 'otp_verification',
        fields: [],
      };

      const createRes = await app.handle(
        jsonRequest('/forms', {
          method: 'POST',
          body: { formDefinition: formDef, userId },
          headers: { Authorization: `Bearer ${rawKey}` },
        }),
      );
      const { token } = await createRes.json();

      // Accept consent
      await app.handle(
        formRequest(`/forms/${token}/consent`, { accepted: 'true' }),
      );

      // Send OTP
      await app.handle(
        formRequest(`/forms/${token}/send-otp`, { channel: 'email' }),
      );

      // Submit wrong code
      const res1 = await app.handle(
        formRequest(`/forms/${token}/verify-otp`, { code: '000000' }),
      );
      expect(res1.status).toBe(400);
      const html1 = await res1.text();
      expect(html1).toContain('Invalid code');
      expect(html1).toContain('2 attempts remaining');

      // Submit wrong code again
      const res2 = await app.handle(
        formRequest(`/forms/${token}/verify-otp`, { code: '111111' }),
      );
      expect(res2.status).toBe(400);
      const html2 = await res2.text();
      expect(html2).toContain('1 attempt remaining');

      // Third wrong attempt
      const res3 = await app.handle(
        formRequest(`/forms/${token}/verify-otp`, { code: '222222' }),
      );
      expect(res3.status).toBe(400);

      // Fourth attempt should be rejected (max 3)
      const res4 = await app.handle(
        formRequest(`/forms/${token}/verify-otp`, { code: '333333' }),
      );
      expect(res4.status).toBe(400);
      const html4 = await res4.text();
      expect(html4).toContain('Too many failed attempts');
    });
  });
});
