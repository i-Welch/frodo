import crypto from 'node:crypto';
import { pool, TABLE_NAME } from '../src/server/store/db';

export interface TestContext {
  /** Random hex prefix for isolating test keys. */
  prefix: string;
  /** Build a PK with the test prefix baked in. */
  pk: (raw: string) => string;
  /** Delete all items whose PK starts with the test prefix. */
  cleanup: () => Promise<void>;
}

/**
 * Creates an isolated test context with a unique key prefix.
 * Use `ctx.pk(raw)` to generate prefixed partition keys, then call
 * `ctx.cleanup()` in afterAll/afterEach to remove test data.
 */
export async function createTestContext(): Promise<TestContext> {
  const prefix = crypto.randomBytes(4).toString('hex');

  function pk(raw: string): string {
    return `TEST#${prefix}#${raw}`;
  }

  async function cleanup(): Promise<void> {
    await pool.query(`DELETE FROM "${TABLE_NAME}" WHERE pk LIKE $1`, [`TEST#${prefix}#%`]);
  }

  return { prefix, pk, cleanup };
}
