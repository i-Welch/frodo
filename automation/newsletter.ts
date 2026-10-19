// Sends the weekly RAVEN newsletter (Fridays, see register-tasks.ps1): the
// articles published in the past 7 days, to every active subscriber. The
// server picks the articles, skips empty weeks, and never sends an issue twice.
//
// Usage: bun automation/newsletter.ts [--dry-run] [--test you@example.com] [--date YYYY-MM-DD]

import { ravenApi } from './raven-api';
import { alertFounder } from './alert';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

const body = {
  issueDate: arg('--date') ?? new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }),
  dryRun: process.argv.includes('--dry-run') || undefined,
  testTo: arg('--test'),
};

try {
  const result = await ravenApi('/newsletter/send', { method: 'POST', body: JSON.stringify(body) });
  console.log(`[${new Date().toISOString()}] newsletter ${body.issueDate}: ${JSON.stringify(result)}`);
} catch (err) {
  console.log(`[${new Date().toISOString()}] newsletter ${body.issueDate} failed: ${(err as Error).message}`);
  await alertFounder('newsletter', 'Weekly newsletter did not send', (err as Error).message);
  process.exit(1);
}
