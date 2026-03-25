# Frodo — Technical Spec v1.0

Implements [PRODUCT_SPEC.md](./PRODUCT_SPEC.md).

---

## 1. System Overview

Frodo is a TypeScript application running on **Bun**, deployed on **ECS Fargate**. It exposes a REST API via **Elysia** (Bun-native framework with end-to-end type safety) for tenant integrations and server-rendered HTML forms (HTMX + Eta) for user-facing verification flows. All data lives in **DynamoDB** using a single-table design with a separate identity lookup table. Field-level encryption uses **envelope encryption** via AWS KMS.

---

## 2. Infrastructure

### 2.1 AWS Services

| Service | Purpose |
|---|---|
| **ECS Fargate** | Runs the Bun/Elysia application container |
| **DynamoDB** | Primary data store (single-table) + identity lookup table |
| **KMS** | Key management for envelope encryption |
| **ECR** | Container image registry |
| **CloudWatch** | Log aggregation (structured JSON from pino) |
| **ALB** | Load balancer in front of ECS, terminates TLS |

### 2.2 DynamoDB: Single-Table Design

All entities live in one table (`frodo-main`) with a generic key schema. Entity type is encoded in the key prefixes.

#### Table Schema

| Attribute | Type | Description |
|---|---|---|
| `PK` | String | Partition key |
| `SK` | String | Sort key |
| `GSI1PK` | String | Global secondary index 1 partition key |
| `GSI1SK` | String | Global secondary index 1 sort key |
| `GSI2PK` | String | Global secondary index 2 partition key |
| `GSI2SK` | String | Global secondary index 2 sort key |
| `type` | String | Entity type discriminator |
| `data` | Map | Entity-specific attributes |
| `ttl` | Number | DynamoDB TTL (epoch seconds, used for sessions + form tokens) |

#### Entity Key Patterns

| Entity | PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK |
|---|---|---|---|---|---|---|
| **Tenant** | `TENANT#<tenantId>` | `METADATA` | — | — | — | — |
| **API Key** | `TENANT#<tenantId>` | `APIKEY#<keyId>` | `APIKEY#<prefix>` | `<keyId>` | — | — |
| **User Module** | `USER#<userId>` | `MODULE#<module>` | — | — | — | — |
| **Data Event** | `USER#<userId>` | `EVENT#<module>#<ts>#<eventId>` | `EVENT#<source>` | `<ts>#<userId>` | — | — |
| **Tenant-User Link** | `TENANT#<tenantId>` | `USERLINK#<userId>` | `USER#<userId>` | `TENANTLINK#<tenantId>` | — | — |
| **User Session** | `SESSION#<sessionId>` | `METADATA` | `USER#<userId>` | `SESSION#<tenantId>#<ts>` | — | — |
| **Form Token** | `FORM#<token>` | `METADATA` | `USER#<userId>` | `FORM#<ts>` | — | — |
| **Access Log** | `ACCESSLOG#<tenantId>` | `<ts>#<userId>` | `USER#<userId>` | `ACCESSLOG#<tenantId>#<ts>` | — | — |
| **Consent Event** | `USER#<userId>` | `CONSENT#<tenantId>#<ts>` | `TENANT#<tenantId>` | `CONSENT#<userId>#<ts>` | — | — |

#### Access Patterns

| Access Pattern | Query |
|---|---|
| Get tenant by ID | PK = `TENANT#<id>`, SK = `METADATA` |
| List API keys for tenant | PK = `TENANT#<id>`, SK begins_with `APIKEY#` |
| Lookup API key by prefix | GSI1: PK = `APIKEY#<prefix>` |
| Get all modules for user | PK = `USER#<id>`, SK begins_with `MODULE#` |
| Get specific module | PK = `USER#<id>`, SK = `MODULE#<module>` |
| Get events for user+module | PK = `USER#<id>`, SK begins_with `EVENT#<module>#` |
| Get all events for user | PK = `USER#<id>`, SK begins_with `EVENT#` |
| Get events by source | GSI1: PK = `EVENT#<source>`, SK range |
| Get tenants for user | GSI1: PK = `USER#<userId>`, SK begins_with `TENANTLINK#` |
| Get users for tenant | PK = `TENANT#<id>`, SK begins_with `USERLINK#` |
| Get session by ID | PK = `SESSION#<id>`, SK = `METADATA` |
| Get sessions for user | GSI1: PK = `USER#<id>`, SK begins_with `SESSION#` |
| Get access logs for tenant | PK = `ACCESSLOG#<tenantId>`, SK range |
| Get access logs for user | GSI1: PK = `USER#<id>`, SK begins_with `ACCESSLOG#` |
| Get consent for user+tenant | PK = `USER#<id>`, SK begins_with `CONSENT#<tenantId>#` |

#### DynamoDB Settings

- **Billing mode**: On-demand (pay-per-request) — appropriate for unpredictable traffic patterns at launch
- **TTL attribute**: `ttl` — used for automatic session and form token expiry
- **Point-in-time recovery**: Enabled (the event log is the source of truth — protect it)
- **Encryption**: DynamoDB-managed encryption at rest (SSE) as baseline, plus application-level envelope encryption for field values

### 2.3 Infrastructure as Code (AWS CDK)

All AWS resources are defined in TypeScript via **AWS CDK**, co-located in the repo under `infra/`.

#### Environment Strategy

Single AWS account with **prefixed resources** per environment:
- `frodo-staging-main` / `frodo-production-main` (DynamoDB)
- `frodo-staging-api` / `frodo-production-api` (ECS service)
- etc.

The CDK app accepts an `environment` context parameter (`staging` | `production`) and prefixes all resource names accordingly.

#### CDK Stack Structure

