import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { SiteShell } from '../../site-shell';
import { LeadCapture } from '../../lead-capture';
import { DEFAULT_OG_IMAGES } from '@/app/og-default';
import { auditForCert } from '@/app/(whitelabel)/_config/audit-data';
import { getRoiBank } from '../../roi/roi-data';
import { bankSlug, certFromParam, formatAssets, formatMetric, peerReport, type Metric, type PeerReport } from '../peer-data';
import { snapshotStyles } from '../styles';

// Pages render on first visit and refresh daily, so a new quarter's call
// reports show up without a deploy.
export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

const SITE = 'https://reportraven.tech';
// Unknown certs 404; an FDIC outage throws instead, so the cached page keeps serving.
const report = cache(async (param: string) => {
  const cert = certFromParam(param);
  return cert ? peerReport(cert) : undefined;
});

const pathFor = (r: PeerReport) => `/bank-snapshot/${r.institution.CERT}-${bankSlug(r.institution.NAME)}`;
const metric = (r: PeerReport, key: string) => r.metrics.find((m) => m.key === key);

function rankBadge(m: Metric) {
  if (m.betterThanPct === undefined) return <span className="bsn-note">Context</span>;
  const tier = m.betterThanPct >= 67 ? 'top' : m.betterThanPct <= 33 ? 'low' : 'mid';
  const label = tier === 'top' ? 'Top third' : tier === 'low' ? 'Bottom third' : 'Middle third';
  return (
    <>
      <span className={`bsn-rank bsn-rank-${tier}`}>{label}</span>
      <div className="bsn-note">Ahead of {m.betterThanPct}% of peers</div>
    </>
  );
}

function summary(r: PeerReport): string {
  const ranked = r.metrics.filter((m) => m.betterThanPct !== undefined);
  if (ranked.length === 0) return '';
  const best = ranked.reduce((a, b) => ((b.betterThanPct ?? 0) > (a.betterThanPct ?? 0) ? b : a));
  const worst = ranked.reduce((a, b) => ((b.betterThanPct ?? 0) < (a.betterThanPct ?? 0) ? b : a));
  const name = r.institution.NAME;
  const lead = `Against ${r.peerCount} ${r.peerScope}, ${name}'s strongest measure in ${r.quarter} is ${best.label.toLowerCase()} (${formatMetric(best.bank, best.format)} vs. a ${formatMetric(best.peerMedian, best.format)} peer median).`;
  if (worst === best) return lead;
  return `${lead} Its weakest relative measure is ${worst.label.toLowerCase()} (${formatMetric(worst.bank, worst.format)} vs. ${formatMetric(worst.peerMedian, worst.format)}).`;
}

function operationsNote(r: PeerReport): string | undefined {
  const eff = metric(r, 'efficiency');
  if (!eff || eff.betterThanPct === undefined) return undefined;
  if (eff.betterThanPct < 50) {
    return `Its efficiency ratio of ${formatMetric(eff.bank, 'pct')} is above the ${formatMetric(eff.peerMedian, 'pct')} peer median: it spends more to earn each dollar of revenue than most banks its size. Staff time on manual borrower verification (collecting pay stubs, bank statements, and employment letters, then re-keying them) is one of the larger controllable costs behind that number.`;
  }
  return `Its efficiency ratio of ${formatMetric(eff.bank, 'pct')} is better than the ${formatMetric(eff.peerMedian, 'pct')} peer median. Banks that already run lean usually find their next gains in loan growth: faster digital applications and fewer borrowers abandoning a slow document chase.`;
}

export async function generateMetadata({ params }: { params: Promise<{ bank: string }> }): Promise<Metadata> {
  const r = await report((await params).bank);
  if (!r) return { title: 'Bank not found', robots: { index: false } };
  const roa = metric(r, 'roa');
  const eff = metric(r, 'efficiency');
  const title = `${r.institution.NAME} vs. Peers: ROA, Efficiency, NIM (${r.quarter})`;
  const description = `${r.institution.NAME} (${r.institution.CITY}, ${r.institution.STALP}) vs. ${r.peerCount} peer banks in ${r.quarter}${
    roa ? `: ROA ${formatMetric(roa.bank, 'pct')} vs. ${formatMetric(roa.peerMedian, 'pct')} median` : ''
  }${eff ? `, efficiency ratio ${formatMetric(eff.bank, 'pct')} vs. ${formatMetric(eff.peerMedian, 'pct')}` : ''}. From FDIC call report data.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE}${pathFor(r)}` },
    openGraph: { images: DEFAULT_OG_IMAGES, title, description, url: `${SITE}${pathFor(r)}`, siteName: 'RAVEN', type: 'website' },
  };
}

