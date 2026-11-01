import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';
import { DEFAULT_OG_IMAGES } from '@/app/og-default';
import { SITEMAP_STATES, STATE_NAMES, stateSlug } from '../bank-snapshot/peer-data';
import { snapshotStyles } from '../bank-snapshot/styles';

const URL = 'https://reportraven.tech/bank-rankings';

export const metadata: Metadata = {
  title: 'Bank Rankings by State: ROA and Efficiency Ratio',
  description:
    'Every FDIC-insured bank in each state ranked by return on assets and efficiency ratio, from the latest call reports. Free, refreshed daily.',
  alternates: { canonical: URL },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: 'Bank Rankings by State',
    description: 'Every bank in each state ranked by ROA and efficiency ratio, from the latest FDIC call reports.',
    url: URL,
    siteName: 'RAVEN',
    type: 'website',
  },
};

export default function BankRankingsIndex() {
  const others = Object.keys(STATE_NAMES).filter((s) => !SITEMAP_STATES.includes(s));
  const link = (s: string) => <a href={`/bank-rankings/${stateSlug(s)}`}>{STATE_NAMES[s]}</a>;
  return (
    <SiteShell ctaSource="bank-rankings">
      <style>{snapshotStyles}</style>
      <div className="bsn-page">
        <div className="bsn-eyebrow">Free data</div>
        <h1>Bank rankings by state</h1>
        <p>
          Every FDIC-insured bank headquartered in a state, ranked by return on assets and efficiency
          ratio from the latest call reports, with each bank linked to its{' '}
          <a href="/bank-snapshot">peer snapshot</a>. Pages refresh daily as new quarters post.
        </p>
        <h2>Southeast</h2>
        <ul className="bsn-top" style={{ listStyle: 'disc' }}>
          {SITEMAP_STATES.map((s) => (
            <li key={s}>{link(s)}</li>
          ))}
        </ul>
        <h2>All other states</h2>
        <p>
          {others.map((s, i) => (
            <span key={s}>
              {i > 0 && ' · '}
              {link(s)}
            </span>
          ))}
        </p>
      </div>
    </SiteShell>
  );
}
