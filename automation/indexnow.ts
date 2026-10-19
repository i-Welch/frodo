// IndexNow: tells Bing (which feeds ChatGPT and Copilot search), Yandex and
// others about new or updated URLs right away instead of waiting for a crawl.
// The key is public by design; it is served from dashboard/public/<key>.txt.

const KEY = 'e9ef4dc637a46f8a29574526724abb0c';
const HOST = 'reportraven.tech';

export async function pingIndexNow(urls: string[]): Promise<void> {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
  });
  // 200 and 202 both mean accepted.
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow ${res.status}: ${await res.text()}`);
  }
}

/**
 * URLs in a sitemap that are new or whose <lastmod> changed since `seen`
 * (loc -> lastmod from the previous run), plus the map to store for next time.
 */
export function changedSitemapUrls(xml: string, seen: Record<string, string>): { changed: string[]; next: Record<string, string> } {
  const next: Record<string, string> = {};
  for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    if (loc) next[loc] = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() ?? '';
  }
  const changed = Object.keys(next).filter((loc) => seen[loc] !== next[loc]);
  return { changed, next };
}
