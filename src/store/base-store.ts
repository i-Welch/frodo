import { pool, TABLE_NAME } from './db.js';

// ---------------------------------------------------------------------------
// Key builders — primary table
// ---------------------------------------------------------------------------

export const keys = {
  tenant: (tenantId: string) => ({
    PK: `TENANT#${tenantId}`,
    SK: 'METADATA',
  }),

  apiKey: (tenantId: string, keyId: string) => ({
    PK: `TENANT#${tenantId}`,
    SK: `APIKEY#${keyId}`,
  }),

  userModule: (userId: string, module: string) => ({
    PK: `USER#${userId}`,
    SK: `MODULE#${module}`,
  }),

  dataEvent: (userId: string, module: string, ts: string, eventId: string) => ({
    PK: `USER#${userId}`,
    SK: `EVENT#${module}#${ts}#${eventId}`,
  }),

  tenantUserLink: (tenantId: string, userId: string) => ({
    PK: `TENANT#${tenantId}`,
    SK: `USERLINK#${userId}`,
  }),

  session: (sessionId: string) => ({
    PK: `SESSION#${sessionId}`,
    SK: 'METADATA',
  }),

  formToken: (token: string) => ({
    PK: `FORM#${token}`,
    SK: 'METADATA',
  }),

  accessLog: (tenantId: string, ts: string, userId: string) => ({
    PK: `ACCESSLOG#${tenantId}`,
    SK: `${ts}#${userId}`,
  }),

  consent: (userId: string, tenantId: string, ts: string) => ({
    PK: `USER#${userId}`,
    SK: `CONSENT#${tenantId}#${ts}`,
  }),
};

// ---------------------------------------------------------------------------
// Key builders — GSI
// ---------------------------------------------------------------------------

export const gsiKeys = {
  apiKeyPrefix: (prefix: string) => ({ GSI1PK: `APIKEY#${prefix}` }),

  eventsBySource: (source: string) => ({ GSI1PK: `EVENT#${source}` }),

  tenantsForUser: (userId: string) => ({ GSI1PK: `USER#${userId}` }),

  sessionsForUser: (userId: string) => ({ GSI1PK: `USER#${userId}` }),
};

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/** Thrown when a conditional write's guard fails. */
export class ConditionalCheckFailedError extends Error {
  constructor(message = 'The conditional request failed') {
    super(message);
    this.name = 'ConditionalCheckFailedException';
  }
}

// ---------------------------------------------------------------------------
// Row mapping
// ---------------------------------------------------------------------------

type Item = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

const T = `"${TABLE_NAME}"`;

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

export interface PutOptions {
  /** Fail unless no item exists at this key. */
  ifNotExists?: boolean;
  /** Fail if the existing item already has this attribute set. */
  ifAttrNotSet?: string;
  /**
   * Fail if the existing item's attribute equals any of the listed values.
   * Passes when no item exists or the attribute is absent.
   */
  ifAttrNotIn?: { attr: string; values: unknown[] };
}

export async function putItem(item: Item, opts?: PutOptions): Promise<void> {
  const pk = item.PK as string;
  const sk = item.SK as string;
  const params = [
    pk,
    sk,
    str(item.GSI1PK),
    str(item.GSI1SK),
    str(item.GSI2PK),
    str(item.GSI2SK),
    typeof item.ttl === 'number' ? Math.floor(item.ttl) : null,
    JSON.stringify(item),
  ];

  const guards: string[] = [];
  if (opts?.ifNotExists) guards.push('FALSE');
  if (opts?.ifAttrNotSet) {
    params.push(opts.ifAttrNotSet);
    guards.push(`NOT (${T}.attrs ? $${params.length})`);
  }
  if (opts?.ifAttrNotIn) {
    params.push(opts.ifAttrNotIn.attr);
    const attrIdx = params.length;
    params.push(JSON.stringify(opts.ifAttrNotIn.values));
    guards.push(
      `NOT (${T}.attrs ->> $${attrIdx} IN (SELECT jsonb_array_elements_text($${params.length}::jsonb)))`,
    );
  }

  const insert = `INSERT INTO ${T} (pk, sk, gsi1pk, gsi1sk, gsi2pk, gsi2sk, ttl, attrs)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`;

  if (guards.length === 0) {
    await pool.query(
      `${insert}
       ON CONFLICT (pk, sk) DO UPDATE SET gsi1pk = EXCLUDED.gsi1pk, gsi1sk = EXCLUDED.gsi1sk,
         gsi2pk = EXCLUDED.gsi2pk, gsi2sk = EXCLUDED.gsi2sk, ttl = EXCLUDED.ttl, attrs = EXCLUDED.attrs`,
      params,
    );
    return;
  }

  const r = await pool.query(
    `${insert}
     ON CONFLICT (pk, sk) DO UPDATE SET gsi1pk = EXCLUDED.gsi1pk, gsi1sk = EXCLUDED.gsi1sk,
       gsi2pk = EXCLUDED.gsi2pk, gsi2sk = EXCLUDED.gsi2sk, ttl = EXCLUDED.ttl, attrs = EXCLUDED.attrs
     WHERE ${guards.join(' AND ')}`,
    params,
  );
  if (r.rowCount === 0) throw new ConditionalCheckFailedError();
}

export async function getItem(key: { PK: string; SK: string }): Promise<Item | null> {
  const r = await pool.query<{ attrs: Item }>(`SELECT attrs FROM ${T} WHERE pk = $1 AND sk = $2`, [
    key.PK,
    key.SK,
  ]);
  return r.rows[0]?.attrs ?? null;
}

/**
 * Merge `set` into an existing item's attributes. No-op if the item is
 * missing (Dynamo UpdateItem upserts; every caller updates an existing row).
 * Pass `null` to remove an attribute. `ttl` is mirrored to its column.
 */
