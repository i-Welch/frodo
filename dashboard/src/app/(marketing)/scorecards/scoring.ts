import { INSTITUTIONS } from './institutions';
import { WEIGHTS } from './weights';
import {
  NATIONAL_KINDS,
  SCORECARD_STATES,
  type Institution,
  type ProductRow,
  type ProductType,
  type ScorecardView,
  type StateCode,
  type SupportLevel,
} from './types';

const BY_SLUG = new Map(INSTITUTIONS.map((i) => [i.slug, i]));

export function institution(slug: string): Institution {
  const inst = BY_SLUG.get(slug);
  if (!inst) throw new Error(`Unknown scorecard institution: ${slug}`);
  return inst;
}

export const clamp10 = (n: number) => Math.max(0, Math.min(10, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

/* ---------- Criteria every product type shares ---------- */

const SUPPORT_POINTS: Record<SupportLevel, number> = {
  'phone-24-7': 4,
  'chat-24-7': 3.5,
  extended: 3,
  'business-hours': 2.5,
  unknown: 2,
};

/** In-person access in one state: branches there, or support quality when there are none. */
export function accessScore(inst: Institution, state: StateCode): number {
  const n = inst.branches[state];
  if (n > 0) return clamp10(6 + (n >= 50 ? 4 : n >= 20 ? 3 : n >= 10 ? 2 : n >= 3 ? 1 : 0.5));
  return SUPPORT_POINTS[inst.supportLevel];
}

/** 2 for yes, 1 for not stated, 0 for no (scaled by `points`). */
export const yesNo = (v: boolean | null, points = 2) => (v === true ? points : v === null ? points / 2 : 0);

/* ---------- Scores and ranking ---------- */

export interface ScoredRow<F> {
  row: ProductRow<F>;
  inst: Institution;
  /** Criterion key -> 0-10 score, or null when not scorable. */
  scores: Record<string, number | null>;
  /** Null when a required criterion could not be scored. */
  overall: number | null;
  rank: number | null;
  /** Why the row is not ranked. */
  unranked?: string;
}

function criterionScore<F>(type: ProductType<F>, key: string, row: ProductRow<F>, inst: Institution, view: ScorecardView) {
  const c = type.criteria.find((x) => x.key === key)!;
  if (view !== 'all') return c.score(row, inst, view);
  const each = SCORECARD_STATES.map((s) => c.score(row, inst, s));
  if (each.some((v) => v === null)) return null;
  return (each as number[]).reduce((a, b) => a + b, 0) / each.length;
}

export function scoreRow<F>(type: ProductType<F>, row: ProductRow<F>, view: ScorecardView): ScoredRow<F> {
  const inst = institution(row.institution);
  const weights = WEIGHTS[type.slug];
  const scores: Record<string, number | null> = {};
  for (const c of type.criteria) {
    const s = criterionScore(type, c.key, row, inst, view);
    scores[c.key] = s === null ? null : round1(clamp10(s));
  }
  const missing = type.required.filter((k) => scores[k] === null);
  if (missing.length > 0) {
    const labels = missing.map((k) => type.criteria.find((c) => c.key === k)!.label.toLowerCase());
    return { row, inst, scores, overall: null, rank: null, unranked: `Not ranked: ${labels.join(' and ')} not published` };
  }
  // A criterion that is not required and not scorable counts as a neutral 5.
  const overall = type.criteria.reduce((sum, c) => sum + (weights[c.key] ?? 0) * (scores[c.key] ?? 5), 0);
  return { row, inst, scores, overall: round1(overall), rank: null };
}

/** Rows that belong on a view: national institutions everywhere, local ones in their HQ state or where they have branches. */
export function rowsForView<F>(type: ProductType<F>, view: ScorecardView): ProductRow<F>[] {
  if (view === 'all') return type.rows;
  return type.rows.filter((r) => {
    const inst = institution(r.institution);
    return NATIONAL_KINDS.includes(inst.kind) || inst.hqState === view || inst.branches[view] > 0;
  });
}

/** Ranked rows for a view, best first; unranked rows last, by name. */
export function rankedRows<F>(type: ProductType<F>, view: ScorecardView): ScoredRow<F>[] {
  const scored = rowsForView(type, view).map((r) => scoreRow(type, r, view));
  const ranked = scored.filter((s) => s.overall !== null).sort((a, b) => b.overall! - a.overall! || a.inst.name.localeCompare(b.inst.name));
  ranked.forEach((s, i) => {
    // Ties share a rank.
    s.rank = i > 0 && ranked[i - 1].overall === s.overall ? ranked[i - 1].rank : i + 1;
  });
  const rest = scored.filter((s) => s.overall === null).sort((a, b) => a.inst.name.localeCompare(b.inst.name));
  return [...ranked, ...rest];
}

/** The top-scoring row on one criterion (for "best for" callouts). */
export function bestOn<F>(rows: ScoredRow<F>[], key: string): ScoredRow<F> | undefined {
  return rows
    .filter((r) => r.scores[key] !== null && r.overall !== null)
    .sort((a, b) => b.scores[key]! - a.scores[key]! || b.overall! - a.overall!)[0];
}
