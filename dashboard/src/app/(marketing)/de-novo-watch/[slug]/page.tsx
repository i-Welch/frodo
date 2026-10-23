import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '../../site-shell';
import { CalendlyButton } from '../../calendly-button';
import { LeadCapture } from '../../lead-capture';
import { articles } from '../../blog/articles-index';
import {
  DE_NOVO_BANKS,
  FDIC_PENDING,
  PROFILED_BANKS,
  STATUS_LABELS,
  deNovoShortName,
  deNovoSlug,
  deNovoState,
  getProfiledBank,
  type DeNovoBank,
} from '../de-novo-data';

const SITE = 'https://reportraven.tech';

function fmtDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function title(b: DeNovoBank): string {
  return `${deNovoShortName(b.name)}: De Novo Bank Status and Timeline`;
}

function description(b: DeNovoBank): string {
  return `${b.name} (${b.location}): ${STATUS_LABELS[b.status].toLowerCase()}. Charter and FDIC timeline, capital, leadership and technology from public filings, verified ${fmtDate(b.asOf)}.`;
}

/** Questions answered from the row itself, so the FAQ never says more than the tracker. */
function faqs(b: DeNovoBank): { q: string; a: string }[] {
  const out = [
    {
      q: `Is ${b.name} open?`,
      a:
        b.status === 'open'
          ? `Yes. ${b.statusDetail}`
          : `Not yet. As of ${fmtDate(b.asOf)}, its status is ${STATUS_LABELS[b.status].toLowerCase()}. ${b.statusDetail}`,
    },
  ];
  if (b.capital) out.push({ q: `How much capital does ${b.name} have?`, a: b.capital });
  if (b.leadership) out.push({ q: `Who leads ${b.name}?`, a: b.leadership });
  return out;
}

