# RAVEN White-Label Borrower Experience — Platform Design

Status: Draft for review (June 2026)
Owner: Isaac Welch
Related: `docs/prd-core-banking-integration.md`, `dashboard/src/app/(whitelabel)/` (Phase 1 front-end demo)

This document consolidates the design decisions for productionizing the RAVEN
white-label borrower experience: the architecture, the data model, the
configuration surface, the compliance framework, and the three borrower flows
the system must support.

> Compliance note: the sections on rates, applications, and adverse action are
> an engineering/product framing, not legal advice. Every consumer-facing rate,
> disclosure, decision, and adverse-action behavior must be reviewed and
> approved by counsel and the partner bank's compliance team before launch. The
> bank is the regulated creditor and has final say.

---

## 1. Goals

- One configurable, bank-branded borrower journey that powers product selection,
  data verification, optional rate display, application creation, and (later)
  core-system sync.
- A single underlying platform drives both the sales **demo** and the **live**
  product. The only difference is which providers run.
- Per-bank subdomains on **submit.loans**.
- Three distinct flows on the same components, selected by entry context and
  gated by configuration.

---

## 2. Core principles

1. **One platform, two modes.** A session's mode comes from the tenant /
   deployment. `sandbox` mode = deterministic **mock providers + mock core
   sync**; `production` mode = real providers + real core sync. The front end
   and all business logic are identical; only the provider and core-sync
   adapters change. This generalizes the existing API-key `environment`
   (`sandbox | production`) so mocks run in production for demo tenants. It
   means the sales demo is just a tenant running in sandbox mode, and platform
   changes show up in the demo automatically with no duplicate code.

2. **Logic lives in the Elysia API** (`src/`), built like the rest of the
   platform. The loan-officer dashboard stays in the Next.js `dashboard/` app.
   The borrower journey is a **Next.js app hosted on Vercel** that acts as a thin
   client over the API (see Section 3).

3. **Config says what is possible; entry context says what is initiated.** A
   tenant/product config declares which flows are permitted. The specific link
   or path the borrower enters through selects the actual flow, validated
   against what the config allows. Flow selection is always server-authoritative.

4. **RAVEN is a service provider; the bank is the creditor.** RAVEN never sets
   rates and never owns a credit decision. It computes against the bank's
   approved rate card and, for full applications, orchestrates and delivers the
   bank's decision and adverse-action notice on the bank's behalf. This keeps
   RAVEN out of the creditor/decisioning role and preserves the bank-branded
   service-provider posture (which also avoids broker/lead-gen licensing in most
   states).

---

## 3. Domains and hosting

The white-label borrower experience is a **Next.js app hosted on Vercel**, with
logic and data served by the Elysia API (the UI is a thin client; see Section
4.5). The hosting model is **one deployment that serves all tenants by
hostname**, never one deployment per tenant (onboarding a bank must not require a
new build or deploy).

- **Domain:** white-label experiences live on **submit.loans**. Put submit.loans
  on **Vercel-managed DNS** so Vercel can auto-issue and renew the wildcard TLS
  certificate.
- **Wildcard subdomain:** add `*.submit.loans` to a single Vercel project. One
  wildcard cert covers every bank subdomain (e.g.
  `arthur-state-bank.submit.loans`), so onboarding a bank needs no new
  certificate and no new deploy.
- **Host-based routing:** Next middleware reads the `Host` header, resolves the
  tenant from the host-mapping record (cached in Vercel Edge Config / KV, not a
  DynamoDB read per request), and rewrites to that tenant's branded journey.
  Unknown subdomains return 404, which is the gate.
- **Custom bank domains** (e.g. `apply.arthurstatebank.com`): added to the same
  Vercel project via the **Vercel Domains API** during onboarding; the bank
  points a CNAME at `cname.vercel-dns.com` and Vercel auto-issues a per-domain
  certificate after verification. Automate domain creation in the onboarding
  flow and watch the project's domain limit for custom apex domains.
- **Dedicated, Clerk-free app:** the borrower surface ships as its own Next app
  on Vercel bound to `*.submit.loans`, separate from the Clerk-wrapped
  `dashboard/` app on reportraven.tech, to isolate the consumer trust boundary
  and bundle. (Near term it may start in the existing `(whitelabel)` route group
  and be split out before launch.) Reference: the open-source `vercel/platforms`
  starter demonstrates this subdomain + custom-domain multi-tenant pattern.