```
infra/
  bin/
    app.ts                  # CDK app entry — instantiates stacks per environment
  lib/
    database-stack.ts       # DynamoDB tables (main + identity lookup) + GSIs
    compute-stack.ts        # ECS Fargate cluster, service, task definition, ALB
    security-stack.ts       # KMS keys, IAM roles (ECS task role, deploy role)
    ecr-stack.ts            # ECR repository
    monitoring-stack.ts     # CloudWatch log groups, dashboards, alarms
  cdk.json
  tsconfig.json
  package.json
```

#### Key Resources Provisioned

| Resource | CDK Construct | Notes |
|---|---|---|
| DynamoDB main table | `aws_dynamodb.Table` | PK/SK + GSI1 + GSI2, on-demand, PITR enabled |
| DynamoDB lookup table | `aws_dynamodb.Table` | PK/SK, on-demand |
| ECS Cluster | `aws_ecs.Cluster` | Fargate-only |
| ECS Service | `aws_ecs_patterns.ApplicationLoadBalancedFargateService` | ALB + Fargate in one construct |
| KMS CMK | `aws_kms.Key` | One per environment, aliased `frodo-{env}-cmk` |
| ECR Repo | `aws_ecr.Repository` | Shared across environments, image tags differentiate |
| CloudWatch Log Group | `aws_logs.LogGroup` | `/frodo/{env}/api`, 30-day retention |
| IAM Task Role | `aws_iam.Role` | DynamoDB, KMS, CloudWatch access |
| IAM Deploy Role | `aws_iam.Role` | OIDC trust for GitHub Actions |

#### Secret Management

Secrets are stored in **GitHub Secrets** (repository-level) and injected into ECS task definitions via the deploy workflow. The deploy step writes secrets as environment variables in the task definition at deploy time.

| Secret | GitHub Secret Name | Used For |
|---|---|---|
| Cookie signing key | `COOKIE_SECRET` | Signed session cookies |
| (future) Plaid API key | `PLAID_CLIENT_SECRET` | Plaid enrichment provider |
| (future) Experian API key | `EXPERIAN_API_KEY` | Experian enrichment provider |

The deploy workflow injects these via `aws ecs register-task-definition` with the secrets mapped to container environment variables. Non-secret config (LOG_LEVEL, table names) is set directly in the CDK task definition.

#### Database Migrations

DynamoDB is schemaless, but GSI changes require planning:

- **Adding a GSI**: Add to CDK stack, deploy. CDK handles the online GSI creation. Backfill happens automatically but can take time on large tables.
- **Changing key patterns**: Not supported in-place by DynamoDB. Requires a data migration script (read old records, write in new format, delete old). Add migration scripts under `infra/migrations/`.
- **Convention**: All key pattern changes are backwards-compatible during transition — write to both old and new patterns, read from new, then clean up old after full migration.

### 2.4 Identity Lookup Table

A separate DynamoDB table (`frodo-identity-lookup`) dedicated to identity resolution. Maps known identifiers to user IDs.

| Attribute | Type | Description |
|---|---|---|
| `PK` | String | Identifier type + value (e.g., `EMAIL#alice@example.com`, `PHONE#+15551234567`) |
| `SK` | String | `USER#<userId>` |
| `userId` | String | The canonical Frodo user ID |
| `createdAt` | String | When this identifier was linked |

**Why a separate table?** Identity lookups are on the hot path of user creation and need simple, fast exact-match queries. Mixing them into the single table would pollute the key space and complicate GSI design. This table is small, high-throughput, and its access patterns are distinct.

#### Identity Resolution Flow

```
1. Tenant provides PII: { email: "alice@example.com", phone: "+15551234567", firstName: "Alice" }

2. Query lookup table:
   - GetItem PK=EMAIL#alice@example.com → found? → return userId
   - GetItem PK=PHONE#+15551234567 → found? → return userId

3a. MATCH FOUND → verify no conflict (email and phone point to same userId)
    → return existing userId, create tenant-user link if new

3b. NO MATCH → create new user:
    → generate userId (UUIDv7 for sortability)
    → write USER#<id> MODULE#identity with provided PII
    → write lookup entries for email + phone
    → write tenant-user link
    → return new userId

3c. CONFLICT (email → user A, phone → user B)
    → return 409 with both candidate user IDs
    → tenant must resolve (or provide more PII)
```

### 2.5 Envelope Encryption

Each user has a **data encryption key (DEK)** that encrypts/decrypts their field values. The DEK itself is encrypted by a KMS **customer master key (CMK)**.

#### Flow

```
ENCRYPT (write path):
1. Check if user already has an encrypted DEK stored (on the USER#<id> MODULE#identity record)
2a. New user → call KMS GenerateDataKey → get plaintext DEK + encrypted DEK
2b. Existing user → call KMS Decrypt on the stored encrypted DEK → get plaintext DEK
3. Encrypt each field value with the plaintext DEK (AES-256-GCM)
4. Store the encrypted field values + encrypted DEK
5. Discard plaintext DEK (never persisted)

DECRYPT (read path):
1. Read the encrypted DEK from the user's record
2. Call KMS Decrypt → get plaintext DEK
3. Decrypt each field value with the plaintext DEK
4. Return decrypted values
5. Discard plaintext DEK
```

#### Key Design

- **One CMK per environment** (sandbox / production), not per tenant — simpler key management
- **Encryption context**: `{ userId: "<id>", environment: "production" }` — binds the DEK to a specific user, prevents key misuse
- **DEK storage**: Encrypted DEK stored as `encryptedDek` attribute on the user's identity module record
- **Algorithm**: AES-256-GCM with a unique IV per field encryption operation
- **KMS calls per request**: 1 (decrypt the DEK), then all field operations are local. For new users: 1 call (GenerateDataKey)

---

## 3. Application Architecture

### 3.1 Project Structure

