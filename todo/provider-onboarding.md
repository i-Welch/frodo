# Provider Onboarding Checklist

---

## Compliance Documents to Prepare First

Before reaching out to regulated providers, have these ready:

- [ ] **Permissible purpose statement** — why you're pulling consumer data (lending, insurance, employment screening, etc.)
- [ ] **Security posture summary** — describe your encryption (AES-256-GCM envelope encryption via KMS), access controls (multi-tenant API key auth), data retention policies
- [ ] **Consent flow documentation** — how end users consent to their data being pulled (screenshots of your forms system)
- [ ] **Business entity documentation** — company registration, EIN, business address
- [ ] **Insurance** — some providers require E&O or cyber liability insurance

---

## Active Enrichers (built and tested)

### Plaid
- **Modules:** financial, buying-patterns, credit, identity
- **Credentials needed:** Client ID, Secret, Webhook Secret (optional for sandbox)
- **How to sign up:** dashboard.plaid.com — Sandbox is self-serve. Production requires application review.
- **Who to contact:** Apply through dashboard, or email sales@plaid.com for enterprise pricing
- **Pricing:** Per-connection
- **Webhook URL:** `https://reportraven.tech/webhooks/plaid`
- **Env vars:**
  ```
  PROVIDER_PLAID_CLIENT_ID=
  PROVIDER_PLAID_SECRET=
  PROVIDER_PLAID_WEBHOOK_SECRET=
  PLAID_ENV=sandbox  # sandbox | development | production
  ```

**What's built:**
- 5 enrichers:
  - **Financial** (`/accounts/get`) — bank accounts, balances by type (checking/savings/investment)
  - **Buying Patterns** (`/transactions/get`) — spending categories, purchase frequency, avg transaction size from 30-day history
  - **Income** (`/credit/bank_income/get`) — verified income streams with employer name, annualized amount, pay frequency
  - **Liabilities** (`/liabilities/get`) — credit cards, mortgages, student loans with balances, limits, rates → credit module
  - **Identity** (`/identity/get`) — bank-verified name, DOB, email, phone, address for cross-referencing
- **Plaid Link form component** (`inputType: 'plaid-link'`) — drop-in bank connection widget for forms
- **Multi-institution support** — users can link multiple banks, each token stored separately by item ID
- **Webhook handler** — processes TRANSACTIONS webhooks and auto re-enriches financial + buying-patterns
- **Plaid base URL config** — `src/providers/plaid/config.ts` reads `PLAID_ENV` (sandbox/development/production)
- **API routes:**
  - `POST /plaid/create-link-token` — creates a Plaid Link token for forms
  - `POST /plaid/exchange-token` — exchanges public token, stores encrypted access token

**Done:**
- [x] Sign up for Sandbox
- [x] Sandbox credentials in `.env`
- [x] Plaid Link integrated as form component
- [x] Tested financial enrichment end-to-end in Sandbox (accounts, balances)
- [x] Tested buying patterns enrichment in Sandbox (transactions → spending categories)
- [x] Multi-step onboarding form with Plaid Link as final step
- [x] Webhook handler with auto re-enrichment
- [x] Base URL reads from `PLAID_ENV` env var (no hardcoded sandbox URLs)

**Still needed for production:**
- [ ] Apply for Plaid Production access (dashboard → production application, 1-2 week review)
- [ ] Request access to additional Plaid products:
  - [ ] **Liabilities** — requires Plaid approval
  - [ ] **Income** (Bank Income) — requires Plaid approval
  - [ ] **Identity** — requires Plaid approval
  - [ ] Transactions + Auth are enabled by default
- [ ] Set production env vars (`PLAID_ENV=production`, production secret)
- [ ] Register webhook URL in Plaid dashboard: `https://reportraven.tech/webhooks/plaid`
- [ ] Replace `registerMockEnrichers()` with `registerPlaidProvider()` in `src/index.ts`
- [ ] Test Plaid Link update mode (for expired bank credentials — `ITEM_LOGIN_REQUIRED` webhook)
- [ ] Asset reports (`/asset_report/create` — Fannie Mae compatible, needed for mortgage origination)

---

