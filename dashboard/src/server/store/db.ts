import pg from 'pg';
import { config } from '../config/app-config';

/** Shared Neon Postgres pool. */
export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: Number(process.env.DATABASE_POOL_MAX ?? 10),
});

export const TABLE_NAME = config.itemsTable;
export const LOOKUP_TABLE_NAME = config.lookupTable;

/** Run a parameterized query. */
export function query<T extends pg.QueryResultRow = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

/**
 * Create the items and identity-lookup tables if they do not exist.
 * Idempotent; used by `db:create` and by tests.
 */
export async function ensureTables(): Promise<void> {
  const t = `"${TABLE_NAME}"`;
  const l = `"${LOOKUP_TABLE_NAME}"`;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${t} (
      pk     text COLLATE "C" NOT NULL,
      sk     text COLLATE "C" NOT NULL,
      gsi1pk text COLLATE "C",
      gsi1sk text COLLATE "C",
      gsi2pk text COLLATE "C",
      gsi2sk text COLLATE "C",
      ttl    bigint,
      attrs  jsonb NOT NULL,
      PRIMARY KEY (pk, sk)
    );
    CREATE INDEX IF NOT EXISTS "${TABLE_NAME}_gsi1" ON ${t} (gsi1pk, gsi1sk, pk, sk) WHERE gsi1pk IS NOT NULL;
    CREATE INDEX IF NOT EXISTS "${TABLE_NAME}_gsi2" ON ${t} (gsi2pk, gsi2sk, pk, sk) WHERE gsi2pk IS NOT NULL;
    CREATE INDEX IF NOT EXISTS "${TABLE_NAME}_ttl" ON ${t} (ttl) WHERE ttl IS NOT NULL;
    CREATE TABLE IF NOT EXISTS ${l} (
      pk    text COLLATE "C" NOT NULL,
      sk    text COLLATE "C" NOT NULL,
      attrs jsonb NOT NULL,
      PRIMARY KEY (pk, sk)
    );
    CREATE INDEX IF NOT EXISTS "${LOOKUP_TABLE_NAME}_sk" ON ${l} (sk);
  `);
}

/** Delete rows past their TTL (Dynamo did this lazily; call from a cron). */
export async function purgeExpired(): Promise<number> {
  const r = await pool.query(
    `DELETE FROM "${TABLE_NAME}" WHERE ttl IS NOT NULL AND ttl < extract(epoch from now())::bigint`,
  );
  return r.rowCount ?? 0;
}