```
frodo/
  src/
    modules/                    # Data domain modules
      identity/
        schema.ts               # Zod schema + field-level tier annotations
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
      registry.ts               # Module registry — maps module names to schemas + enrichers

    store/                      # Data access layer
      dynamo-client.ts          # DynamoDB client setup + table config
      base-store.ts             # Shared single-table helpers (key builders, type guards)
      user-store.ts             # User module CRUD
      event-store.ts            # Event append + query
      tenant-store.ts           # Tenant + API key CRUD
      session-store.ts          # Session CRUD with TTL
      access-log-store.ts       # Access audit log writes + queries
      tenant-user-store.ts      # Tenant-user link CRUD
      form-token-store.ts       # Form token CRUD with TTL
      identity-lookup-store.ts  # Identity lookup table operations

    crypto/
      encryption.ts             # Envelope encrypt/decrypt (AES-256-GCM)
      kms.ts                    # KMS client — GenerateDataKey, Decrypt
      types.ts                  # EncryptedField, DEK types

    events/
      types.ts                  # DataEvent, FieldChange, EventSource types
      resolver.ts               # Value resolution — filter expired, rank by confidence + recency
      materializer.ts           # Replay events → build current module document

    identity/
      resolver.ts               # Identity resolution — PII → userId
      types.ts                  # Match result types

    tenancy/
      types.ts                  # Tenant, ApiKey, TenantPermission, VerificationTier
      api-key.ts                # API key generation (prefix + hash), validation

    sessions/
      types.ts                  # UserSession type
      manager.ts                # Create, extend, validate, expire sessions

    enrichment/
      engine.ts                 # Orchestrates enrichment — run providers, write events, rematerialize
      types.ts                  # Enricher, EnrichmentResult interfaces
      registry.ts               # Source → enricher mapping
      source-config.ts          # Per-source confidence + TTL config (code-defined)
      mock/                     # Sandbox mock enrichers
        mock-enricher.ts        # Base mock that returns realistic fake data

    forms/
      types.ts                  # FormDefinition, FormField, FormToken
      renderer.ts               # FormDefinition → Eta template → HTML
      tokens.ts                 # Token generation (crypto.randomBytes), validation, expiry
      otp.ts                    # OTP generation + verification logic
      otp-provider.ts           # Abstract OTP delivery interface
      verification.ts           # Identity verification (decrypt + compare PII)
      consent.ts                # Consent screen rendering + consent event creation
      templates/
        layout.eta              # Base HTML layout — HTMX script, classless CSS
        consent.eta             # Consent screen template
        form.eta                # Form rendering template
        field-types/            # Per-input-type partials
          text.eta
          select.eta
          ssn.eta
          address.eta
          ...
        otp.eta                 # OTP entry step
        confirmation.eta        # Post-submission confirmation
        error.eta               # Error/expiry page

    api/
      server.ts                 # Elysia app setup, plugins, route mounting
      middleware/
        api-key-auth.ts         # Extract + validate API key from Authorization header
        session-auth.ts         # Validate session cookie
        request-id.ts           # Attach correlation ID to each request
        error-handler.ts        # Global error handler → ApiError response shape
      routes/
        tenants.ts              # POST /api/v1/tenants, POST/DELETE api-keys
        users.ts                # POST/GET/DELETE /api/v1/users/:id
        access.ts               # POST /api/v1/users/:id/access, GET .../access/status
        modules.ts              # GET/PUT /api/v1/users/:id/modules/:module (admin)
        enrichment.ts           # POST /api/v1/users/:id/enrich[/:module], GET enrichment-status
        events.ts               # GET /api/v1/users/:id/events[/:module[/:field]]
        forms.ts                # POST /forms, GET/POST /forms/:token/*

    config/
      source-configs.ts         # All SourceConfig definitions (confidence, TTLs per source)
      tier-config.ts            # Verification tier definitions
      app-config.ts             # Environment variables, feature flags, defaults

    logger.ts                   # Pino logger setup — structured JSON, correlation IDs
    types.ts                    # Shared types (Duration, VerificationTier enum, etc.)
    index.ts                    # Entry point — init DynamoDB, start Elysia

  test/
    setup.ts                    # DynamoDB Local setup/teardown
    factories/                  # Test data factories (users, tenants, events, etc.)
    store/                      # Store-level integration tests
    api/                        # Route-level integration tests
    enrichment/                 # Enrichment engine tests
    events/                     # Resolver + materializer tests
    crypto/                     # Encryption round-trip tests
    identity/                   # Identity resolution tests

  scripts/
    create-tables.ts            # Create DynamoDB tables + GSIs (idempotent)
    seed.ts                     # Seed test tenant, user, API key for local dev

  Dockerfile                    # Multi-stage build — build TS, run dist
  docker-compose.yml            # Local dev: app + DynamoDB Local
  vitest.config.ts
  tsconfig.json
  package.json
  .eslintrc.cjs                 # ESLint config
  .prettierrc                   # Prettier config
```

### 3.2 Key Dependencies

| Package | Purpose |
|---|---|
| `elysia` | HTTP framework (Bun-native, end-to-end type safety) |
| `@elysiajs/cookie` | Cookie plugin for Elysia |
| `@elysiajs/html` | HTML response plugin (for form rendering) |
| `@aws-sdk/client-dynamodb` | DynamoDB operations |
| `@aws-sdk/lib-dynamodb` | DynamoDB document client (marshalling) |
| `@aws-sdk/client-kms` | KMS operations (GenerateDataKey, Decrypt) |
| `zod` | Schema validation (module schemas — Elysia uses its own `t` for route validation) |
| `eta` | Template engine (server-rendered forms) |
| `pino` | Structured JSON logger |

Dev dependencies:

| Package | Purpose |
|---|---|
| `eslint` | Linting |
| `prettier` | Code formatting |
| `@typescript-eslint/*` | TypeScript ESLint rules |

