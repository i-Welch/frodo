/**
 * Per-bank digital-lending audit content for /audit/<slug>.
 *
 * This is the sales narrative: an honest, sourced read of the bank's current
 * digital borrower experience, paired with the RAVEN white-label demo of what
 * it could be. Findings for Arthur State are grounded in public research of
 * arthurstatebank.com (June 2026).
 */

export interface AuditFinding {
  title: string;
  /** Visual weight only. */
  severity: 'gap' | 'friction' | 'note';
  body: string;
}

export interface JourneyStep {
  channel: string;
  detail: string;
  /** 'ok' = reasonable today, 'weak' = friction, 'missing' = no digital path. */
  status: 'ok' | 'weak' | 'missing';
}

export interface ComparisonRow {
  dimension: string;
  today: string;
  withRaven: string;
}

export interface AuditContent {
  slug: string;
  bankName: string;
  shortName: string;
  auditDate: string;
  /** Live white-label demo slug to embed/link (usually same as slug). */
  demoSlug: string;
  stats: { label: string; value: string }[];
  summary: string;
  currentJourney: JourneyStep[];
  findings: AuditFinding[];
  comparison: ComparisonRow[];
  sources: string;
}

export const AUDITS: AuditContent[] = [
  {
    slug: 'arthur-state-bank',
    bankName: 'Arthur State Bank',
    shortName: 'Arthur State',
    auditDate: 'June 2026',
    demoSlug: 'arthur-state-bank',
    stats: [
      { label: 'Total assets', value: '~$814M' },
      { label: 'Branches', value: '17' },
      { label: 'Online loan products', value: '1 of 6' },
      { label: 'Digital banking', value: 'Jack Henry' },
    ],
    summary:
      'Arthur State Bank runs a respectable digital-banking stack for existing customers (Jack Henry’s Banno) but offers almost no self-serve front door for new lending. Only mortgages have an online application, and it lives on a separate, dated third-party domain. Every other product (auto, personal, RV, watercraft, and all business lending) ends at “contact a loan officer.” The infrastructure to do better is already in place; what’s missing is a single, branded, verify-as-you-go intake.',
    currentJourney: [
      { channel: 'Mortgage', detail: 'Online application via Finastra Mortgagebot on a separate domain (mortgagewebcenter.com), legacy POS, breaks brand continuity', status: 'weak' },
      { channel: 'Auto / RV / Watercraft', detail: '“Contact one of our loan officers.” No application, no form, no after-hours capture', status: 'missing' },
      { channel: 'Personal loans', detail: '“Contact a loan officer.” Phone or branch only', status: 'missing' },
      { channel: 'Business / Commercial', detail: '“Get in touch with a loan officer.” No digital intake at all', status: 'missing' },
      { channel: 'Home equity / HELOC', detail: 'Not surfaced anywhere online', status: 'missing' },
      { channel: 'Deposit account opening', detail: 'Branch-only: bring ID, SSN, and a deposit in person', status: 'missing' },
      { channel: 'Existing-customer banking', detail: 'Jack Henry Banno at my.arthurstatebank.com, modern and capable', status: 'ok' },
    ],
    findings: [
      {
        title: 'One digital front door for lending, and it’s the hardest product',
        severity: 'gap',
        body: 'Mortgage is the only line a borrower can start online. The faster, higher-volume consumer products (auto, personal, HELOC) and all business lending have no apply button. Demand that arrives at 9pm on a phone has nowhere to go but a “call us” message, which is exactly where abandonment happens.',
      },
      {
        title: 'The mortgage POS breaks brand continuity',
        severity: 'friction',
        body: 'The “Apply Now” button hands the borrower to mortgagewebcenter.com, a legacy Finastra Mortgagebot portal on a different domain with a different look. At the single most important conversion moment, the customer leaves Arthur State’s brand for a generic vendor screen.',
      },
      {
        title: 'You already own the platform to fix this',
        severity: 'note',
        body: 'Arthur State is on Jack Henry for digital banking. A white-label intake that syncs applications straight into the Jack Henry core is an incremental addition to a stack you already run, not a rip-and-replace. The gap is intake and verification, not infrastructure.',
      },
      {
        title: 'No verification layer means manual document chase',
        severity: 'friction',
        body: 'Because intake is a phone call or a lead form, identity, income, employment, and property all get collected the slow way afterward: document requests, VOE calls, and follow-ups. That’s staff time per file and days of delay before a borrower hears anything back.',
      },
    ],
    comparison: [
      { dimension: 'Products you can start online', today: 'Mortgage only (1 of 6)', withRaven: 'Every product, one front door' },
      { dimension: 'Brand experience', today: 'Hands off to a third-party domain', withRaven: 'Arthur State branding end to end' },
      { dimension: 'Borrower effort', today: 'Long forms + document uploads', withRaven: 'Name, email, and a secure connect' },
      { dimension: 'Identity / income / property', today: 'Collected manually after the fact', withRaven: 'Verified automatically in ~90 seconds' },
      { dimension: 'Rate visibility', today: 'None until an officer follows up', withRaven: 'Optional instant estimate from your rate card' },
      { dimension: 'Into the core system', today: 'Re-keyed by staff', withRaven: 'Synced to Jack Henry automatically' },
      { dimension: 'After-hours demand', today: '“Contact a loan officer”', withRaven: 'Captured, verified, and queued' },
    ],
    sources:
      'arthurstatebank.com (/loans, /mortgage, /faq), my.arthurstatebank.com (Banno), FDIC BankFind cert #15085. Brand color #006242 and tagline extracted from the bank’s site. Reviewed June 2026.',
  },
];

export function getAudit(slug: string): AuditContent | undefined {
  return AUDITS.find((a) => a.slug === slug);
}
