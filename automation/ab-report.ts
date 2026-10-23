// Compares the LinkedIn graphic variants (see graphics.ts): posts per variant
// and the site visits their links brought in, from Vercel Web Analytics
// grouped by utm_campaign (the post's slug) and utm_content (the variant).
// The Monday digest (digest.ts) includes the per-variant summary.
//
// Usage: bun automation/ab-report.ts
// Needs the Vercel CLI signed in to the team that owns the frodo project.

import { GRAPHIC_VARIANTS, loadAbLog, type GraphicVariant } from './graphics';

const PROJECT = 'frodo';
const TEAM = 'team_Jd74RPAZq8LYaVpzn69Bbb7K';

interface Row {
  utmCampaign: string;
  utmContent: string;
  visitors: number;
  pageviews: number;
}

function visitsByCampaign(since: string): Row[] {
  const query = new URLSearchParams({ projectId: PROJECT, teamId: TEAM, since, until: new Date().toISOString(), limit: '100' });
  query.append('by', 'utmCampaign');
  query.append('by', 'utmContent');
  const res = Bun.spawnSync(['vercel', 'api', `/v1/query/web-analytics/visits/aggregate?${query}`], { stderr: 'pipe' });
  if (res.exitCode !== 0) throw new Error(`vercel api failed: ${res.stderr.toString().trim()}`);
  return (JSON.parse(res.stdout.toString()) as { data: Row[] }).data;
}

export interface AbReport {
  posts: { slug: string; variant: GraphicVariant; visitors: number }[];
  totals: { variant: GraphicVariant; posts: number; visitors: number }[];
}

export function abReport(): AbReport | null {
  const entries = Object.entries(loadAbLog()).sort((a, b) => a[1].postedAt.localeCompare(b[1].postedAt));
  if (entries.length === 0) return null;
  const rows = visitsByCampaign(entries[0][1].postedAt);
  const posts = entries.map(([slug, entry]) => ({
    slug,
    variant: entry.variant,
    visitors: rows
      .filter((r) => r.utmCampaign === slug && r.utmContent === entry.variant)
      .reduce((n, r) => n + r.visitors, 0),
  }));
  const totals = GRAPHIC_VARIANTS.map((variant) => {
    const mine = posts.filter((p) => p.variant === variant);
    return { variant, posts: mine.length, visitors: mine.reduce((n, p) => n + p.visitors, 0) };
  });
  return { posts, totals };
}

/** One line per variant, for the Monday digest. */
export function abDigestLines(): string[] {
  try {
    const report = abReport();
    if (!report) return ['LinkedIn graphic test: no posts yet.'];
    return [
      'LinkedIn graphic test (visitors per post, all time):',
      ...report.totals.map((t) => `  - ${t.variant}: ${t.posts ? (t.visitors / t.posts).toFixed(1) : '-'} (${t.visitors} from ${t.posts} posts)`),
    ];
  } catch (err) {
    return [`LinkedIn graphic test: could not read Vercel Analytics (${(err as Error).message.split('\n')[0]})`];
  }
}

if (import.meta.main) {
  const report = abReport();
  if (!report) {
    console.log('No graphic-variant posts yet.');
    process.exit(0);
  }
  console.log('Post'.padEnd(60), 'Variant'.padEnd(10), 'Visitors');
  for (const p of report.posts) console.log(p.slug.slice(0, 59).padEnd(60), p.variant.padEnd(10), p.visitors);
  console.log('\nVariant'.padEnd(11), 'Posts'.padEnd(7), 'Visitors'.padEnd(10), 'Per post');
  for (const t of report.totals) {
    console.log(t.variant.padEnd(10), String(t.posts).padEnd(7), String(t.visitors).padEnd(10), t.posts ? (t.visitors / t.posts).toFixed(1) : '-');
  }
  console.log('\nSmall samples: read this as a direction after 5+ posts per variant, not a verdict.');
  console.log('Impressions and reactions per post: LinkedIn page admin > Analytics > Content.');
}
