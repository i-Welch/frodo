# Forms & Frodo Collect Developer Guide

## 1. Overview

**Frodo Forms** is a server-side system that renders HTML data-collection and verification UIs. It handles form definition, field validation, custom component rendering, OTP verification, identity verification, and consent flows -- all delivered as server-rendered HTML with HTMX for interactivity.

**Frodo Collect** (`FrodoCollect`) is a client-side JavaScript library that manages field registration, value storage, validation, and submission. It sends collected data to the Frodo backend, which persists it as module data and emits `DataEvent` records.

### How they relate

| Concern | Forms | Frodo Collect |
|---|---|---|
| Where it runs | Server (Elysia routes + renderer) | Browser (any page) |
| What it produces | HTML pages | JSON POST to `/forms/:token/submit` |
| UI coupling | Generates its own HTML | **UI-agnostic** -- works with any frontend |

The key insight: **Collect is UI-agnostic**. A server-rendered Frodo form, a React SPA, an embedded widget, or a third-party integration can all feed data through the same `FrodoCollect` instance. Every path produces identical `DataEvent` records in the backend.

---

## 2. Architecture

```
+---------------------+
|   Any UI            |     Could be:
|   - Frodo Form HTML |       - Server-rendered form
|   - React SPA       |       - Custom widget
|   - Embedded widget |       - Third-party integration
+----------+----------+
           |
           v
+---------------------+
|   Frodo Collect     |  Client-side JS library
|   (FrodoCollect)    |  - Registers fields
|                     |  - Stores values
|                     |  - Validates
|                     |  - Submits JSON
+----------+----------+
           |
           |  POST /forms/:token/submit
           |  { fields: [...], source: "user" }
           v
+---------------------+
|   Frodo Backend     |
|   (forms.ts routes) |
|   - Validates       |
|   - Transforms      |     +------------------+
|   - Persists module  +--->|  Module Store     |
|     data            |     |  (DynamoDB)       |
|   - Emits events     +--->+------------------+
+----------+----------+     |  Event Store      |
           |                |  (DynamoDB)       |
           v                +------------------+
+---------------------+
|   DataEvent         |
|   {                 |
|     eventId,        |
|     userId,         |
|     module,         |
|     source: {       |
|       source,       |  <-- Source attribution
|       actor,        |
|       tenantId      |
|     },              |
|     changes: [...]  |
|   }                 |
+---------------------+
```

### Form tokens

A **form token** is a one-time-use, time-limited key that binds a form definition to a specific user and tenant.

```typescript
interface FormToken {
  token: string;                          // 32-byte base64url random string
  formDefinition: FormDefinition;
  userId: string;
  tenantId: string;
  callbackUrl?: string;
  requestedModules?: string[];
  requiredTier?: VerificationTier;
  createdAt: string;                      // ISO date
  expiresAt: string | null;               // null = never expires
  otpState?: OtpState;                    // present during OTP flows
}
```

**Lifecycle:**

1. A tenant creates a form token via `POST /forms` (authenticated with API key).
2. The token is stored in DynamoDB with an optional TTL (default: 1 hour).
3. The user opens `/forms/:token` in a browser -- this renders the form.
4. On submission, the backend validates, persists data, emits events, then **deletes the token**.
5. If the token expires before use, DynamoDB TTL garbage-collects it. The application also checks expiry on read.

**Expiry rules:**

| `expiresIn` value | Behavior |
|---|---|
| `undefined` (omitted) | Default 1 hour |
| `{ hours: 2 }` | 2 hours from creation |
| `null` | Never expires |

### Data flow into DataEvents

When a form is submitted, the backend:

1. Groups submitted fields by module.
2. Reads existing module data for the user (to capture `previousValue`).
3. Merges new data into the module store via `putModule`.
4. Creates a `DataEvent` per module with `FieldChange` entries for each updated field.

```typescript
// The DataEvent created on submission
const event: DataEvent = {
  eventId: crypto.randomUUID(),
  userId: formToken.userId,
  module: moduleName,                     // e.g. "identity", "contact"
  source: {
    source: collectSource ?? 'user',      // from Collect's source option
    actor: `form:${formToken.formDefinition.formId}`,
    tenantId: formToken.tenantId,
  },
  changes: [
    {
      field: 'email',
      previousValue: 'old@example.com',
      newValue: 'new@example.com',
      confidence: 1.0,
      goodBy: '2027-03-22T00:00:00.000Z',  // 1 year from now
    },
  ],
  timestamp: new Date().toISOString(),
};
```

### Source attribution

The `source` field on a `DataEvent` traces where data came from. Source configs (`src/config/source-configs.ts`) define default confidence and TTL per source:

```typescript
// Example source configs
sourceConfigs['user'] = {
  source: 'user',
  defaultTtl: { days: 365 },
  confidence: 0.6,
  fieldConfidence: {
    firstName: 0.95,    // User-provided names are high confidence
    lastName: 0.95,
    email: 0.95,
    phone: 0.9,
    income: 0.5,        // Self-reported income is low confidence
  },
};

sourceConfigs['plaid'] = {
  source: 'plaid',
  defaultTtl: { days: 7 },
  confidence: 0.9,
  fieldTtls: {
    balances: { days: 1 },      // Financial data goes stale fast
    transactions: { days: 1 },
  },
};
```

When Frodo Collect submits with `source: 'plaid'`, the backend uses the Plaid source config to set appropriate confidence and TTL on the resulting events.

---

## 3. Standard Form Fields

The forms system ships with 11 built-in input types:

| `inputType` | HTML element | Notes |
|---|---|---|
| `text` | `<input type="text">` | Default fallback for unknown types |
| `number` | `<input type="number">` | `inputmode="numeric"` |
| `email` | `<input type="email">` | |
| `phone` | `<input type="tel">` | `inputmode="tel"` |
| `date` | `<input type="date">` | |
| `ssn` | `<input type="password">` | Masked, `maxlength="9"`, `pattern="\d{9}"`, `autocomplete="off"` |
| `select` | `<select>` | Requires `options` array |
| `radio` | `<input type="radio">` group | Requires `options` array |
| `checkbox` | `<input type="checkbox">` | Single checkbox, value = `"true"` |
| `textarea` | `<textarea>` | |
| `currency` | `<input type="number">` | `step="0.01"`, `min="0"`, `inputmode="decimal"` |

### Defining a FormDefinition

