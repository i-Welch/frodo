import type { DataEvent } from '../events/types.js';
import { createChildLogger } from '../logger.js';

const log = createChildLogger({ module: 'reconciliation' });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FieldAgreement {
  field: string;
  module: string;
  /** Sources that agree on this value */
  agreeing: { source: string; value: unknown; confidence: number }[];
  /** Sources that disagree */
  disagreeing: { source: string; value: unknown; confidence: number }[];
  /** Original confidence from the winning source */
  originalConfidence: number;
  /** Boosted confidence after reconciliation */
  reconciledConfidence: number;
  /** Status: 'confirmed' (all agree), 'majority' (most agree), 'disputed' (conflict) */
  status: 'confirmed' | 'majority' | 'disputed';
}

export interface CrossModuleComparison {
  /** What's being compared */
  label: string;
  fieldA: { module: string; field: string; value: unknown; source: string };
  fieldB: { module: string; field: string; value: unknown; source: string };
  /** Whether the values match */
  match: boolean;
  /** If numeric, the percentage difference */
  percentDifference?: number;
  /** Human-readable note */
  note: string;
}

export interface ReconciliationReport {
  /** Per-field agreement analysis for overlapping data */
  fieldAgreements: FieldAgreement[];
  /** Cross-module comparisons (e.g., income from bank vs employer) */
  crossModuleComparisons: CrossModuleComparison[];
  /** Summary stats */
  summary: {
    totalFieldsReconciled: number;
    confirmed: number;
    majority: number;
    disputed: number;
    crossModuleMatches: number;
    crossModuleConflicts: number;
  };
}

// ---------------------------------------------------------------------------
// Field overlap definitions
// ---------------------------------------------------------------------------

interface FieldOverlap {
  /** Human label */
  label: string;
  /** Module where the canonical field lives */
  module: string;
  /** Field name */
  field: string;
  /** Which sources can write this field */
  sources: string[];
}

const FIELD_OVERLAPS: FieldOverlap[] = [
  { label: 'First Name', module: 'identity', field: 'firstName', sources: ['user', 'plaid', 'socure', 'melissa'] },
  { label: 'Last Name', module: 'identity', field: 'lastName', sources: ['user', 'plaid', 'socure', 'melissa'] },
  { label: 'Date of Birth', module: 'identity', field: 'dateOfBirth', sources: ['plaid', 'socure', 'melissa'] },
  { label: 'Email', module: 'contact', field: 'email', sources: ['user', 'plaid', 'melissa'] },
  { label: 'Phone', module: 'contact', field: 'phone', sources: ['user', 'plaid', 'melissa'] },
  { label: 'Current Address', module: 'residence', field: 'currentAddress', sources: ['plaid', 'socure', 'melissa'] },
  { label: 'Ownership Status', module: 'residence', field: 'ownershipStatus', sources: ['melissa'] },
];

// Cross-module comparisons — conceptually the same data in different modules
interface CrossModuleOverlap {
  label: string;
  fieldA: { module: string; field: string; subField?: string };
  fieldB: { module: string; field: string; subField?: string };
  compareType: 'exact' | 'numeric' | 'name' | 'address';
}

const CROSS_MODULE_OVERLAPS: CrossModuleOverlap[] = [
  {
    label: 'Income: Bank analysis vs Employer-reported salary',
    fieldA: { module: 'financial', field: 'incomeStreams' },
    fieldB: { module: 'employment', field: 'salary' },
    compareType: 'numeric',
  },
  {
    label: 'Employer: Bank income source vs Truework employer',
    fieldA: { module: 'financial', field: 'incomeStreams' },
    fieldB: { module: 'employment', field: 'employer' },
    compareType: 'name',
  },
  {
    label: 'Job Title: FullContact vs Truework',
    fieldA: { module: 'contact', field: 'jobTitle' },
    fieldB: { module: 'employment', field: 'title' },
    compareType: 'name',
  },
  {
    label: 'Organization: FullContact vs Truework',
    fieldA: { module: 'contact', field: 'organization' },
    fieldB: { module: 'employment', field: 'employer' },
    compareType: 'name',
  },
];

// ---------------------------------------------------------------------------
// Reconciliation engine
// ---------------------------------------------------------------------------

/**
 * Reconcile overlapping data across providers and modules.
 * Compares all sources that wrote the same field, boosts confidence
 * when they agree, and flags discrepancies.
 */
