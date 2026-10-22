import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { articles } from '../../src/app/(marketing)/blog/articles-index';
import { BLOG_DATES, BLOG_SLUGS, BLOG_UPDATED } from '../../src/app/(marketing)/blog/published';
import { ROI_BANKS, getRoiBank } from '../../src/app/(marketing)/roi/roi-data';
import { getAudit } from '../../src/app/(whitelabel)/_config/audit-data';
import { getWlConfig } from '../../src/app/(whitelabel)/_config/registry';

// Article, audit and LinkedIn PRs from the scheduled automation merge without a
// human review, so CI checks that every piece is wired together. A failure here
// blocks the auto-merge and alerts Isaac.

const ROOT = resolve(__dirname, '../../..');
const ARTICLE_PAGE = join(ROOT, 'dashboard/src/app/(marketing)/blog/[slug]/page.tsx');
const QUEUE_DIR = join(ROOT, 'marketing/linkedin/queue');

// Keys of the (unexported) `articles` map in blog/[slug]/page.tsx.
const articleKeys = new Set(
  [...readFileSync(ARTICLE_PAGE, 'utf8').matchAll(/^ {2}'([a-z0-9-]+)': \{/gm)].map((m) => m[1]),
);

describe('content integrity', () => {
  it('every published slug has a date, an index entry, and article content', () => {
    const indexed = new Set(articles.map((a) => a.slug));
    for (const slug of BLOG_SLUGS) {
      expect(BLOG_DATES[slug], `${slug}: missing BLOG_DATES entry`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(indexed.has(slug), `${slug}: missing from articles-index.ts`).toBe(true);
      expect(articleKeys.has(slug), `${slug}: missing from blog/[slug]/page.tsx`).toBe(true);
    }
  });

  it('corrected articles carry their correction date into the sitemap', () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const page = readFileSync(ARTICLE_PAGE, 'utf8').replace(/\r\n/g, '\n');
    for (const m of page.matchAll(/^ {2}'([a-z0-9-]+)': \{\n([\s\S]*?)\n {4}content: `/gm)) {
      const [, slug, head] = m;
      const u = head.match(/updatedDate: '(\w+) (\d+), (\d{4})'/);
      if (!u || !BLOG_SLUGS.includes(slug)) continue;
      const iso = `${u[3]}-${String(months.indexOf(u[1]) + 1).padStart(2, '0')}-${u[2].padStart(2, '0')}`;
      if (iso > BLOG_DATES[slug]) {
        expect(BLOG_UPDATED[slug], `${slug}: add '${iso}' to BLOG_UPDATED in published.ts`).toBe(iso);
      }
    }
  });

  it('has no duplicate slugs', () => {
    const slugs = articles.map((a) => a.slug);
    expect(slugs.filter((s, i) => slugs.indexOf(s) !== i)).toEqual([]);
    expect(BLOG_SLUGS.filter((s, i) => BLOG_SLUGS.indexOf(s) !== i)).toEqual([]);
  });

  it('every linked audit renders (audit record, ROI entry, white-label config)', () => {
    for (const a of articles.filter((x) => x.auditSlug)) {
      const slug = a.auditSlug!;
      expect(getAudit(slug), `${a.slug}: no audit record for ${slug}`).toBeTruthy();
      expect(getRoiBank(slug), `${a.slug}: no ROI_BANKS entry for ${slug}`).toBeTruthy();
      expect(getWlConfig(slug), `${a.slug}: no white-label config for ${slug}`).toBeTruthy();
    }
  });

  it('every ROI entry that names an article points at a real one', () => {
    for (const bank of ROI_BANKS.filter((b) => b.articleSlug)) {
      expect(articleKeys.has(bank.articleSlug!), `${bank.slug}: articleSlug ${bank.articleSlug} does not exist`).toBe(true);
    }
  });

  it('LinkedIn queue files are well formed', () => {
    if (!existsSync(QUEUE_DIR)) return;
    for (const file of readdirSync(QUEUE_DIR).filter((f) => f.endsWith('.md'))) {
      const raw = readFileSync(join(QUEUE_DIR, file), 'utf8').replace(/\r\n/g, '\n');
      const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      expect(match, `${file}: missing front matter`).toBeTruthy();
      const meta = Object.fromEntries(
        match![1].split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]),
      );
      const body = match![2].trim();
      expect(meta.slug, `${file}: slug must match the file name`).toBe(file.replace(/\.md$/, ''));
      expect(meta.title && meta.description, `${file}: title and description are required`).toBeTruthy();
      expect(meta.url, `${file}: url`).toMatch(/^https:\/\/reportraven\.tech\/(blog\/[a-z0-9-]+|de-novo-watch|bank-tech-stack)$/);
      const blogSlug = meta.url.match(/\/blog\/([a-z0-9-]+)$/)?.[1];
      if (blogSlug) expect(articleKeys.has(blogSlug), `${file}: links to unknown article ${blogSlug}`).toBe(true);
      if (meta.notBefore) expect(meta.notBefore, `${file}: notBefore`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(body.includes('—'), `${file}: no em dashes`).toBe(false);
      expect(body.split('\n').at(-1)!.match(/#\w+/g)?.length, `${file}: last line must be exactly five hashtags`).toBe(5);
    }
  });
});
