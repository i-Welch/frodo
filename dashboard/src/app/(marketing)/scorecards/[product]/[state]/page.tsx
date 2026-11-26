import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DEFAULT_OG_IMAGES } from '@/app/og-default';
import { PRODUCT_TYPES, SITE, productType, scorecardPath, stateFromScorecardSlug } from '../../products';
import { ScorecardPage, scorecardDescription, scorecardTitle } from '../../scorecard-page';
import { SCORECARD_STATES, STATE_LABELS } from '../../types';

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCT_TYPES.flatMap((p) => SCORECARD_STATES.map((s) => ({ product: p.slug, state: STATE_LABELS[s].slug })));
}

async function resolve(params: Promise<{ product: string; state: string }>) {
  const { product, state } = await params;
  const type = productType(product);
  const view = stateFromScorecardSlug(state);
  return type && view ? { type, view } : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ product: string; state: string }> }): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return { title: 'Scorecard not found', robots: { index: false } };
  const title = scorecardTitle(r.type, r.view);
  const description = scorecardDescription(r.type, r.view);
  const url = `${SITE}${scorecardPath(r.type.slug, r.view)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'RAVEN', type: 'website', images: DEFAULT_OG_IMAGES },
  };
}

export default async function StateScorecard({ params }: { params: Promise<{ product: string; state: string }> }) {
  const r = await resolve(params);
  if (!r) notFound();
  return <ScorecardPage type={r.type} view={r.view} />;
}
