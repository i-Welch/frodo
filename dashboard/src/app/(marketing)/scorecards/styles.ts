export const scorecardStyles = `
  .sc-filters { display: flex; flex-wrap: wrap; gap: 0.75rem 1.25rem; align-items: center; margin: 1.25rem 0 0.5rem; }
  .sc-filter { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--gray-500); }
  .sc-filter select { font-size: 0.9rem; padding: 0.45rem 0.7rem; border-radius: 8px; border: 1px solid var(--accent-border); background: rgba(255,255,255,0.04); color: var(--white); }
  .sc-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .sc-chip { font-size: 0.78rem; padding: 0.35rem 0.75rem; border-radius: 999px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: var(--gray-500); cursor: pointer; }
  .sc-chip-on { border-color: var(--accent-border); background: var(--accent-dim); color: var(--white); }
  .sc-table { min-width: 860px; }
  .sc-name { background: none; border: 0; padding: 0; font: inherit; font-weight: 600; color: var(--white); cursor: pointer; text-align: left; text-decoration: underline; text-decoration-color: rgba(108,142,255,0.45); text-underline-offset: 3px; }
  .sc-name:hover { color: var(--accent); }
  .sc-score { display: inline-block; min-width: 2.4rem; text-align: center; padding: 0.15rem 0.4rem; border-radius: 6px; font-size: 0.82rem; }
  .sc-score-high { background: rgba(74,222,128,0.13); color: #86EFAC; }
  .sc-score-mid { background: rgba(255,255,255,0.08); color: var(--gray-300); }
  .sc-score-low { background: rgba(255,196,0,0.12); color: #FFD666; }
  .sc-score-none { color: var(--gray-500); }
  .sc-overall { color: var(--white); font-size: 1rem; }
  .sc-row-open td { border-bottom: none; }
  .sc-detail-row td { background: rgba(255,255,255,0.02); }
  .sc-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.6rem 1.5rem; margin: 0.25rem 0 0.75rem; }
  .sc-details dt { font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-500); }
  .sc-details dd { margin: 0.1rem 0 0; font-size: 0.85rem; color: var(--gray-300); line-height: 1.55; }
  .sc-notes { margin: 0 0 0.5rem 1.1rem; font-size: 0.8rem; color: var(--gray-500); line-height: 1.6; }
  .sc-leaders { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0.75rem; margin: 1.25rem 0 1.5rem; }
  .sc-leader { border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.9rem 1rem; }
  .sc-leader-label { font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-500); }
  .sc-leader-name { font-weight: 700; color: var(--white); margin-top: 0.3rem; line-height: 1.35; }
  .sc-leader-detail { font-size: 0.8rem; color: var(--gray-500); margin-top: 0.2rem; }
  .sc-criteria dt { font-weight: 600; color: var(--white); margin-top: 0.9rem; font-size: 0.95rem; }
  .sc-criteria dd { margin: 0.25rem 0 0; font-size: 0.92rem; line-height: 1.7; color: var(--gray-300); }
`;
