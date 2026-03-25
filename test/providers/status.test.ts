import { describe, it, expect, beforeEach } from 'vitest';
import { ProviderTracker } from '../../src/providers/status.js';

describe('ProviderTracker', () => {
  let tracker: ProviderTracker;

  beforeEach(() => {
    tracker = new ProviderTracker();
  });

  it('returns unknown status for untracked provider', () => {
    const status = tracker.getStatus('plaid');
    expect(status.status).toBe('unknown');
    expect(status.recentCalls).toBe(0);
    expect(status.recentErrors).toBe(0);
    expect(status.errorRate).toBe(0);
    expect(status.avgLatencyMs).toBe(0);
  });

  it('records successes and reports healthy status', () => {
    tracker.recordSuccess('plaid', 150);
    tracker.recordSuccess('plaid', 200);
    tracker.recordSuccess('plaid', 180);

    const status = tracker.getStatus('plaid');
    expect(status.status).toBe('healthy');
    expect(status.recentCalls).toBe(3);
    expect(status.recentErrors).toBe(0);
    expect(status.errorRate).toBe(0);
    expect(status.avgLatencyMs).toBeGreaterThan(0);
    expect(status.lastCallAt).toBeDefined();
    expect(status.lastSuccessAt).toBeDefined();
    expect(status.lastErrorAt).toBeUndefined();
  });

  it('records failures and reports degraded status', () => {
    // 3 successes, 2 failures = 40% error rate → degraded
    tracker.recordSuccess('experian', 100);
    tracker.recordSuccess('experian', 120);
    tracker.recordSuccess('experian', 110);
    tracker.recordFailure('experian', 50, 'timeout');
    tracker.recordFailure('experian', 60, 'connection reset');

    const status = tracker.getStatus('experian');
    expect(status.status).toBe('degraded');
    expect(status.recentCalls).toBe(5);
    expect(status.recentErrors).toBe(2);
    expect(status.errorRate).toBe(0.4);
    expect(status.lastError).toBe('connection reset');
    expect(status.lastErrorAt).toBeDefined();
  });

  it('reports down status at high error rate', () => {
    tracker.recordSuccess('socure', 100);
    tracker.recordFailure('socure', 50, 'err1');
    tracker.recordFailure('socure', 50, 'err2');
    tracker.recordFailure('socure', 50, 'err3');
    tracker.recordFailure('socure', 50, 'err4');

    const status = tracker.getStatus('socure');
    expect(status.status).toBe('down');
    expect(status.errorRate).toBe(0.8);
  });

  it('getAllStatuses returns all tracked providers', () => {
    tracker.recordSuccess('plaid', 100);
    tracker.recordSuccess('experian', 200);
    tracker.recordFailure('socure', 50, 'error');

    const statuses = tracker.getAllStatuses();
    expect(statuses).toHaveLength(3);
    const providers = statuses.map((s) => s.provider).sort();
    expect(providers).toEqual(['experian', 'plaid', 'socure']);
  });

  it('computes average latency correctly', () => {
    tracker.recordSuccess('plaid', 100);
    tracker.recordSuccess('plaid', 200);
    tracker.recordSuccess('plaid', 300);

    const status = tracker.getStatus('plaid');
    expect(status.avgLatencyMs).toBe(200);
  });

  it('clear() removes all tracked data', () => {
    tracker.recordSuccess('plaid', 100);
    tracker.clear();

    const status = tracker.getStatus('plaid');
    expect(status.status).toBe('unknown');
    expect(status.recentCalls).toBe(0);
  });
});
