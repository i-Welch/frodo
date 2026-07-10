import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';
import { GLOSSARY_TERMS, type GlossaryTerm } from './glossary-data';

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

// Topical chip per term; presentational only, so it lives here not in the data.
const TOPICS: Record<string, { label: string; tone: 'fraud' | 'reg' | 'verif' }> = {
  'first-party-fraud': { label: 'Fraud', tone: 'fraud' },
  'bust-out-fraud': { label: 'Fraud', tone: 'fraud' },
  'new-account-fraud': { label: 'Fraud', tone: 'fraud' },
  'synthetic-identity-fraud': { label: 'Fraud', tone: 'fraud' },
  'customer-identification-program': { label: 'Regulatory', tone: 'reg' },
  'ecbsv': { label: 'Regulatory', tone: 'reg' },
  'de-novo-bank': { label: 'Regulatory', tone: 'reg' },
  'verification-of-deposit': { label: 'Verification', tone: 'verif' },
  'verification-of-employment': { label: 'Verification', tone: 'verif' },
  'verification-of-mortgage': { label: 'Verification', tone: 'verif' },
  'verification-of-income-and-assets': { label: 'Verification', tone: 'verif' },
  'asset-verification': { label: 'Verification', tone: 'verif' },
  'income-verification': { label: 'Verification', tone: 'verif' },
  'bank-account-verification': { label: 'Verification', tone: 'verif' },
};

function firstSentence(text: string): string {
  const i = text.indexOf('. ');
  return i > 40 ? text.slice(0, i + 1) : text;
}