- **Path encodes the flow** (see Flows). A bank can keep the same host from demo
  through go-live; only the tenant/deployment mode flips.
- **Self-hosted fallback:** the same Next app can run on the existing ECS/ALB
  with an ACM wildcard cert if the consumer surface must stay inside AWS, at the
  cost of managing custom-domain certificates yourself. Vercel is the default.

---

## 4. Flows and runtime architecture

All flows run the same spine:

```
entry (host + path / signed link) -> resolve {tenant, product?, flow}
  -> applicant + consent -> data enrichment -> TERMINAL
```

A flow is a named bundle of two pluggable settings (credit pull + terminal
outcome handler) plus its legal weight. Everything else is shared.

| Flow | Path (public) | creditPull | Terminal outcome | Legal weight |
|---|---|---|---|---|
| **1. full_application** | `/apply` | hard | Bank decision: prequalify/approve **or** deny + AAN | This *is* an application (ECOA / FCRA / TRID / HMDA) |
| **2. rate_range** | `/check-rate` | none | Show rate **range**, route to LO for the actual rate | Prequalification / advertising |
| **3. data_only** | `/verify` or LO link | none | No rate; verified data handed to the LO | Verification, not an application |

The two pluggable points:

- **creditPull**: `none | soft | hard`.
- **terminal handler**: `RouteToLoOutcome | RateRangeOutcome | DecisionOutcome`.

`RouteToLoOutcome` is also the universal fallback for the "outside the box" case
in flows 1 and 2 (see Compliance).

### 4.1 Flow 1 — full_application (decision + AAN)

- **Decisioning is bank-owned.** RAVEN orchestrates the journey, runs the data
  pull (including a hard credit pull), and submits verified data to the bank's
  decision system. The **bank** renders the credit decision and owns the
  adverse-action content and reason codes.
- **Decisioning is asynchronous (decided).** The borrower submits and sees an
  "application received, under review" confirmation. The bank decides on its own
  cadence (its system, or a loan officer), and the result plus any
  adverse-action notice are delivered afterward (email/portal/mail). RAVEN never
  blocks the borrower waiting on a decision. Synchronous in-session decisioning
  is supported only where a bank exposes a real-time decision API; async is the
  default and the baseline every bank can use.
- **RAVEN delivers on the bank's behalf.** RAVEN generates and delivers the
  decision result and the adverse-action notice (AAN) as the bank's agent, but
  the bank is the creditor and the source of the decision and reason codes.
  RAVEN is not a decisioning agent.
- **May be publicly available** (reachable from `/apply` on the public
  subdomain). Because it is a legal application, it carries the full regulated
  apparatus: FCRA permissible purpose + notices, ECOA timing and AAN, and for
  mortgages the TRID Loan Estimate and HMDA obligations.
- Records an **Intake** with `flowKind = full_application`,
  `isLegalApplication = true`, and a `decision { result, reasonCodes, aanId,
  aanDeliveredAt }` block populated when the bank's decision arrives.

### 4.2 Flow 2 — rate_range (no credit pull)

- **No credit is pulled.** Collect identity, income, assets, and (for equity
  products) property data, then show a **rate range** computed from the bank's
  rate card across the full credit spectrum (best-tier to worst-tier APR),
  narrowed by the verified, credit-independent factors (LTV, DTI).
- The borrower is routed to a loan officer for an actual, individualized rate.
  Never renders a denial.
- Removes the entire FCRA layer and keeps the feature in the
  prequalification/advertising category. See Compliance.
- Records an **Intake** (loan intent) with `isLegalApplication = false`.

### 4.3 Flow 3 — data_only (verification)

- The existing RAVEN verification flow, generalized. **The party requesting the
  data chooses which modules to pull** (identity, contact, income/employment,
  residence/property, financial, credit if authorized). It is
  **product-agnostic**: no product selection, amount, or rate is required.
- Typically initiated by a loan officer sending a direct link, but can also be a
  public `/verify` entry.
- Terminal is simply "verified data delivered to the LO / dashboard." No rate,
  no decision. Records an **Intake** with `flowKind = data_only` and no loan
  fields.

### 4.4 Flow selection: capability config + entry context

**Layer 1 — capability (what is possible),** per tenant and per product:

