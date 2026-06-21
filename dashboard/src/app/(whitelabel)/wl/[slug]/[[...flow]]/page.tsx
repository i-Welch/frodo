import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWlConfig } from '../../../_config/registry';
import { flowForPath, resolveFlow, type FlowKind } from '../../../_config/flows';
import { Journey } from '../journey';

/**
 * White-label borrower journey. The optional path segment selects the flow:
 *   /wl/<slug>            -> default flow (first allowed)
 *   /wl/<slug>/apply      -> full_application
 *   /wl/<slug>/check-rate -> rate_range
 *   /wl/<slug>/verify     -> data_only
 * The requested flow is gated server-side against the tenant's allowed flows.
 */

function resolve(slug: string, flowSeg?: string) {
  const config = getWlConfig(slug);
  if (!config) return null;
  const allowed = config.defaultFlows ?? (['rate_range'] as FlowKind[]);
  // A present-but-unknown segment is a real 404, not a silent default.
  if (flowSeg && !flowForPath(flowSeg)) return null;
  const requested = flowSeg ? flowForPath(flowSeg) : undefined;
  const flow = resolveFlow(requested, allowed) ?? allowed[0] ?? 'rate_range';
  return { config, flow };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; flow?: string[] }>;
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
  params: Promise<{ slug: string; flow?: string[] }>;
  searchParams: Promise<{ chrome?: string }>;
}) {
  const { slug, flow } = await params;
  const { chrome } = await searchParams;
  const resolved = resolve(slug, flow?.[0]);
  if (!resolved) notFound();
  const { config, flow: flowKind } = resolved;

  return (
    <>
      {config.branding.googleFont && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${config.branding.googleFont.replace(/ /g, '+')}:wght@400;600;700;800&display=swap`}
        />
      )}
      <Journey config={config} initialFlow={flowKind} showChrome={chrome !== '0'} />
    </>
  );
}
