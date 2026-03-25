import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'node:crypto';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import { getItem } from '../../src/store/base-store.js';
import { keys } from '../../src/store/base-store.js';
import {
  putModule,
  getModule,
  getAllModules,
  deleteModule,
  deleteAllModules,
  getOrCreateDek,
} from '../../src/store/user-store.js';

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

describe('user-store', () => {
  beforeAll(async () => {
    await ensureTable();
  });

  describe('putModule + getModule round-trip', () => {
    it('encrypts data in DynamoDB and decrypts on read', async () => {
      const userId = crypto.randomUUID();
      const data = {
        firstName: 'Frodo',
        lastName: 'Baggins',
        dateOfBirth: '2968-09-22',
      };

      await putModule(userId, 'identity', data);

      // Verify the raw item in DynamoDB has encrypted fields (not plaintext)
      const rawItem = await getItem(keys.userModule(userId, 'identity'));
      expect(rawItem).not.toBeNull();
      expect(rawItem!.encryptedDek).toBeDefined();
      expect(typeof rawItem!.encryptedDek).toBe('string');

      // The data field should contain encrypted field objects, not plaintext
      const storedData = rawItem!.data as Record<string, unknown>;
      expect(storedData.firstName).toHaveProperty('ciphertext');
      expect(storedData.firstName).toHaveProperty('iv');
      expect(storedData.firstName).toHaveProperty('authTag');

      // Now read through the store — should get back decrypted data
      const retrieved = await getModule(userId, 'identity');
      expect(retrieved).not.toBeNull();
      expect(retrieved).toEqual(data);
    });
  });

  describe('getAllModules', () => {
    it('returns multiple modules for a user', async () => {
      const userId = crypto.randomUUID();

      const identityData = { firstName: 'Samwise', lastName: 'Gamgee' };
      const contactData = { email: 'sam@shire.me', phone: '+1555000111' };

      await putModule(userId, 'identity', identityData);
      await putModule(userId, 'contact', contactData);

      const all = await getAllModules(userId);

      expect(Object.keys(all)).toHaveLength(2);
      expect(all['identity']).toEqual(identityData);
      expect(all['contact']).toEqual(contactData);
    });

    it('returns empty object for user with no modules', async () => {
      const userId = crypto.randomUUID();
      const all = await getAllModules(userId);
      expect(all).toEqual({});
    });
  });

  describe('getModule', () => {
    it('returns null for nonexistent module', async () => {
      const userId = crypto.randomUUID();
      const result = await getModule(userId, 'identity');
      expect(result).toBeNull();
    });
  });

  describe('deleteModule', () => {
    it('removes a specific module', async () => {
      const userId = crypto.randomUUID();

      await putModule(userId, 'identity', { firstName: 'Gandalf' });
      await putModule(userId, 'contact', { email: 'gandalf@istari.me' });

      // Delete only identity
      await deleteModule(userId, 'identity');

      const identity = await getModule(userId, 'identity');
      expect(identity).toBeNull();

      // Contact should still exist
      const contact = await getModule(userId, 'contact');
      expect(contact).not.toBeNull();
      expect(contact!.email).toBe('gandalf@istari.me');
    });
  });

  describe('deleteAllModules', () => {
    it('removes all modules for a user', async () => {
      const userId = crypto.randomUUID();

      await putModule(userId, 'identity', { firstName: 'Aragorn' });
      await putModule(userId, 'contact', { email: 'aragorn@gondor.me' });

      await deleteAllModules(userId);

      const all = await getAllModules(userId);
      expect(all).toEqual({});
    });
  });

  describe('DEK reuse', () => {
    it('reuses the same DEK across multiple module writes for the same user', async () => {
      const userId = crypto.randomUUID();

      // First write creates a new DEK
      await putModule(userId, 'identity', { firstName: 'Legolas' });

      const firstItem = await getItem(keys.userModule(userId, 'identity'));
      const firstDek = firstItem!.encryptedDek as string;

      // Second write should reuse the same DEK
      await putModule(userId, 'contact', { email: 'legolas@mirkwood.me' });

      const secondItem = await getItem(keys.userModule(userId, 'contact'));
      const secondDek = secondItem!.encryptedDek as string;

      expect(firstDek).toBe(secondDek);
    });
  });
});
