import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RAVEN Blog — Insights for Community Banks',
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
};

const articles = [
  {
    slug: 'why-it-takes-42-days-to-close-a-mortgage',
    title: 'Why It Takes 42 Days to Close a Mortgage (And What That\'s Costing Your Bank)',
    description:
      'The average mortgage takes 42 days to close. FHA loans take 77. The average file is 500 pages thick. Every one of those days costs money in staff time, borrower patience, and loans that never close.',
    readTime: '8 min read',
    date: 'March 2026',
  },
  {
    slug: 'community-banks-are-losing-the-lending-race',
    title: 'Community Banks Are Losing the Lending Race. Here\'s How to Catch Up.',
    description:
      'Banks originated 42.5% of mortgages in 2018. By 2024, that fell to 30.1%. Non-bank lenders now close more than half of all home loans. This is a structural shift, and it is accelerating.',
    readTime: '9 min read',
    date: 'March 2026',
  },
  {
    slug: 'next-generation-borrowers-wont-wait',
    title: 'Your Next Generation of Borrowers Won\'t Wait 42 Days',
    description:
      '54% of Gen Z rely primarily on non-traditional financial providers. 61% switched banks in the last two years. Only 14% trust traditional banks "a lot." Your future borrowers are already gone.',
    readTime: '8 min read',
    date: 'March 2026',
  },
  {
    slug: '59-billion-compliance-burden',
    title: 'The $59 Billion Compliance Burden — And How Automation Is Cutting It in Half',
    description:
      'U.S. banks spend $59 billion a year on BSA/AML compliance alone. For community banks under $100 million in assets, compliance eats 8.7% of noninterest expenses — three times the rate at larger banks.',
    readTime: '10 min read',
    date: 'March 2026',
  },
  {
    slug: 'how-figure-closes-heloc-in-5-days',
    title: 'How Figure Closes a HELOC in 5 Days (And What Community Banks Can Learn)',
    description:
      'Figure originates at $730 per loan versus the industry average of $11,230. Their S-1 reveals the speed comes from automated data aggregation, not blockchain. The playbook is more replicable than you think.',
    readTime: '11 min read',
    date: 'March 2026',
  },
  {
    slug: 'one-link-complete-verification',
    title: 'One Link, Complete Verification: How RAVEN Works for Community Banks',
    description:
      'What if verifying a borrower took 5 minutes instead of 5 weeks? One link, one borrower interaction, complete verification data back to the bank in minutes from seven providers with a full audit trail.',
    readTime: '12 min read',
    date: 'March 2026',
  },
];

export default function BlogIndex() {
  return (
    <>
      <style>{`
        .blog-index {
          max-width: 1100px;
          margin: 0 auto;
          padding: 4rem 2rem 2rem;
        }
        .blog-index-header {
          margin-bottom: 3.5rem;
        }
        .blog-index-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gray-500);
          margin-bottom: 1rem;
        }
        .blog-index-header h1 {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 1rem;
        }
        .blog-index-header p {
          font-size: 1.05rem;
          color: var(--gray-400);
          line-height: 1.7;
          max-width: 560px;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .blog-card {
          padding: 2.5rem;
          background: var(--black);
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          transition: background 200ms;
        }
        .blog-card:hover {
          background: var(--gray-900);
        }
        .blog-card-meta {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-bottom: 1rem;
        }
        .blog-card-meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--gray-600);
        }
        .blog-card h2 {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.35;
          margin-bottom: 0.75rem;
          color: var(--white);
        }
        .blog-card p {
          font-size: 0.85rem;
          color: var(--gray-500);
          line-height: 1.65;
          flex: 1;
        }
        .blog-card-read {
          margin-top: 1.25rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--gray-400);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: color 200ms;
        }
        .blog-card:hover .blog-card-read {
          color: var(--white);
        }

        @media (max-width: 768px) {
          .blog-index { padding: 3rem 1.5rem 1.5rem; }
          .blog-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="blog-index">
        <div className="blog-index-header">
          <div className="blog-index-tag">RAVEN Blog</div>
          <h1>Insights for Community Banks</h1>
          <p>
            Research-backed articles on lending speed, compliance costs, borrower
            expectations, and how community banks can compete with fintechs on
            verification speed.
          </p>
        </div>

        <div className="blog-grid">
          {articles.map((article) => (
            <a key={article.slug} href={`/blog/${article.slug}`} className="blog-card">
              <div className="blog-card-meta">
                <span>{article.date}</span>
                <span className="blog-card-meta-dot" />
                <span>{article.readTime}</span>
              </div>
              <h2>{article.title}</h2>
              <p>{article.description}</p>
              <span className="blog-card-read">
                Read article
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
