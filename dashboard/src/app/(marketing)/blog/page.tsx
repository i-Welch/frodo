import type { Metadata } from 'next';
import { CalendlyButton } from '../calendly-button';
import { articles, type Article } from './articles-index';

export const metadata: Metadata = {
  title: { absolute: 'RAVEN Blog — Insights for Community Banks' },
  description:
    'Articles on borrower verification, lending automation, compliance, and how community banks can compete with fintechs. Research-backed insights from RAVEN.',
  openGraph: {
    title: 'RAVEN Blog — Insights for Community Banks',
    description:
      'Research-backed articles on lending speed, compliance costs, and verification automation for community banks.',
    url: 'https://reportraven.tech/blog',
    siteName: 'RAVEN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://reportraven.tech/blog',
  },
};

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': 'https://reportraven.tech/blog#blog',
  url: 'https://reportraven.tech/blog',
  name: 'RAVEN Blog',
  description:
    'Research-backed articles on lending speed, compliance costs, and verification automation for community banks.',
  publisher: { '@type': 'Organization', name: 'RAVEN', url: 'https://reportraven.tech' },
  blogPost: articles.map((a) => ({
    '@type': 'BlogPosting',
    headline: a.title,
    description: a.description,
    url: `https://reportraven.tech/blog/${a.slug}`,
    // Index cards only carry month-level dates ('June 2026'); first of month
    // keeps this ISO-valid without claiming false precision.
    datePublished: new Date(`${a.date.replace(' ', ' 1, ')} UTC`).toISOString().slice(0, 10),
    author: { '@type': 'Person', name: 'Isaac Welch', url: 'https://reportraven.tech/about' },
  })),
};

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

function FeaturedCard({ article }: { article: Article }) {
  return (
    <a href={`/blog/${article.slug}`} className="blog-featured-card">
      <div className="blog-featured-cat">{article.category === 'fintech' ? 'Fintech vs. Bank' : article.category === 'bank' ? 'Bank Deep Dive' : article.category === 'denovo' ? 'De Novo Watch' : 'Industry Research'}</div>
      <h2>{article.title}</h2>
      <p>{article.description}</p>
      <span className="blog-card-read">
        Read article <ArrowRight />
      </span>
    </a>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="blog-card-wrap">
      <a href={`/blog/${article.slug}`} className="blog-card">
        <div className="blog-card-meta">
          <span>{article.date}</span>
          <span className="blog-card-meta-dot" />
          <span>{article.readTime}</span>
        </div>
        <h3>{article.title}</h3>
        <p>{article.description}</p>
        <span className="blog-card-read">
          Read article <ArrowRight />
        </span>
      </a>
      {article.auditSlug && (
        <a href={`/audit/${article.auditSlug}`} className="blog-card-audit-link">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          View ROI audit
        </a>
      )}
    </div>
  );
}

function SectionLabel({ num, label, description }: { num: string; label: string; description?: string }) {
  return (
    <div className="blog-section-header">
      <div className="blog-section-label">
        <span className="blog-section-num">{num}</span>
        {label}
      </div>
      {description && <p className="blog-section-desc">{description}</p>}
    </div>
  );
}

