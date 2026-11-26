import { rankedRows, rowsForView, scoreRow } from './scoring';
import { KIND_LABELS, SCORECARD_STATES, STATE_LABELS, type InstitutionKind, type ProductType, type ScorecardView } from './types';

// Plain, serializable scorecard data for the client table: every row with its
// scores in each view, so filtering by state or type needs no server round trip.

export interface ViewScore {
  overall: number | null;
  rank: number | null;
  unranked?: string;
  scores: Record<string, number | null>;
}

export interface TableRow {
  id: string;
  institution: string;
  product: string;
  url: string;
  kind: InstitutionKind;
  kindLabel: string;
  hq: string;
  headline: string;
  asOf: string;
  /** Branch count per state, for the "branches here" column. */
  branches: Record<string, number>;
  views: Partial<Record<ScorecardView, ViewScore>>;
  details: { label: string; value: string }[];
  sources: { url: string; what: string }[];
  notes: string[];
}

export interface TableData {
  product: string;
  headlineLabel: string;
  criteria: { key: string; label: string }[];
  rows: TableRow[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tableData(type: ProductType<any>): TableData {
  const views: ScorecardView[] = ['all', ...SCORECARD_STATES];
  const ranks = new Map(views.map((v) => [v, new Map(rankedRows(type, v).map((s) => [s.row.institution, s]))]));
  const rows: TableRow[] = type.rows.map((row) => {
    const any = scoreRow(type, row, 'all');
    const inst = any.inst;
    const perView: TableRow['views'] = {};
    for (const v of views) {
      if (!rowsForView(type, v).includes(row)) continue;
      const s = ranks.get(v)!.get(row.institution)!;
      perView[v] = { overall: s.overall, rank: s.rank, unranked: s.unranked, scores: s.scores };
    }
    return {
      id: row.institution,
      institution: inst.name,
      product: row.name,
      url: row.url,
      kind: inst.kind,
      kindLabel: KIND_LABELS[inst.kind],
      hq: inst.hq,
      headline: type.headline.value(row),
      asOf: row.asOf,
      branches: inst.branches,
      views: perView,
      details: [
        ...type.facts.map((f) => ({ label: f.label, value: f.value(row, inst) })),
        {
          label: 'Branches',
          value:
            SCORECARD_STATES.map((s) => `${STATE_LABELS[s].name} ${inst.branches[s]}`).join(', ') +
            (inst.branchesNote ? `. ${inst.branchesNote}` : ''),
        },
      ],
      sources: row.sources,
      notes: row.notes,
    };
  });
  return {
    product: type.slug,
    headlineLabel: type.headline.label,
    criteria: type.criteria.map((c) => ({ key: c.key, label: c.label })),
    rows,
  };
}
