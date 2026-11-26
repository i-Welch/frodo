import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DEFAULT_OG_IMAGES } from '@/app/og-default';
import { PRODUCT_TYPES, SITE, productType, scorecardPath } from '../products';
import { ScorecardPage, scorecardDescription, scorecardTitle } from '../scorecard-page';

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCT_TYPES.map((p) => ({ product: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ product: string }> }): Promise<Metadata> {
  const type = productType((await params).product);
  if (!type) return { title: 'Scorecard not found', robots: { index: false } };
  const title = scorecardTitle(type, 'all');
  const description = scorecardDescription(type, 'all');
  const url = `${SITE}${scorecardPath(type.slug)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'RAVEN', type: 'website', images: DEFAULT_OG_IMAGES },
  };
}

export default async function ProductScorecard({ params }: { params: Promise<{ product: string }> }) {
  const type = productType((await params).product);
  if (!type) notFound();
  return <ScorecardPage type={type} view="all" />;
}