> **Note**: Bun has built-in TypeScript execution (no `tsx`), built-in `crypto` APIs (`crypto.randomUUID()`), and native test runner. We still use vitest for DynamoDB Local integration tests.

### 3.3 npm Scripts

```json
{
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "build": "bun build src/index.ts --target=bun --outdir=dist",
    "start": "bun dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/ test/ --ext .ts",
    "lint:fix": "eslint src/ test/ --ext .ts --fix",
    "format": "prettier --write 'src/**/*.ts' 'test/**/*.ts'",
    "format:check": "prettier --check 'src/**/*.ts' 'test/**/*.ts'",
    "typecheck": "tsc --noEmit",
    "db:create": "bun scripts/create-tables.ts",
    "db:seed": "bun scripts/seed.ts",
    "db:reset": "bun scripts/create-tables.ts && bun scripts/seed.ts"
  }
}
```

### 3.4 Local Development

#### Getting Started

```bash
# 1. Install dependencies
bun install

# 2. Start DynamoDB Local
docker compose up dynamodb-local -d

# 3. Create tables + seed data
bun run db:reset

# 4. Start the app in watch mode
bun run dev
```

The app runs on `http://localhost:3000`. `bun --watch` auto-restarts on file changes.

#### Seed Data (`scripts/seed.ts`)

Creates a ready-to-use local environment:

- **Test tenant**: `frodo_test_aaaaaaaa...` API key (printed to console)
- **Test user**: Seeded with identity + contact module data
- **Tenant-user link**: Links the test tenant to the test user

This gives you a working API key and user ID to immediately test against.

#### Table Creation (`scripts/create-tables.ts`)

Creates both DynamoDB tables (`frodo-local-main`, `frodo-local-identity-lookup`) with all GSIs. Idempotent — skips if tables already exist.

#### Local Cookie Handling

In development (`NODE_ENV=development`), the session cookie config is relaxed:
- `secure: false` (allows HTTP on localhost)
- `sameSite: "lax"` (unchanged)

Production always enforces `secure: true`.

#### Manual End-to-End Test (Frodo Link)

```bash
# 1. Create a user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer frodo_test_aaaaaaaa..." \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "firstName": "Alice", "lastName": "Smith"}'
# → returns { userId: "..." }

# 2. Request access to financial data
curl -X POST http://localhost:3000/api/v1/users/<userId>/access \
  -H "Authorization: Bearer frodo_test_aaaaaaaa..." \
  -H "Content-Type: application/json" \
  -d '{"modules": ["financial"], "callbackUrl": "http://localhost:3000/api/v1/health"}'
# → returns { status: "verification_required", verificationUrl: "http://localhost:3000/forms/abc123" }

# 3. Open verificationUrl in browser → consent → identity form → submit

# 4. After redirect, re-request access (session cookie now set)
```

### 3.5 Configuration (Code-Defined)

All source configs, module schemas, and tier definitions live in TypeScript files under `src/config/`. Changes require a deploy — this is intentional for v1.

```typescript
// src/config/source-configs.ts
export const sourceConfigs: Record<string, SourceConfig> = {
  user: {
    source: "user",
    defaultTtl: { days: 365 },
    confidence: 0.6,
    fieldConfidence: {
      "firstName": 0.95,  // users know their own name
      "income": 0.5,      // self-reported income is less reliable
    },
  },
  experian: {
    source: "experian",
    defaultTtl: { days: 30 },
    confidence: 0.95,
    fieldTtls: {
      "score": { days: 14 },      // credit scores change frequently
      "accounts": { days: 30 },
    },
  },
  plaid: {
    source: "plaid",
    defaultTtl: { days: 7 },
    confidence: 0.9,
    fieldTtls: {
      "balances": { days: 1 },    // balances are highly volatile
      "transactions": { days: 1 },
    },
  },
  // ... other sources
};
```

### 3.4 Logging

Structured JSON via **pino**. Every log line includes:

- `requestId` — correlation ID (UUID, set by middleware)
- `tenantId` — from API key auth (when available)
- `userId` — when operating on a user
- `module` — when operating on a specific module
- `source` — when an enrichment provider is involved
- `duration` — for timed operations

Log levels: `fatal`, `error`, `warn`, `info`, `debug`, `trace`.

Production: `info` and above. Development: `debug`.

---

## 4. API Key Authentication

### Key Format

```
frodo_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
│     │    └─ 32 random chars (crypto.randomBytes)
│     └─ environment: live | test
└─ prefix: always "frodo"
```

### Key Lifecycle

```
1. Tenant requests a new key:
   POST /api/v1/tenants/:id/api-keys { environment: "production" }

2. Server generates:
   - keyId: UUIDv7
   - rawKey: "frodo_live_" + 32 random hex chars
   - prefix: first 8 chars after "frodo_live_" → "a1b2c3d4"
   - hash: SHA-256(rawKey)

3. Store in DynamoDB:
   PK=TENANT#<tenantId>, SK=APIKEY#<keyId>
   GSI1PK=APIKEY#a1b2c3d4
   data: { keyId, hash, environment, active, createdAt }

4. Return rawKey to tenant (only time it's visible)

5. On each request:
   - Extract key from Authorization: Bearer frodo_live_a1b2c3d4...
   - Parse prefix: "a1b2c3d4"
   - Query GSI1: PK=APIKEY#a1b2c3d4
   - Compare SHA-256(rawKey) against stored hash
   - Check active=true
   - Load tenant from PK
```

---

## 5. Session Management

### Cookie Configuration

Using `@elysiajs/cookie` plugin:

```typescript
{
  name: "frodo_session",
  httpOnly: true,
  secure: true,        // HTTPS only (relaxed to false in development)
  sameSite: "lax",     // allows redirect back from tenant
  path: "/",
  maxAge: 900,         // 15 minutes (in seconds, matches default session TTL)
  secrets: process.env.COOKIE_SECRET,  // HMAC signing
}
```

