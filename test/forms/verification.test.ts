import { describe, it, expect, beforeAll } from 'vitest';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import { putModule } from '../../src/store/user-store.js';
import { verifyIdentity } from '../../src/forms/verification.js';

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
// Tests
// ---------------------------------------------------------------------------

describe('identity verification', () => {
  const userId = `user-verify-${Date.now()}`;

  beforeAll(async () => {
    await ensureTable();

    // Store identity data for the test user
    await putModule(userId, 'identity', {
      firstName: 'Bilbo',
      lastName: 'Baggins',
      ssn: '123456789',
      dateOfBirth: '2890-09-22',
    });
  });

  it('returns true when all PII matches', async () => {
    const result = await verifyIdentity(userId, {
      firstName: 'Bilbo',
      lastName: 'Baggins',
      ssn: '123456789',
    });
    expect(result).toBe(true);
  });

  it('returns true with case-insensitive name matching', async () => {
    const result = await verifyIdentity(userId, {
      firstName: 'bilbo',
      lastName: 'BAGGINS',
      ssn: '123456789',
    });
    expect(result).toBe(true);
  });

  it('returns true with leading/trailing whitespace in names', async () => {
    const result = await verifyIdentity(userId, {
      firstName: '  Bilbo  ',
      lastName: '  Baggins  ',
      ssn: '123456789',
    });
    expect(result).toBe(true);
  });

  it('returns false when firstName does not match', async () => {
    const result = await verifyIdentity(userId, {
      firstName: 'Frodo',
      lastName: 'Baggins',
      ssn: '123456789',
    });
    expect(result).toBe(false);
  });

  it('returns false when lastName does not match', async () => {
    const result = await verifyIdentity(userId, {
      firstName: 'Bilbo',
      lastName: 'Gamgee',
      ssn: '123456789',
    });
    expect(result).toBe(false);
  });

  it('returns false when SSN does not match', async () => {
    const result = await verifyIdentity(userId, {
      firstName: 'Bilbo',
      lastName: 'Baggins',
      ssn: '999999999',
    });
    expect(result).toBe(false);
  });

  it('returns false for a non-existent user', async () => {
    const result = await verifyIdentity('nonexistent-user', {
      firstName: 'Bilbo',
      lastName: 'Baggins',
      ssn: '123456789',
    });
    expect(result).toBe(false);
  });
});
