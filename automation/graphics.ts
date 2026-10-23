// HTML/CSS graphics for LinkedIn posts, rendered with headless Edge, and
// the A/B rotation that decides which graphic (if any) a post goes out with.
//
// Variants:
//   link      control: no image, LinkedIn renders the article's link card (OG image)
//   stat      dark data card built around the hook's lead number
//   headline  light editorial card with the article title and description
//   carousel  PDF document post: cover, one slide per finding, closing slide
//
// Each post gets the variant used least so far (ties broken by slug), unless
// its queue file sets `graphic: <variant>`. The variant rides along
// as utm_content on the posted link, so Vercel Analytics splits clicks by it;
// `bun automation/ab-report.ts` prints the comparison.
//
// Preview without posting:  bun automation/graphics.ts preview [slug]
//   Renders every variant for queued posts to %USERPROFILE%\.raven\graphics\.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const STATE_DIR = join(homedir(), '.raven');
export const GRAPHICS_DIR = join(STATE_DIR, 'graphics');
const AB_LOG = join(STATE_DIR, 'linkedin-ab.json');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

export const GRAPHIC_VARIANTS = ['link', 'stat', 'headline', 'carousel'] as const;
export type GraphicVariant = (typeof GRAPHIC_VARIANTS)[number];
export type RenderedVariant = Exclude<GraphicVariant, 'link'>;

export interface GraphicPost {
  slug: string;
  title: string;
  description: string;
  text: string;
  graphic?: string;
  stat?: string;
  statLabel?: string;
}

/* ---------- Rotation ---------- */

export interface AbEntry {
  variant: GraphicVariant;
  postedAt: string;
  // For matching the post to LinkedIn's analytics table (ab-report.ts), which
  // lists a link post by the article title and other posts by their text.
  title?: string;
  hook?: string;
}

export function loadAbLog(): Record<string, AbEntry> {
  if (!existsSync(AB_LOG)) return {};
  return JSON.parse(readFileSync(AB_LOG, 'utf8'));
}

export function recordVariant(post: GraphicPost, variant: GraphicVariant) {
  const log = loadAbLog();
  log[post.slug] = { variant, postedAt: new Date().toISOString(), title: post.title, hook: post.text.trim().split('\n')[0] };
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(AB_LOG, JSON.stringify(log, null, 2));
}

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Least-used variant so far; a forced `graphic:` wins. `stat` is skipped
 *  when the post has no lead number, `carousel` when it has under three
 *  findings to put on slides. A follow-up post skips the variant its launch
 *  post used, so each article is seen in two formats. */
export function pickVariant(post: GraphicPost, history: Record<string, AbEntry>): GraphicVariant {
  if (post.graphic && (GRAPHIC_VARIANTS as readonly string[]).includes(post.graphic)) {
    return post.graphic as GraphicVariant;
  }
  const launch = history[post.slug.replace(/-followup$/, '')]?.variant;
  const usable = GRAPHIC_VARIANTS.filter(
    (v) => (v !== 'stat' || leadStat(post) !== null) && (v !== 'carousel' || carouselFindings(post).length >= 3),
  );
  const fresh = post.slug.endsWith('-followup') ? usable.filter((v) => v !== launch) : usable;
  const eligible = fresh.length > 0 ? fresh : usable;
  const counts = new Map<GraphicVariant, number>(eligible.map((v) => [v, 0]));
  for (const entry of Object.values(history)) {
    if (counts.has(entry.variant)) counts.set(entry.variant, counts.get(entry.variant)! + 1);
  }
  const fewest = Math.min(...counts.values());
  const tied = eligible.filter((v) => counts.get(v) === fewest);
  return tied[hash(post.slug) % tied.length];
}

/* ---------- Content ---------- */

// Dollar amounts and percentages anywhere in a sentence; a bare count only
// when it opens the sentence ("27 companies are waiting ..."), so years and
// rule numbers like SR 11-7 are never picked.
const MONEY_OR_PCT = /\$\d[\d.,]*(?:\s?(?:million|billion|thousand)\b)?|\b\d[\d.,]*%/i;
const LEADING_COUNT = /^\d{1,3}(?:,\d{3})*(?=\s)/;

