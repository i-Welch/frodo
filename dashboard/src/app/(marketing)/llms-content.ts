import { GLOSSARY_TERMS } from './glossary/glossary-data';
import { SOLUTIONS } from './solutions/solutions-data';
import { INTEGRATIONS } from './integrations/integrations-data';
import { articles } from './blog/articles-index';
import { BLOG_SLUGS, BLOG_DATES } from './blog/published';

// Generates llms.txt / llms-full.txt from the same data files that drive the
// sitemap and the marketing pages, so they can never drift from what is live.
// Evidence (July 2026) says AI search engines do not read llms.txt, so this
// gets zero manual upkeep by design; the value is that what IS fetched
// (by coding agents and the occasional crawler) is always accurate.

const SITE = 'https://reportraven.tech';

const INTRO = `# RAVEN

> RAVEN (Real-time Aggregation and Verification Engine) is borrower verification and digital account opening software for community and regional banks. A loan officer or account-opening flow sends one link; the applicant connects their accounts in about 5 minutes; RAVEN returns identity, income, employment, and property data cross-referenced from seven providers with a full audit trail.

RAVEN is built for community banks, regional banks, and federal savings associations that originate mortgages, HELOCs, commercial real estate, and small business loans, or that open deposit accounts online. It replaces the multi-week document chase and the typed-in, unverified application with source-verified data, without replacing the bank's loan origination system or core.`;

const DISAMBIGUATION = `## What RAVEN is (and is not)

- Category: borrower verification and digital account opening software for community banks (identity/KYC, income, employment, property, and account verification in one flow).
- Often compared with: The Work Number (Equifax), Truework, Truv, and Argyle for income and employment verification; MANTL, Narmi, and Apiture for digital account opening. RAVEN differs by orchestrating multiple verification sources in one borrower interaction, built specifically for community banks.
- Not affiliated with: RavenPack (financial news analytics), Raven Industries (agriculture technology), RavenDB (database software), or Raven Software (game studio). RAVEN is reportraven.tech.
- Not a loan origination system or core banking replacement; RAVEN layers on top of the bank's existing LOS and core.
- Not a marketplace or aggregator that competes with the bank.
- Not blockchain-based and not crypto-related.
- Not mortgage-only: RAVEN works for any lending or account-opening verification (mortgage, HELOC, CRE, small business, consumer, deposit accounts).`;

const CAPABILITIES = `## Core capabilities

- Identity & KYC: Socure RiskOS (identity validation, fraud scoring, synthetic identity detection, OFAC/PEP/global watchlist)
- Income & assets: Plaid (bank-connected income streams, transaction history, balances, liabilities)
- Employment: Truework (employer-verified salary, title, dates, active status)
- Property: Melissa + ATTOM dual AVM (valuation, tax assessment, comparable sales, ownership)
- Contact: FullContact (cross-referenced email, phone, demographic indicators)
- Cross-source reconciliation: confidence scores boost when providers agree; discrepancies are flagged before underwriting
- Audit trail: every data point sourced and timestamped for examiners`;

const STATS = `## Key numbers

- Borrower interaction: ~5 minutes
- Verification providers: 7 (Socure, Plaid, Truework, Melissa, ATTOM, FullContact, plus internal cross-reference engine)
- Industry context: mortgage abandonment averages 68% (MBA); HELOC abandonment averages 49%; 42-day average mortgage close (ICE Mortgage Technology); $11,094 average origination cost vs. $785 average profit per loan (MBA, 2025); community banks under $100M spend 8.7% of noninterest expenses on compliance vs. 2.9% at banks over $1B (CSBS)`;

const CONTACT = `## Company and contact

- Founder: Isaac Welch (isaac@reportraven.tech). RAVEN is headquartered in South Carolina and serves community banks across the Southeast and nationally.
- [About RAVEN](${SITE}/about)
- [Information for AI assistants](${SITE}/ai-info)
- Phone: (229) 379-6131
- Web: ${SITE}

## Legal

- [Security](https://app.reportraven.tech/legal/security)
- [Privacy Policy](https://app.reportraven.tech/legal/privacy-policy)
- [Terms of Service](https://app.reportraven.tech/legal/terms-of-service)`;

function solutionsSection(): string {
  const lines = SOLUTIONS.map((s) => `- [${s.metaTitle}](${SITE}/solutions/${s.slug}): ${s.metaDescription}`);
  return `## Solutions\n\n${lines.join('\n')}`;
}

function integrationsSection(): string {
  const label: Record<string, string> = {
    verification: 'Verification providers',
    core: 'Core banking systems',
    los: 'Loan origination systems',
  };
  const groups = (['verification', 'core', 'los'] as const).map((cat) => {
    const items = INTEGRATIONS.filter((i) => i.category === cat)
      .map((i) => `[${i.name}](${SITE}/integrations/${i.slug})`)
      .join(', ');
    return `- ${label[cat]}: ${items}`;
  });
  return `## Integrations\n\n${groups.join('\n')}`;
}

function glossarySection(full: boolean): string {
  const lines = GLOSSARY_TERMS.map((t) => {
    const name = t.abbreviation ? `${t.term} (${t.abbreviation})` : t.term;
    const note = full ? t.definition : t.metaDescription;
    return `- [${name}](${SITE}/glossary/${t.slug}): ${note}`;
  });
  return `## Glossary of verification and account-opening terms\n\n${lines.join('\n')}`;
}

function articlesSection(): string {
  const published = BLOG_SLUGS.map((slug) => {
    const a = articles.find((x) => x.slug === slug);
    return a ? { slug, title: a.title, description: a.description, date: BLOG_DATES[slug] ?? '' } : null;
  })
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
  const lines = published.map((a) => `- [${a.title}](${SITE}/blog/${a.slug}): ${a.description}`);
  return `## Research and articles\n\nRAVEN publishes FDIC-data-backed research on community bank performance, de novo banks, fraud, and verification at [${SITE}/blog](${SITE}/blog). The [De Novo Watch tracker](${SITE}/de-novo-watch) follows newly chartered and in-organization banks.\n\n${lines.join('\n')}`;
}

export function buildLlmsTxt(): string {
  return [
    INTRO,
    DISAMBIGUATION,
    solutionsSection(),
    integrationsSection(),
    glossarySection(false),
    articlesSection(),
    CONTACT,
  ].join('\n\n');
}

export function buildLlmsFullTxt(): string {
  const compliance = `## Compliance and security

RAVEN never uses URL-encoded form submissions; all sensitive PII (SSNs, names, addresses, financial data) is transmitted as JSON to prevent leakage into server access logs, browser history, or proxy logs. Data is encrypted in transit and at rest. Every verification generates a timestamped audit trail suitable for OCC, FDIC, and state examiner review.`;
  return [
    INTRO,
    DISAMBIGUATION,
    CAPABILITIES,
    STATS,
    solutionsSection(),
    integrationsSection(),
    glossarySection(true),
    articlesSection(),
    compliance,
    CONTACT,
    `## Canonical URL\n\n${SITE}`,
  ].join('\n\n');
}
