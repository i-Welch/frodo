// Compares the LinkedIn graphic variants (see graphics.ts): posts per variant
// and the site visits their links brought in, from Vercel Web Analytics
// grouped by utm_campaign (the post's slug) and utm_content (the variant).
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

const log = loadAbLog();
const entries = Object.entries(log);
if (entries.length === 0) {
  console.log('No graphic-variant posts yet.');
  process.exit(0);
}

const since = entries.map(([, e]) => e.postedAt).sort()[0];
const rows = visitsByCampaign(since);

const totals = new Map<GraphicVariant, { posts: number; visitors: number; pageviews: number }>(
  GRAPHIC_VARIANTS.map((v) => [v, { posts: 0, visitors: 0, pageviews: 0 }]),
);
console.log('Post'.padEnd(60), 'Variant'.padEnd(10), 'Visitors');
for (const [slug, entry] of entries.sort((a, b) => a[1].postedAt.localeCompare(b[1].postedAt))) {
  const hits = rows.filter((r) => r.utmCampaign === slug && r.utmContent === entry.variant);
  const visitors = hits.reduce((n, r) => n + r.visitors, 0);
  const t = totals.get(entry.variant)!;
  t.posts += 1;
  t.visitors += visitors;
  t.pageviews += hits.reduce((n, r) => n + r.pageviews, 0);
  console.log(slug.slice(0, 59).padEnd(60), entry.variant.padEnd(10), visitors);
}

console.log('\nVariant'.padEnd(11), 'Posts'.padEnd(7), 'Visitors'.padEnd(10), 'Per post');
for (const [variant, t] of totals) {
  console.log(variant.padEnd(10), String(t.posts).padEnd(7), String(t.visitors).padEnd(10), t.posts ? (t.visitors / t.posts).toFixed(1) : '-');
}
console.log('\nSmall samples: read this as a direction after 5+ posts per variant, not a verdict.');
console.log('Impressions and reactions per post: LinkedIn page admin > Analytics > Content.');