```
product.allowedFlows:   FlowKind[]   // e.g. ['data_only', 'rate_range']
product.webDefaultFlow: FlowKind     // what a public web click initiates
product.loLinkFlow:     FlowKind     // default for an LO-generated link
```

**Layer 2 — entry context (what is initiated),** resolved at runtime and
validated against `allowedFlows`:

- **LO link / token**: `submit.loans/v/<token>`; the signed token carries
  `{tenant, product?, flow, modules?}`. For data_only, the LO selects the
  modules when generating the link.
- **Public web path**: `bank.submit.loans/apply` -> full_application,
  `/check-rate` -> rate_range, `/verify` -> data_only. The path maps to a flow,
  resolved server-side and checked against `allowedFlows`.
- **Embed / API**: bank passes a signed flow in the request.

**Integrity rule:** the flow is always server-authoritative (baked into a signed
token or resolved from config). A raw query param may *request* a flow but never
*decide* it. A borrower must not be able to escalate a `data_only` link into a
credit-pulling `full_application`, nor be exposed to a credit pull they did not
consent to.

### 4.5 Front end

One journey, **flow-conditional stages**. The entry resolution returns the flow;
the journey renders only the stages that flow declares:

- data_only: applicant -> consent -> data pull -> done (no product front door).
- rate_range: front door -> product -> applicant -> consent -> data pull (no
  credit) -> range -> route/submit.
- full_application: same as rate_range, plus a credit-consent step and the hard
  pull, terminating in an "application received, under review" confirmation; the
  bank's decision and any AAN are delivered asynchronously.

### 4.6 Runtime architecture (components and seams)

```
Borrower (browser)
  Next.js journey  =  one Stage Runner driven by a FlowDefinition
        |  (talks only to)
  WhiteLabelClient seam   -- MockClient (demo)
        |                  -- ApiClient -> Elysia
        v
  Elysia white-label service
    EntryResolver    host+path / token -> { tenant, product?, flow, mode }
    ConfigStore      WhiteLabelConfig per tenant (+ public projection)
    IntakeService    create/advance one Intake record (the session)
    EnrichmentEngine (existing) + ProviderSet[mode]: Mock | Live
    RateEngine       pure fn: range or point from the rate card
    Terminal         RouteToLo | RateRange | Decision
                       Decision -> DecisionProvider (bank, async) + AdverseActionService
    CoreSyncAdapter[mode]: Mock | JackHenry (stub) | ...
```

Everything below the seam is Elysia; the journey never knows demo from live.

A flow is a declarative bundle; the journey is a generic runner over its stages:

```
FlowKind = data_only | rate_range | full_application
FlowDefinition {
  stages: Stage[]
  creditPull: none | soft | hard
  terminal: routeToLo | rateRange | decision
  isLegalApplication: boolean
  consentTemplate: id
}
Stage = frontDoor | product | modulePicker | applicant | consent | dataPull | rate | decision | confirmation
```

Per-flow stage lists:

- **data_only:** `applicant -> modulePicker -> consent -> dataPull -> confirmation`
- **rate_range:** `frontDoor -> product -> applicant -> consent -> dataPull -> rate -> confirmation`
- **full_application:** `frontDoor -> product -> applicant -> consent(+credit) -> dataPull -> confirmation` (submitted; async decision)

### 4.7 Borrower session = one Intake record

On journey start (or opening an LO token link) the API creates a single Intake
stamped with `{tenant, flow, mode, product?}` and returns a short-lived session
token. All later calls carry it. Consent is a stage written before any pull. An
abandoned journey is an Intake that never reaches a terminal (TTL-cleanable).
The Intake is the single entity (see Data model).

### 4.8 API surface (minimal, covers all flows)

- `GET /api/v1/wl/context` — host+path -> public config + resolved flow
- `POST /api/v1/wl/intake` — start -> intakeId + session token
- `POST /api/v1/wl/intake/:id/connect` — interactive pull steps (Plaid, etc.)
- `GET /api/v1/wl/intake/:id` — enrichment status + computed rate/range when ready
- `POST /api/v1/wl/intake/:id/submit` — choose term / apply -> terminal (route, or async decision)

### 4.9 Mode resolution (end to end)

host (or token) -> EntryResolver -> tenant + mode -> mode selects ProviderSet
(mock vs live) and CoreSyncAdapter (mock vs live). Demo = a sandbox tenant/host,
so the same code path returns mock data. Nothing in the journey or API shape
changes between demo and live.

