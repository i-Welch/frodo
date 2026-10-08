/**
 * In-memory provider health tracker with a sliding window.
 * Updated by the enrichment engine on every provider call.
 */

export interface ProviderStatus {
  provider: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  lastCallAt?: string;
  lastSuccessAt?: string;
  lastErrorAt?: string;
  lastError?: string;
  recentCalls: number;
  recentErrors: number;
  errorRate: number;
  avgLatencyMs: number;
}

interface CallRecord {
  timestamp: number;
  durationMs: number;
  success: boolean;
  error?: string;
}

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export class ProviderTracker {
  private records = new Map<string, CallRecord[]>();
  private lastErrors = new Map<string, string>();

  recordSuccess(provider: string, durationMs: number): void {
    this.addRecord(provider, { timestamp: Date.now(), durationMs, success: true });
  }

  recordFailure(provider: string, durationMs: number, error: string): void {
    this.addRecord(provider, { timestamp: Date.now(), durationMs, success: false, error });
    this.lastErrors.set(provider, error);
  }

  getStatus(provider: string): ProviderStatus {
    const records = this.getRecentRecords(provider);

    if (records.length === 0) {
      return {
        provider,
        status: 'unknown',
        recentCalls: 0,
        recentErrors: 0,
        errorRate: 0,
        avgLatencyMs: 0,
      };
    }

    const successes = records.filter((r) => r.success);
    const failures = records.filter((r) => !r.success);
    const errorRate = records.length > 0 ? failures.length / records.length : 0;
    const avgLatencyMs =
      records.length > 0
        ? records.reduce((sum, r) => sum + r.durationMs, 0) / records.length
        : 0;

    // Find last timestamps
    const allSorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
    const lastCall = allSorted[0];
    const lastSuccess = successes.sort((a, b) => b.timestamp - a.timestamp)[0];
    const lastFailure = failures.sort((a, b) => b.timestamp - a.timestamp)[0];

    let status: ProviderStatus['status'];
    if (errorRate >= 0.8) {
      status = 'down';
    } else if (errorRate >= 0.3) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      provider,
      status,
      lastCallAt: lastCall ? new Date(lastCall.timestamp).toISOString() : undefined,
      lastSuccessAt: lastSuccess ? new Date(lastSuccess.timestamp).toISOString() : undefined,
      lastErrorAt: lastFailure ? new Date(lastFailure.timestamp).toISOString() : undefined,
      lastError: this.lastErrors.get(provider),
      recentCalls: records.length,
      recentErrors: failures.length,
      errorRate: Math.round(errorRate * 1000) / 1000,
      avgLatencyMs: Math.round(avgLatencyMs),
    };
  }

  getAllStatuses(): ProviderStatus[] {
    const providers = new Set(this.records.keys());
    return Array.from(providers).map((p) => this.getStatus(p));
  }

  /** Visible for testing — clear all tracked data. */
  clear(): void {
    this.records.clear();
    this.lastErrors.clear();
  }

  private addRecord(provider: string, record: CallRecord): void {
    const list = this.records.get(provider) ?? [];
    list.push(record);
    this.records.set(provider, list);
  }

  private getRecentRecords(provider: string): CallRecord[] {
    const list = this.records.get(provider);
    if (!list) return [];
    const cutoff = Date.now() - WINDOW_MS;
    // Prune old records while we're at it
    const recent = list.filter((r) => r.timestamp >= cutoff);
    this.records.set(provider, recent);
    return recent;
  }
}

/** Singleton tracker instance used across the application. */
export const providerTracker = new ProviderTracker();