export default async function BankPeerPage({ params }: { params: Promise<{ bank: string }> }) {
  const param = (await params).bank;
  const r = await report(param);
  if (!r) notFound();
  if (`/bank-snapshot/${param}` !== pathFor(r)) permanentRedirect(pathFor(r));

  const inst = r.institution;
  const audit = auditForCert(inst.CERT);
  const auditSlug = audit && getRoiBank(audit.slug) ? audit.slug : undefined;
  const ops = operationsNote(r);
  const established = inst.ESTYMD?.slice(-4);
  const growth = (v?: number) => (v === undefined ? '–' : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE}${pathFor(r)}`,
        url: `${SITE}${pathFor(r)}`,
        name: `${inst.NAME} peer comparison (${r.quarter})`,
        about: {
          '@type': 'BankOrCreditUnion',
          name: inst.NAME,
          address: { '@type': 'PostalAddress', addressLocality: inst.CITY, addressRegion: inst.STALP, addressCountry: 'US' },
          ...(inst.WEBADDR ? { url: `https://${inst.WEBADDR.replace(/^https?:\/\//, '')}` } : {}),
        },
        isPartOf: { '@id': `${SITE}/bank-snapshot#tool` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Bank Peer Snapshot', item: `${SITE}/bank-snapshot` },
          { '@type': 'ListItem', position: 3, name: inst.NAME, item: `${SITE}${pathFor(r)}` },
        ],
      },
    ],
  };

  return (
    <SiteShell ctaSource="bank-snapshot">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{snapshotStyles}</style>
      <div className="bsn-page">
        <div className="bsn-eyebrow">
          <a href="/bank-snapshot">Bank Peer Snapshot</a>
        </div>
        <h1>{inst.NAME}: how it compares with its peers</h1>
        <p className="bsn-meta">
          {inst.CITY}, {inst.STALP} &middot; FDIC cert {inst.CERT} &middot; {r.quarter} call report &middot; {r.peerCount} peers ({r.peerScope})
        </p>

        <div className="bsn-stats">
          <div className="bsn-stat">
            <div className="bsn-stat-label">Total assets</div>
            <div className="bsn-stat-value">{formatAssets(inst.ASSET)}</div>
          </div>
          <div className="bsn-stat">
            <div className="bsn-stat-label">Loan growth (YoY)</div>
            <div className="bsn-stat-value">{growth(r.loanGrowthPct)}</div>
          </div>
          <div className="bsn-stat">
            <div className="bsn-stat-label">Deposit growth (YoY)</div>
            <div className="bsn-stat-value">{growth(r.depositGrowthPct)}</div>
          </div>
          {inst.OFFICES ? (
            <div className="bsn-stat">
              <div className="bsn-stat-label">Offices</div>
              <div className="bsn-stat-value">{inst.OFFICES}</div>
            </div>
          ) : null}
          {established && (
            <div className="bsn-stat">
              <div className="bsn-stat-label">Established</div>
              <div className="bsn-stat-value">{established}</div>
            </div>
          )}
        </div>

        <p>{summary(r)}</p>

        <div className="bsn-table-wrap">
          <table className="bsn-table">
            <thead>
              <tr>
                <th>Measure</th>
                <th>{inst.NAME.length > 28 ? 'This bank' : inst.NAME}</th>
                <th>Peer median</th>
                <th>Rank</th>
              </tr>
            </thead>
            <tbody>
              {r.metrics.map((m) => (
                <tr key={m.key}>
                  <td>
                    <span className="bsn-metric">{m.label}</span>
                    <div className="bsn-note">{m.note}</div>
                  </td>
                  <td className="bsn-num">{formatMetric(m.bank, m.format)}</td>
                  <td className="bsn-num">{formatMetric(m.peerMedian, m.format)}</td>
                  <td>{rankBadge(m)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ops && (
          <>
            <h2>What it means for lending operations</h2>
            <p>{ops}</p>
          </>
        )}

        {auditSlug && (
          <div className="bsn-callout">
            <strong>We published a free digital lending audit of {audit?.bankName}.</strong>{' '}
            It walks through
            the bank&rsquo;s current borrower journey and what automated verification would be worth.{' '}
            <a href={`/audit/${auditSlug}`}>Read the audit</a>
          </div>
        )}

        <LeadCapture
          variant="audit"
          source={`bank-snapshot-${inst.CERT}`}
          defaultBank={inst.NAME}
          title={auditSlug ? 'Work at this bank? Get the audit updated for your team.' : `Want a free digital lending audit of ${inst.NAME}?`}
        />

        <h2>Sources and method</h2>
        <p>
          Figures are from the FDIC&rsquo;s public call report data for the quarter ending{' '}
          {`${r.repdte.slice(4, 6)}/${r.repdte.slice(6, 8)}/${r.repdte.slice(0, 4)}`}, via{' '}
          <a href={`https://banks.data.fdic.gov/bankfind-suite/bankfind/details/${inst.CERT}`} rel="nofollow">
            FDIC BankFind
          </a>
          . Return on assets and net interest margin are annualized year to date. Peers are{' '}
          {r.peerScope} in the same quarter, excluding this bank. The page refreshes daily, so new
          quarters appear as banks file. <a href="/bank-snapshot">Compare another bank</a>.
        </p>
      </div>
    </SiteShell>
  );
}
