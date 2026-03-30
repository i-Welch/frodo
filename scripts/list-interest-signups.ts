/**
 * List early access interest signups.
 *
 * Usage:
 *   bun scripts/list-interest-signups.ts [--env production|staging] [limit]
 *
 * Examples:
 *   bun scripts/list-interest-signups.ts                    # local
 *   bun scripts/list-interest-signups.ts --env production   # production
 *   bun scripts/list-interest-signups.ts --env staging 100  # staging, 100 results
 */

// ---------------------------------------------------------------------------
// Parse --env flag and override .env values BEFORE any SDK imports
// ---------------------------------------------------------------------------

const ENV_CONFIG = {
  production: {
    table: 'frodo-production-main',
    region: 'us-east-2',
    profile: 'raven',
  },
  staging: {
    table: 'frodo-staging-main',
    region: 'us-east-2',
    profile: 'raven',
  },
} as const;

const envIdx = process.argv.indexOf('--env');
if (envIdx !== -1) {
  const envName = process.argv[envIdx + 1] as keyof typeof ENV_CONFIG;
  const envCfg = ENV_CONFIG[envName];
  if (!envCfg) {
    console.error(`Invalid env "${envName}". Use --env staging or --env production.`);
    process.exit(1);
  }
  process.env.DYNAMODB_TABLE = envCfg.table;
  process.env.AWS_REGION = envCfg.region;
  process.env.AWS_PROFILE = envCfg.profile;
  delete process.env.DYNAMODB_ENDPOINT;
  process.argv.splice(envIdx, 2);
}

// ---------------------------------------------------------------------------
// Dynamic import so env overrides take effect before the SDK initializes
// ---------------------------------------------------------------------------

const { queryItems } = await import('../src/store/base-store.js');

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