export default function GlossaryIndex() {
  // Alphabetical groups, dictionary-style
  const groups = new Map<string, GlossaryTerm[]>();
  const sorted = [...GLOSSARY_TERMS].sort((a, b) => a.term.localeCompare(b.term));
  for (const t of sorted) {
    const letter = t.term[0].toUpperCase();
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(t);
  }
  const letters = [...groups.keys()];
  let row = 0;

  return (
    <SiteShell ctaSource="glossary-index">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{styles}</style>
      <div className="gdx">
        <header className="gdx-head">
          <div className="gdx-kicker">
            <span className="gdx-kicker-rule" aria-hidden="true" />
            Reference
            <span className="gdx-kicker-rule" aria-hidden="true" />
          </div>
          <h1>
            The Verification
            <br />
            <em>Lexicon</em>
          </h1>
          <p className="gdx-sub">
            Every term that shows up in a loan file or an exam, defined in plain English:
            what it means, how the traditional process works, and what the modern version
            looks like. {GLOSSARY_TERMS.length} entries and counting.
          </p>
        </header>

        <div className="gdx-layout">
          <nav className="gdx-rail" aria-label="Jump to letter">
            {letters.map((l) => (
              <a key={l} href={`#letter-${l}`}>{l}</a>
            ))}
          </nav>

          <div className="gdx-book">
            {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`} className="gdx-group">
              <div className="gdx-ghost" aria-hidden="true">{letter}</div>
              <div className="gdx-entries">
                {groups.get(letter)!.map((t) => {
                  const topic = TOPICS[t.slug];
                  row += 1;
                  return (
                    <a
                      key={t.slug}
                      href={`/glossary/${t.slug}`}
                      className="gdx-entry"
                      style={{ animationDelay: `${Math.min(row * 55, 660)}ms` }}
                    >
                      <div className="gdx-entry-head">
                        <span className="gdx-term">
                          {t.term}
                          {t.abbreviation && <span className="gdx-abbr">{t.abbreviation}</span>}
                        </span>
                        {topic && <span className={`gdx-topic gdx-topic-${topic.tone}`}>{topic.label}</span>}
                      </div>
                      <p className="gdx-def">{firstSentence(t.definition)}</p>
                      <span className="gdx-goto" aria-hidden="true">
                        Read entry
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&display=swap');

  .gdx { max-width: 960px; margin: 0 auto; padding: 4.5rem 1.5rem 6rem; }

  /* Header */
  .gdx-head { text-align: center; margin-bottom: 3rem; }
  .gdx-kicker { display: inline-flex; align-items: center; gap: 1rem; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.32em; text-transform: uppercase; color: var(--accent); margin-bottom: 1.75rem; }
  .gdx-kicker-rule { display: inline-block; width: 42px; height: 1px; background: var(--accent-border); }
  .gdx-head h1 { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(2.8rem, 7vw, 4.4rem); line-height: 1.04; letter-spacing: -0.02em; }
  .gdx-head h1 em { font-style: italic; color: var(--accent); font-weight: 300; }
  .gdx-sub { font-size: 1rem; color: var(--gray-400); line-height: 1.75; max-width: 540px; margin: 1.75rem auto 0; }

  /* Two-column layout: sticky letter rail + book */
  .gdx-layout { display: grid; grid-template-columns: 52px 1fr; gap: 2rem; align-items: start; }
  .gdx-rail { position: sticky; top: 7rem; display: flex; flex-direction: column; align-items: center; gap: 0.1rem; padding: 0.55rem 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; background: rgba(255,255,255,0.02); }
  .gdx-rail a { font-family: 'Fraunces', serif; font-style: italic; font-size: 0.88rem; color: var(--gray-500); text-decoration: none; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; transition: color 180ms, background 180ms; }
  .gdx-rail a:hover { color: var(--accent); background: var(--accent-dim); }

  /* Groups: ghost letter + entries */
  .gdx-group { position: relative; display: grid; grid-template-columns: 110px 1fr; gap: 1.5rem; padding: 2.25rem 0 1rem; scroll-margin-top: 9rem; }
  .gdx-group + .gdx-group { border-top: 1px solid rgba(255,255,255,0.06); }
  .gdx-ghost { font-family: 'Fraunces', serif; font-style: italic; font-weight: 300; font-size: 6rem; line-height: 0.9; color: transparent; -webkit-text-stroke: 1px rgba(108,142,255,0.38); position: sticky; top: 9rem; align-self: start; user-select: none; }

  /* Entries: typographic rows, not cards */
  .gdx-entries { display: flex; flex-direction: column; }
  .gdx-entry { display: block; padding: 1.4rem 0.75rem 1.4rem 0; text-decoration: none; color: inherit; border-bottom: 1px dashed rgba(255,255,255,0.09); position: relative; opacity: 0; animation: gdxIn 560ms cubic-bezier(0.22,1,0.36,1) forwards; transition: padding-left 240ms cubic-bezier(0.22,1,0.36,1); }
  .gdx-entry:last-child { border-bottom: none; }
  .gdx-entry::before { content: ''; position: absolute; left: -1.5rem; top: 1.7rem; width: 0; height: 2px; background: var(--accent); transition: width 240ms cubic-bezier(0.22,1,0.36,1); }
  .gdx-entry:hover { padding-left: 0.9rem; }
  .gdx-entry:hover::before { width: 1.6rem; }
  @keyframes gdxIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .gdx-entry { animation: none; opacity: 1; } }

  .gdx-entry-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-bottom: 0.45rem; }
  .gdx-term { font-size: 1.35rem; font-weight: 600; letter-spacing: -0.015em; color: var(--white); }
  .gdx-abbr { font-family: 'Fraunces', serif; font-style: italic; font-weight: 400; font-size: 0.95rem; color: var(--accent); margin-left: 0.65rem; }
  .gdx-topic { flex-shrink: 0; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 0.22rem 0.6rem; border-radius: 999px; }
  .gdx-topic-fraud { color: #fca5a5; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.22); }
  .gdx-topic-reg { color: #fcd34d; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.22); }
  .gdx-topic-verif { color: var(--accent); background: var(--accent-dim); border: 1px solid var(--accent-border); }

  .gdx-def { font-family: 'Fraunces', serif; font-style: italic; font-weight: 300; font-size: 1.02rem; line-height: 1.65; color: var(--gray-400); max-width: 620px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .gdx-goto { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 0.7rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-600); opacity: 0; transform: translateX(-4px); transition: opacity 220ms, transform 220ms, color 220ms; }
  .gdx-entry:hover .gdx-goto { opacity: 1; transform: none; color: var(--accent); }

  @media (max-width: 900px) {
    .gdx-layout { grid-template-columns: 1fr; }
    .gdx-rail { display: none; }
  }
  @media (max-width: 700px) {
    .gdx { padding: 3rem 1.1rem 4rem; }
    .gdx-head { margin-bottom: 2rem; }
    .gdx-group { grid-template-columns: 1fr; gap: 0.25rem; padding-top: 1.75rem; }
    .gdx-ghost { position: static; font-size: 3rem; line-height: 1; }
    .gdx-entry { padding: 1.15rem 0.5rem 1.15rem 0; }
    .gdx-term { font-size: 1.15rem; }
    .gdx-def { font-size: 0.95rem; }
    .gdx-entry-head { flex-direction: column; align-items: flex-start; gap: 0.45rem; }
    .gdx-entry:hover { padding-left: 0; }
    .gdx-goto { display: none; }
  }
`;
