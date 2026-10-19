import { ogCard, OG_SIZE } from '../../../og-card';
import { getRoiBank } from '../../../(marketing)/roi/roi-data';
import { AUDITS, getAudit } from '../../_config/audit-data';

// Per-audit link preview: the institution's name and two headline stats.

export const alt = 'RAVEN digital lending audit';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return AUDITS.filter((a) => getRoiBank(a.slug)).map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const audit = getAudit(slug);
  if (!audit) return ogCard({ eyebrow: 'Digital lending audit', title: 'Free digital lending audits for community banks' });
  return ogCard({
    eyebrow: 'Free digital lending audit',
    title: audit.bankName,
    subtitle: 'Borrower journey, gaps, and what verification automation would save',
    // Card space fits short figures only: drop qualifiers like "(member-owned)".
    stats: audit.stats
      .map((s) => ({ label: s.label, value: s.value.replace(/\s*\(.*\)/, '').trim() }))
      .filter((s) => s.value.length <= 12)
      .slice(0, 3),
  });
}
