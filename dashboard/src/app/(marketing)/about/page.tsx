import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';
import { LeadCapture } from '../lead-capture';
import { CalendlyButton } from '../calendly-button';
import { FOUNDER, founderJsonLd } from '../founder';
import { SERVICES } from '../services/services-data';
import { DEFAULT_OG_IMAGES } from '@/app/og-default';

export const metadata: Metadata = {
  title: 'About Isaac Welch and RAVEN',
  description:
    'RAVEN is a bank technology consulting practice led by Isaac Welch, who built the banking arm of Upstart and Affirm and has helped traditional banks modernize their stack.',
  alternates: { canonical: 'https://reportraven.tech/about' },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: 'About Isaac Welch and RAVEN',
    description: FOUNDER.headline,
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
      name: 'About Isaac Welch and RAVEN',
      mainEntity: { '@id': 'https://reportraven.tech/about#founder' },
    },
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': 'https://reportraven.tech/#organization',
      name: 'RAVEN',
      legalName: 'RAVEN (Real-time Aggregation and Verification Engine)',
      url: 'https://reportraven.tech',
      logo: 'https://reportraven.tech/raven-icon.svg',
      description: FOUNDER.headline,
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
    { ...founderJsonLd(), worksFor: { '@id': 'https://reportraven.tech/#organization' } },
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
  .about-lede { font-size: 1.1rem !important; color: var(--gray-200) !important; }
  .about-page ul { margin: 0 0 1rem 1.2rem; }
  .about-page li { font-size: 0.95rem; line-height: 1.7; color: var(--gray-300); margin-bottom: 0.5rem; }
  .about-page a { color: var(--accent); text-decoration: none; }
  .about-page a:hover { text-decoration: underline; }
  .about-experience { display: flex; flex-wrap: wrap; gap: 0.5rem; list-style: none; margin: 1.25rem 0 0 !important; padding: 0; }
  .about-experience li { font-size: 0.8rem !important; color: var(--gray-200) !important; border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; padding: 0.3rem 0.8rem; margin: 0 !important; }
  .about-cta { margin: 1.75rem 0 0.5rem; }
  .about-btn { font-family: var(--font-dm-sans), 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600; padding: 0.85rem 1.75rem; border-radius: 8px; border: none; background: var(--accent); color: var(--white); cursor: pointer; transition: opacity 200ms; }
  .about-btn:hover { opacity: 0.85; }
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
        <h1>Isaac Welch and RAVEN</h1>
        <p className="about-lede">{FOUNDER.headline}</p>

        <h2>Who you work with</h2>
        {FOUNDER.bio.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <ul className="about-experience" aria-label="Experience">
          {FOUNDER.experience.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <div className="about-cta">
          <CalendlyButton source="about-hero" label="Book a call" buttonClassName="about-btn" />
        </div>

        <h2>What RAVEN does</h2>
        <p>
          RAVEN helps new banks and community banks with their technology, from the first vendor
          decision after conditional approval to the next IT exam. See all{' '}
          <a href="/services">services</a>:
        </p>
        <ul>
          {SERVICES.map((s) => (
            <li key={s.slug}>
              <a href={`/services/${s.slug}`}>{s.navLabel}</a>
            </li>
          ))}
        </ul>

        <h2>The software</h2>
        <p>
          RAVEN started as software, and the software is still available. Its borrower verification
          product sends one link to the applicant and returns identity, income, employment and
          property data with a timestamped audit trail for examiners. It works alongside the
          bank&rsquo;s existing core and loan origination system. See the{' '}
          <a href="/solutions">verification solutions</a> and the{' '}
          <a href="/integrations">systems it works alongside</a>.
        </p>

        <h2>The research</h2>
        <p>
          RAVEN publishes free research from public filings: <a href="/de-novo-watch">De Novo Watch</a>{' '}
          tracks every new bank filing, approval and opening; the{' '}
          <a href="/bank-snapshot">Bank Peer Snapshot</a> and{' '}
          <a href="/bank-rankings">state rankings</a> compare banks on FDIC call report data; and the{' '}
          <a href="/blog">blog</a> runs deep dives on Southeast community banks.
        </p>

        <h2>The name</h2>
        <p>
          RAVEN stands for Real-time Aggregation and Verification Engine, the name of the software it
          began with. It lives at reportraven.tech. RAVEN is not affiliated with RavenPack (financial
          news analytics), Raven Industries (agriculture technology), RavenDB (database software), or
          Raven Software (game studio).
        </p>

        <div className="about-contact">
          <h2 style={{ marginTop: 0 }}>Contact</h2>
          <p>Email: <a href={`mailto:${FOUNDER.email}`}>{FOUNDER.email}</a></p>
          <p>Phone: <a href="tel:+12293796131">(229) 379-6131</a></p>
          <p>{FOUNDER.location}</p>
        </div>

        <LeadCapture variant="audit" source="about" title="Not ready for a call? Start with a free audit." />
      </div>
    </SiteShell>
  );
}
