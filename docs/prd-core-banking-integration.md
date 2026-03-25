# PRD: Core Banking System Integration

## Problem

Regional banks using Frodo for borrower data enrichment need the verified data to flow into their core banking system and/or loan origination system. Without this, a loan officer enriches a borrower in Frodo and then re-keys the same data into FIS, Jack Henry, or Fiserv — eliminating the time savings that Frodo provides.

## Goal

Enable Frodo to push enriched borrower profiles directly into the three core banking platforms that collectively power the majority of regional banks, starting with the one most aligned to our target market.

## Target Users

- Loan officers at regional banks ($1B-$50B in assets) originating CRE, small business, and multi-family loans
- Bank IT/ops teams responsible for integrating vendor systems with their core

## Success Metrics

- Loan officer can enrich a borrower in Frodo and have the data appear in their core system without manual re-entry
- Time from enrichment to data-in-core under 30 seconds
- Zero manual data re-entry for fields Frodo can verify

---

## Integration Targets

### 1. Jack Henry (Priority: First)

**Why first:** Jack Henry serves community and regional banks under $10B in assets — our exact target market for CRE and small business lending. They are the most integration-friendly of the three, with a published API ecosystem and a partner program designed for third-party vendors.

**Core platforms:**
- **SilverLake** — banks over $1B
- **CIF 20/20** — banks under $1B
- **Symitar** — credit unions

**Integration approach:**
- **Jack Henry Open API (jXchange)** — SOAP/REST API layer that sits in front of all three core platforms. Provides standardized endpoints for creating/updating customer records, accounts, and loan records regardless of which core the bank runs.
- **Banno Digital Platform** — Jack Henry's digital banking layer. Has a plugin/extension model that could host a Frodo UI for loan officers.
- **iPay/Symitar connector** — for credit union customers.

**What to build:**
1. **Export adapter** (`src/integrations/jack-henry/`) — translates a Frodo enriched borrower profile into jXchange API calls:
   - Customer record creation/update (identity, contact, residence data)
   - Loan application record (credit scores, employment, income, property data)
   - Document attachment (enrichment report as PDF or structured data)
2. **Field mapping config** — declarative mapping from Frodo module fields to jXchange field names. Each bank may customize field mappings based on their core configuration.
3. **Webhook/callback** — notify the core when enrichment completes so the loan officer sees updated data without refreshing.

**Integration path:**
- Join the Jack Henry Vendor Integration Program (VIP)
- Get certified on jXchange API
- Sandbox access through the program
- Bank-by-bank deployment (each bank authorizes the connection)

**Key contacts:**
- Jack Henry Vendor Integration Program: jackhenry.com/partners
- Developer portal: developer.jackhenry.com

---

### 2. Fiserv (Priority: Second)

**Why second:** Fiserv's DNA and Premier platforms are common in mid-tier regionals ($5B-$50B). These banks do significant CRE volume and are large enough to have IT teams that can support an integration.

**Core platforms:**
- **DNA** — modern, API-first, the strategic platform Fiserv is pushing
- **Premier** — legacy but very widespread
- **Precision** — smaller banks

**Integration approach:**
- **Fiserv Developer Studio** — unified API portal for all Fiserv products. REST APIs with OAuth2 authentication.
- **Banking Hub API** — Fiserv's standardized abstraction layer (similar to Jack Henry's jXchange). Supports account creation, customer management, and loan servicing across DNA/Premier/Precision.
- **AppMarket** — Fiserv's app marketplace. Listing Frodo here gives distribution to their entire bank customer base.

**What to build:**
1. **Export adapter** (`src/integrations/fiserv/`) — translates Frodo borrower data into Banking Hub API calls:
   - Party/customer record (identity, contact, residence)
   - Credit application record (credit, employment, financial)
   - Collateral record (property data for CRE loans)
2. **Field mapping config** — Fiserv field names differ from Jack Henry's. Same declarative mapping pattern, different target schema.
3. **OAuth2 integration** — Fiserv uses OAuth2 with bank-specific client credentials. Each bank deployment gets its own credential set.

**Integration path:**
- Register at Fiserv Developer Studio (developer.fiserv.com)
- Sandbox access is self-serve for Banking Hub APIs
- Full integration requires Fiserv partnership agreement
- AppMarket listing requires certification

**Key contacts:**
- Fiserv Developer Studio: developer.fiserv.com
- Partner program: fiserv.com/en/partners

---

### 3. FIS (Priority: Third)

**Why third:** FIS serves the largest regionals and super-regionals. These banks have more in-house engineering capacity and often build their own integrations. The sales cycle is longer, but the deal size is larger.

