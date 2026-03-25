import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient, docClient, LOOKUP_TABLE_NAME } from '../../src/store/dynamo-client.js';
import { addIdentifier, removeIdentifiers } from '../../src/store/identity-lookup-store.js';
import { resolveIdentity } from '../../src/identity/resolver.js';

// ---------------------------------------------------------------------------
// Table setup
// ---------------------------------------------------------------------------

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

/**
 * Remove all items from the lookup table (test isolation).
 */
async function cleanLookupTable(): Promise<void> {
  let lastKey: Record<string, unknown> | undefined;
  do {
    const scan = await docClient.send(
      new ScanCommand({ TableName: LOOKUP_TABLE_NAME, ExclusiveStartKey: lastKey }),
    );
    if (scan.Items && scan.Items.length > 0) {
      for (const item of scan.Items) {
        await docClient.send(
          new DeleteCommand({
            TableName: LOOKUP_TABLE_NAME,
            Key: { PK: item.PK as string, SK: item.SK as string },
          }),
        );
      }
    }
    lastKey = scan.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('resolveIdentity', () => {
  beforeAll(async () => {
    await ensureLookupTable();
    await cleanLookupTable();
  });

  afterAll(async () => {
    await cleanLookupTable();
  });

  it('resolves a new user when no matches exist', async () => {
    const result = await resolveIdentity({
      email: 'brand-new@example.com',
      phone: '+15559999999',
    });

    expect(result.type).toBe('new');
    expect(result.userId).toBeDefined();
    expect(result.candidateIds).toBeUndefined();
  });

  it('resolves an existing user when email matches', async () => {
    const existingUserId = 'user-email-match-001';
    await addIdentifier('EMAIL', 'known@example.com', existingUserId);

    const result = await resolveIdentity({ email: 'known@example.com' });

    expect(result.type).toBe('existing');
    expect(result.userId).toBe(existingUserId);
  });

  it('resolves an existing user when phone matches', async () => {
    const existingUserId = 'user-phone-match-001';
    await addIdentifier('PHONE', '+15551112222', existingUserId);

    const result = await resolveIdentity({ phone: '+15551112222' });

    expect(result.type).toBe('existing');
    expect(result.userId).toBe(existingUserId);
  });

  it('resolves existing user when both email and phone match the same user', async () => {
    const existingUserId = 'user-both-match-001';
    await addIdentifier('EMAIL', 'both@example.com', existingUserId);
    await addIdentifier('PHONE', '+15553334444', existingUserId);

    const result = await resolveIdentity({
      email: 'both@example.com',
      phone: '+15553334444',
    });

    expect(result.type).toBe('existing');
    expect(result.userId).toBe(existingUserId);
  });

  it('detects conflict when email and phone match different users', async () => {
    const userA = 'user-conflict-A';
    const userB = 'user-conflict-B';
    await addIdentifier('EMAIL', 'conflict-email@example.com', userA);
    await addIdentifier('PHONE', '+15557778888', userB);

    const result = await resolveIdentity({
      email: 'conflict-email@example.com',
      phone: '+15557778888',
    });

    expect(result.type).toBe('conflict');
    expect(result.candidateIds).toEqual([userA, userB]);
    expect(result.userId).toBeUndefined();
  });

  it('handles email-only input', async () => {
    const result = await resolveIdentity({ email: 'only-email@example.com' });

    expect(result.type).toBe('new');
    expect(result.userId).toBeDefined();
  });

  it('handles phone-only input', async () => {
    const result = await resolveIdentity({ phone: '+15550000001' });

    expect(result.type).toBe('new');
    expect(result.userId).toBeDefined();
  });
});
