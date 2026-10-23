import { certFromParam, getInstitution, stateAwards, stateRankings } from '../../peer-data';
import { badgeSvg } from '../../badge';

// The embeddable top-ten badge (see the bank page's "Embed" box). Refreshes
// daily, so it follows the bank into each new quarter's rankings.

export const revalidate = 86400;

export async function GET(_req: Request, { params }: { params: Promise<{ bank: string }> }) {
  const cert = certFromParam((await params).bank);
  const inst = cert ? await getInstitution(cert) : undefined;
  if (!cert || !inst) return new Response('Not found', { status: 404 });
  const rankings = await stateRankings(inst.STALP);
  const [best] = rankings ? stateAwards(rankings, cert) : [];
  return new Response(badgeSvg(best), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
