# Integration Guide

## 

### Step 1: How it works

Use Advanced Prefill to reduce onboarding friction while running KYC and Watchlist screening.

This workflow:

- Collects minimal identity data (DOB + phone)
- Verifies the user with a One-Time Passcode (OTP)
- Prefills verified identity details
- Submits full PII for a KYC decision
- Escalates to Document Verification (DocV) when the decision is `REVIEW`

### **What you’ll build**

- **Identity start form (DOB + phone)** — Collect the user’s date of birth and phone number in your UI to initiate Advanced Prefill and identity lookup.
- **One-Time Passcode form** — Collect a 6-digit SMS code to verify device ownership and unlock verified identity data.
- **Full PII form** — Display prefilled identity data and collect remaining required fields for KYC evaluation.
- **Server endpoint** — Submit data to the Evaluation API and route based on the returned decision.
- **DocV step-up** — Launch DocV when the decision is `REVIEW`.
- **Webhook endpoint** — Listen for the DocV `evaluation_completed` event, persist the final decision, and route users accordingly.

### **Decision outcomes**

After creating a verification session, the Evaluation API returns one of the following decisions:

- `ACCEPT` — Continue onboarding.
- `REJECT` — Stop onboarding.
- `REVIEW` — Additional verification required (launch DocV).

### **Document verification (DocV)**

If the evaluation returns a `REVIEW` status, use DocV to collect:

- Government ID
- Selfie (biometric match)

DocV completes asynchronously. The final decision is delivered via the `evaluation_completed` webhook.

---

## **Before you start**

You’ll need:

- **Sandbox base URL:** `https://riskos.sandbox.socure.com`
- **API key:** Server-side secret for Evaluation API requests.
- **SDK key:** Frontend key for Digital Intelligence and DocV SDKs.
- **Workflow name:** Included in the `"workflow"` field of your request.

### Step 2: Collect a Digital Intelligence session token

Each Evaluation request must include a `di_session_token`. Generate the token on the frontend immediately before submitting signup data to your backend.

