import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';
import { GLOSSARY_TERMS } from './glossary-data';

export const metadata: Metadata = {
  title: 'Lending Verification Glossary',
  description:
    'Plain-English definitions of borrower verification terms: VOD, VOE, VOM, asset verification, income verification, synthetic identity fraud, and more.',
  alternates: { canonical: 'https://reportraven.tech/glossary' },
  openGraph: {
    title: 'Lending Verification Glossary',
    description:
      'Plain-English definitions of borrower verification terms, from VOD and VOE to synthetic identity fraud.',
    url: 'https://reportraven.tech/glossary',
    siteName: 'RAVEN',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  name: 'RAVEN Lending Verification Glossary',
  url: 'https://reportraven.tech/glossary',
  hasDefinedTerm: GLOSSARY_TERMS.map((t) => ({
    '@type': 'DefinedTerm',
    name: t.term,
    ...(t.abbreviation ? { alternateName: t.abbreviation } : {}),
    url: `https://reportraven.tech/glossary/${t.slug}`,
  })),
};

export default function GlossaryIndex() {
  return (
    <SiteShell ctaSource="glossary-index">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`
        .glosx { max-width: 900px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
        .glosx-tag { display: inline-block; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; }
        .glosx h1 { font-size: clamp(2rem, 4vw, 2.7rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1.12; margin-bottom: 1rem; }
        .glosx-sub { font-size: 1.02rem; color: var(--gray-400); line-height: 1.7; max-width: 620px; margin-bottom: 3rem; }
        .glosx-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; }
        .glosx-card { background: var(--black); padding: 1.75rem; text-decoration: none; color: inherit; transition: background 200ms; display: flex; flex-direction: column; }
        .glosx-card:hover { background: rgba(255,255,255,0.025); }
        .glosx-card-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem; flex-wrap: wrap; }
        .glosx-card h2 { font-size: 1.05rem; font-weight: 600; letter-spacing: -0.01em; color: var(--white); }
        .glosx-abbr { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; color: var(--accent); background: var(--accent-dim); border: 1px solid var(--accent-border); border-radius: 6px; padding: 0.15rem 0.45rem; }
        .glosx-card p { font-size: 0.85rem; color: var(--gray-500); line-height: 1.65; }
        @media (max-width: 640px) {
          .glosx { padding: 2.5rem 1.1rem 3rem; }
          .glosx-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="glosx">
        <div className="glosx-tag">Glossary</div>
        <h1>Lending verification, defined</h1>
        <p className="glosx-sub">
          Plain-English definitions of the verification terms that show up in every loan file:
          what they mean, how the traditional process works, and what the modern version looks like.
        </p>
        <div className="glosx-grid">
          {GLOSSARY_TERMS.map((t) => (
            <a key={t.slug} href={`/glossary/${t.slug}`} className="glosx-card">
              <div className="glosx-card-head">
                <h2>{t.term}</h2>
                {t.abbreviation && <span className="glosx-abbr">{t.abbreviation}</span>}
              </div>
              <p>{t.metaDescription}</p>
            </a>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