```typescript
import type { FormDefinition } from '../forms/types.js';

const myForm: FormDefinition = {
  formId: 'onboarding-basic',
  title: 'Basic Information',
  type: 'data_collection',
  fields: [
    {
      module: 'identity',
      field: 'firstName',
      label: 'First Name',
      inputType: 'text',
      required: true,
      minLength: 1,
      maxLength: 100,
    },
    {
      module: 'identity',
      field: 'lastName',
      label: 'Last Name',
      inputType: 'text',
      required: true,
    },
    {
      module: 'contact',
      field: 'email',
      label: 'Email Address',
      inputType: 'email',
      required: true,
    },
    {
      module: 'contact',
      field: 'phone',
      label: 'Phone Number',
      inputType: 'phone',
      pattern: '\\+?\\d{10,15}',
    },
    {
      module: 'financial',
      field: 'annualIncome',
      label: 'Annual Income',
      inputType: 'currency',
    },
    {
      module: 'employment',
      field: 'employmentStatus',
      label: 'Employment Status',
      inputType: 'select',
      required: true,
      options: [
        { label: 'Full-Time', value: 'full-time' },
        { label: 'Part-Time', value: 'part-time' },
        { label: 'Self-Employed', value: 'self-employed' },
        { label: 'Unemployed', value: 'unemployed' },
        { label: 'Retired', value: 'retired' },
      ],
    },
  ],
  expiresIn: { hours: 2 },
};
```

### Creating a form via API

```bash
curl -X POST https://your-frodo-instance/forms \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_abc123",
    "callbackUrl": "https://yourapp.com/onboarding/complete",
    "formDefinition": {
      "formId": "onboarding-basic",
      "title": "Basic Information",
      "type": "data_collection",
      "fields": [
        {
          "module": "identity",
          "field": "firstName",
          "label": "First Name",
          "inputType": "text",
          "required": true
        },
        {
          "module": "identity",
          "field": "lastName",
          "label": "Last Name",
          "inputType": "text",
          "required": true
        },
        {
          "module": "contact",
          "field": "email",
          "label": "Email Address",
          "inputType": "email",
          "required": true
        }
      ]
    }
  }'
```

**Response:**

```json
{
  "token": "aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234",
  "url": "/forms/aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234"
}
```

Send the user to that URL. They fill in the form, submit, and the data flows into the event system.

---

## 4. Custom Field Components

When the 11 standard types are not enough, you can register **custom field components**. A custom component controls its own HTML rendering, validation, and value transformation.

### The CustomFieldComponent interface

```typescript
interface CustomFieldComponent {
  /** Unique name -- used as inputType in FormField */
  name: string;

  /** Human-readable description */
  description: string;

  /**
   * Return an HTML string for this field.
   * Use HTMX attributes for interactivity.
   */
  render(field: FormField, formToken: string): string;

  /**
   * Validate the submitted value.
   * Return null if valid, or an error message string.
   */
  validate(value: unknown, field: FormField): string | null;

  /**
   * Optional: transform the raw submitted value before storage.
   * Example: normalize an address, convert strings to numbers, etc.
   */
  transformValue?(value: unknown, field: FormField): unknown;
}
```

### How custom components integrate with forms

When the renderer encounters a field whose `inputType` is not in the standard set, it looks up the custom component registry:

```typescript
// Inside renderer.ts
if (isCustomComponent(field.inputType)) {
  const component = getComponent(field.inputType)!;
  return component.render(field, formToken.token);
}
return renderStandardField(field);
```

On submission, the backend:

1. Calls `component.validate(value, field)` -- rejects if it returns an error.
2. Calls `component.transformValue(value, field)` -- stores the transformed result.

### Walk-through: the built-in address component

File: `src/forms/components/address.ts`

```typescript
export const addressComponent: CustomFieldComponent = {
  name: 'address',
  description: 'Structured address input with autocomplete support (SmartyStreets ready)',

  render(field, formToken) {
    const req = field.required ? ' required' : '';
    return `
      <fieldset>
        <legend>${field.label}</legend>
        <label>Street<input type="text" name="${field.field}.street"${req} /></label>
        <label>City<input type="text" name="${field.field}.city"${req} /></label>
        <label>State<input type="text" name="${field.field}.state" maxlength="2"${req} /></label>
        <label>ZIP<input type="text" name="${field.field}.zip" pattern="\\d{5}"${req} /></label>
      </fieldset>
    `;
  },

  validate(value, field) {
    if (typeof value !== 'object' || value === null) return 'Address must be an object';
    const addr = value as Record<string, unknown>;
    if (!addr.street) return 'Street is required';
    if (!addr.city) return 'City is required';
    if (!addr.state) return 'State is required';
    if (!addr.zip) return 'ZIP code is required';
    return null;
  },

  transformValue(value) {
    return value;   // Pass through. A real integration would standardize here.
  },
};
```

Key patterns:
- The `render` method uses **sub-field names** like `currentAddress.street`, `currentAddress.city`. The backend's `assembleSubFields` helper re-assembles these into a single object `{ street, city, state, zip }` before validation.
- `validate` receives the assembled object and checks each sub-field.
- `transformValue` is the hook where you would call an external API (e.g., SmartyStreets) to standardize the address.

### Full example: SmartyStreets address autocomplete component

```typescript
// src/forms/components/smarty-address.ts
import type { CustomFieldComponent, FormField } from '../types.js';

interface SmartyConfig {
  apiKey: string;
  maxSuggestions?: number;
}

export const smartyAddressComponent: CustomFieldComponent = {
  name: 'smarty-address',
  description: 'SmartyStreets-powered address autocomplete with USPS standardization',

  render(field: FormField, formToken: string): string {
    // Read config from componentConfig on the FormField
    const config = (field.componentConfig ?? {}) as SmartyConfig;
    const maxSuggestions = config.maxSuggestions ?? 5;
    const req = field.required ? ' required' : '';

    return `
      <fieldset data-smarty-address>
        <legend>${field.label}</legend>

        <!-- Autocomplete input — fires HTMX request on keyup -->
        <label>Street Address
          <input
            type="text"
            name="${field.field}.street"
            autocomplete="off"
            hx-get="/forms/${formToken}/autocomplete?field=${field.field}&max=${maxSuggestions}"
            hx-trigger="keyup changed delay:300ms"
            hx-target="#${field.field}-suggestions"
            hx-swap="innerHTML"
            ${req}
          />
        </label>

        <!-- Suggestions dropdown (populated by HTMX) -->
        <div id="${field.field}-suggestions" role="listbox"></div>

        <label>City<input type="text" name="${field.field}.city"${req} /></label>
        <label>State<input type="text" name="${field.field}.state" maxlength="2"${req} /></label>
        <label>ZIP<input type="text" name="${field.field}.zip" pattern="\\d{5}(-\\d{4})?"${req} /></label>
      </fieldset>
    `;
  },

  validate(value: unknown, field: FormField): string | null {
    if (typeof value !== 'object' || value === null) return 'Address must be an object';
    const addr = value as Record<string, unknown>;
    if (!addr.street) return 'Street is required';
    if (!addr.city) return 'City is required';
    if (!addr.state || String(addr.state).length !== 2) return 'State must be a 2-letter code';
    if (!addr.zip || !/^\d{5}(-\d{4})?$/.test(String(addr.zip))) return 'Invalid ZIP code';
    return null;
  },

  transformValue(value: unknown, field: FormField): unknown {
    // In a real implementation, you would call the SmartyStreets
    // US Street Address API here to standardize and verify:
    //
    //   const response = await smartyClient.verify({
    //     street: addr.street,
    //     city: addr.city,
    //     state: addr.state,
    //     zipCode: addr.zip,
    //   });
    //
    //   return {
    //     street: response.deliveryLine1,
    //     city: response.components.cityName,
    //     state: response.components.state,
    //     zip: response.components.zipCode + '-' + response.components.plus4Code,
    //     dpvMatchCode: response.analysis.dpvMatchCode,
    //     latitude: response.metadata.latitude,
    //     longitude: response.metadata.longitude,
    //   };

    return value;
  },
};
```

