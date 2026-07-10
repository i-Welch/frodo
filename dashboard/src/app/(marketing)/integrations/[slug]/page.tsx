import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '../../site-shell';
import { CalendlyButton } from '../../calendly-button';
import { INTEGRATIONS, getIntegration } from '../integrations-data';

export function generateStaticParams() {
  return INTEGRATIONS.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const integration = getIntegration(slug);
  if (!integration) return { title: 'Not Found' };
  return {
    title: integration.metaTitle,
    description: integration.metaDescription,
    alternates: { canonical: `https://reportraven.tech/integrations/${slug}` },
    openGraph: {
      title: integration.metaTitle,
      description: integration.metaDescription,
      url: `https://reportraven.tech/integrations/${slug}`,
      siteName: 'RAVEN',
      type: 'website',
    },
  };
}

export default async function IntegrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const integration = getIntegration(slug);
  if (!integration) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: integration.metaTitle,
        description: integration.metaDescription,
        url: `https://reportraven.tech/integrations/${slug}`,
        provider: {
          '@type': 'Organization',
          name: 'RAVEN',
          url: 'https://reportraven.tech',
        },
        areaServed: 'US',
        audience: { '@type': 'BusinessAudience', name: 'Community banks and credit unions' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: integration.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reportraven.tech' },
          { '@type': 'ListItem', position: 2, name: 'Integrations', item: 'https://reportraven.tech/integrations' },
          { '@type': 'ListItem', position: 3, name: integration.name, item: `https://reportraven.tech/integrations/${slug}` },
        ],
      },
    ],
  };

  return (
    <SiteShell ctaSource={`integrations:${slug}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{styles}</style>
      <div className="int-page">
        <div className="int-crumb">
          <a href="/integrations">Integrations</a>
          <span aria-hidden="true">/</span>
          <span>{integration.name}</span>
        </div>

        <div className="int-badge-row">
          <span className="int-eyebrow">{integration.eyebrow}</span>
        </div>

        <h1>{integration.h1}</h1>

        <div className="int-intro">
          {integration.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="int-hero-cta">
          <CalendlyButton source={`integrations:${slug}:hero`} label="Book a Demo" buttonClassName="int-btn-primary" />
          <a href="/integrations" className="int-btn-secondary">
            All integrations
          </a>
        </div>

        {integration.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {s.bullets && (
              <ul>
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="int-faq">
          <h2>Frequently asked questions</h2>
          {integration.faqs.map((f) => (
            <div className="int-faq-item" key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>
      </div>
    </SiteShell>
  );
}

const styles = `
  .int-page { max-width: 760px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
  .int-crumb { display: flex; gap: 0.6rem; font-size: 0.8rem; color: var(--gray-500); margin-bottom: 1.5rem; }
  .int-crumb a { color: var(--gray-400); text-decoration: none; }
  .int-crumb a:hover { color: var(--white); }
  .int-badge-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
  .int-eyebrow { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); }
  .int-page h1 { font-size: clamp(2rem, 4.2vw, 2.8rem); font-weight: 700; letter-spacing: -0.028em; line-height: 1.12; margin-bottom: 1.5rem; }
  .int-intro p { font-size: 1.08rem; line-height: 1.8; color: var(--gray-300); margin-bottom: 1.1rem; }
  .int-hero-cta { display: flex; gap: 1rem; align-items: center; margin: 2rem 0 3rem; flex-wrap: wrap; }
  .int-btn-primary { font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600; padding: 0.85rem 1.75rem; border-radius: 8px; border: none; background: var(--accent); color: var(--white); cursor: pointer; transition: opacity 200ms; }
  .int-btn-primary:hover { opacity: 0.85; }
  .int-btn-secondary { font-size: 0.9rem; color: var(--gray-300); text-decoration: none; padding: 0.85rem 1.4rem; border: 1px solid rgba(255,255,255,0.18); border-radius: 8px; transition: border-color 200ms, color 200ms; }
  .int-btn-secondary:hover { border-color: rgba(255,255,255,0.4); color: var(--white); }
  .int-page section { margin-bottom: 2.5rem; }
  .int-page h2 { font-size: 1.4rem; font-weight: 600; letter-spacing: -0.015em; margin-bottom: 0.9rem; }
  .int-page section p { font-size: 0.98rem; line-height: 1.8; color: var(--gray-300); margin-bottom: 1rem; }
  .int-page section ul { list-style: none; padding: 0; margin: 1.25rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
  .int-page section li { font-size: 0.93rem; line-height: 1.65; color: var(--gray-200); padding: 0.85rem 1.15rem 0.85rem 2.6rem; position: relative; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.015); }
  .int-page section li:last-child { border-bottom: none; }
  .int-page section li::before { content: ''; position: absolute; left: 1.1rem; top: 1.25rem; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }
  .int-faq { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2.25rem; }
  .int-faq-item { margin-bottom: 1.6rem; }
  .int-faq-item h3 { font-size: 1.02rem; font-weight: 600; color: #F5F5F5; margin-bottom: 0.45rem; }
  .int-faq-item p { font-size: 0.92rem; line-height: 1.75; color: var(--gray-400); }
  @media (max-width: 640px) {
    .int-page { padding: 2.5rem 1.1rem 3rem; }
  }
`;
