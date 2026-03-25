import type { DataEvent } from './types.js';

export interface ResolvedField {
  value: unknown;
  score: number;
  source: string;
  timestamp: string;
  confidence: number;
  goodBy: string;
}

/**
 * Resolve the current best value for each field from a set of events.
 *
 * Algorithm:
 * 1. Filter: discard field changes past their goodBy date
 * 2. Rank: score = confidence * recencyWeight
 *    recencyWeight decays linearly from 1.0 at event time to 0.5 at goodBy
 * 3. Select: highest score wins per field
 * 4. Tie-break: most recent event wins
 */
export function resolveFields(
  events: DataEvent[],
  now?: Date,
): Record<string, ResolvedField> {
  const currentTime = now ?? new Date();
  const fieldBest = new Map<string, ResolvedField & { eventTimestamp: Date }>();

  for (const event of events) {
    const eventTs = new Date(event.timestamp);

    for (const change of event.changes) {
      const goodByDate = new Date(change.goodBy);

      // 1. Filter expired
      if (goodByDate < currentTime) continue;

      // 2. Calculate recency weight
      const totalLifespan = goodByDate.getTime() - eventTs.getTime();
      const elapsed = currentTime.getTime() - eventTs.getTime();
      const recencyWeight =
        totalLifespan > 0 ? 1.0 - 0.5 * (elapsed / totalLifespan) : 1.0;

      // 3. Score
      const score = change.confidence * Math.max(recencyWeight, 0);

      // 4. Compare with current best
      const existing = fieldBest.get(change.field);
      if (
        !existing ||
        score > existing.score ||
        (score === existing.score && eventTs > existing.eventTimestamp)
      ) {
        fieldBest.set(change.field, {
          value: change.newValue,
          score,
          source: event.source.source,
          timestamp: event.timestamp,
          confidence: change.confidence,
          goodBy: change.goodBy,
          eventTimestamp: eventTs,
        });
      }
    }
  }

  // Strip internal eventTimestamp before returning
  const result: Record<string, ResolvedField> = {};
  for (const [field, data] of fieldBest) {
    const { eventTimestamp, ...resolved } = data;
    result[field] = resolved;
  }
  return result;
}

/**
 * Extract just the field values from resolved fields.
 */
export function resolveValues(
  events: DataEvent[],
  now?: Date,
): Record<string, unknown> {
  const resolved = resolveFields(events, now);
  const values: Record<string, unknown> = {};
  for (const [field, data] of Object.entries(resolved)) {
    values[field] = data.value;
  }
  return values;
}
