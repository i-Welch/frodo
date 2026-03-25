/**
 * Provider credential lookup via environment variables.
 * Convention: PROVIDER_<PROVIDER>_<KEY> (e.g., PROVIDER_PLAID_CLIENT_ID)
 */

export interface ProviderCredentials {
  /** Get a required credential. Throws if missing. */
  get(key: string): string;
  /** Get an optional credential. Returns undefined if missing. */
  getOptional(key: string): string | undefined;
}

export function getProviderCredentials(provider: string): ProviderCredentials {
  const prefix = `PROVIDER_${provider.toUpperCase()}_`;

  return {
    get(key: string): string {
      const envKey = `${prefix}${key.toUpperCase()}`;
      const value = process.env[envKey];
      if (value === undefined || value === '') {
        throw new Error(
          `Missing required credential: ${envKey} for provider '${provider}'`,
        );
      }
      return value;
    },

    getOptional(key: string): string | undefined {
      const envKey = `${prefix}${key.toUpperCase()}`;
      const value = process.env[envKey];
      return value === '' ? undefined : value;
    },
  };
}
