import { formatAssets, formatMetric, type PeerReport } from './peer-data';

const metric = (r: PeerReport, key: string) => r.metrics.find((m) => m.key === key);

// Plain questions people ask about a specific bank, answered from the same
// figures as the table (rendered on the page and as FAQPage markup).
export function bankFaqs(r: PeerReport): { q: string; a: string }[] {
  const { NAME: name, CITY, STALP, ASSET, OFFICES, ESTYMD } = r.institution;
  const faqs: { q: string; a: string }[] = [];
  const offices = OFFICES ? ` and operates ${OFFICES} office${OFFICES === 1 ? '' : 's'}` : '';
  const since = ESTYMD ? `, established in ${ESTYMD.slice(-4)},` : '';
  faqs.push({
    q: `How big is ${name}?`,
    a: `${name}${since} is headquartered in ${CITY}, ${STALP}. It reported ${formatAssets(ASSET)} in total assets in its ${r.quarter} FDIC call report${offices}.`,
  });
  const roa = metric(r, 'roa');
  if (roa) {
    faqs.push({
      q: `What is ${name}'s return on assets?`,
      a: `${formatMetric(roa.bank, 'pct')} annualized in ${r.quarter}, against a ${formatMetric(roa.peerMedian, 'pct')} median for ${r.peerCount} ${r.peerScope}${roa.betterThanPct === undefined ? '' : `, ahead of ${roa.betterThanPct}% of them`}.`,
    });
  }
  const eff = metric(r, 'efficiency');
  if (eff) {
    faqs.push({
      q: `What is ${name}'s efficiency ratio?`,
      a: `${formatMetric(eff.bank, 'pct')} in ${r.quarter}: it spent about ${Math.round(eff.bank)} cents in noninterest expense for each dollar of revenue. The peer median is ${formatMetric(eff.peerMedian, 'pct')}, and lower is better.`,
    });
  }
  if (r.loanGrowthPct !== undefined) {
    faqs.push({
      q: `Is ${name} growing its loans?`,
      a: `Net loans ${r.loanGrowthPct >= 0 ? 'grew' : 'shrank'} ${Math.abs(r.loanGrowthPct).toFixed(1)}% over the year to ${r.quarter}${r.depositGrowthPct === undefined ? '' : `, while deposits ${r.depositGrowthPct >= 0 ? 'grew' : 'shrank'} ${Math.abs(r.depositGrowthPct).toFixed(1)}%`}.`,
    });
  }
  return faqs;
}
