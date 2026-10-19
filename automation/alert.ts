// Emails Isaac when unattended automation needs a human (see /api/v1/admin/alert).
// Each problem key alerts at most once a day, so an hourly task stuck on the
// same failure does not flood the inbox. Never throws.
//
// Usage: bun automation/alert.ts <key> "<subject>" "<details>"

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ravenApi, ravenApiReady } from './raven-api';

const STATE_DIR = join(homedir(), '.raven');
const SENT_LOG = join(STATE_DIR, 'alerts-sent.json');
const REPEAT_HOURS = 24;

export async function alertFounder(key: string, subject: string, text: string): Promise<void> {
  try {
    const sent: Record<string, string> = existsSync(SENT_LOG) ? JSON.parse(readFileSync(SENT_LOG, 'utf8')) : {};
    if (sent[key] && Date.now() - Date.parse(sent[key]) < REPEAT_HOURS * 3_600_000) return;
    if (!ravenApiReady()) return;
    await ravenApi('/alert', {
      method: 'POST',
      body: JSON.stringify({ subject, text: `${text}\n\nLogs: ${join(STATE_DIR, 'logs')}\n(This alert repeats at most once a day while the problem persists.)` }),
    });
    sent[key] = new Date().toISOString();
    mkdirSync(STATE_DIR, { recursive: true });
    writeFileSync(SENT_LOG, JSON.stringify(sent, null, 2));
  } catch (err) {
    console.log(`alert "${subject}" could not be sent: ${(err as Error).message}`);
  }
}

if (import.meta.main) {
  const [key, subject, text] = process.argv.slice(2);
  if (!key || !subject) {
    console.error('usage: bun automation/alert.ts <key> "<subject>" "<details>"');
    process.exit(1);
  }
  await alertFounder(key, subject, text ?? '');
}