**Core platforms:**
- **Modern Banking Platform (MBP)** — cloud-native, newest offering
- **IBS** — traditional core for larger banks
- **Horizon** — community banks (overlaps with Jack Henry's market)

**Integration approach:**
- **FIS Code Connect** — API platform with REST/GraphQL endpoints. More modern than jXchange but less widely deployed.
- **FIS Open Solutions** — integration framework for IBS/Horizon. Older SOAP-based APIs.
- **For MBP banks** — cloud-native APIs, event-driven architecture. Best fit for Frodo's architecture since we can emit events when enrichment completes.

**What to build:**
1. **Export adapter** (`src/integrations/fis/`) — same pattern as Jack Henry/Fiserv but targeting FIS field schemas
2. **Event bridge** (for MBP) — publish enrichment completion events to FIS's event bus so the core reacts in real-time
3. **Batch export** (for IBS/Horizon) — older cores may prefer nightly file-based imports over real-time API calls

**Integration path:**
- Register at FIS Developer Portal
- Partnership requires FIS sales engagement
- Longer certification process than Jack Henry or Fiserv

**Key contacts:**
- FIS Developer Portal: fisglobal.com/developer
- Partner program: fisglobal.com/partner-with-us

---

## Architecture

### Export adapter pattern

All three integrations follow the same pattern. The core-specific logic is isolated in an adapter while the shared pipeline is reusable.

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Frodo        │────▶│ Export Pipeline   │────▶│ Core Adapter     │
│ Enriched     │     │                  │     │ (Jack Henry /    │
│ Borrower     │     │ 1. Read modules  │     │  Fiserv / FIS)   │
│ Profile      │     │ 2. Apply mapping │     │                  │
│              │     │ 3. Validate      │     │ Writes to core   │
│              │     │ 4. Send to core  │     │ banking system   │
└──────────────┘     └──────────────────┘     └─────────────────┘
```

### Shared components to build

1. **Export pipeline** (`src/integrations/export-pipeline.ts`)
   - Reads all enriched modules for a user (identity, contact, credit, financial, employment, residence, education)
   - Applies a core-specific field mapping (declarative, same pattern as `src/providers/mapper.ts`)
   - Validates required fields are present
   - Calls the core adapter to push the data

2. **Core adapter interface** (`src/integrations/types.ts`)
   ```typescript
   interface CoreAdapter {
     name: string; // "jack-henry", "fiserv", "fis"
     pushBorrowerProfile(profile: BorrowerExport, config: BankConfig): Promise<ExportResult>;
     pushLoanApplication(application: LoanExport, config: BankConfig): Promise<ExportResult>;
   }
   ```

3. **Field mapping configs** (`src/integrations/<core>/field-mappings.ts`)
   - One per core system
   - Maps Frodo module fields → core system field names
   - Banks can override individual mappings via tenant config

4. **API route**
   ```
   POST /api/v1/users/:id/export/:core  →  ExportResult
   ```
   Triggers the export for a specific user to a specific core system. The tenant's bank config determines connection credentials and field overrides.

### Per-bank configuration

Each bank tenant gets a config block specifying:
- Which core system they use (jack-henry, fiserv, fis)
- Which core platform (SilverLake, DNA, MBP, etc.)
- API credentials for their core instance
- Field mapping overrides (if their core has custom fields)
- Which modules to export (some banks may only want credit + identity)

This lives in the tenant record and is set during bank onboarding.

---

## LOS Integration (Alternative Path)

Many banks use a Loan Origination System that sits between the loan officer and the core. Integrating at the LOS layer may be faster than going directly to the core, and covers banks regardless of which core they run.

**Common LOS platforms for regional bank CRE/SBA:**
- **nCino** — Salesforce-based, very popular with regionals. REST APIs. Good fit.
- **Abrigo (formerly Sageworks)** — strong in commercial lending. API available.
- **Baker Hill** — CRE and commercial focused. Partnership-based integration.
- **Encompass (ICE Mortgage Technology)** — residential mortgage, less relevant for CRE.

If a bank uses nCino or Abrigo for commercial lending, integrating there may deliver value faster than a core integration. The same export adapter pattern applies — just a different target API.

---

## Implementation Order

1. **Shared export pipeline + adapter interface** — build the framework first
2. **Jack Henry adapter** — join VIP, get jXchange sandbox, build + certify
3. **Fiserv adapter** — register at Developer Studio, build against Banking Hub API
4. **FIS adapter** — engage FIS partnership team, build against Code Connect or MBP
5. **LOS adapters (nCino, Abrigo)** — evaluate based on customer demand

## Open Questions

- Do we build a loan officer UI in Frodo, or is the enrichment triggered from the bank's existing LOS/core UI?
- How do we handle field mapping customization at scale — UI for bank IT teams, or professional services per bank?
- Should we support bidirectional sync (core → Frodo) for data the bank already has on the borrower?
- Pricing model: per-export, per-user, or bundled with enrichment?
