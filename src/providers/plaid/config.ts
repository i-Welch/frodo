/**
 * Shared Plaid configuration.
 *
 * Reads PLAID_ENV to determine the base URL:
 *   - "sandbox"     → https://sandbox.plaid.com (default)
 *   - "development"  → https://development.plaid.com
 *   - "production"   → https://production.plaid.com
 */

const PLAID_URLS: Record<string, string> = {
  sandbox: 'https://sandbox.plaid.com',
  development: 'https://development.plaid.com',
  production: 'https://production.plaid.com',
};

export function getPlaidBaseUrl(): string {
  const env = process.env.PLAID_ENV ?? 'sandbox';
  return PLAID_URLS[env] ?? PLAID_URLS.sandbox;
}
