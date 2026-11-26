'use client';

import { Fragment, useMemo, useState } from 'react';
import type { TableData, TableRow } from './view-data';
import { KIND_LABELS, SCORECARD_STATES, STATE_LABELS, type InstitutionKind, type ScorecardView } from './types';

const KINDS = Object.keys(KIND_LABELS) as InstitutionKind[];

function scoreClass(n: number | null) {
  if (n === null) return 'sc-score sc-score-none';
  return n >= 7.5 ? 'sc-score sc-score-high' : n >= 5 ? 'sc-score sc-score-mid' : 'sc-score sc-score-low';
}

const fmt = (n: number | null) => (n === null ? 'n/a' : n.toFixed(1));

export function ScorecardTable({ data, view: fixedView }: { data: TableData; view?: ScorecardView }) {
  const [view, setView] = useState<ScorecardView>(fixedView ?? 'all');
  const [kinds, setKinds] = useState<Set<InstitutionKind>>(new Set(KINDS));
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    const inView = data.rows.filter((r) => r.views[view] && kinds.has(r.kind));
    return inView.sort((a, b) => {
      const x = a.views[view]!;
      const y = b.views[view]!;
      if (x.overall === null || y.overall === null) return x.overall === null ? (y.overall === null ? a.institution.localeCompare(b.institution) : 1) : -1;
      return y.overall - x.overall || a.institution.localeCompare(b.institution);
    });
  }, [data.rows, view, kinds]);

  const toggleKind = (k: InstitutionKind) =>
    setKinds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next.size === 0 ? new Set(KINDS) : next;
    });

  const branchesHere = (r: TableRow) =>
    view === 'all' ? SCORECARD_STATES.reduce((sum, s) => sum + r.branches[s], 0) : r.branches[view];

  return (
    <div className="sc-table-block">
      <div className="sc-filters" role="group" aria-label="Filter the scorecard">
        {!fixedView && (
          <label className="sc-filter">
            <span>State</span>
            <select value={view} onChange={(e) => setView(e.target.value as ScorecardView)}>
              <option value="all">All four states</option>
              {SCORECARD_STATES.map((s) => (
                <option key={s} value={s}>
                  {STATE_LABELS[s].name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="sc-chips">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              className={kinds.has(k) ? 'sc-chip sc-chip-on' : 'sc-chip'}
              aria-pressed={kinds.has(k)}
              onClick={() => toggleKind(k)}
            >
              {KIND_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="bsn-table-wrap">
        <table className="bsn-table sc-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Institution</th>
              <th>{data.headlineLabel}</th>
              {data.criteria.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              <th>{view === 'all' ? 'Branches (4 states)' : `Branches in ${view}`}</th>
              <th>Overall</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const v = r.views[view]!;
              const isOpen = open === r.id;
              return (
                <Fragment key={r.id}>
                  <tr className={isOpen ? 'sc-row sc-row-open' : 'sc-row'}>
                    <td className="bsn-num">{v.rank ?? '–'}</td>
                    <td>
                      <button type="button" className="sc-name" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.id)}>
                        {r.institution}
                      </button>
                      <div className="bsn-note">
                        {r.product} &middot; {r.kindLabel}
                      </div>
                    </td>
                    <td className="bsn-num bsn-metric">{r.headline}</td>
                    {data.criteria.map((c) => (
                      <td key={c.key} className="bsn-num">
                        <span className={scoreClass(v.scores[c.key])}>{fmt(v.scores[c.key])}</span>
                      </td>
                    ))}
                    <td className="bsn-num">{branchesHere(r)}</td>
                    <td className="bsn-num">
                      {v.overall === null ? <span className="bsn-note">{v.unranked}</span> : <strong className="sc-overall">{v.overall.toFixed(1)}</strong>}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="sc-detail-row">
                      <td colSpan={data.criteria.length + 5}>
                        <dl className="sc-details">
                          {r.details.map((d) => (
                            <div key={d.label}>
                              <dt>{d.label}</dt>
                              <dd>{d.value}</dd>
                            </div>
                          ))}
                        </dl>
                        {r.notes.length > 0 && (
                          <ul className="sc-notes">
                            {r.notes.map((n) => (
                              <li key={n}>{n}</li>
                            ))}
                          </ul>
                        )}
                        <p className="bsn-note">
                          Verified {r.asOf} from:{' '}
                          {r.sources.map((s, i) => (
                            <span key={s.url + i}>
                              {i > 0 && ' · '}
                              <a href={s.url} rel="nofollow noopener" target="_blank" title={s.what}>
                                {new URL(s.url).hostname.replace(/^www\./, '')}
                              </a>
                            </span>
                          ))}
                          {' · '}
                          <a href={r.url} rel="nofollow noopener" target="_blank">
                            product page
                          </a>
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="bsn-note">Scores are out of 10. Select an institution for every fact behind its scores and the pages we read.</p>
    </div>
  );
}
