import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '../../site-shell';
import { CalendlyButton } from '../../calendly-button';
import { GLOSSARY_TERMS, getGlossaryTerm } from '../glossary-data';

export function generateStaticParams() {
  return GLOSSARY_TERMS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return { title: 'Term Not Found' };
  return {
    title: term.metaTitle,
    description: term.metaDescription,
    alternates: { canonical: `https://reportraven.tech/glossary/${slug}` },
    openGraph: {
      title: term.metaTitle,
      description: term.metaDescription,
      url: `https://reportraven.tech/glossary/${slug}`,
      siteName: 'RAVEN',
      type: 'article',
    },
  };
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        '@id': `https://reportraven.tech/glossary/${slug}#term`,
        name: term.term,
        ...(term.abbreviation ? { alternateName: term.abbreviation } : {}),
        description: term.definition,
        url: `https://reportraven.tech/glossary/${slug}`,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'RAVEN Lending Verification Glossary',
          url: 'https://reportraven.tech/glossary',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: term.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reportraven.tech' },
          { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://reportraven.tech/glossary' },
          { '@type': 'ListItem', position: 3, name: term.term, item: `https://reportraven.tech/glossary/${slug}` },
        ],
      },
    ],
  };

  const related = term.relatedTerms
    .map((s) => getGlossaryTerm(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <SiteShell ctaSource={`glossary:${slug}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{styles}</style>
      <div className="glos-page">
        <div className="glos-crumb">
          <a href="/glossary">Glossary</a>
          <span aria-hidden="true">/</span>
          <span>{term.term}</span>
        </div>

        <h1>
          {term.term}
          {term.abbreviation && <span className="glos-abbr">{term.abbreviation}</span>}
        </h1>

        <p className="glos-definition">{term.definition}</p>

        {term.sections.map((s) => (
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

        <section className="glos-faq">
          <h2>Common questions</h2>
          {term.faqs.map((f) => (
            <div className="glos-faq-item" key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        {term.relatedSolution && (
          <div className="glos-solution-cta">
            <div>
              <div className="glos-solution-label">How RAVEN handles this</div>
              <a href={`/solutions/${term.relatedSolution.slug}`}>{term.relatedSolution.label} &rarr;</a>
            </div>
            <CalendlyButton source={`glossary:${slug}`} label="Book a Demo" buttonClassName="glos-cta-btn" />
          </div>
        )}

        <div className="glos-related">
          {related.length > 0 && (
            <div className="glos-related-col">
              <h2>Related terms</h2>
              <ul>
                {related.map((t) => (
                  <li key={t.slug}>
                    <a href={`/glossary/${t.slug}`}>{t.term}{t.abbreviation ? ` (${t.abbreviation})` : ''}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {term.relatedArticles.length > 0 && (
            <div className="glos-related-col">
              <h2>From the blog</h2>
              <ul>
                {term.relatedArticles.map((a) => (
                  <li key={a.slug}>
                    <a href={`/blog/${a.slug}`}>{a.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}

const styles = `
  .glos-page { max-width: 760px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
  .glos-crumb { display: flex; gap: 0.6rem; font-size: 0.8rem; color: var(--gray-500); margin-bottom: 1.75rem; }
  .glos-crumb a { color: var(--gray-400); text-decoration: none; }
  .glos-crumb a:hover { color: var(--white); }
  .glos-page h1 { font-size: clamp(1.9rem, 4vw, 2.6rem); font-weight: 700; letter-spacing: -0.025em; line-height: 1.15; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.9rem; flex-wrap: wrap; }
  .glos-abbr { font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; color: var(--accent); background: var(--accent-dim); border: 1px solid var(--accent-border); border-radius: 8px; padding: 0.3rem 0.7rem; }
  .glos-definition { font-size: 1.15rem; line-height: 1.75; color: var(--gray-200); padding: 1.5rem 1.75rem; border-left: 3px solid var(--accent); background: rgba(108,142,255,0.05); border-radius: 0 12px 12px 0; margin-bottom: 2.5rem; }
  .glos-page section { margin-bottom: 2.25rem; }
  .glos-page h2 { font-size: 1.35rem; font-weight: 600; letter-spacing: -0.015em; margin-bottom: 0.85rem; }
  .glos-page section p { font-size: 0.98rem; line-height: 1.8; color: var(--gray-300); margin-bottom: 1rem; }
  .glos-page section ul { padding-left: 1.4rem; margin-bottom: 1rem; }
  .glos-page section li { font-size: 0.95rem; line-height: 1.8; color: var(--gray-300); margin-bottom: 0.35rem; }
  .glos-faq { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2rem; }
  .glos-faq-item { margin-bottom: 1.5rem; }
  .glos-faq-item h3 { font-size: 1rem; font-weight: 600; color: var(--gray-100, #F5F5F5); margin-bottom: 0.4rem; }
  .glos-faq-item p { font-size: 0.92rem; line-height: 1.75; color: var(--gray-400); }
  .glos-solution-cta { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap; border: 1px solid var(--accent-border); background: rgba(108,142,255,0.05); border-radius: 14px; padding: 1.5rem 1.75rem; margin: 2.5rem 0; }
  .glos-solution-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gray-500); margin-bottom: 0.35rem; }
  .glos-solution-cta a { color: var(--accent); font-weight: 600; text-decoration: none; font-size: 1rem; }
  .glos-cta-btn { font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500; padding: 0.7rem 1.3rem; border-radius: 8px; border: none; background: var(--white); color: var(--black); cursor: pointer; transition: opacity 200ms; white-space: nowrap; }
  .glos-cta-btn:hover { opacity: 0.85; }
  .glos-related { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2rem; }
  .glos-related h2 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gray-500); margin-bottom: 0.85rem; font-weight: 600; }
  .glos-related ul { list-style: none; padding: 0; }
  .glos-related li { margin-bottom: 0.55rem; }
  .glos-related a { color: var(--gray-300); text-decoration: none; font-size: 0.92rem; line-height: 1.5; transition: color 200ms; }
  .glos-related a:hover { color: var(--white); }
  @media (max-width: 640px) {
    .glos-page { padding: 2.5rem 1.1rem 3rem; }
    .glos-related { grid-template-columns: 1fr; }
  }
`;
