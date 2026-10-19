// Per-bank interest in their own audit and white-label demo, from Vercel
// Analytics. Those pages are mostly viewed by people at that bank, so this is
// the warmest sales signal on the site. Used by the Monday digest (weekly list)
// and auto-publish (same-day alert).

import { execFileSync } from 'node:child_process';

export interface PageVisits {
  requestPath: string;
  visitors: number;
}

/** Visitors per bank slug, split between the audit and the demo. */
export function visitsBySlug(rows: PageVisits[]): Map<string, { audit: number; demo: number }> {
  const bySlug = new Map<string, { audit: number; demo: number }>();
  for (const r of rows) {
    const m = /^\/(audit|wl)\/([a-z0-9-]+)/.exec(r.requestPath);
    if (!m) continue;
    const entry = bySlug.get(m[2]) ?? { audit: 0, demo: 0 };
    entry[m[1] === 'audit' ? 'audit' : 'demo'] += r.visitors;
    bySlug.set(m[2], entry);
  }
  return bySlug;
}

export function warmAccounts(rows: PageVisits[], nameFor: (slug: string) => string): string[] {
  const ranked = [...visitsBySlug(rows)].sort((a, b) => b[1].audit + b[1].demo - (a[1].audit + a[1].demo)).slice(0, 10);
  if (ranked.length === 0) return [];
  return [
    'Banks looking at their audit or demo this week (follow up):',
    ...ranked.map(([slug, v]) => `  - ${nameFor(slug)}: ${v.audit + v.demo} visitors (audit ${v.audit}, demo ${v.demo}) https://reportraven.tech/audit/${slug}`),
  ];
}

/** Banks with at least `threshold` visitors across their audit and demo. */
export function hotAccounts(rows: PageVisits[], threshold: number): { slug: string; audit: number; demo: number }[] {
  return [...visitsBySlug(rows)].filter(([, v]) => v.audit + v.demo >= threshold).map(([slug, v]) => ({ slug, ...v }));
}

/**
 * Page visits since `since`, via the Vercel CLI's login on this PC (the
 * analytics MCP gets 403). Throws if the CLI is missing or logged out.
 */
export function fetchPageVisits(since: Date, cwd: string): PageVisits[] {
  const url = `/v1/query/web-analytics/visits/aggregate?projectId=frodo&teamId=team_Jd74RPAZq8LYaVpzn69Bbb7K&by=requestPath&since=${since.toISOString()}&until=${new Date().toISOString()}&limit=100`;
  // shell: vercel is a .cmd shim on Windows; quote the URL so cmd keeps the &s.
  const out = execFileSync('vercel', ['api', `"${url}"`, '--method', 'GET'], { cwd, encoding: 'utf8', shell: true, stdio: ['ignore', 'pipe', 'ignore'] });
  return (JSON.parse(out) as { data: PageVisits[] }).data;
}