/** The hook's headline number and the sentence it comes from, or the queue
 *  file's `stat` / `statLabel`. Looks at the first two lines of the post. */
export function leadStat(post: GraphicPost): { value: string; label: string } | null {
  if (post.stat) return { value: post.stat, label: post.statLabel ?? post.title };
  const lines = post.text.trim().split('\n').filter((l) => l.trim()).slice(0, 2);
  const sentences = lines.flatMap((l) => l.trim().split(/(?<=[.!?])\s+(?=[A-Z0-9"$])/));
  for (const sentence of sentences) {
    const value = sentence.match(LEADING_COUNT)?.[0] ?? sentence.match(MONEY_OR_PCT)?.[0];
    if (value && !/^(19|20)\d\d$/.test(value)) {
      return { value: value.replace(/\.$/, ''), label: clip(sentence, 170) };
    }
  }
  return null;
}

/** The post's body paragraphs that carry a number, for carousel slides: not
 *  the hashtag line, the closing question, or a lead-in to the link. */
export function carouselFindings(post: GraphicPost): string[] {
  return post.text
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter((p) => /\d/.test(p) && !/^#/.test(p) && !/[?:]$/.test(p) && p.length <= 320)
    .slice(0, 5);
}

/** Cuts at a word boundary under `max` characters and adds an ellipsis. */
function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 3).replace(/\s+\S*$/, '').replace(/[,;:]$/, '')}...`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const SIZE = 1200;

const BASE_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: ${SIZE}px; height: ${SIZE}px; }
body { font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
.card { position: relative; width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; display: flex; flex-direction: column; padding: 96px; }
.foot { position: absolute; left: 96px; right: 96px; bottom: 80px; display: flex; justify-content: space-between; align-items: center; font-size: 28px; }
.brand { font-weight: 700; letter-spacing: 10px; }
`;

function page(css: string, body: string, base = BASE_CSS): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=block" rel="stylesheet">
<style>${base}${css}</style></head><body>${body}</body></html>`;
}

function statHtml(post: GraphicPost): string {
  const stat = leadStat(post)!;
  const valueSize = stat.value.length > 8 ? 200 : stat.value.length > 5 ? 260 : 320;
  const labelSize = stat.label.length > 140 ? 40 : stat.label.length > 90 ? 46 : 54;
  return page(
    `
.card { background: linear-gradient(150deg, #0A0A0A 0%, #101322 100%); color: #fff; justify-content: center; }
.glow { position: absolute; top: -260px; right: -220px; width: 820px; height: 820px; border-radius: 50%;
  background: radial-gradient(circle, rgba(108,142,255,0.30) 0%, rgba(108,142,255,0) 70%); }
.eyebrow { font-size: 28px; font-weight: 700; letter-spacing: 7px; text-transform: uppercase; color: #6C8EFF; margin-bottom: 36px; }
.value { font-size: ${valueSize}px; font-weight: 700; line-height: 0.95; letter-spacing: -8px;
  background: linear-gradient(180deg, #FFFFFF 30%, #9DB2FF 100%); -webkit-background-clip: text; color: transparent; }
.rule { width: 120px; height: 8px; border-radius: 4px; background: #6C8EFF; margin: 56px 0 44px; }
.label { font-size: ${labelSize}px; font-weight: 500; line-height: 1.25; color: #E5E7EB; max-width: 960px; }
.foot .brand { color: #fff; }
.foot .url { color: #6C8EFF; }
`,
    `<div class="card"><div class="glow"></div>
  <div class="eyebrow">RAVEN Research</div>
  <div class="value">${esc(stat.value)}</div>
  <div class="rule"></div>
  <div class="label">${esc(stat.label)}</div>
  <div class="foot"><span class="brand">RAVEN</span><span class="url">reportraven.tech</span></div>
</div>`,
  );
}

function headlineHtml(post: GraphicPost): string {
  const titleSize = post.title.length > 90 ? 70 : post.title.length > 60 ? 82 : 96;
  const desc = clip(post.description, 230);
  return page(
    `
.card { background: #F6F1E7; color: #141414; padding-top: 120px; }
.bar { position: absolute; top: 0; left: 0; right: 0; height: 20px; background: #1B2A6B; }
.eyebrow { display: inline-flex; align-self: flex-start; font-size: 26px; font-weight: 700; letter-spacing: 6px; text-transform: uppercase;
  color: #1B2A6B; border: 3px solid #1B2A6B; border-radius: 999px; padding: 12px 28px; margin-bottom: 64px; }
.title { font-family: 'Fraunces', Georgia, serif; font-size: ${titleSize}px; font-weight: 600; line-height: 1.08; letter-spacing: -2px; }
.desc { font-size: 38px; line-height: 1.4; color: #4B4B4B; margin-top: 52px; max-width: 980px; }
.foot { border-top: 3px solid #141414; padding-top: 36px; }
.foot .brand { color: #141414; }
.foot .url { color: #1B2A6B; font-weight: 500; }
`,
    `<div class="card"><div class="bar"></div>
  <div class="eyebrow">RAVEN Research</div>
  <div class="title">${esc(post.title)}</div>
  <div class="desc">${esc(desc)}</div>
  <div class="foot"><span class="brand">RAVEN</span><span class="url">Read it at reportraven.tech</span></div>
</div>`,
  );
}

// 4:5 portrait slides, LinkedIn's tallest document format.
const SLIDE = { width: 1080, height: 1350 };

// The description's first sentence when it fits the closing slide whole.
function closingLine(post: GraphicPost): string {
  const first = post.description.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? post.description;
  return first.length <= 160 ? first : 'The data, the context, and what it means for your bank.';
}

function carouselHtml(post: GraphicPost): string {
  const findings = carouselFindings(post);
  const total = findings.length + 2;
  const slide = (cls: string, inner: string, n: number) =>
    `<section class="slide ${cls}">${inner}<div class="foot"><span class="brand">RAVEN</span><span>${n} / ${total}</span></div></section>`;
  const finding = (text: string, i: number) => {
    const value = text.match(LEADING_COUNT)?.[0] ?? text.match(MONEY_OR_PCT)?.[0];
    const big = value && !/^(19|20)\d\d$/.test(value) ? `<div class="value">${esc(value.replace(/\.$/, ''))}</div>` : '';
    const size = text.length > 220 ? 46 : text.length > 140 ? 54 : 62;
    return slide('finding', `<div class="idx">${String(i + 1).padStart(2, '0')}</div>${big}<p style="font-size:${size}px">${esc(text)}</p>`, i + 2);
  };
  const titleSize = post.title.length > 90 ? 76 : post.title.length > 60 ? 88 : 104;
  return page(
    `
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: ${SLIDE.width}px ${SLIDE.height}px; margin: 0; }
body { font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
.slide { position: relative; width: ${SLIDE.width}px; height: ${SLIDE.height}px; overflow: hidden; padding: 110px 96px;
  display: flex; flex-direction: column; justify-content: center; break-after: page; }
.foot { position: absolute; left: 96px; right: 96px; bottom: 80px; display: flex; justify-content: space-between; font-size: 28px; }
.brand { font-weight: 700; letter-spacing: 10px; }
.eyebrow { font-size: 28px; font-weight: 700; letter-spacing: 7px; text-transform: uppercase; }
.cover { background: #F6F1E7; color: #141414; }
.cover::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 22px; background: #1B2A6B; }
.cover .eyebrow { color: #1B2A6B; margin-bottom: 56px; }
.cover h1 { font-family: 'Fraunces', Georgia, serif; font-size: ${titleSize}px; font-weight: 600; line-height: 1.06; letter-spacing: -2px; }
.cover .swipe { margin-top: 72px; font-size: 34px; font-weight: 500; color: #1B2A6B; }
.finding { background: linear-gradient(160deg, #0A0A0A 0%, #101322 100%); color: #fff; }
.finding .idx { font-size: 30px; font-weight: 700; color: #6C8EFF; letter-spacing: 4px; margin-bottom: 40px; }
.finding .value { font-size: 190px; font-weight: 700; line-height: 0.95; letter-spacing: -6px; margin-bottom: 48px; color: #FFFFFF; }
.finding p { line-height: 1.3; font-weight: 500; color: #E5E7EB; }
.finding .foot, .end .foot { color: #A3A3A3; }
.end { background: #1B2A6B; color: #fff; }
.end h2 { font-family: 'Fraunces', Georgia, serif; font-size: 92px; font-weight: 600; line-height: 1.08; letter-spacing: -1.5px; }
.end p { font-size: 40px; color: #C9D3FF; margin-top: 44px; line-height: 1.4; }
.end .url { margin-top: 72px; font-size: 44px; font-weight: 700; }
`,
    [
      slide('cover', `<div class="eyebrow">RAVEN Research</div><h1>${esc(post.title)}</h1><div class="swipe">Swipe for the numbers &rarr;</div>`, 1),
      ...findings.map(finding),
      slide('end', `<h2>Read the full analysis</h2><p>${esc(closingLine(post))}</p><div class="url">reportraven.tech/blog</div>`, total),
    ].join(''),
    '',
  );
}

export function graphicHtml(variant: RenderedVariant, post: GraphicPost): string {
  return variant === 'stat' ? statHtml(post) : variant === 'carousel' ? carouselHtml(post) : headlineHtml(post);
}

/** Image alt text, or the document title LinkedIn shows on a carousel. */
export function altText(variant: RenderedVariant, post: GraphicPost): string {
  if (variant === 'carousel') return clip(post.title, 100);
  if (variant === 'stat') {
    const stat = leadStat(post)!;
    return `${stat.value}: ${stat.label}. RAVEN Research, reportraven.tech`;
  }
  return `${post.title}. RAVEN Research, reportraven.tech`;
}

/* ---------- Rendering ---------- */

const requireFromDashboard = createRequire(resolve(import.meta.dir, '../dashboard/package.json'));

/** Renders the variant's HTML to a PNG (a PDF for the carousel) and returns
 *  its path. Uses a throwaway headless profile, so it never touches the
 *  signed-in LinkedIn profile. */
export async function renderGraphic(variant: RenderedVariant, post: GraphicPost): Promise<string> {
  const puppeteer = requireFromDashboard('puppeteer-core') as typeof import('puppeteer-core');
  mkdirSync(GRAPHICS_DIR, { recursive: true });
  const out = join(GRAPHICS_DIR, `${post.slug}-${variant}.${variant === 'carousel' ? 'pdf' : 'png'}`);
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-first-run'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
    await page.setContent(graphicHtml(variant, post), { waitUntil: 'networkidle0', timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    if (variant === 'carousel') {
      await page.pdf({ path: out, width: `${SLIDE.width}px`, height: `${SLIDE.height}px`, printBackground: true });
    } else {
      await page.screenshot({ path: out as `${string}.png`, clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
    }
  } finally {
    await browser.close();
  }
  return out;
}

/* ---------- Preview CLI ---------- */

function queuedPosts(): GraphicPost[] {
  const files = execFileSync('git', ['ls-tree', '--name-only', 'origin/master', 'marketing/linkedin/queue/'], { encoding: 'utf8' })
    .split('\n')
    .filter((f) => f.endsWith('.md'));
  return files.map((file) => {
    const raw = execFileSync('git', ['show', `origin/master:${file}`], { encoding: 'utf8' }).replace(/\r\n/g, '\n');
    const [, front, text] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
    const meta = Object.fromEntries(front.split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
    return { ...meta, text: text.trim() } as GraphicPost;
  });
}

if (import.meta.main && process.argv[2] === 'preview') {
  const only = process.argv[3];
  const history = loadAbLog();
  for (const post of queuedPosts().filter((p) => !only || p.slug === only)) {
    const picks = [];
    for (const v of ['stat', 'headline', 'carousel'] as const) {
      if (v === 'stat' && !leadStat(post)) continue;
      if (v === 'carousel' && carouselFindings(post).length < 3) continue;
      picks.push(await renderGraphic(v, post));
    }
    console.log(`${post.slug}: next variant ${pickVariant(post, history)}; rendered ${picks.join(', ')}`);
  }
}
