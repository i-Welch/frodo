# Frodo — User Data Enrichment Platform

## Product Spec v1.0

---

## 1. Overview

**Frodo** is a multi-tenant user data platform that other businesses integrate with to store, enrich, and access consumer data. Think **Plaid, but for the full user profile** — businesses connect to Frodo to pull enriched user data, and Frodo handles the user verification and consent flows required to release that data.

### How It Works

1. A **tenant** (business/product) integrates with Frodo via API keys
2. When the tenant needs user data, they request it through Frodo's API
3. Frodo directs the user through a **verification experience** (similar to Plaid Link) — the level of verification depends on what data is being requested
4. Once verified, Frodo returns the enriched data to the tenant
5. Frodo continuously enriches user data from third-party sources in the background

### Use Cases

- **Risk & Underwriting** — Credit decisions, loan approvals, insurance underwriting
- **Sales & Marketing** — Lead scoring, customer segmentation, personalization
- **General Analytics** — Comprehensive user profiles for flexible downstream consumption

---

## 2. Architecture

### 2.1 Storage

DynamoDB serves as the document store with two tables:

#### Module Table — current materialized state

| Key | Value |
|---|---|
| **Partition Key** | `userId` (UUID) |
| **Sort Key** | `module` (e.g., `identity`, `financial`, `credit`) |

Stores the resolved current state of each module. This is a **derived view** — it can always be rebuilt from the event log.

#### Event Table — immutable append-only log

See §2.6 for full event schema. Stores every data mutation as an immutable event. This is the **source of truth**.

This design enables:
- Selective reads — fetch only the modules you need
- Independent enrichment — enrich one module without touching others
- Full audit trail — every change is recorded with source, confidence, and expiry
- Conflict resolution — competing values from different providers are resolved deterministically
- Granular access control (future) — restrict access per data domain

### 2.2 User Identity

