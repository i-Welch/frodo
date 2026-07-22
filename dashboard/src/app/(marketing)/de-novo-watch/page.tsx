import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';
import { CHARTER_MOVES, DE_NOVO_BANKS, STATUS_LABELS, TRACKER_SUMMARY, type DeNovoStatus } from './de-novo-data';

export const metadata: Metadata = {
  title: 'De Novo Bank Tracker: 2026 Charters and Applications',
  description:
    'A free tracker of de novo bank activity: FDIC deposit insurance applications, conditional approvals, new charters, and openings, with capital raises and technology choices. Updated monthly.',
  alternates: { canonical: 'https://reportraven.tech/de-novo-watch' },
  openGraph: {
    title: 'De Novo Watch: New Bank Charters and Applications',
    description:
      'Who is starting a bank, where, with how much capital, and what technology. Tracked from FDIC filings and state regulator records.',
    url: 'https://reportraven.tech/de-novo-watch',
    siteName: 'RAVEN',
    type: 'website',
  },
};

const STATUS_ORDER: DeNovoStatus[] = ['chartered', 'conditional-approval', 'application-pending', 'open'];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Dataset',
      '@id': 'https://reportraven.tech/de-novo-watch#dataset',
      name: 'RAVEN De Novo Watch: US De Novo Bank Tracker',
      description:
        'Tracker of de novo bank formation activity in the United States: FDIC deposit insurance applications, conditional approvals, state charters, and openings, with capital raises, leadership, and technology signals.',
      url: 'https://reportraven.tech/de-novo-watch',
      creator: { '@id': 'https://reportraven.tech/#organization' },
      dateModified: TRACKER_SUMMARY.updated,
      isAccessibleForFree: true,
      license: 'https://reportraven.tech/de-novo-watch#citation',
      keywords: ['de novo bank', 'bank charter', 'FDIC application', 'new bank', 'community bank'],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reportraven.tech' },
        { '@type': 'ListItem', position: 2, name: 'De Novo Watch', item: 'https://reportraven.tech/de-novo-watch' },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': 'https://reportraven.tech/de-novo-watch',
      url: 'https://reportraven.tech/de-novo-watch',
      name: 'De Novo Bank Tracker: 2026 Charters and Applications',
      dateModified: TRACKER_SUMMARY.updated,
      mainEntity: { '@id': 'https://reportraven.tech/de-novo-watch#dataset' },
    },
  ],
};

const styles = `
  .dnw-page { max-width: 860px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
  .dnw-eyebrow { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; }
  .dnw-page h1 { font-size: 2.2rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1rem; }
  .dnw-page h2 { font-size: 1.3rem; font-weight: 700; margin: 2.5rem 0 0.9rem; }
  .dnw-page p { font-size: 0.95rem; line-height: 1.75; color: var(--gray-300); margin-bottom: 1rem; }
  .dnw-page a { color: var(--accent); text-decoration: none; }
  .dnw-page a:hover { text-decoration: underline; }
  .dnw-updated { font-size: 0.78rem; color: var(--gray-500); margin-bottom: 1.75rem; }
  .dnw-stat { border: 1px solid var(--accent-border); background: var(--accent-dim); border-radius: 10px; padding: 1.1rem 1.4rem; margin: 1.5rem 0 2rem; font-size: 0.92rem; line-height: 1.65; color: var(--gray-200); }
  .dnw-stat strong { color: var(--white); }
  .dnw-table-wrap { overflow-x: auto; margin: 1.25rem 0 0.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; }
  .dnw-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 720px; }
  .dnw-table th { text-align: left; padding: 0.7rem 0.9rem; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-500); border-bottom: 1px solid rgba(255,255,255,0.1); white-space: nowrap; }
  .dnw-table td { padding: 0.8rem 0.9rem; vertical-align: top; color: var(--gray-300); line-height: 1.55; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .dnw-table tr:last-child td { border-bottom: none; }
  .dnw-bank { font-weight: 600; color: var(--white); white-space: nowrap; }
  .dnw-status { display: inline-block; font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap; }
  .dnw-status-chartered { background: rgba(108,142,255,0.16); color: #A8BDFF; }
  .dnw-status-conditional-approval { background: rgba(255,196,0,0.14); color: #FFD666; }
  .dnw-status-application-pending { background: rgba(255,255,255,0.08); color: var(--gray-300); }
  .dnw-status-open { background: rgba(74,222,128,0.13); color: #86EFAC; }
  .dnw-note { font-size: 0.8rem; color: var(--gray-500); line-height: 1.6; margin-top: 0.75rem; }
`;