### Session Lifecycle

```
CREATE (after verification):
  1. Generate sessionId (UUIDv7)
  2. Write to DynamoDB:
     PK=SESSION#<id>, SK=METADATA, ttl=now+15min
     data: { userId, tenantId, verifiedTier, createdAt, expiresAt }
  3. Set signed cookie: frodo_session=<sessionId>

VALIDATE (on data access request):
  1. Read sessionId from signed cookie
  2. GetItem PK=SESSION#<id>
  3. Check: not expired, tenantId matches requesting tenant
  4. Return session (tier, userId)

EXTEND:
  1. Validate session (above)
  2. Update expiresAt = min(now + 15min, createdAt + 1hour)
  3. Update ttl attribute
  4. Update cookie maxAge

EXPIRE:
  - DynamoDB TTL auto-deletes expired sessions
  - On next request with expired cookie → 403 verification_required
```

---

## 6. Enrichment Engine

### Execution Flow

```typescript
async function enrichModule(userId: string, module: string, actor: string): Promise<EnrichmentReport> {
  // 1. Load current module data (decrypt)
  const current = await userStore.getModule(userId, module);
  const decrypted = await crypto.decryptFields(userId, current);

  // 2. Get registered enrichers for this module
  const enrichers = enrichmentRegistry.getEnrichers(module);

  // 3. Run all enrichers concurrently with timeout
  const results = await Promise.allSettled(
    enrichers.map(e => withTimeout(e.enrich(userId, decrypted), e.timeoutMs ?? 30_000))
  );

  // 4. Process results — write events for successes, error events for failures
  const report: EnrichmentReport = { successes: [], failures: [] };

  for (const [i, result] of results.entries()) {
    const enricher = enrichers[i];
    const sourceConfig = getSourceConfig(enricher.source);

    if (result.status === "fulfilled") {
      const event = buildDataEvent(userId, module, enricher.source, actor, result.value, sourceConfig);
      await eventStore.append(event);
      report.successes.push({ source: enricher.source, fields: Object.keys(result.value.data) });
    } else {
      const errorEvent = buildErrorEvent(userId, module, enricher.source, actor, result.reason);
      await eventStore.append(errorEvent);
      report.failures.push({ source: enricher.source, error: result.reason.message });
    }
  }

  // 5. Rematerialize module from event log
  const events = await eventStore.getEvents(userId, module);
  const resolved = resolver.resolve(events);
  const encrypted = await crypto.encryptFields(userId, resolved);
  await userStore.putModule(userId, module, encrypted);

  return report;
}
```

### Mock Enrichers (Sandbox)

When the request comes from a sandbox API key, the engine swaps real enrichers for mock implementations that return realistic fake data using deterministic seeds (based on userId) for consistent test behavior.

---

## 7. Value Resolution

### Algorithm

```typescript
function resolve(events: DataEvent[]): Record<string, unknown> {
  const now = new Date();
  const fieldValues: Map<string, { value: unknown; score: number }> = new Map();

  for (const event of events) {
    for (const change of event.changes) {
      // 1. Filter: skip expired values
      if (change.goodBy < now) continue;

      // 2. Calculate recency weight (1.0 at event time → 0.5 at goodBy)
      const totalLifespan = change.goodBy.getTime() - event.timestamp.getTime();
      const elapsed = now.getTime() - event.timestamp.getTime();
      const recencyWeight = 1.0 - 0.5 * (elapsed / totalLifespan);

      // 3. Score = confidence * recencyWeight
      const score = change.confidence * recencyWeight;

      // 4. Select: keep highest score per field (tie-break: most recent)
      const existing = fieldValues.get(change.field);
      if (!existing || score > existing.score ||
          (score === existing.score && event.timestamp > (/* existing event timestamp */))) {
        fieldValues.set(change.field, { value: change.newValue, score });
      }
    }
  }

  return Object.fromEntries(fieldValues.entries().map(([k, v]) => [k, v.value]));
}
```

---

## 8. Forms & Verification

### Form Token

```typescript
// Generation
const token = crypto.randomBytes(32).toString("urlsafe-base64"); // 43 chars, URL-safe

// Storage: DynamoDB with TTL
PK=FORM#<token>, SK=METADATA
data: { formDefinition, userId, tenantId, createdAt }
ttl: createdAt + expiresIn (or omitted for never-expire)
```

### Verification Form Flow (Identity — Tier 3)

```
1. Render consent screen (consent.eta)
   - Shows: tenant name, modules requested, consent language + addendum
   - User clicks "Agree" → HTMX POST /forms/:token/consent

2. Log consent event → render identity form (form.eta with SSN field)
   - Fields: firstName, lastName, SSN (masked input)

3. User submits → POST /forms/:token/submit
   - Decrypt stored identity module for this user
   - Compare: submitted firstName/lastName/SSN vs stored values
   - Match: create session (Tier 3), redirect to callbackUrl?token=<successToken>&status=verified
   - Mismatch: render error (no details on what failed), log failed verification event
```

### Verification Form Flow (OTP — Tier 1/2)

```
1. Render consent screen

2. User agrees → render OTP selection (choose email or phone)
   - For Tier 2: both are required sequentially

3. User selects channel → POST /forms/:token/send-otp
   - Generate 6-digit OTP (crypto.randomInt)
   - Store: hashed OTP, channel, attempts=0, expiresAt=now+10min
   - Call OTP provider to deliver
   - Render OTP entry form (otp.eta)

4. User enters code → POST /forms/:token/verify-otp
   - Compare hash(submitted) vs stored hash
   - Valid: create session, redirect to callbackUrl
   - Invalid: increment attempts, allow retry (max 3)
   - Expired: render error, offer to resend
```

