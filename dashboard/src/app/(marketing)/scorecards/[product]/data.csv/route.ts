import { PRODUCT_TYPES, productType } from '../../products';
import { scorecardCsv } from '../../csv';

// CSV export of one product scorecard, free to cite and reuse with attribution.

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCT_TYPES.map((p) => ({ product: p.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ product: string }> }) {
  const type = productType((await params).product);
  if (!type) return new Response('Not found', { status: 404 });
  return new Response(scorecardCsv(type), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `inline; filename="raven-${type.slug}-scorecard.csv"`,
    },
  });
}