**Using it in a form definition:**

```typescript
const form: FormDefinition = {
  formId: 'address-collection',
  title: 'Your Address',
  type: 'data_collection',
  fields: [
    {
      module: 'residence',
      field: 'currentAddress',
      label: 'Current Address',
      inputType: 'smarty-address',           // <-- custom component name
      required: true,
      componentConfig: {                     // <-- passed to render()
        apiKey: 'your-smarty-embedded-key',
        maxSuggestions: 8,
      },
    },
  ],
};
```

### Full example: bank account selector component (Plaid Link style)

```typescript
// src/forms/components/bank-account-selector.ts
import type { CustomFieldComponent, FormField } from '../types.js';

interface PlaidConfig {
  environment: 'sandbox' | 'development' | 'production';
  products: string[];
}

export const bankAccountSelectorComponent: CustomFieldComponent = {
  name: 'bank-account-selector',
  description: 'Plaid Link-powered bank account selector',

  render(field: FormField, formToken: string): string {
    const config = (field.componentConfig ?? {}) as PlaidConfig;
    const env = config.environment ?? 'sandbox';
    const products = JSON.stringify(config.products ?? ['auth', 'transactions']);

    return `
      <div data-bank-selector>
        <label>${field.label}</label>

        <!-- Hidden inputs to hold selected account data -->
        <input type="hidden" name="${field.field}.institutionId" />
        <input type="hidden" name="${field.field}.institutionName" />
        <input type="hidden" name="${field.field}.accountId" />
        <input type="hidden" name="${field.field}.accountType" />
        <input type="hidden" name="${field.field}.accountMask" />
        <input type="hidden" name="${field.field}.accessToken" />

        <!-- Display selected account or prompt -->
        <div id="${field.field}-display">
          <p>No account linked yet.</p>
        </div>

        <button type="button" id="${field.field}-link-btn">
          Link Bank Account
        </button>

        <script>
          (function() {
            var btn = document.getElementById('${field.field}-link-btn');
            var display = document.getElementById('${field.field}-display');

            btn.addEventListener('click', function() {
              // In a real implementation, you would:
              // 1. Fetch a link_token from your backend
              // 2. Initialize Plaid Link with the link_token
              // 3. On success, populate the hidden fields
              //
              // Example with Plaid Link:
              //
              //   fetch('/api/plaid/link-token', { method: 'POST' })
              //     .then(r => r.json())
              //     .then(function(data) {
              //       var handler = Plaid.create({
              //         token: data.linkToken,
              //         env: '${env}',
              //         product: ${products},
              //         onSuccess: function(publicToken, metadata) {
              //           var account = metadata.accounts[0];
              //           var inst = metadata.institution;
              //           setHidden('institutionId', inst.institution_id);
              //           setHidden('institutionName', inst.name);
              //           setHidden('accountId', account.id);
              //           setHidden('accountType', account.type);
              //           setHidden('accountMask', account.mask);
              //           setHidden('accessToken', publicToken);
              //           display.innerHTML =
              //             '<p>' + inst.name + ' ****' + account.mask + '</p>';
              //         },
              //       });
              //       handler.open();
              //     });

              // Simulated for demonstration:
              var fields = document.querySelectorAll(
                'input[name^="${field.field}."]'
              );
              var mockData = {
                institutionId: 'ins_1',
                institutionName: 'Chase',
                accountId: 'acct_001',
                accountType: 'checking',
                accountMask: '4567',
                accessToken: 'mock-public-token',
              };
              fields.forEach(function(input) {
                var sub = input.name.split('.').pop();
                if (mockData[sub]) input.value = mockData[sub];
              });
              display.innerHTML = '<p>Chase ****4567 (checking)</p>';
            });

            function setHidden(sub, val) {
              var el = document.querySelector(
                'input[name="${field.field}.' + sub + '"]'
              );
              if (el) el.value = val;
            }
          })();
        </script>
      </div>
    `;
  },

  validate(value: unknown, field: FormField): string | null {
    if (typeof value !== 'object' || value === null) {
      return 'Please link a bank account';
    }
    const acct = value as Record<string, unknown>;
    if (!acct.institutionId) return 'Institution is required';
    if (!acct.accountId) return 'Account selection is required';
    if (!acct.accessToken) return 'Bank link token is missing';
    return null;
  },

  transformValue(value: unknown, field: FormField): unknown {
    // In production, you would exchange the public token for an access token
    // on the server side and strip it from the stored value:
    //
    //   const { accessToken } = value;
    //   const exchangeResult = await plaidClient.exchangePublicToken(accessToken);
    //   return {
    //     ...value,
    //     accessToken: undefined,   // don't persist the raw token
    //     plaidItemId: exchangeResult.item_id,
    //   };

    return value;
  },
};
```

**Using it in a form definition:**

```typescript
const form: FormDefinition = {
  formId: 'bank-link',
  title: 'Link Your Bank Account',
  type: 'data_collection',
  fields: [
    {
      module: 'financial',
      field: 'primaryAccount',
      label: 'Primary Bank Account',
      inputType: 'bank-account-selector',
      required: true,
      componentConfig: {
        environment: 'sandbox',
        products: ['auth', 'transactions'],
      },
    },
  ],
};
```

### How to register components

Custom components must be registered at startup, before any forms are rendered.

```typescript
// src/forms/components/index.ts
import { registerComponent } from './registry.js';
import { addressComponent } from './address.js';
import { smartyAddressComponent } from './smarty-address.js';
import { bankAccountSelectorComponent } from './bank-account-selector.js';

export function registerBuiltinComponents(): void {
  registerComponent(addressComponent);
  registerComponent(smartyAddressComponent);
  registerComponent(bankAccountSelectorComponent);
}
```

The registry API:

