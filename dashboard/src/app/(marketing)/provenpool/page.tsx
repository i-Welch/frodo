import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';

const UTM = 'utm_source=reportraven&utm_medium=referral&utm_campaign=provenpool';
const PROVENPOOL = `https://provenpool.com/?${UTM}`;
const TAPE_CHECK = `https://provenpool.com/check?${UTM}`;
const DESIGN_PARTNERS = `https://provenpool.com/design-partners?from=raven&${UTM}`;

export const metadata: Metadata = {
  title: 'ProvenPool, a RAVEN product',
  description:
    'ProvenPool is loan sale readiness software from RAVEN: test a loan tape and loan files against a buyer’s eligibility criteria, route every defect to the team that clears it, and export a disposition-ready evidence package.',
  alternates: { canonical: 'https://reportraven.tech/provenpool' },
  openGraph: {
    title: 'ProvenPool, a RAVEN product',
    description:
      'Loan sale readiness for community banks, credit unions and other non-mortgage loan sellers. Built by the team behind RAVEN.',
    url: 'https://reportraven.tech/provenpool',
    siteName: 'RAVEN',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://provenpool.com/#product',
      name: 'ProvenPool',
      url: 'https://provenpool.com',
      applicationCategory: 'BusinessApplication',
      description:
        'Loan sale readiness software: tests a loan tape and loan files against a buyer’s eligibility criteria and concentration limits, routes defects to the teams that clear them, and exports a disposition-ready evidence package.',
      publisher: { '@id': 'https://reportraven.tech/#organization' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reportraven.tech' },
        { '@type': 'ListItem', position: 2, name: 'ProvenPool', item: 'https://reportraven.tech/provenpool' },
      ],
    },
  ],
};

const styles = `
  .pp-page { max-width: 720px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
  .pp-eyebrow { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; }
  .pp-page h1 { font-size: 2.2rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1.25rem; }
  .pp-page h2 { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.01em; margin: 2.5rem 0 0.9rem; }
  .pp-page p { font-size: 0.98rem; line-height: 1.75; color: var(--gray-300); margin-bottom: 1rem; }
  .pp-page ul { margin: 0 0 1rem 1.2rem; }
  .pp-page li { font-size: 0.95rem; line-height: 1.7; color: var(--gray-300); margin-bottom: 0.5rem; }
  .pp-page a { color: var(--accent); text-decoration: none; }
  .pp-page a:hover { text-decoration: underline; }
  .pp-lede { font-size: 1.08rem !important; color: var(--gray-200) !important; }
  .pp-ctas { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1.75rem 0 0.5rem; }
  .pp-page a.pp-btn { display: inline-block; padding: 0.75rem 1.4rem; border-radius: 8px; font-size: 0.92rem; font-weight: 500; text-decoration: none; transition: opacity 200ms; }
  .pp-page a.pp-btn:hover { opacity: 0.85; text-decoration: none; }
  .pp-page a.pp-btn-primary { background: var(--white); color: var(--black); }
  .pp-page a.pp-btn-secondary { border: 1px solid rgba(255,255,255,0.2); color: var(--gray-200); }
  .pp-note { font-size: 0.85rem !important; color: var(--gray-500) !important; margin-top: 2.5rem; }
`;

export default function ProvenPoolPage() {
  return (
    <SiteShell ctaSource="provenpool">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{styles}</style>
      <div className="pp-page">
        <div className="pp-eyebrow">A RAVEN product</div>
        <h1>ProvenPool</h1>
        <p className="pp-lede">
          Loan sale readiness for lenders that sell loans that aren&rsquo;t mortgages. ProvenPool tests a
          loan tape and its loan files against a buyer&rsquo;s eligibility criteria, routes every defect
          to the team that clears it, and exports a disposition-ready evidence package before the
          buyer&rsquo;s diligence starts.
        </p>
        <div className="pp-ctas">
          <a className="pp-btn pp-btn-primary" href={PROVENPOOL}>
            Visit ProvenPool
          </a>
          <a className="pp-btn pp-btn-secondary" href={TAPE_CHECK}>
            Try the free tape check
          </a>
        </div>

        <h2>What it does</h2>
        <ul>
          <li>Tests every loan against the buyer&rsquo;s criteria: credit floors, rate and term bands, seasoning, excluded states and required documents.</li>
          <li>Tests the pool against concentration limits and shows how much balance to pull to get under them.</li>
          <li>Checks that tape fields reconcile with each other and that each loan&rsquo;s required documents are present.</li>
          <li>Sorts defects into kickouts, exceptions and warnings, and routes each one to loan ops, servicing, post-closing or capital markets.</li>
          <li>Exports a clean tape, a remediation worklist and an evidence manifest the buyer can review.</li>
        </ul>
        <p>
          It is built for consumer and auto loan sellers, credit union participations, community bank
          pool sales and small business loans: the sales that mostly run on spreadsheets today.
        </p>

        <h2>Why it&rsquo;s part of RAVEN</h2>
        <p>
          Same founder, same customers, same discipline. RAVEN proves a borrower&rsquo;s file is complete
          and correct before a loan is made. ProvenPool proves a pool of loans is complete and correct
          before it&rsquo;s sold. Both are built by Isaac Welch for community banks and credit unions, and
          both exist so the bank finds the problem before an examiner or a buyer does.
        </p>

        <h2>What&rsquo;s available today</h2>
        <ul>
          <li>
            <a href={TAPE_CHECK}>A free tape check</a>{' '}that runs entirely in your browser. Your loan tape
            never leaves your machine.
          </li>
          <li>
            <a href={DESIGN_PARTNERS}>A design-partner program</a>{' '}for sellers with a loan sale in the next
            two quarters: hands-on setup of your buyer&rsquo;s criteria on a real pool, free.
          </li>
        </ul>
        <div className="pp-ctas">
          <a className="pp-btn pp-btn-primary" href={DESIGN_PARTNERS}>
            Become a design partner
          </a>
        </div>

        <p className="pp-note">
          ProvenPool is in development. The free tape check is a screening aid, not third-party due
          diligence. Questions? Email <a href="mailto:isaac@reportraven.tech">isaac@reportraven.tech</a>.
        </p>
      </div>
    </SiteShell>
  );
}
