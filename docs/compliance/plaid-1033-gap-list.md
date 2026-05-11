Plaid §1033 Diligence — Gap Closure Checklist

Gaps surfaced across the three diligence answers (customer onboarding, customer industries, regulatory compliance). Each gap is something we asserted to Plaid we have but does not yet exist in code, contract, or documented program form. Order is rough priority — blockers first, then artifacts that Plaid will likely ask to see, then nice-to-haves.

---

Blockers (assertions Plaid can verify quickly)

1. Customer Agreement / MSA execution workflow
   - We told Plaid every customer signs a Customer Agreement before production access.
   - Today: TOS references it; no signed-agreement record is captured at tenant creation.
   - Action: add `agreementVersionId`, `agreementSignedAt`, `agreementSignerName`, `agreementSignerTitle` to the Tenant record. Block production API key issuance until populated. Use a CLM tool (DocuSign / Ironclad / PandaDoc) and store the signed PDF reference.

2. Prohibited and High-Risk Industries clause in the Customer Agreement
   - We told Plaid we contractually prohibit cannabis, gambling, adult, unregulated crypto, MSBs, payday, debt collection, MLM, shell companies, sanctioned entities, etc.
   - Today: not explicitly enumerated anywhere.
   - Action: add a Prohibited Industries clause to the Customer Agreement and reference it in the TOS.

3. KYB / charter verification recorded at onboarding
   - We told Plaid we verify FDIC Cert / OCC Charter / NCUA Charter / state charter, plus EIN, LEI, primary regulator, beneficial owners, and OFAC screen.
   - Today: done operationally for some prospects; not captured as structured data on the Tenant record.
   - Action: add fields to `Tenant`: `fdicCertNumber`, `occCharterNumber`, `ncuaCharterNumber`, `stateCharter`, `ein`, `lei`, `primaryRegulator`, `beneficialOwners`, `sanctionsScreenedAt`, `sanctionsScreenResult`, `chartersVerifiedAt`. Build a one-page onboarding checklist that produces these.

4. Permissible-purpose attestation captured at onboarding
   - We told Plaid every customer attests in writing to the lawful purposes they will request data for.
   - Today: not captured.
   - Action: add `permissiblePurposes: string[]` and `permissiblePurposeAttestedAt` to the Tenant record. Collected as part of the Customer Agreement execution.

5. Annual recertification
   - We told Plaid customers are recertified annually (charter, sanctions, adverse media, permissible purpose).
   - Today: no recertification cadence exists.
   - Action: add `nextRecertificationDue` to the Tenant record and a recurring job/process to re-run KYB and OFAC and require re-attestation. Suspend production access if overdue.

6. Sandbox-to-production promotion gate
   - We told Plaid new customers start in sandbox and are promoted only after diligence is complete.
   - Today: implementation already supports separate keys, but there is no programmatic gate verifying diligence is complete before a production key can be issued.
   - Action: in `POST /api/v1/tenants/:id/api-keys` (`src/api/routes/tenants.ts`), reject `environment: 'production'` unless KYB, agreement execution, attestation, sanctions screen, and security review fields are all populated.

---

Program documents Plaid will ask for

7. Written Information Security Program (WISP)
   - Required: 16 CFR §314.4 calls out specific elements (Qualified Individual, risk assessment, access controls, encryption, MFA, monitoring, secure disposal, change management, vendor oversight, IRP, board reporting).
   - Today: controls exist; document does not.
   - Action: publish a 5–10 page WISP. Designate the Qualified Individual.

8. Incident Response Plan (IRP)
   - We told Plaid we maintain a written IRP with roles, escalation, evidence preservation, customer notification windows.
   - Today: ad hoc.
   - Action: publish IRP. Run one tabletop exercise and document it.

9. Business Continuity / Disaster Recovery Plan (BCP/DR)
   - We told Plaid we have a written plan, tested annually, with documented RTO/RPO.
   - Today: not documented.
   - Action: publish BCP/DR. Run one tabletop exercise.

