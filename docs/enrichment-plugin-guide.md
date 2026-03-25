# Building Enrichment Plugins for Frodo

This guide walks through every step of integrating a new data provider into Frodo's enrichment system. By the end you will have a working enricher that fetches data from an external API, maps it into Frodo's module schema, handles errors correctly, receives real-time webhooks, and has full test coverage using recorded fixtures.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites: Source Config](#2-prerequisites-source-config)
3. [Step 1: Create the Enricher Class](#3-step-1-create-the-enricher-class)
4. [Step 2: Credentials](#4-step-2-credentials)
5. [Step 3: Data Mapping](#5-step-3-data-mapping)
6. [Step 4: OAuth Token Storage](#6-step-4-oauth-token-storage)
7. [Step 5: Webhook Handler](#7-step-5-webhook-handler)
8. [Step 6: Registration](#8-step-6-registration)
9. [Step 7: Testing](#9-step-7-testing)
10. [Error Handling Reference](#10-error-handling-reference)
11. [Provider Status Tracking](#11-provider-status-tracking)
12. [Staleness and TTLs](#12-staleness-and-ttls)
13. [Complete Example: Plaid Financial Enricher](#13-complete-example-plaid-financial-enricher)
14. [Checklist](#14-checklist)

---

## 1. Architecture Overview

When a tenant calls `POST /api/v1/users/:id/enrich/:module`, the enrichment engine:

1. Loads the user's current module data from DynamoDB (decrypted).
2. Finds all registered enrichers for that module.
3. Runs every enricher **concurrently** with a per-enricher timeout (default 30s).
4. For each successful result, builds a `DataEvent` using the enricher's `SourceConfig` (confidence scores, TTLs).
5. Appends events to the event store.
6. Rematerializes the module — the field resolver picks the best value for each field using `score = confidence * recencyWeight`.
7. Returns an `EnrichmentReport` listing successes and failures.

```
┌────────────┐     ┌──────────────┐     ┌──────────────┐
│  API Route  │────▶│  Engine      │────▶│  Your        │
│  /enrich    │     │  enrichModule│     │  Enricher    │
└────────────┘     └──────┬───────┘     └──────┬───────┘
                          │                     │
                          │ DataEvent           │ ProviderHttpClient
                          ▼                     ▼
                   ┌──────────────┐     ┌──────────────┐
                   │  Event Store │     │  Provider API │
                   │  (DynamoDB)  │     │  (Plaid, etc) │
                   └──────┬───────┘     └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Materializer│
                   │  (resolve +  │
                   │   persist)   │
                   └──────────────┘
```

### Key types

```typescript
// src/enrichment/types.ts

interface Enricher<T = Record<string, unknown>> {
  source: string;       // Must match a SourceConfig key (e.g., "plaid")
  module: string;       // Target module (e.g., "financial")
  timeoutMs?: number;   // Default 30000
  enrich(userId: string, current: Partial<T>): Promise<EnrichmentResult<T>>;
}

interface EnrichmentResult<T = Record<string, unknown>> {
  data: Partial<T>;                  // Fields to write — keys must be valid module fields
  metadata?: Record<string, unknown>; // Stored on the event, not on the module
}
```

### Modules

Frodo has 7 modules. Each module has a defined schema in `src/modules/<name>/schema.ts`:

| Module | Key fields | Typical sources |
|--------|-----------|-----------------|
| `identity` | firstName, lastName, dateOfBirth, ssn | socure, experian |
| `contact` | email, phone, socialProfiles | clearbit, fullcontact |
| `residence` | currentAddress, ownershipStatus, propertyType | melissa, attom |
| `financial` | bankAccounts, balances, incomeStreams | plaid, mx, finicity |
| `credit` | scores, openAccounts, utilization | experian, transunion, equifax |
| `buying-patterns` | spendingCategories, purchaseFrequency | plaid |
| `employment` | employer, title, startDate, salary | truework |

Your enricher targets one or more of these modules. A single provider (like Plaid) can power multiple enrichers targeting different modules.

---

## 2. Prerequisites: Source Config

Before writing any code, your provider needs an entry in `src/config/source-configs.ts`. The engine uses this to stamp every field change with a confidence score and expiry date.

```typescript
// src/config/source-configs.ts

export const sourceConfigs: Record<string, SourceConfig> = {
  // ... existing configs ...

  acme: {
    source: 'acme',           // Must match your enricher's `source` field exactly
    defaultTtl: { days: 14 }, // How long data stays fresh before going stale
    confidence: 0.85,         // Default confidence for all fields (0-1)
    fieldTtls: {              // Optional per-field TTL overrides
      balances: { days: 1 },  // Balances go stale after 1 day
      scores: { hours: 12 },
    },
    fieldConfidence: {        // Optional per-field confidence overrides
      email: 0.95,            // Email from this provider is very reliable
      phone: 0.7,             // Phone less so
    },
  },
};
```

The `Duration` type supports `days`, `hours`, and `minutes`:

```typescript
interface Duration {
  days?: number;
  hours?: number;
  minutes?: number;
}
```

**How confidence and TTL are used:**

- Each field change is stored as a `FieldChange` with a `confidence` (0-1) and a `goodBy` date (now + TTL).
- When the materializer resolves conflicts between multiple sources for the same field, it scores each: `score = confidence * recencyWeight`, where `recencyWeight` decays linearly from 1.0 at event time to 0.5 at `goodBy`.
- The highest-scoring value wins. Ties are broken by most-recent timestamp.
- After `goodBy` passes, the field change is ignored entirely — it's considered stale.

---

## 3. Step 1: Create the Enricher Class

Create your enricher in `src/providers/<provider>/` (e.g., `src/providers/acme/`).

### Option A: Using BaseEnricher (recommended)

`BaseEnricher` gives you a pre-configured HTTP client with retries, timeouts, and error normalization, plus automatic credential lookup. You implement two abstract methods and optionally override a third.

```typescript
// src/providers/acme/financial-enricher.ts

import { BaseEnricher } from '../base-enricher.js';
import { createMapper } from '../mapper.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

// Define the module shape your enricher targets
interface FinancialData {
  bankAccounts: unknown[];
  balances: Record<string, number>;
  incomeStreams: unknown[];
}

export class AcmeFinancialEnricher extends BaseEnricher<FinancialData> {
  source = 'acme';
  module = 'financial';
  timeoutMs = 15_000; // Override the default 30s timeout

  protected getBaseUrl(): string {
    return 'https://api.acme.com/v1';
  }

  // Optional: add default headers for every request (e.g., API key auth)
  protected getDefaultHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.credentials.get('API_KEY')}`,
      'Acme-Client-Id': this.credentials.get('CLIENT_ID'),
    };
  }

  protected async fetchData(
    userId: string,
    current: Partial<FinancialData>,
  ): Promise<EnrichmentResult<FinancialData>> {
    // 1. Make API call(s) using this.http
    const res = await this.http.request<AcmeAccountsResponse>('/accounts', {
      method: 'POST',
      body: { user_id: userId },
    });

    // 2. Map provider response to module schema
    const data = acmeFinancialMapper(res.data);

    // 3. Return the result
    return {
      data: data as Partial<FinancialData>,
      metadata: {
        acmeRequestId: res.headers['x-request-id'],
        responseTimeMs: res.durationMs,
      },
    };
  }
}

// Response type from the Acme API
interface AcmeAccountsResponse {
  accounts: { id: string; type: string; balance: number; institution: string }[];
  income: { streams: { amount: number; frequency: string }[] };
}

// Declarative mapper (see Step 3 for details)
const acmeFinancialMapper = createMapper({
  provider: 'acme',
  module: 'financial',
  mappings: [
    { from: 'accounts', to: 'bankAccounts' },
    {
      from: 'accounts[].balance',
      to: 'balances',
      transform: (vals) => {
        const amounts = vals as number[];
        return { total: amounts.reduce((a, b) => a + b, 0) };
      },
    },
    { from: 'income.streams', to: 'incomeStreams' },
  ],
});
```

### What BaseEnricher does for you

When `enrich()` is called, the base class:

1. **Lazily initializes** the HTTP client and credentials on first call (not in the constructor, since abstract methods aren't available yet).
2. **Creates a child logger** scoped to `{ module, source, userId }`.
3. **Wraps your `fetchData()`** call with timing, structured logging, and error normalization.
4. If `fetchData()` throws a `ProviderError`, it re-throws it as-is.
5. If `fetchData()` throws any other error, it wraps it in a `ProviderError` so the engine always sees a consistent error type.

### Option B: Implementing the Enricher interface directly

For simple providers or when you don't need the HTTP client infrastructure:

```typescript
import type { Enricher, EnrichmentResult } from '../../enrichment/types.js';

export const acmeIdentityEnricher: Enricher = {
  source: 'acme',
  module: 'identity',
  timeoutMs: 10_000,

  async enrich(userId, current) {
    // Your custom fetch logic here
    const response = await fetch(`https://api.acme.com/identity/${userId}`, {
      headers: { 'Authorization': `Bearer ${process.env.ACME_API_KEY}` },
    });
    const data = await response.json();

    return {
      data: {
        firstName: data.first_name,
        lastName: data.last_name,
      },
    };
  },
};
```

This approach is simpler but you lose automatic retries, timeout handling, credential management, and structured error types.

### Multiple modules from one provider

A single provider often feeds multiple modules. Create a separate enricher class for each module:

```
src/providers/acme/
  financial-enricher.ts   → module: 'financial'
  identity-enricher.ts    → module: 'identity'
  index.ts                → exports + registration
```

Each enricher has the same `source` but different `module` values.

---

## 4. Step 2: Credentials

The credential system reads environment variables with the convention:

```
PROVIDER_<PROVIDER>_<KEY>
```

Where `<PROVIDER>` is your `source` value uppercased, and `<KEY>` is whatever you pass to `get()` or `getOptional()`, also uppercased.

### Examples

| Your code | Environment variable |
|-----------|---------------------|
| `this.credentials.get('API_KEY')` | `PROVIDER_ACME_API_KEY` |
| `this.credentials.get('CLIENT_ID')` | `PROVIDER_ACME_CLIENT_ID` |
| `this.credentials.get('SECRET')` | `PROVIDER_ACME_SECRET` |
| `this.credentials.getOptional('WEBHOOK_SECRET')` | `PROVIDER_ACME_WEBHOOK_SECRET` |

### Methods

```typescript
interface ProviderCredentials {
  get(key: string): string;                  // Throws if missing or empty
  getOptional(key: string): string | undefined; // Returns undefined if missing or empty
}
```

- `get()` should be used for credentials that are required for the enricher to function. It throws an error with a clear message naming the missing env var.
- `getOptional()` should be used for credentials that are only needed in some configurations (e.g., a webhook signing secret that only exists in production).

### In BaseEnricher

When using `BaseEnricher`, credentials are available as `this.credentials` and are lazily initialized from `this.source`. You do not need to call `getProviderCredentials()` yourself.

### Standalone usage

```typescript
import { getProviderCredentials } from '../providers/credentials.js';

const creds = getProviderCredentials('acme');
const apiKey = creds.get('API_KEY');
```

---

## 5. Step 3: Data Mapping

Provider APIs return data in their own schema. The mapper framework lets you declaratively transform it into the Frodo module shape.

### extractPath

Extracts a value from a nested object using dot-notation. Supports three access patterns:

```typescript
import { extractPath } from '../providers/mapper.js';

const data = {
  user: { name: 'Frodo' },
  accounts: [
    { id: 'a1', balance: 1000 },
    { id: 'a2', balance: 2000 },
  ],
};

extractPath(data, 'user.name');              // 'Frodo'
extractPath(data, 'accounts[0].balance');    // 1000
extractPath(data, 'accounts[].id');          // ['a1', 'a2']
extractPath(data, 'accounts[].balance');     // [1000, 2000]
extractPath(data, 'nonexistent.path');       // undefined
```

| Syntax | Meaning |
|--------|---------|
| `foo.bar` | Navigate into nested objects |
| `items[0]` | Access a specific array index |
| `items[]` | Wildcard — collect the value from every array element, returns an array |

### createMapper

Builds a reusable mapping function from a declarative config:

```typescript
import { createMapper } from '../providers/mapper.js';

const mapper = createMapper({
  provider: 'acme',
  module: 'financial',
  mappings: [
    // Direct mapping: copy the value as-is
    { from: 'accounts', to: 'bankAccounts' },

    // Nested path
    { from: 'income.monthly_streams', to: 'incomeStreams' },

    // Wildcard + transform
    {
      from: 'accounts[].balance',
      to: 'balances',
      transform: (balances) => {
        const amounts = balances as number[];
        return {
          total: amounts.reduce((a, b) => a + b, 0),
          count: amounts.length,
        };
      },
    },

    // Index access
    { from: 'accounts[0].id', to: 'primaryAccountId' },
  ],
});

const moduleData = mapper(acmeApiResponse);
```

**Rules:**

- If `extractPath` returns `undefined` for a mapping's `from` path, that field is **skipped** (not set to `undefined`). This means a missing field in the provider response won't overwrite an existing value in the module.
- The `transform` function receives the extracted value (which may be an array if using wildcards) and must return the final value to store.
- The `to` field must be a valid field name in the target module's schema.

### When not to use the mapper

For simple providers where the response already matches the module shape, you can skip the mapper and construct the result object directly:

```typescript
return {
  data: {
    firstName: response.first_name,
    lastName: response.last_name,
  },
};
```

---

## 6. Step 4: OAuth Token Storage

If your provider uses OAuth (like Plaid's access tokens or Finicity's customer IDs), use the token store to persist per-user tokens securely.

### Storing a token

```typescript
import { storeProviderToken } from '../providers/token-store.js';

await storeProviderToken({
  userId: 'user-123',
  provider: 'plaid',
  tokenType: 'access_token',        // Arbitrary string key
  value: 'access-sandbox-abc123',    // The secret — encrypted at rest with the user's DEK
  expiresAt: '2027-01-01T00:00:00Z', // Optional — ISO date, omit if the token doesn't expire
  metadata: {                        // Optional — stored unencrypted alongside the token
    institutionId: 'ins_1',
    itemId: 'item_abc',
  },
});
```

### Retrieving a token

```typescript
import { getProviderToken } from '../providers/token-store.js';

const token = await getProviderToken('user-123', 'plaid', 'access_token');
if (!token) {
  throw new Error('User has not linked their Plaid account');
}

// Use token.value in API calls
const response = await this.http.request('/accounts/get', {
  method: 'POST',
  body: {
    access_token: token.value,
    client_id: this.credentials.get('CLIENT_ID'),
    secret: this.credentials.get('SECRET'),
  },
});
```

### Using tokens in a BaseEnricher

```typescript
import { getProviderToken } from '../token-store.js';

export class PlaidFinancialEnricher extends BaseEnricher<FinancialData> {
  source = 'plaid';
  module = 'financial';

  protected getBaseUrl() { return 'https://sandbox.plaid.com'; }

  protected async fetchData(userId: string, current: Partial<FinancialData>) {
    // Get the user's access token
    const token = await getProviderToken(userId, 'plaid', 'access_token');
    if (!token) {
      throw new Error('No Plaid access token for user');
    }

    const res = await this.http.request<PlaidAccountsResponse>('/accounts/get', {
      method: 'POST',
      body: {
        access_token: token.value,
        client_id: this.credentials.get('CLIENT_ID'),
        secret: this.credentials.get('SECRET'),
      },
    });

    return { data: plaidFinancialMapper(res.data) as Partial<FinancialData> };
  }
}
```

### Other token operations

```typescript
import {
  listProviderTokens,
  deleteProviderTokens,
} from '../providers/token-store.js';

// List all tokens for a user (across all providers)
const allTokens = await listProviderTokens('user-123');

// Delete all tokens for a specific provider
await deleteProviderTokens('user-123', 'plaid');

// Delete ALL provider tokens for a user (e.g., on account deletion)
await deleteProviderTokens('user-123');
```

### Storage details

Tokens are stored in DynamoDB with the key pattern:

- **PK:** `USER#<userId>`
- **SK:** `PROVIDERTOKEN#<provider>#<tokenType>`

The `value` field is encrypted at rest using AES-256-GCM with the user's Data Encryption Key (DEK), the same envelope encryption used for module data. The DEK itself is encrypted by KMS. Metadata, expiresAt, and other fields are **not** encrypted.

---

## 7. Step 5: Webhook Handler

If your provider sends real-time updates via webhooks (e.g., Plaid transaction updates, Finicity account changes), implement a `WebhookHandler`.

### The WebhookHandler interface

```typescript
// src/webhooks/types.ts

interface WebhookHandler {
  provider: string;   // Must match your source config key
  validate(headers: Record<string, string>, body: unknown): boolean;
  parse(body: unknown): WebhookEvent[];
}

interface WebhookEvent {
  userId: string;     // Frodo user ID (you must resolve from provider-specific ID)
  module: string;     // Target module
  fields: Record<string, unknown>;  // Field values to write
  metadata?: Record<string, unknown>;
}
```

### Implementation

```typescript
// src/providers/acme/webhook-handler.ts

import crypto from 'node:crypto';
import { getProviderCredentials } from '../credentials.js';
import type { WebhookHandler, WebhookEvent } from '../../webhooks/types.js';

// You'll need a way to resolve provider-specific IDs to Frodo user IDs.
// This is provider-specific — Plaid uses item_id, Finicity uses customerId, etc.
import { resolveUserIdFromAcmeId } from './user-resolver.js';

export const acmeWebhookHandler: WebhookHandler = {
  provider: 'acme',

  validate(headers, body): boolean {
    const signature = headers['x-acme-signature'];
    if (!signature) return false;

    const creds = getProviderCredentials('acme');
    const secret = creds.getOptional('WEBHOOK_SECRET');
    if (!secret) return false;

    // HMAC signature verification
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  },

  parse(body): WebhookEvent[] {
    const payload = body as AcmeWebhookPayload;
    const events: WebhookEvent[] = [];

    // Resolve the Frodo user ID from the provider's identifier
    // This depends on how you've stored the mapping
    const userId = resolveUserIdFromAcmeId(payload.account_id);
    if (!userId) return events;

    if (payload.type === 'balance_update') {
      events.push({
        userId,
        module: 'financial',
        fields: {
          balances: {
            checking: payload.data.checking_balance,
            savings: payload.data.savings_balance,
            total: payload.data.checking_balance + payload.data.savings_balance,
          },
        },
        metadata: {
          webhookId: payload.webhook_id,
          webhookType: payload.type,
        },
      });
    }

    if (payload.type === 'transaction_update') {
      events.push({
        userId,
        module: 'buying-patterns',
        fields: {
          // Update spending categories from new transactions
          spendingCategories: payload.data.categories,
        },
      });
    }

    return events;
  },
};

interface AcmeWebhookPayload {
  webhook_id: string;
  type: string;
  account_id: string;
  data: Record<string, unknown>;
}
```

### How webhook processing works

When `POST /webhooks/acme` is called:

1. The route looks up the handler from the registry.
2. Calls `handler.validate(headers, body)` — if this returns `false`, the request is rejected with 401.
3. Calls `handler.parse(body)` to get a list of `WebhookEvent` objects.
4. For each event:
   - Looks up the `SourceConfig` for the provider (same as enrichment).
   - Builds a `DataEvent` with field changes, confidence, and TTL from the config.
   - Appends the event to the event store.
   - Rematerializes the module.
5. Returns `{ processed: N, errors: [...] }`.

The webhook processor uses the **same event pipeline** as the enrichment engine — same confidence scores, same TTLs, same materialization. The only difference is the data comes from a push (webhook) rather than a pull (enricher).

---

## 8. Step 6: Registration

### Register the enricher

Registration tells the engine which enrichers to run for each module. Do this at application startup.

```typescript
// src/providers/acme/index.ts

import { registerEnricher } from '../../enrichment/registry.js';
import { registerWebhookHandler } from '../../webhooks/registry.js';
import { AcmeFinancialEnricher } from './financial-enricher.js';
import { AcmeIdentityEnricher } from './identity-enricher.js';
import { acmeWebhookHandler } from './webhook-handler.js';

export function registerAcmeProvider(): void {
  registerEnricher(new AcmeFinancialEnricher());
  registerEnricher(new AcmeIdentityEnricher());
  registerWebhookHandler(acmeWebhookHandler);
}
```

Then call this from `src/index.ts`:

```typescript
// src/index.ts

import { registerAcmeProvider } from './providers/acme/index.js';

registerAcmeProvider();
```

### How the registry works

The enricher registry is a `Map<string, Enricher[]>` keyed by module name:

- `registerEnricher(enricher)` — adds to the list for `enricher.module`.
- `getEnrichers('financial')` — returns all enrichers targeting the `financial` module.
- `getEnrichedModuleNames()` — returns all module names that have at least one enricher.

When `enrichModule('user-123', 'financial', ...)` is called, the engine runs **all** enrichers registered for `financial` concurrently. Multiple enrichers for the same module is normal — e.g., Plaid and Finicity both targeting `financial`.

---

## 9. Step 7: Testing

### Unit tests with the Enricher interface

The simplest way to test your enricher logic:

```typescript
// test/providers/acme/financial-enricher.test.ts

import { describe, it, expect } from 'vitest';
import { AcmeFinancialEnricher } from '../../../src/providers/acme/financial-enricher.js';

describe('AcmeFinancialEnricher', () => {
  it('maps accounts correctly', async () => {
    // Test the mapper in isolation
    // ...
  });
});
```

### Integration tests with recorded fixtures

The test-utils module lets you record real API responses and replay them in tests. This gives you realistic integration tests without hitting the real API.

#### Step 1: Record fixtures

Run your enricher against the real API (e.g., in sandbox mode) and capture the responses:

```typescript
import { ProviderHttpClient } from '../../src/providers/http-client.js';
import { createRecordingClient } from '../../src/providers/test-utils.js';

const realClient = new ProviderHttpClient({
  baseUrl: 'https://sandbox.acme.com/v1',
  defaultHeaders: { 'Authorization': 'Bearer sandbox-key' },
});

// Wrap the real client in a recording proxy
const recorder = createRecordingClient(realClient, 'test/fixtures/acme/get-accounts.json');

// Make requests — responses are saved to the fixture file
await recorder.request('/accounts', { method: 'POST', body: { user_id: 'test-user' } });
```

This creates a JSON fixture file at `test/fixtures/acme/get-accounts.json`:

```json
[
  {
    "provider": "recorded",
    "endpoint": "/accounts",
    "method": "POST",
    "requestBody": { "user_id": "test-user" },
    "status": 200,
    "responseBody": { "accounts": [...], "income": {...} },
    "headers": { "content-type": "application/json" },
    "recordedAt": "2026-03-22T12:00:00.000Z"
  }
]
```

#### Step 2: Replay in tests

```typescript
import { describe, it, expect } from 'vitest';
import { createReplayClient, createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { AcmeFinancialEnricher } from '../../../src/providers/acme/financial-enricher.js';

describe('AcmeFinancialEnricher with fixtures', () => {
  it('enriches financial data from recorded response', async () => {
    // createFixtureEnricher constructs the enricher and replaces its HTTP
    // client with a replay client that serves from the fixture file.
    const enricher = createFixtureEnricher(
      AcmeFinancialEnricher,
      'test/fixtures/acme/get-accounts.json',
    );

    const result = await enricher.enrich('test-user', {});

    expect(result.data.bankAccounts).toBeDefined();
    expect(result.data.balances).toBeDefined();
  });
});
```

#### How the replay client works

`createReplayClient(fixturePath)` returns a `ProviderHttpClient`-shaped object that:

- Reads the fixture file once.
- On each `request(path, options)`, finds the first unconsumed fixture matching `method + path`.
- Returns the recorded `status`, `responseBody`, and `headers` instantly (`durationMs: 0`).
- Throws if no matching fixture is found.
- Consumes fixtures in order, so duplicate endpoints (e.g., two calls to `/accounts`) replay in sequence.

#### Fixture file organization

```
test/fixtures/
  acme/
    get-accounts.json
    get-identity.json
  plaid/
    get-accounts.json
    get-transactions.json
  experian/
    credit-report.json
```

### Full engine integration tests

To test the complete enrichment pipeline (enricher → events → materialization):

```typescript
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { CreateTableCommand, DescribeTableCommand, ResourceNotFoundException } from '@aws-sdk/client-dynamodb';
import { dynamoClient, TABLE_NAME } from '../../../src/store/dynamo-client.js';
import { enrichModule } from '../../../src/enrichment/engine.js';
import { registerEnricher, clearEnrichers } from '../../../src/enrichment/registry.js';
import { getModule } from '../../../src/store/user-store.js';
import { getEventsForModule } from '../../../src/store/event-store.js';

// Side-effect import — registers module schemas
import '../../../src/modules/index.js';

describe('acme enrichment integration', () => {
  beforeAll(async () => {
    // Ensure the DynamoDB table exists (for local testing)
    await ensureTable();
  });

  afterEach(() => {
    clearEnrichers(); // Clean up between tests
  });

  it('enriches a user and persists the data', async () => {
    const userId = crypto.randomUUID();

    // Register your enricher (or a mock version of it)
    registerEnricher({
      source: 'acme',
      module: 'financial',
      async enrich() {
        return {
          data: {
            balances: { checking: 5000, savings: 10000, total: 15000 },
          },
        };
      },
    });

    const report = await enrichModule(userId, 'financial', 'test-actor', 'test-tenant');

    // Verify the report
    expect(report.successes).toHaveLength(1);
    expect(report.successes[0].source).toBe('acme');
    expect(report.failures).toHaveLength(0);

    // Verify events were written
    const events = await getEventsForModule(userId, 'financial');
    expect(events.events.length).toBeGreaterThanOrEqual(1);

    // Verify the module was materialized and encrypted
    const moduleData = await getModule(userId, 'financial');
    expect(moduleData).not.toBeNull();
    expect(moduleData!.balances).toEqual({ checking: 5000, savings: 10000, total: 15000 });
  });
});
```

### Running tests

```bash
# Run all tests (requires DynamoDB Local running on port 8000)
DYNAMODB_ENDPOINT=http://localhost:8000 KMS_ENDPOINT=local bun run test

# Run just your provider's tests
DYNAMODB_ENDPOINT=http://localhost:8000 KMS_ENDPOINT=local bun run test test/providers/acme/

# Run with coverage
DYNAMODB_ENDPOINT=http://localhost:8000 KMS_ENDPOINT=local bun run test:coverage
```

---

## 10. Error Handling Reference

The provider error hierarchy lets the engine and callers distinguish between different failure modes:

```
ProviderError (base)
├── ProviderAuthError        — 401/403, not retryable
├── ProviderRateLimitError   — 429, retryable
├── ProviderTimeoutError     — timeout, retryable
└── ProviderUnavailableError — 5xx, retryable
```

### Automatic error classification by ProviderHttpClient

The HTTP client classifies responses automatically:

| Status | Error thrown | Retryable |
|--------|------------|-----------|
| 200-399 | None (success) | — |
| 401, 403 | `ProviderAuthError` | No |
| 429 | `ProviderRateLimitError` | Yes |
| 400-499 (other) | `ProviderError` | No |
| 500+ | `ProviderUnavailableError` | Yes |
| Timeout | `ProviderTimeoutError` | Yes |
| Network error | `ProviderError` | Yes (retried) |

### Retry behavior

The HTTP client retries automatically on retryable errors:

- **Default retries:** 2 (so up to 3 total attempts)
- **Default delay:** 1000ms, multiplied by attempt number (linear backoff)
- **Non-retryable errors** (auth, 4xx) throw immediately without retrying

Override per-request:

```typescript
const res = await this.http.request('/accounts', {
  retries: 5,         // Up to 6 total attempts
  retryDelayMs: 500,  // 500ms, 1000ms, 1500ms, 2000ms, 2500ms
  timeoutMs: 10_000,  // 10 second timeout per attempt
});
```

### Throwing errors from your enricher

If your provider has custom error conditions, throw the appropriate error type:

```typescript
import { ProviderAuthError, ProviderError } from '../errors.js';

protected async fetchData(userId: string, current: Partial<T>) {
  const token = await getProviderToken(userId, 'acme', 'access_token');
  if (!token) {
    throw new ProviderAuthError('acme', 'No access token — user must re-link');
  }

  const res = await this.http.request('/data', {
    method: 'POST',
    body: { token: token.value },
  });

  if (!res.data || Object.keys(res.data).length === 0) {
    throw new ProviderError('acme', res.status, 'Empty response from provider', false, res.data);
  }

  return { data: this.mapResponse(res.data) };
}
```

### What happens when an enricher fails

The enrichment engine handles failures gracefully:

1. The failure is recorded as an error event (empty changes, error message in metadata).
2. The failure is added to the `EnrichmentReport.failures` array.
3. **Other enrichers for the same module are not affected** — they run concurrently and succeed or fail independently.
4. The module is still rematerialized after all enrichers complete (successful data is written even if some enrichers fail).

---

## 11. Provider Status Tracking

The `ProviderTracker` is an in-memory health monitor. It is a singleton (`providerTracker`) that should be called after every provider interaction to maintain health visibility.

### Recording outcomes

In your enricher (if not using the engine's automatic tracking):

```typescript
import { providerTracker } from '../status.js';

const start = Date.now();
try {
  const result = await this.http.request('/accounts');
  providerTracker.recordSuccess('acme', Date.now() - start);
  return result;
} catch (err) {
  providerTracker.recordFailure('acme', Date.now() - start, err.message);
  throw err;
}
```

### Health classification

The tracker uses a 5-minute sliding window:

| Error rate | Status |
|-----------|--------|
| < 30% | `healthy` |
| 30% - 79% | `degraded` |
| >= 80% | `down` |
| No calls | `unknown` |

### API endpoints

```
GET /api/v1/providers/status         → ProviderStatus[] (all providers)
GET /api/v1/providers/status/:name   → ProviderStatus (single provider)
```

Response shape:

```json
{
  "provider": "acme",
  "status": "healthy",
  "lastCallAt": "2026-03-22T12:00:00.000Z",
  "lastSuccessAt": "2026-03-22T12:00:00.000Z",
  "lastErrorAt": null,
  "lastError": null,
  "recentCalls": 42,
  "recentErrors": 1,
  "errorRate": 0.024,
  "avgLatencyMs": 230
}
```

---

## 12. Staleness and TTLs

Every field written by an enricher has a `goodBy` date computed from the source config's TTL. When that date passes, the field is considered stale.

### Staleness detection API

```
GET  /api/v1/users/:id/staleness          → StalenessReport
GET  /api/v1/users/:id/staleness/:module   → { staleFields: StaleField[] }
POST /api/v1/admin/refresh-stale           → RefreshJobResult
```

The admin refresh endpoint is intended to be called by a cron job. It scans users, logs stale fields as structured JSON (for CloudWatch metric filters), and returns a summary. **It does not auto-re-enrich.** Tenants or ops decide when to act.

### How TTLs interact with your enricher

You don't write TTL logic in your enricher. The engine computes `goodBy` automatically from your source config:

```
goodBy = now + fieldTtls[fieldName] ?? defaultTtl
```

To make data refresh more frequently, lower the TTL in your source config. To make it last longer, raise it.

Example: Plaid's `balances` field has a 1-day TTL while other financial fields default to 7 days. This means a staleness scan will flag `balances` as stale after 1 day, while `bankAccounts` stays fresh for a week.

---

## 13. Complete Example: Plaid Financial Enricher

Putting it all together. This is a realistic enricher that fetches account data from Plaid's API using per-user access tokens.

```typescript
// src/providers/plaid/financial-enricher.ts

import { BaseEnricher } from '../base-enricher.js';
import { getProviderToken } from '../token-store.js';
import { createMapper } from '../mapper.js';
import type { EnrichmentResult } from '../../enrichment/types.js';

interface FinancialData {
  bankAccounts: unknown[];
  balances: Record<string, number>;
  incomeStreams: unknown[];
}

interface PlaidAccountsResponse {
  accounts: {
    account_id: string;
    type: string;
    subtype: string;
    balances: { current: number; available: number };
    name: string;
    official_name: string;
    mask: string;
  }[];
  item: { institution_id: string };
}

const plaidFinancialMapper = createMapper({
  provider: 'plaid',
  module: 'financial',
  mappings: [
    {
      from: 'accounts',
      to: 'bankAccounts',
      transform: (accounts) =>
        (accounts as PlaidAccountsResponse['accounts']).map((a) => ({
          institution: a.official_name || a.name,
          accountType: a.subtype || a.type,
          last4: a.mask,
        })),
    },
    {
      from: 'accounts[].balances.current',
      to: 'balances',
      transform: (amounts) => {
        const vals = amounts as number[];
        return {
          total: vals.reduce((a, b) => a + b, 0),
        };
      },
    },
  ],
});

export class PlaidFinancialEnricher extends BaseEnricher<FinancialData> {
  source = 'plaid';
  module = 'financial';
  timeoutMs = 15_000;

  protected getBaseUrl(): string {
    return 'https://sandbox.plaid.com';
  }

  protected async fetchData(
    userId: string,
    _current: Partial<FinancialData>,
  ): Promise<EnrichmentResult<FinancialData>> {
    const token = await getProviderToken(userId, 'plaid', 'access_token');
    if (!token) {
      throw new Error('No Plaid access token — user must complete Plaid Link');
    }

    const res = await this.http.request<PlaidAccountsResponse>('/accounts/get', {
      method: 'POST',
      body: {
        access_token: token.value,
        client_id: this.credentials.get('CLIENT_ID'),
        secret: this.credentials.get('SECRET'),
      },
    });

    const data = plaidFinancialMapper(res.data);

    return {
      data: data as Partial<FinancialData>,
      metadata: {
        institutionId: res.data.item.institution_id,
        accountCount: res.data.accounts.length,
        responseTimeMs: res.durationMs,
      },
    };
  }
}
```

Registration:

```typescript
// src/providers/plaid/index.ts

import { registerEnricher } from '../../enrichment/registry.js';
import { registerWebhookHandler } from '../../webhooks/registry.js';
import { PlaidFinancialEnricher } from './financial-enricher.js';
import { plaidWebhookHandler } from './webhook-handler.js';

export function registerPlaidProvider(): void {
  registerEnricher(new PlaidFinancialEnricher());
  registerWebhookHandler(plaidWebhookHandler);
}
```

Source config (already exists in `src/config/source-configs.ts`):

```typescript
plaid: {
  source: 'plaid',
  defaultTtl: { days: 7 },
  confidence: 0.9,
  fieldTtls: {
    balances: { days: 1 },
    transactions: { days: 1 },
    transactionHistory: { days: 1 },
  },
},
```

Required environment variables:

```
PROVIDER_PLAID_CLIENT_ID=your-client-id
PROVIDER_PLAID_SECRET=your-secret
PROVIDER_PLAID_WEBHOOK_SECRET=your-webhook-signing-secret  # optional
```

---

## 14. Checklist

Use this checklist when building a new enrichment plugin:

- [ ] **Source config** added to `src/config/source-configs.ts` with appropriate confidence and TTLs
- [ ] **Enricher class** created extending `BaseEnricher` (or implementing `Enricher`)
  - [ ] `source` matches the source config key
  - [ ] `module` targets a valid module name
  - [ ] `getBaseUrl()` returns the provider's API base URL
  - [ ] `fetchData()` makes API calls and returns module-shaped data
  - [ ] `getDefaultHeaders()` overridden if the provider needs auth headers
- [ ] **Data mapper** created for any non-trivial response transformation
- [ ] **Credentials** documented — list all required `PROVIDER_<NAME>_*` env vars
- [ ] **Token storage** used for any per-user OAuth tokens
- [ ] **Webhook handler** implemented if the provider sends callbacks
  - [ ] `validate()` does cryptographic signature verification
  - [ ] `parse()` resolves Frodo user IDs from provider-specific IDs
- [ ] **Registration** function created and called from `src/index.ts`
- [ ] **Unit tests** for the mapper and any transform logic
- [ ] **Integration test** with recorded fixtures using `createFixtureEnricher`
- [ ] **Engine integration test** verifying events and materialization
- [ ] **All existing tests still pass**: `DYNAMODB_ENDPOINT=http://localhost:8000 KMS_ENDPOINT=local bun run test`
