import { describe, it, expect, beforeAll } from 'vitest';
import { ensureTables, TABLE_NAME } from '../../src/store/db.js';
import { putModule } from '../../src/store/user-store.js';
import { verifyIdentity } from '../../src/forms/verification.js';

// ---------------------------------------------------------------------------
// Table setup
// ---------------------------------------------------------------------------

async function ensureTable(): Promise<void> {
  await ensureTables();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('identity verification', () => {
  const userId = `user-verify-${Date.now()}`;

  beforeAll(async () => {
    await ensureTable();

    // Store identity data for the test user
    await putModule(userId, 'identity', {
      firstName: 'Bilbo',
      lastName: 'Baggins',
      ssn: '123456789',
      dateOfBirth: '2890-09-22',
    });
  });

  it('returns true when all PII matches', async () => {
    const result = await verifyIdentity(userId, {
      firstName: 'Bilbo',
      lastName: 'Baggins',
      ssn: '123456789',
    });
    expect(result).toBe(true);
  });

  it('returns true with case-insensitive name matching', async () => {
    const result = await verifyIdentity(userId, {
      firstName: 'bilbo',
      lastName: 'BAGGINS',
      ssn: '123456789',
    });
    expect(result).toBe(true);
  });

  it('returns true with leading/trailing whitespace in names', async () => {
    const result = await verifyIdentity(userId, {
      firstName: '  Bilbo  ',
      lastName: '  Baggins  ',
      ssn: '123456789',
    });
    expect(result).toBe(true);
  });

  it('returns false when firstName does not match', async () => {
    const result = await verifyIdentity(userId, {
      firstName: 'Frodo',
      lastName: 'Baggins',
      ssn: '123456789',
    });
    expect(result).toBe(false);
  });

  it('returns false when lastName does not match', async () => {
    const result = await verifyIdentity(userId, {
      firstName: 'Bilbo',
      lastName: 'Gamgee',
      ssn: '123456789',
    });
    expect(result).toBe(false);
  });

  it('returns false when SSN does not match', async () => {
    const result = await verifyIdentity(userId, {
      firstName: 'Bilbo',
      lastName: 'Baggins',
      ssn: '999999999',
    });
    expect(result).toBe(false);
  });

  it('returns false for a non-existent user', async () => {
    const result = await verifyIdentity('nonexistent-user', {
      firstName: 'Bilbo',
      lastName: 'Baggins',
      ssn: '123456789',
    });
    expect(result).toBe(false);
  });
});
