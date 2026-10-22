import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';
import { LeadCapture } from '../lead-capture';
import { CATEGORIES, STACK_ROWS, STACK_UPDATED, stackFaqs, vendorCounts } from './stack-data';

const URL = 'https://reportraven.tech/bank-tech-stack';

export const metadata: Metadata = {
  title: 'Bank Tech Stack Tracker: Who Runs Banno, Q2, MeridianLink and Encompass',
  description:
    'Which digital banking, loan application, mortgage and account-opening vendors Southeast community banks and credit unions actually run, fingerprinted from their live sites. Free, dated, sourced.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Bank Tech Stack Tracker',
    description:
      'The digital banking, lending and account-opening vendors behind Southeast community banks and credit unions, fingerprinted from their live application flows.',
    url: URL,
    siteName: 'RAVEN',
    type: 'website',
  },
};

const faqs = stackFaqs();
const rows = [...STACK_ROWS].sort((a, b) => a.name.localeCompare(b.name));
const banks = STACK_ROWS.filter((r) => r.type === 'bank').length;
const cus = STACK_ROWS.length - banks;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Dataset',
      '@id': `${URL}#dataset`,
      name: 'RAVEN Bank Tech Stack Tracker',
      description:
        'Digital banking, consumer lending, mortgage and account-opening vendors used by Southeast US community banks and credit unions, identified from their public websites and application portals.',
      url: URL,
      creator: { '@id': 'https://reportraven.tech/#organization' },
      dateModified: STACK_UPDATED,
      isAccessibleForFree: true,
      license: `${URL}#citation`,
      distribution: { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${URL}/data.csv` },
      keywords: ['bank technology', 'digital banking vendor', 'loan origination system', 'community bank', 'credit union', 'Banno', 'Q2', 'MeridianLink', 'ICE Encompass'],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reportraven.tech' },
        { '@type': 'ListItem', position: 2, name: 'Bank Tech Stack Tracker', item: URL },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

const styles = `
  .bts-page { max-width: 1040px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
  .bts-eyebrow { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; }
  .bts-page h1 { font-size: 2.2rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1rem; }
  .bts-page h2 { font-size: 1.3rem; font-weight: 700; margin: 2.5rem 0 0.9rem; }
  .bts-page p { font-size: 0.95rem; line-height: 1.75; color: var(--gray-300); margin-bottom: 1rem; max-width: 760px; }
  .bts-page a { color: var(--accent); text-decoration: none; }
  .bts-page a:hover { text-decoration: underline; }
  .bts-updated { font-size: 0.78rem; color: var(--gray-500); margin-bottom: 1.75rem; }
  .bts-share { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1.25rem 0 0.5rem; }
  .bts-card { border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 1rem 1.1rem; }
  .bts-card h3 { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-500); margin-bottom: 0.6rem; }
  .bts-card ol { list-style: none; padding: 0; margin: 0; font-size: 0.86rem; color: var(--gray-300); }
  .bts-card li { display: flex; justify-content: space-between; gap: 0.75rem; padding: 0.2rem 0; }
  .bts-card li strong { color: var(--white); font-weight: 600; }
  .bts-table-wrap { overflow-x: auto; margin: 1.25rem 0 0.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; }
  .bts-table { width: 100%; border-collapse: collapse; font-size: 0.84rem; min-width: 900px; }
  .bts-table th { text-align: left; padding: 0.7rem 0.8rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-500); border-bottom: 1px solid rgba(255,255,255,0.1); white-space: nowrap; }
  .bts-table td { padding: 0.75rem 0.8rem; vertical-align: top; color: var(--gray-300); line-height: 1.5; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .bts-table tr:last-child td { border-bottom: none; }
  .bts-name { font-weight: 600; color: var(--white); }
  .bts-sub { font-size: 0.76rem; color: var(--gray-500); margin-top: 0.2rem; }
  .bts-none { color: var(--gray-500); }
  .bts-faq h3 { font-size: 1rem; font-weight: 600; color: var(--white); margin: 1.4rem 0 0.4rem; }
  .bts-note { font-size: 0.8rem; color: var(--gray-500); line-height: 1.6; margin-top: 0.75rem; }
`;

function Cell({ v }: { v: string | null }) {
  return v ? <>{v}</> : <span className="bts-none">Not identified</span>;
}

export default function BankTechStackPage() {
  return (
    <SiteShell ctaSource="bank-tech-stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{styles}</style>
      <div className="bts-page">
        <div className="bts-eyebrow">Research</div>
        <h1>Bank tech stack tracker</h1>
        <p className="bts-updated">Updated {STACK_UPDATED} &middot; Free to cite with attribution to RAVEN (reportraven.tech)</p>
        <p>
          Which vendors actually sit behind a community bank&rsquo;s &ldquo;Apply now&rdquo; button? We
          fingerprinted the live digital banking, loan application, mortgage and account-opening flows
          of {`${STACK_ROWS.length} Southeast institutions (${banks} banks and ${cus} credit unions)`} while
          auditing their digital lending journeys. Each row comes from the institution&rsquo;s own
          site and the portal domains its buttons hand off to, not from vendor press releases.
        </p>

        <h2>Most common vendors by layer</h2>
        <div className="bts-share">
          {CATEGORIES.map((c) => (
            <div className="bts-card" key={c.key}>
              <h3>{c.label}</h3>
              <ol>
                {vendorCounts(c.key).slice(0, 5).map(([v, n]) => (
                  <li key={v}>
                    <span>{v}</span>
                    <strong>{n}</strong>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className="bts-note">
          Counts are institutions where the vendor was positively identified. &ldquo;Not identified&rdquo;
          means the flow was checked but did not reveal a vendor, or the product has no online application.
        </p>

        <h2>Every institution</h2>
        <div className="bts-table-wrap">
          <table className="bts-table">
            <thead>
              <tr>
                <th>Institution</th>
                {CATEGORIES.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Audit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug}>
                  <td>
                    <div className="bts-name">{r.name}</div>
                    <div className="bts-sub">
                      {r.states.join(', ')} &middot; {r.type} &middot; {r.assets}
                    </div>
                  </td>
                  {CATEGORIES.map((c) => (
                    <td key={c.key}>
                      <Cell v={r[c.key]} />
                    </td>
                  ))}
                  <td>{r.audit ? <a href={`/audit/${r.slug}`}>Read</a> : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="bts-note">
          Verified {STACK_UPDATED.slice(0, 7)} against each institution&rsquo;s public site. Vendors change; corrections
          to <a href="mailto:isaac@reportraven.tech">isaac@reportraven.tech</a>.
        </p>

        <section className="bts-faq">
          <h2 id="faq">Frequently asked questions</h2>
          {faqs.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        <h2 id="citation">Methodology and citation</h2>
        <p>
          For each institution we followed every lending and account-opening call to action on its
          public website and recorded where it led: the application domain (for example
          app.loanspq.com for MeridianLink, mymortgage-online.com for ICE Encompass Consumer Connect,
          mortgagewebcenter.com and loanwebcenter.com for Finastra&rsquo;s Mortgagebot) and the online
          banking login host. A vendor is listed only when that evidence identifies it; inferred or
          likely vendors are left as &ldquo;Not identified.&rdquo; Core processors are not listed because
          they are rarely visible from outside. Free to cite with attribution to RAVEN (reportraven.tech). Download the data as <a href="/bank-tech-stack/data.csv">CSV</a>.
        </p>
        <p>
          See also the <a href="/de-novo-watch">De Novo Watch</a> tracker and our{' '}
          <a href="/integrations">integrations</a> with these platforms.
        </p>

        <LeadCapture variant="audit" source="bank-tech-stack" />
      </div>
    </SiteShell>
  );
}
