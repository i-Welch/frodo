// Monday digest for the founder (see register-tasks.ps1). Collects what only
// this PC knows (open auto-publish PRs, LinkedIn posts, failed runs) and asks
// the server to email the weekly summary alongside leads and subscribers.
//
// Usage: bun automation/digest.ts [--print]   (--print shows the local lines without sending)

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { ravenApi } from './raven-api';
import { alertFounder } from './alert';
import { deNovoChanges } from './de-novo-changes';

const REPO = resolve(import.meta.dir, '..');
const STATE_DIR = join(homedir(), '.raven');
const LOG_DIR = join(STATE_DIR, 'logs');
const WEEK_AGO = Date.now() - 7 * 86_400_000;

// PowerShell 5.1 appends with UTF-16LE; scripts that log directly write UTF-8.
function readLog(path: string): string {
  const buf = readFileSync(path);
  return buf[0] === 0xff && buf[1] === 0xfe ? buf.toString('utf16le') : buf.toString('utf8');
}

function openPullRequests(): string[] {
  try {
    const prs: { number: number; title: string; createdAt: string; labels: { name: string }[] }[] = JSON.parse(
      execFileSync('gh', ['pr', 'list', '--state', 'open', '--json', 'number,title,createdAt,labels'], {
        cwd: REPO,
        encoding: 'utf8',
      }),
    );
    const auto = prs.filter((p) => p.labels.some((l) => l.name === 'auto-publish'));
    // PRs without the label never merge on their own; they wait for Isaac.
    const manual = prs.filter((p) => !p.labels.some((l) => l.name === 'auto-publish'));
    const age = (p: { createdAt: string }) => Math.round((Date.now() - Date.parse(p.createdAt)) / 86_400_000);
    return [
      ...(auto.length === 0
        ? ['No auto-publish PRs waiting.']
        : auto.map((p) => {
            const hours = Math.round((Date.now() - Date.parse(p.createdAt)) / 3_600_000);
            return `Waiting to merge: #${p.number} ${p.title} (${hours}h old)`;
          })),
      ...manual.map((p) => `Needs your review: #${p.number} ${p.title} (${age(p)}d old) https://github.com/i-Welch/frodo/pull/${p.number}`),
    ];
  } catch (err) {
    return [`Could not list PRs: ${(err as Error).message.split('\n')[0]}`];
  }
}

function linkedInPosts(): string[] {
  const file = join(STATE_DIR, 'linkedin-posted.json');
  if (!existsSync(file)) return ['LinkedIn: nothing posted yet.'];
  const posted: Record<string, string> = JSON.parse(readFileSync(file, 'utf8'));
  const recent = Object.entries(posted).filter(([, v]) => Date.parse(v.split(' ')[0]) >= WEEK_AGO);
  return [`LinkedIn posts this week: ${recent.length}`, ...recent.map(([slug]) => `  - ${slug}`)];
}

// Finished articles still commented out of BLOG_SLUGS, released twice a week by /release-draft.
function heldDrafts(): string[] {
  try {
    const src = readFileSync(join(REPO, 'dashboard/src/app/(marketing)/blog/published.ts'), 'utf8');
    const block = src.slice(src.indexOf('export const BLOG_SLUGS'), src.indexOf('export const BLOG_DATES'));
    const held = block.split('\n').filter((l) => /^\s*\/\/\s*'[a-z0-9-]+',/.test(l)).length;
    const retired = block.split('\n').filter((l) => /\/\/\s*retired/.test(l)).length;
    return [`Held drafts left to release: ${held}${retired ? ` (${retired} retired)` : ''}`];
  } catch {
    return [];
  }
}

// Pitch drafts written by /de-novo-update this week, ready for Isaac to send.
function pitches(): string[] {
  try {
    const out = execFileSync(
      'git',
      ['log', `--since=${new Date(WEEK_AGO).toISOString()}`, '--diff-filter=A', '--name-only', '--format=', 'origin/master', '--', 'marketing/pitches/'],
      { cwd: REPO, encoding: 'utf8' },
    );
    const files = [...new Set(out.split('\n').map((l) => l.trim()).filter((l) => l.endsWith('.md')))];
    if (files.length === 0) return [];
    return [
      `Reporter pitches ready to send (${files.length}):`,
      ...files.map((p) => `  - https://github.com/i-Welch/frodo/blob/master/${p}`),
    ];
  } catch {
    return [];
  }
}

// Tasks that register-tasks.ps1 defines but Windows does not have, e.g. one
// added in a merged PR before anyone re-ran the script.
function missingTasks(): string[] {
  try {
    const expected = [...readFileSync(join(REPO, 'automation/register-tasks.ps1'), 'utf8').matchAll(/Register-ScheduledTask -TaskName '([^']+)'/g)].map((m) => m[1]);
    const registered = execFileSync('schtasks', ['/query', '/fo', 'csv', '/nh'], { encoding: 'utf8' });
    const missing = expected.filter((name) => !registered.includes(`"\\${name}"`));
    return missing.length ? [`Scheduled tasks not registered (run automation/register-tasks.ps1): ${missing.join(', ')}`] : [];
  } catch {
    return [];
  }
}

function problems(): string[] {
  if (!existsSync(LOG_DIR)) return [];
  const found: string[] = [];
  for (const name of readdirSync(LOG_DIR)) {
    const path = join(LOG_DIR, name);
    if (!name.endsWith('.log') || statSync(path).mtimeMs < WEEK_AGO) continue;
    for (const line of readLog(path).split(/\r?\n/)) {
      const stamp = line.match(/^\[(\d{4}-\d{2}-\d{2}T[^\]]+)\]/)?.[1];
      if (stamp && Date.parse(stamp) < WEEK_AGO) continue;
      if (/RUN FAILED|ARTICLE RUN FAILED|failed|needs attention|not mergeable/i.test(line)) {
        found.push(`${name}: ${line.trim().slice(0, 300)}`);
      }
    }
  }
  if (found.length === 0) return ['No failed runs in the logs.'];
  return [`Problems in the logs (${found.length}):`, ...found.slice(-15).map((l) => `  - ${l}`)];
}

const automation = [
  ...openPullRequests(),
  ...linkedInPosts(),
  ...(await deNovoChanges(new Date(WEEK_AGO))),
  ...pitches(),
  ...heldDrafts(),
  ...missingTasks(),
  ...problems(),
];

if (process.argv.includes('--print')) {
  console.log(automation.join('\n'));
} else {
  try {
    const result = await ravenApi('/digest/send', { method: 'POST', body: JSON.stringify({ automation }) });
    console.log(`[${new Date().toISOString()}] digest sent: ${JSON.stringify(result)}`);
  } catch (err) {
    console.log(`[${new Date().toISOString()}] digest failed: ${(err as Error).message}`);
    await alertFounder('digest', 'Weekly digest did not send', (err as Error).message);
    process.exit(1);
  }
}
