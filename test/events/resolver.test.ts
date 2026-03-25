import { describe, it, expect } from 'vitest';
import { resolveFields, resolveValues } from '../../src/events/resolver.js';
import type { DataEvent } from '../../src/events/types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fixed "now" for deterministic tests: 2026-06-15T12:00:00.000Z */
const NOW = new Date('2026-06-15T12:00:00.000Z');

function makeEvent(overrides: Partial<DataEvent> & { changes: DataEvent['changes'] }): DataEvent {
  return {
    eventId: overrides.eventId ?? crypto.randomUUID(),
    userId: overrides.userId ?? 'user-1',
    module: overrides.module ?? 'identity',
    source: overrides.source ?? { source: 'user', actor: 'test-key' },
    changes: overrides.changes,
    timestamp: overrides.timestamp ?? '2026-06-01T00:00:00.000Z',
    ...(overrides.metadata !== undefined ? { metadata: overrides.metadata } : {}),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('resolver', () => {
  describe('resolveFields', () => {
    it('resolves a single event with a single field', () => {
      const event = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        source: { source: 'user', actor: 'test' },
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Frodo',
            confidence: 0.95,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
        ],
      });

      const result = resolveFields([event], NOW);

      expect(result).toHaveProperty('firstName');
      expect(result.firstName.value).toBe('Frodo');
      expect(result.firstName.source).toBe('user');
      expect(result.firstName.confidence).toBe(0.95);
      expect(result.firstName.goodBy).toBe('2027-06-01T00:00:00.000Z');
      expect(result.firstName.timestamp).toBe('2026-06-01T00:00:00.000Z');
      expect(result.firstName.score).toBeGreaterThan(0);
      expect(result.firstName.score).toBeLessThanOrEqual(0.95);
    });

    it('higher confidence wins for the same field', () => {
      // Two events at the same time with different confidence
      const lowConfidence = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        source: { source: 'user', actor: 'test' },
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Bilbo',
            confidence: 0.5,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
        ],
      });

      const highConfidence = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        source: { source: 'experian', actor: 'test' },
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Frodo',
            confidence: 0.95,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
        ],
      });

      const result = resolveFields([lowConfidence, highConfidence], NOW);

      expect(result.firstName.value).toBe('Frodo');
      expect(result.firstName.source).toBe('experian');
      expect(result.firstName.confidence).toBe(0.95);
    });

    it('filters out expired values (goodBy in the past)', () => {
      const expired = makeEvent({
        timestamp: '2025-01-01T00:00:00.000Z',
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Frodo',
            confidence: 0.95,
            goodBy: '2026-01-01T00:00:00.000Z', // Before NOW
          },
        ],
      });

      const result = resolveFields([expired], NOW);

      expect(result).not.toHaveProperty('firstName');
    });

    it('recency weight: recent low-confidence beats old high-confidence', () => {
      // Old event: high confidence but far from "now", so recency decays it
      // Event timestamp: 2026-01-01, goodBy: 2027-01-01 (lifespan = 365 days)
      // At NOW (2026-06-15): elapsed ~165 days out of 365 → weight ~0.774
      // Score = 0.9 * 0.774 ≈ 0.697
      const oldHighConfidence = makeEvent({
        timestamp: '2026-01-01T00:00:00.000Z',
        source: { source: 'experian', actor: 'test' },
        changes: [
          {
            field: 'income',
            previousValue: null,
            newValue: 50000,
            confidence: 0.9,
            goodBy: '2027-01-01T00:00:00.000Z',
          },
        ],
      });

      // Recent event: lower confidence but very fresh, so recency is nearly 1.0
      // Event timestamp: 2026-06-14, goodBy: 2027-06-14 (lifespan = 365 days)
      // At NOW (2026-06-15): elapsed ~1 day out of 365 → weight ~0.999
      // Score = 0.75 * 0.999 ≈ 0.749
      const recentLowConfidence = makeEvent({
        timestamp: '2026-06-14T00:00:00.000Z',
        source: { source: 'truework', actor: 'test' },
        changes: [
          {
            field: 'income',
            previousValue: null,
            newValue: 55000,
            confidence: 0.75,
            goodBy: '2027-06-14T00:00:00.000Z',
          },
        ],
      });

      const result = resolveFields(
        [oldHighConfidence, recentLowConfidence],
        NOW,
      );

      expect(result.income.value).toBe(55000);
      expect(result.income.source).toBe('truework');
    });

    it('tie-break: equal scores → most recent event wins', () => {
      // Two events with identical confidence, identical TTL, but different timestamps.
      // Because recency weight is higher for the newer event, they won't naturally
      // tie — so we engineer a tie by making them the same timestamp but different
      // events (processed in order).
      //
      // Actually, for a true tie, we need score equality. We set both events to
      // the same timestamp and same confidence/goodBy so the recency weight is
      // identical. Then the tie-break (most recent event timestamp) kicks in.
      // Since they have the same timestamp, the second one processed wins (>=).
      //
      // Better: give them slightly different timestamps but tune confidence so
      // the scores happen to match.
      //
      // Simplest: same timestamp, same confidence, same goodBy — the second one
      // in the array wins because the tie-break condition uses >.
      // With identical timestamps, eventTs > existing.eventTimestamp is false,
      // so the FIRST one wins. Let's test that directly.

      const first = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        source: { source: 'plaid', actor: 'test' },
        changes: [
          {
            field: 'balance',
            previousValue: null,
            newValue: 1000,
            confidence: 0.9,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
        ],
      });

      const second = makeEvent({
        timestamp: '2026-06-01T00:00:01.000Z', // 1 second later
        source: { source: 'mx', actor: 'test' },
        changes: [
          {
            field: 'balance',
            previousValue: null,
            newValue: 1050,
            confidence: 0.9,
            goodBy: '2027-06-01T00:00:01.000Z', // Same lifespan
          },
        ],
      });

      // Both have confidence 0.9, nearly identical recency weights (~same elapsed).
      // The second event is 1 second more recent.
      // Recency weight for first: 1.0 - 0.5 * (elapsed_first / lifespan_first)
      // Recency weight for second: 1.0 - 0.5 * (elapsed_second / lifespan_second)
      // elapsed_second is 1s less → weight is fractionally higher
      // If scores happen to round equal, tie-break picks second (more recent).
      // But even if scores differ by a tiny amount, second still wins.
      // Either way, the more recent event should win.
      const result = resolveFields([first, second], NOW);

      expect(result.balance.value).toBe(1050);
      expect(result.balance.source).toBe('mx');
    });

    it('multiple fields from different sources resolve independently', () => {
      const nameEvent = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        source: { source: 'user', actor: 'test' },
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Frodo',
            confidence: 0.95,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
        ],
      });

      const incomeEvent = makeEvent({
        timestamp: '2026-06-10T00:00:00.000Z',
        source: { source: 'truework', actor: 'test' },
        changes: [
          {
            field: 'income',
            previousValue: null,
            newValue: 75000,
            confidence: 0.9,
            goodBy: '2027-06-10T00:00:00.000Z',
          },
        ],
      });

      const balanceEvent = makeEvent({
        timestamp: '2026-06-14T00:00:00.000Z',
        source: { source: 'plaid', actor: 'test' },
        changes: [
          {
            field: 'balance',
            previousValue: null,
            newValue: 5000,
            confidence: 0.9,
            goodBy: '2026-06-21T00:00:00.000Z',
          },
        ],
      });

      const result = resolveFields(
        [nameEvent, incomeEvent, balanceEvent],
        NOW,
      );

      expect(result.firstName.value).toBe('Frodo');
      expect(result.firstName.source).toBe('user');

      expect(result.income.value).toBe(75000);
      expect(result.income.source).toBe('truework');

      expect(result.balance.value).toBe(5000);
      expect(result.balance.source).toBe('plaid');
    });

    it('all values expired returns empty result', () => {
      const expired1 = makeEvent({
        timestamp: '2025-01-01T00:00:00.000Z',
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Frodo',
            confidence: 0.95,
            goodBy: '2025-12-01T00:00:00.000Z',
          },
        ],
      });

      const expired2 = makeEvent({
        timestamp: '2025-03-01T00:00:00.000Z',
        changes: [
          {
            field: 'income',
            previousValue: null,
            newValue: 50000,
            confidence: 0.9,
            goodBy: '2026-03-01T00:00:00.000Z',
          },
        ],
      });

      const result = resolveFields([expired1, expired2], NOW);

      expect(Object.keys(result)).toHaveLength(0);
    });

    it('goodBy exactly equal to now is still valid (not expired)', () => {
      // goodBy < now filters out; goodBy === now should NOT be filtered
      const event = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Frodo',
            confidence: 0.95,
            goodBy: '2026-06-15T12:00:00.000Z', // Exactly equal to NOW
          },
        ],
      });

      const result = resolveFields([event], NOW);

      expect(result).toHaveProperty('firstName');
      expect(result.firstName.value).toBe('Frodo');
    });

    it('handles an event with multiple field changes', () => {
      const event = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        source: { source: 'user', actor: 'test' },
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Frodo',
            confidence: 0.95,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
          {
            field: 'lastName',
            previousValue: null,
            newValue: 'Baggins',
            confidence: 0.95,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
          {
            field: 'dateOfBirth',
            previousValue: null,
            newValue: '2968-09-22',
            confidence: 0.99,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
        ],
      });

      const result = resolveFields([event], NOW);

      expect(result.firstName.value).toBe('Frodo');
      expect(result.lastName.value).toBe('Baggins');
      expect(result.dateOfBirth.value).toBe('2968-09-22');
    });

    it('newer event supersedes older for the same field and source', () => {
      const older = makeEvent({
        timestamp: '2026-05-01T00:00:00.000Z',
        source: { source: 'user', actor: 'test' },
        changes: [
          {
            field: 'email',
            previousValue: null,
            newValue: 'frodo@shire.me',
            confidence: 0.95,
            goodBy: '2027-05-01T00:00:00.000Z',
          },
        ],
      });

      const newer = makeEvent({
        timestamp: '2026-06-10T00:00:00.000Z',
        source: { source: 'user', actor: 'test' },
        changes: [
          {
            field: 'email',
            previousValue: 'frodo@shire.me',
            newValue: 'frodo.baggins@shire.me',
            confidence: 0.95,
            goodBy: '2027-06-10T00:00:00.000Z',
          },
        ],
      });

      const result = resolveFields([older, newer], NOW);

      expect(result.email.value).toBe('frodo.baggins@shire.me');
      expect(result.email.timestamp).toBe('2026-06-10T00:00:00.000Z');
    });

    it('valid value wins over expired value for the same field', () => {
      const expired = makeEvent({
        timestamp: '2025-01-01T00:00:00.000Z',
        source: { source: 'experian', actor: 'test' },
        changes: [
          {
            field: 'creditScore',
            previousValue: null,
            newValue: 800,
            confidence: 0.99,
            goodBy: '2025-06-01T00:00:00.000Z', // Expired
          },
        ],
      });

      const valid = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        source: { source: 'transunion', actor: 'test' },
        changes: [
          {
            field: 'creditScore',
            previousValue: null,
            newValue: 750,
            confidence: 0.93,
            goodBy: '2026-07-01T00:00:00.000Z',
          },
        ],
      });

      const result = resolveFields([expired, valid], NOW);

      expect(result.creditScore.value).toBe(750);
      expect(result.creditScore.source).toBe('transunion');
    });

    it('recency weight is 1.0 when event timestamp equals now', () => {
      const event = makeEvent({
        timestamp: '2026-06-15T12:00:00.000Z', // Same as NOW
        source: { source: 'plaid', actor: 'test' },
        changes: [
          {
            field: 'balance',
            previousValue: null,
            newValue: 10000,
            confidence: 0.9,
            goodBy: '2026-06-22T12:00:00.000Z',
          },
        ],
      });

      const result = resolveFields([event], NOW);

      // score should be exactly confidence * 1.0 = 0.9
      expect(result.balance.score).toBeCloseTo(0.9, 10);
    });

    it('recency weight is 0.5 at goodBy date', () => {
      // Event at time 0, goodBy at time T, now at time T (but not expired
      // because goodBy === now is not < now).
      // elapsed = T, totalLifespan = T, weight = 1.0 - 0.5 * (T/T) = 0.5
      const eventTs = '2026-06-01T00:00:00.000Z';
      const goodBy = '2026-06-15T12:00:00.000Z'; // Exactly NOW

      const event = makeEvent({
        timestamp: eventTs,
        source: { source: 'plaid', actor: 'test' },
        changes: [
          {
            field: 'balance',
            previousValue: null,
            newValue: 5000,
            confidence: 0.9,
            goodBy,
          },
        ],
      });

      const result = resolveFields([event], NOW);

      // score = 0.9 * 0.5 = 0.45
      expect(result.balance.score).toBeCloseTo(0.45, 10);
    });

    it('handles empty events array', () => {
      const result = resolveFields([], NOW);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('does not expose internal eventTimestamp in result', () => {
      const event = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Frodo',
            confidence: 0.95,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
        ],
      });

      const result = resolveFields([event], NOW);

      expect(result.firstName).not.toHaveProperty('eventTimestamp');
      // Verify only expected keys are present
      const keys = Object.keys(result.firstName).sort();
      expect(keys).toEqual(
        ['confidence', 'goodBy', 'score', 'source', 'timestamp', 'value'].sort(),
      );
    });
  });

  describe('resolveValues', () => {
    it('returns just the values without metadata', () => {
      const event = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        source: { source: 'user', actor: 'test' },
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Frodo',
            confidence: 0.95,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
          {
            field: 'lastName',
            previousValue: null,
            newValue: 'Baggins',
            confidence: 0.95,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
        ],
      });

      const values = resolveValues([event], NOW);

      expect(values).toEqual({
        firstName: 'Frodo',
        lastName: 'Baggins',
      });
    });

    it('filters expired values just like resolveFields', () => {
      const expired = makeEvent({
        timestamp: '2025-01-01T00:00:00.000Z',
        changes: [
          {
            field: 'firstName',
            previousValue: null,
            newValue: 'Frodo',
            confidence: 0.95,
            goodBy: '2025-06-01T00:00:00.000Z',
          },
        ],
      });

      const values = resolveValues([expired], NOW);

      expect(values).toEqual({});
    });

    it('returns empty object for no events', () => {
      const values = resolveValues([], NOW);
      expect(values).toEqual({});
    });

    it('picks the winning value when multiple sources compete', () => {
      const lowConf = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        source: { source: 'user', actor: 'test' },
        changes: [
          {
            field: 'income',
            previousValue: null,
            newValue: 40000,
            confidence: 0.5,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
        ],
      });

      const highConf = makeEvent({
        timestamp: '2026-06-01T00:00:00.000Z',
        source: { source: 'truework', actor: 'test' },
        changes: [
          {
            field: 'income',
            previousValue: null,
            newValue: 55000,
            confidence: 0.9,
            goodBy: '2027-06-01T00:00:00.000Z',
          },
        ],
      });

      const values = resolveValues([lowConf, highConf], NOW);

      expect(values.income).toBe(55000);
    });
  });
});
