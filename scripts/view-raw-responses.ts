/**
 * View raw provider API responses for a user.
 * Internal developer tool — shows decrypted request/response bodies.
 *
 * Usage:
 *   bun scripts/view-raw-responses.ts <userId> [provider] [limit]
 *
 * Examples:
 *   bun scripts/view-raw-responses.ts abc-123
 *   bun scripts/view-raw-responses.ts abc-123 plaid
 *   bun scripts/view-raw-responses.ts abc-123 socure 5
 */

import { listRawResponses } from '../src/store/raw-response-store.js';

const userId = process.argv[2];
const provider = process.argv[3];
const limit = process.argv[4] ? parseInt(process.argv[4], 10) : 20;

if (!userId) {
  console.error('Usage: bun scripts/view-raw-responses.ts <userId> [provider] [limit]');
  process.exit(1);
}

console.log(`\nFetching raw responses for user: ${userId}`);
if (provider) console.log(`Provider filter: ${provider}`);
console.log(`Limit: ${limit}\n`);

const responses = await listRawResponses(userId, provider, limit);

if (responses.length === 0) {
  console.log('No raw responses found.');
  process.exit(0);
}

console.log(`Found ${responses.length} response(s):\n`);

for (const r of responses) {
  console.log('═'.repeat(80));
  console.log(`Provider:  ${r.provider}`);
  console.log(`Endpoint:  ${r.method} ${r.endpoint}`);
  console.log(`Status:    ${r.statusCode}`);
  console.log(`Duration:  ${r.durationMs}ms`);
  console.log(`Timestamp: ${r.timestamp}`);
  console.log(`ID:        ${r.responseId}`);

  if (r.requestBody) {
    console.log('\n--- Request Body ---');
    console.log(JSON.stringify(r.requestBody, null, 2));
  }

  console.log('\n--- Response Body ---');
  console.log(JSON.stringify(r.responseBody, null, 2));
  console.log('');
}