### 4.10 Edge cases (covered by the model)

- Unknown subdomain -> 404 (the gate).
- Flow not in `product.allowedFlows` -> reject, fall back to the product's
  allowed default.
- Outside-the-box (no tier / policy fail) -> RouteToLo, never a denial (except
  flow 1, where the bank may decline -> async AAN).
- Live provider failure -> graceful "we'll verify shortly / continue with an
  officer," never a dead end.
- Consent declined -> stop before any pull.
- Demo isolation -> `prospect_demo` tenant + `mode` stamped on the Intake.

---

## 5. Data model

DynamoDB single table + a lookup table, two GSIs (`GSI1`, `GSI2`), TTL on `ttl`.

### 5.1 Three kinds of "user" (avoid the naming trap)

| "User" | Who | Modeled as | Auth |
|---|---|---|---|
| **Borrower / consumer** | The loan applicant / data subject | `PK=USER#<userId>` with `MODULE#`, `EVENT#`, `CONSENT#` items (this is what `USER#` means in code) | Form token / session, no login |
| **Banking user** | Loan officer, bank admin | Clerk org member; not stored in RAVEN today. Role from JWT (`org:admin`, `org:loan_officer`, `org:viewer`) | Clerk |
| **API consumer** | Programmatic integration | API key (`APIKEY#`), `sandbox`/`production` | Bearer key |

### 5.2 Existing entities (unchanged)

| Entity | PK / SK | Index |
|---|---|---|
| Tenant (bank) | `TENANT#<id>` / `METADATA` | `GSI2PK=CLERKORG#<orgId>` |
| API key | `TENANT#<id>` / `APIKEY#<keyId>` | `GSI1PK=APIKEY#<prefix>` |
| Borrower module state | `USER#<id>` / `MODULE#<module>` | - |
| Borrower event log | `USER#<id>` / `EVENT#<module>#<ts>#<id>` | `GSI1PK=EVENT#<source>` |
| Tenant<->borrower link | `TENANT#<id>` / `USERLINK#<userId>` | `GSI1PK=USER#<userId>` |
| Verification request | `TENANT#<id>` / `VERIFICATION#<reqId>` | `GSI1PK=USER#<userId>` |
| Consent | `USER#<id>` / `CONSENT#<tenantId>#<ts>` | - |

> Decision B: the `Verification request` above is **generalized into the single
> `Intake` entity** (Section 5.3). All three flows record one Intake; there is no
> separate Application entity.

The Tenant `METADATA` item holds permissions, callback/webhook URLs,
`clerkOrgId`, and the §1033 / FFIEC diligence block. It stays the
compliance/identity record.

### 5.3 New entities

**Tenant — one new field**

- `kind: 'customer' | 'prospect_demo'`. Prospects you pitch get a
  `prospect_demo` tenant so their fake applications never touch a real bank's
  data. Mode (demo/live) lives on the host/deployment, not the tenant.

**WhiteLabelConfig — one item per tenant**

- `PK=TENANT#<id>` / `SK=WLCONFIG`. Holds the full config (see Section 6).
- `version`, `updatedAt`, `updatedBy`. Optional `SK=WLCONFIG#draft` for staged
  edits before publish.
- Public projection (branding, products, purposes, loTeam display, step labels)
  is the only part sent to the browser. `providerRouting`, `rateCard`, and
  `coreSync` internals are server-only.

**HostMapping — lookup table**

- `PK=HOST#<hostname>` / `SK=METADATA` -> `{ tenantId, mode: 'demo'|'live',
  kind }`. One GetItem resolves `arthur-state-bank.submit.loans` (or a custom
  domain) to a tenant + mode.

**Intake — the single intake entity (decision B)**

There is **one** entity for every borrower session across all three flows. It
generalizes today's `VerificationRequest`: the data pull and the loan intent
live on the same record, with loan/decision fields present only when the flow
has them. There is no separate Application entity.

- `PK=TENANT#<id>` / `SK=INTAKE#<intakeId>` (UUID, for direct get). (Existing
  `VERIFICATION#` records can be read in place during migration; new records use
  `INTAKE#`.)
- Always present: `tenantId`, `userId`, `flowKind`, `mode`, `sourceHost`,
  `status`, `modules`, borrower contact, `createdBy`, timestamps.