export function reconcile(
  events: DataEvent[],
  modules: Record<string, Record<string, unknown>>,
): ReconciliationReport {
  const fieldAgreements: FieldAgreement[] = [];
  const crossModuleComparisons: CrossModuleComparison[] = [];

  // 1. Per-field reconciliation — compare values from different sources
  for (const overlap of FIELD_OVERLAPS) {
    const moduleEvents = events.filter((e) => e.module === overlap.module);
    const sourceValues = new Map<string, { value: unknown; confidence: number; timestamp: string }>();

    for (const event of moduleEvents) {
      for (const change of event.changes) {
        if (change.field !== overlap.field) continue;
        if (change.newValue === null || change.newValue === undefined) continue;

        const existing = sourceValues.get(event.source.source);
        // Keep the most recent value per source
        if (!existing || new Date(event.timestamp) > new Date(existing.timestamp)) {
          sourceValues.set(event.source.source, {
            value: change.newValue,
            confidence: change.confidence,
            timestamp: event.timestamp,
          });
        }
      }
    }

    // Need at least 2 sources to compare
    if (sourceValues.size < 2) continue;

    // Find the most common value (winner)
    const entries = [...sourceValues.entries()];
    const winnerValue = findWinningValue(entries.map(([, v]) => v.value));

    const agreeing: FieldAgreement['agreeing'] = [];
    const disagreeing: FieldAgreement['disagreeing'] = [];

    for (const [source, { value, confidence }] of entries) {
      if (valuesMatch(winnerValue, value, overlap.field)) {
        agreeing.push({ source, value, confidence });
      } else {
        disagreeing.push({ source, value, confidence });
      }
    }

    const originalConfidence = Math.max(...agreeing.map((a) => a.confidence));
    const status: FieldAgreement['status'] =
      disagreeing.length === 0 ? 'confirmed' :
      agreeing.length > disagreeing.length ? 'majority' :
      'disputed';

    // Boost confidence based on agreement
    const reconciledConfidence = boostConfidence(originalConfidence, agreeing.length, disagreeing.length);

    fieldAgreements.push({
      field: overlap.field,
      module: overlap.module,
      agreeing,
      disagreeing,
      originalConfidence,
      reconciledConfidence,
      status,
    });

    if (disagreeing.length > 0) {
      log.info(
        { field: overlap.field, module: overlap.module, agreeing: agreeing.length, disagreeing: disagreeing.length },
        'Field discrepancy detected',
      );
    }
  }

  // 2. Cross-module comparisons
  for (const overlap of CROSS_MODULE_OVERLAPS) {
    const valueA = getNestedValue(modules, overlap.fieldA.module, overlap.fieldA.field);
    const valueB = getNestedValue(modules, overlap.fieldB.module, overlap.fieldB.field);

    if (valueA === undefined || valueA === null || valueB === undefined || valueB === null) continue;

    const sourceA = findSourceForField(events, overlap.fieldA.module, overlap.fieldA.field);
    const sourceB = findSourceForField(events, overlap.fieldB.module, overlap.fieldB.field);

    const comparison = compareCrossModule(overlap, valueA, valueB, sourceA, sourceB);
    if (comparison) {
      crossModuleComparisons.push(comparison);
    }
  }

  // 3. Summary
  const summary = {
    totalFieldsReconciled: fieldAgreements.length,
    confirmed: fieldAgreements.filter((a) => a.status === 'confirmed').length,
    majority: fieldAgreements.filter((a) => a.status === 'majority').length,
    disputed: fieldAgreements.filter((a) => a.status === 'disputed').length,
    crossModuleMatches: crossModuleComparisons.filter((c) => c.match).length,
    crossModuleConflicts: crossModuleComparisons.filter((c) => !c.match).length,
  };

  return { fieldAgreements, crossModuleComparisons, summary };
}

// ---------------------------------------------------------------------------
// Comparison helpers
// ---------------------------------------------------------------------------

