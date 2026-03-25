import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getProviderCredentials } from '../../src/providers/credentials.js';

describe('ProviderCredentials', () => {
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    savedEnv['PROVIDER_PLAID_CLIENT_ID'] = process.env.PROVIDER_PLAID_CLIENT_ID;
    savedEnv['PROVIDER_PLAID_SECRET'] = process.env.PROVIDER_PLAID_SECRET;
    savedEnv['PROVIDER_PLAID_OPTIONAL'] = process.env.PROVIDER_PLAID_OPTIONAL;

    process.env.PROVIDER_PLAID_CLIENT_ID = 'test-client-id';
    process.env.PROVIDER_PLAID_SECRET = 'test-secret';
    delete process.env.PROVIDER_PLAID_OPTIONAL;
  });

  afterEach(() => {
    for (const [key, val] of Object.entries(savedEnv)) {
      if (val === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = val;
      }
    }
  });

  it('get() returns existing credential', () => {
    const creds = getProviderCredentials('plaid');
    expect(creds.get('CLIENT_ID')).toBe('test-client-id');
    expect(creds.get('SECRET')).toBe('test-secret');
  });

  it('get() throws for missing credential', () => {
    const creds = getProviderCredentials('plaid');
    expect(() => creds.get('NONEXISTENT')).toThrow(
      "Missing required credential: PROVIDER_PLAID_NONEXISTENT for provider 'plaid'",
    );
  });

  it('get() throws for empty string credential', () => {
    process.env.PROVIDER_PLAID_EMPTY = '';
    const creds = getProviderCredentials('plaid');
    expect(() => creds.get('EMPTY')).toThrow('Missing required credential');
    delete process.env.PROVIDER_PLAID_EMPTY;
  });

  it('getOptional() returns existing credential', () => {
    const creds = getProviderCredentials('plaid');
    expect(creds.getOptional('CLIENT_ID')).toBe('test-client-id');
  });

  it('getOptional() returns undefined for missing credential', () => {
    const creds = getProviderCredentials('plaid');
    expect(creds.getOptional('OPTIONAL')).toBeUndefined();
  });

  it('getOptional() returns undefined for empty string credential', () => {
    process.env.PROVIDER_PLAID_EMPTY = '';
    const creds = getProviderCredentials('plaid');
    expect(creds.getOptional('EMPTY')).toBeUndefined();
    delete process.env.PROVIDER_PLAID_EMPTY;
  });

  it('uppercases provider name in env var lookup', () => {
    process.env.PROVIDER_EXPERIAN_API_KEY = 'exp-key';
    const creds = getProviderCredentials('experian');
    expect(creds.get('API_KEY')).toBe('exp-key');
    delete process.env.PROVIDER_EXPERIAN_API_KEY;
  });
});