- Present when the flow has loan intent (rate_range, full_application):
  `productId`, `productType`, `requestedAmount`, `purpose`, `termMonths`,
  `creditPulled`, `offered { apr, termMonths, monthlyPayment, tierLabel }` or a
  range, `configVersion`, `ltvSnapshot`, `dtiSnapshot`, `isLegalApplication`,
  `assignedToClerkUserId?`, `coreSync { system, status, ref, syncedAt? }`.
- Present for full_application only: `decision { result, reasonCodes, aanId,
  aanDeliveredAt }`, populated asynchronously when the bank's decision arrives.
- `data_only` intakes simply omit all the loan fields.
- Status (intake lifecycle, not the loan lifecycle): `started -> verifying ->
  rate_offered | submitted -> under_review -> decisioned | synced` (+ `error`,
  `abandoned`). Underwriting and closing live in the bank's core.
- Indexes:
  - LO queue (newest-first): `GSI1PK=TENANTINTAKE#<tenantId>`,
    `GSI1SK=<createdAtIso>`.
  - By borrower (optional): `GSI2PK=USERINTAKE#<userId>`, `GSI2SK=<createdAtIso>`.
- The offered rate / range and `configVersion` are **snapshotted** onto the
  intake so a later rate-card edit never rewrites history.
- `mode` is stamped on every intake so demo data is never confused with the real
  pipeline.

**Banking-user projection — optional, recommended**

- `PK=TENANT#<id>` / `SK=MEMBER#<clerkUserId>` -> `{ name, email, role,
  nmlsId?, productsHandled?, notifyPrefs? }`, populated from Clerk webhooks
  (Svix). Clerk stays the source of truth for identity, membership, and role
  (read from the JWT at request time). This projection is a cache plus the home
  for loan-officer attributes and the target of application assignment
  (`assignedToClerkUserId`).

### 5.4 Cross-tenant consent constraint

A borrower (`USER#`) can be linked to multiple banks via `USERLINK#`. Data
pulled under one bank's permissible purpose must **not** be silently reused for
another tenant. Each flow writes its own consent / permissible-purpose record
(`CONSENT#<tenantId>`), with consent templates keyed by flow (flow 1 needs FCRA
authorization + decision disclosures; flows 2 and 3 need data-pull / GLBA
consent).

---

## 6. WhiteLabelConfig — what is configurable

(Current shape: `dashboard/src/app/(whitelabel)/_config/types.ts`.)

| Section | Configurable | Effect on the experience |
|---|---|---|
| `branding` | name, wordmark, tagline, primary / primaryDark / accent, bg / surface / text / textMuted / border, font + googleFont, radius | Re-skins the entire journey via CSS variables: header, buttons, slider, progress, cards, palette, typeface, corner rounding |
| `purposes` | `{ value, label }[]` | The front-door "what are you looking to do?" options; drive product matching |
| `products` | label, blurb, iconPath, rateTeaser, purposes, minAmount, maxAmount, defaultAmount, type, disclosure | The product catalog: which cards appear for a given amount + purpose; `type` drives LTV/property logic |
| `providerRouting` | per product: modules to collect (+ optional provider preference, `interactive` flag) | Which data is pulled per product and the data-pull animation; in production the engine resolves the live provider |
| `rateCard` | per product: tiers (minScore, maxLtv) with per-term APRs; fallback terms; default term | Whether a rate shows; the APR/payment; the term selector. Omit a product to route it to an LO |
| `coreSync` | system (jackhenry/fiserv/fis/none), displayName, mode (mock/live), fieldMap | The "Synced to <core>" confirmation and, in live mode, the actual core write |
| `loTeam` | name, title, nmls | Confirmation copy and (later) loan-officer assignment display |

### 6.1 New compliance and flow knobs

- `allowedFlows: FlowKind[]`, `webDefaultFlow`, `loLinkFlow` (per product) —
  flow capability + defaults.
- `creditPull: 'none' | 'soft' | 'hard'` (per flow / product).
- `rateDisplay: 'none' | 'range' | 'estimate' | 'decision'`.
- `showRateOnline: boolean` (mortgage = false).
- `noMatchBehavior: 'route_to_lo'` (the only safe default; never `decline`).
- `disclosures` — per product / jurisdiction, bank-owned and versioned,
  snapshotted onto the application.
