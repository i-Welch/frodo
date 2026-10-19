// Posts to the RAVEN LinkedIn company page by driving Microsoft Edge with a
// dedicated, signed-in profile (%USERPROFILE%\.raven\linkedin-browser).
//
// One-time setup:  bun automation/linkedin-browser.ts login
//   Opens Edge on that profile; sign in to LinkedIn, then close the window.
// Test without posting:  bun automation/linkedin-browser.ts test
//   Opens the composer as the page, types a sample post, and stops before Post.
//
// The company page admin URL comes from LINKEDIN_COMPANY_URL in
// %USERPROFILE%\.raven\linkedin.env, e.g.
//   LINKEDIN_COMPANY_URL=https://www.linkedin.com/company/12345678/admin/

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import type { Browser, Page } from 'puppeteer-core';

const STATE_DIR = join(homedir(), '.raven');
export const PROFILE_DIR = join(STATE_DIR, 'linkedin-browser');
const ENV_FILE = join(STATE_DIR, 'linkedin.env');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

// puppeteer-core is already a dashboard dependency; load it from there.
const requireFromDashboard = createRequire(resolve(import.meta.dir, '../dashboard/package.json'));
const puppeteer = requireFromDashboard('puppeteer-core') as typeof import('puppeteer-core');

export function companyAdminUrl(): string | null {
  if (!existsSync(ENV_FILE)) return null;
  const line = readFileSync(ENV_FILE, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith('LINKEDIN_COMPANY_URL='));
  return line ? line.slice(line.indexOf('=') + 1).trim() : null;
}

export function browserReady(): boolean {
  return existsSync(PROFILE_DIR) && companyAdminUrl() !== null;
}

async function launch(headless: boolean): Promise<Browser> {
  mkdirSync(PROFILE_DIR, { recursive: true });
  return puppeteer.launch({
    executablePath: EDGE,
    userDataDir: PROFILE_DIR,
    headless,
    defaultViewport: null,
    // LinkedIn suppresses the composer for browsers flagged as automated.
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--window-size=1280,900',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-blink-features=AutomationControlled',
    ],
  });
}

// The feed under the composer has its own comment editors with the same role,
// so everything is scoped to the composer dialog.
const DIALOG = '[role="dialog"], .artdeco-modal';
const COMPOSER_BOX = `:is(${DIALOG}) div[role="textbox"][contenteditable="true"]`;

async function humanClick(page: Page, selector: string): Promise<void> {
  const el = await page.waitForSelector(selector, { visible: true, timeout: 20_000 });
  const box = el && (await el.boundingBox());
  if (!box) throw new Error(`not clickable: ${selector}`);
  const x = box.x + Math.min(40, box.width / 2);
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y, { steps: 12 });
  await new Promise((r) => setTimeout(r, 300));
  await page.mouse.click(x, y, { delay: 60 });
}

async function openComposer(page: Page, adminUrl: string): Promise<void> {
  // The Page posts tab has a direct "Start a post"; the dashboard only has a "Create" menu.
  const base = adminUrl.replace(/\/admin\/?.*$/, '/admin/');
  await page.goto(`${base}page-posts/published/`, { waitUntil: 'networkidle2', timeout: 60_000 }).catch(() => {});
  if (page.url().includes('/login') || page.url().includes('/authwall') || page.url().includes('/checkpoint')) {
    throw new Error('LinkedIn session expired; run: bun automation/linkedin-browser.ts login');
  }
  await humanClick(page, '.share-box-feed-entry__top-bar button, button.share-box-feed-entry__trigger');
  await page.waitForSelector(COMPOSER_BOX, { visible: true, timeout: 20_000 });
}

async function typePost(page: Page, text: string): Promise<void> {
  await humanClick(page, COMPOSER_BOX);
  // Type line by line with Shift+Enter between lines. No Escape: it closes the
  // composer. Hashtags only appear on the last line, so no suggestion popup is
  // open when a newline is typed.
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    await page.keyboard.type(lines[i], { delay: 8 });
    if (i < lines.length - 1) {
      await page.keyboard.down('Shift');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Shift');
    }
  }
  // Close a trailing hashtag suggestion without leaving the editor.
  await page.keyboard.type(' ');
}

/** Builds the browser post body: the post, the article link (LinkedIn renders
 *  the preview card from it), then the hashtag line. */
export function composeBrowserText(text: string, url: string): string {
  const lines = text.trim().split('\n');
  const last = lines[lines.length - 1].trim();
  const hasTags = /^(#\w+\s*)+$/.test(last);
  const body = hasTags ? lines.slice(0, -1).join('\n').trim() : text.trim();
  return hasTags ? `${body}\n\n${url}\n\n${last}` : `${body}\n\n${url}`;
}

export async function postViaBrowser(text: string, url: string, opts: { submit: boolean }): Promise<void> {
  const adminUrl = companyAdminUrl();
  if (!adminUrl) throw new Error(`LINKEDIN_COMPANY_URL missing from ${ENV_FILE}`);
  const browser = await launch(false);
  try {
    const page = (await browser.pages())[0] ?? (await browser.newPage());
    await openComposer(page, adminUrl);
    await typePost(page, composeBrowserText(text, url));
    // Give LinkedIn time to fetch the link preview card.
    await new Promise((r) => setTimeout(r, 6_000));
    if (!opts.submit) {
      const shot = join(STATE_DIR, 'logs', 'linkedin-test.png');
      mkdirSync(join(STATE_DIR, 'logs'), { recursive: true });
      await page.screenshot({ path: shot });
      console.log(`Composer filled; not posting (test mode). Screenshot: ${shot}. Close the window when done.`);
      await new Promise<void>((r) => browser.on('disconnected', () => r()));
      return;
    }
    const buttons = await page.$$(`:is(${DIALOG}) button`);
    let postButton = null;
    for (const b of buttons) {
      const [label, disabled] = await b.evaluate((e) => [(e.textContent ?? '').trim(), (e as HTMLButtonElement).disabled]);
      if (label === 'Post' && !disabled) postButton = b;
    }
    if (!postButton) throw new Error('enabled Post button not found in composer');
    const box = await postButton.boundingBox();
    if (!box) throw new Error('Post button not visible');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 60 });
    await page.waitForSelector(COMPOSER_BOX, { hidden: true, timeout: 30_000 });
  } finally {
    if (opts.submit) await browser.close();
  }
}

if (import.meta.main) {
  const mode = process.argv[2];
  if (mode === 'login') {
    const browser = await launch(false);
    const page = (await browser.pages())[0] ?? (await browser.newPage());
    await page.goto('https://www.linkedin.com/login');
    console.log('Sign in to LinkedIn in the Edge window, then close it.');
    await new Promise<void>((r) => browser.on('disconnected', () => r()));
  } else if (mode === 'test') {
    await postViaBrowser(
      'Test post from the RAVEN automation. Not for publishing.\n\nSecond paragraph with a question?\n\n#CommunityBanking #Fintech',
      'https://reportraven.tech/blog',
      { submit: false },
    );
  } else {
    console.log('usage: bun automation/linkedin-browser.ts login|test');
  }
}