export function generateStaticParams() {
  return PROFILED_BANKS.map((b) => ({ slug: deNovoSlug(b.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const bank = getProfiledBank(slug);
  if (!bank) return { title: 'Bank Not Found' };
  const url = `${SITE}/de-novo-watch/${slug}`;
  return {
    title: title(bank),
    description: description(bank),
    alternates: { canonical: url },
    openGraph: { title: title(bank), description: description(bank), url, siteName: 'RAVEN', type: 'article' },
  };
}

export default async function DeNovoBankPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bank = getProfiledBank(slug);
  if (!bank) notFound();

  const url = `${SITE}/de-novo-watch/${slug}`;
  const state = deNovoState(bank.location);
  const city = bank.location.split(',')[0];
  const article = bank.articleSlug ? articles.find((a) => a.slug === bank.articleSlug) : undefined;
  const fdic = FDIC_PENDING.rows.find((r) => r.name === bank.name);
  const neighbors = DE_NOVO_BANKS.filter((b) => b.name !== bank.name && state && deNovoState(b.location) === state);
  const profiled = new Set(PROFILED_BANKS.map((b) => b.name));
  const questions = faqs(bank);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BankOrCreditUnion',
        '@id': `${url}#bank`,
        name: bank.name,
        address: { '@type': 'PostalAddress', addressLocality: city, ...(state ? { addressRegion: state } : {}), addressCountry: 'US' },
        url,
      },
      {
        '@type': 'FAQPage',
        mainEntity: questions.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'De Novo Watch', item: `${SITE}/de-novo-watch` },
          { '@type': 'ListItem', position: 3, name: bank.name, item: url },
        ],
      },
    ],
  };

  return (
    <SiteShell ctaSource={`de-novo:${slug}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{styles}</style>
      <div className="dnb-page">
        <div className="dnb-crumb">
          <a href="/de-novo-watch">De Novo Watch</a>
          <span aria-hidden="true">/</span>
          <span>{bank.name}</span>
        </div>

        <h1>{bank.name}</h1>
        <div className="dnb-meta">
          <span className={`dnb-status dnb-status--${bank.status}`}>{STATUS_LABELS[bank.status]}</span>
          <span>{bank.location}</span>
          <span>Verified {fmtDate(bank.asOf)}</span>
        </div>

        <section>
          <h2>Where the charter stands</h2>
          <p>{bank.statusDetail}</p>
          {fdic && (
            <p className="dnb-source">
              Source: <a href={FDIC_PENDING.source} rel="noreferrer">FDIC pending deposit insurance applications</a>, as of{' '}
              {fmtDate(FDIC_PENDING.asOf)}.
            </p>
          )}
        </section>

        {bank.capital && (
          <section>
            <h2>Capital</h2>
            <p>{bank.capital}</p>
          </section>
        )}

        {bank.leadership && (
          <section>
            <h2>Leadership</h2>
            <p>{bank.leadership}</p>
          </section>
        )}

        {bank.techNotes && (
          <section>
            <h2>Technology and vendors</h2>
            <p>{bank.techNotes}</p>
          </section>
        )}

        {article && (
          <a className="dnb-article" href={`/blog/${article.slug}`}>
            <span className="dnb-article-label">Full analysis</span>
            <span className="dnb-article-title">{article.title} &rarr;</span>
          </a>
        )}

        <section className="dnb-faq">
          <h2>Common questions</h2>
          {questions.map((f) => (
            <div className="dnb-faq-item" key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        <div className="dnb-organizer">
          <div>
            <div className="dnb-organizer-label">Organizing a de novo?</div>
            <p>
              A new bank picks its loan and account intake once. RAVEN verifies income, assets and identity from the source, so
              day-one applications arrive complete.
            </p>
          </div>
          <CalendlyButton source={`de-novo:${slug}`} label="Book a 20-minute call" buttonClassName="dnb-cta-btn" />
        </div>

        <LeadCapture variant="subscribe" source={`de-novo:${slug}`} title="Get De Novo Watch updates by email" />

        <div className="dnb-related">
          {neighbors.length > 0 && (
            <div>
              <h2>Other de novo banks in {state}</h2>
              <ul>
                {neighbors.map((n) => (
                  <li key={n.name}>
                    <a href={profiled.has(n.name) ? `/de-novo-watch/${deNovoSlug(n.name)}` : '/de-novo-watch'}>{n.name}</a>
                    <span>{STATUS_LABELS[n.status]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2>The full tracker</h2>
            <p>
              Every 2026 de novo application, approval and opening we track, plus the complete FDIC pending list:{' '}
              <a href="/de-novo-watch">De Novo Watch</a>.
            </p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

const styles = `
  .dnb-page { max-width: 760px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
  .dnb-crumb { display: flex; gap: 0.6rem; font-size: 0.8rem; color: var(--gray-500); margin-bottom: 1.75rem; flex-wrap: wrap; }
  .dnb-crumb a { color: var(--gray-400); text-decoration: none; }
  .dnb-crumb a:hover { color: var(--white); }
  .dnb-page h1 { font-size: clamp(1.9rem, 4vw, 2.6rem); font-weight: 700; letter-spacing: -0.025em; line-height: 1.15; margin-bottom: 1rem; }
  .dnb-meta { display: flex; align-items: center; gap: 0.6rem 1.1rem; flex-wrap: wrap; font-size: 0.88rem; color: var(--gray-400); margin-bottom: 2.5rem; }
  .dnb-status { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border-radius: 999px; padding: 0.3rem 0.75rem; color: var(--accent); background: var(--accent-dim); border: 1px solid var(--accent-border); }
  .dnb-status--open { color: #4ADE80; background: rgba(74,222,128,0.08); border-color: rgba(74,222,128,0.3); }
  .dnb-page section { margin-bottom: 2.25rem; }
  .dnb-page h2 { font-size: 1.35rem; font-weight: 600; letter-spacing: -0.015em; margin-bottom: 0.85rem; }
  .dnb-page section p { font-size: 0.98rem; line-height: 1.8; color: var(--gray-300); margin-bottom: 1rem; }
  .dnb-page section p a, .dnb-related a { color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--accent-border); }
  .dnb-page section p.dnb-source { font-size: 0.82rem; color: var(--gray-500); }
  .dnb-article { display: block; text-decoration: none; border: 1px solid var(--accent-border); background: rgba(108,142,255,0.05); border-radius: 14px; padding: 1.25rem 1.5rem; margin: 0 0 2.5rem; }
  .dnb-article-label { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gray-500); margin-bottom: 0.35rem; }
  .dnb-article-title { color: var(--accent); font-weight: 600; font-size: 1rem; line-height: 1.5; }
  .dnb-faq { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2rem; }
  .dnb-faq-item { margin-bottom: 1.5rem; }
  .dnb-faq-item h3 { font-size: 1rem; font-weight: 600; color: var(--gray-100, #F5F5F5); margin-bottom: 0.4rem; }
  .dnb-page .dnb-faq-item p { font-size: 0.92rem; line-height: 1.75; color: var(--gray-400); }
  .dnb-organizer { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.5rem 1.75rem; margin: 2.5rem 0 0; }
  .dnb-organizer > div { flex: 1 1 320px; }
  .dnb-organizer-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gray-500); margin-bottom: 0.4rem; }
  .dnb-organizer p { font-size: 0.92rem; line-height: 1.7; color: var(--gray-300); margin: 0; }
  .dnb-cta-btn { font-family: var(--font-dm-sans), 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500; padding: 0.7rem 1.3rem; border-radius: 8px; border: none; background: var(--white); color: var(--black); cursor: pointer; transition: opacity 200ms; white-space: nowrap; }
  .dnb-cta-btn:hover { opacity: 0.85; }
  .dnb-related { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2rem; margin-top: 2rem; }
  .dnb-related h2 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gray-500); margin-bottom: 0.85rem; font-weight: 600; }
  .dnb-related ul { list-style: none; padding: 0; }
  .dnb-related li { margin-bottom: 0.6rem; font-size: 0.92rem; line-height: 1.5; display: flex; justify-content: space-between; gap: 1rem; }
  .dnb-related li span { color: var(--gray-500); font-size: 0.8rem; white-space: nowrap; }
  .dnb-related p { font-size: 0.92rem; line-height: 1.7; color: var(--gray-300); }
  @media (max-width: 640px) {
    .dnb-page { padding: 2.5rem 1.1rem 3rem; }
    .dnb-related { grid-template-columns: 1fr; }
  }
`;
