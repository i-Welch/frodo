/**
 * cbanc-fetch.ts — CBANC community post scraper
 *
 * Usage:
 *   bun run scripts/cbanc-fetch.ts               # scrape live (default)
 *   bun run scripts/cbanc-fetch.ts --discover     # dump raw HTML to help tune selectors
 *   bun run scripts/cbanc-fetch.ts --file <path>  # read from a local JSON file instead
 *
 * Requires CBANC_EMAIL and CBANC_PASSWORD in .env
 * Run once: bunx playwright install chromium
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import * as dotenv from 'dotenv';

dotenv.config();

export interface CbancPost {
  id: string;
  title: string;
  body: string;
  author?: string;
  authorTitle?: string;
  category?: string;
  url?: string;
  postedAt?: string;
  replyCount?: number;
}

const args = process.argv.slice(2);
const fileFlag = args.indexOf('--file');
const discoverFlag = args.includes('--discover');
const useFile = fileFlag !== -1;

async function fetchFromFile(filePath: string): Promise<CbancPost[]> {
  if (!existsSync(filePath)) {
    process.stderr.write(`File not found: ${filePath}\n`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(filePath, 'utf8')) as CbancPost[];
}

async function login() {
  const email = process.env.CBANC_EMAIL;
  const password = process.env.CBANC_PASSWORD;
  if (!email || !password) {
    process.stderr.write(
      'Missing CBANC_EMAIL or CBANC_PASSWORD in .env\n' +
      'Add them like:\n  CBANC_EMAIL=you@bank.com\n  CBANC_PASSWORD=yourpassword\n',
    );
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  process.stderr.write('Navigating to CBANC login...\n');
  await page.goto('https://community.cbancnetwork.com/login', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Try multiple common login field selectors — we tune after first --discover run
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[name="username"]',
    'input[id="email"]',
    'input[placeholder*="email" i]',
  ];
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[id="password"]',
  ];
  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Sign in")',
    'button:has-text("Log in")',
    'button:has-text("Login")',
    'button:has-text("Sign In")',
  ];

  let filled = false;
  for (const sel of emailSelectors) {
    try {
      await page.fill(sel, email, { timeout: 3000 });
      filled = true;
      process.stderr.write(`Email filled with: ${sel}\n`);
      break;
    } catch { /* try next */ }
  }
  if (!filled) {
    process.stderr.write('Could not find email field. Run --discover to inspect the page.\n');
    await browser.close();
    process.exit(1);
  }

  let pwFilled = false;
  for (const sel of passwordSelectors) {
    try {
      await page.fill(sel, password, { timeout: 3000 });
      pwFilled = true;
      process.stderr.write(`Password filled with: ${sel}\n`);
      break;
    } catch { /* try next */ }
  }
  if (!pwFilled) {
    process.stderr.write('Could not find password field. Run --discover to inspect the page.\n');
    await browser.close();
    process.exit(1);
  }

  for (const sel of submitSelectors) {
    try {
      await page.click(sel, { timeout: 3000 });
      process.stderr.write(`Clicked submit: ${sel}\n`);
      break;
    } catch { /* try next */ }
  }

  await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15000 })
    .catch(() => process.stderr.write('Warning: still on login page — check credentials\n'));

  process.stderr.write(`Logged in. Current URL: ${page.url()}\n`);
  return { browser, page };
}

async function discover() {
  const { browser, page } = await login();
  await page.goto('https://community.cbancnetwork.com/home', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  const html = await page.content();
  const outPath = 'prospecting/cbanc-discover.html';
  mkdirSync('prospecting', { recursive: true });
  writeFileSync(outPath, html);
  process.stderr.write(`Saved full page HTML to ${outPath}\n`);
  process.stderr.write('Open that file in your browser or grep it to find the right selectors.\n');

  await browser.close();
}

async function scrape(): Promise<CbancPost[]> {
  const { browser, page } = await login();

  process.stderr.write('Loading community feed...\n');
  await page.goto('https://community.cbancnetwork.com/home', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Scroll to load more posts
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  // CBANC is built on Bubble.io. Verified selector mapping (from DOM discovery):
  //   .ql-editor          — post body text
  //   a.baTyaPb0          — post title link
  //   a.baTyaPh0          — post date link
  //   a[href*="/post/"]   — post permalink (2 per post, deduplicated)
  //   .baTfaJaO0          — author job title (names hidden from non-connections)
  //   .baTfaJaU0          — institution type (FI Employee / Company Post)
  // All collections are in DOM order, so index N of each = same post.
  const posts = await page.evaluate((): CbancPost[] => {
    const editors = Array.from(document.querySelectorAll('.ql-editor'));

    const seenUrls = new Set<string>();
    const postLinks: HTMLAnchorElement[] = [];
    for (const a of document.querySelectorAll('a[href*="/post/"]') as NodeListOf<HTMLAnchorElement>) {
      if (!seenUrls.has(a.href)) { seenUrls.add(a.href); postLinks.push(a); }
    }

    const titleEls = Array.from(document.querySelectorAll('a.baTyaPb0'));
    const dateEls  = Array.from(document.querySelectorAll('a.baTyaPh0'));
    const jobEls   = Array.from(document.querySelectorAll('.baTfaJaO0'));
    const instEls  = Array.from(document.querySelectorAll('.baTfaJaU0'));

    return editors.slice(0, 50).map((ed, i) => {
      const body      = ed.textContent?.trim() ?? '';
      const url       = postLinks[i]?.href ?? undefined;
      const urlId     = url?.split('/post/')[1]?.split('?')[0] ?? String(i);
      const title     = titleEls[i]?.textContent?.trim() || (body.length > 80 ? body.substring(0, 80) + '...' : body);
      const postedAt  = dateEls[i]?.textContent?.trim() || undefined;
      const jobTitle  = jobEls[i]?.textContent?.trim() || undefined;
      const instType  = instEls[i]?.textContent?.trim() || undefined;

      return {
        id: urlId,
        title,
        body,
        // CBANC hides real names; author field = job title (e.g. "BSA Officer at a Bank")
        author: jobTitle ?? undefined,
        authorTitle: instType ?? undefined,
        url,
        postedAt,
      };
    });
  });

  await browser.close();

  const filtered = posts.filter((p) => (p.title || p.body).length > 20);
  process.stderr.write(`Found ${filtered.length} posts after filtering.\n`);

  if (filtered.length === 0) {
    process.stderr.write(
      'No posts found. Run with --discover to dump the raw HTML and tune selectors.\n',
    );
  }

  return filtered;
}

(async () => {
  if (discoverFlag) {
    await discover();
    return;
  }

  if (useFile) {
    const filePath = args[fileFlag + 1] ?? 'prospecting/cbanc-posts.json';
    const posts = await fetchFromFile(filePath);
    process.stdout.write(JSON.stringify(posts, null, 2));
    return;
  }

  const posts = await scrape();
  process.stdout.write(JSON.stringify(posts, null, 2));
})();
