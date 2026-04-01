# Bank Onboarding Guide

Step-by-step process for onboarding a new banking partner onto RAVEN.

---

## Prerequisites

- RAVEN admin secret (`RAVEN_ADMIN_SECRET`)
- Access to the Clerk dashboard (dashboard.clerk.com)
- RAVEN API running (production: `https://app.reportraven.tech`, staging: `https://staging.reportraven.tech`)

---

## Step 1: Create the Tenant

One API call creates both the Clerk organization and the RAVEN tenant, and auto-generates a sandbox API key.

```bash
curl -X POST https://app.reportraven.tech/api/v1/tenants \
  -H "Authorization: Bearer <RAVEN_ADMIN_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Conway National Bank",
    "webhookUrl": "https://conwaynational.com/raven-webhook",
    "maxMembers": 25
  }'
```

**Response:**
```json
{
  "tenantId": "abc-123-...",
  "name": "Conway National Bank",
  "clerkOrgId": "org_XYZ...",
  "permissions": [
    { "module": "identity", "requiredTier": 0 },
    { "module": "contact", "requiredTier": 0 },
    { "module": "financial", "requiredTier": 0 },
    { "module": "credit", "requiredTier": 0 },
    { "module": "employment", "requiredTier": 0 },
    { "module": "residence", "requiredTier": 0 },
    { "module": "buying-patterns", "requiredTier": 0 },
    { "module": "education", "requiredTier": 0 }
  ],
  "callbackUrls": [],
  "webhookUrl": "https://conwaynational.com/raven-webhook",
  "createdAt": "2026-04-01T...",
  "apiKey": "raven_sandbox_abc123..."
}
```

**Save the `apiKey`** — it is only shown once. This is the bank's sandbox API key for programmatic access.

**Save the `clerkOrgId`** — you'll need it to invite users in the next step.

---

## Step 2: Invite Bank Users to the Dashboard

Go to the Clerk dashboard (dashboard.clerk.com):

1. Navigate to **Organizations**
2. Find the organization created in Step 1 (it will have the bank's name)
3. Click into the organization
4. Click **Invite Members**
5. Enter the email addresses of the bank's loan officers, compliance team, or IT contacts
6. They'll receive an email invitation to join the RAVEN dashboard

The invited users can then:
- Sign in at the dashboard URL
- Select the bank's organization from the org switcher
- Create verifications, view reports, and download PDFs

---

## Step 3: Generate a Production API Key (When Ready)

The sandbox key from Step 1 hits sandbox provider APIs (Plaid sandbox, Socure sandbox, etc.). When the bank is ready for live borrower data, generate a production key:

```bash
curl -X POST https://app.reportraven.tech/api/v1/tenants/<tenantId>/api-keys \
  -H "Authorization: Bearer <RAVEN_ADMIN_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{ "environment": "production" }'
```

**Response:**
```json
{
  "keyId": "key_...",
  "rawKey": "raven_production_...",
  "environment": "production"
}
```

Send this key to the bank's IT team securely. It replaces the sandbox key for production API calls.

---

## Step 4: Walk the Bank Through Their First Verification

### Option A: Dashboard (for loan officers)

1. Sign in to the dashboard
2. Go to **Verifications**
3. Click **New Verification**
4. Enter borrower's email or phone, optionally their name
5. Select which modules to verify (default: all)
6. Click **Generate Link** or **Send to Borrower**
7. Share the link with the borrower
8. Wait for the borrower to complete the form (status updates automatically every 15 seconds)
9. Once complete, click into the verification to see the full report
10. Download the PDF for the loan file

### Option B: API (for programmatic integration)

```bash
curl -X POST https://app.reportraven.tech/api/v1/onboard \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "modules": ["identity", "contact", "financial", "credit", "employment", "residence"],
    "person": {
      "email": "borrower@email.com",
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "webhookUrl": "https://conwaynational.com/verification-complete"
  }'
```

**Response:**
```json
{
  "userId": "...",
  "verificationId": "...",
  "formUrl": "https://app.reportraven.tech/forms/...",
  "formToken": "...",
  "modules": ["identity", "contact", "financial", "credit", "employment", "residence"],
  "steps": 2,
  "linkSent": false
}
```

Send `formUrl` to the borrower. When they complete it:
1. RAVEN auto-enriches across all providers
2. POSTs to the `webhookUrl` when complete
3. Bank pulls the report via `GET /api/v1/users/:userId/report`

---

## What the Borrower Experiences

1. Opens the verification link on their phone or computer
2. **Step 1** — Enters their name and SSN (if not pre-filled)
3. **Step 2** — Connects their bank account via Plaid Link
4. Done — takes under 5 minutes

Behind the scenes, RAVEN then:
- Verifies identity via Socure (KYC, fraud, watchlist screening)
- Pulls financial data via Plaid (accounts, balances, transactions, income)
- Verifies employment via Truework
- Enriches contact info via FullContact
- Verifies address and pulls demographics via Melissa Personator
- Pulls property details, AVM, and tax data via Melissa Property API
- Cross-references all sources, boosts confidence for matching data, flags discrepancies

---

## What the Bank Gets Back

A complete borrower report with:

| Module | Data | Sources |
|--------|------|---------|
| **Identity** | Name, DOB, SSN, KYC decision, fraud score, watchlist screening, bank-verified contact info | User, Plaid, Socure |
| **Contact** | Email, phone, social profiles, job title, organization | Plaid, FullContact, Melissa |
| **Financial** | Bank accounts, balances, income streams, buying patterns | Plaid |
| **Credit** | Credit scores, open accounts with detailed payment info, utilization | Plaid |
| **Employment** | Employer, title, salary, start date, employee status, pay frequency | Truework |
| **Residence** | Verified address, ownership status, property details, AVM, tax assessment, sale history, demographics | Plaid, Socure, Melissa |

Plus:
- **Risk & Compliance** card with KYC decision, fraud/synthetic/watchlist scores
- **Cross-Source Verification** showing where multiple providers agree or disagree
- **Full audit trail** with every data change timestamped and sourced
- **Downloadable PDF** report for the loan file

---

## Managing the Tenant

### Revoke an API key
```bash
curl -X DELETE https://app.reportraven.tech/api/v1/tenants/<tenantId>/api-keys/<keyId> \
  -H "Authorization: Bearer <RAVEN_ADMIN_SECRET>"
```

### Remove a user from the dashboard
Go to the Clerk dashboard → Organizations → the bank's org → Members → remove the user.

---

## Checklist

- [ ] Create tenant via admin API
- [ ] Save the API key and tenant ID
- [ ] Invite at least one bank user via Clerk
- [ ] Confirm they can sign in and see the dashboard
- [ ] Run a test verification with sandbox data
- [ ] When ready, generate a production API key
- [ ] Send production API key to bank IT team securely
- [ ] Run a live verification end-to-end
- [ ] Confirm webhook delivery (if configured)
