import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGES } from '@/app/og-default';
import { SiteShell } from '../site-shell';
import { snapshotStyles } from '../bank-snapshot/styles';
import { COMING_NEXT, PRODUCT_TYPES, SITE, scorecardPath } from './products';
import { rankedRows } from './scoring';
import { SCORECARD_STATES, STATE_LABELS } from './types';

const URL = `${SITE}/scorecards`;

export const metadata: Metadata = {
  title: 'Product Scorecards: Bank Accounts and Loans Compared, Scored and Ranked',
  description:
    'Savings accounts from fintechs, the big five banks and Southeast community banks and credit unions, scored on rate, fees, money movement, in-person access and protections. Sourced, dated, no paid placement.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'RAVEN Product Scorecards',
    description: 'Financial products from fintechs, big banks and local institutions, scored and ranked from sourced, dated facts.',
    url: URL,
    siteName: 'RAVEN',
    type: 'website',
    images: DEFAULT_OG_IMAGES,
  },
};

export default function ScorecardsIndex() {
  return (
    <SiteShell ctaSource="scorecards">
      <style>{snapshotStyles}</style>
      <div className="bsn-page">
        <div className="bsn-eyebrow">Free data</div>
        <h1>Product Scorecards</h1>
        <p>
          Which bank actually has the best account? We score the same product at fintech apps, online banks, the big five banks
          (Chase, Bank of America, Wells Fargo, Citi and U.S. Bank) and the local banks and credit unions of South Carolina, North
          Carolina, Georgia and Florida. Every score comes from facts read on the institution&rsquo;s own pages, each row is dated, and
          nobody pays to be listed.
        </p>
        {PRODUCT_TYPES.map((type) => {
          const ranked = rankedRows(type, 'all').filter((r) => r.overall !== null);
          return (
            <section key={type.slug}>
              <h2>
                <a href={scorecardPath(type.slug)}>{type.label}</a>
              </h2>
              <p>
                {ranked.length} ranked, verified {type.updated}. Top score: {ranked[0]?.inst.name} ({ranked[0]?.overall?.toFixed(1)} out of 10).
                By state:{' '}
                {SCORECARD_STATES.map((s, i) => (
                  <span key={s}>
                    {i > 0 && ' · '}
                    <a href={scorecardPath(type.slug, s)}>{STATE_LABELS[s].name}</a>
                  </span>
                ))}
                . <a href={`/scorecards/${type.slug}/data.csv`}>Download the CSV</a>.
              </p>
            </section>
          );
        })}
        <h2>Coming next</h2>
        <p>{COMING_NEXT.join(', ')}. New scorecards are added every few weeks.</p>
      </div>
    </SiteShell>
  );
}