```typescript
import { registerComponent, getComponent, isCustomComponent, unregisterComponent }
  from '../forms/components/registry.js';

// Register
registerComponent(myComponent);

// Check
isCustomComponent('smarty-address');  // true
isStandardType('text');               // true

// Retrieve
const component = getComponent('smarty-address');

// Remove (useful in tests)
unregisterComponent('smarty-address');
```

---

## 5. Using Frodo Collect (Client-Side Library)

Source: `src/collect/frodo-collect.ts`

Frodo Collect is a standalone class with no framework dependencies. It works in any browser environment.

### Getting started

**Via script tag** (server-rendered forms do this automatically):

```html
<script src="/frodo-collect.js"></script>
<script>
  var collect = new FrodoCollect({
    token: 'YOUR_FORM_TOKEN',
    source: 'user',
  });
</script>
```

**Via ES module import:**

```typescript
import { FrodoCollect } from './collect/frodo-collect.js';

const collect = new FrodoCollect({
  token: 'YOUR_FORM_TOKEN',
  source: 'user',
});
```

### Initialization options

```typescript
interface CollectOptions {
  /** Form token for this session (required) */
  token: string;

  /** Frodo forms API base URL (default: '/forms') */
  endpoint?: string;

  /** Event source attribution (default: 'user') */
  source?: string;
}
```

The `source` value flows through to the `DataEvent.source.source` field and determines which `SourceConfig` is used for confidence and TTL.

### Field registration

Fields must be registered before submission so Collect knows what to validate and include.

```typescript
// Single field
collect.addField({
  module: 'identity',
  field: 'firstName',
  required: true,
});

// Multiple fields at once
collect.addFields([
  { module: 'identity', field: 'firstName', required: true },
  { module: 'identity', field: 'lastName', required: true },
  { module: 'contact',  field: 'email',     required: true },
  { module: 'contact',  field: 'phone' },
]);

// Chaining (all mutating methods return `this`)
collect
  .addField({ module: 'identity', field: 'firstName', required: true })
  .addField({ module: 'identity', field: 'lastName', required: true })
  .addField({ module: 'contact',  field: 'email', required: true });
```

### CollectField interface

```typescript
interface CollectField {
  module: string;             // Target module (e.g. "identity", "contact")
  field: string;              // Field name within that module
  required?: boolean;         // If true, submit fails when value is empty/undefined
  validate?: (value: unknown) => string | null;   // Custom client-side validator
  transform?: (value: unknown) => unknown;         // Transform before submission
}
```

### Value management

```typescript
// Set a value
collect.setValue('identity', 'firstName', 'Jane');
collect.setValue('identity', 'lastName', 'Doe');
collect.setValue('financial', 'annualIncome', 85000);

// Get a single value
const name = collect.getValue('identity', 'firstName');  // 'Jane'

// Get all values grouped by module
const all = collect.getValues();
// {
//   identity: { firstName: 'Jane', lastName: 'Doe' },
//   financial: { annualIncome: 85000 }
// }

// Clear a specific field
collect.clearValue('financial', 'annualIncome');

// Clear everything
collect.clearAll();
```

Every `setValue` call emits a `change` event:

```typescript
collect.on('change', (module, field, value) => {
  console.log(`${module}.${field} changed to`, value);
});
```

### Validation

```typescript
// Register a field with a custom validator
collect.addField({
  module: 'contact',
  field: 'email',
  required: true,
  validate: (value) => {
    if (typeof value !== 'string') return 'Email must be a string';
    if (!value.includes('@')) return 'Invalid email address';
    return null;  // null = valid
  },
});

// Run validation manually
const errors = collect.validate();
// errors = {} if valid
// errors = { 'contact.email': 'Invalid email address' } if invalid
```

Validation is also run automatically before `submit()`. If any field fails, `submit()` returns `{ success: false, errors }` without making a network request.

### Value transforms

Transforms run after validation, right before building the submission payload.

```typescript
collect.addField({
  module: 'identity',
  field: 'ssn',
  required: true,
  transform: (value) => {
    // Strip dashes: "123-45-6789" -> "123456789"
    return String(value).replace(/-/g, '');
  },
});

collect.addField({
  module: 'financial',
  field: 'annualIncome',
  transform: (value) => {
    // Ensure numeric
    return typeof value === 'string' ? parseFloat(value) : value;
  },
});
```

### Submission

```typescript
const result = await collect.submit();

if (result.success) {
  console.log('Events created:', result.eventsCreated);

  if (result.redirectUrl) {
    window.location.href = result.redirectUrl;
  }
} else {
  console.error('Errors:', result.errors);
  // result.errors = { 'identity.firstName': 'firstName is required', ... }
}
```

**What `submit()` does internally:**

1. Calls `validate()` -- returns early with errors if any field fails.
2. Builds a payload: `{ fields: [{ module, field, value }], source }`.
3. POSTs to `${endpoint}/${token}/submit` as JSON.
4. Returns a `CollectSubmitResult`.

```typescript
interface CollectSubmitResult {
  success: boolean;
  eventsCreated?: number;
  errors?: Record<string, string>;
  redirectUrl?: string;
}
```

### Event listeners

```typescript
// 'change' — fired on every setValue/clearValue
collect.on('change', (module, field, value) => {
  console.log(`${module}.${field} =`, value);
});

// 'submit' — fired on successful submission
collect.on('submit', (result) => {
  console.log('Submitted!', result);
});

// 'error' — fired on validation failure or submission error
collect.on('error', (errors) => {
  console.error('Errors:', errors);
});

// Remove a listener
const handler = (module, field, value) => { /* ... */ };
collect.on('change', handler);
collect.off('change', handler);
```

### DOM form binding

`bindForm` attaches to an HTML form's `submit` event, extracts values from `FormData`, maps them to registered fields, and calls `submit()`.

```html
<form id="my-form">
  <input type="text" name="firstName" />
  <input type="text" name="lastName" />
  <input type="email" name="email" />
  <button type="submit">Submit</button>
</form>

<script>
  var collect = new FrodoCollect({ token: 'TOKEN', source: 'user' });
  collect.addFields([
    { module: 'identity', field: 'firstName', required: true },
    { module: 'identity', field: 'lastName', required: true },
    { module: 'contact',  field: 'email', required: true },
  ]);

  // Bind to the form — handles submit, extracts values, calls collect.submit()
  collect.bindForm(document.getElementById('my-form'));

  // Optional: listen for results
  collect.on('submit', function(result) {
    alert('Saved! Events created: ' + result.eventsCreated);
  });
  collect.on('error', function(errors) {
    alert('Errors: ' + JSON.stringify(errors));
  });
</script>
```

`bindForm` looks for form inputs by two strategies:
1. `name="${field}"` (e.g., `name="firstName"`)
2. `name="${module}.${field}"` (e.g., `name="identity.firstName"`)

