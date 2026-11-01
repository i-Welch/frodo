import { ogCard, OG_SIZE } from '../../../og-card';
import { certFromParam, formatAssets, peerReport } from '../peer-data';

// Link preview for a bank's peer snapshot: its numbers against the peer median.

export const alt = 'Bank peer comparison from FDIC call reports';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ bank: string }> }) {
  const cert = certFromParam((await params).bank);
  const r = cert ? await peerReport(cert) : undefined;
  if (!r) return ogCard({ eyebrow: 'RAVEN Bank Peer Snapshot', title: 'How does your bank compare with its peers?' });
  const vs = (key: string) => {
    const m = r.metrics.find((x) => x.key === key);
    // One decimal so three pairs fit across the card.
    return m ? `${m.bank.toFixed(1)}% vs ${m.peerMedian.toFixed(1)}%` : '–';
  };
  return ogCard({
    eyebrow: `RAVEN Bank Peer Snapshot  ·  ${r.quarter}`,
    title: r.institution.NAME,
    subtitle: `${r.institution.CITY}, ${r.institution.STALP}  ·  ${formatAssets(r.institution.ASSET)} assets  ·  vs. ${r.peerCount} peers`,
    stats: [
      { label: 'ROA vs peer median', value: vs('roa') },
      { label: 'Efficiency vs peers', value: vs('efficiency') },
      { label: 'NIM vs peers', value: vs('nim') },
    ],
  });
}