### Rendering Stack

- **Eta** templates with layouts and partials
- **HTMX** loaded from CDN (single `<script>` tag)
  - `hx-post` for form submissions
  - `hx-target` for partial page updates (OTP step transitions)
  - `hx-validate` for client-side validation on blur
- **Water.css** loaded from CDN (single `<link>` tag) — classless CSS for clean defaults
- No build step, no bundler, no JS framework

---

## 9. Testing

### Setup

`docker-compose.yml` runs DynamoDB Local alongside the app for development:

```yaml
services:
  dynamodb-local:
    image: amazon/dynamodb-local
    ports:
      - "8000:8000"
    command: ["-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory"]

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DYNAMODB_ENDPOINT=http://dynamodb-local:8000
      - KMS_ENDPOINT=local  # triggers local encryption (no KMS calls)
      - NODE_ENV=development
      - COOKIE_SECRET=local-dev-secret
    depends_on:
      - dynamodb-local
```

### Test Strategy

| Layer | Tool | What |
|---|---|---|
| **Unit** | vitest | Resolver logic, encryption round-trips, key builders, schema validation |
| **Integration** | vitest + DynamoDB Local | Store operations, enrichment engine, identity resolution |
| **API** | vitest + supertest | Route-level tests with real DynamoDB Local |
| **Enrichers** | vitest (mocked) | Each enricher tested with mocked HTTP responses |
| **Forms** | vitest + supertest | Assert on HTML response content (form fields present, HTMX attributes, consent text). No browser needed — forms are server-rendered, so response body assertions are sufficient. |

### Test Isolation

Tests run against DynamoDB Local and must not collide. Strategy:

- **Per-test key prefix**: Each test file generates a unique random prefix (e.g., `test_a1b2_`). All keys created during that test use the prefix. Teardown deletes all items with that prefix.
- **Helper**: `test/setup.ts` exports a `createTestContext()` function that returns a prefixed store instance + cleanup function.

```typescript
// test/setup.ts
export async function createTestContext() {
  const prefix = `test_${crypto.randomBytes(4).toString("hex")}_`;
  const stores = createStores({ keyPrefix: prefix });

  return {
    stores,
    cleanup: async () => {
      // Scan and delete all items with this prefix
      await deleteByPrefix(prefix);
    },
  };
}

// Usage in tests:
describe("user-store", () => {
  let ctx: TestContext;
  beforeEach(async () => { ctx = await createTestContext(); });
  afterEach(async () => { await ctx.cleanup(); });

  it("creates a user", async () => {
    const user = await ctx.stores.userStore.create({ ... });
    expect(user.userId).toBeDefined();
  });
});
```

### Coverage

- **Minimum threshold**: 80% line coverage (enforced in CI via `vitest --coverage`)
- **vitest config**: `coverage.thresholds.lines = 80`
- **CI fails** if coverage drops below threshold on any PR
- Focus coverage on: store layer, resolver, encryption, identity resolution, auth middleware

### Local Encryption

In development/test, the crypto module uses a **local fallback** — a static AES key instead of KMS — so tests don't need AWS credentials. Controlled by `KMS_ENDPOINT=local` env var.

---

## 10. Deployment

### Container

Multi-stage Dockerfile:

```dockerfile
# Build stage
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY tsconfig.json ./
COPY src/ ./src/
RUN bun build src/index.ts --target=bun --outdir=dist

# Production stage
FROM oven/bun:1-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3000
CMD ["bun", "dist/index.js"]
```

### ECS Fargate Configuration

- **Task definition**: 0.5 vCPU, 1 GB memory (start small, scale up)
- **Desired count**: 2 (minimum for availability)
- **Health check**: `GET /health` → 200
- **ALB**: HTTPS termination, routes to target group
- **Auto-scaling**: Target tracking on CPU utilization (target 70%)

### Environment Variables

| Variable | Description |
|---|---|
| `NODE_ENV` | `production` / `development` |
| `PORT` | Server port (default 3000) |
| `AWS_REGION` | AWS region |
| `DYNAMODB_TABLE` | Main table name (default `frodo-main`) |
| `DYNAMODB_LOOKUP_TABLE` | Identity lookup table name (default `frodo-identity-lookup`) |
| `DYNAMODB_ENDPOINT` | Override for local development |
| `KMS_KEY_ID` | KMS CMK ID for envelope encryption |
| `KMS_ENDPOINT` | Override for local dev (`local` = static key) |
| `COOKIE_SECRET` | Secret for signed cookies |
| `LOG_LEVEL` | Pino log level (default `info`) |

---

## 11. Observability

### 11.1 Health Check Endpoint

`GET /health` returns system health. Used by ALB for routing and by smoke tests for validation.

```typescript
// Shallow health (ALB target group health check — fast, no dependencies)
GET /health
→ 200 { status: "ok", uptime: 12345 }

// Deep health (smoke tests + debugging — verifies dependencies)
GET /health/deep
→ 200 {
  status: "ok",
  checks: {
    dynamodb: { status: "ok", latencyMs: 12 },
    dynamodbLookup: { status: "ok", latencyMs: 8 },
    kms: { status: "ok", latencyMs: 45 }
  }
}
→ 503 { status: "degraded", checks: { kms: { status: "error", error: "timeout" } } }
```

ALB uses `/health` (shallow). Smoke tests use `/health/deep`.

### 11.2 Structured Logging

Every log line is JSON (via pino) and includes contextual fields. Key log events:

