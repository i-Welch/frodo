/**
 * Create a tenant (with a sandbox API key) and optionally make a Neon Auth
 * user an admin member of it.
 *
 *   bun scripts/bootstrap-tenant.ts "RAVEN" [--admin-email you@example.com]
 *
 * Idempotent per tenant name: reuses an existing tenant with the same name.
 * Members are looked up by email in the neon_auth schema, so the user must
 * have signed up first. Requires DATABASE_URL.
 */
import crypto from 'node:crypto';
import { createTenant, listTenants, storeApiKey } from '../src/server/store/tenant-store';
import { addTenantMember } from '../src/server/store/tenant-member-store';
import { generateApiKey, hashApiKey, parseApiKey } from '../src/server/tenancy/api-key';
import { pool } from '../src/server/store/db';
import type { Tenant, StoredApiKey } from '../src/server/tenancy/types';

const name = process.argv[2];
const emailIdx = process.argv.indexOf('--admin-email');
const adminEmail = emailIdx > -1 ? process.argv[emailIdx + 1] : undefined;
if (!name || name.startsWith('--')) {
  console.error('Usage: bun scripts/bootstrap-tenant.ts <tenant name> [--admin-email <email>]');
  process.exit(1);
}

const MODULES = [
  'identity',
  'contact',
  'financial',
  'credit',
  'employment',
  'residence',
  'buying-patterns',
  'education',
];

async function main() {
  let tenant = (await listTenants()).find((t) => t.name === name);
  if (tenant) {
    console.log(`Tenant "${name}" already exists: ${tenant.tenantId}`);
  } else {
    const tenantId = crypto.randomUUID();
    const created: Tenant = {
      tenantId,
      name,
      permissions: MODULES.map((module) => ({ module, requiredTier: 0 })),
      callbackUrls: [],
      createdAt: new Date().toISOString(),
    };
    await createTenant(created);
    const generated = generateApiKey('sandbox');
    const parsed = parseApiKey(generated.rawKey)!;
    const key: StoredApiKey = {
      keyId: generated.keyId,
      tenantId,
      prefix: parsed.prefix,
      hash: hashApiKey(generated.rawKey),
      environment: 'sandbox',
      active: true,
      createdAt: new Date().toISOString(),
    };
    await storeApiKey(key);
    tenant = created;
    console.log(`Created tenant "${name}": ${tenantId}`);
    console.log(`Sandbox API key (shown once): ${generated.rawKey}`);
  }

  if (adminEmail) {
    const res = await pool.query<{ id: string }>(
      'SELECT id FROM neon_auth."user" WHERE lower(email) = lower($1) LIMIT 1',
      [adminEmail],
    );
    const userId = res.rows[0]?.id;
    if (!userId) {
      console.error(`No Neon Auth user with email ${adminEmail} yet. Sign up first, then re-run.`);
      process.exit(2);
    }
    await addTenantMember(tenant.tenantId, userId, 'admin');
    console.log(`Added ${adminEmail} (${userId}) as admin of ${tenant.tenantId}`);
  }
  await pool.end();
}

main().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
