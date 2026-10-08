import { pool, LOOKUP_TABLE_NAME } from './db.js';

const L = `"${LOOKUP_TABLE_NAME}"`;

// ---------------------------------------------------------------------------
// Identity lookup operations (LOOKUP_TABLE_NAME)
// ---------------------------------------------------------------------------

/**
 * Add an identifier -> userId mapping to the lookup table.
 *
 * pk = `EMAIL#alice@example.com` or `PHONE#+15551234567`
 * sk = `USER#<userId>`
 */
export async function addIdentifier(
  type: 'EMAIL' | 'PHONE',
  value: string,
  userId: string,
): Promise<void> {
  const pk = `${type}#${value}`;
  const sk = `USER#${userId}`;
  await pool.query(
    `INSERT INTO ${L} (pk, sk, attrs) VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (pk, sk) DO UPDATE SET attrs = EXCLUDED.attrs`,
    [
      pk,
      sk,
      JSON.stringify({
        PK: pk,
        SK: sk,
        userId,
        identifierType: type,
        identifierValue: value,
      }),
    ],
  );
}

/**
 * Look up a userId by identifier (email or phone).
 * Returns the first matching userId or null.
 */
export async function lookupByIdentifier(
  type: 'EMAIL' | 'PHONE',
  value: string,
): Promise<string | null> {
  const r = await pool.query<{ attrs: { userId: string } }>(
    `SELECT attrs FROM ${L} WHERE pk = $1 ORDER BY sk LIMIT 1`,
    [`${type}#${value}`],
  );
  return r.rows[0]?.attrs.userId ?? null;
}

/**
 * Remove all lookup entries for a given userId.
 */
export async function removeIdentifiers(userId: string): Promise<void> {
  await pool.query(`DELETE FROM ${L} WHERE sk = $1`, [`USER#${userId}`]);
}
