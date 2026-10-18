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
    args: ['--window-size=1280,900', '--no-first-run', '--no-default-browser-check'],
  });
}

async function clickByText(page: Page, texts: string[], timeout = 15_000): Promise<void> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    for (const text of texts) {
      const el = await page.$(`::-p-xpath(//button[normalize-space(.)="${text}"] | //a[normalize-space(.)="${text}"] | //*[@role="button" and normalize-space(.)="${text}"])`);
      if (el && (await el.isVisible())) {
        await el.click();
        return;
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`no visible button with text: ${texts.join(' / ')}`);
}

async function openComposer(page: Page, adminUrl: string): Promise<void> {
  await page.goto(adminUrl, { waitUntil: 'domcontentloaded' });
  if (page.url().includes('/login') || page.url().includes('/authwall') || page.url().includes('/checkpoint')) {
    throw new Error('LinkedIn session expired; run: bun automation/linkedin-browser.ts login');
  }
  // The admin view has either a direct "Start a post" or a "Create" menu.
  try {
    await clickByText(page, ['Start a post'], 8_000);
  } catch {
    await clickByText(page, ['Create']);
    await clickByText(page, ['Start a post', 'Post']);
  }
  await page.waitForSelector('div[role="textbox"][contenteditable="true"]', { visible: true, timeout: 15_000 });
}

async function typePost(page: Page, text: string): Promise<void> {
  const box = await page.$('div[role="textbox"][contenteditable="true"]');
  if (!box) throw new Error('composer text box not found');
  await box.click();
  // Type line by line; Shift+Enter keeps hashtag autocomplete from eating newlines.
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    await page.keyboard.type(lines[i], { delay: 8 });
    if (i < lines.length - 1) {
      await page.keyboard.press('Escape'); // dismiss any mention/hashtag suggestion
      await page.keyboard.down('Shift');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Shift');
    }
  }
  await page.keyboard.press('Escape');
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
      console.log('Composer filled; not posting (test mode). Close the window when done.');
      await new Promise<void>((r) => browser.on('disconnected', () => r()));
      return;
    }
    await clickByText(page, ['Post']);
    await page.waitForSelector('div[role="textbox"][contenteditable="true"]', { hidden: true, timeout: 30_000 });
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