### Grouping fields by module

Frodo Collect naturally groups fields by module. This is important because the backend creates one `DataEvent` per module. You do not need to do anything special -- just set the `module` property on each field:

```typescript
collect.addFields([
  // These produce one DataEvent for "identity"
  { module: 'identity', field: 'firstName', required: true },
  { module: 'identity', field: 'lastName', required: true },

  // These produce one DataEvent for "contact"
  { module: 'contact', field: 'email', required: true },
  { module: 'contact', field: 'phone' },

  // This produces one DataEvent for "employment"
  { module: 'employment', field: 'employer', required: true },
]);

// On submit: 3 DataEvents created (one per module with data)
```

---

## 6. Building Custom Experiences

Because Frodo Collect is UI-agnostic, you can build any frontend and still produce consistent `DataEvent` records.

### Example 1: Multi-step onboarding wizard

A three-step wizard where a single `FrodoCollect` instance manages data across all steps. The user can go back and forth; values persist in memory until final submission.

```html
<!DOCTYPE html>
<html>
<head><title>Onboarding</title></head>
<body>
  <!-- Step 1: Personal Info -->
  <div id="step-1" class="step">
    <h2>Step 1: Personal Info</h2>
    <label>First Name <input type="text" id="firstName" /></label>
    <label>Last Name <input type="text" id="lastName" /></label>
    <label>Date of Birth <input type="date" id="dob" /></label>
    <button onclick="goToStep(2)">Next</button>
  </div>

  <!-- Step 2: Address -->
  <div id="step-2" class="step" style="display:none">
    <h2>Step 2: Address</h2>
    <label>Street <input type="text" id="street" /></label>
    <label>City <input type="text" id="city" /></label>
    <label>State <input type="text" id="state" maxlength="2" /></label>
    <label>ZIP <input type="text" id="zip" /></label>
    <button onclick="goToStep(1)">Back</button>
    <button onclick="goToStep(3)">Next</button>
  </div>

  <!-- Step 3: Employment -->
  <div id="step-3" class="step" style="display:none">
    <h2>Step 3: Employment</h2>
    <label>Employer <input type="text" id="employer" /></label>
    <label>Title <input type="text" id="title" /></label>
    <label>Annual Salary <input type="number" id="salary" /></label>
    <button onclick="goToStep(2)">Back</button>
    <button onclick="submitAll()">Submit</button>
  </div>

  <div id="result"></div>

  <script src="/frodo-collect.js"></script>
  <script>
    var collect = new FrodoCollect({
      token: 'ONBOARDING_FORM_TOKEN',
      source: 'user',
    });

    // Register all fields across all steps upfront
    collect.addFields([
      // Step 1
      { module: 'identity', field: 'firstName', required: true },
      { module: 'identity', field: 'lastName', required: true },
      { module: 'identity', field: 'dateOfBirth' },
      // Step 2
      { module: 'residence', field: 'currentAddress', required: true,
        transform: function(v) { return v; }  // already an object
      },
      // Step 3
      { module: 'employment', field: 'employer', required: true },
      { module: 'employment', field: 'title' },
      { module: 'employment', field: 'salary',
        transform: function(v) { return Number(v); }
      },
    ]);

    function captureStep1() {
      collect.setValue('identity', 'firstName', document.getElementById('firstName').value);
      collect.setValue('identity', 'lastName', document.getElementById('lastName').value);
      collect.setValue('identity', 'dateOfBirth', document.getElementById('dob').value);
    }

    function captureStep2() {
      collect.setValue('residence', 'currentAddress', {
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
      });
    }

    function captureStep3() {
      collect.setValue('employment', 'employer', document.getElementById('employer').value);
      collect.setValue('employment', 'title', document.getElementById('title').value);
      collect.setValue('employment', 'salary', document.getElementById('salary').value);
    }

    function goToStep(step) {
      // Capture current step values before navigating
      captureStep1();
      captureStep2();
      captureStep3();

      document.querySelectorAll('.step').forEach(function(el) {
        el.style.display = 'none';
      });
      document.getElementById('step-' + step).style.display = 'block';
    }

    async function submitAll() {
      captureStep3();

      var result = await collect.submit();
      var el = document.getElementById('result');

      if (result.success) {
        el.innerHTML = '<p>Onboarding complete! ' + result.eventsCreated + ' events created.</p>';
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
      } else {
        el.innerHTML = '<p style="color:red">Errors: ' + JSON.stringify(result.errors) + '</p>';
      }
    }
  </script>
</body>
</html>
```

This single `submit()` call creates up to three `DataEvent` records (one each for `identity`, `residence`, `employment`) -- exactly the same as if the user had filled in a single server-rendered Frodo form.

### Example 2: Embeddable single-field widget

A minimal widget that collects one piece of data (like annual income) and can be embedded in any page via an iframe or a script tag.

```html
<!-- income-widget.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; margin: 16px; }
    .widget { max-width: 320px; padding: 16px; border: 1px solid #ddd; border-radius: 8px; }
    input { width: 100%; padding: 8px; margin: 8px 0; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .error { color: red; font-size: 0.85em; }
    .success { color: green; }
  </style>
</head>
<body>
  <div class="widget">
    <h3>Verify Your Income</h3>
    <label>Annual Income ($)
      <input type="number" id="income" step="0.01" min="0" placeholder="75000.00" />
    </label>
    <div id="message"></div>
    <button onclick="submitIncome()">Submit</button>
  </div>

  <script src="/frodo-collect.js"></script>
  <script>
    // Token is passed via query param: income-widget.html?token=XYZ
    var params = new URLSearchParams(window.location.search);
    var token = params.get('token');

    var collect = new FrodoCollect({ token: token, source: 'user' });
    collect.addField({
      module: 'financial',
      field: 'annualIncome',
      required: true,
      validate: function(value) {
        var num = Number(value);
        if (isNaN(num) || num < 0) return 'Income must be a positive number';
        if (num > 10000000) return 'Please enter a realistic income';
        return null;
      },
      transform: function(value) {
        return Number(value);
      },
    });

    async function submitIncome() {
      var msg = document.getElementById('message');
      var value = document.getElementById('income').value;
      collect.setValue('financial', 'annualIncome', value);

      var result = await collect.submit();
      if (result.success) {
        msg.className = 'success';
        msg.textContent = 'Income submitted successfully.';
        // Notify parent window if embedded in an iframe
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'frodo-income-submitted', success: true }, '*');
        }
      } else {
        msg.className = 'error';
        var firstError = Object.values(result.errors)[0];
        msg.textContent = firstError;
      }
    }
  </script>
</body>
</html>
```

**Embedding it:**

