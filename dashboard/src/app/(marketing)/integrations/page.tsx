import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';
import { INTEGRATION_CATEGORIES, getIntegrationsByCategory } from './integrations-data';

export const metadata: Metadata = {
  title: 'Integrations',
  description:
    'RAVEN integrates with Plaid, Socure, Truework, Melissa, and FullContact, and works with Jack Henry, Fiserv, FIS, CSI, nCino, MeridianLink, Baker Hill, Abrigo, and Encompass.',
  alternates: { canonical: 'https://reportraven.tech/integrations' },
  openGraph: {
    title: 'RAVEN Integrations',
    description:
      'Source-data verification providers plus connectivity for major cores and loan origination systems. No core replacement required to launch.',
    url: 'https://reportraven.tech/integrations',
    siteName: 'RAVEN',
    type: 'website',
  },
};

export default function IntegrationsIndex() {
  return (
    <SiteShell ctaSource="integrations-index">
      <style>{`
        .intx { max-width: 900px; margin: 0 auto; padding: 4rem 1.5rem 5rem; }
        .intx-tag { display: inline-block; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; }
        .intx h1 { font-size: clamp(2rem, 4vw, 2.7rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1.12; margin-bottom: 1rem; }
        .intx-sub { font-size: 1.02rem; color: var(--gray-400); line-height: 1.7; max-width: 640px; margin-bottom: 3.5rem; }
        .intx-section { margin-bottom: 3rem; }
        .intx-section h2 { font-size: 1.3rem; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 0.5rem; }
        .intx-section-blurb { font-size: 0.88rem; color: var(--gray-400); line-height: 1.65; max-width: 640px; margin-bottom: 1.5rem; }
        .intx-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; }
        .intx-card { background: var(--black); padding: 1.5rem 1.75rem; text-decoration: none; color: inherit; display: flex; flex-direction: column; transition: background 200ms; border-top: 3px solid transparent; }
        .intx-card:hover { background: rgba(255,255,255,0.025); border-top-color: var(--accent); }
        .intx-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.6rem; }
        .intx-card h3 { font-size: 1rem; font-weight: 600; letter-spacing: -0.01em; color: var(--white); line-height: 1.35; }
        .intx-card p { font-size: 0.85rem; color: var(--gray-500); line-height: 1.65; flex: 1; }
        .intx-read { margin-top: 1rem; font-size: 0.78rem; font-weight: 500; color: var(--gray-500); transition: color 200ms; }
        .intx-card:hover .intx-read { color: var(--white); }
        .intx-note { font-size: 0.82rem; color: var(--gray-500); line-height: 1.7; margin-top: 1.5rem; }
        @media (max-width: 640px) {
          .intx { padding: 2.5rem 1.1rem 3rem; }
          .intx-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="intx">
        <div className="intx-tag">Integrations</div>
        <h1>Verification data and core connectivity</h1>
        <p className="intx-sub">
          RAVEN runs on live source-data providers and delivers verified files to any workflow
          without a core project. Connecting your core or LOS is a configuration step, not an
          integration project.
        </p>

        {INTEGRATION_CATEGORIES.map((cat) => {
          const items = getIntegrationsByCategory(cat.key);
          if (items.length === 0) return null;
          return (
            <div className="intx-section" key={cat.key}>
              <h2>{cat.label}</h2>
              <p className="intx-section-blurb">{cat.blurb}</p>
              <div className="intx-grid">
                {items.map((i) => (
                  <a key={i.slug} href={`/integrations/${i.slug}`} className="intx-card">
                    <div className="intx-card-top">
                      <h3>{i.name}</h3>
                    </div>
                    <p>{i.description}</p>
                    <span className="intx-read">Learn more &rarr;</span>
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        <p className="intx-note">
          Don&rsquo;t see your core or LOS listed? RAVEN operates at the intake and verification layer
          regardless of what you run underneath, so you can launch this week either way. Tell us what
          you run and we&rsquo;ll walk you through the setup.
        </p>
      </div>
    </SiteShell>
  );
}
