import { ensureTables, pool, TABLE_NAME, LOOKUP_TABLE_NAME } from '../src/store/db.js';

async function main() {
  console.log('Setting up Postgres tables...');
  await ensureTables();
  console.log(`Tables "${TABLE_NAME}" and "${LOOKUP_TABLE_NAME}" ready.`);
  await pool.end();
}

main().catch((err) => {
  console.error('Failed to create tables:', err);
  process.exit(1);
});