Users are **global** — a single user record exists in Frodo regardless of how many tenants interact with them. Enrichment data is shared across tenants (subject to each tenant's permissions and verification requirements).

#### Identity Resolution

When a tenant creates or references a user, they provide whatever PII they have (name, email, phone, DOB, etc.). Frodo runs **identity resolution** to determine whether this is an existing user or a new one.

- **Minimum**: At least one contact identifier (email or phone)
- **Match logic**: Frodo compares provided PII against existing users. Exact match on email or phone links to an existing user. Fuzzy matching on name + DOB can suggest potential matches.
- **Canonical ID**: Frodo assigns and owns the `userId` (UUID). Tenants never set it — they provide PII and get back the resolved Frodo user ID.
- **Tenant-user links**: A separate table tracks which tenants have a relationship with which users, when the link was created, and what PII the tenant originally provided.

```typescript
interface TenantUserLink {
  tenantId: string;
  userId: string;
  /** The PII the tenant provided when creating/linking this user */
  providedIdentifiers: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
  };
  createdAt: Date;
}
```

#### DynamoDB: Tenant-User Link Table

| Key | Value |
|---|---|
| **Partition Key** | `tenantId` |
| **Sort Key** | `userId` |
| **GSI** | `userId` → `tenantId` (reverse lookup: which tenants know this user?) |

### 2.3 Encryption at Rest

All user data is encrypted at rest. The data is annotated with metadata (field names, module, source, timestamps) so we know *what* data we have, but the actual values are opaque without decryption.

- **Encryption**: All field values in both the module table and event table are encrypted before storage
- **Key management**: AWS KMS (one key per tenant, or shared key with tenant-scoped encryption context)
- **What's encrypted**: Field values (`newValue`, `previousValue` in events; all data fields in module documents)
- **What's NOT encrypted**: Structural metadata — field paths, module names, source names, timestamps, `goodBy` dates, confidence scores. This allows querying and resolution logic to operate on metadata without decrypting values.
- **Decryption**: Only occurs when data is being returned to an authorized, verified consumer

### 2.4 Multi-Tenancy

Frodo is a platform that other businesses integrate with. Each business is a **tenant**.

#### Tenant Model

```typescript
interface Tenant {
  tenantId: string;
  name: string;
  /** API keys for this tenant (multiple for rotation) */
  apiKeys: ApiKey[];
  /** Which modules + access tiers this tenant is approved for */
  permissions: TenantPermission[];
  /** Where to redirect users after completing a verification flow */
  callbackUrls: string[];
  /** Optional additional consent language shown alongside Frodo's standard text */
  consentAddendum?: string;
  /** Webhook URL for async notifications (future) */
  webhookUrl?: string;
}

interface ApiKey {
  keyId: string;
  hashedKey: string;
  /** sandbox: uses mock enrichment data, test users only. production: real providers. */
  environment: "sandbox" | "production";
  createdAt: Date;
  lastUsedAt?: Date;
  active: boolean;
}

interface TenantPermission {
  module: string;
  /** The minimum verification tier required for this tenant to access this module */
  requiredTier: VerificationTier;
}
```

#### Sandbox Mode

API keys are scoped to an environment. Sandbox keys:
- Create and access **test users only** (isolated from production data)
- Use **mock enrichment providers** that return realistic fake data
- Verification flows auto-complete (OTP is always `000000`, identity match always succeeds)
- No real third-party API calls are made
- Useful for tenant development and integration testing

#### Verification Tiers

Access to user data is gated by verification level. More sensitive data requires stronger verification.

| Tier | Verification Method | Example Access |
|---|---|---|
| **Tier 0 — None** | Tenant asserts relationship with user | Create/link a user only — no data returned |
| **Tier 1 — Basic OTP** | Email or phone one-time code | `contact` (all), `employment.employer`, `employment.title` |
| **Tier 2 — Enhanced OTP** | Phone OTP + email OTP (both) | `residence` (all), `buying-patterns` (all), `employment` (all) |
| **Tier 3 — Identity** | First name, last name, SSN/gov ID | `identity` (all), `financial` (all), `credit` (all) |

#### Field-Level Tier Annotations

Each field in a module schema is annotated with its **minimum verification tier**. When data is returned to a tenant, fields above the user's current verified tier are omitted.

```typescript
// In module schema definitions:
interface FieldSchema {
  /** Minimum tier required to read this field */
  tier: VerificationTier;
  // ... validation rules, type, etc.
}

// Example: employment module
const employmentSchema = {
  employer:    { tier: 1, type: "string" },
  title:       { tier: 1, type: "string" },
  startDate:   { tier: 2, type: "date" },
  salary:      { tier: 2, type: "currency" },
  history:     { tier: 2, type: "array" },
};
```

This means a Tier 1 session accessing employment sees `{ employer, title }` while a Tier 2 session sees the full module. The API never returns fields the session isn't authorized for.

Tenants request data → Frodo checks whether the user has a verified session at the required tier → if not, Frodo returns a verification URL that the tenant directs the user to (the "Frodo Link" experience).

#### Integration Flow (Frodo Link)

The verification experience is **built on top of the forms system** (see §8). The access endpoint auto-creates the appropriate form session (`otp_verification` or `identity_verification`) based on the required tier and returns the form URL.

```
1. Tenant calls: POST /api/v1/users/:id/access
   Body: { modules: ["financial", "credit"], callbackUrl: "https://tenant.com/callback" }

2. Frodo determines the highest tier needed (Tier 3 for financial/credit)

3. Frodo checks: does this user have a Tier 3 verified session for this tenant?

4a. YES → returns the requested module data immediately

4b. NO → Frodo auto-creates an identity_verification form session and returns:
    { status: "verification_required",
      verificationUrl: "https://frodo.example/forms/abc123",
      requiredTier: 3 }

5. Tenant redirects user to verificationUrl (embed or redirect)

6. User completes verification form → Frodo creates a session cookie

7. Frodo redirects user to the callbackUrl with a success token:
   https://tenant.com/callback?token=xyz123&userId=...&status=verified

8. Tenant exchanges the token via:
   POST /api/v1/users/:id/access (same endpoint, now session exists → data returned)
```

The `callbackUrl` in the request must match one of the tenant's registered `callbackUrls`.

#### Consent

Before any verification form is presented, the user sees a **consent screen** disclosing:
- What data will be shared (specific modules/fields)
- Who it will be shared with (tenant name)
- How long consent is valid

The consent screen has two parts:
1. **Standard language** — Frodo's baseline consent text, consistent across all tenants
2. **Tenant addendum** — optional additional consent language the tenant can configure (e.g., specific regulatory disclosures required by their industry)

Consent is recorded as an event:

```typescript
interface ConsentEvent {
  userId: string;
  tenantId: string;
  /** Which modules the user consented to share */
  modules: string[];
  /** The verification tier associated with this consent */
  tier: VerificationTier;
  /** Hash of the consent language shown (standard + addendum) for audit */
  consentTextHash: string;
  /** User accepted or declined */
  accepted: boolean;
  timestamp: Date;
}
```

If the user declines consent, no verification is performed and the flow redirects back to the tenant with `status=declined`.

### 2.5 Sessions

After a user completes a verification flow, Frodo creates a **cookie-based session** scoped to that user and verification tier.

```typescript
interface UserSession {
  sessionId: string;
  userId: string;
  /** The highest tier verified in this session */
  verifiedTier: VerificationTier;
  /** When the session was created */
  createdAt: Date;
  /** When the session expires */
  expiresAt: Date;
  /** The tenant that initiated this session */
  tenantId: string;
}
```

- **Default TTL**: Short-lived (e.g., 15 minutes)
- **Extendable**: Session can be extended while active (up to a max lifetime, e.g., 1 hour)
- **On expiry**: User must go through the verification flow again — no silent refresh
- **Scope**: A session is per-user, per-tenant. Tenant A's session doesn't grant Tenant B access.

### 2.6 API Layer

REST API built with Express and TypeScript. All enrichment is on-demand. All tenant-facing endpoints require API key authentication. User-facing endpoints (forms, verification) use session cookies.

### 2.7 Event Log

Every mutation to user data — whether from initial ingest, manual update, or enrichment — is recorded as an immutable **event**. Events are the source of truth; the current module document is a materialized view derived from events.

#### Event Table (DynamoDB)

| Key | Value |
|---|---|
| **Partition Key** | `userId` |
| **Sort Key** | `module#timestamp#eventId` (composite, ensures ordering) |

#### Event Schema

```typescript
interface DataEvent {
  /** Unique event identifier */
  eventId: string;

  /** User this event belongs to */
  userId: string;

  /** Which module was updated (e.g., "financial", "credit") */
  module: string;

  /** What triggered this event */
  source: EventSource;

  /** The field-level changes in this event */
  changes: FieldChange[];

  /** When this event occurred */
  timestamp: Date;

  /** Optional metadata from the source */
  metadata?: Record<string, unknown>;
}

interface EventSource {
  /**
   * The specific source that produced this data.
   * Not a category — the actual provider or origin.
   * Examples: "user", "plaid", "experian", "transunion", "socure",
   *           "equifax", "clearbit", "melissa", "truework", "mx"
   */
  source: string;

  /** Who or what initiated this update (API key ID, system, user session) */
  actor: string;

  /** The tenant that triggered this event, if applicable */
  tenantId?: string;
}

interface FieldChange {
  /** Dot-notation path to the field (e.g., "address.city", "score") */
  field: string;

  /** Previous value (null if new field) */
  previousValue: unknown | null;

  /** New value */
  newValue: unknown;

  /** Confidence score for this value (0-1), derived from SourceConfig at write time */
  confidence: number;

  /** When this specific field value expires, derived from SourceConfig at write time */
  goodBy: Date;
}
```

#### Source Configuration

Each source has system-level configuration that governs how its data is treated:

```typescript
interface SourceConfig {
  /** Source identifier (e.g., "plaid", "experian", "user") */
  source: string;

  /** Default goodBy duration for data from this source */
  defaultTtl: Duration;

  /** Per-field TTL overrides (e.g., credit score expires faster than name) */
  fieldTtls?: Record<string, Duration>;

  /** Base confidence score for data from this source (0-1) */
  confidence: number;

  /** Per-field confidence overrides */
  fieldConfidence?: Record<string, number>;
}
```

For example, Experian credit scores might have a 30-day TTL with 0.95 confidence, while user-submitted income has a 365-day TTL with 0.6 confidence. These are configured in the system, not set per-event — the event inherits from its source config at write time.

#### Value Resolution

When multiple sources provide conflicting values for the same field, the system queries the event log and resolves:

1. **Filter** — discard values past their `goodBy` date
2. **Rank** — score remaining values using source-defined confidence and recency
3. **Select** — highest-scoring value wins
4. **Tie-break** — if scores are equal, prefer the most recent event

The resolution logic is query-based — we can write and tune resolution queries against the event log without changing the underlying data.

#### Event Uses

- **Audit trail** — full history of who changed what, when, and why
- **Conflict resolution** — pick the best value when Experian says one thing and TransUnion says another
- **Staleness detection** — `goodBy` dates flag when data needs re-enrichment
- **Replay** — rebuild any module's current state by replaying its events

### 2.8 Access Audit Log

Every data **read** — not just mutations — is logged for compliance and analytics.

```typescript
interface AccessLogEntry {
  /** Which tenant accessed the data */
  tenantId: string;
  /** Which user's data was accessed */
  userId: string;
  /** Which modules were returned */
  modules: string[];
  /** Which fields were returned (post tier-filtering) */
  fields: string[];
  /** The verification tier the session had at time of access */
  verifiedTier: VerificationTier;
  /** When the access occurred */
  timestamp: Date;
  /** API key ID used */
  apiKeyId: string;
}
```

#### DynamoDB: Access Log Table

| Key | Value |
|---|---|
| **Partition Key** | `tenantId` |
| **Sort Key** | `timestamp#userId` |
| **GSI** | `userId` → `tenantId#timestamp` (lookup: who has accessed this user's data?) |

### 2.9 Enrichment Engine

Plugin-based architecture. Each enrichment provider implements a standard `Enricher` interface. Modules can have multiple providers (e.g., the credit module can pull from Experian, TransUnion, and Equifax). The engine writes enrichment results as events, and the module's current document is re-materialized from the event log.

#### Failure Handling

Enrichment is **best-effort, per-provider**. If one provider fails, others still run.

- **Partial success**: If Experian succeeds but TransUnion fails, the Experian event is written normally. The response includes a `failures` array listing which providers failed and why.
- **Error events**: Failed enrichment attempts are recorded as events with `source.source` set to the provider and an empty `changes` array + error metadata. This provides a record of attempts for debugging and staleness tracking.
- **No automatic retries**: The caller can retry by hitting the enrichment endpoint again. The engine is idempotent — re-running enrichment just produces new events.
- **Provider timeout**: Each enricher has a configurable timeout (default 30s). On timeout, treated as a failure.

---

## 3. Data Modules

### 3.1 Identity

Core personally identifiable information.

- **Purpose**: Foundational user record, ID verification
- **Data**: Name, date of birth, SSN (encrypted, like all field values), aliases, government IDs
- **Providers**: Socure (ID verification), Jumio (document verification)
- **Note**: SSN is encrypted at rest via KMS (consistent with all field values). For identity verification, the system decrypts and compares. When returned to tenants, SSN is masked (last 4 only) unless the tenant has explicit full-SSN permissions.

### 3.2 Residence

Current and historical address information.

- **Purpose**: Address verification, property ownership, geographic analysis
- **Data**: Current address, address history, ownership status, property type, move-in dates
- **Providers**: Melissa (address verification/standardization), ATTOM (property records and valuation)

### 3.3 Financial

Banking and financial account data.

- **Purpose**: Income verification, asset assessment, financial health
- **Data**: Bank accounts, balances, income streams, assets, transaction history
- **Providers**: Plaid (bank account linking and data), Finicity (financial data aggregation)

### 3.4 Credit

Credit bureau data.

- **Purpose**: Creditworthiness assessment, risk scoring
- **Data**: Credit scores, open accounts, payment history, inquiries, derogatory marks, utilization
- **Providers**: Experian, TransUnion, Equifax

### 3.5 Buying Patterns

Consumer spending behavior.

- **Purpose**: Purchase behavior analysis, spend categorization, trend detection
- **Data**: Spending categories, purchase frequency, average transaction size, merchant affinity, seasonal trends
- **Providers**: Plaid (transaction categorization), MX (financial data enrichment)

### 3.6 Employment

Work history and income verification.

- **Purpose**: Employment verification, income confirmation
- **Data**: Current employer, job title, employment start date, salary, employment history
- **Providers**: Truework (employment/income verification), The Work Number by Equifax

### 3.7 Contact

Communication channels and social presence.

- **Purpose**: Reachability, social identity resolution
- **Data**: Email addresses, phone numbers, social media profiles, communication preferences
- **Providers**: Clearbit (person enrichment), FullContact (identity resolution)

---

## 4. API Endpoints

All `/api/v1/*` endpoints require API key authentication (tenant-scoped).

### Tenant Management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/tenants` | Register a new tenant |
| `POST` | `/api/v1/tenants/:id/api-keys` | Generate a new API key |
| `DELETE` | `/api/v1/tenants/:id/api-keys/:keyId` | Revoke an API key |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/users` | Create a new user with initial data |
| `GET` | `/api/v1/users/:id` | Get user metadata (no module data — use access endpoint) |
| `DELETE` | `/api/v1/users/:id` | Delete user and all module data |

### Data Access (Frodo Link)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/users/:id/access` | Request module data — returns data or verification URL |
| `GET` | `/api/v1/users/:id/access/status` | Check current session/verification status for a user |

### Modules (internal / admin)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/users/:id/modules/:module` | Get a specific module's data (bypasses verification — admin only) |
| `PUT` | `/api/v1/users/:id/modules/:module` | Update a specific module's data |

### Enrichment

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/users/:id/enrich` | Enrich all modules for a user |
| `POST` | `/api/v1/users/:id/enrich/:module` | Enrich a specific module |
| `GET` | `/api/v1/users/:id/enrichment-status` | Get last enrichment timestamps per module |

### Events

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/users/:id/events` | Get all events for a user (cursor-paginated, filterable by module) |
| `GET` | `/api/v1/users/:id/events/:module` | Get events for a specific module |
| `GET` | `/api/v1/users/:id/events/:module/:field` | Get event history for a specific field (shows all competing values + resolution) |

### Pagination

All list endpoints use **cursor-based pagination** (natural fit for DynamoDB's `LastEvaluatedKey`).

```typescript
// Request
GET /api/v1/users/:id/events?limit=50&cursor=eyJ...

// Response
{
  data: [...],
  pagination: {
    cursor?: string;   // opaque token — pass as ?cursor= for the next page
    hasMore: boolean;
  }
}
```

Default page size: 50. Max page size: 200.

### Error Responses

All API errors follow a consistent shape:

```typescript
interface ApiError {
  status: number;
  code: string;
  message: string;
}
```

| Status | Code | When |
|---|---|---|
| 401 | `invalid_api_key` | API key is missing, revoked, or invalid |
| 403 | `verification_required` | User hasn't verified at the required tier (body includes `verificationUrl`) |
| 403 | `module_not_permitted` | Tenant doesn't have permission for the requested module |
| 404 | `user_not_found` | No user exists with this ID |
| 404 | `module_not_found` | Module doesn't exist or has no data |
| 409 | `user_already_exists` | Identity resolution matched an existing user when creating |
| 422 | `validation_error` | Request body failed validation (body includes field-level errors) |
| 502 | `enrichment_failed` | One or more enrichment providers returned errors |
| 503 | `provider_unavailable` | Enrichment provider is down or unreachable |

---

## 5. Enricher Interface

```typescript
interface Enricher<T> {
  /** The source identifier — must match a SourceConfig (e.g., "plaid", "experian") */
  source: string;

  /** Which module this enricher targets (e.g., "financial", "credit") */
  module: string;

  /** Fetch enriched data from the provider. Returns raw field values. */
  enrich(userId: string, current: Partial<T>): Promise<EnrichmentResult<T>>;
}

interface EnrichmentResult<T> {
  /** The enriched data fields */
  data: Partial<T>;

  /** Optional provider-specific metadata (raw response ID, API version, etc.) */
  metadata?: Record<string, unknown>;
}
```

The engine — not the enricher — is responsible for looking up the `SourceConfig` for the enricher's `source` to determine confidence scores and `goodBy` dates. The enricher only returns raw data.

Each module registers its enrichers. When enrichment is triggered, the engine:

1. Loads current module data from DynamoDB
2. Runs all registered enrichers for that module
3. Looks up `SourceConfig` for each enricher's `source` to get confidence + TTL
4. Writes each enricher's results as a `DataEvent` to the event log
5. Re-materializes the module's current document using value resolution (see §2.7)
6. Writes the resolved document back to the module table

---

## 6. Tech Stack

| Component | Technology |
|---|---|
| Runtime | Bun |
| Language | TypeScript |
| API Framework | Elysia (Bun-native) |
| Database | AWS DynamoDB |
| Encryption | AWS KMS (field-level envelope encryption at rest) |
| AWS SDK | `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `@aws-sdk/client-kms` |
| Validation | Elysia `t` (routes) + Zod (module schemas) |
| Templates | Eta (server-rendered forms) |
| Frontend | HTMX (no JS framework) |
| CSS | Classless (Water.css or Simple.css) |
| IaC | AWS CDK (TypeScript) |

---

## 7. Project Structure

```
src/
  modules/
    identity/
      schema.ts          # Zod schema + TypeScript types
      enrichers/
        socure.ts
        jumio.ts
    residence/
      schema.ts
      enrichers/
        melissa.ts
        attom.ts
    financial/
      schema.ts
      enrichers/
        plaid.ts
        finicity.ts
    credit/
      schema.ts
      enrichers/
        experian.ts
        transunion.ts
        equifax.ts
    buying-patterns/
      schema.ts
      enrichers/
        plaid-transactions.ts
        mx.ts
    employment/
      schema.ts
      enrichers/
        truework.ts
        work-number.ts
    contact/
      schema.ts
      enrichers/
        clearbit.ts
        fullcontact.ts
  store/
    dynamo-client.ts     # DynamoDB connection + config
    user-store.ts        # CRUD operations for module documents
    event-store.ts       # Append + query events
    tenant-store.ts      # Tenant + API key CRUD
    session-store.ts     # User session CRUD
    access-log-store.ts  # Access audit log writes + queries
    tenant-user-store.ts # Tenant-user link table CRUD
  crypto/
    encryption.ts        # Field-level encrypt/decrypt via KMS
    keys.ts              # Key management + encryption context
  events/
    types.ts             # DataEvent, FieldChange, EventSource types
    resolver.ts          # Value resolution (confidence-weighted, recency-aware)
    materializer.ts      # Rebuild module document from event log
    source-config.ts     # Per-source goodBy + confidence configuration
  identity/
    resolver.ts          # Identity resolution — match PII to existing users or create new
    types.ts             # TenantUserLink, identity match types
  tenancy/
    types.ts             # Tenant, ApiKey, TenantPermission types
    auth.ts              # API key authentication middleware
    permissions.ts       # Verification tier checks + field-level tier filtering
  sessions/
    types.ts             # UserSession type
    manager.ts           # Create, extend, expire sessions
    middleware.ts        # Cookie-based session middleware
  enrichment/
    engine.ts            # Orchestrates enrichment, writes events
    types.ts             # Enricher interface + shared types
    registry.ts          # Module-to-enricher mapping
  api/
    server.ts            # Express app setup
    middleware/
      api-key.ts         # Tenant API key auth
      session.ts         # User session cookie auth
    routes/
      tenants.ts         # Tenant management routes
      users.ts           # User CRUD routes
      access.ts          # Frodo Link — data access + verification gating
      modules.ts         # Module CRUD routes (admin)
      events.ts          # Event history + field resolution routes
      enrichment.ts      # Enrichment trigger routes
      forms.ts           # Form session + submission routes
  forms/
    types.ts             # FormDefinition, FormField types
    renderer.ts          # Renders FormDefinition → HTML + HTMX
    tokens.ts            # Form token generation + validation
    otp.ts               # OTP generation, sending, verification
    verification.ts      # Identity verification (PII match)
    templates/
      layout.html        # Base HTML layout (classless CSS + HTMX)
      field.html         # Per-field-type partials
      otp-step.html      # OTP entry step
      confirmation.html  # Post-submission confirmation
  types.ts               # Shared types
  index.ts               # Entry point
```

---

## 8. Forms Service

A lightweight form-rendering service for collecting data directly from users. Forms are server-rendered HTML using **HTMX** — no JavaScript framework, no build step. The same Express server that hosts the API also serves forms.

### 8.1 Overview

Forms are **configuration-driven**. A form definition specifies which fields to show, their types, validation rules, and layout. When submitted, the data flows into the event log with `source.source: "user"`.

### 8.2 Form Definition

```typescript
interface FormDefinition {
  /** Unique form identifier */
  formId: string;

  /** Display title */
  title: string;

  /** The type of form — determines verification requirements */
  type: "data_collection" | "identity_verification" | "otp_verification";

  /** Ordered list of fields to render (can span multiple modules) */
  fields: FormField[];

  /** How long the form URL stays valid. null = never expires. Default: 1 hour */
  expiresIn?: Duration | null;
}

interface FormField {
  /** Module this field belongs to (e.g., "identity", "residence") */
  module: string;

  /** Field path within the module (e.g., "address.city") */
  field: string;

  /** Display label */
  label: string;

  /** Input type */
  inputType:
    | "text"
    | "number"
    | "email"
    | "phone"
    | "date"
    | "ssn"
    | "select"
    | "radio"
    | "checkbox"
    | "textarea"
    | "currency"
    | "address";

  /** Options for select/radio/checkbox fields */
  options?: { label: string; value: string }[];

  /** Validation rules */
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}
```

### 8.3 Form Types

#### Data Collection (default)

Standard form for gathering missing user information or capturing user intent. No identity verification required — the form URL itself is the secret (unguessable token).

- Configurable fields from any module (can span multiple modules in one form)
- Supports all input types (text, dropdowns, date pickers, currency, etc.)
- Submissions create events with `source: "user"`
- Default lifetime: 1 hour (configurable, or set to never expire)

#### Identity Verification (high-risk)

Used before releasing sensitive financial data. Requires the user to confirm their identity via PII match.

- **Required fields**: First name, last name, SSN (or other government ID)
- Server-side verification: submitted values are compared against the existing `identity` module data
- On match: creates a **cookie-based session** at Tier 3 (see §2.4), unlocks the requested data
- On mismatch: logs a failed verification event, does not reveal what didn't match
- SSN field is masked on input (shows last 4 only), transmitted securely, stored encrypted at rest

#### OTP Verification (low-risk)

Used for lower-risk data access. Confirms identity via a one-time code sent to the user's phone or email.

- User selects phone or email (from known contact data on file)
- Server sends a 6-digit OTP with configurable expiry (default 10 minutes)
- User enters the code on the form
- On valid code: creates a **cookie-based session** at Tier 1 or 2 (see §2.4)
- On invalid/expired: allows retry (max 3 attempts)
- OTP delivery mechanism is abstract — pluggable provider (Twilio, SNS, SendGrid, etc.)

### 8.4 How It Works

> **Terminology**: A **form token** is the unique, unguessable URL identifier for a form (controls form access + lifetime). A **user session** is the cookie-based authenticated session created *after* a verification form is completed (controls data access).

```
1. API creates a form token:
   POST /forms → returns a unique form URL (/forms/:token)

2. User opens the URL → server validates the token (not expired?) → renders HTML + HTMX

3. User fills out and submits → HTMX POST to server

4. Server validates, writes event, returns confirmation
   (or triggers verification flow for identity/OTP forms → creates user session on success)
```

### 8.5 Rendering

- Plain HTML served by Express with a simple template engine (e.g., EJS or Handlebars)
- HTMX for dynamic behavior: field validation on blur, conditional field visibility, multi-step flows (OTP)
- Minimal CSS — clean, functional default styling (classless CSS like Water.css or Simple.css)
- No JavaScript build pipeline

### 8.6 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/forms` | Create a form token (accepts `FormDefinition` + `userId`) |
| `GET` | `/forms/:token` | Render the form HTML |
| `POST` | `/forms/:token/submit` | Handle form submission |
| `POST` | `/forms/:token/send-otp` | Send OTP code (OTP verification forms only) |
| `POST` | `/forms/:token/verify-otp` | Verify OTP code |

---

## 9. Frodo Collect — Client-Side Data Collection Library

### 9.1 Overview

**Frodo Collect** is a lightweight, framework-agnostic JavaScript library that provides a consistent data collection and persistence layer for any user-facing experience. It is the bridge between the front-end (forms, widgets, custom experiences) and Frodo's event-based backend.

Every experience that collects user data — whether it's the built-in HTMX verification forms, a SmartyStreets address autocomplete, a Plaid-like bank linking widget, or a custom tenant-built page — uses Frodo Collect to:

1. **Declare** which fields are being collected (module + field path)
2. **Collect** values via any UI pattern (form fields, API callbacks, widget events)
3. **Validate** values client-side before submission
4. **Submit** values to the Frodo backend, where they become events in the event log

### 9.2 Design Principles

- **UI-agnostic**: Frodo Collect does not render anything. It manages data state and submission. The UI is entirely separate — HTMX forms, React components, vanilla JS widgets can all use the same Collect instance.
- **Event-native**: Every submission produces a `DataEvent` with field-level changes, source attribution, and metadata. The library structures data specifically for the event log.
- **Composable**: Multiple Collect instances can run on the same page (e.g., address section + employment section), each scoped to a module. They can submit independently or be batched.

### 9.3 API

```typescript
// Initialize a collect session tied to a form token
const collect = new FrodoCollect({
  token: 'abc123',           // form token
  endpoint: '/forms',         // Frodo forms API base
  source: 'user',            // event source attribution
});

// Register fields to collect
collect.addField({ module: 'residence', field: 'currentAddress', required: true });
collect.addField({ module: 'identity', field: 'firstName', required: true });

// Set values (from form inputs, widget callbacks, etc.)
collect.setValue('residence', 'currentAddress', { street: '123 Main', city: 'NYC', state: 'NY', zip: '10001' });
collect.setValue('identity', 'firstName', 'Alice');

// Client-side validation
const errors = collect.validate();
// → { 'identity.lastName': 'Required field' } or {} if valid

// Submit to backend (produces events)
const result = await collect.submit();
// → { success: true, eventsCreated: 2 }

// Listen for state changes (for reactive UIs)
collect.on('change', (module, field, value) => { ... });
collect.on('error', (module, field, error) => { ... });
collect.on('submit', (result) => { ... });
```

### 9.4 How It Integrates

```
┌──────────────────────────────────┐
│  UI Layer (any technology)       │
│  HTMX forms, React, vanilla JS  │
│  Custom widgets (SmartyStreets)  │
└────────────┬─────────────────────┘
             │ setValue(), validate(), submit()
┌────────────▼─────────────────────┐
│  Frodo Collect (JS library)      │
│  - Field registration            │
│  - Value state management        │
│  - Client-side validation        │
│  - Event-structured submission   │
└────────────┬─────────────────────┘
             │ POST /forms/:token/submit
┌────────────▼─────────────────────┐
│  Frodo Backend                   │
│  - Server validation             │
│  - Event creation (DataEvent)    │
│  - Module materialization        │
└──────────────────────────────────┘
```

### 9.5 Delivery

- Served as a single `<script>` tag from the Frodo server: `<script src="/frodo-collect.js"></script>`
- No build step required by consumers — just include the script
- ~5KB minified, zero dependencies
- Also available as an npm package for build-tool users: `import { FrodoCollect } from '@frodo/collect'`

### 9.6 Submission Format

When `collect.submit()` is called, it POSTs to the forms API with data structured for event creation:

```json
{
  "fields": [
    { "module": "residence", "field": "currentAddress", "value": { "street": "123 Main", ... } },
    { "module": "identity", "field": "firstName", "value": "Alice" }
  ],
  "source": "user",
  "metadata": { "userAgent": "...", "timestamp": "..." }
}
```

The backend groups fields by module and creates one `DataEvent` per module, with `source.source` set to the configured source name.

---

## 10. Non-Goals (v1)

- Caching layer
- Async job processing / message queues
- Real-time webhooks or event streaming
- Rich form styling / theming system
- Tenant self-service dashboard / portal
- Batch or scheduled enrichment
- Data retention policies / GDPR automation
- Rate limiting
- Embeddable JS SDK (Frodo Link is redirect-based for v1)
