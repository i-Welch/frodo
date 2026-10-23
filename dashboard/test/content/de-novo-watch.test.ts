import { describe, it, expect } from 'vitest';
import { CHARTER_MOVES, DE_NOVO_BANKS, FDIC_PENDING, TRACKER_SUMMARY } from '../../src/app/(marketing)/de-novo-watch/de-novo-data';
import { csvCell, trackerCsv } from '../../src/app/(marketing)/de-novo-watch/tracker-csv';
import { BLOG_SLUGS } from '../../src/app/(marketing)/blog/published';

// The weekly /de-novo-update run edits the tracker unattended, so these guard
// the shape the page and CSV export depend on.

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const today = new Date().toISOString().slice(0, 10);

describe('De Novo Watch data', () => {
  const rows = [...DE_NOVO_BANKS, ...CHARTER_MOVES];

  it('has a valid, non-future verified date on every row', () => {
    for (const r of rows) {
      expect(r.asOf, r.name).toMatch(DATE);
      expect(r.asOf <= today, `${r.name} asOf ${r.asOf} is in the future`).toBe(true);
    }
    expect(TRACKER_SUMMARY.updated).toMatch(DATE);
  });

  it('has unique bank names', () => {
    const names = DE_NOVO_BANKS.map((b) => b.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('links only to published articles', () => {
    const published = new Set<string>(BLOG_SLUGS);
    for (const r of rows) {
      if (r.articleSlug) expect(published.has(r.articleSlug), `${r.name} -> ${r.articleSlug}`).toBe(true);
    }
  });

  it('has no em dashes', () => {
    expect(JSON.stringify(rows)).not.toContain('—');
  });

  it('has a well-formed FDIC pending list', () => {
    expect(FDIC_PENDING.asOf).toMatch(DATE);
    expect(FDIC_PENDING.asOf <= today).toBe(true);
    const names = FDIC_PENDING.rows.map((r) => r.name);
    expect(new Set(names).size).toBe(names.length);
    for (const r of FDIC_PENDING.rows) {
      expect(r.received, r.name).toMatch(DATE);
      expect(r.received <= FDIC_PENDING.asOf, `${r.name} received after asOf`).toBe(true);
      expect(r.state, r.name).toMatch(/^[A-Z]{2}$/);
    }
  });
});

describe('tracker CSV', () => {
  it('quotes cells with commas, quotes and newlines', () => {
    expect(csvCell('plain')).toBe('plain');
    expect(csvCell(undefined)).toBe('');
    expect(csvCell('a, b')).toBe('"a, b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it('has a header and one line per row', () => {
    const lines = trackerCsv().trimEnd().split('\n');
    expect(lines[0]).toBe('type,bank,location,status,detail,capital,leadership,technology,coverage_url,verified');
    expect(lines).toHaveLength(1 + DE_NOVO_BANKS.length + CHARTER_MOVES.length + FDIC_PENDING.rows.length);
  });
});

describe('tracker FAQ', () => {
  it('names every bank in exactly one status answer', async () => {
    const { trackerFaqs } = await import('../../src/app/(marketing)/de-novo-watch/tracker-faq');
    const text = trackerFaqs().map((f) => f.a).join('\n');
    for (const b of DE_NOVO_BANKS) expect(text, b.name).toContain(b.name);
    expect(text).not.toContain('—');
  });
});