### Experian
- **Module:** credit
- **Credentials needed:** Client ID, Client Secret, Subscriber Code
- **How to sign up:** experian.com/business/developer-portal — apply via developer portal or contact sales
- **Who to contact:** experian.com/business/contact or developer portal signup
- **What to prepare:** FCRA permissible purpose documentation, security posture summary
- **Pricing:** Contract + per-pull
- **Notes:** Requires FCRA compliance and a signed subscriber agreement. Uses OAuth2 client credentials flow. Expect 4-8 weeks.
- **Env vars:**
  ```
  PROVIDER_EXPERIAN_CLIENT_ID=
  PROVIDER_EXPERIAN_CLIENT_SECRET=
  PROVIDER_EXPERIAN_SUBSCRIBER_CODE=
  ```
- [ ] Submit developer portal application or contact sales
- [ ] Complete FCRA permissible purpose documentation
- [ ] Pass security audit / compliance questionnaire
- [ ] Sign subscriber agreement
- [ ] Obtain Sandbox credentials
- [ ] Test enrichment pipeline in Sandbox
- [ ] Obtain Production credentials (expect 4-8 weeks)
- [ ] Set production env vars
- [ ] Replace mock enricher with `registerExperianProvider()` in `src/index.ts`

---

### TransUnion
- **Module:** credit
- **Credentials needed:** API Key, Subscriber Code, Subscriber Prefix. Production uses mutual TLS (client certificate).
- **How to sign up:** transunion.com/business
- **Who to contact:** transunion.com/business/contact or call 800-916-8800
- **What to prepare:** Same as Experian — FCRA permissible purpose, security documentation
- **Pricing:** Contract + per-pull
- **Notes:** Same FCRA requirements as Experian. Production environment requires a client certificate for mutual TLS. Expect 4-8 weeks.
- **Env vars:**
  ```
  PROVIDER_TRANSUNION_API_KEY=
  PROVIDER_TRANSUNION_SUBSCRIBER_CODE=
  PROVIDER_TRANSUNION_SUBSCRIBER_PREFIX=
  ```
- [ ] Contact business solutions
- [ ] Complete FCRA permissible purpose documentation
- [ ] Pass security audit / compliance questionnaire
- [ ] Sign subscriber agreement
- [ ] Obtain Sandbox credentials
- [ ] Test enrichment pipeline in Sandbox
- [ ] Generate client certificate for mutual TLS (production)
- [ ] Obtain Production credentials (expect 4-8 weeks)
- [ ] Set production env vars
- [ ] Replace mock enricher with `registerTransUnionProvider()` in `src/index.ts`

---

### Socure
- **Module:** identity
- **Product:** RiskOS — Prefill > KYC + Fraud + Watchlist > DocV Step up ($1.30/evaluation)
- **How to sign up:** socure.com — self-serve pricing tiers available
- **Webhook URL:** `https://reportraven.tech/webhooks/socure`
- **Env vars:**
  ```
  PROVIDER_SOCURE_API_KEY=
  PROVIDER_SOCURE_SDK_KEY=
  PROVIDER_SOCURE_WORKFLOW_NAME=non_hosted_advanced_pre_fill
  SOCURE_ENV=sandbox  # sandbox | production
  ```

**What's built:**
- **Identity enricher** — server-side KYC via RiskOS Evaluation API (`POST /api/evaluation`)
- **Interactive verification routes:**
  - `POST /socure/start-evaluation` — initiate Prefill + OTP with DOB + phone
  - `POST /socure/verify-otp` — verify 6-digit SMS code, unlock prefill data
  - `POST /socure/submit-kyc` — submit full PII for KYC + Watchlist decision
- **Webhook handler** — receives `evaluation_completed` events after async DocV
- **Shared config** — `src/providers/socure/config.ts` reads `SOCURE_ENV` for base URL
- **Decisions:** ACCEPT → continue, REJECT → stop, REVIEW → DocV step-up

**Socure verification flow:**
1. Collect DOB + phone → `POST /socure/start-evaluation` → triggers OTP to phone
2. User enters 6-digit code → `POST /socure/verify-otp` → unlocks prefilled identity data
3. Display prefilled form (lock DOB + phone) → user confirms → `POST /socure/submit-kyc`
4. If ACCEPT → identity verified. If REVIEW → launch DocV SDK for ID scan + selfie
5. DocV completes async → webhook delivers final decision

**Done:**
- [x] Sign up for Socure
- [x] Sandbox API key in `.env`
- [x] SDK key in `.env`
- [x] Workflow name configured
- [x] Verified Socure sandbox API call works (2026-03-26)
- [x] Enricher rebuilt for RiskOS Evaluation API
- [x] Interactive verification routes (start → OTP → KYC)
- [x] Webhook handler for DocV completion

