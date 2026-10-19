'use client';

import { useEffect, useState } from 'react';
import { track } from '@vercel/analytics';
import { bankSlug } from './peer-data';

interface Match {
  NAME: string;
  CITY: string;
  STALP: string;
  CERT: number;
}

// FDIC BankFind allows cross-origin requests, so the search runs in the browser.
// Each word becomes a case-insensitive wildcard on the institution name.
function searchUrl(query: string): string | undefined {
  const words = query.match(/[a-z0-9]{2,}/gi)?.slice(0, 4);
  if (!words) return undefined;
  const filters = ['ACTIVE:1', ...words.map((w) => `NAME:*${w}*`)].join(' AND ');
  const params = new URLSearchParams({ filters, fields: 'NAME,CITY,STALP,CERT', sort_by: 'ASSET', sort_order: 'DESC', limit: '8' });
  return `https://api.fdic.gov/banks/institutions?${params}`;
}

export function BankSearch() {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<Match[] | null>(null);

  useEffect(() => {
    const url = searchUrl(query);
    if (!url) {
      setMatches(null);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        const body = (await res.json()) as { data?: { data: Match }[] };
        setMatches((body.data ?? []).map((d) => d.data));
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
