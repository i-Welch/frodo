import { articles } from '../articles-index';
import { BLOG_DATES, BLOG_SLUGS } from '../published';

// RSS 2.0 feed of published articles, for feed readers and syndication.
// Built from the same published list as the sitemap, so drafts never leak.

const SITE = 'https://reportraven.tech';

export const dynamic = 'force-static';

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);
}

export function GET() {
  const published = new Set<string>(BLOG_SLUGS);
  const items = articles
    .filter((a) => published.has(a.slug) && BLOG_DATES[a.slug])
    .sort((a, b) => BLOG_DATES[b.slug].localeCompare(BLOG_DATES[a.slug]))
    .slice(0, 50);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>RAVEN Research</title>
<link>${SITE}/blog</link>
<atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml" />
<description>Original analysis of community banks and credit unions, built from FDIC, NCUA, HMDA and SEC filings.</description>
<language>en-us</language>
${items.length ? `<lastBuildDate>${new Date(`${BLOG_DATES[items[0].slug]}T12:00:00Z`).toUTCString()}</lastBuildDate>` : ''}
${items
  .map(
    (a) => `<item>
<title>${escapeXml(a.title)}</title>
<link>${SITE}/blog/${a.slug}</link>
<guid isPermaLink="true">${SITE}/blog/${a.slug}</guid>
<pubDate>${new Date(`${BLOG_DATES[a.slug]}T12:00:00Z`).toUTCString()}</pubDate>
<description>${escapeXml(a.description)}</description>
</item>`,
  )
  .join('\n')}
</channel>
</rss>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