**Still needed:**
- [ ] Build Socure DocV form component (`inputType: 'socure-docv'`) using SDK key + Web SDK
- [ ] Build Digital Intelligence session token generation (frontend `@socure-inc/device-risk-sdk`)
- [ ] Register webhook URL in Socure dashboard
- [ ] Test full interactive flow in Sandbox (Prefill → OTP → KYC → DocV)
- [ ] Apply for Socure Production access
- [ ] Replace mock enricher with `registerSocureProvider()` in `src/index.ts`

---

### Clearbit
- **Module:** contact
- **Credentials needed:** API Key (Bearer token)
- **How to sign up:** dashboard.clearbit.com — self-serve, API key on dashboard immediately
- **Pricing:** Free tier available, paid plans for volume. Now part of HubSpot.
- **Env vars:**
  ```
  PROVIDER_CLEARBIT_API_KEY=
  ```
- [ ] Sign up at dashboard.clearbit.com
- [ ] Copy API key to env var (immediate)
- [ ] Test enrichment pipeline
- [ ] Set production env vars
- [ ] Replace mock enricher with `registerClearbitProvider()` in `src/index.ts`

---

### Melissa
- **Module:** residence
- **Credentials needed:** License Key
- **How to sign up:** melissadata.com — click "Free Trial", license key emailed immediately
- **Pricing:** Pay-per-lookup, free trial credits included
- **Env vars:**
  ```
  PROVIDER_MELISSA_API_KEY=
  ```
- [ ] Sign up at melissadata.com
- [ ] Copy license key to env var (immediate)
- [ ] Test enrichment pipeline
- [ ] Set production env vars
- [ ] Replace mock enricher with `registerMelissaProvider()` in `src/index.ts`

---

### Truework
- **Module:** employment
- **Credentials needed:** API Key (Bearer token)
- **How to sign up:** truework.com — sales-driven, requires use case review
- **Who to contact:** sales@truework.com or truework.com/contact
- **Pricing:** Per-verification
- **Env vars:**
  ```
  PROVIDER_TRUEWORK_API_KEY=
  ```
- [ ] Submit contact form or email sales
- [ ] Obtain Sandbox API key
- [ ] Test enrichment pipeline in Sandbox
- [ ] Obtain Production API key
- [ ] Set production env vars
- [ ] Replace mock enricher with `registerTrueworkProvider()` in `src/index.ts`

---

### FullContact
- **Module:** contact
- **Credentials needed:** API Key (Bearer token)
- **How to sign up:** fullcontact.com — self-serve, may need sales approval for higher tiers
- **Who to contact:** fullcontact.com/contact
- **API:** `POST https://api.fullcontact.com/v3/person.enrich` — sends email/phone, returns full name, age range, gender, location, title, organization, social profile URLs (Twitter, LinkedIn)
- **Pricing:** Free tier, paid for volume
- **Env vars:**
  ```
  PROVIDER_FULLCONTACT_API_KEY=
  ```
- [x] Sign up at fullcontact.com
- [x] Obtain API key
- [x] Add API key to `.env`
- [x] Verified live API call works (2026-03-24)
- [ ] Register with `registerFullContactProvider()` in `src/index.ts`

---

### HouseCanary
- **Module:** residence
- **Credentials needed:** API Key and API Secret (HTTP Basic auth)
- **How to sign up:** housecanary.com — self-serve for small volume, sales for enterprise. API docs are public.
- **API:** `GET https://api.housecanary.com/v2/property/{details,value,owner_occupied}?address=...&zipcode=...` — property characteristics (beds, baths, sqft, year built), AVM (price_mean/upr/lwr with forecast std dev), owner-occupied boolean, tax assessments. Rate limit: 250 components/min.
- **Pricing:** Free sandbox, paid per-request for production
- **Env vars:**
  ```
  PROVIDER_HOUSECANARY_API_KEY=
  PROVIDER_HOUSECANARY_API_SECRET=
  ```
- [ ] Sign up at housecanary.com
- [ ] Obtain API credentials (immediate)
- [ ] Test enrichment pipeline
- [ ] Set production credentials
- [ ] Register with `registerHouseCanaryProvider()` in `src/index.ts`

---