| Event | Level | Fields | When |
|---|---|---|---|
| `request.start` | info | requestId, method, path, tenantId | Every inbound request |
| `request.complete` | info | requestId, method, path, statusCode, durationMs | Every response |
| `enrichment.start` | info | requestId, userId, module, source | Enricher invoked |
| `enrichment.success` | info | requestId, userId, module, source, durationMs, fieldCount | Enricher returned |
| `enrichment.failure` | error | requestId, userId, module, source, durationMs, error | Enricher failed/timeout |
| `verification.attempt` | info | requestId, userId, tenantId, tier, method | User submitted verification |
| `verification.success` | info | requestId, userId, tenantId, tier | Verification passed |
| `verification.failure` | warn | requestId, userId, tenantId, tier | Verification failed (PII mismatch, wrong OTP) |
| `access.granted` | info | requestId, userId, tenantId, modules, tier | Data returned to tenant |
| `identity.resolved` | info | requestId, tenantId, matchType (new/existing/conflict) | Identity resolution completed |
| `kms.decrypt` | debug | requestId, userId, durationMs | DEK decrypted |
| `session.created` | info | requestId, userId, tenantId, tier, expiresAt | New session |
| `session.expired` | info | requestId, sessionId | Session rejected (expired) |

### 11.3 CloudWatch Configuration

Provisioned via CDK (`monitoring-stack.ts`):

#### Log Groups

| Log Group | Retention | Source |
|---|---|---|
| `/frodo/staging/api` | 14 days | ECS task stdout |
| `/frodo/production/api` | 90 days | ECS task stdout |

#### Metric Filters

CloudWatch metric filters extract metrics from structured logs:

| Metric | Filter Pattern | Unit |
|---|---|---|
| `RequestCount` | `{ $.event = "request.complete" }` | Count |
| `RequestLatencyP50/P95/P99` | `{ $.event = "request.complete" }` on `$.durationMs` | Milliseconds |
| `5xxCount` | `{ $.event = "request.complete" && $.statusCode >= 500 }` | Count |
| `4xxCount` | `{ $.event = "request.complete" && $.statusCode >= 400 && $.statusCode < 500 }` | Count |
| `EnrichmentDuration` | `{ $.event = "enrichment.success" }` on `$.durationMs` | Milliseconds |
| `EnrichmentFailureCount` | `{ $.event = "enrichment.failure" }` | Count |
| `VerificationSuccessCount` | `{ $.event = "verification.success" }` | Count |
| `VerificationFailureCount` | `{ $.event = "verification.failure" }` | Count |
| `AccessGrantedCount` | `{ $.event = "access.granted" }` | Count |

#### Alarms

| Alarm | Condition | Action |
|---|---|---|
| **High 5xx rate** | 5xxCount > 10 in 5 minutes | SNS notification |
| **Elevated latency** | P95 latency > 2000ms for 5 minutes | SNS notification |
| **Enrichment failures** | EnrichmentFailureCount > 20 in 5 minutes | SNS notification |
| **High verification failures** | VerificationFailureCount > 50 in 15 minutes (possible brute-force) | SNS notification |
| **ECS task unhealthy** | HealthyHostCount < 1 for 2 minutes | SNS notification |
| **DynamoDB throttling** | ThrottledRequests > 0 for 5 minutes | SNS notification |

#### Dashboard

A CloudWatch dashboard (`frodo-{env}-dashboard`) with panels:

- **Request traffic**: Request count over time, by status code
- **Latency**: P50/P95/P99 over time
- **Enrichment**: Duration by source, failure rate by source
- **Verification**: Success/failure rate by tier
- **Infrastructure**: ECS CPU/memory utilization, DynamoDB consumed capacity, KMS call count
- **Errors**: 5xx count, enrichment failures, verification failures

### 11.4 CloudWatch Logs Insights Queries

Pre-built queries for common debugging scenarios (save as "Saved Queries" in CloudWatch):

```
# All events for a specific user
fields @timestamp, event, module, source.source, @message
| filter userId = "USER_ID_HERE"
| sort @timestamp desc
| limit 100

# Failed enrichments in the last hour
fields @timestamp, userId, module, source, error
| filter event = "enrichment.failure"
| sort @timestamp desc
| limit 50

# Verification attempts by tenant
fields @timestamp, userId, tier, event
| filter tenantId = "TENANT_ID_HERE" and event like /verification/
| sort @timestamp desc

# Slow requests (>1s)
fields @timestamp, method, path, durationMs, tenantId
| filter event = "request.complete" and durationMs > 1000
| sort durationMs desc
| limit 20

# Enrichment duration by provider (last 24h)
fields source, durationMs
| filter event = "enrichment.success"
| stats avg(durationMs) as avgMs, p95(durationMs) as p95Ms, count() as calls by source
```

---

## 12. CI/CD (GitHub Actions)

### Workflows

#### `ci.yml` — runs on every push and PR

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run typecheck

  test:
    runs-on: ubuntu-latest
    services:
      dynamodb-local:
        image: amazon/dynamodb-local
        ports:
          - 8000:8000
        options: >-
          --health-cmd "curl -f http://localhost:8000/shell/ || exit 1"
          --health-interval 5s
          --health-timeout 3s
          --health-retries 5
    env:
      DYNAMODB_ENDPOINT: http://localhost:8000
      KMS_ENDPOINT: local
      NODE_ENV: test
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run db:create
      - run: bun run test:coverage

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build
```

#### `deploy.yml` — runs on push to main (after CI passes)

```yaml
name: Deploy
on:
  push:
    branches: [main]

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false

