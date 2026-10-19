export const snapshotStyles = `
  .bsn-page { max-width: 860px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
  .bsn-eyebrow { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; }
  .bsn-eyebrow a { color: var(--accent); text-decoration: none; }
  .bsn-page h1 { font-size: 2.2rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1rem; }
  .bsn-page h2 { font-size: 1.3rem; font-weight: 700; margin: 2.5rem 0 0.9rem; }
  .bsn-page p { font-size: 0.95rem; line-height: 1.75; color: var(--gray-300); margin-bottom: 1rem; }
  .bsn-page a { color: var(--accent); }
  .bsn-page p a { text-decoration: underline; text-underline-offset: 2px; text-decoration-color: rgba(108,142,255,0.5); }
  .bsn-meta { font-size: 0.78rem; color: var(--gray-500); margin-bottom: 1.75rem; }
  .bsn-search { margin: 1.75rem 0 2rem; }
  .bsn-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--gray-300); margin-bottom: 0.5rem; }
  .bsn-input { width: 100%; font-size: 1rem; padding: 0.85rem 1rem; border-radius: 10px; border: 1px solid var(--accent-border); background: rgba(255,255,255,0.04); color: var(--white); }
  .bsn-input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
  .bsn-results { list-style: none; margin: 0.5rem 0 0; padding: 0; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; }
  .bsn-results li + li { border-top: 1px solid rgba(255,255,255,0.06); }
  .bsn-results a { display: flex; justify-content: space-between; gap: 1rem; padding: 0.75rem 1rem; text-decoration: none; }
  .bsn-results a:hover { background: var(--accent-dim); }
  .bsn-result-name { color: var(--white); font-weight: 600; }
  .bsn-result-loc { color: var(--gray-500); font-size: 0.85rem; white-space: nowrap; }
  .bsn-empty { padding: 0.75rem 1rem; color: var(--gray-500); font-size: 0.88rem; }
  .bsn-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin: 1.5rem 0; }
  .bsn-stat { border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.9rem 1rem; }
  .bsn-stat-label { font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-500); }
  .bsn-stat-value { font-size: 1.35rem; font-weight: 700; color: var(--white); margin-top: 0.25rem; }
  .bsn-table-wrap { overflow-x: auto; margin: 1.25rem 0 0.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; }
  .bsn-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; min-width: 560px; }
  .bsn-table th { text-align: left; padding: 0.7rem 0.9rem; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-500); border-bottom: 1px solid rgba(255,255,255,0.1); }
  .bsn-table td { padding: 0.8rem 0.9rem; vertical-align: top; color: var(--gray-300); line-height: 1.5; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .bsn-table tr:last-child td { border-bottom: none; }
  .bsn-metric { font-weight: 600; color: var(--white); }
  .bsn-num { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .bsn-rank { display: inline-block; font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap; }
  .bsn-rank-top { background: rgba(74,222,128,0.13); color: #86EFAC; }
  .bsn-rank-mid { background: rgba(255,255,255,0.08); color: var(--gray-300); }
  .bsn-rank-low { background: rgba(255,196,0,0.14); color: #FFD666; }
  .bsn-note { font-size: 0.8rem; color: var(--gray-500); line-height: 1.6; margin-top: 0.35rem; }
  .bsn-top { list-style: decimal; margin: 0.5rem 0 1rem 1.5rem; padding: 0; color: var(--gray-300); font-size: 0.92rem; line-height: 1.9; }
  .bsn-top a { color: var(--white); font-weight: 600; text-decoration: none; }
  .bsn-top a:hover { color: var(--accent); }
  .bsn-top .bsn-num { color: var(--accent); margin-left: 0.35rem; }
  .bsn-callout { border: 1px solid var(--accent-border); background: var(--accent-dim); border-radius: 10px; padding: 1.1rem 1.4rem; margin: 1.5rem 0 2rem; font-size: 0.92rem; line-height: 1.65; color: var(--gray-200); }
  .bsn-callout strong { color: var(--white); }
`;