- A production-eligibility gate: a rate card / flow cannot go live until the
  bank's compliance has approved that config version (mirrors the existing
  tenant production-eligibility gate before a production API key is issued).

---

## 7. Compliance framework

### 7.1 Regulatory surface when showing rates

| Law | Trigger | Exposure |
|---|---|---|
| ECOA / Reg B | An application that is denied or counter-offered | Adverse-action notice owed within 30 days |
| FCRA | Using a credit report/score to set terms | Permissible purpose + consent; risk-based-pricing / credit-score notices; credit-based denial = adverse action |
| TILA / Reg Z | Stating rates; for mortgages, collecting the "6 items" | Advertising trigger-term disclosures; HELOC early disclosures; TRID Loan Estimate clock |
| UDAAP | Showing a rate the consumer cannot get | Deceptive practice / bait-and-switch |
| MAP Rule (Reg N), RESPA | Mortgage advertising / settlement services | Deceptive mortgage ad liability; referral-fee rules |
| State licensing | Acting as lender / broker / lead generator | Licensing obligations a bank-branded service provider usually avoids |

### 7.2 Two definitions of "application"

- **ECOA / Reg B (behavior test).** No minimum data list. A request becomes an
  application when the creditor evaluates the specific info, decides, and
  communicates a decision (especially a denial). Collecting credit + name +
  income + property does **not** by itself make it an application. Rendering a
  decision does. This is why "never deny in self-serve, route to the LO instead"
  holds flows 2 and 3 on the prequalification side regardless of data volume.
- **TRID (closed-end mortgages only, bright-line).** An application exists once
  all six are collected: name, income, SSN (to pull credit), property address,
  estimated property value, loan amount. Collecting all six starts the 3-day
  Loan Estimate clock regardless of labels. RAVEN typically has five of six; the
  swing factor is the property address (present for refi/HELOC, often absent for
  a purchase prequal). Not pulling credit (no SSN to pull a report) also keeps
  mortgage under the threshold. Net: mortgage routes to an LO and does not show
  an individualized online rate.

### 7.3 The no-credit-pull range model (flow 2)

Never pulling credit removes the **entire FCRA layer** (permissible purpose,
risk-based-pricing notice, credit-score disclosure, FCRA adverse action) and
structurally keeps mortgage under the TRID six-item threshold. What remains is
ordinary Reg Z advertising compliance and UDAAP accuracy, which banks handle
routinely.