jobs:
  ci:
    uses: ./.github/workflows/ci.yml

  deploy-staging:
    needs: ci
    runs-on: ubuntu-latest
    environment: staging
    permissions:
      id-token: write   # OIDC auth to AWS
      contents: read
    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}

      - uses: aws-actions/amazon-ecr-login@v2
        id: ecr

      - name: Build and push image
        env:
          ECR_REGISTRY: ${{ steps.ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/frodo:$IMAGE_TAG .
          docker push $ECR_REGISTRY/frodo:$IMAGE_TAG

      - name: Register new task definition (staging)
        id: task-def-staging
        env:
          ECR_REGISTRY: ${{ steps.ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
          COOKIE_SECRET: ${{ secrets.COOKIE_SECRET_STAGING }}
        run: |
          # Get current task def, update image + secrets, register new revision
          TASK_DEF=$(aws ecs describe-task-definition --task-definition frodo-api-staging \
            --query 'taskDefinition' --output json)
          NEW_TASK_DEF=$(echo "$TASK_DEF" | jq \
            --arg IMAGE "$ECR_REGISTRY/frodo:$IMAGE_TAG" \
            --arg COOKIE_SECRET "$COOKIE_SECRET" \
            '.containerDefinitions[0].image = $IMAGE |
             .containerDefinitions[0].environment += [{"name":"COOKIE_SECRET","value":$COOKIE_SECRET}] |
             del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')
          NEW_ARN=$(aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEF" \
            --query 'taskDefinition.taskDefinitionArn' --output text)
          echo "task_def_arn=$NEW_ARN" >> "$GITHUB_OUTPUT"

      - name: Deploy to ECS (staging)
        run: |
          aws ecs update-service \
            --cluster frodo-staging \
            --service frodo-api \
            --task-definition ${{ steps.task-def-staging.outputs.task_def_arn }}

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster frodo-staging \
            --services frodo-api

      - name: Smoke test (staging)
        run: |
          STAGING_URL="${{ vars.STAGING_URL }}"
          # Health check
          curl -sf "$STAGING_URL/health" | jq .status | grep -q '"ok"'
          # API responds to auth
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            "$STAGING_URL/api/v1/users/nonexistent" \
            -H "Authorization: Bearer invalid_key")
          [ "$STATUS" = "401" ] || (echo "Expected 401, got $STATUS" && exit 1)
          echo "Smoke tests passed"

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production   # requires manual approval in GitHub
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}

      - uses: aws-actions/amazon-ecr-login@v2
        id: ecr

      - name: Register new task definition (production)
        id: task-def-prod
        env:
          ECR_REGISTRY: ${{ steps.ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
          COOKIE_SECRET: ${{ secrets.COOKIE_SECRET_PRODUCTION }}
        run: |
          TASK_DEF=$(aws ecs describe-task-definition --task-definition frodo-api-production \
            --query 'taskDefinition' --output json)
          NEW_TASK_DEF=$(echo "$TASK_DEF" | jq \
            --arg IMAGE "$ECR_REGISTRY/frodo:$IMAGE_TAG" \
            --arg COOKIE_SECRET "$COOKIE_SECRET" \
            '.containerDefinitions[0].image = $IMAGE |
             .containerDefinitions[0].environment += [{"name":"COOKIE_SECRET","value":$COOKIE_SECRET}] |
             del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')
          NEW_ARN=$(aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEF" \
            --query 'taskDefinition.taskDefinitionArn' --output text)
          echo "task_def_arn=$NEW_ARN" >> "$GITHUB_OUTPUT"

      - name: Deploy to ECS (production)
        run: |
          aws ecs update-service \
            --cluster frodo-production \
            --service frodo-api \
            --task-definition ${{ steps.task-def-prod.outputs.task_def_arn }}

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster frodo-production \
            --services frodo-api

      - name: Smoke test (production)
        run: |
          PROD_URL="${{ vars.PRODUCTION_URL }}"
          curl -sf "$PROD_URL/health" | jq .status | grep -q '"ok"'
          echo "Production smoke test passed"
```

### Pipeline Summary

```
PR opened → CI (lint, typecheck, test + coverage, build)
PR merged to main → CI → Deploy staging (auto) → Smoke test → Deploy production (manual approval) → Smoke test
```

- **AWS auth**: OIDC (no long-lived credentials in GitHub secrets)
- **Secrets**: Stored in GitHub Secrets, injected into ECS task definitions at deploy time
- **Image tagging**: Git SHA for traceability
- **Image reuse**: Same image validated in staging is deployed to production (same SHA tag, no rebuild)
- **Staging**: Auto-deploy on merge to main, smoke tested before production promotion
- **Production**: Requires manual approval via GitHub Environments, smoke tested after deploy
- **Rollback**: Re-run a previous successful deploy workflow, or `aws ecs update-service` to a previous task definition revision

### Branch Protection (GitHub)

Configure on `main` branch:
- **Require PR before merging** (no direct pushes)
- **Require status checks to pass**: `lint-and-typecheck`, `test`, `build`
- **Require at least 1 review approval**
- **Require branches to be up to date** before merging
- **Do not allow force pushes**

### Project Structure Addition

```
.github/
  workflows/
    ci.yml
    deploy.yml
```

---

## 13. Implementation Order

Build in this sequence — each step is independently testable:

1. **Project scaffolding** — TypeScript, Elysia, Docker, DynamoDB Local, vitest
2. **DynamoDB single-table** — client, key builders, base store helpers
3. **Crypto module** — envelope encryption with local fallback
4. **Tenant + API key management** — CRUD, key generation, auth middleware
5. **Identity resolution** — lookup table, PII matching, user creation
6. **Module store** — CRUD for user module documents (encrypted)
7. **Event store** — append events, query by user/module/field
8. **Value resolution + materialization** — resolver algorithm, replay events → module state
9. **Enrichment engine** — enricher interface, registry, orchestration, mock enrichers
10. **Session management** — create/validate/extend, cookie middleware
11. **Frodo Link access flow** — access endpoint, tier checking, verification URL generation
12. **Forms rendering** — Eta templates, HTMX, form token management
13. **Verification forms** — consent screen, identity verification, OTP flow
14. **Access audit log** — log reads, query endpoints
15. **Consent logging** — consent events, consent screen rendering
16. **First real enricher** — pick one provider (e.g., Clearbit for contact) and implement end-to-end
