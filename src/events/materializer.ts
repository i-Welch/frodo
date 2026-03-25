import { getEventsForModule } from '../store/event-store.js';
import { putModule } from '../store/user-store.js';
import { resolveValues } from './resolver.js';
import { createChildLogger } from '../logger.js';
import type { DataEvent } from './types.js';

const log = createChildLogger({ module: 'materializer' });

/**
 * Rebuild a module document by resolving all events.
 * Optionally writes the result back to the module store.
 */
export async function materializeModule(
  userId: string,
  module: string,
  options?: { persist?: boolean },
): Promise<Record<string, unknown>> {
  // 1. Get all events for this user+module (paginate through all pages)
  const allEvents: DataEvent[] = [];
  let cursor: string | undefined;

  do {
    const result = await getEventsForModule(userId, module, { cursor });
    allEvents.push(...result.events);
    cursor = result.cursor;
  } while (cursor);

  log.debug(
    { userId, module, eventCount: allEvents.length },
    'Materializing module from events',
  );

  // 2. Run resolveValues
  const resolved = resolveValues(allEvents);

  // 3. If persist, write to module store
  if (options?.persist) {
    log.debug({ userId, module }, 'Persisting materialized module');
    await putModule(userId, module, resolved);
  }

  // 4. Return the resolved document
  return resolved;
}
