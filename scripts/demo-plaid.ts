/**
 * Demo: Plaid Sandbox Flow
 *
 * Creates a user, runs them through the Plaid sandbox bank connection,
 * stores the access token, and enriches their financial data.
 *
 * Prerequisites:
 *   - Server running: DYNAMODB_ENDPOINT=http://localhost:8000 KMS_ENDPOINT=local bun run dev
 *   - .env has PROVIDER_PLAID_CLIENT_ID and PROVIDER_PLAID_SECRET
 *
 * Usage:
 *   bun scripts/demo-plaid.ts
 */

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const PLAID_BASE = 'https://sandbox.plaid.com';
const CLIENT_ID = process.env.PROVIDER_PLAID_CLIENT_ID!;
const SECRET = process.env.PROVIDER_PLAID_SECRET!;

if (!CLIENT_ID || !SECRET) {
  console.error('Missing PROVIDER_PLAID_CLIENT_ID or PROVIDER_PLAID_SECRET in .env');
  process.exit(1);
}

async function plaid(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${PLAID_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, secret: SECRET, ...body }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Plaid ${path} failed (${res.status}): ${err}`);
  }
  return res.json();
}

async function api(path: string, method: string, apiKey: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${method} ${path} failed (${res.status}): ${err}`);
  }
  return res.json();
}

