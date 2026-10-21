// Auto-publisher for /article PRs. Run hourly (see register-tasks.ps1).
//
// 1. Merges open PRs labeled `auto-publish` once they are 24h old, CI is green,
//    and the PR is mergeable. Close the PR or remove the label to stop it.
// 2. For each LinkedIn queue file on master (marketing/linkedin/queue/<slug>.md)
//    not yet posted, waits until the article URL returns 200, then posts it to
//    the RAVEN company page and records it in the local posted log. A queue
//    file with `notBefore: YYYY-MM-DD` (the follow-up post /article writes)
//    waits until that date.
//
// LinkedIn credentials live outside the repo in %USERPROFILE%\.raven\linkedin.env:
//   LINKEDIN_ACCESS_TOKEN=...      (w_organization_social scope)
//   LINKEDIN_ORG_ID=12345678       (numeric id of the company page)
//   LINKEDIN_VERSION=202609        (optional, YYYYMM)
// Without them, posts go through the signed-in Edge profile instead
// (linkedin-browser.ts). With neither, queued posts wait.
//
// 3. Pings IndexNow once for each newly live article (Bing, Yandex, ...).
// 4. For each claimed free-audit request (see audit-requests.ts), emails the
//    requester once https://reportraven.tech/audit/<slug> returns 200, then
//    sends one check-in email 5 days after delivery.
//
// Usage: bun automation/auto-publish.ts [--dry-run]

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { browserReady, postViaBrowser } from './linkedin-browser';
import { auditQueueReady, listAuditRequests, sendAuditFollowUp, setAuditStatus, siteUrl } from './audit-requests';
import { changedSitemapUrls, pingIndexNow } from './indexnow';
import { alertFounder } from './alert';
import { ravenApi } from './raven-api';
import { fetchPageVisits, hotAccounts } from './warm-accounts';
import { getAudit } from '../dashboard/src/app/(whitelabel)/_config/audit-data';

