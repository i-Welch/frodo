import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';

export const metadata: Metadata = {
  title: 'About',
  description:
    'RAVEN (Real-time Aggregation and Verification Engine) is borrower verification and digital account opening software for community banks, founded by Isaac Welch in Greenville, South Carolina.',
  alternates: { canonical: 'https://reportraven.tech/about' },
  openGraph: {
    title: 'About RAVEN',
    description:
      'Borrower verification and digital account opening software for community banks. Who builds RAVEN, why it exists, and what it is (and is not).',
    url: 'https://reportraven.tech/about',
    siteName: 'RAVEN',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': 'https://reportraven.tech/about',
      url: 'https://reportraven.tech/about',
      name: 'About RAVEN',
      mainEntity: { '@id': 'https://reportraven.tech/#organization' },
    },
    {
      '@type': 'Organization',
      '@id': 'https://reportraven.tech/#organization',
      name: 'RAVEN',
      legalName: 'RAVEN (Real-time Aggregation and Verification Engine)',
      url: 'https://reportraven.tech',
      logo: 'https://reportraven.tech/raven-icon.svg',
      description:
        'RAVEN provides borrower verification and digital account opening software for community and regional banks. One link delivers identity, income, employment, and property data in minutes.',
      founder: { '@id': 'https://reportraven.tech/about#founder' },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'isaac@reportraven.tech',
        telephone: '+1-229-379-6131',
      },
      areaServed: [
        { '@type': 'State', name: 'South Carolina' },
        { '@type': 'Country', name: 'United States' },
      ],
    },
    {
      '@type': 'Person',
      '@id': 'https://reportraven.tech/about#founder',
      name: 'Isaac Welch',
      jobTitle: 'Founder',
      worksFor: { '@id': 'https://reportraven.tech/#organization' },
      url: 'https://reportraven.tech/about',
      email: 'isaac@reportraven.tech',
      sameAs: [
        'https://www.linkedin.com/in/isaac-welch-22a463179',
        'https://github.com/i-Welch',
      ],
      homeLocation: { '@type': 'Place', name: 'Greenville, South Carolina' },
      knowsAbout: [
        'Borrower verification',
        'Consumer lending infrastructure',
        'Digital account opening',
        'Fraud prevention',
        'Community banking',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reportraven.tech' },
        { '@type': 'ListItem', position: 2, name: 'About', item: 'https://reportraven.tech/about' },
      ],
    },
  ],
};

const styles = `
  .about-page { max-width: 720px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
  .about-eyebrow { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; }
  .about-page h1 { font-size: 2.2rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1.25rem; }
  .about-page h2 { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.01em; margin: 2.5rem 0 0.9rem; }
  .about-page p { font-size: 0.98rem; line-height: 1.75; color: var(--gray-300); margin-bottom: 1rem; }
  .about-page ul { margin: 0 0 1rem 1.2rem; }
  .about-page li { font-size: 0.95rem; line-height: 1.7; color: var(--gray-300); margin-bottom: 0.5rem; }
  .about-page a { color: var(--accent); text-decoration: none; }
  .about-page a:hover { text-decoration: underline; }
  .about-contact { border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 1.5rem; margin-top: 2.5rem; }
  .about-contact p { margin-bottom: 0.4rem; }
`;

export default function AboutPage() {
  return (
    <SiteShell ctaSource="about">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{styles}</style>
      <div className="about-page">
        <div className="about-eyebrow">About</div>
        <h1>About RAVEN</h1>
        <p>
          RAVEN (Real-time Aggregation and Verification Engine) is borrower verification and digital
          account opening software for community and regional banks. A loan officer or account-opening
          flow sends one link. The applicant connects their accounts in about five minutes. RAVEN
          returns identity, income, employment, and property data cross-referenced from seven
          providers, with a timestamped audit trail for examiners.
        </p>

        <h2>Why RAVEN exists</h2>
        <p>
          Community banks lose loans and deposits at the intake step. The traditional process
          collects documents and phone calls over weeks; applicants who are used to fintech-grade
          onboarding abandon it. The banks that did move intake online often did it by accepting
          whatever the applicant typed, and more than one bank turned digital account opening off
          entirely after a fraud wave.
        </p>
        <p>
          RAVEN takes the position that the fix is verification at the source: identity checked
          against authoritative records, income and employment pulled from payroll and bank systems,
          property data from public records, all in one borrower interaction. The bank keeps its
          core and its loan origination system. RAVEN replaces the document chase in front of them.
        </p>

        <h2>Who builds it</h2>
        <p>
          RAVEN was founded by Isaac Welch, a software engineer based in Greenville, South Carolina,
          who has spent more than eight years building consumer lending infrastructure: borrower
          verification, underwriting decisioning, payments, and compliance systems used in regulated
          production environments. RAVEN is the verification layer he kept rebuilding for lenders,
          packaged for the community banks that fintech vendors skip.
        </p>
        <p>
          RAVEN also publishes original research: FDIC call-report deep dives on Southeast community
          banks, and the <a href="/de-novo-watch">De Novo Watch</a> series tracking newly chartered
          banks and their technology choices.
        </p>

        <h2>The name</h2>
        <p>
          RAVEN stands for Real-time Aggregation and Verification Engine. The product lives at
          reportraven.tech. RAVEN is not affiliated with RavenPack (financial news analytics), Raven
          Industries (agriculture technology), RavenDB (database software), or Raven Software (game
          studio).
        </p>

        <h2>What RAVEN is not</h2>
        <ul>
          <li>Not a loan origination system or core banking replacement. RAVEN layers on top of both.</li>
          <li>Not a marketplace or aggregator that competes with the bank for the customer.</li>
          <li>Not blockchain-based and not crypto-related.</li>
          <li>Not mortgage-only. RAVEN verifies for mortgage, HELOC, CRE, small business, consumer lending, and deposit account opening.</li>
        </ul>

        <h2>The provider stack</h2>
        <ul>
          <li>Identity and KYC: Socure RiskOS (identity validation, fraud scoring, synthetic identity detection, watchlist screening)</li>
          <li>Income and assets: Plaid (bank-connected income, transactions, balances, liabilities)</li>
          <li>Employment: Truework (employer-verified salary, title, dates, status)</li>
          <li>Property: Melissa and ATTOM dual AVM (valuation, tax, comparables, ownership)</li>
          <li>Contact: FullContact (cross-referenced email, phone, demographics)</li>
        </ul>
        <p>
          See <a href="/integrations">all integrations</a>, including the core banking systems and
          loan origination systems RAVEN works alongside.
        </p>

        <div className="about-contact">
          <h2 style={{ marginTop: 0 }}>Contact</h2>
          <p>Email: <a href="mailto:isaac@reportraven.tech">isaac@reportraven.tech</a></p>
          <p>Phone: <a href="tel:+12293796131">(229) 379-6131</a></p>
          <p>Greenville, South Carolina</p>
        </div>
      </div>
    </SiteShell>
  );
}