> See the [Digital Intelligence Web SDK guide](https://help.socure.com/riskos/docs/digital-intelligence-web-sdk) for full SDK initialization and configuration.
> 

### **Install**

```bash
npm install --save @socure-inc/device-risk-sdk
```

### **Generate token and submit to your backend**

Call `getSessionToken()` just before sending signup data to your server.

```tsx
import { SigmaDeviceManager } from "@socure-inc/device-risk-sdk";

const handleSignup = async (formData: any) => {
  const di_session_token = await SigmaDeviceManager.getSessionToken();

  await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...formData,
      di_session_token,
    }),
  });
};
```

### Step 3: Retrieve and verify identity data

Use the Advanced Prefill workflow to retrieve verified PII while minimizing user friction. This workflow is asynchronous and always begins with a One-Time Passcode challenge.

### **Collect required input**

Your application must collect the required fields before initiating the workflow. Validate the following client-side before submission:

- `date_of_birth` must be in `YYYY-MM-DD` format.
- `phone_number` must be in **E.164** format.
- `di_session_token` must be generated from the active Digital Intelligence session.

> **Tip**: Including extra PII (name, email, address) increases match accuracy.
> 

### **Create the evaluation**

Send a `POST` request to the Evaluation API to initiate identity lookup and automatically deliver a **6-digit One-Time Passcode** to the user's device.

```tsx
const response = await fetch(
  "https://riskos.sandbox.socure.com/api/evaluation",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.SOCURE_API_KEY}`,
    },
    body: JSON.stringify({
      id: `advanced-prefill-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      workflow: process.env.SOCURE_WORKFLOW_NAME,
      data: {
        individual: {
          phone_number: "+14155550001",
          date_of_birth: "1990-05-15",
          di_session_token: diSessionToken,
          address: { country: "US" },
        },
      },
    }),
  }
);

const result = await response.json();
```

### **A. Detect the One-Time Passcode challenge**

If the response contains:

- `decision: "REVIEW"`
- `status: "ON_HOLD"`
- tag `"OTP Triggered"`

A 6-digit One-Time Passcode has been sent to the user’s device. Persist `result.eval_id` — you will use it to verify the code.

For more information on One-Time Passcode scenarios, see the [One-Time Passcode Integration Guide](https://help.socure.com/riskos/docs/otp-integration-guide).

### **B. Collect the One-Time Passcode**

- Display a 6-digit One-Time Passcode input form.
- Allow the user to resubmit the code if needed (up to five attempts).

### **C. Verify the One-Time Passcode (`PATCH`)**

When the user enters the 6-digit code, your backend should verify it by making a `PATCH` request to the Evaluation endpoint with `data.individual.otp.code`.

```tsx
const otpResp = await fetch(
  `https://riskos.sandbox.socure.com/api/evaluation/${result.eval_id}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SOCURE_API_KEY}`,
    },
    body: JSON.stringify({
      id: `otp-verify-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      workflow: process.env.SOCURE_WORKFLOW_NAME,
      data: { individual: { otp: { code: userEnteredOtp } } },
    }),
  }
);

const otpResult = await otpResp.json();
```

### **D. Handle the response**

| Outcome | decision | status | What you should do |
| --- | --- | --- | --- |
| OTP challenge triggered | `"REVIEW"` | `"ON_HOLD"` | Show 6-digit One-Time Passcode input. Persist `eval_id`. Allow retry (maximum 5 attempts). |
| OTP verified, Prefill unlocked | `"REVIEW"` | `"ON_HOLD"` | Display prefilled identity data. Lock `phone_number` and `date_of_birth`. Collect remaining PII and continue workflow. |
| Evaluation fails (OTP/Prefill/secondary checks) | `"REJECT"` | `"CLOSED"` | Do **not** show prefilled data. Show a blank onboarding form for manual entry (or route to decline). |
| Evaluation complete (no more steps) | `"ACCEPT"` | `"CLOSED"` | Continue to success / onboarding completion flow. |

> **Tip**: Inspect tags for signals like `"OTP Approved"`, `"Prefill Successful"`, or `"OTP Triggered"` to guide flows.
>

### Step 4: Submit full PII for KYC (PATCH)

After One-Time Passcode verification succeeds, submit the user’s full PII to continue the evaluation.

### **API request**

Use the `eval_id` returned from step 3.

```
PATCH /api/evaluation/{eval_id}
```

> **Lock these fields**: To prevent mismatches between Prefill and the final Evaluation request, do not allow users to edit: `date_of_birth`, `phone_number`, `country`
> 

**Minimum required PII fields**

| Field | Example |
| --- | --- |
| `data.individual.given_name` | `Jane` |
| `data.individual.family_name` | `Doe` |
| `data.individual.address.country` | `US` |

**In addition to the required fields above, provide at least one of:**

- `date_of_birth`
- `phone_number`
- Additional address details

> **Tip**: Include as many identity fields as possible for optimal evaluation quality. See the [RiskOS™ documentation](https://help.socure.com/riskos/docs/kyc-watchlist-screening-with-prefill-integration-guide-for-startups) for the complete request schema.
> 

```tsx
const response = await fetch(
  `https://riskos.sandbox.socure.com/api/evaluation/${evalId}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SOCURE_API_KEY}`,
    },
    body: JSON.stringify({
      id: `onb-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      workflow: process.env.SOCURE_WORKFLOW_NAME,
      data: {
        individual: {
          given_name: "Jane",
          family_name: "Doe",
          email: "jane.doe@example.com",
          national_id: "123456789",
          date_of_birth: "1990-05-15",
          phone_number: "+14155550001",
          address: {
            line_1: "123 Main St",
            locality: "Newark",
            major_admin_division: "NJ",
            postal_code: "07102",
            country: "US",
          },
          di_session_token: diSessionToken,
        },
      },
    }),
  }
);

const result = await response.json();
```

### **Example response**

RiskOS™ evaluates the request immediately and returns a decision.

```json
{
  "decision": "ACCEPT",
  "status": "CLOSED",
  "eval_id": "b1c0e610-822d-4793-a970-8bfc0a9b883f"
}
```

| Decision | Next step |
| --- | --- |
| `ACCEPT` | Identity verified. Continue onboarding. |
| `REJECT` | Identity failed verification. Route according to your business rules. |
| `REVIEW` | Launch Document Verification (DocV) using the SDK. |

> **Tip**: For more information about how outcomes are determined, review the `tags` field in the API response.
>

### Step 5: Complete Document Verification (DocV)

If the Evaluation response returns:

- `decision === "REVIEW"`
- `eval_status === "evaluation_paused"`
- A `docvTransactionToken` in `data_enrichments`

RiskOS™ has triggered Document Verification (DocV).

DocV is asynchronous. The workflow resumes after capture completes, and the final decision is delivered via webhook (`evaluation_completed`). Ensure your webhook endpoint is registered before going live.

### **Retrieve the transaction token**

The DocV transaction token is returned in:

`data_enrichments[n].response.data.docvTransactionToken`

```tsx
const json = await response.json();

const docvTransactionToken = json?.data_enrichments
  ?.find((e: any) => e?.response?.data?.docvTransactionToken)
  ?.response?.data?.docvTransactionToken;
```

Persist `eval_id` to correlate webhook events with the original evaluation.

### **Launch the Web SDK**

Load the [DocV Web SDK](https://help.socure.com/riskos/docs/web-sdk):

`https://websdk.socure.com/bundle.js`

The SDK requires a container element (typically a `div`) in your HTML where the Capture App will be rendered. Ensure the ID of this element matches the selector passed to the `launch` function.

```html
<div id="websdk"></div>
```

Then launch:

```tsx
(window as any).SocureDocVSDK.launch(
  process.env.NEXT_PUBLIC_SOCURE_SDK_KEY,
  docvTransactionToken,
  "#websdk",
  {
    qrCodeNeeded: true,
    closeCaptureWindowOnComplete: true,
  }
);
```

The SDK renders the Capture App and guides the user through:

- Government-issued ID capture
- Selfie verification
- Liveness checks

### **Native mobile (optional)**

For native (iOS and Android) apps, open the DocV URL returned in:

- `data_enrichments[n].response.data.url`

This launches the Socure Capture App in the device browser.

If you included `data.individual.docv.config.redirect.url` in your Evaluation request, the user will be redirected back to your app after capture completes.

If no redirect URL is configured, display a loading state and wait for the `evaluation_completed` webhook to determine the final decision.

> See the [Integration Guide](https://help.socure.com/riskos/docs/hosted-flows-integration-guide) for advanced SDK configuration and mobile patterns.
>

### Step 6: Receive the final decision (Webhook)

After DocV completes, RiskOS™ resumes the paused evaluation asynchronously and sends the final decision via an `evaluation_completed` webhook event.

> Ensure your [webhook endpoint is registered](https://help.socure.com/riskos/docs/webhooks) before going live.
> 

### **Listen for `evaluation_completed`**

The final outcome is available in `data.decision`.

```json
{
  "event_type": "evaluation_completed",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "eval_id": "11111111-2222-3333-4444-555555555555",
    "eval_status": "evaluation_completed",
    "decision": "ACCEPT"
  }
}
```

### **Minimal webhook handler (server-side)**

Persist `id`, `eval_id`, and `decision` so your frontend can route the user appropriately.

```tsx
export async function POST(request: Request) {
  const event = await request.json();

  if (event.event_type !== "evaluation_completed") {
    return new Response("Ignored", { status: 200 });
  }

  const { id, eval_id, decision } = event.data;

  // persist decision keyed by `id`

  return new Response("OK", { status: 200 });
}
```

### **Routing users after webhook**

Because DocV is asynchronous:

- Wait for your backend to persist the webhook decision.
- Route based on the stored `decision`.

| Decision | Action |
| --- | --- |
| `ACCEPT` | Continue onboarding |
| `REJECT` | Stop onboarding or route to fallback |

A common approach is polling your backend until the stored decision changes.

### Step 7: Before going live

Confirm your integration is complete:

- Use the Sandbox base URL (`https://riskos.sandbox.socure.com`) during testing.
- Generate and include a valid `di_session_token` in every Evaluation request.
- Collect `date_of_birth` (YYYY-MM-DD) and `phone_number` (E.164) before initiating Prefill.
- Detect `decision: "REVIEW"` and `status: "ON_HOLD"` to trigger the One-Time Passcode step.
- Allow up to 5 OTP attempts before requiring a restart.
- Persist `eval_id` after the initial Evaluation response.
- Lock `date_of_birth`, `phone_number`, and `country` in your full PII form.
- Submit full PII using `PATCH /api/evaluation/{eval_id}`.
- Handle `ACCEPT`, `REJECT`, and `REVIEW` from the KYC response.
- On `REVIEW` with `evaluation_paused`, launch DocV using the returned `docvTransactionToken`.
- Register a webhook endpoint and process `evaluation_completed` events.
- Persist `id` and `eval_id` for API ↔ webhook correlation.
- Route users based on the final decision (`ACCEPT` → continue onboarding, `REJECT` → fallback flow).