const REPO = resolve(import.meta.dir, '..');
const STATE_DIR = join(homedir(), '.raven');
const POSTED_LOG = join(STATE_DIR, 'linkedin-posted.json');
const LINKEDIN_ENV = join(STATE_DIR, 'linkedin.env');
const INDEXNOW_LOG = join(STATE_DIR, 'indexnow-pinged.json');
const SITEMAP_STATE = join(STATE_DIR, 'indexnow-sitemap.json');
const LABEL = 'auto-publish';
const DELAY_HOURS = 24;
// LinkedIn: one post per run, spaced out, during the business day (ET) when
// bankers are reading. Queued posts wait for the next open slot.
const POST_GAP_HOURS = 4;
const POST_WINDOW = { startHour: 8, endHour: 17 };
const DRY_RUN = process.argv.includes('--dry-run');

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function run(cmd: string, args: string[]): string {
  return execFileSync(cmd, args, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

/* ---------- Step 1: merge PRs past the review window ---------- */

interface PullRequest {
  number: number;
  title: string;
  headRefName: string;
  createdAt: string;
  mergeable: string;
  isDraft: boolean;
  statusCheckRollup: { conclusion?: string; state?: string; status?: string }[];
}

function checksGreen(pr: PullRequest): boolean {
  const checks = pr.statusCheckRollup ?? [];
  if (checks.length === 0) return false;
  return checks.every((c) => {
    const result = (c.conclusion ?? c.state ?? '').toUpperCase();
    return result === 'SUCCESS' || result === 'SKIPPED' || result === 'NEUTRAL';
  });
}

function checksFailed(pr: PullRequest): boolean {
  return (pr.statusCheckRollup ?? []).some((c) =>
    ['FAILURE', 'ERROR', 'TIMED_OUT', 'CANCELLED'].includes((c.conclusion ?? c.state ?? '').toUpperCase()),
  );
}

// Scheduled PRs that overlap (an article and a draft release, say) conflict on
// the lists they both insert into. Merge master into the branch with the union
// driver from .gitattributes and push; CI reruns and gates the result. Returns
// false when a conflict remains that union cannot settle.
function resolveConflicts(pr: PullRequest): boolean {
  const git = (...args: string[]) => run('git', ['-c', 'user.name=RAVEN automation', '-c', 'user.email=isaac@reportraven.tech', ...args]);
  try {
    git('fetch', '-q', 'origin', 'master', pr.headRefName);
    git('checkout', '-q', '-B', 'auto-resolve', `origin/${pr.headRefName}`);
    try {
      git('merge', '--no-edit', 'origin/master');
    } catch {
      git('merge', '--abort');
      return false;
    }
    git('push', '-q', 'origin', `HEAD:${pr.headRefName}`);
    return true;
  } catch (err) {
    log(`#${pr.number}: conflict resolution failed: ${(err as Error).message.split('\n')[0]}`);
    return false;
  } finally {
    try {
      git('checkout', '-q', '-f', 'master');
      git('branch', '-q', '-D', 'auto-resolve');
    } catch {
      // The next scheduled run resets the clone anyway.
    }
  }
}

async function mergeDuePullRequests() {
  const prs: PullRequest[] = JSON.parse(
    run('gh', [
      'pr', 'list', '--state', 'open', '--label', LABEL,
      '--json', 'number,title,headRefName,createdAt,mergeable,isDraft,statusCheckRollup',
    ]),
  );
  for (const pr of prs) {
    const ageHours = (Date.now() - Date.parse(pr.createdAt)) / 3_600_000;
    const tag = `#${pr.number} "${pr.title}"`;
    if (pr.isDraft) {
      log(`${tag}: draft, skipping`);
    } else if (pr.mergeable === 'CONFLICTING' && !DRY_RUN && resolveConflicts(pr)) {
      log(`${tag}: merged master in to clear conflicts; waiting for CI`);
    } else if (ageHours < DELAY_HOURS) {
      log(`${tag}: ${ageHours.toFixed(1)}h old, merges at ${DELAY_HOURS}h`);
    } else if (pr.mergeable !== 'MERGEABLE') {
      log(`${tag}: not mergeable (${pr.mergeable}), needs attention`);
      if (pr.mergeable === 'CONFLICTING') {
        await alertFounder(`pr-${pr.number}-conflict`, `PR #${pr.number} has merge conflicts`,
          `${pr.title} is past its review window but conflicts with master, so it will not auto-merge.
https://github.com/i-Welch/frodo/pull/${pr.number}`);
      }
    } else if (!checksGreen(pr)) {
      log(`${tag}: CI not green, waiting`);
      if (checksFailed(pr)) {
        await alertFounder(`pr-${pr.number}-ci`, `CI is failing on PR #${pr.number}`,
          `${pr.title} is past its review window but CI failed, so it will not auto-merge.
https://github.com/i-Welch/frodo/pull/${pr.number}/checks`);
      }
    } else if (DRY_RUN) {
      log(`${tag}: would merge (dry run)`);
    } else {
      run('gh', ['pr', 'merge', String(pr.number), '--squash', '--delete-branch']);
      log(`${tag}: merged`);
    }
  }
}

/* ---------- Step 2: post queued LinkedIn updates ---------- */

interface QueuedPost {
  slug: string;
  title: string;
  description: string;
  url: string;
  text: string;
  notBefore?: string;
}

function readQueue(): QueuedPost[] {
  // Read from origin/master so only merged (published) articles are posted.
  run('git', ['fetch', '--quiet', 'origin', 'master']);
  let files: string[];
  try {
    files = run('git', ['ls-tree', '--name-only', 'origin/master', 'marketing/linkedin/queue/'])
      .split('\n')
      .filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  return files.map((file) => {
    const raw = run('git', ['show', `origin/master:${file}`]).replace(/\r\n/g, '\n');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) throw new Error(`${file}: missing front matter`);
    const meta = Object.fromEntries(
      match[1].split('\n').map((line) => {
        const i = line.indexOf(':');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
    );
    return {
      slug: meta.slug,
      title: meta.title,
      description: meta.description,
      url: meta.url,
      text: match[2].trim(),
      notBefore: meta.notBefore || undefined,
    };
  });
}

function loadPosted(): Record<string, string> {
  if (!existsSync(POSTED_LOG)) return {};
  return JSON.parse(readFileSync(POSTED_LOG, 'utf8'));
}

function savePosted(posted: Record<string, string>) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(POSTED_LOG, JSON.stringify(posted, null, 2));
}

function loadLinkedInEnv(): Record<string, string> | null {
  if (!existsSync(LINKEDIN_ENV)) return null;
  const env = Object.fromEntries(
    readFileSync(LINKEDIN_ENV, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
  );
  return env.LINKEDIN_ACCESS_TOKEN && env.LINKEDIN_ORG_ID ? env : null;
}

// LinkedIn's "little text" format reserves these characters in commentary.
// Hashtags become {hashtag|\#|Tag} templates so they render as real hashtags.
export function toLittleText(text: string): string {
  // split() with a capture group puts the hashtags at odd indexes.
  return text
    .split(/(#[A-Za-z]\w*)/)
    .map((part, i) =>
      i % 2 === 1 ? `{hashtag|\\#|${part.slice(1)}}` : part.replace(/[\\|{}@[\]()<>#*_~]/g, (c) => `\\${c}`),
    )
    .join('');
}

async function isLive(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function postToLinkedIn(env: Record<string, string>, post: QueuedPost): Promise<string> {
  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': env.LINKEDIN_VERSION || '202609',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:organization:${env.LINKEDIN_ORG_ID}`,
      commentary: toLittleText(post.text),
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      content: { article: { source: post.url, title: post.title, description: post.description } },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });
  if (res.status !== 201) {
    throw new Error(`LinkedIn ${res.status}: ${await res.text()}`);
  }
  return res.headers.get('x-restli-id') ?? 'posted';
}

export function postingSlotOpen(now: Date, lastPosted: Date | undefined): string | undefined {
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  if (day === 0 || day === 6) return 'weekend';
  if (et.getHours() < POST_WINDOW.startHour || et.getHours() >= POST_WINDOW.endHour) return 'outside business hours';
  if (lastPosted && now.getTime() - lastPosted.getTime() < POST_GAP_HOURS * 3_600_000) return 'posted recently';
  return undefined;
}

async function postQueued() {
  const queue = readQueue();
  const posted = loadPosted();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const pending = queue.filter((p) => !posted[p.slug] && (!p.notBefore || p.notBefore <= today));
  if (pending.length === 0) return;

  const last = Object.values(posted)
    .map((v) => Date.parse(v.split(' ')[0]))
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => b - a)[0];
  const closed = postingSlotOpen(new Date(), last ? new Date(last) : undefined);
  if (closed) {
    log(`${pending.length} LinkedIn post(s) queued; waiting (${closed})`);
    return;
  }

  const env = loadLinkedInEnv();
  if (!env && !browserReady()) {
    log(`${pending.length} LinkedIn post(s) queued; no API token or browser setup (see linkedin-browser.ts), skipping`);
    return;
  }
  for (const post of pending) {
    if (!(await isLive(post.url))) {
      log(`${post.slug}: ${post.url} not live yet, will retry`);
      continue;
    }
    if (DRY_RUN) {
      log(`${post.slug}: would post to LinkedIn via ${env ? 'API' : 'browser'} (dry run)`);
      continue;
    }
    try {
      let id = 'browser';
      if (env) id = await postToLinkedIn(env, post);
      else await postViaBrowser(post.text, post.url, { submit: true });
      posted[post.slug] = `${new Date().toISOString()} ${id}`;
      savePosted(posted);
      log(`${post.slug}: posted to LinkedIn (${id})`);
      break;
    } catch (err) {
      log(`${post.slug}: ${(err as Error).message}`);
      await alertFounder('linkedin', 'LinkedIn post failed',
        `Could not post "${post.title}" to the company page: ${(err as Error).message}

If the session expired, sign in again with: bun automation/linkedin-browser.ts login
The post retries every hour.`);
    }
  }
}

/* ---------- Step 3: IndexNow for newly live articles ---------- */

async function pingNewArticles() {
  const pinged: Record<string, string> = existsSync(INDEXNOW_LOG) ? JSON.parse(readFileSync(INDEXNOW_LOG, 'utf8')) : {};
  // Follow-up posts reuse an article URL that was already pinged. A launch post
  // can carry notBefore too (staggered releases) and still needs its ping.
  for (const post of readQueue().filter((p) => !pinged[p.slug] && !p.slug.endsWith('-followup'))) {
    if (!(await isLive(post.url))) continue;
    if (DRY_RUN) {
      log(`${post.slug}: would ping IndexNow (dry run)`);
      continue;
    }
    try {
      await pingIndexNow([post.url, `${siteUrl()}/blog`, `${siteUrl()}/blog/feed.xml`]);
      pinged[post.slug] = new Date().toISOString();
      mkdirSync(STATE_DIR, { recursive: true });
      writeFileSync(INDEXNOW_LOG, JSON.stringify(pinged, null, 2));
      log(`${post.slug}: pinged IndexNow`);
    } catch (err) {
      log(`${post.slug}: ${(err as Error).message}`);
    }
  }
}

// Any sitemap URL that is new or has a new lastmod (tracker updates, released
// drafts, glossary and solution edits) gets pinged once it is live.
async function pingSitemapChanges() {
  const res = await fetch(`${siteUrl()}/sitemap.xml`, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`sitemap ${res.status}`);
  const first = !existsSync(SITEMAP_STATE);
  const seen: Record<string, string> = first ? {} : JSON.parse(readFileSync(SITEMAP_STATE, 'utf8'));
  const { changed, next } = changedSitemapUrls(await res.text(), seen);
  // The first run only records the baseline: every URL was submitted by hand once.
  if (!first && changed.length > 0) {
    if (DRY_RUN) {
      log(`would ping IndexNow for ${changed.length} changed sitemap URL(s) (dry run)`);
      return;
    }
    await pingIndexNow(changed.slice(0, 10_000));
    log(`pinged IndexNow for ${changed.length} changed sitemap URL(s)`);
  }
  if (DRY_RUN) return;
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(SITEMAP_STATE, JSON.stringify(next, null, 2));
}

/* ---------- Step 4: deliver finished audits ---------- */

async function deliverAudits() {
  if (!auditQueueReady()) return;
  const claimed = (await listAuditRequests('in_progress')).filter((r) => r.auditSlug);
  for (const req of claimed) {
    const url = `${siteUrl()}/audit/${req.auditSlug}`;
    const tag = `audit ${req.auditSlug} for ${req.bank ?? req.email}`;
    if (!(await isLive(url))) {
      log(`${tag}: ${url} not live yet, will retry`);
    } else if (DRY_RUN) {
      log(`${tag}: would email the requester (dry run)`);
    } else {
      try {
        await setAuditStatus({ id: req.id, status: 'delivered' });
        log(`${tag}: delivered`);
        await pingIndexNow([url]).catch((err) => log(`${tag}: ${(err as Error).message}`));
      } catch (err) {
        log(`${tag}: ${(err as Error).message}`);
      }
    }
  }
}

async function followUpAudits() {
  if (!auditQueueReady()) return;
  const due = (await listAuditRequests('delivered')).filter(
    (r) => !r.followUpSentAt && r.statusUpdatedAt && Date.now() - Date.parse(r.statusUpdatedAt) >= 5 * 86_400_000,
  );
  for (const req of due) {
    const tag = `audit ${req.auditSlug} for ${req.bank ?? req.email}`;
    if (DRY_RUN) {
      log(`${tag}: would send the follow-up (dry run)`);
      continue;
    }
    try {
      await sendAuditFollowUp(req.id);
      log(`${tag}: follow-up sent`);
    } catch (err) {
      log(`${tag}: ${(err as Error).message}`);
    }
  }
}

/* ---------- Same-day alert: a bank is looking at its audit or demo ---------- */

// Three or more visitors in a day across one bank's audit and demo usually
// means it is being passed around inside the bank: worth a same-day call.
const HOT_VISITORS = 3;

async function warmAccountAlerts() {
  // Once a day, at the 9:05 ET run; alertFounder also caps each bank to one a day.
  const hourEt = Number(new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }));
  if (hourEt !== 9 && !DRY_RUN) return;
  const hot = hotAccounts(fetchPageVisits(new Date(Date.now() - 86_400_000), REPO), HOT_VISITORS);
  for (const h of hot) {
    const name = getAudit(h.slug)?.bankName ?? h.slug;
    const detail = `${h.audit + h.demo} visitors in the past 24h (audit ${h.audit}, demo ${h.demo}).`;
    if (DRY_RUN) {
      log(`would alert: ${name} ${detail}`);
      continue;
    }
    await alertFounder(`warm-${h.slug}`, `${name} is looking at its RAVEN audit`,
      `${detail}\n\nAudit: ${siteUrl()}/audit/${h.slug}\nDemo: ${siteUrl()}/wl/${h.slug}\n\nLikely people at ${name} sharing it internally. A same-day note or call while it is fresh.`);
    log(`warm account alert: ${name} (${detail})`);
  }
}

// Bank tracker: emails visitors who asked to follow a bank once its next call
// report posts. The server skips quarters already sent, so daily is safe.
async function bankTrackerUpdates() {
  const hourEt = Number(new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }));
  if (hourEt !== 10 && !DRY_RUN) return;
  try {
    const result = await ravenApi('/bank-tracker/send', { method: 'POST', body: JSON.stringify(DRY_RUN ? { dryRun: true } : {}) });
    log(`bank tracker: ${JSON.stringify(result)}`);
  } catch (err) {
    const msg = (err as Error).message;
    log(`bank tracker step failed: ${msg.split('\n')[0]}`);
    // 404: this clone's code is ahead of the deployed site (the route ships in the same merge).
    if (DRY_RUN || / 404: /.test(msg)) return;
    await alertFounder('bank-tracker', 'Bank tracker emails did not send', msg);
  }
}

/* ---------- Main ---------- */

if (import.meta.main) {
  try {
    await mergeDuePullRequests();
  } catch (err) {
    log(`merge step failed: ${(err as Error).message}`);
    await alertFounder('merge-step', 'Auto-publish merge step failed', (err as Error).message);
  }
  await postQueued().catch((err) => log(`LinkedIn step failed: ${(err as Error).message}`));
  await pingNewArticles().catch((err) => log(`IndexNow step failed: ${(err as Error).message}`));
  await pingSitemapChanges().catch((err) => log(`IndexNow sitemap step failed: ${(err as Error).message}`));
  await deliverAudits().catch((err) => log(`audit delivery step failed: ${(err as Error).message}`));
  await followUpAudits().catch((err) => log(`audit follow-up step failed: ${(err as Error).message}`));
  await warmAccountAlerts().catch((err) => log(`warm account step skipped: ${(err as Error).message.split('\n')[0]}`));
  await bankTrackerUpdates();
  log('done');
}
