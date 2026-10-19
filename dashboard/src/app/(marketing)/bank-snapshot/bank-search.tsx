'use client';

import { useEffect, useState } from 'react';
import { track } from '@vercel/analytics';
import { bankSlug } from './peer-data';
import { searchBanks, searchUrl, type BankMatch } from './fdic-search';

export function BankSearch() {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<BankMatch[] | null>(null);

  useEffect(() => {
    const url = searchUrl(query);
    if (!url) {
      setMatches(null);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setMatches(await searchBanks(url, ctrl.signal));
      } catch {
        // Aborted by the next keystroke, or FDIC is down; keep the last results.
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  return (
    <div className="bsn-search">
      <label htmlFor="bsn-query" className="bsn-label">
        Find your bank
      </label>
      <input
        id="bsn-query"
        className="bsn-input"
        type="search"
        autoComplete="off"
        placeholder="Bank name, e.g. Conway National"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {matches && (
        <ul className="bsn-results">
          {matches.length === 0 && <li className="bsn-empty">No active FDIC-insured bank matches. Credit unions are NCUA-insured and not covered.</li>}
          {matches.map((m) => (
            <li key={m.CERT}>
              <a
                href={`/bank-snapshot/${m.CERT}-${bankSlug(m.NAME)}`}
                onClick={() => track('bank_snapshot_search', { cert: m.CERT })}
              >
                <span className="bsn-result-name">{m.NAME}</span>
                <span className="bsn-result-loc">
                  {m.CITY}, {m.STALP}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
