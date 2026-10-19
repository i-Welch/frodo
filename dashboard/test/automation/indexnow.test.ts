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
