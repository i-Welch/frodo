import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'node:crypto';
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../src/store/dynamo-client.js';
import {
  appendEvent,
  getEventsForUser,
  getEventsForModule,
  getEventsForField,
  getEventsBySource,
  deleteEventsForUser,
} from '../../src/store/event-store.js';
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
    eventId: crypto.randomUUID(),
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
    ...(overrides.eventId !== undefined ? { eventId: overrides.eventId } : {}),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('event-store', () => {
  beforeAll(async () => {
    await ensureTable();
  });

  describe('appendEvent + getEventsForUser', () => {
    it('appends an event and queries it back', async () => {
      const userId = crypto.randomUUID();
      const event = makeEvent({ userId });

      await appendEvent(event);

      const result = await getEventsForUser(userId);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].eventId).toBe(event.eventId);
      expect(result.events[0].userId).toBe(userId);
      expect(result.events[0].module).toBe('identity');
      expect(result.events[0].changes).toEqual(event.changes);
      expect(result.events[0].source).toEqual(event.source);
      expect(result.cursor).toBeUndefined();
    });
  });

  describe('getEventsForModule', () => {
    it('filters events by module', async () => {
      const userId = crypto.randomUUID();

      const identityEvent = makeEvent({
        userId,
        module: 'identity',
        timestamp: '2025-01-01T00:00:01.000Z',
      });
      const contactEvent = makeEvent({
        userId,
        module: 'contact',
        timestamp: '2025-01-01T00:00:02.000Z',
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
      const incomeEvent = makeEvent({
        userId,
        module: 'income',
        timestamp: '2025-01-01T00:00:03.000Z',
        changes: [
          {
            field: 'annualIncome',
            previousValue: null,
            newValue: 50000,
            confidence: 0.8,
            goodBy: '2026-06-01T00:00:00.000Z',
          },
        ],
      });

      await appendEvent(identityEvent);
      await appendEvent(contactEvent);
      await appendEvent(incomeEvent);

      // Query only contact events
      const contactResult = await getEventsForModule(userId, 'contact');
      expect(contactResult.events).toHaveLength(1);
      expect(contactResult.events[0].eventId).toBe(contactEvent.eventId);
      expect(contactResult.events[0].module).toBe('contact');

      // Query only identity events
      const identityResult = await getEventsForModule(userId, 'identity');
      expect(identityResult.events).toHaveLength(1);
      expect(identityResult.events[0].eventId).toBe(identityEvent.eventId);

      // All events for user
      const allResult = await getEventsForUser(userId);
      expect(allResult.events).toHaveLength(3);
    });
  });

  describe('pagination', () => {
    it('paginates with limit and cursor', async () => {
      const userId = crypto.randomUUID();

      // Insert 5 events with sequential timestamps
      const events: DataEvent[] = [];
      for (let i = 0; i < 5; i++) {
        const event = makeEvent({
          userId,
          module: 'identity',
          timestamp: `2025-01-01T00:00:0${i}.000Z`,
        });
        events.push(event);
        await appendEvent(event);
      }

      // First page: limit 2
      const page1 = await getEventsForUser(userId, { limit: 2 });
      expect(page1.events).toHaveLength(2);
      expect(page1.cursor).toBeDefined();
      expect(page1.events[0].eventId).toBe(events[0].eventId);
      expect(page1.events[1].eventId).toBe(events[1].eventId);

      // Second page: limit 2 with cursor
      const page2 = await getEventsForUser(userId, {
        limit: 2,
        cursor: page1.cursor,
      });
      expect(page2.events).toHaveLength(2);
      expect(page2.cursor).toBeDefined();
      expect(page2.events[0].eventId).toBe(events[2].eventId);
      expect(page2.events[1].eventId).toBe(events[3].eventId);

      // Third page: limit 2 with cursor — should get 1 remaining
      const page3 = await getEventsForUser(userId, {
        limit: 2,
        cursor: page2.cursor,
      });
      expect(page3.events).toHaveLength(1);
      expect(page3.cursor).toBeUndefined();
      expect(page3.events[0].eventId).toBe(events[4].eventId);
    });
  });

  describe('getEventsForField', () => {
    it('filters events to those containing changes for a specific field', async () => {
      const userId = crypto.randomUUID();

      const firstNameEvent = makeEvent({
        userId,
        module: 'identity',
        timestamp: '2025-01-01T00:00:01.000Z',
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Frodo',
            confidence: 1,
            goodBy: '2027-01-01T00:00:00.000Z',
          },
        ],
      });

      const lastNameEvent = makeEvent({
        userId,
        module: 'identity',
        timestamp: '2025-01-01T00:00:02.000Z',
        changes: [
          {
            field: 'lastName',
            previousValue: null,
            newValue: 'Baggins',
            confidence: 1,
            goodBy: '2027-01-01T00:00:00.000Z',
          },
        ],
      });

      const firstNameUpdateEvent = makeEvent({
        userId,
        module: 'identity',
        timestamp: '2025-01-01T00:00:03.000Z',
        changes: [
          {
            field: 'firstName',
            previousValue: 'Frodo',
            newValue: 'Bilbo',
            confidence: 0.9,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
          {
            field: 'lastName',
            previousValue: 'Baggins',
            newValue: 'Baggins',
            confidence: 1,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
        ],
      });

      await appendEvent(firstNameEvent);
      await appendEvent(lastNameEvent);
      await appendEvent(firstNameUpdateEvent);

      // Query field history for 'firstName'
      const firstNameHistory = await getEventsForField(
        userId,
        'identity',
        'firstName',
      );
      expect(firstNameHistory).toHaveLength(2);
      expect(firstNameHistory[0].eventId).toBe(firstNameEvent.eventId);
      expect(firstNameHistory[1].eventId).toBe(firstNameUpdateEvent.eventId);

      // Query field history for 'lastName'
      const lastNameHistory = await getEventsForField(
        userId,
        'identity',
        'lastName',
      );
      expect(lastNameHistory).toHaveLength(2);
      expect(lastNameHistory[0].eventId).toBe(lastNameEvent.eventId);
      expect(lastNameHistory[1].eventId).toBe(firstNameUpdateEvent.eventId);
    });
  });

  describe('getEventsBySource', () => {
    it('queries events by source via GSI1', async () => {
      const userId = crypto.randomUUID();
      const uniqueSource = `test-source-${crypto.randomUUID().slice(0, 8)}`;

      const event = makeEvent({
        userId,
        source: { source: uniqueSource, actor: 'test-key' },
      });

      await appendEvent(event);

      const result = await getEventsBySource(uniqueSource);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].eventId).toBe(event.eventId);
      expect(result.events[0].source.source).toBe(uniqueSource);
    });
  });

  describe('deleteEventsForUser', () => {
    it('removes all events for a user', async () => {
      const userId = crypto.randomUUID();

      await appendEvent(
        makeEvent({
          userId,
          module: 'identity',
          timestamp: '2025-01-01T00:00:01.000Z',
        }),
      );
      await appendEvent(
        makeEvent({
          userId,
          module: 'contact',
          timestamp: '2025-01-01T00:00:02.000Z',
        }),
      );
      await appendEvent(
        makeEvent({
          userId,
          module: 'income',
          timestamp: '2025-01-01T00:00:03.000Z',
        }),
      );

      // Confirm events exist
      const before = await getEventsForUser(userId);
      expect(before.events).toHaveLength(3);

      // Delete all
      await deleteEventsForUser(userId);

      // Confirm all gone
      const after = await getEventsForUser(userId);
      expect(after.events).toHaveLength(0);
    });
  });

  describe('metadata', () => {
    it('stores and retrieves optional metadata', async () => {
      const userId = crypto.randomUUID();
      const event = makeEvent({
        userId,
        metadata: { requestId: 'req-123', ip: '127.0.0.1' },
      });

      await appendEvent(event);

      const result = await getEventsForUser(userId);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].metadata).toEqual({
        requestId: 'req-123',
        ip: '127.0.0.1',
      });
    });

    it('omits metadata when not provided', async () => {
      const userId = crypto.randomUUID();
      const event = makeEvent({ userId });

      await appendEvent(event);

      const result = await getEventsForUser(userId);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].metadata).toBeUndefined();
    });
  });
});
