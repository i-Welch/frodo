export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  // Neon Postgres
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/frodo',
  itemsTable: process.env.ITEMS_TABLE ?? 'frodo_items',
  lookupTable: process.env.LOOKUP_TABLE ?? 'frodo_identity_lookup',
  // Base64-encoded 32-byte master key used to wrap per-record data keys
  masterEncryptionKey: process.env.MASTER_ENCRYPTION_KEY ?? '',
  cookieSecret: process.env.COOKIE_SECRET ?? 'local-dev-secret',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  // Neon Auth (Better Auth) — base URL of the project's auth endpoint
  neonAuthBaseUrl: process.env.NEON_AUTH_BASE_URL ?? '',
  // Dashboard CORS
  dashboardUrl: process.env.DASHBOARD_URL ?? 'http://localhost:3001',
  // Public API base URL (used for form links, webhooks)
  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
};
