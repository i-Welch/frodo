import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'node:crypto';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import { appendEvent } from '../../src/store/event-store.js';
import { getModule } from '../../src/store/user-store.js';
import { materializeModule } from '../../src/events/materializer.js';
import type { DataEvent } from '../../src/events/types.js';

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

function makeEvent(overrides: Partial<DataEvent> = {}): DataEvent {
  return {
    eventId: overrides.eventId ?? crypto.randomUUID(),
    userId: overrides.userId ?? crypto.randomUUID(),
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

describe('materializer', () => {
  beforeAll(async () => {
    await ensureTable();
  });

  it('materializes a module from events in DynamoDB', async () => {
    const userId = crypto.randomUUID();

    // Insert events with future goodBy dates so they are not expired
    const event1 = makeEvent({
      userId,
      module: 'identity',
      timestamp: '2026-01-01T00:00:00.000Z',
      source: { source: 'user', actor: 'test-key' },
      changes: [
        {
          field: 'firstName',
          previousValue: null,
          newValue: 'Frodo',
          confidence: 0.95,
          goodBy: '2028-01-01T00:00:00.000Z',
        },
        {
          field: 'lastName',
          previousValue: null,
          newValue: 'Baggins',
          confidence: 0.95,
          goodBy: '2028-01-01T00:00:00.000Z',
        },
      ],
    });

    const event2 = makeEvent({
      userId,
      module: 'identity',
      timestamp: '2026-02-01T00:00:00.000Z',
      source: { source: 'experian', actor: 'test-key' },
      changes: [
        {
          field: 'dateOfBirth',
          previousValue: null,
          newValue: '2968-09-22',
          confidence: 0.99,
          goodBy: '2028-02-01T00:00:00.000Z',
        },
      ],
    });

    await appendEvent(event1);
    await appendEvent(event2);

    const result = await materializeModule(userId, 'identity');

    expect(result).toHaveProperty('firstName', 'Frodo');
    expect(result).toHaveProperty('lastName', 'Baggins');
    expect(result).toHaveProperty('dateOfBirth', '2968-09-22');
  });

  it('resolves competing sources correctly', async () => {
    const userId = crypto.randomUUID();

    // Low-confidence user-reported income
    const userEvent = makeEvent({
      userId,
      module: 'income',
      timestamp: '2026-01-01T00:00:00.000Z',
      source: { source: 'user', actor: 'test-key' },
      changes: [
        {
          field: 'annualIncome',
          previousValue: null,
          newValue: 40000,
          confidence: 0.5,
          goodBy: '2028-01-01T00:00:00.000Z',
        },
      ],
    });

    // High-confidence verified income from truework
    const trueworkEvent = makeEvent({
      userId,
      module: 'income',
      timestamp: '2026-01-01T00:00:00.000Z',
      source: { source: 'truework', actor: 'test-key' },
      changes: [
        {
          field: 'annualIncome',
          previousValue: null,
          newValue: 55000,
          confidence: 0.9,
          goodBy: '2028-01-01T00:00:00.000Z',
        },
      ],
    });

    await appendEvent(userEvent);
    await appendEvent(trueworkEvent);

    const result = await materializeModule(userId, 'income');

    expect(result.annualIncome).toBe(55000);
  });

  it('persists the materialized module to the module store', async () => {
    const userId = crypto.randomUUID();

    const event = makeEvent({
      userId,
      module: 'identity',
      timestamp: '2026-01-01T00:00:00.000Z',
      source: { source: 'user', actor: 'test-key' },
      changes: [
        {
          field: 'firstName',
          previousValue: null,
          newValue: 'Samwise',
          confidence: 0.95,
          goodBy: '2028-01-01T00:00:00.000Z',
        },
        {
          field: 'lastName',
          previousValue: null,
          newValue: 'Gamgee',
          confidence: 0.95,
          goodBy: '2028-01-01T00:00:00.000Z',
        },
      ],
    });

    await appendEvent(event);

    // Materialize with persist
    const materialized = await materializeModule(userId, 'identity', {
      persist: true,
    });

    expect(materialized).toHaveProperty('firstName', 'Samwise');
    expect(materialized).toHaveProperty('lastName', 'Gamgee');

    // Verify the module was written to the module store
    const stored = await getModule(userId, 'identity');
    expect(stored).not.toBeNull();
    expect(stored).toEqual({
      firstName: 'Samwise',
      lastName: 'Gamgee',
    });
  });

  it('returns empty object when no events exist', async () => {
    const userId = crypto.randomUUID();

    const result = await materializeModule(userId, 'identity');

    expect(result).toEqual({});
  });

  it('only materializes events for the specified module', async () => {
    const userId = crypto.randomUUID();

    const identityEvent = makeEvent({
      userId,
      module: 'identity',
      timestamp: '2026-01-01T00:00:00.000Z',
      changes: [
        {
          field: 'firstName',
          previousValue: null,
          newValue: 'Frodo',
          confidence: 0.95,
          goodBy: '2028-01-01T00:00:00.000Z',
        },
      ],
    });

    const contactEvent = makeEvent({
      userId,
      module: 'contact',
      timestamp: '2026-01-01T00:00:00.000Z',
      changes: [
        {
          field: 'email',
          previousValue: null,
          newValue: 'frodo@shire.me',
          confidence: 0.95,
          goodBy: '2028-01-01T00:00:00.000Z',
        },
      ],
    });

    await appendEvent(identityEvent);
    await appendEvent(contactEvent);

    const identityResult = await materializeModule(userId, 'identity');
    expect(identityResult).toHaveProperty('firstName', 'Frodo');
    expect(identityResult).not.toHaveProperty('email');

    const contactResult = await materializeModule(userId, 'contact');
    expect(contactResult).toHaveProperty('email', 'frodo@shire.me');
    expect(contactResult).not.toHaveProperty('firstName');
  });
});
