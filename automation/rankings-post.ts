// Weekly LinkedIn post from the state bank rankings (Wednesdays, see
// register-tasks.ps1). Picks the next Southeast state without a post for the
// current quarter, writes marketing/linkedin/queue/rankings-<st>-<quarter>.md,
// and opens an auto-publish PR. Auto-publish merges it after 24h and posts it
// in the next LinkedIn slot. Seven states, so each gets one post a quarter.
//
// Usage: bun automation/rankings-post.ts [--dry-run]

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { SITEMAP_STATES, stateRankings } from '../dashboard/src/app/(marketing)/bank-snapshot/peer-data';
import { rankingsPost, rankingsQueueFile, rankingsSlug } from './rankings-text';
import { alertFounder } from './alert';

const REPO = resolve(import.meta.dir, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const log = (msg: string) => console.log(`[${new Date().toISOString()}] rankings-post: ${msg}`);
const run = (cmd: string, args: string[]) => execFileSync(cmd, args, { cwd: REPO, encoding: 'utf8' }).trim();

function alreadyQueued(slug: string): boolean {
  const onMaster = run('git', ['log', 'origin/master', '--name-only', '--format=', '--', 'marketing/linkedin/queue/']);
  if (onMaster.split('\n').some((f) => f.endsWith(`/${slug}.md`))) return true;
  const open = run('gh', ['pr', 'list', '--state', 'open', '--json', 'headRefName', '-q', '.[].headRefName']);
  return open.split('\n').includes(`rankings/${slug}`);
}

try {
  run('git', ['fetch', '-q', 'origin', 'master']);
  // Start the rotation at a different state each week so a skipped week does
  // not always skip the same state.
  const week = Math.floor(Date.now() / (7 * 86_400_000));
  const order = SITEMAP_STATES.map((_, i) => SITEMAP_STATES[(week + i) % SITEMAP_STATES.length]);
  let posted = false;
  for (const stalp of order) {
    const r = await stateRankings(stalp);
    if (!r) continue;
    const slug = rankingsSlug(r);
    if (alreadyQueued(slug)) continue;
    const text = rankingsPost(r);
    if (!text) continue;
    if (DRY_RUN) {
      log(`would queue ${slug}:\n${rankingsQueueFile(r, text)}`);
      posted = true;
      break;
    }
    const branch = `rankings/${slug}`;
    const file = join('marketing', 'linkedin', 'queue', `${slug}.md`);
    try {
      run('git', ['checkout', '-q', '-B', branch, 'origin/master']);
      mkdirSync(dirname(join(REPO, file)), { recursive: true });
      writeFileSync(join(REPO, file), rankingsQueueFile(r, text));
      run('git', ['add', file]);
      run('git', ['commit', '-q', '-m', `LinkedIn: ${r.stateName} bank rankings (${r.quarter})`]);
      run('git', ['push', '-q', '-u', 'origin', branch]);
      const url = run('gh', [
        'pr', 'create', '--head', branch, '--base', 'master', '--label', 'auto-publish',
        '--title', `LinkedIn: ${r.stateName} bank rankings (${r.quarter})`,
        '--body', `Queues a LinkedIn post linking /bank-rankings for ${r.stateName}, generated from ${r.quarter} FDIC call reports by automation/rankings-post.ts. Merges automatically after 24h; close the PR to skip it.\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)`,
      ]);
      log(`queued ${slug}: ${url}`);
    } finally {
      run('git', ['checkout', '-q', '-f', 'master']);
    }
    posted = true;
    break;
  }
  if (!posted) log('every state already has a post for the latest quarter; nothing to do');
} catch (err) {
  log(`failed: ${(err as Error).message}`);
  await alertFounder('rankings-post', 'Weekly bank rankings post failed', (err as Error).message);
  process.exit(1);
}
