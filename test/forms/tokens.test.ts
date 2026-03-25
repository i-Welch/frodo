import { describe, it, expect, beforeAll } from 'vitest';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import {
  createFormToken,
  getFormToken,
  updateFormToken,
  deleteFormToken,
} from '../../src/forms/tokens.js';
import { VerificationTier } from '../../src/types.js';
import type { FormDefinition, OtpState } from '../../src/forms/types.js';

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
// Helpers
// ---------------------------------------------------------------------------

function makeFormDef(overrides?: Partial<FormDefinition>): FormDefinition {
  return {
    formId: `form-${Date.now()}`,
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
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('form tokens', () => {
  beforeAll(async () => {
    await ensureTable();
  });

  it('creates a token and retrieves it', async () => {
    const formDef = makeFormDef();

    const token = await createFormToken({
      formDefinition: formDef,
      userId: `user-${Date.now()}`,
      tenantId: `tenant-${Date.now()}`,
    });

    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(20);

    const retrieved = await getFormToken(token);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.token).toBe(token);
    expect(retrieved!.formDefinition.formId).toBe(formDef.formId);
    expect(retrieved!.formDefinition.type).toBe('data_collection');
    expect(retrieved!.expiresAt).not.toBeNull(); // default 1 hour
  });

  it('returns null for an expired token', async () => {
    const formDef = makeFormDef({
      expiresIn: { minutes: 0 }, // 0 → falls back to default, let's set to very short
    });

    // Create a token with a very short expiry by manipulating the clock
    const token = await createFormToken({
      formDefinition: formDef,
      userId: `user-exp-${Date.now()}`,
      tenantId: `tenant-exp-${Date.now()}`,
    });

    // Manually expire it by updating the expiresAt to the past
    await updateFormToken(token, {
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });

    const retrieved = await getFormToken(token);
    expect(retrieved).toBeNull();
  });

  it('never-expire token works', async () => {
    const formDef = makeFormDef({ expiresIn: null });

    const token = await createFormToken({
      formDefinition: formDef,
      userId: `user-never-${Date.now()}`,
      tenantId: `tenant-never-${Date.now()}`,
    });

    const retrieved = await getFormToken(token);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.expiresAt).toBeNull();
  });

  it('updates OTP state on token', async () => {
    const formDef = makeFormDef({ type: 'otp_verification' });

    const token = await createFormToken({
      formDefinition: formDef,
      userId: `user-otp-${Date.now()}`,
      tenantId: `tenant-otp-${Date.now()}`,
    });

    const otpState: OtpState = {
      hashedOtp: 'abc123hash',
      channel: 'email',
      attempts: 0,
      expiresAt: new Date(Date.now() + 600_000).toISOString(),
    };

    await updateFormToken(token, { otpState });

    const retrieved = await getFormToken(token);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.otpState).toBeDefined();
    expect(retrieved!.otpState!.hashedOtp).toBe('abc123hash');
    expect(retrieved!.otpState!.channel).toBe('email');
    expect(retrieved!.otpState!.attempts).toBe(0);
  });

  it('deletes a token', async () => {
    const formDef = makeFormDef();

    const token = await createFormToken({
      formDefinition: formDef,
      userId: `user-del-${Date.now()}`,
      tenantId: `tenant-del-${Date.now()}`,
    });

    // Confirm it exists
    const before = await getFormToken(token);
    expect(before).not.toBeNull();

    // Delete
    await deleteFormToken(token);

    // Confirm it's gone
    const after = await getFormToken(token);
    expect(after).toBeNull();
  });

  it('returns null for a non-existent token', async () => {
    const retrieved = await getFormToken('nonexistent-token-xyz');
    expect(retrieved).toBeNull();
  });

  it('stores optional fields', async () => {
    const formDef = makeFormDef();

    const token = await createFormToken({
      formDefinition: formDef,
      userId: `user-opt-${Date.now()}`,
      tenantId: `tenant-opt-${Date.now()}`,
      callbackUrl: 'https://example.com/callback',
      requestedModules: ['contact', 'employment'],
      requiredTier: VerificationTier.BasicOTP,
    });

    const retrieved = await getFormToken(token);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.callbackUrl).toBe('https://example.com/callback');
    expect(retrieved!.requestedModules).toEqual(['contact', 'employment']);
    expect(retrieved!.requiredTier).toBe(VerificationTier.BasicOTP);
  });
});
