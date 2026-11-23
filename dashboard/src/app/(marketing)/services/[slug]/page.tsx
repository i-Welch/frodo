import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '../../site-shell';
import { CalendlyButton } from '../../calendly-button';
import { LeadCapture } from '../../lead-capture';
import { SERVICES, getService } from '../services-data';
import { DEFAULT_OG_IMAGES } from '@/app/og-default';

const SITE = 'https://reportraven.tech';

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: 'Not Found' };
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `${SITE}/services/${slug}` },
    openGraph: {
      images: DEFAULT_OG_IMAGES,
      title: service.metaTitle,
      description: service.metaDescription,
      url: `${SITE}/services/${slug}`,
      siteName: 'RAVEN',
      type: 'website',
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: service.h1,
        description: service.metaDescription,
        url: `${SITE}/services/${slug}`,
        provider: { '@id': `${SITE}/#organization` },
        areaServed: 'US',
        audience: { '@type': 'BusinessAudience', name: 'New banks and community banks' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: service.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE}/services` },
          { '@type': 'ListItem', position: 3, name: service.navLabel, item: `${SITE}/services/${slug}` },
        ],
      },
    ],
  };

  return (
    <SiteShell ctaSource={`services:${slug}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{styles}</style>
      <div className="svc-page">
        <div className="svc-crumb">
          <a href="/services">Services</a>
          <span aria-hidden="true">/</span>
          <span>{service.eyebrow}</span>
        </div>

        <h1>{service.h1}</h1>

        <div className="svc-intro">
          {service.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="svc-hero-cta">
          <CalendlyButton source={`services:${slug}:hero`} label="Book a call" buttonClassName="svc-btn-primary" />
          <a href="/about" className="svc-btn-secondary">
            About Isaac
          </a>
        </div>

        {service.sections.map((s) => (
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

        <section className="svc-deliverables">
          <h2>What you walk away with</h2>
          <ul>
            {service.deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>

        <section className="svc-faq">
          <h2>Frequently asked questions</h2>
          {service.faqs.map((f) => (
            <div className="svc-faq-item" key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        {/* Pre-open banks have no call report to audit yet. */}
        {service.showAudit && <LeadCapture variant="audit" source={`services:${slug}`} />}
        {!service.showAudit && (
          <LeadCapture variant="subscribe" source={`services:${slug}`} title="Get De Novo Watch updates by email" />
        )}

        <div className="svc-related">
          <h2>Related</h2>
          <ul>
            {service.related.map((r) => (
              <li key={r.href}>
                <a href={r.href}>{r.label}</a>
              </li>
            ))}
          </ul>
          <p className="svc-all">
            <a href="/services">All services &rarr;</a>
          </p>
        </div>
      </div>
    </SiteShell>
  );
}

const styles = `
  .svc-page { max-width: 760px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
  .svc-crumb { display: flex; gap: 0.6rem; font-size: 0.8rem; color: var(--gray-500); margin-bottom: 1.75rem; }
  .svc-crumb a { color: var(--gray-400); text-decoration: none; }
  .svc-crumb a:hover { color: var(--white); }
  .svc-page h1 { font-size: clamp(2rem, 4.2vw, 2.8rem); font-weight: 700; letter-spacing: -0.028em; line-height: 1.12; margin-bottom: 1.5rem; }
  .svc-intro p { font-size: 1.08rem; line-height: 1.8; color: var(--gray-300); margin-bottom: 1.1rem; }
  .svc-hero-cta { display: flex; gap: 1rem; align-items: center; margin: 2rem 0 3rem; flex-wrap: wrap; }
  .svc-btn-primary { font-family: var(--font-dm-sans), 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600; padding: 0.85rem 1.75rem; border-radius: 8px; border: none; background: var(--accent); color: var(--white); cursor: pointer; transition: opacity 200ms; }
  .svc-btn-primary:hover { opacity: 0.85; }
  .svc-btn-secondary { font-size: 0.9rem; color: var(--gray-300); text-decoration: none; padding: 0.85rem 1.4rem; border: 1px solid rgba(255,255,255,0.18); border-radius: 8px; transition: border-color 200ms, color 200ms; }
  .svc-btn-secondary:hover { border-color: rgba(255,255,255,0.4); color: var(--white); }
  .svc-page section { margin-bottom: 2.5rem; }
  .svc-page h2 { font-size: 1.4rem; font-weight: 600; letter-spacing: -0.015em; margin-bottom: 0.9rem; }
  .svc-page section p { font-size: 0.98rem; line-height: 1.8; color: var(--gray-300); margin-bottom: 1rem; }
  .svc-page section ul { list-style: none; padding: 0; margin: 1.25rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
  .svc-page section li { font-size: 0.93rem; line-height: 1.65; color: var(--gray-200); padding: 0.85rem 1.15rem 0.85rem 2.6rem; position: relative; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.015); }
  .svc-page section li:last-child { border-bottom: none; }
  .svc-page section li::before { content: ''; position: absolute; left: 1.1rem; top: 1.25rem; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }
  .svc-deliverables li::before { border-radius: 2px; }
  .svc-faq { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2.25rem; }
  .svc-faq-item { margin-bottom: 1.6rem; }
  .svc-faq-item h3 { font-size: 1.02rem; font-weight: 600; color: #F5F5F5; margin-bottom: 0.45rem; }
  .svc-faq-item p { font-size: 0.92rem; line-height: 1.75; color: var(--gray-400); }
  .svc-related { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2rem; margin-top: 2rem; }
  .svc-related h2 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gray-500); margin-bottom: 0.85rem; font-weight: 600; }
  .svc-related ul { list-style: none; padding: 0; }
  .svc-related li { margin-bottom: 0.55rem; }
  .svc-related a { color: var(--gray-300); text-decoration: none; font-size: 0.92rem; line-height: 1.5; transition: color 200ms; }
  .svc-related a:hover { color: var(--white); }
  .svc-all { margin-top: 1.25rem; }
  @media (max-width: 640px) {
    .svc-page { padding: 2.5rem 1.1rem 3rem; }
  }
`;
