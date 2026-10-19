// Groups a week of page visits into per-bank interest in their audit and demo
// (see digest.ts).

export function warmAccounts(rows: { requestPath: string; visitors: number }[], nameFor: (slug: string) => string): string[] {
  const bySlug = new Map<string, { audit: number; demo: number }>();
  for (const r of rows) {
    const m = /^\/(audit|wl)\/([a-z0-9-]+)/.exec(r.requestPath);
    if (!m) continue;
    const entry = bySlug.get(m[2]) ?? { audit: 0, demo: 0 };
    entry[m[1] === 'audit' ? 'audit' : 'demo'] += r.visitors;
    bySlug.set(m[2], entry);
  }
  const ranked = [...bySlug].sort((a, b) => b[1].audit + b[1].demo - (a[1].audit + a[1].demo)).slice(0, 10);
  if (ranked.length === 0) return [];
  return [
    'Banks looking at their audit or demo this week (follow up):',
    ...ranked.map(([slug, v]) => `  - ${nameFor(slug)}: ${v.audit + v.demo} visitors (audit ${v.audit}, demo ${v.demo}) https://reportraven.tech/audit/${slug}`),
  ];
}