How the range is computed: among rate-card tiers compatible with the borrower's
**verified LTV/DTI**, show min APR (assuming top credit) to max APR (lower credit
/ fallback). Credit is the only spanned unknown; everything else narrows the
band. Present as a **range, not a point**, conditioned ("estimate, not an offer;
your rate depends on credit and final terms; lowest rates require excellent
credit"). No approval implied. This is the recognized "rates from X% / payment
estimator" pattern, the safe tier below soft-pull "check your rate"
prequalification.

### 7.4 Adverse action

- Flows 2 and 3 **never render a denial**. The "outside the box" case routes to
  a loan officer as a positive next step, so no adverse-action obligation
  arises.
- Flow 1 is a legal application. **Decisioning is bank-owned**; RAVEN submits
  verified data, the bank decides and owns reason codes, and RAVEN generates and
  delivers the AAN **on the bank's behalf** as its agent. The bank is the
  creditor and remains liable; RAVEN is not a decisioning agent.

### 7.5 Posture

RAVEN is a technology service provider; the bank is the creditor. RAVEN never
sets rates (computes against the bank's approved card) and never owns a credit
decision. Use a **soft pull** for any individualized prequal estimate (and
none for the range model), reserving the hard pull for flow 1. Define an explicit
borrower-initiated "Apply" action as the prequalification -> application
boundary.

---

## 8. Demo vs live (mode)

- `sandbox` mode -> deterministic **mock providers + mock core-sync adapter**,
  in every environment. The mock data engine (currently
  `_config/mock-engine.ts` in the front end) moves into the backend as the
  canonical mock provider, seeded by name+email for reproducible demos, with
  optional simulated latency.
- `production` mode -> real providers + real core sync.
- Prospect demos run on `prospect_demo` tenants; a real customer's own testing
  uses a `demo` host on its real tenant. `mode` is stamped on every application
  as the backstop.
- The change required: make the mock/real selection **mode-driven**, not
  `NODE_ENV`-driven (today mock enrichers are gated to dev/test).

---

## 9. Build plan

### 9.1 Shared foundation (build once)

- `FlowKind` + `FlowDefinition`; capability config (`allowedFlows`, defaults);
  entry-context resolver (host + path / signed token -> flow, validated);
  signed tokenized links carrying flow + modules + product; pluggable
  terminal-handler interface; consent templates keyed by flow.
- Persist `WhiteLabelConfig` per tenant (Zod schema ported from the front-end
  types); host-mapping records; the Application entity; the rate engine
  (range + point) in the backend; mode-aware provider + core-sync adapters.
- Front end: a Next.js app on **Vercel** (dedicated, Clerk-free; see Section 3),
  host-based middleware for tenant resolution, flow-driven journey as a thin
  client over the API. Delete the front-end mock engine in favor of the backend
  mock provider.

### 9.2 Flow-by-flow

- **Flow 3 (data_only):** mostly exists today (the verification flow). Wrap it
  in the entry/flow framing; let the requester choose modules; product-agnostic.
  Lowest lift.
- **Flow 2 (rate_range):** the no-credit range engine + prequalification
  disclosures + route-to-LO fallback. No bureau, no decision, no AAN. Near-term;
  shares most of the system with flow 3.
- **Flow 1 (full_application):** the heavy, regulated terminal. Build behind a
  `DecisionProvider` interface (delegates to the bank's decision system) and an
  `AdverseActionService` (generates + delivers the bank's AAN on its behalf).
  Requires: hard credit pull (register Experian/TransUnion; FCRA permissible
  purpose + notices), TRID Loan Estimate + HMDA for mortgage, record retention,
  ECOA timing. Defer the regulated build until a specific bank is ready and owns
  decisioning + AAN content; design the interfaces now so the architecture is
  ready.

### 9.3 Sequencing

1. Shared foundation + mode-driven mock/real swap.
2. Ship flow 3 (wrap) and flow 2 (range) -> a usable, low-compliance product:
   branded verified intake + rate ranges, feeding the LO dashboard, demoable in
   sandbox mode.
3. submit.loans wildcard + hostname routing.
4. Flow 1 per bank, when contracts, decisioning delegation, and AAN delivery are
   in place.

---

## 10. Decisions made

- Flow 1 decisioning is **bank-owned**; RAVEN orchestrates and delivers the
  decision + AAN on the bank's behalf (RAVEN is not a decisioning agent).
- Flow 1 decisioning is **asynchronous** (decision A): the borrower submits and
  sees an under-review confirmation; the bank decides on its own cadence and the
  result + any AAN are delivered after. Synchronous in-session decisioning is
  supported only where a bank exposes a real-time decision API.
- **One Intake entity** (decision B): the data pull and loan intent live on a
  single record (generalizing today's `VerificationRequest`) with `flowKind` +
  optional loan/decision fields. No separate Application entity.
- Flow 3 (data_only): the **data requester chooses the modules**; the flow is
  **product-agnostic**.
- `full_application` **may be publicly available** (reachable from `/apply`).
- **Path encodes the flow** (`/apply`, `/check-rate`, `/verify`), driven by the
  same underlying components.
- Demo and live share one platform; **demo = sandbox = mock providers**.
- The LO dashboard stays in the Next.js `dashboard/` app.
- The borrower UI is a **Next.js app hosted on Vercel** (thin client over the
  Elysia API); Elysia is the pure logic/data/API layer.
- Subdomain-per-tenant is served by **one Vercel deployment + wildcard
  `*.submit.loans` + host-based middleware**, not one deploy per tenant; custom
  bank domains are added via the Vercel Domains API.
- White-label subdomains live on **submit.loans**.

## 11. Open decisions

- Mode placement confirmed at the host/deployment level (vs a tenant flag)?
- Build the `MEMBER#` banking-user projection now (enables LO assignment) or
  defer and assign by raw Clerk userId?
- Single `WLCONFIG` item now vs splitting rate cards out for independent
  versioning from day one?
- Borrower identity reuse across white-label banks: one shared `USER#`
  (cross-tenant, consent-gated, current platform behavior) vs stricter
  per-tenant isolation for white-label?
- Soft-pull "check your rate" prequalification as a future fourth variant
  (between flow 2 and flow 1), or keep the menu at three?
