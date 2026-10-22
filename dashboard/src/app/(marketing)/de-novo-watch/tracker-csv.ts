import { CHARTER_MOVES, DE_NOVO_BANKS, FDIC_PENDING, STATUS_LABELS } from './de-novo-data';

// CSV export of the tracker (served at /de-novo-watch/data.csv). Same rows as the page,
// including the full FDIC pending list.

const SITE = 'https://reportraven.tech';

export function csvCell(value: string | undefined): string {
  const s = value ?? '';
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function trackerCsv(): string {
  const header = ['type', 'bank', 'location', 'status', 'detail', 'capital', 'leadership', 'technology', 'coverage_url', 'verified'];
  const rows = [
    ...DE_NOVO_BANKS.map((b) => [
      'de novo',
      b.name,
      b.location,
      STATUS_LABELS[b.status],
      b.statusDetail,
      b.capital,
      b.leadership,
      b.techNotes,
      b.articleSlug ? `${SITE}/blog/${b.articleSlug}` : '',
      b.asOf,
    ]),
    ...CHARTER_MOVES.map((m) => [
      'charter move',
      m.name,
      '',
      '',
      `${m.charterOrigin}. ${m.move}`,
      '',
      '',
      '',
      m.articleSlug ? `${SITE}/blog/${m.articleSlug}` : '',
      m.asOf,
    ]),
    ...FDIC_PENDING.rows.map((r) => [
      'fdic pending',
      r.name,
      `${r.city}, ${r.state}`,
      STATUS_LABELS['application-pending'],
      `FDIC deposit insurance application received ${r.received}`,
      '',
      '',
      '',
      FDIC_PENDING.source,
      FDIC_PENDING.asOf,
    ]),
  ];
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(','));
  return `${lines.join('\n')}\n`;
}
