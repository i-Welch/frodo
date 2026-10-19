import { describe, it, expect } from 'vitest';
import { warmAccounts } from '../../../automation/warm-accounts';

describe('warmAccounts', () => {
  it('sums audit and demo visits per bank, most interested first', () => {
    const lines = warmAccounts(
      [
        { requestPath: '/wl/bank-a', visitors: 2 },
        { requestPath: '/wl/bank-a/apply', visitors: 1 },
        { requestPath: '/audit/bank-a', visitors: 1 },
        { requestPath: '/audit/bank-b', visitors: 5 },
        { requestPath: '/blog/bank-a', visitors: 9 },
      ],
      (slug) => slug.toUpperCase(),
    );
    expect(lines[1]).toBe('  - BANK-B: 5 visitors (audit 5, demo 0) https://reportraven.tech/audit/bank-b');
    expect(lines[2]).toBe('  - BANK-A: 4 visitors (audit 1, demo 3) https://reportraven.tech/audit/bank-a');
    expect(lines).toHaveLength(3);
  });

  it('says nothing in a quiet week', () => {
    expect(warmAccounts([{ requestPath: '/', visitors: 3 }], (s) => s)).toEqual([]);
  });
});
