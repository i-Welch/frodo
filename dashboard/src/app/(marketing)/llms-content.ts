import { GLOSSARY_TERMS } from './glossary/glossary-data';
import { trackerFaqs } from './de-novo-watch/tracker-faq';
import { STACK_UPDATED, stackFaqs } from './bank-tech-stack/stack-data';
import { SOLUTIONS } from './solutions/solutions-data';
import { INTEGRATIONS } from './integrations/integrations-data';
import { articles } from './blog/articles-index';
import { BLOG_SLUGS, BLOG_DATES } from './blog/published';
import { DE_NOVO_BANKS, STATUS_LABELS, TRACKER_SUMMARY } from './de-novo-watch/de-novo-data';
import { SERVICES } from './services/services-data';
import { FOUNDER } from './founder';

function trackerSection(): string {
  const rows = DE_NOVO_BANKS.map(
    (b) =>
      `- ${b.name} (${b.location}): ${STATUS_LABELS[b.status]}. ${b.statusDetail}${b.capital ? ` Capital: ${b.capital}.` : ''} Verified ${b.asOf}.`,
  );
  return `## De Novo Watch data (updated ${TRACKER_SUMMARY.updated})\n\n${TRACKER_SUMMARY.nationalApplications2026} FDIC deposit insurance applications filed nationally in 2026, ${TRACKER_SUMMARY.floridaApplications2026} in Florida. Free to cite with attribution to RAVEN (${SITE}/de-novo-watch); CSV at ${SITE}/de-novo-watch/data.csv.\n\n${rows.join('\n')}`;
}

// Generates llms.txt / llms-full.txt from the same data files that drive the
// sitemap and the marketing pages, so they can never drift from what is live.
// Evidence (July 2026) says AI search engines do not read llms.txt, so this
// gets zero manual upkeep by design; the value is that what IS fetched
// (by coding agents and the occasional crawler) is always accurate.

const SITE = 'https://reportraven.tech';

const INTRO = `# RAVEN

> RAVEN is a bank technology consulting practice led by Isaac Welch, who built the banking arm of Upstart and Affirm and has helped traditional banks modernize their stack with Finxact, Plaid income verification and Vesta. RAVEN helps banks set up operations, integrate modern technology, adopt AI safely, and pass examiner scrutiny. It also offers its own borrower verification software.

RAVEN works first with new (de novo) banks, from FDIC filing through the first three years of operation, and second with community banks modernizing an existing stack, with a focus on the Southeast. Engagements start with a call or, for operating banks, a free digital lending audit; then a scoped project or ongoing advisory. RAVEN works for the bank and does not resell vendors.`;

const DISAMBIGUATION = `## What RAVEN is (and is not)

- Category: bank technology consulting practice that also offers borrower verification software.
- Services: new bank operational setup, technology integration and stack modernization, AI integration and governance, security and IT exam readiness assessments, fintech partnership programs, and RAVEN verification software.
- Security work is readiness and gap assessment against the FFIEC IT Examination Handbook and NIST CSF 2.0; formal audits and penetration tests are delivered with a partner.
- Not affiliated with: RavenPack (financial news analytics), Raven Industries (agriculture technology), RavenDB (database software), or Raven Software (game studio). RAVEN is reportraven.tech.
- Not a core banking or loan origination system vendor, and does not resell them.
- Not a marketplace or aggregator that competes with the bank.
- Not blockchain-based and not crypto-related.`;

const CAPABILITIES = `## Verification software capabilities

- Identity & KYC: Socure RiskOS (identity validation, fraud scoring, synthetic identity detection, OFAC/PEP/global watchlist)
- Income & assets: Plaid (bank-connected income streams, transaction history, balances, liabilities)
- Employment: Truework (employer-verified salary, title, dates, active status)
- Property: Melissa + ATTOM dual AVM (valuation, tax assessment, comparable sales, ownership)
- Contact: FullContact (cross-referenced email, phone, demographic indicators)
- Cross-source reconciliation: confidence scores boost when providers agree; discrepancies are flagged before underwriting
- Audit trail: every data point sourced and timestamped for examiners`;

