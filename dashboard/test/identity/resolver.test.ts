import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ensureTables, pool, LOOKUP_TABLE_NAME } from '../../src/server/store/db';
import { addIdentifier, removeIdentifiers } from '../../src/server/store/identity-lookup-store';
import { resolveIdentity } from '../../src/server/identity/resolver';

// ---------------------------------------------------------------------------
// Table setup
// ---------------------------------------------------------------------------

async function ensureLookupTable(): Promise<void> {
  await ensureTables();
}

/**
 * Remove all items from the lookup table (test isolation).
 */
async function cleanLookupTable(): Promise<void> {
  await pool.query(`DELETE FROM "${LOOKUP_TABLE_NAME}"`);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('resolveIdentity', () => {
  beforeAll(async () => {
    await ensureLookupTable();
    await cleanLookupTable();
  });

  afterAll(async () => {
    await cleanLookupTable();
  });

  it('resolves a new user when no matches exist', async () => {
    const result = await resolveIdentity({
      email: 'brand-new@example.com',
      phone: '+15559999999',
    });

    expect(result.type).toBe('new');
    expect(result.userId).toBeDefined();
    expect(result.candidateIds).toBeUndefined();
  });

  it('resolves an existing user when email matches', async () => {
    const existingUserId = 'user-email-match-001';
    await addIdentifier('EMAIL', 'known@example.com', existingUserId);

    const result = await resolveIdentity({ email: 'known@example.com' });

    expect(result.type).toBe('existing');
    expect(result.userId).toBe(existingUserId);
  });

  it('resolves an existing user when phone matches', async () => {
    const existingUserId = 'user-phone-match-001';
    await addIdentifier('PHONE', '+15551112222', existingUserId);

    const result = await resolveIdentity({ phone: '+15551112222' });

    expect(result.type).toBe('existing');
    expect(result.userId).toBe(existingUserId);
  });

  it('resolves existing user when both email and phone match the same user', async () => {
    const existingUserId = 'user-both-match-001';
    await addIdentifier('EMAIL', 'both@example.com', existingUserId);
    await addIdentifier('PHONE', '+15553334444', existingUserId);

    const result = await resolveIdentity({
      email: 'both@example.com',
      phone: '+15553334444',
    });

    expect(result.type).toBe('existing');
    expect(result.userId).toBe(existingUserId);
  });

  it('detects conflict when email and phone match different users', async () => {
    const userA = 'user-conflict-A';
    const userB = 'user-conflict-B';
    await addIdentifier('EMAIL', 'conflict-email@example.com', userA);
    await addIdentifier('PHONE', '+15557778888', userB);

    const result = await resolveIdentity({
      email: 'conflict-email@example.com',
      phone: '+15557778888',
    });

    expect(result.type).toBe('conflict');
    expect(result.candidateIds).toEqual([userA, userB]);
    expect(result.userId).toBeUndefined();
  });

  it('handles email-only input', async () => {
    const result = await resolveIdentity({ email: 'only-email@example.com' });

    expect(result.type).toBe('new');
    expect(result.userId).toBeDefined();
  });

  it('handles phone-only input', async () => {
    const result = await resolveIdentity({ phone: '+15550000001' });

    expect(result.type).toBe('new');
    expect(result.userId).toBeDefined();
  });
});