export async function updateItem(key: { PK: string; SK: string }, set: Item): Promise<void> {
  const patch = JSON.stringify(set);
  const hasTtl = Object.prototype.hasOwnProperty.call(set, 'ttl');
  const ttl = hasTtl && typeof set.ttl === 'number' ? Math.floor(set.ttl) : null;
  await pool.query(
    `UPDATE ${T}
        SET attrs = attrs || $3::jsonb
            ${hasTtl ? ', ttl = $4' : ''}
      WHERE pk = $1 AND sk = $2`,
    hasTtl ? [key.PK, key.SK, patch, ttl] : [key.PK, key.SK, patch],
  );
}

export interface QueryParams {
  pk: string;
  skPrefix?: string;
  limit?: number;
  cursor?: string;
  scanForward?: boolean;
  /** 'GSI1' | 'GSI2'. Omit for the primary key. */
  indexName?: string;
  /** Retained for call-site compatibility; implied by indexName. */
  pkField?: string;
  /** Retained for call-site compatibility; implied by indexName. */
  skField?: string;
}

export interface QueryResult {
  items: Item[];
  cursor?: string;
}

export async function queryItems(params: QueryParams): Promise<QueryResult> {
  const { pk, skPrefix, limit, cursor, scanForward = true, indexName } = params;

  const [pkCol, skCol] =
    indexName === 'GSI2' ? ['gsi2pk', 'gsi2sk'] : indexName ? ['gsi1pk', 'gsi1sk'] : ['pk', 'sk'];
  const indexed = indexName !== undefined;

  const args: unknown[] = [pk];
  const where = [`${pkCol} = $1`, `(ttl IS NULL OR ttl >= extract(epoch from now())::bigint)`];

  if (skPrefix !== undefined) {
    args.push(`${escapeLike(skPrefix)}%`);
    where.push(`${skCol} LIKE $${args.length} ESCAPE '\\'`);
  }

  const dir = scanForward ? 'ASC' : 'DESC';
  const cmp = scanForward ? '>' : '<';
  // Keyset pagination. Indexed queries tie-break on the primary key because
  // GSI sort keys are not unique.
  const sortCols = indexed ? `${skCol}, pk, sk` : 'sk';
  if (cursor) {
    const last = JSON.parse(cursor) as string[];
    const placeholders = last.map((v) => {
      args.push(v);
      return `$${args.length}`;
    });
    where.push(`(${sortCols}) ${cmp} (${placeholders.join(', ')})`);
  }

  const take = limit !== undefined ? limit + 1 : undefined;
  const orderBy = sortCols
    .split(', ')
    .map((c) => `${c} ${dir}`)
    .join(', ');

  const r = await pool.query<{ attrs: Item; pk: string; sk: string; gsisk: string | null }>(
    `SELECT attrs, pk, sk, ${skCol} AS gsisk FROM ${T}
      WHERE ${where.join(' AND ')}
      ORDER BY ${orderBy}
      ${take !== undefined ? `LIMIT ${take}` : ''}`,
    args,
  );

  const rows = limit !== undefined ? r.rows.slice(0, limit) : r.rows;
  const hasMore = limit !== undefined && r.rows.length > limit;
  const lastRow = rows[rows.length - 1];

  return {
    items: rows.map((row) => row.attrs),
    cursor:
      hasMore && lastRow
        ? JSON.stringify(indexed ? [lastRow.gsisk, lastRow.pk, lastRow.sk] : [lastRow.sk])
        : undefined,
  };
}

/**
 * Scan items whose partition key starts with `pkPrefix`, optionally with an
 * exact sort key. Intended for low-frequency ops jobs only.
 */
export async function scanItems(opts: {
  pkPrefix: string;
  sk?: string;
  limit?: number;
}): Promise<Item[]> {
  const args: unknown[] = [`${escapeLike(opts.pkPrefix)}%`];
  const where = [
    `pk LIKE $1 ESCAPE '\\'`,
    `(ttl IS NULL OR ttl >= extract(epoch from now())::bigint)`,
  ];
  if (opts.sk !== undefined) {
    args.push(opts.sk);
    where.push(`sk = $${args.length}`);
  }
  const r = await pool.query<{ attrs: Item }>(
    `SELECT attrs FROM ${T} WHERE ${where.join(' AND ')} ORDER BY pk, sk
     ${opts.limit ? `LIMIT ${Math.floor(opts.limit)}` : ''}`,
    args,
  );
  return r.rows.map((row) => row.attrs);
}

export async function deleteItem(key: { PK: string; SK: string }): Promise<void> {
  await pool.query(`DELETE FROM ${T} WHERE pk = $1 AND sk = $2`, [key.PK, key.SK]);
}

/** Upsert many items in a single transaction. */
export async function batchWriteItems(items: Item[]): Promise<void> {
  if (items.length === 0) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      await client.query(
        `INSERT INTO ${T} (pk, sk, gsi1pk, gsi1sk, gsi2pk, gsi2sk, ttl, attrs)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
         ON CONFLICT (pk, sk) DO UPDATE SET gsi1pk = EXCLUDED.gsi1pk, gsi1sk = EXCLUDED.gsi1sk,
           gsi2pk = EXCLUDED.gsi2pk, gsi2sk = EXCLUDED.gsi2sk, ttl = EXCLUDED.ttl, attrs = EXCLUDED.attrs`,
        [
          item.PK,
          item.SK,
          str(item.GSI1PK),
          str(item.GSI1SK),
          str(item.GSI2PK),
          str(item.GSI2SK),
          typeof item.ttl === 'number' ? Math.floor(item.ttl) : null,
          JSON.stringify(item),
        ],
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