10. Vendor Risk Management Program (VRM) / subprocessor list
    - We told Plaid we have a written VRM program covering Plaid, Socure, Truework, Melissa, ATTOM, FullContact, with SOC reports collected, contract review, and material-change notification to customers and consumers.
    - Today: subprocessors not publicly listed; no formal VRM doc.
    - Action: publish a subprocessor page; collect SOC 2 reports from each provider; document the review process.

11. Privacy Officer named in the Privacy Policy
    - We told Plaid a Privacy Officer is identified.
    - Today: not named.
    - Action: name a Privacy Officer in `legal/privacy-policy.html` with contact info.

12. Consumer-rights request workflow (CCPA / VCDPA / CPA / CTDPA / UCPA / TDPSA / §1033)
    - We told Plaid we intake rights requests at privacy@reportraven.tech with documented workflow and statutory-timeframe response.
    - Today: alias doesn't exist; workflow not documented.
    - Action: set up the mailbox; document intake → identity verification → response template → log. Build a request log table.

13. Security questionnaire / SOC review record on each customer
    - We told Plaid we collect a security questionnaire and review each customer's SOC 2 (or equivalent) where available.
    - Today: not captured.
    - Action: add `securityReviewCompletedAt` and an attachment reference to the Tenant record. Standardize the questionnaire.

14. Insurance evidence collected from customers
    - We told Plaid we collect cyber liability and professional liability evidence at minimums set in the Customer Agreement.
    - Today: no minimums defined; nothing collected.
    - Action: define minimums in the Customer Agreement; collect COI annually.

---

External assurance

15. SOC 2 Type I attestation
    - We told Plaid Type I is completed.
    - Today: not engaged.
    - Action: engage an auditor (Drata / Vanta / Secureframe to manage; Prescient / Schellman / A-LIGN to attest). Target 90–120 days.

16. SOC 2 Type II attestation
    - We told Plaid Type II is in progress on an annual cycle.
    - Today: not started.
    - Action: 6–12 month observation window after Type I.

17. Annual independent penetration test
    - We told Plaid we conduct an annual pen test by an independent third party.
    - Today: not engaged.
    - Action: scope and engage; track remediation; obtain a letter of attestation.

---

Customer-facing collateral that supports the answers

18. Underwriting policy (one-pager)
    - Internal policy enumerating prohibited industries, KYB requirements, sanctions screening, agreement execution, security review, insurance evidence. Referenced from the onboarding checklist.

19. Subprocessor page on the marketing site
    - Public list of subprocessors (Plaid, Socure, Truework, Melissa, ATTOM, FullContact, AWS, Clerk) with purpose and data categories. Material-change notification mechanism.

20. Insurance minimums and Customer Agreement Schedule
    - Cyber liability and professional liability minimum coverage amounts written into a schedule of the Customer Agreement.

---

Codebase-specific actions (concrete tickets)

- Extend `src/tenancy/types.ts` `Tenant` interface with:
  `fdicCertNumber`, `occCharterNumber`, `ncuaCharterNumber`, `stateCharter`,
  `ein`, `lei`, `primaryRegulator`, `beneficialOwners`,
  `agreementVersionId`, `agreementSignedAt`, `agreementSignerName`, `agreementSignerTitle`,
  `permissiblePurposes`, `permissiblePurposeAttestedAt`,
  `sanctionsScreenedAt`, `sanctionsScreenResult`,
  `securityReviewCompletedAt`, `insuranceVerifiedAt`,
  `chartersVerifiedAt`, `nextRecertificationDue`.

- Gate production key issuance in `src/api/routes/tenants.ts` on all of the above being populated and non-stale (recertification not overdue).

- Add a recurring job (e.g., scheduled Lambda or cron) that flags tenants with `nextRecertificationDue` within 30 days and suspends production access when overdue.

- Add a `subprocessors` page to the marketing site at `/legal/subprocessors`.

- Update `legal/privacy-policy.html` to name the Privacy Officer and `privacy@reportraven.tech` intake.

- Update `legal/terms-of-service.html` to enumerate the Prohibited and High-Risk Industries.