```html
<!-- On the host page -->
<iframe
  src="/income-widget.html?token=FORM_TOKEN_HERE"
  width="360" height="250"
  style="border: none;"
></iframe>
```

### Example 3: Integrating Plaid Link through Collect

A page that opens Plaid Link and feeds the resulting bank data back through Frodo Collect.

```html
<!DOCTYPE html>
<html>
<head><title>Link Your Bank</title></head>
<body>
  <h1>Link Your Bank Account</h1>
  <p>Click below to securely connect your bank.</p>
  <button id="link-btn">Connect Bank</button>
  <div id="status"></div>

  <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
  <script src="/frodo-collect.js"></script>
  <script>
    var collect = new FrodoCollect({
      token: 'BANK_LINK_FORM_TOKEN',
      source: 'plaid',     // <-- Source attribution: data comes from Plaid
    });

    collect.addFields([
      { module: 'financial', field: 'bankAccounts' },
      { module: 'financial', field: 'institutionId' },
      { module: 'financial', field: 'institutionName' },
      { module: 'financial', field: 'publicToken' },
    ]);

    // Fetch link token from your server
    fetch('/api/plaid/link-token', { method: 'POST' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var handler = Plaid.create({
          token: data.linkToken,
          onSuccess: function(publicToken, metadata) {
            var accounts = metadata.accounts.map(function(a) {
              return { id: a.id, name: a.name, type: a.type, mask: a.mask };
            });

            collect.setValue('financial', 'bankAccounts', accounts);
            collect.setValue('financial', 'institutionId', metadata.institution.institution_id);
            collect.setValue('financial', 'institutionName', metadata.institution.name);
            collect.setValue('financial', 'publicToken', publicToken);

            collect.submit().then(function(result) {
              var el = document.getElementById('status');
              if (result.success) {
                el.textContent = 'Bank linked! ' + accounts.length + ' account(s) connected.';
                if (result.redirectUrl) window.location.href = result.redirectUrl;
              } else {
                el.textContent = 'Error: ' + JSON.stringify(result.errors);
              }
            });
          },
          onExit: function(err) {
            if (err) document.getElementById('status').textContent = 'Link cancelled.';
          },
        });

        document.getElementById('link-btn').addEventListener('click', function() {
          handler.open();
        });
      });
  </script>
</body>
</html>
```

Notice `source: 'plaid'` -- this means the resulting `DataEvent` will have `source.source = 'plaid'`, and the backend will use the Plaid source config (confidence 0.9, TTL 7 days, balance TTL 1 day).

### All paths produce the same DataEvents

Whether data comes from a server-rendered Frodo form, a multi-step wizard, a minimal widget, or a Plaid Link integration, the backend produces identical `DataEvent` structures:

```typescript
{
  eventId: "...",
  userId: "user_abc123",
  module: "financial",
  source: {
    source: "plaid",                    // determined by Collect's source option
    actor: "form:bank-link",            // form ID
    tenantId: "tenant_xyz",             // from the form token
  },
  changes: [
    {
      field: "bankAccounts",
      previousValue: null,
      newValue: [{ id: "acct_1", name: "Checking", type: "checking", mask: "4567" }],
      confidence: 1.0,
      goodBy: "2027-03-22T..."
    }
  ],
  timestamp: "2026-03-22T..."
}
```

---

## 7. Verification Flows

Frodo supports three form types, each with a different verification flow:

| `type` | Purpose | Verification tier on success |
|---|---|---|
| `data_collection` | Collect user-provided data | None (no verification) |
| `otp_verification` | Verify via one-time passcode | `BasicOTP` (1) or `EnhancedOTP` (2) |
| `identity_verification` | Verify via PII matching | `Identity` (3) |

```typescript
enum VerificationTier {
  None = 0,
  BasicOTP = 1,        // Single channel (email OR phone)
  EnhancedOTP = 2,     // Both channels (email AND phone)
  Identity = 3,        // PII match (firstName + lastName + SSN)
}
```

### Identity verification forms

**Flow:**

1. Tenant creates a form with `type: 'identity_verification'`.
2. User opens the form URL -- sees a **consent screen** first.
3. User accepts consent -- sees the identity verification form (firstName, lastName, SSN fields).
4. User submits -- backend calls `verifyIdentity()`, which compares submitted values against stored data:
   - `firstName` and `lastName` compared case-insensitively.
   - `ssn` compared exactly (digits only).
   - Returns boolean only (does not reveal which field failed).
5. On success: a **session** is created at `VerificationTier.Identity` (3), the form token is deleted, and the user is redirected to the callback URL with `?sessionId=...`.

```typescript
// verifyIdentity compares against stored identity module data
const match = await verifyIdentity(userId, { firstName, lastName, ssn });
```

### OTP verification forms

**Flow:**

1. Tenant creates a form with `type: 'otp_verification'`, optionally with `requiredTier: VerificationTier.EnhancedOTP`.
2. User opens the form URL -- sees a **consent screen**.
3. User accepts consent -- sees the **channel selection** screen (email or phone).
4. User picks a channel -- backend:
   - Looks up the user's contact module for the destination (email address or phone number).
   - Generates a 6-digit OTP via `crypto.randomInt` (cryptographically secure).
   - Hashes the OTP with SHA-256 and stores the hash on the form token's `otpState`.
   - Sends the plain-text code via the configured `OtpProvider`.
5. User enters the code -- backend calls `verifyOtp(submitted, storedHash)`:
   - Max 3 attempts before lockout.
   - OTP expires after 10 minutes.
6. On successful verification:
   - If `requiredTier` is `EnhancedOTP` and only one channel is verified, prompt for the second channel (loop back to step 3).
   - Otherwise, create a session at the appropriate tier and redirect.

```typescript
// OTP state stored on the form token
interface OtpState {
  hashedOtp: string;
  channel: 'email' | 'phone';
  attempts: number;
  expiresAt: string;
  verifiedChannels?: ('email' | 'phone')[];  // For tier 2 tracking
}
```

**Tier determination:**

```typescript
// Tier 1 = single channel verified
// Tier 2 = both email AND phone verified
const tier = verifiedChannels.includes('email') && verifiedChannels.includes('phone')
  ? VerificationTier.EnhancedOTP   // 2
  : VerificationTier.BasicOTP;     // 1
```

### The consent screen

Before any verification form, the user sees a consent screen. Consent records are persisted to DynamoDB.

```typescript
// Consent text is auto-generated from tenant name and requested modules
const text = buildConsentText('Acme Corp', ['identity', 'contact']);
// "By continuing, you authorise Acme Corp to access the following data:
//  identity, contact. Your data will be handled in accordance with
//  applicable privacy laws. You may revoke this consent at any time."

// The consent record includes a SHA-256 hash of the consent text
await recordConsent({
  userId,
  tenantId,
  modules: ['identity', 'contact'],
  tier: VerificationTier.BasicOTP,
  consentText: text,
  consentAddendum: tenant.consentAddendum,   // optional tenant-specific text
  accepted: true,
});
```

