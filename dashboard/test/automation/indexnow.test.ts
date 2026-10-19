import { describe, it, expect } from 'vitest';
import { changedSitemapUrls } from '../../../automation/indexnow';

const xml = (rows: [string, string][]) =>
  `<urlset>${rows.map(([loc, mod]) => `<url>\n<loc>${loc}</loc>\n<lastmod>${mod}</lastmod>\n</url>`).join('\n')}</urlset>`;

describe('changedSitemapUrls', () => {
  it('returns new URLs and URLs whose lastmod changed', () => {
    const seen = { 'https://x/a': '2026-07-01', 'https://x/b': '2026-07-01' };
    const { changed, next } = changedSitemapUrls(
      xml([
        ['https://x/a', '2026-07-01'],
        ['https://x/b', '2026-10-19'],
        ['https://x/c', '2026-10-19'],
      ]),
      seen,
    );
    expect(changed).toEqual(['https://x/b', 'https://x/c']);
    expect(next['https://x/c']).toBe('2026-10-19');
  });
});

describe('changedSitemapUrls during an FDIC outage', () => {
  const seen = { 'https://x/bank': '2026-08-19', 'https://x/a': '2026-07-01' };

  it('keeps URLs that briefly drop out, so they are not re-pinged on return', () => {
    const { changed, next } = changedSitemapUrls(xml([['https://x/a', '2026-07-01']]), seen);
    expect(changed).toEqual([]);
    expect(next['https://x/bank']).toBe('2026-08-19');
  });

  it('treats a missing lastmod as unchanged', () => {
    const { changed } = changedSitemapUrls('<urlset><url>\n<loc>https://x/bank</loc>\n</url></urlset>', seen);
    expect(changed).toEqual([]);
  });

  it('pings every bank page when a new quarter moves the lastmod', () => {
    const { changed } = changedSitemapUrls(xml([['https://x/bank', '2026-11-20'], ['https://x/a', '2026-07-01']]), seen);
    expect(changed).toEqual(['https://x/bank']);
  });
});
