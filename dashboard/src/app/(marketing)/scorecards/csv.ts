import { csvCell } from '../de-novo-watch/tracker-csv';
import { scoreRow } from './scoring';
import { KIND_LABELS, SCORECARD_STATES, type ProductType } from './types';

// One row per institution: the facts, every criterion score on the Southeast
// view, the overall score on each view, and the sources.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function scorecardCsv(type: ProductType<any>): string {
  const header = [
    'institution',
    'type',
    'product',
    'product_url',
    ...type.facts.map((f) => f.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')),
    ...SCORECARD_STATES.map((s) => `branches_${s.toLowerCase()}`),
    ...type.criteria.map((c) => `score_${c.key}`),
    'overall_southeast',
    ...SCORECARD_STATES.map((s) => `overall_${s.toLowerCase()}`),
    'verified',
    'sources',
  ];
  const lines = type.rows.map((row) => {
    const all = scoreRow(type, row, 'all');
    const inst = all.inst;
    return [
      inst.name,
      KIND_LABELS[inst.kind],
      row.name,
      row.url,
      ...type.facts.map((f) => f.value(row, inst)),
      ...SCORECARD_STATES.map((s) => String(inst.branches[s])),
      ...type.criteria.map((c) => (all.scores[c.key] === null ? '' : String(all.scores[c.key]))),
      all.overall === null ? '' : String(all.overall),
      ...SCORECARD_STATES.map((s) => {
        const o = scoreRow(type, row, s).overall;
        return o === null ? '' : String(o);
      }),
      row.asOf,
      row.sources.map((s: { url: string }) => s.url).join(' '),
    ];
  });
  return [header, ...lines].map((l) => l.map((v) => csvCell(v)).join(',')).join('\n') + '\n';
}