export default function DeNovoWatchPage() {
  const banks = [...DE_NOVO_BANKS].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  );

  return (
    <SiteShell ctaSource="de-novo-watch">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{styles}</style>
      <div className="dnw-page">
        <div className="dnw-eyebrow">De Novo Watch</div>
        <h1>De novo bank tracker</h1>
        <p className="dnw-updated">Updated {TRACKER_SUMMARY.updated} &middot; Free to cite with attribution to RAVEN (reportraven.tech)</p>
        <p>
          Who is starting a bank, where, with how much capital, and what technology. De Novo Watch
          tracks deposit insurance applications, conditional approvals, charters, and openings, from
          FDIC filings, state regulator records, and organizer announcements, and pairs the filings
          with FDIC call-report analysis of the markets these banks are entering.
        </p>
        <div className="dnw-stat">
          <strong>{TRACKER_SUMMARY.nationalApplications2026} deposit insurance applications</strong>{' '}
          have been filed nationally in 2026 through early July.{' '}
          <strong>{TRACKER_SUMMARY.floridaApplications2026} are Florida banks</strong>, the most of
          any state, making Florida the center of the strongest de novo environment in years.
        </div>

        <div className="dnw-table-wrap">
          <table className="dnw-table">
            <thead>
              <tr>
                <th>Bank</th>
                <th>Location</th>
                <th>Status</th>
                <th>Capital</th>
                <th>Technology signals</th>
                <th>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {banks.map((b) => (
                <tr key={b.name}>
                  <td>
                    <span className="dnw-bank">{b.name}</span>
                    {b.leadership && <div className="dnw-note">{b.leadership}</div>}
                  </td>
                  <td>{b.location}</td>
                  <td>
                    <span className={`dnw-status dnw-status-${b.status}`}>{STATUS_LABELS[b.status]}</span>
                    <div className="dnw-note">{b.statusDetail}</div>
                  </td>
                  <td>{b.capital ?? '–'}</td>
                  <td>{b.techNotes ?? '–'}</td>
                  <td>
                    {b.articleSlug ? <a href={`/blog/${b.articleSlug}`}>Deep dive</a> : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="dnw-note">
          Rows are added as applications are filed and verified against a public source.
        </p>

        <h2>Charter moves: the side door</h2>
        <p>
          Not every new bank arrives through an FDIC application. Some groups buy an existing
          charter and relocate or relaunch it, skipping the de novo queue entirely. We track those
          here because they change local markets the same way a de novo does.
        </p>
        <div className="dnw-table-wrap">
          <table className="dnw-table">
            <thead>
              <tr>
                <th>Bank</th>
                <th>Charter origin</th>
                <th>The move</th>
                <th>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {CHARTER_MOVES.map((m) => (
                <tr key={m.name}>
                  <td className="dnw-bank">{m.name}</td>
                  <td>{m.charterOrigin}</td>
                  <td>{m.move}</td>
                  <td>{m.articleSlug ? <a href={`/blog/${m.articleSlug}`}>Deep dive</a> : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="citation">Methodology and citation</h2>
        <p>
          Sources: the FDIC pending deposit insurance applications list, state banking regulator
          filings (for Florida, the Office of Financial Regulation), organizer press releases and
          public statements, and FDIC call reports for market analysis. Each row shows the date it
          was last verified. This tracker is free to cite with attribution to RAVEN
          (reportraven.tech). Corrections and tips: <a href="mailto:isaac@reportraven.tech">isaac@reportraven.tech</a>
        </p>

        <h2>Read the analysis</h2>
        <p>
          <a href="/blog/portrait-bank-winter-park-de-novo">Portrait Bank: The $43M Bet That Orlando Wants Its Hometown Bank Back</a>
          <br />
          <a href="/blog/glades-bank-broward-de-novo">Glades Bank and Trust: A $45M Filing for the County the Banks Left Behind</a>
          <br />
          <a href="/blog/how-to-start-a-bank">How to Start a Bank: The De Novo Playbook</a>
          <br />
          <a href="/blog/de-novo-bank-day-one-fraud-program">The De Novo Bank&rsquo;s Day-One Fraud Program</a>
        </p>
        <p>
          Organizing a bank? See what a{' '}
          <a href="/solutions/de-novo-bank-technology">day-one verification stack</a> looks like, or
          read the <a href="/glossary/de-novo-bank">de novo bank</a> glossary entry.
        </p>
      </div>
    </SiteShell>
  );
}
