export interface DataEvent {
  eventId: string;
  userId: string;
  module: string;
  source: EventSource;
  changes: FieldChange[];
  timestamp: string; // ISO date
  metadata?: Record<string, unknown>;
}

export interface EventSource {
  source: string; // e.g. "user", "plaid", "experian"
  actor: string; // API key ID, system, user session
  tenantId?: string;
}

export interface FieldChange {
  field: string; // dot-notation path
  previousValue: unknown | null;
  newValue: unknown;
  confidence: number; // 0-1
  goodBy: string; // ISO date — when this value expires
}
