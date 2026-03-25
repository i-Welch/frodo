import { keys, gsiKeys, putItem, queryItems, deleteItem } from './base-store.js';
import { createChildLogger } from '../logger.js';
import type { DataEvent } from '../events/types.js';

const log = createChildLogger({ module: 'event-store' });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Serialize a DataEvent into a DynamoDB item. */
function toItem(event: DataEvent): Record<string, unknown> {
  const key = keys.dataEvent(
    event.userId,
    event.module,
    event.timestamp,
    event.eventId,
  );
  const gsi = gsiKeys.eventsBySource(event.source.source);

  return {
    ...key,
    ...gsi,
    GSI1SK: `${event.timestamp}#${event.userId}`,
    eventId: event.eventId,
    userId: event.userId,
    module: event.module,
    source: event.source,
    changes: event.changes,
    timestamp: event.timestamp,
    ...(event.metadata !== undefined ? { metadata: event.metadata } : {}),
  };
}

/** Deserialize a DynamoDB item back into a DataEvent. */
function fromItem(item: Record<string, unknown>): DataEvent {
  const event: DataEvent = {
    eventId: item.eventId as string,
    userId: item.userId as string,
    module: item.module as string,
    source: item.source as DataEvent['source'],
    changes: item.changes as DataEvent['changes'],
    timestamp: item.timestamp as string,
  };

  if (item.metadata !== undefined) {
    event.metadata = item.metadata as Record<string, unknown>;
  }

  return event;
}

// ---------------------------------------------------------------------------
// Event store operations
// ---------------------------------------------------------------------------

/**
 * Append a data event.
 *
 * PK  = USER#<userId>
 * SK  = EVENT#<module>#<timestamp>#<eventId>
 * GSI1PK = EVENT#<source.source>
 * GSI1SK = <timestamp>#<userId>
 */
export async function appendEvent(event: DataEvent): Promise<void> {
  log.debug(
    { eventId: event.eventId, userId: event.userId, module: event.module },
    'Appending event',
  );
  await putItem(toItem(event));
}

/**
 * Get all events for a user, optionally paginated.
 */
export async function getEventsForUser(
  userId: string,
  options?: { limit?: number; cursor?: string },
): Promise<{ events: DataEvent[]; cursor?: string }> {
  const result = await queryItems({
    pk: `USER#${userId}`,
    skPrefix: 'EVENT#',
    limit: options?.limit,
    cursor: options?.cursor,
  });

  return {
    events: result.items.map(fromItem),
    cursor: result.cursor,
  };
}

/**
 * Get events for a specific module on a user, optionally paginated.
 */
export async function getEventsForModule(
  userId: string,
  module: string,
  options?: { limit?: number; cursor?: string },
): Promise<{ events: DataEvent[]; cursor?: string }> {
  const result = await queryItems({
    pk: `USER#${userId}`,
    skPrefix: `EVENT#${module}#`,
    limit: options?.limit,
    cursor: options?.cursor,
  });

  return {
    events: result.items.map(fromItem),
    cursor: result.cursor,
  };
}

/**
 * Get events that contain changes to a specific field within a module.
 * Returns all matching events (no pagination — field history should be manageable).
 */
export async function getEventsForField(
  userId: string,
  module: string,
  field: string,
): Promise<DataEvent[]> {
  // Query all events for the module
  const allEvents: DataEvent[] = [];
  let cursor: string | undefined;

  do {
    const result = await queryItems({
      pk: `USER#${userId}`,
      skPrefix: `EVENT#${module}#`,
      cursor,
    });
    allEvents.push(...result.items.map(fromItem));
    cursor = result.cursor;
  } while (cursor);

  // Filter for events containing changes to the specified field
  return allEvents.filter((event) =>
    event.changes.some((change) => change.field === field),
  );
}

/**
 * Get events by source (via GSI1), optionally paginated.
 *
 * GSI1PK = EVENT#<source>
 */
export async function getEventsBySource(
  source: string,
  options?: { limit?: number; cursor?: string },
): Promise<{ events: DataEvent[]; cursor?: string }> {
  const gsi = gsiKeys.eventsBySource(source);

  const result = await queryItems({
    pk: gsi.GSI1PK,
    indexName: 'GSI1',
    limit: options?.limit,
    cursor: options?.cursor,
  });

  return {
    events: result.items.map(fromItem),
    cursor: result.cursor,
  };
}

/**
 * Delete all events for a user.
 * Queries all EVENT# items, then batch deletes them.
 */
export async function deleteEventsForUser(userId: string): Promise<void> {
  log.debug({ userId }, 'Deleting all events for user');

  let cursor: string | undefined;

  do {
    const result = await queryItems({
      pk: `USER#${userId}`,
      skPrefix: 'EVENT#',
      cursor,
    });

    for (const item of result.items) {
      await deleteItem({
        PK: item.PK as string,
        SK: item.SK as string,
      });
    }

    cursor = result.cursor;
  } while (cursor);
}
