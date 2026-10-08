import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ensureTables } from '../../src/store/db.js';
import {
  putItem,
  getItem,
  updateItem,
  queryItems,
  scanItems,
  ConditionalCheckFailedError,
} from '../../src/store/base-store.js';
import {
  addTenantMember,
  listMembershipsForUser,
  listTenantMembers,
  removeTenantMember,
} from '../../src/store/tenant-member-store.js';
import { kmsService } from '../../src/crypto/kms.js';
import { createTestContext, type TestContext } from '../setup.js';

describe('postgres store', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    await ensureTables();
    ctx = await createTestContext();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  it('updateItem merges attributes and mirrors ttl', async () => {
    const key = { PK: ctx.pk('upd'), SK: 'METADATA' };
    await putItem({ ...key, a: 1, b: 2 });
    await updateItem(key, { b: 3, c: 4 });
    expect(await getItem(key)).toMatchObject({ a: 1, b: 3, c: 4 });

    await updateItem(key, { ttl: Math.floor(Date.now() / 1000) - 10 });
    // Expired rows are invisible to queries
    const res = await queryItems({ pk: key.PK });
    expect(res.items).toHaveLength(0);
  });

  it('paginates with a cursor in both directions', async () => {
    const pk = ctx.pk('page');
    for (const n of ['1', '2', '3', '4', '5']) {
      await putItem({ PK: pk, SK: `E#${n}` });
    }
    const first = await queryItems({ pk, skPrefix: 'E#', limit: 2 });
    expect(first.items.map((i) => i.SK)).toEqual(['E#1', 'E#2']);
    const second = await queryItems({ pk, skPrefix: 'E#', limit: 2, cursor: first.cursor });
    expect(second.items.map((i) => i.SK)).toEqual(['E#3', 'E#4']);
    const last = await queryItems({ pk, skPrefix: 'E#', limit: 2, cursor: second.cursor });
    expect(last.items.map((i) => i.SK)).toEqual(['E#5']);
    expect(last.cursor).toBeUndefined();

    const desc = await queryItems({ pk, limit: 2, scanForward: false });
    expect(desc.items.map((i) => i.SK)).toEqual(['E#5', 'E#4']);
  });

  it('paginates a GSI whose sort keys collide', async () => {
    const g = ctx.pk('gsi');
    for (const n of ['a', 'b', 'c']) {
      await putItem({ PK: ctx.pk(`g-${n}`), SK: 'X', GSI1PK: g, GSI1SK: 'same' });
    }
    const p1 = await queryItems({ pk: g, indexName: 'GSI1', limit: 2 });
    const p2 = await queryItems({ pk: g, indexName: 'GSI1', limit: 2, cursor: p1.cursor });
    expect([...p1.items, ...p2.items]).toHaveLength(3);
    expect(new Set([...p1.items, ...p2.items].map((i) => i.PK)).size).toBe(3);
  });

  it('enforces conditional writes', async () => {
    const key = { PK: ctx.pk('cond'), SK: 'METADATA' };
    await putItem({ ...key, status: 'open' }, { ifAttrNotIn: { attr: 'status', values: ['done'] } });
    await putItem({ ...key, status: 'done' });
    await expect(
      putItem({ ...key, status: 'open' }, { ifAttrNotIn: { attr: 'status', values: ['done'] } }),
    ).rejects.toBeInstanceOf(ConditionalCheckFailedError);

    await putItem({ ...key, status: 'done', bound: 'd1' });
    await expect(
      putItem({ ...key, bound: 'd2' }, { ifAttrNotSet: 'bound' }),
    ).rejects.toMatchObject({ name: 'ConditionalCheckFailedException' });
    await expect(putItem({ ...key }, { ifNotExists: true })).rejects.toBeInstanceOf(
      ConditionalCheckFailedError,
    );
  });

  it('scans by pk prefix and exact sk', async () => {
    await putItem({ PK: `TEST#${ctx.prefix}#scan1`, SK: 'METADATA' });
    await putItem({ PK: `TEST#${ctx.prefix}#scan2`, SK: 'OTHER' });
    const items = await scanItems({ pkPrefix: `TEST#${ctx.prefix}#scan`, sk: 'METADATA' });
    expect(items).toHaveLength(1);
  });

  it('manages tenant members', async () => {
    const tenantId = ctx.pk('tenant');
    const userId = ctx.pk('user');
    await addTenantMember(tenantId, userId, 'admin');
    expect(await listTenantMembers(tenantId)).toMatchObject([{ userId, role: 'admin' }]);
    expect(await listMembershipsForUser(userId)).toMatchObject([{ tenantId, role: 'admin' }]);
    await removeTenantMember(tenantId, userId);
    expect(await listMembershipsForUser(userId)).toHaveLength(0);
  });

  it('wraps data keys with the user context bound as AAD', async () => {
    const { plaintextDek, encryptedDek } = await kmsService.generateDataKey('u1');
    expect((await kmsService.decryptDataKey(encryptedDek, 'u1')).equals(plaintextDek)).toBe(true);
    await expect(kmsService.decryptDataKey(encryptedDek, 'u2')).rejects.toThrow();
  });
});
