/**
 * Demo: Identity Verification Flow
 *
 * This script sets up a user with known identity data, then creates
 * three form links demonstrating the three verification flows:
 *
 * 1. Data Collection — collect borrower info (name, email, address)
 * 2. Identity Verification — verify identity via name + SSN match
 * 3. OTP Verification — verify via email/phone one-time code
 *
 * Prerequisites:
 *   - DynamoDB Local running: docker compose up -d
 *   - Tables created: bun run db:create
 *   - Server running: DYNAMODB_ENDPOINT=http://localhost:8000 KMS_ENDPOINT=local bun run dev
 *
 * Usage:
 *   bun scripts/demo-verification.ts
 */

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

async function main() {
  console.log('=== RAVEN Identity Verification Demo ===\n');

  // Step 1: Create a tenant
  console.log('1. Creating tenant...');
  const tenantRes = await fetch(`${BASE}/api/v1/tenants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Demo Regional Bank',
      permissions: [
        { module: 'identity', requiredTier: 0 },
        { module: 'contact', requiredTier: 0 },
        { module: 'financial', requiredTier: 0 },
        { module: 'credit', requiredTier: 0 },
        { module: 'employment', requiredTier: 0 },
        { module: 'residence', requiredTier: 0 },
        { module: 'buying-patterns', requiredTier: 0 },
        { module: 'education', requiredTier: 0 },
      ],
      callbackUrls: ['http://localhost:3000/health'],
    }),
  });
  if (!tenantRes.ok) {
    console.error(`   Failed (${tenantRes.status}):`, await tenantRes.text());
    process.exit(1);
  }
  const tenant = await tenantRes.json() as { tenantId: string };
  console.log(`   Tenant: ${tenant.tenantId}`);

  // Step 2: Generate an API key
  console.log('2. Generating API key...');
  const keyRes = await fetch(`${BASE}/api/v1/tenants/${tenant.tenantId}/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ environment: 'sandbox' }),
  });
  const { rawKey } = await keyRes.json() as { rawKey: string };
  const auth = { 'Authorization': `Bearer ${rawKey}`, 'Content-Type': 'application/json' };
  console.log(`   API Key: ${rawKey.slice(0, 20)}...`);

  // Step 3: Create a user
  console.log('3. Creating user...');
  const userRes = await fetch(`${BASE}/api/v1/users`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      email: 'frodo@shire.co',
      phone: '+15551234567',
      firstName: 'Frodo',
      lastName: 'Baggins',
    }),
  });
  const { userId } = await userRes.json() as { userId: string };
  console.log(`   User: ${userId}`);

  // Step 4: Seed the user's identity module (so identity verification has something to match against)
  console.log('4. Seeding identity data...');
  // We need to write identity data directly. The easiest way is via a data_collection form submit,
  // but let's use the enrich endpoint with the mock enrichers that are registered.
  await fetch(`${BASE}/api/v1/users/${userId}/enrich/identity`, {
    method: 'POST',
    headers: auth,
  });
  // Also seed contact data for OTP
  await fetch(`${BASE}/api/v1/users/${userId}/enrich/contact`, {
    method: 'POST',
    headers: auth,
  });
  console.log('   Identity and contact modules enriched.');

  // Step 5: Create the three form links
  console.log('\n--- Form Links ---\n');

  // 5a. Data Collection Form
  const dataCollectionRes = await fetch(`${BASE}/forms`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      userId,
      formDefinition: {
        formId: 'demo-data-collection',
        title: 'Borrower Information',
        type: 'data_collection',
        fields: [
          { module: 'identity', field: 'firstName', label: 'First Name', inputType: 'text', required: true },
          { module: 'identity', field: 'lastName', label: 'Last Name', inputType: 'text', required: true },
          { module: 'contact', field: 'email', label: 'Email Address', inputType: 'email', required: true },
          { module: 'contact', field: 'phone', label: 'Phone Number', inputType: 'phone' },
          { module: 'employment', field: 'employer', label: 'Current Employer', inputType: 'text' },
          { module: 'employment', field: 'title', label: 'Job Title', inputType: 'text' },
          { module: 'employment', field: 'salary', label: 'Annual Salary', inputType: 'currency' },
          { module: 'residence', field: 'currentAddress', label: 'Home Address', inputType: 'address', required: true },
        ],
      },
    }),
  });
  const dataForm = await dataCollectionRes.json() as { token: string; url: string };
  console.log(`DATA COLLECTION (fill in borrower details):`);
  console.log(`  ${BASE}${dataForm.url}\n`);

  // 5b. Identity Verification Form
  const identityVerifRes = await fetch(`${BASE}/forms`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      userId,
      formDefinition: {
        formId: 'demo-identity-verification',
        title: 'Verify Your Identity',
        type: 'identity_verification',
        fields: [
          { module: 'identity', field: 'firstName', label: 'First Name', inputType: 'text', required: true },
          { module: 'identity', field: 'lastName', label: 'Last Name', inputType: 'text', required: true },
          { module: 'identity', field: 'ssn', label: 'Social Security Number', inputType: 'ssn', required: true },
        ],
      },
    }),
  });
  const identityForm = await identityVerifRes.json() as { token: string; url: string };
  console.log(`IDENTITY VERIFICATION (match name + SSN against stored data):`);
  console.log(`  ${BASE}${identityForm.url}\n`);

  // 5c. OTP Verification Form
  const otpVerifRes = await fetch(`${BASE}/forms`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      userId,
      formDefinition: {
        formId: 'demo-otp-verification',
        title: 'Verify via One-Time Code',
        type: 'otp_verification',
        fields: [],
      },
    }),
  });
  const otpForm = await otpVerifRes.json() as { token: string; url: string };
  console.log(`OTP VERIFICATION (verify via email or phone code):`);
  console.log(`  ${BASE}${otpForm.url}\n`);

  // 5d. Bank Connection Form (Plaid Link)
  const plaidFormRes = await fetch(`${BASE}/forms`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      userId,
      formDefinition: {
        formId: 'demo-plaid-link',
        title: 'Connect Your Bank Account',
        type: 'data_collection',
        fields: [
          { module: 'financial', field: 'plaidLink', label: 'Bank Account', inputType: 'plaid-link', required: true },
        ],
      },
    }),
  });
  const plaidForm = await plaidFormRes.json() as { token: string; url: string };
  console.log(`BANK CONNECTION (Plaid Link — connect a bank account):`);
  console.log(`  ${BASE}${plaidForm.url}\n`);

  // 5e. Multi-Step Loan Application
  const multiStepRes = await fetch(`${BASE}/forms`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      userId,
      formDefinition: {
        formId: 'demo-loan-application',
        title: 'Loan Application',
        type: 'data_collection',
        fields: [], // ignored when steps are present
        steps: [
          {
            title: 'Personal Information',
            description: 'Let\'s start with your basic details.',
            fields: [
              { module: 'identity', field: 'firstName', label: 'First Name', inputType: 'text', required: true },
              { module: 'identity', field: 'lastName', label: 'Last Name', inputType: 'text', required: true },
              { module: 'contact', field: 'email', label: 'Email Address', inputType: 'email', required: true },
              { module: 'contact', field: 'phone', label: 'Phone Number', inputType: 'phone', required: true },
            ],
          },
          {
            title: 'Employment & Income',
            description: 'Tell us about your current employment.',
            fields: [
              { module: 'employment', field: 'employer', label: 'Current Employer', inputType: 'text', required: true },
              { module: 'employment', field: 'title', label: 'Job Title', inputType: 'text', required: true },
              { module: 'employment', field: 'salary', label: 'Annual Salary', inputType: 'currency', required: true },
            ],
          },
          {
            title: 'Home Address',
            description: 'Your current residential address.',
            fields: [
              { module: 'residence', field: 'currentAddress', label: 'Home Address', inputType: 'address', required: true },
            ],
          },
          {
            title: 'Connect Bank Account',
            description: 'Securely link your bank to verify your financial information.',
            fields: [
              { module: 'financial', field: 'plaidLink', label: 'Bank Account', inputType: 'plaid-link', required: true },
            ],
          },
        ],
      },
    }),
  });
  const multiStepForm = await multiStepRes.json() as { token: string; url: string };
  console.log(`MULTI-STEP LOAN APPLICATION (4 steps: info → employment → address → bank):`);
  console.log(`  ${BASE}${multiStepForm.url}\n`);

  console.log('--- How to test ---\n');
  console.log('1. DATA COLLECTION — fill in fields and submit.\n');
  console.log('2. IDENTITY VERIFICATION — consent, then enter name + SSN.');
  console.log('   Hint: curl -H "Authorization: Bearer ' + rawKey + '" ' + BASE + '/api/v1/users/' + userId + '/modules/identity | jq\n');
  console.log('3. OTP VERIFICATION — choose channel, check server logs for code.');
  console.log('   tail -f /tmp/frodo-server.log | grep -i otp\n');
  console.log('4. BANK CONNECTION — click Connect, use sandbox: user_good / pass_good\n');
  console.log('5. MULTI-STEP LOAN APPLICATION — walk through all 4 steps.');
  console.log('   Data is saved after each step. Plaid Link on the last step.\n');
  console.log('Forms expire in 1 hour. All flows create audit events in the event store.');
}

main().catch(console.error);
