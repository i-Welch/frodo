import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '../../site-shell';
import { CalendlyButton } from '../../calendly-button';
import { SOLUTIONS, getSolution } from '../solutions-data';

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) return { title: 'Not Found' };
  return {
    title: `${solution.metaTitle} | RAVEN`,
    description: solution.metaDescription,
    alternates: { canonical: `https://reportraven.tech/solutions/${slug}` },
    openGraph: {
      title: solution.metaTitle,
      description: solution.metaDescription,
      url: `https://reportraven.tech/solutions/${slug}`,
      siteName: 'RAVEN',
      type: 'website',
    },
  };
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: solution.metaTitle,
        description: solution.metaDescription,
        url: `https://reportraven.tech/solutions/${slug}`,
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
        mainEntity: solution.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reportraven.tech' },
          { '@type': 'ListItem', position: 2, name: 'Solutions', item: 'https://reportraven.tech/solutions' },
          { '@type': 'ListItem', position: 3, name: solution.metaTitle, item: `https://reportraven.tech/solutions/${slug}` },
        ],
      },
    ],
  };

  return (
    <SiteShell ctaSource={`solutions:${slug}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{styles}</style>
      <div className="sol-page">
        <div className="sol-crumb">
          <a href="/solutions">Solutions</a>
          <span aria-hidden="true">/</span>
          <span>{solution.eyebrow}</span>
        </div>

        <h1>{solution.h1}</h1>

        <div className="sol-intro">
          {solution.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="sol-hero-cta">
          <CalendlyButton source={`solutions:${slug}:hero`} label="Book a Demo" buttonClassName="sol-btn-primary" />
          <a href="/blog/one-link-complete-verification" className="sol-btn-secondary">
            How RAVEN works
          </a>
        </div>

        {solution.sections.map((s) => (
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

        <section className="sol-faq">
          <h2>Frequently asked questions</h2>
          {solution.faqs.map((f) => (
            <div className="sol-faq-item" key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        <div className="sol-related">
          <div className="sol-related-col">
            <h2>Glossary</h2>
            <ul>
              {solution.relatedGlossary.map((g) => (
                <li key={g.slug}>
                  <a href={`/glossary/${g.slug}`}>{g.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="sol-related-col">
            <h2>From the blog</h2>
            <ul>
              {solution.relatedArticles.map((a) => (
                <li key={a.slug}>
                  <a href={`/blog/${a.slug}`}>{a.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

const styles = `
  .sol-page { max-width: 760px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
  .sol-crumb { display: flex; gap: 0.6rem; font-size: 0.8rem; color: var(--gray-500); margin-bottom: 1.75rem; }
  .sol-crumb a { color: var(--gray-400); text-decoration: none; }
  .sol-crumb a:hover { color: var(--white); }
  .sol-page h1 { font-size: clamp(2rem, 4.2vw, 2.8rem); font-weight: 700; letter-spacing: -0.028em; line-height: 1.12; margin-bottom: 1.5rem; }
  .sol-intro p { font-size: 1.08rem; line-height: 1.8; color: var(--gray-300); margin-bottom: 1.1rem; }
  .sol-hero-cta { display: flex; gap: 1rem; align-items: center; margin: 2rem 0 3rem; flex-wrap: wrap; }
  .sol-btn-primary { font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600; padding: 0.85rem 1.75rem; border-radius: 8px; border: none; background: var(--accent); color: var(--white); cursor: pointer; transition: opacity 200ms; }
  .sol-btn-primary:hover { opacity: 0.85; }
  .sol-btn-secondary { font-size: 0.9rem; color: var(--gray-300); text-decoration: none; padding: 0.85rem 1.4rem; border: 1px solid rgba(255,255,255,0.18); border-radius: 8px; transition: border-color 200ms, color 200ms; }
  .sol-btn-secondary:hover { border-color: rgba(255,255,255,0.4); color: var(--white); }
  .sol-page section { margin-bottom: 2.5rem; }
  .sol-page h2 { font-size: 1.4rem; font-weight: 600; letter-spacing: -0.015em; margin-bottom: 0.9rem; }
  .sol-page section p { font-size: 0.98rem; line-height: 1.8; color: var(--gray-300); margin-bottom: 1rem; }
  .sol-page section ul { list-style: none; padding: 0; margin: 1.25rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
  .sol-page section li { font-size: 0.93rem; line-height: 1.65; color: var(--gray-200); padding: 0.85rem 1.15rem 0.85rem 2.6rem; position: relative; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.015); }
  .sol-page section li:last-child { border-bottom: none; }
  .sol-page section li::before { content: ''; position: absolute; left: 1.1rem; top: 1.25rem; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }
  .sol-faq { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2.25rem; }
  .sol-faq-item { margin-bottom: 1.6rem; }
  .sol-faq-item h3 { font-size: 1.02rem; font-weight: 600; color: #F5F5F5; margin-bottom: 0.45rem; }
  .sol-faq-item p { font-size: 0.92rem; line-height: 1.75; color: var(--gray-400); }
  .sol-related { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2rem; }
  .sol-related h2 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gray-500); margin-bottom: 0.85rem; font-weight: 600; }
  .sol-related ul { list-style: none; padding: 0; }
  .sol-related li { margin-bottom: 0.55rem; }
  .sol-related a { color: var(--gray-300); text-decoration: none; font-size: 0.92rem; line-height: 1.5; transition: color 200ms; }
  .sol-related a:hover { color: var(--white); }
  @media (max-width: 640px) {
    .sol-page { padding: 2.5rem 1.1rem 3rem; }
    .sol-related { grid-template-columns: 1fr; }
  }
`;
