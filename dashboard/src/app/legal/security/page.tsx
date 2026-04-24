import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Practices — RAVEN',
  description: 'How RAVEN secures consumer data with encryption, access controls, and audit logging.',
};

export default function SecurityPage() {
  return (
    <div className="legal" dangerouslySetInnerHTML={{ __html: content }} />
  );
}

const content = `
<h1>Security Practices</h1>
<p class="last-updated">Last updated: March 24, 2026</p>

<h2>1. Overview</h2>
<p>RAVEN is designed to handle sensitive consumer financial data for regulated institutions. Security is built into every layer of the platform, not added as an afterthought.</p>

<h2>2. Encryption</h2>

<h3>2.1 Encryption at Rest</h3>
<ul>
  <li><strong>Algorithm:</strong> AES-256-GCM</li>
  <li><strong>Key management:</strong> AWS KMS with envelope encryption</li>
  <li><strong>Per-user keys:</strong> Each user's data is encrypted with a unique Data Encryption Key (DEK). The DEK is itself encrypted by a KMS-managed master key.</li>
  <li><strong>Field-level encryption:</strong> Every individual field in every module is encrypted independently. Compromising one field does not expose others.</li>
  <li><strong>Crypto-shredding:</strong> Deleting a user's DEK renders all their data permanently unrecoverable, even from database backups.</li>
</ul>

<h3>2.2 Encryption in Transit</h3>
<ul>
  <li>All API endpoints served over TLS 1.2+</li>
  <li>All outbound connections to third-party providers use TLS</li>
  <li>Provider credentials are stored as encrypted environment variables, never in code</li>
</ul>

<h2>3. Authentication and Access Control</h2>

<h3>3.1 API Authentication</h3>
<ul>
  <li>API keys use the format <code>frodo_live_&lt;32 hex&gt;</code> (production) or <code>frodo_test_&lt;32 hex&gt;</code> (sandbox)</li>
  <li>Keys are stored as SHA-256 hashes — the raw key is shown once at creation and never stored</li>
  <li>Key lookup uses an 8-character prefix via a DynamoDB GSI for efficient matching without exposing the full hash</li>
</ul>

<h3>3.2 Multi-Tenant Isolation</h3>
<ul>
  <li>Each tenant (customer) is isolated by tenant ID at the data layer</li>
  <li>Tenant-user links ensure a tenant can only access users they have created or been linked to</li>
  <li>Permission controls restrict which modules each tenant can access</li>
  <li>Sandbox and production environments are separated at the API key level</li>
</ul>

<h3>3.3 Consumer Verification</h3>
<ul>
  <li>Three verification tiers: OTP (email/phone), Enhanced OTP (both channels), and Identity (PII match)</li>
  <li>OTP codes are 6-digit cryptographically random, stored as SHA-256 hashes, expire in 10 minutes, and lock out after 3 failed attempts</li>
  <li>Sessions use sliding 15-minute windows with a 1-hour absolute maximum lifetime</li>
</ul>

<h2>4. Audit Trail</h2>
<ul>
  <li>Every data change is recorded as an immutable event with: who (source/actor), what (field changes with before/after values), when (timestamp), and confidence score</li>
  <li>Events are append-only — they cannot be modified or deleted except through user deletion</li>
  <li>API access logs record every tenant request with request ID, tenant ID, and timestamp</li>
  <li>Consent records store SHA-256 hashes of the exact consent text shown to the user</li>
</ul>

<h2>5. Third-Party Provider Security</h2>
<ul>
  <li>Provider credentials are read from environment variables at runtime, never hardcoded</li>
  <li>Per-user OAuth tokens (e.g., Plaid access tokens) are encrypted with the user's DEK in the same envelope encryption scheme as module data</li>
  <li>The HTTP client automatically classifies and handles provider errors (auth failures, rate limits, timeouts) without leaking credentials in logs</li>
  <li>Provider health is tracked in-memory with a 5-minute sliding window; degraded providers do not block other enrichment sources</li>
</ul>

<h2>6. Infrastructure</h2>
<ul>
  <li><strong>Database:</strong> Amazon DynamoDB with encryption at rest enabled</li>
  <li><strong>Key management:</strong> AWS KMS with automatic key rotation</li>
  <li><strong>Runtime:</strong> Bun on AWS (containerized)</li>
  <li><strong>Logging:</strong> Structured JSON logs via Pino (no PII in logs)</li>
</ul>

<h2>7. Vulnerability Reporting</h2>
<p>If you discover a security vulnerability, please report it to security@reportraven.tech. We will acknowledge receipt within 24 hours and provide a timeline for resolution.</p>
`;
