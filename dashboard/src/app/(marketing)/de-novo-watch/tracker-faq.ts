import { DE_NOVO_BANKS, TRACKER_SUMMARY, type DeNovoStatus } from './de-novo-data';

// FAQ answers are built from the tracker rows, so the weekly unattended update
// keeps them true without anyone editing prose. Rendered on the page and as
// FAQPage JSON-LD (the two must match).

export interface TrackerFaq {
  q: string;
  a: string;
}

function list(status: DeNovoStatus): string {
  const rows = DE_NOVO_BANKS.filter((b) => b.status === status);
  return rows.map((b) => `${b.name} (${b.location})`).join('; ');
}

export function trackerFaqs(): TrackerFaq[] {
  const faqs: TrackerFaq[] = [
    {
      q: 'How many de novo bank applications have been filed in 2026?',
      a: `${TRACKER_SUMMARY.nationalApplications2026} FDIC deposit insurance applications were filed nationally in 2026, ${TRACKER_SUMMARY.floridaApplications2026} of them for Florida banks, according to RAVEN's count of FDIC records (tracker updated ${TRACKER_SUMMARY.updated}).`,
    },
  ];
  const open = list('open');
  if (open) faqs.push({ q: 'Which new banks have opened recently?', a: `Recently opened banks on the tracker: ${open}.` });
  const approved = [list('chartered'), list('conditional-approval')].filter(Boolean).join('; ');
  if (approved) {
    faqs.push({ q: 'Which proposed banks are approved but not yet open?', a: `Chartered or conditionally approved and not yet open: ${approved}.` });
  }
  const pending = list('application-pending');
  if (pending) faqs.push({ q: 'Which de novo bank applications are still pending?', a: `Pending applications on the tracker: ${pending}.` });
  faqs.push({
    q: 'Can I use this data?',
    a: 'Yes. The tracker is free to cite with attribution to RAVEN (reportraven.tech), and the rows are available as a CSV download at reportraven.tech/de-novo-watch/data.csv.',
  });
  return faqs;
}
