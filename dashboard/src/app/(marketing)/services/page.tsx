import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';
import { CalendlyButton } from '../calendly-button';
import { SERVICES, ENGAGEMENT_STEPS } from './services-data';
import { FOUNDER } from '../founder';
import { DEFAULT_OG_IMAGES } from '@/app/og-default';

const SITE = 'https://reportraven.tech';

export const metadata: Metadata = {
  title: 'Bank Technology Consulting Services',
  description:
    'Technology consulting for new and community banks: de novo setup, core and LOS integration, AI governance, security readiness, fintech partnerships, and verification software.',
  alternates: { canonical: `${SITE}/services` },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: 'RAVEN Bank Technology Consulting Services',
    description:
      'De novo setup, core and LOS integration, AI governance, security readiness, fintech partnerships and verification software, from someone who built the banking arm of Upstart and Affirm.',
    url: `${SITE}/services`,
    siteName: 'RAVEN',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'RAVEN Bank Technology Consulting Services',
  url: `${SITE}/services`,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: SERVICES.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.h1,
      url: `${SITE}/services/${s.slug}`,
    })),
  },
};

export default function ServicesIndex() {
  return (
    <SiteShell ctaSource="services-index">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{styles}</style>
      <div className="svcx">
        <div className="svcx-tag">Services</div>
        <h1>Technology help for new and community banks</h1>
        <p className="svcx-sub">{FOUNDER.headline}</p>

        <div className="svcx-grid">
          {SERVICES.map((s) => (
            <a key={s.slug} href={`/services/${s.slug}`} className="svcx-card">
              <div className="svcx-eyebrow">{s.eyebrow}</div>
              <h2>{s.navLabel}</h2>
              <p>{s.metaDescription}</p>
              <span className="svcx-read">Learn more &rarr;</span>
            </a>
          ))}
        </div>

        <section className="svcx-steps">
          <h2>How an engagement works</h2>
          <ol>
            {ENGAGEMENT_STEPS.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <CalendlyButton source="services-index" label="Book a call" buttonClassName="svcx-btn" />
        </section>
      </div>
    </SiteShell>
  );
}

const styles = `
  .svcx { max-width: 900px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
  .svcx-tag { display: inline-block; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; }
  .svcx h1 { font-size: clamp(2rem, 4vw, 2.7rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1.12; margin-bottom: 1rem; }
  .svcx-sub { font-size: 1.02rem; color: var(--gray-400); line-height: 1.7; max-width: 680px; margin-bottom: 3rem; }
  .svcx-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; }
  .svcx-card { background: var(--black); padding: 2rem 1.75rem; text-decoration: none; color: inherit; transition: background 200ms; display: flex; flex-direction: column; border-top: 3px solid transparent; }
  .svcx-card:hover { background: rgba(255,255,255,0.025); border-top-color: var(--accent); }
  .svcx-eyebrow { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--accent); margin-bottom: 0.7rem; }
  .svcx-card h2 { font-size: 1.1rem; font-weight: 600; letter-spacing: -0.01em; color: var(--white); line-height: 1.35; margin-bottom: 0.6rem; }
  .svcx-card p { font-size: 0.85rem; color: var(--gray-500); line-height: 1.65; flex: 1; }
  .svcx-read { margin-top: 1.1rem; font-size: 0.8rem; font-weight: 500; color: var(--gray-400); transition: color 200ms; }
  .svcx-card:hover .svcx-read { color: var(--white); }
  .svcx-steps { margin-top: 4rem; }
  .svcx-steps h2 { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.015em; margin-bottom: 1.5rem; }
  .svcx-steps ol { list-style: none; padding: 0; counter-reset: step; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
  .svcx-steps li { counter-increment: step; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 1.1rem; }
  .svcx-steps li::before { content: counter(step, decimal-leading-zero); display: block; font-size: 0.75rem; font-weight: 600; color: var(--accent); letter-spacing: 0.1em; margin-bottom: 0.6rem; }
  .svcx-steps h3 { font-size: 1.02rem; font-weight: 600; color: #F5F5F5; margin-bottom: 0.45rem; }
  .svcx-steps p { font-size: 0.9rem; line-height: 1.7; color: var(--gray-400); }
  .svcx-btn { font-family: var(--font-dm-sans), 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600; padding: 0.85rem 1.75rem; border-radius: 8px; border: none; background: var(--accent); color: var(--white); cursor: pointer; transition: opacity 200ms; }
  .svcx-btn:hover { opacity: 0.85; }
  @media (max-width: 640px) {
    .svcx { padding: 2.5rem 1.1rem 3rem; }
    .svcx-grid, .svcx-steps ol { grid-template-columns: 1fr; }
  }
`;
