import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';
import { SOLUTIONS } from './solutions-data';

export const metadata: Metadata = {
  title: 'Solutions for Community Banks | RAVEN',
  description:
    'Verification-first infrastructure for community banks: borrower verification, digital account opening, KYC, and instant income and employment verification.',
  alternates: { canonical: 'https://reportraven.tech/solutions' },
  openGraph: {
    title: 'RAVEN Solutions for Community Banks',
    description:
      'Borrower verification, digital account opening, KYC, and instant income and employment verification. One link, source-verified data.',
    url: 'https://reportraven.tech/solutions',
    siteName: 'RAVEN',
    type: 'website',
  },
};

export default function SolutionsIndex() {
  return (
    <SiteShell ctaSource="solutions-index">
      <style>{`
        .solx { max-width: 900px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
        .solx-tag { display: inline-block; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; }
        .solx h1 { font-size: clamp(2rem, 4vw, 2.7rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1.12; margin-bottom: 1rem; }
        .solx-sub { font-size: 1.02rem; color: var(--gray-400); line-height: 1.7; max-width: 640px; margin-bottom: 3rem; }
        .solx-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; }
        .solx-card { background: var(--black); padding: 2rem 1.75rem; text-decoration: none; color: inherit; transition: background 200ms; display: flex; flex-direction: column; border-top: 3px solid transparent; }
        .solx-card:hover { background: rgba(255,255,255,0.025); border-top-color: var(--accent); }
        .solx-eyebrow { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--accent); margin-bottom: 0.7rem; }
        .solx-card h2 { font-size: 1.1rem; font-weight: 600; letter-spacing: -0.01em; color: var(--white); line-height: 1.35; margin-bottom: 0.6rem; }
        .solx-card p { font-size: 0.85rem; color: var(--gray-500); line-height: 1.65; flex: 1; }
        .solx-read { margin-top: 1.1rem; font-size: 0.8rem; font-weight: 500; color: var(--gray-400); transition: color 200ms; }
        .solx-card:hover .solx-read { color: var(--white); }
        @media (max-width: 640px) {
          .solx { padding: 2.5rem 1.1rem 3rem; }
          .solx-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="solx">
        <div className="solx-tag">Solutions</div>
        <h1>Verification-first infrastructure for community banks</h1>
        <p className="solx-sub">
          One borrower link, source-verified data back in minutes. Every solution below runs
          without a core conversion and launches in days, not quarters.
        </p>
        <div className="solx-grid">
          {SOLUTIONS.map((s) => (
            <a key={s.slug} href={`/solutions/${s.slug}`} className="solx-card">
              <div className="solx-eyebrow">{s.eyebrow}</div>
              <h2>{s.h1}</h2>
              <p>{s.metaDescription}</p>
              <span className="solx-read">Learn more &rarr;</span>
            </a>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
