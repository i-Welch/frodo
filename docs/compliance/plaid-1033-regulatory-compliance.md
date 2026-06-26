Plaid §1033 Diligence Response — Regulatory Compliance Obligations

Question: Please describe your regulatory compliance obligations and how you comply with them.

---

Regulatory framework

Because RAVEN is a third-party service provider to U.S.-chartered, federally insured depository institutions, our compliance perimeter is shaped both by laws of direct application and by laws and regulations our customers must comply with and that flow down to us by contract and by §1867 examination authority.

Laws of direct application

- Bank Service Company Act (12 U.S.C. §1867(c)). As a vendor providing services to FDIC-insured institutions, RAVEN is subject to examination by the FDIC, OCC, NCUA, and Federal Reserve to the same extent as if the services were performed by the institution itself.
- Gramm-Leach-Bliley Act, Safeguards Rule (16 CFR Part 314). As a service provider that receives nonpublic personal information from financial institutions, RAVEN maintains a written information security program designed to protect the confidentiality, integrity, and availability of customer information.
- CFPB Personal Financial Data Rights Rule (12 CFR Part 1033). RAVEN supports authorized third parties (our bank customers) and a designated data aggregator (Plaid) in delivering consumer-permissioned data flows, and observes the obligations applicable to entities supporting that flow.
- State data privacy laws including the California Consumer Privacy Act (CCPA/CPRA), Virginia Consumer Data Protection Act, Colorado Privacy Act, Connecticut Data Privacy Act, Utah Consumer Privacy Act, Texas Data Privacy and Security Act, and other state laws applicable to our processing role.
- State data breach notification laws of all 50 states, the District of Columbia, and U.S. territories.
- OFAC sanctions program. RAVEN screens its customers, their beneficial owners, and key principals against OFAC SDN and Consolidated Sanctions lists at onboarding and annually thereafter.
- NYDFS Cybersecurity Regulation (23 NYCRR Part 500) where applicable through our customer base in New York.

Laws applicable to our customers, with contractual flow-down to RAVEN

- Fair Credit Reporting Act (FCRA). RAVEN is not a consumer reporting agency. Our customers are contractually responsible for FCRA compliance when our outputs are used in connection with a consumer report, and our Customer Agreement requires them to maintain permissible-purpose attestations.
- Equal Credit Opportunity Act / Regulation B and other anti-discrimination laws governing credit decisions.
- Truth in Lending Act / Regulation Z, RESPA, HMDA, and other lending regulations whose subject matter touches data RAVEN processes for our customers.
- Bank Secrecy Act / AML / FinCEN CDD rule. Our customers operate their own BSA programs; the KYC, fraud, and watchlist data RAVEN delivers supports those programs but does not replace them.
- FFIEC Information Technology Examination Handbook (Information Security, Business Continuity, Outsourcing Technology Services booklets) — followed by RAVEN as a TPRM-relevant service provider.

---

How RAVEN complies

1. Written Information Security Program (GLBA Safeguards Rule)

RAVEN maintains a written information security program reviewed at least annually, owned by a designated Qualified Individual, and aligned to the elements required under 16 CFR §314.4. The program governs:

- Risk assessment and risk-based control selection
- Access controls and least-privilege administration
- Asset and data inventory
- Encryption of customer information in transit and at rest
- Secure software development practices
- Multi-factor authentication for administrative access
- Monitoring and logging of authorized user activity and detection of unauthorized access
- Procedures for secure disposal and crypto-shredding of customer information
- Change management
- Service provider oversight
- Annual review and testing of safeguards
- Written incident response plan
- Annual reporting to the governing body

2. Technical controls

