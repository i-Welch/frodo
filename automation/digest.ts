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
    const prs: { number: number; title: string; createdAt: string }[] = JSON.parse(
      execFileSync('gh', ['pr', 'list', '--state', 'open', '--label', 'auto-publish', '--json', 'number,title,createdAt'], {
        cwd: REPO,
        encoding: 'utf8',
      }),
    );
    if (prs.length === 0) return ['No auto-publish PRs waiting.'];
    return prs.map((p) => {
      const hours = Math.round((Date.now() - Date.parse(p.createdAt)) / 3_600_000);
      return `Waiting to merge: #${p.number} ${p.title} (${hours}h old)`;
    });
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
