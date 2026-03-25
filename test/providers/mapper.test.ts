import { describe, it, expect } from 'vitest';
import {
  extractPath,
  applyMappings,
  createMapper,
} from '../../src/providers/mapper.js';

describe('extractPath', () => {
  const data = {
    name: 'Frodo',
    address: {
      city: 'Hobbiton',
      zip: '12345',
    },
    accounts: [
      { id: 'a1', balances: { current: 1000, available: 900 } },
      { id: 'a2', balances: { current: 2000, available: 1800 } },
    ],
    tags: ['vip', 'verified'],
  };

  it('extracts top-level field', () => {
    expect(extractPath(data, 'name')).toBe('Frodo');
  });

  it('extracts nested field', () => {
    expect(extractPath(data, 'address.city')).toBe('Hobbiton');
  });

  it('extracts deeply nested field', () => {
    expect(extractPath(data, 'accounts[0].balances.current')).toBe(1000);
  });

  it('extracts with array index', () => {
    expect(extractPath(data, 'accounts[1].id')).toBe('a2');
  });

  it('extracts with array wildcard', () => {
    const result = extractPath(data, 'accounts[].id');
    expect(result).toEqual(['a1', 'a2']);
  });

  it('extracts nested field from array wildcard', () => {
    const result = extractPath(data, 'accounts[].balances.current');
    expect(result).toEqual([1000, 2000]);
  });

  it('returns undefined for non-existent path', () => {
    expect(extractPath(data, 'nonexistent')).toBeUndefined();
    expect(extractPath(data, 'address.nonexistent')).toBeUndefined();
  });

  it('returns undefined for null/undefined input', () => {
    expect(extractPath(null, 'foo')).toBeUndefined();
    expect(extractPath(undefined, 'foo')).toBeUndefined();
  });

  it('returns entire array with simple index', () => {
    expect(extractPath(data, 'tags[0]')).toBe('vip');
    expect(extractPath(data, 'tags[1]')).toBe('verified');
  });

  it('handles array at root of path', () => {
    const arr = [{ x: 1 }, { x: 2 }];
    expect(extractPath(arr, '[].x')).toEqual([1, 2]);
  });
});

describe('applyMappings', () => {
  it('maps fields from provider response to module shape', () => {
    const response = {
      accounts: [
        { balances: { current: 5000 } },
        { balances: { current: 3000 } },
      ],
      income: { streams: [{ amount: 4000 }] },
    };

    const result = applyMappings(response, [
      { from: 'accounts', to: 'bankAccounts' },
      { from: 'income.streams', to: 'incomeStreams' },
    ]);

    expect(result.bankAccounts).toEqual(response.accounts);
    expect(result.incomeStreams).toEqual(response.income.streams);
  });

  it('applies transform function', () => {
    const response = {
      accounts: [
        { balances: { current: 5000 } },
        { balances: { current: 3000 } },
      ],
    };

    const result = applyMappings(response, [
      {
        from: 'accounts[].balances.current',
        to: 'totalBalance',
        transform: (vals) => (vals as number[]).reduce((a, b) => a + b, 0),
      },
    ]);

    expect(result.totalBalance).toBe(8000);
  });

  it('skips undefined values', () => {
    const response = { name: 'Frodo' };
    const result = applyMappings(response, [
      { from: 'name', to: 'fullName' },
      { from: 'nonexistent', to: 'missing' },
    ]);

    expect(result.fullName).toBe('Frodo');
    expect(result).not.toHaveProperty('missing');
  });
});

describe('createMapper', () => {
  it('creates a reusable mapper function', () => {
    const plaidMapper = createMapper({
      provider: 'plaid',
      module: 'financial',
      mappings: [
        { from: 'accounts', to: 'bankAccounts' },
        {
          from: 'accounts[].balances.current',
          to: 'balances',
          transform: (vals) => {
            const amounts = vals as number[];
            return { total: amounts.reduce((a, b) => a + b, 0), accounts: amounts };
          },
        },
        { from: 'income.streams', to: 'incomeStreams' },
      ],
    });

    const plaidResponse = {
      accounts: [
        { id: 'a1', balances: { current: 5000, available: 4500 } },
        { id: 'a2', balances: { current: 3000, available: 2800 } },
      ],
      income: {
        streams: [{ description: 'Salary', amount: 4000 }],
      },
    };

    const result = plaidMapper(plaidResponse);

    expect(result.bankAccounts).toEqual(plaidResponse.accounts);
    expect(result.balances).toEqual({ total: 8000, accounts: [5000, 3000] });
    expect(result.incomeStreams).toEqual(plaidResponse.income.streams);
  });
});