### Session creation after verification

On successful verification, a session is created that the tenant can use to access user data:

```typescript
const session = await createSession(userId, tenantId, VerificationTier.Identity);
// session.sessionId is appended to the callback URL
```

### The Frodo Link flow (end to end)

Frodo Link is the full flow where a tenant requests data from a user with verification. Here is how it works:

```
Tenant                         Frodo                              User
  |                              |                                  |
  |-- POST /users/:id/access -->|                                  |
  |   { modules, callbackUrl }  |                                  |
  |                              |                                  |
  |<-- { status:                |                                  |
  |   "verification_required",  |                                  |
  |   verificationUrl }         |                                  |
  |                              |                                  |
  | (Tenant creates a form      |                                  |
  |  token for verification)    |                                  |
  |                              |                                  |
  |-- POST /forms ------------->|                                  |
  |   { formDefinition:         |                                  |
  |     type: otp_verification, |                                  |
  |     userId, callbackUrl }   |                                  |
  |                              |                                  |
  |<-- { token, url } ---------|                                  |
  |                              |                                  |
  | (Tenant sends url to user) |                                  |
  |                              |<-- User opens /forms/:token ----|
  |                              |--- Consent screen ------------->|
  |                              |<-- User accepts consent --------|
  |                              |--- OTP channel selection ------>|
  |                              |<-- User picks "email" ----------|
  |                              |--- Sends OTP code to email ---->|
  |                              |<-- User enters code ------------|
  |                              |--- Verifies code               |
  |                              |--- Creates session              |
  |                              |--- Redirects to callbackUrl     |
  |                              |    ?sessionId=SESSION_ID ------>|
  |                              |                                  |
  | (Tenant now has a           |                                  |
  |  valid session)             |                                  |
  |                              |                                  |
  |-- POST /users/:id/access -->|                                  |
  |   { modules }               |                                  |
  |   + X-Session-Id header     |                                  |
  |                              |                                  |
  |<-- { status: "success",    |                                  |
  |      data: { ... } }        |                                  |
```

The session ID can be provided via query param, `X-Session-Id` header, or `frodo_session` cookie. The access endpoint checks that the session's `verifiedTier` meets the minimum required by the requested modules, then returns the data filtered by tier.

---

## 8. Extending the System

### Adding a new module schema

Create a new file under `src/modules/<name>/schema.ts`:

```typescript
// src/modules/vehicles/schema.ts
import { z } from 'zod';
import { VerificationTier } from '../../types.js';
import { registerModule, type FieldDefinition } from '../registry.js';

// 1. Define the Zod schema for runtime validation
export const vehiclesSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  ownershipStatus: z.enum(['owned', 'leased', 'financed']).optional(),
});

// 2. Define field-level verification tiers
const fields: Record<string, FieldDefinition> = {
  make:            { tier: VerificationTier.None, type: 'string' },
  model:           { tier: VerificationTier.None, type: 'string' },
  year:            { tier: VerificationTier.None, type: 'number' },
  vin:             { tier: VerificationTier.BasicOTP, type: 'string' },
  licensePlate:    { tier: VerificationTier.BasicOTP, type: 'string' },
  ownershipStatus: { tier: VerificationTier.None, type: 'string' },
};

// 3. Register
registerModule({ name: 'vehicles', fields });
```

The `tier` on each field controls the minimum verification level required for a tenant to read that field. For example, `vin` and `licensePlate` require at least `BasicOTP` (tier 1), while `make`/`model`/`year` are accessible without verification.

Import the schema file in your startup code so `registerModule` is called:

```typescript
import './modules/vehicles/schema.js';
```

### Adding a new enrichment provider

Implement the `Enricher` interface and register it:

```typescript
// src/enrichment/carfax/carfax-enricher.ts
import type { Enricher, EnrichmentResult } from '../types.js';
import { registerEnricher } from '../registry.js';

const carfaxEnricher: Enricher = {
  source: 'carfax',         // Must match a SourceConfig
  module: 'vehicles',       // Target module
  timeoutMs: 15000,         // Optional timeout (default 30s)

  async enrich(userId, current): Promise<EnrichmentResult> {
    const vin = current.vin as string | undefined;
    if (!vin) {
      return { data: {} };  // Nothing to enrich without a VIN
    }

    // Call the Carfax API
    const response = await fetch(`https://api.carfax.com/v1/vehicles/${vin}`, {
      headers: { Authorization: `Bearer ${process.env.CARFAX_API_KEY}` },
    });
    const carfaxData = await response.json();

    return {
      data: {
        make: carfaxData.make,
        model: carfaxData.model,
        year: carfaxData.year,
        ownershipStatus: carfaxData.titleStatus === 'clean' ? 'owned' : undefined,
      },
      metadata: {
        provider: 'carfax',
        reportId: carfaxData.reportId,
      },
    };
  },
};

// Register it
registerEnricher(carfaxEnricher);
```

Add a corresponding source config:

```typescript
// In src/config/source-configs.ts, add:
sourceConfigs['carfax'] = {
  source: 'carfax',
  defaultTtl: { days: 90 },
  confidence: 0.95,
  fieldTtls: {
    ownershipStatus: { days: 30 },  // Ownership can change
  },
};
```

### Adding a new custom form component

Follow the same pattern as the address component (see Section 4):

1. Create the file: `src/forms/components/my-component.ts`.
2. Implement `CustomFieldComponent` with `name`, `description`, `render`, `validate`, and optionally `transformValue`.
3. Register it in `src/forms/components/index.ts`:

```typescript
import { myComponent } from './my-component.js';

export function registerBuiltinComponents(): void {
  registerComponent(addressComponent);
  registerComponent(myComponent);     // <-- add here
}
```

4. Use it in form definitions by setting `inputType` to the component's `name`.

### Adding a new OTP delivery provider

Implement the `OtpProvider` interface and register it at startup:

```typescript
// src/forms/otp-providers/twilio-provider.ts
import type { OtpProvider } from '../otp-provider.js';
import { setOtpProvider } from '../otp-provider.js';

