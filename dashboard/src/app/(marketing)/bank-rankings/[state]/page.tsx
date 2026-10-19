import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '../../site-shell';
import { LeadCapture } from '../../lead-capture';
import { DEFAULT_OG_IMAGES } from '@/app/og-default';
import {
  bankSlug,
  formatAssets,
  formatMetric,
  RANKING_MIN_ASSETS,
  SITEMAP_STATES,
  stateFromSlug,
  stateRankings,
  stateSlug,
  topBanks,
  type RankedBank,
  type StateRankings,
} from '../../bank-snapshot/peer-data';
import { snapshotStyles } from '../../bank-snapshot/styles';

export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

const SITE = 'https://reportraven.tech';
const rankings = cache(async (slug: string) => {
  const stalp = stateFromSlug(slug);
  return stalp ? stateRankings(stalp) : undefined;
});

const bankHref = (b: RankedBank) => `/bank-snapshot/${b.cert}-${bankSlug(b.name)}`;

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const r = await rankings((await params).state);
  if (!r) return { title: 'State not found', robots: { index: false } };
  const title = `${r.stateName} Bank Rankings: ROA and Efficiency Ratio (${r.quarter})`;
  const description = `All ${r.banks.length} banks headquartered in ${r.stateName}, ranked by return on assets and efficiency ratio from ${r.quarter} FDIC call reports. Median ROA ${formatMetric(r.medians.roa, 'pct')}, median efficiency ratio ${formatMetric(r.medians.efficiency, 'pct')}.`;
  const url = `${SITE}/bank-rankings/${stateSlug(r.stalp)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { images: DEFAULT_OG_IMAGES, title, description, url, siteName: 'RAVEN', type: 'website' },
  };
}

function TopList({ banks, metric }: { banks: RankedBank[]; metric: 'roa' | 'efficiency' }) {
  return (
    <ol className="bsn-top">
      {banks.map((b) => (
        <li key={b.cert}>
          <a href={bankHref(b)}>{b.name}</a> <span className="bsn-note">{b.city}</span>{' '}
          <span className="bsn-num">{formatMetric(b[metric], 'pct')}</span>
        </li>
      ))}
    </ol>
  );
}

function intro(r: StateRankings): string {
  const total = r.banks.reduce((sum, b) => sum + b.assets, 0);
  return `${r.banks.length} FDIC-insured banks are headquartered in ${r.stateName}, holding ${formatAssets(total)} in combined assets as of ${r.quarter}. The median bank has ${formatAssets(r.medians.assets)} in assets, earns a ${formatMetric(r.medians.roa, 'pct')} return on assets, and runs a ${formatMetric(r.medians.efficiency, 'pct')} efficiency ratio.`;
}

export default async function StateRankingsPage({ params }: { params: Promise<{ state: string }> }) {
  const r = await rankings((await params).state);
  if (!r) notFound();
  const url = `${SITE}/bank-rankings/${stateSlug(r.stalp)}`;
  const byRoa = topBanks(r.banks, 'roa');
  const byEfficiency = topBanks(r.banks, 'efficiency');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        '@id': `${url}#dataset`,
        name: `${r.stateName} bank performance rankings (${r.quarter})`,
        description: `Return on assets, net interest margin, efficiency ratio, and loan-to-deposit ratio for every bank headquartered in ${r.stateName}, from FDIC call reports.`,
        url,
        creator: { '@id': `${SITE}/#organization` },
        isAccessibleForFree: true,
        temporalCoverage: `${r.repdte.slice(0, 4)}-${r.repdte.slice(4, 6)}-${r.repdte.slice(6, 8)}`,
        spatialCoverage: { '@type': 'State', name: r.stateName },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Bank Rankings', item: `${SITE}/bank-rankings` },
          { '@type': 'ListItem', position: 3, name: r.stateName, item: url },
        ],
      },
    ],
  };

  return (
    <SiteShell ctaSource="bank-rankings">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{snapshotStyles}</style>
      <div className="bsn-page">
        <div className="bsn-eyebrow">
          <a href="/bank-rankings">Bank Rankings</a>
        </div>
        <h1>
          {r.stateName} bank rankings, {r.quarter}
        </h1>
        <p className="bsn-meta">From FDIC call reports &middot; refreshed daily &middot; free to cite with attribution to RAVEN (reportraven.tech)</p>
        <p>{intro(r)}</p>

        {byRoa.length > 0 && (
          <>
            <h2>Highest return on assets</h2>
            <TopList banks={byRoa} metric="roa" />
          </>
        )}
        {byEfficiency.length > 0 && (
          <>
            <h2>Most efficient (lowest efficiency ratio)</h2>
            <TopList banks={byEfficiency} metric="efficiency" />
          </>
        )}
        <p className="bsn-note">Top-ten lists include banks with at least {formatAssets(RANKING_MIN_ASSETS)} in assets.</p>

        <h2>Every {r.stateName} bank</h2>
        <div className="bsn-table-wrap">
          <table className="bsn-table">
            <thead>
              <tr>
                <th>Bank</th>
                <th>Assets</th>
                <th>ROA</th>
                <th>Efficiency</th>
                <th>NIM</th>
              </tr>
            </thead>
            <tbody>
              {r.banks.map((b) => (
                <tr key={b.cert}>
                  <td>
                    <a href={bankHref(b)} className="bsn-metric">
                      {b.name}
                    </a>
                    <div className="bsn-note">{b.city}</div>
                  </td>
                  <td className="bsn-num">{formatAssets(b.assets)}</td>
                  <td className="bsn-num">{formatMetric(b.roa, 'pct')}</td>
                  <td className="bsn-num">{b.efficiency > 0 ? formatMetric(b.efficiency, 'pct') : '–'}</td>
                  <td className="bsn-num">{formatMetric(b.nim, 'pct')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <LeadCapture variant="audit" source={`bank-rankings-${r.stalp}`} title={`Run a ${r.stateName} bank? Get a free digital lending audit.`} />

        <h2>Method</h2>
        <p>
          Banks are FDIC-insured institutions headquartered in {r.stateName} with a call report for the
          quarter ending {`${r.repdte.slice(4, 6)}/${r.repdte.slice(6, 8)}/${r.repdte.slice(0, 4)}`}. Return
          on assets and net interest margin are annualized year to date; the efficiency ratio is
          noninterest expense over revenue, so lower is better. Credit unions are NCUA-insured and not
          included. Click any bank for its comparison with same-size peers, or{' '}
          <a href="/bank-snapshot">look up a bank</a> in another state.
        </p>
        {SITEMAP_STATES.includes(r.stalp) && (
          <p className="bsn-note">
            Other Southeast states:{' '}
            {SITEMAP_STATES.filter((s) => s !== r.stalp).map((s, i) => (
              <span key={s}>
                {i > 0 && ' · '}
                <a href={`/bank-rankings/${stateSlug(s)}`}>{s}</a>
              </span>
            ))}
          </p>
        )}
      </div>
    </SiteShell>
  );
}
