import { ogCard, OG_SIZE } from '../../../og-card';
import { formatAssets, formatMetric, stateFromSlug, stateRankings, topBanks } from '../../bank-snapshot/peer-data';

// Link preview for a state's rankings (shared by the weekly LinkedIn rankings
// posts), drawn from the same daily FDIC data as the page.

export const alt = 'State bank rankings from FDIC call reports';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ state: string }> }) {
  const stalp = stateFromSlug((await params).state);
  const r = stalp ? await stateRankings(stalp) : undefined;
  if (!r) return ogCard({ eyebrow: 'RAVEN Bank Rankings', title: 'Bank rankings by state' });
  const [leader] = topBanks(r.banks, 'efficiency', 1);
  return ogCard({
    eyebrow: `RAVEN Bank Rankings  ·  ${r.quarter} call reports`,
    title: `${r.stateName} bank rankings`,
    subtitle: leader ? `Most efficient community bank: ${leader.name} (${formatMetric(leader.efficiency, 'pct')})` : undefined,
    stats: [
      { label: 'Banks', value: String(r.banks.length) },
      { label: 'Combined assets', value: formatAssets(r.banks.reduce((s, b) => s + b.assets, 0)) },
      { label: 'Median ROA', value: formatMetric(r.medians.roa, 'pct') },
      { label: 'Median efficiency', value: formatMetric(r.medians.efficiency, 'pct') },
    ],
  });
}