function valuesMatch(a: unknown, b: unknown, field: string): boolean {
  if (a === b) return true;
  if (typeof a === 'string' && typeof b === 'string') {
    // Case-insensitive string comparison
    if (a.toLowerCase().trim() === b.toLowerCase().trim()) return true;
  }
  // Address comparison — compare components
  if (field === 'currentAddress' && typeof a === 'object' && typeof b === 'object' && a && b) {
    return addressesMatch(a as Record<string, string>, b as Record<string, string>);
  }
  // Deep equality for objects
  if (typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

function addressesMatch(a: Record<string, string>, b: Record<string, string>): boolean {
  const normalize = (s: string | undefined) => (s ?? '').toLowerCase().trim().replace(/[.,#]/g, '');
  // Compare street + zip (most reliable components)
  const streetMatch = normalize(a.street) === normalize(b.street);
  const zipMatch = normalize(a.zip) === normalize(b.zip);
  return streetMatch && zipMatch;
}

function findWinningValue(values: unknown[]): unknown {
  // Return the most common value; tie-break by first occurrence
  const counts = new Map<string, { value: unknown; count: number }>();
  for (const v of values) {
    const key = JSON.stringify(v);
    const existing = counts.get(key);
    if (existing) {
      existing.count++;
    } else {
      counts.set(key, { value: v, count: 1 });
    }
  }
  let best: { value: unknown; count: number } | undefined;
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count) {
      best = entry;
    }
  }
  return best?.value;
}

function boostConfidence(original: number, agreeCount: number, disagreeCount: number): number {
  if (disagreeCount === 0) {
    // All sources agree — boost based on number of confirming sources
    // 2 sources: +10%, 3 sources: +15%, 4+: +20%
    const boost = Math.min(0.20, 0.05 + agreeCount * 0.05);
    return Math.min(1.0, original + boost);
  }
  if (agreeCount > disagreeCount) {
    // Majority agree — small boost
    return Math.min(1.0, original + 0.05);
  }
  // Disputed — reduce confidence
  return Math.max(0.1, original - 0.15);
}

function getNestedValue(modules: Record<string, Record<string, unknown>>, moduleName: string, field: string): unknown {
  return modules[moduleName]?.[field];
}

function findSourceForField(events: DataEvent[], moduleName: string, field: string): string {
  // Find the most recent source that wrote this field
  let latest: { source: string; timestamp: Date } | undefined;
  for (const event of events) {
    if (event.module !== moduleName) continue;
    for (const change of event.changes) {
      if (change.field !== field) continue;
      const ts = new Date(event.timestamp);
      if (!latest || ts > latest.timestamp) {
        latest = { source: event.source.source, timestamp: ts };
      }
    }
  }
  return latest?.source ?? 'unknown';
}

function compareCrossModule(
  overlap: CrossModuleOverlap,
  valueA: unknown,
  valueB: unknown,
  sourceA: string,
  sourceB: string,
): CrossModuleComparison | null {
  const result: CrossModuleComparison = {
    label: overlap.label,
    fieldA: { module: overlap.fieldA.module, field: overlap.fieldA.field, value: valueA, source: sourceA },
    fieldB: { module: overlap.fieldB.module, field: overlap.fieldB.field, value: valueB, source: sourceB },
    match: false,
    note: '',
  };

  if (overlap.compareType === 'numeric') {
    // Compare income: sum of incomeStreams amounts vs salary
    let numA: number;
    if (Array.isArray(valueA)) {
      // Sum income streams (annualized amounts)
      numA = (valueA as { amount?: number }[]).reduce((sum, s) => sum + (s.amount ?? 0), 0);
    } else {
      numA = typeof valueA === 'number' ? valueA : parseFloat(String(valueA));
    }
    const numB = typeof valueB === 'number' ? valueB : parseFloat(String(valueB));

    if (isNaN(numA) || isNaN(numB) || numA === 0 || numB === 0) return null;

    const diff = Math.abs(numA - numB);
    const avg = (numA + numB) / 2;
    result.percentDifference = Math.round((diff / avg) * 100);
    result.match = result.percentDifference <= 15; // Within 15% is a match
    result.note = result.match
      ? `Bank income ($${numA.toLocaleString()}) and employer salary ($${numB.toLocaleString()}) are within ${result.percentDifference}% — consistent.`
      : `Bank income ($${numA.toLocaleString()}) differs from employer salary ($${numB.toLocaleString()}) by ${result.percentDifference}% — review recommended.`;
    result.fieldA.value = numA;
    result.fieldB.value = numB;
  } else if (overlap.compareType === 'name') {
    let strA: string;
    if (Array.isArray(valueA)) {
      // Extract employer/source name from first income stream
      strA = (valueA as { source?: string }[])[0]?.source ?? '';
    } else {
      strA = String(valueA ?? '');
    }
    const strB = String(valueB ?? '');

    if (!strA || !strB) return null;

    result.match = fuzzyNameMatch(strA, strB);
    result.note = result.match
      ? `"${strA}" and "${strB}" match.`
      : `"${strA}" does not match "${strB}" — possible discrepancy.`;
    result.fieldA.value = strA;
    result.fieldB.value = strB;
  } else if (overlap.compareType === 'address') {
    const match = addressesMatch(valueA as Record<string, string>, valueB as Record<string, string>);
    result.match = match;
    result.note = match ? 'Addresses match.' : 'Addresses differ — review recommended.';
  } else {
    result.match = JSON.stringify(valueA) === JSON.stringify(valueB);
    result.note = result.match ? 'Values match.' : 'Values differ.';
  }

  return result;
}

function fuzzyNameMatch(a: string, b: string): boolean {
  const normalizeStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const na = normalizeStr(a);
  const nb = normalizeStr(b);
  if (na === nb) return true;
  // Check if one contains the other (e.g., "Acme Corp" vs "Acme Corporation")
  if (na.includes(nb) || nb.includes(na)) return true;
  // Check if first word matches (e.g., "Amazon" vs "Amazon.com Services")
  const firstA = na.split(/\s+/)[0];
  const firstB = nb.split(/\s+/)[0];
  if (firstA.length >= 4 && firstA === firstB) return true;
  return false;
}
