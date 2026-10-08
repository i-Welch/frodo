/**
 * Shared Socure configuration.
 *
 * SOCURE_ENV: "sandbox" | "production"
 */

const SOCURE_URLS: Record<string, string> = {
  sandbox: 'https://riskos.sandbox.socure.com',
  production: 'https://riskos.socure.com',
};

export function getSocureBaseUrl(): string {
  const env = process.env.SOCURE_ENV ?? 'sandbox';
  return SOCURE_URLS[env] ?? SOCURE_URLS.sandbox;
}

export function getSocureWorkflowName(): string {
  return process.env.PROVIDER_SOCURE_WORKFLOW_NAME ?? 'non_hosted_advanced_pre_fill';
}
