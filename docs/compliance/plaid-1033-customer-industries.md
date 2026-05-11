# Plaid §1033 Diligence Response — Customer Industries

**Question:** Please describe your customers to whom you're selling your solution. For example, what industry are they in? Do you support any high-risk industries or merchants? This may include, but is not limited to, customers involved in online gaming, gambling, cannabis, or adult services.

---

## Customer base

RAVEN's customers are exclusively U.S.-chartered, federally insured financial institutions — community banks, regional banks, federal savings associations, mutual holding companies, and credit unions. We do not sell to non-bank lenders, fintechs, payment processors, brokers, MSPs, consumer-facing apps, or any non-regulated commercial entity.

Every customer must hold a current FDIC Certificate, OCC Charter, NCUA Charter, or state bank/credit union charter, verified at onboarding against the relevant regulator's public registry, with their charter status reconfirmed at annual recertification. Examples of our customer profile include institutions in the $200M–$10B asset range, headquartered in the United States, primarily in the Southeast, originating mortgages, HELOCs, commercial real estate, and small business loans.

The consumer-facing product offered to the end consumer is the regulated banking product (e.g., a mortgage application, HELOC, deposit account opening) issued by the chartered institution itself. RAVEN is the verification and aggregation infrastructure that supports the institution in fulfilling that product.

## High-risk industries and merchants

RAVEN does not support — and is contractually prohibited from supporting — any of the following categories of customer or end-use:

- Cannabis, hemp, or cannabis-related businesses (MRBs), including ancillary service providers
- Online or offline gambling, sports betting, daily fantasy sports, lotteries, or casino operators
- Adult content, adult entertainment, or adult services
- Firearms, ammunition, or weapons sales outside FFL-licensed banking customers
- Cryptocurrency exchanges, wallet providers, ATMs, or money transmitters that are not chartered depository institutions
- Money services businesses (MSBs) that are not licensed and chartered as banks
- Payday, title, or short-term high-cost consumer lenders
- Debt-collection agencies, debt-relief, or credit-repair services
- Pyramid schemes, multi-level marketing, or telemarketing operations
- Shell companies, unregistered investment vehicles, or entities lacking transparent beneficial ownership
- Any entity appearing on OFAC SDN, Consolidated Sanctions, or equivalent international sanctions lists
- Any entity engaged in unlawful activity under U.S. federal law

These exclusions are enforced through three controls:

1. **Onboarding eligibility.** Charter verification at tenant creation excludes by definition any business that is not a chartered, federally insured depository institution. There is no pathway in the platform for a non-bank to obtain a production API key.
2. **Customer Agreement.** The agreement signed by every customer prior to production access contains an express Prohibited and High-Risk Industries clause and an end-use restriction limiting consumer data use to the institution's own consumer-facing lawful banking products and permissible purposes under FCRA, GLBA, and §1033.
3. **Ongoing monitoring.** Customers are sanctions-screened at onboarding and re-screened annually. Adverse media is reviewed at the same cadence. Any material change in charter status, regulatory standing, or business activity is grounds for suspension of production access pending review.

## Roles under §1033

Because every RAVEN customer is a chartered, regulated, federally insured financial institution offering its own consumer-facing banking products, the Authorized Third Party at the end of the data flow is in every case a supervised financial institution with primary regulator oversight (OCC, FDIC, NCUA, Federal Reserve, or state banking department). RAVEN does not aggregate consumer data on behalf of, or deliver it to, any high-risk industry or merchant.
