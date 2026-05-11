# Plaid §1033 Diligence Response — Customer Onboarding

**Question:** Please describe how you onboard your customers. For example, what information do you collect from them? Do they sign an agreement? What sort of due diligence checks do you perform on them?

---

## Customer onboarding overview

RAVEN's customers are exclusively U.S.-chartered banks, federal savings associations, and credit unions. We do not onboard non-regulated businesses, consumers, or sole proprietors. Onboarding is operated as a controlled, manual process by RAVEN staff — there is no public self-serve signup. New customers cannot reach production data until each step below is complete.

## 1. Information collected at onboarding

- Legal entity name, EIN, and state of organization
- FDIC Certificate Number, OCC Charter Number, or NCUA Charter Number (used to confirm the institution's current regulatory status via FDIC BankFind, OCC, or NCUA public registries)
- Legal Entity Identifier (LEI), where issued
- Primary regulator and last examination cycle
- Headquarters address and operating jurisdictions
- Authorized signer name, title, and contact information
- Technical and compliance points of contact
- Webhook and callback URLs for the API integration
- Stated permissible purposes for accessing consumer data (e.g., loan origination, account opening), recorded per FCRA §604 / GLBA §502 categories where applicable

## 2. Written agreement

Every customer signs RAVEN's Customer Agreement (incorporating our Terms of Service and Data Processing Addendum) before any production access is granted. The agreement is countersigned by an authorized officer of the institution and stored against the tenant record (agreement version, signing date, signer name and title). The agreement contractually binds the customer to:

- Use consumer data only for the disclosed permissible purpose
- Comply with FCRA, GLBA, ECOA, BSA/AML, and applicable state law
- Honor consumer revocation requests within the timeframes required under §1033
- Limit retention to what is reasonably necessary for the consumer's requested product
- Not sell, license, or use consumer data for cross-marketing
- Maintain administrative, technical, and physical safeguards consistent with the FFIEC Information Security Handbook and GLBA Safeguards Rule
- Pass through these obligations to any subprocessor
- Cooperate with consumer rights requests, including access, correction, and authorization-status inquiries

## 3. Due diligence performed before production access

Before a production API key is issued, RAVEN completes and records:

- **Charter and good-standing verification** against FDIC BankFind, OCC, NCUA, or state regulator registries
- **OFAC / SDN sanctions screening** of the entity and named beneficial owners
- **Beneficial ownership review** consistent with FinCEN CDD requirements for our own KYC posture
- **Adverse media review** of the institution and key principals
- **Security review**: completed RAVEN security questionnaire (mapped to SOC 2 / FFIEC controls), encryption-at-rest and in-transit confirmation, access-control attestation, incident-response contact, and review of the institution's most recent SOC 2 Type II report (or equivalent) where available
- **Insurance evidence**: cyber liability and professional liability coverage at minimums specified in the Customer Agreement
- **Permissible-purpose attestation**: written attestation of the lawful purposes for which the customer will request consumer data through RAVEN

All onboarding artifacts are stored against the tenant record, and each customer is recertified annually. Production API keys are environment-scoped, revocable on demand, and gated separately from sandbox access — new customers begin in sandbox and are promoted only after the diligence above is complete.

## 4. Roles under §1033

Under the §1033 framework, RAVEN's customers (the chartered financial institutions) are the consumer-facing Authorized Third Parties — they hold the direct consumer relationship and offer the consumer product (e.g., a mortgage, HELOC, deposit account) for which consumer-permissioned data is requested. RAVEN provides the verification and aggregation infrastructure that supports those institutions in fulfilling the products their consumers have requested. Plaid serves as the data aggregator within that flow. The onboarding diligence described above is designed to ensure that every RAVEN customer is a properly chartered, regulated, and contractually bound institution with a documented permissible purpose before any consumer data flows through the platform.