async function main() {
  console.log('=== RAVEN Plaid Sandbox Demo ===\n');

  // Step 1: Create tenant + API key
  console.log('1. Setting up tenant...');
  const tenantRes = await fetch(`${BASE}/api/v1/tenants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Plaid Demo Bank',
      permissions: [
        { module: 'financial', requiredTier: 0 },
        { module: 'buying-patterns', requiredTier: 0 },
        { module: 'identity', requiredTier: 0 },
        { module: 'contact', requiredTier: 0 },
      ],
      callbackUrls: [],
    }),
  });
  const tenant = (await tenantRes.json()) as { tenantId: string };

  const keyRes = await fetch(`${BASE}/api/v1/tenants/${tenant.tenantId}/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ environment: 'sandbox' }),
  });
  const { rawKey } = (await keyRes.json()) as { rawKey: string };
  console.log(`   Tenant: ${tenant.tenantId}`);
  console.log(`   API Key: ${rawKey.slice(0, 20)}...`);

  // Step 2: Create user
  console.log('\n2. Creating user...');
  const user = (await api('/api/v1/users', 'POST', rawKey, {
    email: 'plaid-demo@reportraven.tech',
    firstName: 'Demo',
    lastName: 'User',
  })) as { userId: string };
  console.log(`   User: ${user.userId}`);

  // Step 3: Create Plaid sandbox public token (simulates Plaid Link)
  console.log('\n3. Creating Plaid sandbox bank connection...');

  // In sandbox, we can create a public token directly (no Link UI needed)
  const sandboxToken = (await plaid('/sandbox/public_token/create', {
    institution_id: 'ins_109508', // First Platypus Bank (Plaid sandbox institution)
    initial_products: ['transactions'],
    options: {
      webhook: 'https://reportraven.tech/webhooks/plaid',
    },
  })) as { public_token: string };
  console.log(`   Public token: ${sandboxToken.public_token.slice(0, 30)}...`);

  // Step 4: Exchange public token for access token
  console.log('\n4. Exchanging for access token...');
  const exchange = (await plaid('/item/public_token/exchange', {
    public_token: sandboxToken.public_token,
  })) as { access_token: string; item_id: string };
  console.log(`   Access token: ${exchange.access_token.slice(0, 30)}...`);
  console.log(`   Item ID: ${exchange.item_id}`);

  // Step 5: Store the access token in RAVEN's token store
  console.log('\n5. Storing access token in RAVEN...');
  // We need to call the token store directly since there's no API route for it yet.
  // In production, this would happen in a callback handler after Plaid Link completes.
  const { storeProviderToken } = await import('../src/providers/token-store.js');
  await storeProviderToken({
    userId: user.userId,
    provider: 'plaid',
    tokenType: 'access_token',
    value: exchange.access_token,
    metadata: {
      itemId: exchange.item_id,
      institutionId: 'ins_109508',
      institutionName: 'First Platypus Bank',
    },
  });
  console.log('   Access token stored (encrypted).');

  // Step 6: Register the real Plaid enricher and enrich
  console.log('\n6. Enriching financial data via Plaid API...');
  const { registerPlaidProvider } = await import('../src/providers/plaid/index.js');
  const { clearEnrichers } = await import('../src/enrichment/registry.js');

  // Clear mock enrichers and register real Plaid
  clearEnrichers();
  registerPlaidProvider();

  // Import and call enrichModule directly since we swapped enrichers
  const { enrichModule } = await import('../src/enrichment/engine.js');

  const financialReport = await enrichModule(
    user.userId,
    'financial',
    rawKey,
    tenant.tenantId,
    true, // sandbox
  );
  console.log('\n   Financial enrichment report:');
  console.log(`   Successes: ${financialReport.successes.length}`);
  for (const s of financialReport.successes) {
    console.log(`     - ${s.source}: ${s.fields.join(', ')}`);
  }
  console.log(`   Failures: ${financialReport.failures.length}`);
  for (const f of financialReport.failures) {
    console.log(`     - ${f.source}: ${f.error}`);
  }

  // Step 7: Fetch the enriched data
  console.log('\n7. Fetching enriched financial data...');
  const { getModule } = await import('../src/store/user-store.js');
  const financialData = await getModule(user.userId, 'financial');

  if (financialData) {
    console.log('\n   Bank Accounts:');
    const accounts = financialData.bankAccounts as { institution: string; accountType: string; last4?: string }[];
    if (accounts) {
      for (const a of accounts) {
        console.log(`     - ${a.institution} (${a.accountType}) ****${a.last4 ?? '????'}`);
      }
    }

    console.log('\n   Balances:');
    const balances = financialData.balances as Record<string, number>;
    if (balances) {
      for (const [key, val] of Object.entries(balances)) {
        console.log(`     - ${key}: $${val.toLocaleString()}`);
      }
    }
  }

  // Step 8: Also try buying patterns
  console.log('\n8. Enriching buying patterns via Plaid transactions...');
  const bpReport = await enrichModule(
    user.userId,
    'buying-patterns',
    rawKey,
    tenant.tenantId,
    true,
  );
  console.log(`   Successes: ${bpReport.successes.length}`);
  for (const s of bpReport.successes) {
    console.log(`     - ${s.source}: ${s.fields.join(', ')}`);
  }
  console.log(`   Failures: ${bpReport.failures.length}`);
  for (const f of bpReport.failures) {
    console.log(`     - ${f.source}: ${f.error}`);
  }

  const bpData = await getModule(user.userId, 'buying-patterns');
  if (bpData) {
    console.log('\n   Spending Categories:');
    const categories = bpData.spendingCategories as { category: string; amount: number; percentage: number }[];
    if (categories) {
      for (const c of categories.slice(0, 5)) {
        console.log(`     - ${c.category}: $${c.amount} (${c.percentage}%)`);
      }
    }

    if (bpData.averageTransactionSize) {
      console.log(`\n   Average Transaction: $${bpData.averageTransactionSize}`);
    }
  }

  console.log('\n=== Demo Complete ===');
  console.log(`\nView all data via API:`);
  console.log(`  curl -H "Authorization: Bearer ${rawKey}" ${BASE}/api/v1/users/${user.userId}/modules | jq`);
  console.log(`  curl -H "Authorization: Bearer ${rawKey}" ${BASE}/api/v1/users/${user.userId}/modules/financial | jq`);
  console.log(`  curl -H "Authorization: Bearer ${rawKey}" ${BASE}/api/v1/users/${user.userId}/modules/buying-patterns | jq`);
  console.log(`  curl -H "Authorization: Bearer ${rawKey}" ${BASE}/api/v1/users/${user.userId}/events | jq`);
}

main().catch((err) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