### ATTOM
- **Module:** residence
- **Credentials needed:** API Key (custom `apikey` header)
- **How to sign up:** attomdata.com — sales-driven
- **Who to contact:** attomdata.com/contact or sales@attomdata.com
- **API:** `GET https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?address1=...&address2=...` — ~400 fields including beds, baths, sqft, year built, lot size, construction type. Also `/avm/detail` for valuations (value, high, low, confidence score 0-100, value per sq ft).
- **Pricing:** Per-request or subscription
- **Env vars:**
  ```
  PROVIDER_ATTOM_API_KEY=
  ```
- [ ] Contact sales (attomdata.com/contact)
- [ ] Obtain Sandbox credentials
- [ ] Test enrichment pipeline
- [ ] Set production env vars
- [ ] Register with `registerAttomProvider()` in `src/index.ts`

---

## Providers Without Enrichers Yet

Source configs exist in `src/config/source-configs.ts` but no enricher has been built. Build these following the guide at `docs/enrichment-plugin-guide.md`.

### LexisNexis
- **Module:** identity
- **Product:** LexisNexis Risk Solutions — InstantID, LexID, Accurint
- **What it does:** Identity verification, fraud detection, KYC/AML screening. Cross-references public records, credit header data, and proprietary databases. Strongest identity verification signal alongside the credit bureaus.
- **Credentials needed:** API Key, Org ID, likely a subscriber/account code. Uses SOAP or REST depending on product line.
- **How to sign up:** risk.lexisnexis.com — sales-driven, requires contract
- **Who to contact:** risk.lexisnexis.com/contact-us or call 866-858-7246
- **What to ask:** Which product fits (InstantID for identity verification, Accurint for skip tracing, FlexID for fraud), sandbox availability, FCRA/DPPA requirements for your use case
- **What to prepare:** Permissible purpose, expected volume, description of your platform and how data is secured
- **Compliance:** FCRA-regulated for certain products (consumer reports). DPPA/GLB restrictions on data use.
- **Pricing:** Contract + per-transaction
- **Source config:** `lexisnexis`, confidence 0.92, 90-day TTL, high field confidence for name/SSN/DOB
- **Env vars:**
  ```
  PROVIDER_LEXISNEXIS_API_KEY=
  PROVIDER_LEXISNEXIS_ORG_ID=
  ```
- [ ] Contact Risk Solutions sales (risk.lexisnexis.com/contact-us)
- [ ] Schedule intro call
- [ ] Determine which product (InstantID vs Accurint vs FlexID)
- [ ] Complete compliance/permissible purpose review
- [ ] Sign contract
- [ ] Obtain Sandbox credentials
- [ ] Build enricher (follow `docs/enrichment-plugin-guide.md`)
- [ ] Write fixture tests
- [ ] Test in Sandbox
- [ ] Obtain Production credentials
- [ ] Set production env vars

---

### First American
- **Module:** residence
- **Product:** First American Data & Analytics — property data, ownership records, title information
- **What it does:** Property ownership verification, deed records, tax assessor data, lien history. Stronger on title/ownership than Melissa or Attom.
- **Credentials needed:** API Key or OAuth client credentials depending on product
- **How to sign up:** firstam.com/data-analytics — sales-driven, multiple product tiers
- **Who to contact:** firstam.com/data-analytics/contact or call their sales line
- **What to ask:** Which product tier (property data vs full title), API vs batch access, sandbox availability
- **Pricing:** Contract + volume commitment
- **Source config:** `firstamerican`, confidence 0.9, 90-day default TTL, 180-day for address/ownership
- **Env vars:**
  ```
  PROVIDER_FIRSTAMERICAN_API_KEY=
  PROVIDER_FIRSTAMERICAN_CLIENT_ID=
  PROVIDER_FIRSTAMERICAN_CLIENT_SECRET=
  ```
- [ ] Contact Data & Analytics sales (firstam.com/data-analytics/contact)
- [ ] Schedule intro call
- [ ] Determine product tier
- [ ] Sign contract
- [ ] Obtain Sandbox credentials
- [ ] Build enricher
- [ ] Write fixture tests
- [ ] Test in Sandbox
- [ ] Obtain Production credentials
- [ ] Set production env vars

---

