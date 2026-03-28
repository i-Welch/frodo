/**
 * List early access interest signups.
 *
 * Usage:
 *   bun scripts/list-interest-signups.ts [limit]
 *
 * Examples:
 *   bun scripts/list-interest-signups.ts
 *   bun scripts/list-interest-signups.ts 100
 */

import { queryItems } from '../src/store/base-store.js';

const limit = process.argv[2] ? parseInt(process.argv[2], 10) : 50;

const { items } = await queryItems({
  pk: 'INTEREST',
  skPrefix: 'SIGNUP#',
  scanForward: false,
  limit,
});

if (items.length === 0) {
  console.log('No signups yet.');
  process.exit(0);
}

console.log(`\n${items.length} signup(s):\n`);
console.log('Name'.padEnd(30) + 'Email'.padEnd(40) + 'Date');
console.log('─'.repeat(90));

for (const item of items) {
  const date = new Date(item.timestamp as string).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  console.log(
    String(item.name).padEnd(30) +
    String(item.email).padEnd(40) +
    date,
  );
}
console.log('');
