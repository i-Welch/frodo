// Auto-publisher for /article PRs. Run hourly (see register-tasks.ps1).
//
// 1. Merges open PRs labeled `auto-publish` once they are 24h old, CI is green,
//    and the PR is mergeable. Close the PR or remove the label to stop it.
// 2. For each LinkedIn queue file on master (marketing/linkedin/queue/<slug>.md)
//    not yet posted, waits until the article URL returns 200, then posts it to
//    the RAVEN company page and records it in the local posted log.
//
// LinkedIn credentials live outside the repo in %USERPROFILE%\.raven\linkedin.env:
//   LINKEDIN_ACCESS_TOKEN=...      (w_organization_social scope)
//   LINKEDIN_ORG_ID=12345678       (numeric id of the company page)
//   LINKEDIN_VERSION=202609        (optional, YYYYMM)
// Without them, posts go through the signed-in Edge profile instead
// (linkedin-browser.ts). With neither, queued posts wait.
//
// 3. For each claimed free-audit request (see audit-requests.ts), emails the
//    requester once https://reportraven.tech/audit/<slug> returns 200.
//
// Usage: bun automation/auto-publish.ts [--dry-run]

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { browserReady, postViaBrowser } from './linkedin-browser';
import { auditQueueReady, listAuditRequests, setAuditStatus, siteUrl } from './audit-requests';

const REPO = resolve(import.meta.dir, '..');
const STATE_DIR = join(homedir(), '.raven');
const POSTED_LOG = join(STATE_DIR, 'linkedin-posted.json');
const LINKEDIN_ENV = join(STATE_DIR, 'linkedin.env');
const LABEL = 'auto-publish';
const DELAY_HOURS = 24;
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

function mergeDuePullRequests() {
  const prs: PullRequest[] = JSON.parse(
    run('gh', [
      'pr', 'list', '--state', 'open', '--label', LABEL,
      '--json', 'number,title,createdAt,mergeable,isDraft,statusCheckRollup',
    ]),
  );
  for (const pr of prs) {
    const ageHours = (Date.now() - Date.parse(pr.createdAt)) / 3_600_000;
    const tag = `#${pr.number} "${pr.title}"`;
    if (pr.isDraft) {
      log(`${tag}: draft, skipping`);
    } else if (ageHours < DELAY_HOURS) {
      log(`${tag}: ${ageHours.toFixed(1)}h old, merges at ${DELAY_HOURS}h`);
    } else if (pr.mergeable !== 'MERGEABLE') {
      log(`${tag}: not mergeable (${pr.mergeable}), needs attention`);
    } else if (!checksGreen(pr)) {
      log(`${tag}: CI not green, waiting`);
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
    return { slug: meta.slug, title: meta.title, description: meta.description, url: meta.url, text: match[2].trim() };
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

async function postQueued() {
  const queue = readQueue();
  const posted = loadPosted();
  const pending = queue.filter((p) => !posted[p.slug]);
  if (pending.length === 0) return;

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
    } catch (err) {
      log(`${post.slug}: ${(err as Error).message}`);
    }
  }
}

/* ---------- Step 3: deliver finished audits ---------- */

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
      } catch (err) {
        log(`${tag}: ${(err as Error).message}`);
      }
    }
  }
}

/* ---------- Main ---------- */

if (import.meta.main) {
  try {
    mergeDuePullRequests();
  } catch (err) {
    log(`merge step failed: ${(err as Error).message}`);
  }
  await postQueued().catch((err) => log(`LinkedIn step failed: ${(err as Error).message}`));
  await deliverAudits().catch((err) => log(`audit delivery step failed: ${(err as Error).message}`));
  log('done');
}
