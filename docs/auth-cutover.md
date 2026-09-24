# Dashboard authentication cutover

The RAVEN dashboard uses Neon Auth organizations. The API keeps its DynamoDB tenant records and API keys. Dashboard requests pass through Next.js, which checks the active Neon organization and signs a 60-second assertion for the API. The API resolves the organization ID to one linked tenant.

## Provision and configure

1. Enable Managed Better Auth and the Organizations plugin on a Neon branch. Enable email verification and invitation emails. Add the dashboard production, preview, and local domains to the Auth trusted-domain list.
2. Configure the dashboard with `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` (at least 32 random characters), `RAVEN_DASHBOARD_TOKEN_SECRET` (at least 32 random characters), and `API_URL` (the Elysia API origin).
3. Configure the API with the **same** `RAVEN_DASHBOARD_TOKEN_SECRET`. Use a different secret in each environment. Keep `RAVEN_ADMIN_SECRET` for tenant management.
4. Sign in to the dashboard, create one organization per bank in Settings, and invite its verified staff members. The creator becomes organization owner.
5. Link each existing DynamoDB tenant to its new organization with `PATCH /api/v1/tenants/:id/auth-organization` and `{"neonOrgId":"<organization ID>"}` using `RAVEN_ADMIN_SECRET`. No tenant or borrower IDs are changed.
6. Confirm a member can access only that bank's verifications and applications; confirm a removed member loses access. Check one production API key still works independently.

Do not merge or deploy this cutover until all active banking organizations and members are ready. The dashboard has no fallback identity provider. Update the published subprocessor notice when the actual production switch occurs, then remove obsolete environment variables and retire the old subscription after verifying production sign-in and access.

The Auth service is branch scoped. A Vercel preview must point to a corresponding Neon branch and trust its preview domain.
