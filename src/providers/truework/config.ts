/**
 * Shared Truework configuration.
 *
 * TRUEWORK_ENV: "sandbox" | "production"
 */

const TRUEWORK_URLS: Record<string, string> = {
  sandbox: 'https://api.truework-sandbox.com',
  production: 'https://api.truework.com',
};

export function getTrueworkBaseUrl(): string {
  const env = process.env.TRUEWORK_ENV ?? 'sandbox';
  return TRUEWORK_URLS[env] ?? TRUEWORK_URLS.sandbox;
}
