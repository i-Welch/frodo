// Compares the LinkedIn graphic variants (see graphics.ts) per post and per
// variant on two sources:
//   - LinkedIn: impressions and engagement, read from the page's analytics
//     table (linkedin-browser.ts) and kept in %USERPROFILE%\.raven\linkedin-stats.json
//   - the site: visits the posted links brought in, from Vercel Web Analytics
//     grouped by utm_campaign (the post's slug) and utm_content (the variant)
// The Monday digest (digest.ts) refreshes the LinkedIn numbers and includes
// the per-variant summary.
//
// Usage: bun automation/ab-report.ts [--refresh]   (--refresh re-reads LinkedIn first)
// Needs the Vercel CLI signed in to the team that owns the frodo project.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { GRAPHIC_VARIANTS, loadAbLog, type AbEntry, type GraphicVariant } from './graphics';
import { readPostAnalytics, type PostAnalytics } from './linkedin-browser';

const PROJECT = 'frodo';
const TEAM = 'team_Jd74RPAZq8LYaVpzn69Bbb7K';
const STATS_FILE = join(homedir(), '.raven', 'linkedin-stats.json');

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

/* ---------- LinkedIn numbers ---------- */

type StoredStats = Record<string, PostAnalytics & { fetchedAt: string }>;

function loadStats(): StoredStats {
  return existsSync(STATS_FILE) ? JSON.parse(readFileSync(STATS_FILE, 'utf8')) : {};
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** The analytics row for a logged post: posted within a day of it, with a
 *  title that starts like the article title or the post's first line. */
export function matchRow(entry: AbEntry, rows: PostAnalytics[], taken: Set<string>): PostAnalytics | undefined {
  const posted = Date.parse(entry.postedAt);
  const keys = [entry.title, entry.hook].filter(Boolean).map((k) => norm(k!).slice(0, 30));
  return rows.find((r) => {
    if (taken.has(r.urn) || !r.date || Math.abs(Date.parse(`${r.date}T12:00:00Z`) - posted) > 36 * 3_600_000) return false;
    const title = norm(r.title);
    return keys.some((k) => k && (title.startsWith(k) || k.startsWith(title.slice(0, 30))));
  });
}

/** Re-reads LinkedIn's analytics table and stores the numbers for every
 *  logged post it can match. Returns how many posts were matched. */
export async function refreshLinkedInStats(): Promise<number> {
  const rows = await readPostAnalytics();
  const stats = loadStats();
  const taken = new Set<string>();
  let matched = 0;
  for (const [slug, entry] of Object.entries(loadAbLog())) {
    const row = matchRow(entry, rows, taken);
    if (!row) continue;
    taken.add(row.urn);
    stats[slug] = { ...row, fetchedAt: new Date().toISOString() };
    matched++;
  }
  writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  return matched;
}

/* ---------- Report ---------- */

interface Metrics {
  posts: number;
  visitors: number;
  impressions: number;
  clicks: number;
  engagements: number;
  measured: number; // posts with LinkedIn numbers
}

export interface AbReport {
  posts: ({ slug: string; variant: GraphicVariant } & Omit<Metrics, 'posts' | 'measured'> & { measured: boolean })[];
  totals: ({ variant: GraphicVariant } & Metrics)[];
}

export function abReport(): AbReport | null {
  const entries = Object.entries(loadAbLog()).sort((a, b) => a[1].postedAt.localeCompare(b[1].postedAt));
  if (entries.length === 0) return null;
  const rows = visitsByCampaign(entries[0][1].postedAt);
  const stats = loadStats();
  const posts = entries.map(([slug, entry]) => {
    const s = stats[slug];
    return {
      slug,
      variant: entry.variant,
      visitors: rows
        .filter((r) => r.utmCampaign === slug && r.utmContent === entry.variant)
        .reduce((n, r) => n + r.visitors, 0),
      impressions: s?.impressions ?? 0,
      clicks: s?.clicks ?? 0,
      engagements: s ? s.clicks + s.reactions + s.comments + s.reposts : 0,
      measured: Boolean(s),
    };
  });
  const totals = GRAPHIC_VARIANTS.map((variant) => {
    const mine = posts.filter((p) => p.variant === variant);
    const sum = (k: 'visitors' | 'impressions' | 'clicks' | 'engagements') => mine.reduce((n, p) => n + p[k], 0);
    return {
      variant,
      posts: mine.length,
      visitors: sum('visitors'),
      impressions: sum('impressions'),
      clicks: sum('clicks'),
      engagements: sum('engagements'),
      measured: mine.filter((p) => p.measured).length,
    };
  });
  return { posts, totals };
}

const pct = (n: number, d: number) => (d ? `${((100 * n) / d).toFixed(1)}%` : '-');
const per = (n: number, d: number) => (d ? (n / d).toFixed(1) : '-');

/** One line per variant, for the Monday digest. */
export function abDigestLines(): string[] {
  try {
    const report = abReport();
    if (!report) return ['LinkedIn graphic test: no posts yet.'];
    return [
      'LinkedIn graphic test (per post, all time):',
      ...report.totals.map(
        (t) =>
          `  - ${t.variant}: ${t.posts} posts, ${per(t.impressions, t.measured)} impressions, ` +
          `${pct(t.engagements, t.impressions)} engagement, ${per(t.visitors, t.posts)} site visitors`,
      ),
    ];
  } catch (err) {
    return [`LinkedIn graphic test: could not build the report (${(err as Error).message.split('\n')[0]})`];
  }
}

if (import.meta.main) {
  if (process.argv.includes('--refresh')) console.log(`Matched ${await refreshLinkedInStats()} posts to LinkedIn analytics.\n`);
  const report = abReport();
  if (!report) {
    console.log('No graphic-variant posts yet.');
    process.exit(0);
  }
  console.table(report.posts.map((p) => ({ post: p.slug.slice(0, 50), variant: p.variant, impressions: p.measured ? p.impressions : '-', engagements: p.measured ? p.engagements : '-', visitors: p.visitors })));
  console.table(
    report.totals.map((t) => ({
      variant: t.variant,
      posts: t.posts,
      'impressions/post': per(t.impressions, t.measured),
      'engagement rate': pct(t.engagements, t.impressions),
      'LinkedIn CTR': pct(t.clicks, t.impressions),
      'visitors/post': per(t.visitors, t.posts),
    })),
  );
  console.log('Small samples: read this as a direction after 5+ posts per variant, not a verdict.');
}