Specific implementation details (published in our Security Practices statement at https://app.reportraven.tech/legal/security):

- Encryption at rest: AES-256-GCM with per-user Data Encryption Keys (DEKs); DEKs are themselves encrypted under AWS KMS master keys (envelope encryption); field-level encryption such that compromise of one field does not expose others; key rotation managed by AWS KMS.
- Crypto-shredding. Deleting a consumer's DEK renders that consumer's data permanently unrecoverable, including from backups — supporting consumer revocation and deletion obligations under §1033 and state privacy laws.
- Encryption in transit: TLS 1.2 or higher on all API endpoints and on all outbound calls to third-party providers.
- API key management: keys stored as SHA-256 hashes, with a short-prefix lookup index — the raw key is shown only once at creation, never stored.
- Multi-tenant isolation at the data layer, with module-level permission gating per tenant and full separation between sandbox and production environments.
- Consumer verification tiers: OTP, enhanced OTP (email + phone), and identity-match; OTPs are cryptographically random, hashed at rest, expire in 10 minutes, and lock out after 3 failed attempts.
- Audit trail. Every data change is recorded as an immutable event with actor, field-level before/after values, timestamp, and confidence score. Consent records store SHA-256 hashes of the exact text shown to the consumer.
- Logging. Structured JSON logs via Pino; no PII written to logs; per-request tenant ID and request ID captured for examiner inquiries.
- Provider credentials are read from environment variables at runtime, never hardcoded, and never logged.

3. Privacy and consumer rights

RAVEN's Privacy Policy describes data collection, use, sharing, retention, and the consumer rights granted under §1033 and state privacy laws (access, correction, deletion, portability, revocation of authorization). Consumer rights requests are intaken at privacy@reportraven.tech and routed through a documented workflow with response within statutory timeframes (45 days under CCPA, 45 days under VCDPA/CPA, etc.). A named Privacy Officer is identified in the Privacy Policy.

4. Data retention

Retention windows are codified in our Data Retention Policy (https://app.reportraven.tech/legal/data-retention), mapped to FCRA, GLBA, BSA/AML, FERPA, and contractual obligations. Data is retained only as long as necessary for the consumer-requested product, with documented permissible-purpose records preserved for legally required retention windows after consumer revocation.

5. Incident response and breach notification

RAVEN maintains a written Incident Response Plan with defined roles, escalation paths, evidence preservation procedures, and customer notification commitments. Customer notification of confirmed incidents follows our Customer Agreement (within the time windows required for the customer to satisfy its own GLBA Safeguards Rule and state breach-notification obligations). RAVEN supports its customers in meeting their notice obligations to consumers and regulators.

6. Business continuity and disaster recovery

A written Business Continuity / Disaster Recovery Plan is maintained, tested at least annually through tabletop exercises, and aligned to the FFIEC Business Continuity Management booklet. RTO and RPO targets are documented and shared with customers under NDA on request.

7. Vendor and subprocessor management

A written Vendor Risk Management Program governs onboarding and ongoing oversight of RAVEN's data providers (including Plaid, Socure, Truework, Melissa, ATTOM, FullContact). Each provider is reviewed for SOC 2 (or equivalent), data-handling practices, security posture, contract terms permitting use of consumer-permissioned data for our use case, and ongoing performance. The full list of subprocessors is published and consumers and customers receive notice of material changes.

8. Sanctions and AML

OFAC SDN and Consolidated Sanctions screening is performed against every customer, the customer's beneficial owners, and key principals at onboarding and annually. Sanctions hits block production access pending review. RAVEN itself does not provide payments, money transmission, or money services, and is not directly subject to BSA registration — but our screening posture supports our customers' BSA programs and our own AML-adjacent risk management.

9. External assurance

RAVEN engages an independent auditor for SOC 2 Type II attestation on an annual cycle (Type I completed; Type II in progress). Annual penetration testing is conducted by an independent third party, with findings tracked to remediation. Audit reports and pen test letters are available to customers and partners under NDA on request.

10. Regulatory examination support

As a Bank Service Company Act vendor, RAVEN cooperates with examination requests from the FDIC, OCC, NCUA, Federal Reserve, and state banking regulators conducted through or on behalf of our customers, and maintains the documentation, audit trail, and access controls necessary to support those examinations.

---

Roles under §1033

Our compliance program is designed around the reality that RAVEN's customers are the consumer-facing Authorized Third Parties under §1033, that Plaid is the designated data aggregator, and that RAVEN is the infrastructure that supports both. The obligations described above are the obligations we take on directly; the obligations of our customers (consumer authorization, permissible-purpose attestation, FCRA, ECOA, and the lending-specific federal and state rules) are contractually required of them in every Customer Agreement and supported by the audit trail, encryption, retention, and revocation controls that RAVEN provides.
