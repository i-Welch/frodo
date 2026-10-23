// What changed in the De Novo Watch tracker over the past week, for the Monday
// digest. New banks and status changes are sales prospects: a bank that just
// filed or won approval is choosing its day-one technology stack.

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// URL-based so the diff can be unit tested under vitest as well as run by bun.
const REPO = fileURLToPath(new URL('..', import.meta.url));
const DATA = 'dashboard/src/app/(marketing)/de-novo-watch/de-novo-data.ts';

interface Row {
  name: string;
  location: string;
  status: string;
  leadership?: string;
}

export function diffTracker(before: Row[], after: Row[], labels: Record<string, string>): string[] {
  const old = new Map(before.map((b) => [b.name, b]));
  const lines: string[] = [];
  for (const b of after) {
    const prev = old.get(b.name);
    const who = b.leadership ? ` Leadership: ${b.leadership.replace(/\.$/, '')}.` : '';
    if (!prev) lines.push(`  - New: ${b.name} (${b.location}), ${labels[b.status] ?? b.status}.${who}`);
    else if (prev.status !== b.status) {
      lines.push(`  - ${b.name} (${b.location}): ${labels[prev.status] ?? prev.status} -> ${labels[b.status] ?? b.status}.${who}`);
    }
  }
  return lines;
}

export async function deNovoChanges(since: Date): Promise<string[]> {
  try {
    const git = (args: string[]) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8' }).trim();
    const base = git(['rev-list', '-1', `--before=${since.toISOString()}`, 'HEAD']);
    if (!base) return [];
    // The data file has no imports, so the old revision can be loaded on its own.
    const dir = join(homedir(), '.raven', 'tmp');
    mkdirSync(dir, { recursive: true });
    const oldFile = join(dir, `de-novo-data-${base.slice(0, 8)}.ts`);
    writeFileSync(oldFile, git(['show', `${base}:${DATA}`]));
    const before = await import(oldFile);
    rmSync(oldFile, { force: true });
    const after = await import(join(REPO, DATA));
    const lines = diffTracker(before.DE_NOVO_BANKS, after.DE_NOVO_BANKS, after.STATUS_LABELS);
    if (lines.length === 0) return ['De Novo Watch: no new banks or status changes this week.'];
    return ['De Novo Watch changes this week (prospects choosing a day-one stack):', ...lines];
  } catch (err) {
    return [`De Novo Watch: could not compare (${(err as Error).message.split('\n')[0]})`];
  }
}