export class TwilioOtpProvider implements OtpProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private fromEmail: string;

  constructor(config: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
    fromEmail: string;
  }) {
    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
    this.fromNumber = config.fromNumber;
    this.fromEmail = config.fromEmail;
  }

  async sendOtp(channel: 'email' | 'phone', destination: string, code: string): Promise<void> {
    if (channel === 'phone') {
      // Send SMS via Twilio
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(`${this.accountSid}:${this.authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: destination,
          From: this.fromNumber,
          Body: `Your verification code is: ${code}`,
        }),
      });
    } else {
      // Send email via Twilio SendGrid or another email service
      // ...
    }
  }
}

// At application startup:
setOtpProvider(new TwilioOtpProvider({
  accountSid: process.env.TWILIO_ACCOUNT_SID!,
  authToken: process.env.TWILIO_AUTH_TOKEN!,
  fromNumber: process.env.TWILIO_FROM_NUMBER!,
  fromEmail: process.env.FROM_EMAIL!,
}));
```

The default provider is `ConsoleOtpProvider`, which logs OTP codes to the console -- useful for development.

### How source configs control data confidence and TTL

Each source config defines:

| Field | Purpose |
|---|---|
| `defaultTtl` | How long data from this source stays valid (used for `goodBy` on `FieldChange`) |
| `fieldTtls` | Override TTL for specific fields (e.g., bank balances expire faster than identity data) |
| `confidence` | Default confidence score (0-1) for data from this source |
| `fieldConfidence` | Override confidence for specific fields (e.g., user-provided names are more reliable than user-provided income) |

```typescript
interface SourceConfig {
  source: string;
  defaultTtl: Duration;
  fieldTtls?: Record<string, Duration>;
  confidence: number;
  fieldConfidence?: Record<string, number>;
}
```

---

## 9. API Reference

### Form endpoints

#### `POST /forms` (Authenticated)

Create a form token. Requires API key authentication.

**Request:**

```json
{
  "userId": "user_abc123",
  "callbackUrl": "https://yourapp.com/callback",
  "formDefinition": {
    "formId": "my-form",
    "title": "Collect Information",
    "type": "data_collection",
    "fields": [
      {
        "module": "identity",
        "field": "firstName",
        "label": "First Name",
        "inputType": "text",
        "required": true,
        "minLength": 1,
        "maxLength": 100
      }
    ],
    "expiresIn": { "hours": 1 }
  }
}
```

**Response (201):**

```json
{
  "token": "base64url-encoded-token",
  "url": "/forms/base64url-encoded-token"
}
```

**Errors:**

| Status | Code | Condition |
|---|---|---|
| 400 | `BAD_REQUEST` | Missing `formDefinition` or `userId` |
| 400 | `BAD_REQUEST` | Missing required fields on `formDefinition` |
| 400 | `BAD_REQUEST` | Unknown `inputType` on a field |
| 400 | `BAD_REQUEST` | `callbackUrl` not in tenant's allowed list |
| 401 | `UNAUTHORIZED` | Invalid or missing API key |

---

#### `GET /forms/:token` (Public)

Render the form as HTML.

- **`data_collection`**: renders the form directly.
- **`identity_verification`** / **`otp_verification`**: renders the consent screen first.

**Response:** HTML page.

**Errors:**

| Status | Condition |
|---|---|
| 404 | Token not found or expired |

---

#### `POST /forms/:token/consent` (Public)

Accept the consent screen. Only relevant for verification forms.

**Request body (form-encoded):**

```
accepted=true
```

**Response:**
- For `otp_verification`: renders the OTP channel selection screen.
- For `identity_verification`: renders the identity form fields.

---

#### `POST /forms/:token/submit` (Public)

Submit form data. Accepts two formats:

**HTML form submission (standard):**

```
identity.firstName=Jane&identity.lastName=Doe&contact.email=jane@example.com
```

**Frodo Collect JSON submission:**

```json
{
  "fields": [
    { "module": "identity", "field": "firstName", "value": "Jane" },
    { "module": "identity", "field": "lastName", "value": "Doe" },
    { "module": "contact", "field": "email", "value": "jane@example.com" }
  ],
  "source": "user"
}
```

**JSON response (for Collect clients, 200):**

```json
{
  "eventsCreated": 2,
  "redirectUrl": "https://yourapp.com/callback"
}
```

**HTML response (for browser submissions):** renders a success page with optional redirect.

**Errors:**

| Status | Condition |
|---|---|
| 400 | Validation failed (required fields, pattern mismatch, custom component validation) |
| 404 | Token not found or expired |

---

#### `POST /forms/:token/send-otp` (Public)

Send an OTP code to the user.

**Request body (form-encoded):**

```
channel=email
```

Channel must be `email` or `phone`.

**Response:** renders the OTP code entry form.

**Errors:**

| Status | Condition |
|---|---|
| 400 | No contact information found for the user |
| 400 | No email/phone on file for the selected channel |
| 404 | Token not found or expired |

---

#### `POST /forms/:token/verify-otp` (Public)

Verify an OTP code.

**Request body (form-encoded):**

```
code=123456
```

**Response on success:** renders success page with redirect (appends `?sessionId=...` to callback URL).

**Errors:**

| Status | Condition |
|---|---|
| 400 | OTP expired (10-minute window) |
| 400 | Too many failed attempts (max 3) |
| 400 | Invalid code |
| 404 | Token not found or expired |

---

### Access endpoints

#### `POST /api/v1/users/:id/access` (Authenticated)

Request access to user module data. Returns data if a valid session exists with sufficient verification tier, or returns a `verification_required` response.

**Request:**

```json
{
  "modules": ["identity", "contact"],
  "callbackUrl": "https://yourapp.com/callback"
}
```

**Response (session exists with sufficient tier):**

```json
{
  "status": "success",
  "data": {
    "identity": { "firstName": "Jane", "lastName": "Doe" },
    "contact": { "email": "jane@example.com", "phone": "+15551234567" }
  },
  "sessionExpiresAt": "2026-03-22T18:00:00.000Z"
}
```

**Response (verification needed):**

```json
{
  "status": "verification_required",
  "verificationUrl": "/verify/user_abc123?tenant=tenant_xyz",
  "requiredTier": 1,
  "currentTier": null
}
```

Session ID can be provided via:
1. `?sessionId=...` query parameter
2. `X-Session-Id` request header
3. `frodo_session` cookie

---

#### `GET /api/v1/users/:id/access/status` (Authenticated)

Check whether a valid verified session exists.

**Response (verified):**

```json
{
  "verified": true,
  "verifiedTier": 1,
  "expiresAt": "2026-03-22T18:00:00.000Z"
}
```

**Response (not verified):**

```json
{
  "verified": false
}
```

---

### Frodo Collect submission format

When `FrodoCollect.submit()` sends data to the backend, it POSTs the following JSON:

```typescript
{
  fields: Array<{
    module: string;     // e.g. "identity"
    field: string;      // e.g. "firstName"
    value: unknown;     // the (possibly transformed) value
  }>;
  source: string;       // e.g. "user", "plaid"
}
```

The backend detects this format via the `isCollectFormat` check (looks for an array `fields` property where each item has `module` and `field` keys) and normalizes it into flat `module.field` keys before processing.
