import { ogCard, OG_SIZE } from '../../og-card';
import { DE_NOVO_BANKS, TRACKER_SUMMARY } from './de-novo-data';

// Link preview for the tracker (shared by the weekly De Novo Watch LinkedIn
// posts). Stats come from the data, so the card stays current with each update.

export const alt = 'RAVEN De Novo Watch: US de novo bank tracker';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  const opened = DE_NOVO_BANKS.filter((b) => b.status === 'open').length;
  return ogCard({
    eyebrow: `De Novo Watch  ·  Updated ${TRACKER_SUMMARY.updated}`,
    title: 'Who is starting a bank in 2026',
    subtitle: 'Every FDIC filing, approval and opening we track, with capital, leadership and technology',
    stats: [
      { label: '2026 FDIC applications', value: String(TRACKER_SUMMARY.nationalApplications2026) },
      { label: 'Florida applications', value: String(TRACKER_SUMMARY.floridaApplications2026) },
      { label: 'Banks tracked', value: String(DE_NOVO_BANKS.length) },
      { label: 'Opened', value: String(opened) },
    ],
  });
}