### Canopy
- **Module:** credit (alternative credit data — rent payments, utility payments)
- **Product:** Canopy Connect / Canopy Rent Reporting
- **What it does:** Rent payment verification, alternative credit data. Pulls rental payment history from property management systems and bank transactions. Useful as a complement to bureau data for thin-file consumers.
- **Credentials needed:** API Key, possibly OAuth for tenant authorization flow
- **How to sign up:** canopyconnect.com — sales-driven
- **Who to contact:** Contact form on canopyconnect.com, or email info@canopyconnect.com
- **What to ask:** Which product (Connect vs Rent Reporting), whether a consumer consent flow is required, sandbox availability
- **Compliance:** May require tenant consent flow similar to Plaid Link (would use token store)
- **Pricing:** Contract-based
- **Source config:** `canopy`, confidence 0.85, 30-day default TTL, 7-day for payment history
- **Env vars:**
  ```
  PROVIDER_CANOPY_API_KEY=
  PROVIDER_CANOPY_CLIENT_ID=
  PROVIDER_CANOPY_CLIENT_SECRET=
  ```
- [ ] Contact sales (canopyconnect.com)
- [ ] Schedule intro call
- [ ] Determine product (Connect vs Rent Reporting)
- [ ] Evaluate if tenant consent flow is needed (may need token store integration like Plaid)
- [ ] Sign contract
- [ ] Obtain Sandbox credentials
- [ ] Build enricher
- [ ] Write fixture tests
- [ ] Test in Sandbox
- [ ] Obtain Production credentials
- [ ] Set production env vars

---

### Cotality (formerly CoreLogic)
- **Module:** residence
- **Product:** Cotality Property Data APIs — property records, valuations, tax data, ownership, hazard risk
- **What it does:** The largest property data provider. Comprehensive property records including tax assessments, deed transfers, mortgage history, hazard risk scores, and AVMs. Rebranded from CoreLogic in 2025.
- **Credentials needed:** API Key and/or OAuth2 client credentials. Multiple product APIs have separate access.
- **How to sign up:** cotality.com (formerly corelogic.com) — enterprise sales-driven
- **Who to contact:** cotality.com/contact or the property data solutions team
- **What to ask:** Which APIs you need (property records, AVM, hazard), sandbox availability, pricing model
- **Pricing:** Enterprise contract + volume commitment
- **Source config:** `cotality`, confidence 0.9, 60-day default TTL, 365-day for property type, 180-day for ownership
- **Env vars:**
  ```
  PROVIDER_COTALITY_API_KEY=
  PROVIDER_COTALITY_CLIENT_ID=
  PROVIDER_COTALITY_CLIENT_SECRET=
  ```
- [ ] Contact sales (cotality.com/contact)
- [ ] Schedule intro call
- [ ] Determine which API products (property, valuation, hazard, etc.)
- [ ] Sign contract
- [ ] Obtain Sandbox credentials
- [ ] Build enricher
- [ ] Write fixture tests
- [ ] Test in Sandbox
- [ ] Obtain Production credentials
- [ ] Set production env vars

---

### NSC (National Student Clearinghouse)
- **Module:** education (`src/modules/education/schema.ts` — fields: highestDegree, enrollments, degrees, certifications, currentlyEnrolled)
- **Product:** NSC Verification Services — enrollment and degree verification
- **What it does:** Verifies college enrollment, degree completion, dates attended, and institution details. Covers ~97% of US postsecondary enrollment.
- **Credentials needed:** Organization ID, API credentials. Requires membership/subscriber agreement.
- **How to sign up:** studentclearinghouse.org — requires organizational membership
- **Who to contact:** studentclearinghouse.org/colleges/enrollment-reporting or the verification services team
- **What to prepare:** FERPA compliance documentation — how you collect student consent, how data is stored and secured, your permissible purpose
- **Compliance:** FERPA-regulated. Requires permissible purpose for accessing education records.
- **Pricing:** Membership + per-verification
- **Source config:** `nsc`, confidence 0.95, 180-day TTL
- **Env vars:**
  ```
  PROVIDER_NSC_ORG_ID=
  PROVIDER_NSC_API_KEY=
  ```
- [ ] Submit membership application (studentclearinghouse.org)
- [ ] Complete FERPA compliance review
- [ ] Sign subscriber agreement
- [ ] Obtain Sandbox/test credentials
- [ ] Build enricher
- [ ] Write fixture tests
- [ ] Test in Sandbox
- [ ] Obtain Production credentials
- [ ] Set production env vars

---

### Equifax
- **Module:** credit
- **What it does:** Third credit bureau. Full credit reports, scores, fraud alerts.
- **Credentials needed:** API credentials (similar structure to Experian/TransUnion)
- **How to sign up:** equifax.com/business
- **Who to contact:** equifax.com/business/contact
- **What to prepare:** Same FCRA documentation as other bureaus
- **Pricing:** Contract + per-pull
- **Env vars:**
  ```
  PROVIDER_EQUIFAX_API_KEY=
  PROVIDER_EQUIFAX_CLIENT_ID=
  PROVIDER_EQUIFAX_CLIENT_SECRET=
  ```
