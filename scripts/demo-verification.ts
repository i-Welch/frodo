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

  console.log('--- How to test ---\n');
  console.log('1. Open the DATA COLLECTION link in a browser. Fill in the fields and submit.');
  console.log('   The data is persisted to the user\'s modules with full audit trail.\n');
  console.log('2. Open the IDENTITY VERIFICATION link. You\'ll see a consent screen first.');
  console.log('   After consenting, enter the name and SSN. The system matches against');
  console.log('   the enriched identity data. On success, a verified session is created.\n');
  console.log('   Hint: Check the enriched identity data first:');
  console.log(`   curl -H "Authorization: Bearer ${rawKey}" ${BASE}/api/v1/users/${userId}/modules/identity | jq\n`);
  console.log('3. Open the OTP VERIFICATION link. After consent, choose email or phone.');
  console.log('   The OTP code is logged to the server console (ConsoleOtpProvider).');
  console.log('   Enter the 6-digit code from the server logs to complete verification.\n');
  console.log('Forms expire in 1 hour. All three flows create audit events in the event store.');
}

main().catch(console.error);
