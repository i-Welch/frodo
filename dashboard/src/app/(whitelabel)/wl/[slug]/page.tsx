import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WL_CONFIGS, getWlConfig } from '../../_config/registry';
import { Journey } from './journey';

export function generateStaticParams() {
  return WL_CONFIGS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getWlConfig(slug);
  if (!config) return {};
  return {
    title: `${config.branding.name} — Apply Online`,
    description: `Find the right ${config.branding.shortName} lending product and get verified in minutes. A RAVEN white-label demo.`,
    robots: { index: false, follow: false },
  };
}

export default async function WhiteLabelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ chrome?: string }>;
}) {
  const { slug } = await params;
  const { chrome } = await searchParams;
  const config = getWlConfig(slug);
  if (!config) notFound();

  return (
    <>
      {config.branding.googleFont && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${config.branding.googleFont.replace(/ /g, '+')}:wght@400;600;700;800&display=swap`}
        />
      )}
      <Journey config={config} showChrome={chrome !== '0'} />
    </>
  );
}