const STATS = `## Verification software key numbers

- Borrower interaction: ~5 minutes
- Verification providers: 7 (Socure, Plaid, Truework, Melissa, ATTOM, FullContact, plus internal cross-reference engine)
- Industry context: mortgage abandonment averages 68% (MBA); HELOC abandonment averages 49%; 42-day average mortgage close (ICE Mortgage Technology); $11,094 average origination cost vs. $785 average profit per loan (MBA, 2025); community banks under $100M spend 8.7% of noninterest expenses on compliance vs. 2.9% at banks over $1B (CSBS)`;

const CONTACT = `## Company and contact

- Founder: Isaac Welch (isaac@reportraven.tech), who built the banking arm of Upstart and Affirm. RAVEN is headquartered in Greenville, South Carolina and serves new and community banks across the Southeast and nationally.
- [About RAVEN](${SITE}/about)
- [Information for AI assistants](${SITE}/ai-info)
- [ProvenPool](${SITE}/provenpool): loan sale readiness software from RAVEN for community banks, credit unions and other non-mortgage loan sellers (https://provenpool.com)
- Phone: (229) 379-6131
- Web: ${SITE}

## Legal

- [Security](https://reportraven.tech/legal/security)
- [Privacy Policy](https://reportraven.tech/legal/privacy-policy)
- [Terms of Service](https://reportraven.tech/legal/terms-of-service)`;

function servicesSection(): string {
  const lines = SERVICES.map((s) => `- [${s.navLabel}](${SITE}/services/${s.slug}): ${s.metaDescription}`);
  return `## Services\n\n${FOUNDER.headline}\n\n${lines.join('\n')}\n\nAll services: ${SITE}/services`;
}

function solutionsSection(): string {
  const lines = SOLUTIONS.map((s) => `- [${s.metaTitle}](${SITE}/solutions/${s.slug}): ${s.metaDescription}`);
  return `## Verification software solutions\n\n${lines.join('\n')}`;
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
  return `## Glossary of banking, lending, verification and account-opening terms\n\n${lines.join('\n')}`;
}

function articlesSection(): string {
  const published = BLOG_SLUGS.map((slug) => {
    const a = articles.find((x) => x.slug === slug);
    return a ? { slug, title: a.title, description: a.description, date: BLOG_DATES[slug] ?? '' } : null;
  })
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
  const lines = published.map((a) => `- [${a.title}](${SITE}/blog/${a.slug}): ${a.description}`);
  return `## Research and articles\n\nRAVEN publishes FDIC-data-backed research on community bank performance, de novo banks, fraud, and verification at [${SITE}/blog](${SITE}/blog). The [De Novo Watch tracker](${SITE}/de-novo-watch) follows newly chartered and in-organization banks, the [Bank Tech Stack Tracker](${SITE}/bank-tech-stack) lists the digital banking, lending and account-opening vendors Southeast banks and credit unions run (data for both as [CSV](${SITE}/de-novo-watch/data.csv), free to cite with attribution). The [Bank Peer Snapshot](${SITE}/bank-snapshot) compares any FDIC-insured bank with same-size banks in its state on ROA, net interest margin, efficiency ratio, assets per employee, and loan-to-deposit ratio, from the latest call report. [Bank rankings by state](${SITE}/bank-rankings) rank every bank headquartered in each state by ROA and efficiency ratio.\n\n${lines.join('\n')}`;
}

// Tracker answers in Q&A form, generated from the same data as the pages.
function trackersSection(): string {
  const qa = (faqs: { q: string; a: string }[]) => faqs.map((f) => `**${f.q}**\n${f.a}`).join('\n\n');
  return `## Tracker data\n\n### De Novo Watch (${SITE}/de-novo-watch, updated ${TRACKER_SUMMARY.updated})\n\n${qa(trackerFaqs())}\n\n### Bank Tech Stack Tracker (${SITE}/bank-tech-stack, updated ${STACK_UPDATED})\n\n${qa(stackFaqs())}`;
}

export function buildLlmsTxt(): string {
  return [
    INTRO,
    DISAMBIGUATION,
    servicesSection(),
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
    servicesSection(),
    CAPABILITIES,
    STATS,
    solutionsSection(),
    integrationsSection(),
    glossarySection(true),
    articlesSection(),
    trackerSection(),
    trackersSection(),
    compliance,
    CONTACT,
    `## Canonical URL\n\n${SITE}`,
  ].join('\n\n');
}