- [ ] Contact business sales (equifax.com/business/contact)
- [ ] Complete FCRA process
- [ ] Sign subscriber agreement
- [ ] Obtain Sandbox credentials
- [ ] Build enricher (follow `docs/enrichment-plugin-guide.md`)
- [ ] Write fixture tests
- [ ] Test in Sandbox
- [ ] Obtain Production credentials
- [ ] Set production env vars

---

### MX
- **Module:** financial
- **What it does:** Bank account aggregation — alternative to Plaid. Account balances, transactions, identity verification via bank data.
- **Credentials needed:** API credentials (OAuth token flow, similar to Plaid)
- **How to sign up:** mx.com — sales-driven
- **Who to contact:** mx.com/contact or sales@mx.com
- **What to ask:** MX Connect widget integration (similar to Plaid Link), sandbox access
- **Pricing:** Contract-based
- **Env vars:**
  ```
  PROVIDER_MX_CLIENT_ID=
  PROVIDER_MX_API_KEY=
  ```
- [ ] Contact sales (mx.com/contact)
- [ ] Schedule demo
- [ ] Obtain Sandbox credentials
- [ ] Build enricher
- [ ] Write fixture tests
- [ ] Test enrichment pipeline
- [ ] Set production env vars

---

### Finicity (Mastercard)
- **Module:** financial
- **What it does:** Bank account aggregation and verification — alternative to Plaid. Strong in mortgage verification (VOA/VOI reports).
- **Credentials needed:** Partner ID, Partner Secret, App Key
- **How to sign up:** finicity.com or developer.mastercard.com/open-banking-us
- **Who to contact:** finicity.com/contact
- **Pricing:** Contract-based
- **Env vars:**
  ```
  PROVIDER_FINICITY_PARTNER_ID=
  PROVIDER_FINICITY_PARTNER_SECRET=
  PROVIDER_FINICITY_APP_KEY=
  ```
- [ ] Contact sales (finicity.com/contact)
- [ ] Obtain Sandbox credentials
- [ ] Build enricher
- [ ] Write fixture tests
- [ ] Test enrichment pipeline
- [ ] Set production env vars

---

## Prerequisites Before Any Provider Goes Live

### For every provider
1. Sandbox/test API credentials
2. Production API credentials (after contract where applicable)
3. Set env vars: `PROVIDER_<NAME>_<KEY>=...`
4. Replace `registerMockEnrichers()` in `src/index.ts` with real `register*Provider()` calls

### For credit bureaus (Experian, TransUnion, Equifax)
- FCRA permissible purpose documentation
- End-user consent flow (existing forms system should cover this)
- Security audit / compliance questionnaire — encryption at rest (envelope encryption via KMS) and access controls (multi-tenant API key auth) are already in place
- Subscriber agreement (legal contract)
- Expect 4-8 weeks for production access

### For LexisNexis
- FCRA and DPPA/GLB permissible purpose depending on product
- Compliance review similar to credit bureaus
- Volume estimates required for pricing

### For NSC
- FERPA compliance — demonstrate how end-user consent is collected
- Organizational membership required
- The `education` module has been created (`src/modules/education/schema.ts`)

### For Plaid / Canopy / MX / Finicity (consumer-authorized data)
- Frontend integration for consumer consent/authorization flow
- Token store integration for per-user access tokens
- Webhook endpoint registered with the provider

---

## Recommended Order

Start with the fastest path to validate the pipeline end-to-end, then tackle longer onboarding cycles:

1. **Clearbit**, **Melissa**, **HouseCanary**, **FullContact** — self-serve, credentials in minutes
2. **Plaid** — fast sandbox, but needs frontend Plaid Link integration
3. **Socure** and **Truework** — sales-driven but typically 1-2 weeks
4. **First American**, **Cotality**, **Canopy**, **Attom** — sales-driven, 2-4 weeks
5. **MX**, **Finicity** — sales + integration work (frontend widget), 2-4 weeks
6. **LexisNexis** — sales + compliance review, 3-6 weeks
7. **Experian**, **TransUnion**, **Equifax** — longest lead time (4-8 weeks), start the process early
8. **NSC** — membership application + FERPA review, variable timeline
