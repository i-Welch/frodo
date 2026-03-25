import crypto from 'node:crypto';
import { createTenant, storeApiKey } from '../src/store/tenant-store.js';
import { generateApiKey, hashApiKey, parseApiKey } from '../src/tenancy/api-key.js';
import { addIdentifier } from '../src/store/identity-lookup-store.js';
import { createLink } from '../src/store/tenant-user-store.js';
import type { Tenant, StoredApiKey } from '../src/tenancy/types.js';
import type { TenantUserLink } from '../src/identity/types.js';

async function main() {
  console.log('Seeding database...');

  // 1. Create a test tenant
  const tenantId = crypto.randomUUID();
  const tenant: Tenant = {
    tenantId,
    name: 'Frodo Dev Tenant',
    permissions: [],
    callbackUrls: [],
    createdAt: new Date().toISOString(),
  };
  await createTenant(tenant);
  console.log(`Created tenant: ${tenant.name} (${tenantId})`);

  // 2. Generate a sandbox API key
  const generated = generateApiKey('sandbox');
  const parsed = parseApiKey(generated.rawKey)!;
  const storedKey: StoredApiKey = {
    keyId: generated.keyId,
    tenantId,
    prefix: parsed.prefix,
    hash: hashApiKey(generated.rawKey),
    environment: 'sandbox',
    active: true,
    createdAt: new Date().toISOString(),
  };
  await storeApiKey(storedKey);
  console.log(`API key (sandbox): ${generated.rawKey}`);

  // 3. Create a test user
  const userId = crypto.randomUUID();
  const email = 'alice@test.com';
  const firstName = 'Alice';
  const lastName = 'Smith';

  await addIdentifier('EMAIL', email, userId);

  // 4. Link the test user to the tenant
  const link: TenantUserLink = {
    tenantId,
    userId,
    providedIdentifiers: { email, firstName, lastName },
    createdAt: new Date().toISOString(),
  };
  await createLink(link);

  // 5. Print the userId
  console.log(`Created user: ${firstName} ${lastName} (${userId})`);
  console.log(`  Email: ${email}`);
  console.log(`  Linked to tenant: ${tenantId}`);

  console.log('\nSeed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