export default function BlogIndex() {
  const featured = articles.filter((a) => a.featured);
  const denovoArticles = articles.filter((a) => a.category === 'denovo' && !a.featured);
  const bankArticles = articles.filter((a) => a.category === 'bank' && !a.featured);
  const fintechArticles = articles.filter((a) => a.category === 'fintech' && !a.featured);
  const platformArticles = articles.filter((a) => a.category === 'platform');
  const guideArticles = articles.filter((a) => a.category === 'guide' && !a.featured);
  // Section numbers shift by one when the De Novo Watch section has articles to show.
  const num = (n: number) => String(n + (denovoArticles.length > 0 ? 1 : 0)).padStart(2, '0');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <style>{`
        :root {
          --accent: #6C8EFF;
          --accent-dim: rgba(108,142,255,0.12);
          --accent-border: rgba(108,142,255,0.25);
        }
        .blog-index {
          max-width: 1160px;
          margin: 0 auto;
          padding: 4rem 2rem 5rem;
        }
        .blog-index-header {
          margin-bottom: 4rem;
          max-width: 680px;
        }
        .blog-index-tag {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1.1rem;
        }
        .blog-index-header h1 {
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.12;
          margin-bottom: 1rem;
        }
        .blog-index-header p {
          font-size: 1.05rem;
          color: var(--gray-400);
          line-height: 1.7;
          margin-bottom: 1.75rem;
        }

        /* Section labels */
        .blog-section-header { margin-bottom: 1.75rem; }
        .blog-section-label {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--gray-400);
          margin-bottom: 0.5rem;
        }
        .blog-section-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: var(--accent-dim);
          border: 1px solid var(--accent-border);
          color: var(--accent);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0;
          flex-shrink: 0;
        }
        .blog-section-desc {
          font-size: 0.87rem;
          color: var(--gray-500);
          line-height: 1.6;
          max-width: 560px;
          margin: 0;
        }

        /* Featured strip */
        .blog-featured { margin-bottom: 4.5rem; }
        .blog-featured-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .blog-featured-card {
          display: flex;
          flex-direction: column;
          padding: 2.25rem;
          background: var(--black);
          text-decoration: none;
          color: inherit;
          transition: background 200ms;
          border-top: 3px solid var(--accent);
        }
        .blog-featured-card:hover { background: rgba(255,255,255,0.025); }
        .blog-featured-cat {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--accent);
          margin-bottom: 0.9rem;
        }
        .blog-featured-card h2 {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          line-height: 1.32;
          margin-bottom: 0.8rem;
          color: var(--white);
          flex: 1;
        }
        .blog-featured-card > p {
          font-size: 0.83rem;
          color: var(--gray-500);
          line-height: 1.65;
          margin-bottom: 1.25rem;
          flex: 2;
        }

        /* Section blocks */
        .blog-section { margin-bottom: 4.5rem; }

        /* Bank deep dive grid */
        .blog-bank-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .blog-card-wrap {
          display: flex;
          flex-direction: column;
          background: var(--black);
          transition: background 200ms;
        }
        .blog-card-wrap:hover { background: rgba(255,255,255,0.02); }
        .blog-card {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 1.75rem 1.75rem 1rem;
          text-decoration: none;
          color: inherit;
        }
        .blog-card-meta {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          font-size: 0.72rem;
          color: var(--gray-500);
          margin-bottom: 0.85rem;
        }
        .blog-card-meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--gray-600);
        }
        .blog-card h3, .blog-featured-card h2 {
          line-height: 1.32;
          letter-spacing: -0.015em;
        }
        .blog-card h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.6rem;
          color: var(--white);
        }
        .blog-card p {
          font-size: 0.82rem;
          color: var(--gray-500);
          line-height: 1.65;
          flex: 1;
        }
        .blog-card-read {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--gray-400);
          margin-top: 1rem;
          transition: color 200ms;
          text-decoration: none;
        }
        .blog-card:hover .blog-card-read,
        .blog-featured-card:hover .blog-card-read { color: var(--white); }
        .blog-card-audit-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--accent);
          padding: 0.55rem 1.75rem 1.1rem;
          text-decoration: none;
          opacity: 0.85;
          transition: opacity 200ms;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .blog-card-audit-link:hover { opacity: 1; }

        /* De novo grid - 3 columns, emerald accent */
        .blog-denovo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .blog-denovo-grid .blog-card-wrap {
          border-left: 3px solid rgba(52,211,153,0.4);
        }

        /* Fintech grid - 2 columns, more compact */
        .blog-fintech-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .blog-fintech-grid .blog-card-wrap {
          border-left: 3px solid rgba(245,158,11,0.4);
        }

        /* Platform grid - 2x2 */
        .blog-platform-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }

        /* Guides grid - 3 column */
        .blog-guide-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .blog-index-demo-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          background: var(--white);
          color: var(--black);
          cursor: pointer;
          transition: opacity 200ms;
          white-space: nowrap;
        }
        .blog-index-demo-btn:hover { opacity: 0.85; }

        @media (max-width: 900px) {
          .blog-featured-grid { grid-template-columns: 1fr; }
          .blog-bank-grid { grid-template-columns: repeat(2, 1fr); }
          .blog-denovo-grid { grid-template-columns: repeat(2, 1fr); }
          .blog-guide-grid { grid-template-columns: repeat(2, 1fr); }
          .blog-featured-card { padding: 1.75rem; }
          .blog-section { margin-bottom: 3rem; }
        }
        @media (max-width: 640px) {
          .blog-index { padding: 2.5rem 1.1rem 3rem; }
          .blog-index-header { margin-bottom: 2.75rem; }
          .blog-featured { margin-bottom: 3rem; }
          .blog-featured-card { padding: 1.5rem; border-top-width: 2px; }
          .blog-featured-card h2 { font-size: 1.05rem; }
          .blog-bank-grid,
          .blog-denovo-grid,
          .blog-fintech-grid,
          .blog-platform-grid,
          .blog-guide-grid { grid-template-columns: 1fr; }
          .blog-card { padding: 1.4rem 1.4rem 0.85rem; }
          .blog-card-audit-link { padding: 0.5rem 1.4rem 0.9rem; }
          .blog-section-header { margin-bottom: 1.25rem; }
        }
      `}</style>

      <div className="blog-index">
        <div className="blog-index-header">
          <div className="blog-index-tag">RAVEN Blog</div>
          <h1>Research-backed insights for community bankers</h1>
          <p>
            Original analysis of community bank performance, fintech competition, and the lending
            infrastructure gap. Built from public FDIC, HMDA, and earnings data.
          </p>
          <CalendlyButton source="blog-index" label="Book a Demo" buttonClassName="blog-index-demo-btn" />
        </div>

        {/* Featured */}
        <div className="blog-featured">
          <div className="blog-featured-grid">
            {featured.map((a) => (
              <FeaturedCard key={a.slug} article={a} />
            ))}
          </div>
        </div>

        {/* Bank Performance Deep Dives */}
        <div className="blog-section">
          <SectionLabel
            num="01"
            label="Bank Performance Deep Dives"
            description={`Original analysis of community banks using FDIC call reports, HMDA filings, and earnings data. ${bankArticles.filter((a) => a.auditSlug).length} of these have a free RAVEN ROI audit.`}
          />
          <div className="blog-bank-grid">
            {bankArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>

        {/* De Novo Watch */}
        {denovoArticles.length > 0 && (
          <div className="blog-section">
            <SectionLabel
              num="02"
              label="De Novo Watch"
              description="Filing-by-filing coverage of new bank charters: the organizers, the market math, and the day-one stack decisions that shape the first exam."
            />
            <div className="blog-denovo-grid">
              {denovoArticles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        )}

        {/* Fintech vs. Bank */}
        <div className="blog-section">
          <SectionLabel
            num={num(2)}
            label="Fintech vs. Community Bank"
            description="Step-by-step breakdowns of how fintechs operate versus traditional bank workflows, and what community banks can realistically copy."
          />
          <div className="blog-fintech-grid">
            {fintechArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>

        {/* Core & Platform */}
        <div className="blog-section">
          <SectionLabel
            num={num(3)}
            label="Core & Platform Research"
            description="What Jack Henry, Fiserv, and open banking platforms actually support for community bank lending and account opening."
          />
          <div className="blog-platform-grid">
            {platformArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>

        {/* Guides & Research */}
        <div className="blog-section">
          <SectionLabel
            num={num(4)}
            label="Guides & Industry Research"
            description="Data-driven guides on digital lending strategy, compliance costs, borrower expectations, and the macro trends reshaping community banking."
          />
          <div className="blog-guide-grid">
            {guideArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
