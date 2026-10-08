import type { WhiteLabelConfig } from './types';

/**
 * Southern First Bank — white-label demo config.
 *
 * Brand, products, and core platform are grounded in public research
 * (southernfirst.com, June 2026):
 *   - Southern First Bancshares, Inc. (NASDAQ: SFST), HQ Greenville, SC;
 *     ~$4.4B assets, ~$3.9B loans, 12 offices across SC, NC, and GA;
 *     FDIC cert #35179. Relationship-first model ("Convenient banking on a
 *     first-name basis" / "ClientFIRST"), heavy mortgage + commercial book.
 *   - Brand is a clean navy/teal-blue palette refreshed for the bank's 20th
 *     anniversary (fuelforbrands.com case study). Hex values below are
 *     approximated from the live site's navy primary and bright accent blue;
 *     a real onboarding would pull exact brand tokens.
 *   - Core system is NOT publicly disclosed in filings. Online banking is
 *     served from southernfirstpersonal.com (a "/dbank/live" deployment, a
 *     pattern associated with Fiserv-hosted retail online banking). We target
 *     Fiserv at LOW confidence; the bank could equally be on a hosted FIS/JHA
 *     stack. coreSync.mode is 'mock' regardless.
 *   - Digital presence reality: mortgages DO have a real online application
 *     (mortgageapp.southernfirst.com / Apply Online), with a "pick your
 *     mortgage executive" step, but NO rates are published (call 877-679-9646).
 *     Personal loans, business/commercial loans, and home equity are all
 *     "contact your Southern First banker." Deposit account opening is
 *     relationship-led (name a banker / call). This demo unifies every line
 *     behind one branded, verify-as-you-go front door with optional estimates.
 *
 * All rates below are ILLUSTRATIVE demo estimates, not offers of credit.
 */
export const southernFirstBank: WhiteLabelConfig = {
  slug: 'southern-first-bank',

  // Demo exposes all three flows; the entry path selects which one a borrower
  // gets, gated by this list (and per-product allowedFlows if set).
  defaultFlows: ['rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Southern First Bank',
    shortName: 'Southern First',
    wordmark: 'SOUTHERN FIRST',
    tagline: 'Banking on a first-name basis',
    primary: '#003b5c',
    primaryDark: '#002a42',
    accent: '#0098db',
    bg: '#f5f7f9',
    surface: '#ffffff',
    text: '#16222c',
    textMuted: '#5a6b78',
    border: '#dde4ea',
    font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    googleFont: 'Inter',
    radius: '8px',
  },

  purposes: [
    { value: 'buy-home', label: 'Buy or refinance a home' },
    { value: 'home-improvement', label: 'Home improvement or renovation' },
    { value: 'debt-consolidation', label: 'Consolidate debt' },
    { value: 'major-purchase', label: 'A major purchase or expense' },
    { value: 'business', label: 'Grow or finance my business' },
  ],

  products: [
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Mortgage',
      blurb: 'Purchase or refinance, including our Dream 100% financing and first-time buyer programs.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 75000,
      maxAmount: 2000000,
      defaultAmount: 375000,
      purposes: ['buy-home'],
      rateTeaser: 'Apply online with a local mortgage executive',
      disclosure:
        'This demo collects the same borrower data RAVEN gathers for verification. A mortgage executive completes the application.',
    },
    {
      id: 'heloc',
      type: 'heloc',
      label: 'Home Equity Line of Credit',
      blurb: 'Draw on your home equity as you need it, paying interest only on what you use.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 15000,
      maxAmount: 500000,
      defaultAmount: 75000,
      purposes: ['home-improvement', 'debt-consolidation', 'major-purchase'],
      rateTeaser: 'Variable rates from 7.74% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'home-equity',
      type: 'home-equity',
      label: 'Home Equity Loan',
      blurb: 'A fixed amount at a fixed rate, repaid in predictable monthly payments.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 15000,
      maxAmount: 400000,
      defaultAmount: 60000,
      purposes: ['home-improvement', 'debt-consolidation', 'major-purchase'],
      rateTeaser: 'Fixed rates from 7.99% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'Personal Loan',
      blurb: 'Flexible funds for life’s expenses with competitive rates and a personal banker by your side.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 2500,
      maxAmount: 50000,
      defaultAmount: 15000,
      purposes: ['debt-consolidation', 'major-purchase'],
      rateTeaser: 'Fixed rates from 9.74% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business / Commercial Loan',
      blurb: 'Expansion, equipment, commercial real estate, and lines of credit for growing businesses.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 50000,
      maxAmount: 5000000,
      defaultAmount: 250000,
      purposes: ['business'],
      rateTeaser: 'Custom commercial pricing',
      disclosure:
        'Commercial requests are routed to a relationship manager. This demo captures applicant and business basics plus financial verification.',
    },
  ],

  // Which providers we pull, per product. The journey plays these back as a
  // live data-pull animation. Equity/mortgage pull property + income + credit;
  // unsecured pulls identity + income + credit; commercial adds business
  // financials via the linked account.
  providerRouting: {
    mortgage: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'residence', provider: 'Melissa', label: 'Pulling property details' },
      { module: 'credit', provider: 'Experian', label: 'Checking your credit profile' },
    ],
    heloc: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'contact', provider: 'Socure', label: 'Confirming contact details' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'residence', provider: 'Melissa', label: 'Valuing your property' },
      { module: 'credit', provider: 'Experian', label: 'Checking your credit profile' },
    ],
    'home-equity': [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'residence', provider: 'Melissa', label: 'Valuing your property' },
      { module: 'credit', provider: 'Experian', label: 'Checking your credit profile' },
    ],
    personal: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'credit', provider: 'Experian', label: 'Checking your credit profile' },
    ],
    business: [
      { module: 'identity', provider: 'Socure', label: 'Verifying owner identity' },
      { module: 'contact', provider: 'FullContact', label: 'Confirming business contact' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your business accounts', interactive: true },
      { module: 'credit', provider: 'Experian', label: 'Checking credit profile' },
    ],
  },

  // Illustrative rate cards. Equity products gate on credit + combined LTV;
  // unsecured gates on credit. Each tier prices several terms, longer terms
  // priced slightly higher, so the borrower can trade term against payment.
  // Banks replace all of this at onboarding. Mortgage + business omit a card:
  // those route to a mortgage executive / relationship manager after
  // verification rather than quoting.
  rateCard: {
    heloc: {
      defaultTermMonths: 180,
      tiers: [
        { label: 'Excellent credit, low LTV', minScore: 760, maxLtv: 0.7, terms: [
          { termMonths: 120, apr: 0.0774 }, { termMonths: 180, apr: 0.0799 }, { termMonths: 240, apr: 0.0824 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.8, terms: [
          { termMonths: 120, apr: 0.0849 }, { termMonths: 180, apr: 0.0874 }, { termMonths: 240, apr: 0.0899 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.85, terms: [
          { termMonths: 120, apr: 0.0974 }, { termMonths: 180, apr: 0.0999 }, { termMonths: 240, apr: 0.1024 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 120, apr: 0.1124 }, { termMonths: 180, apr: 0.1149 }, { termMonths: 240, apr: 0.1174 },
      ],
    },
    'home-equity': {
      defaultTermMonths: 180,
      tiers: [
        { label: 'Excellent credit, low LTV', minScore: 760, maxLtv: 0.7, terms: [
          { termMonths: 60, apr: 0.0799 }, { termMonths: 120, apr: 0.0824 }, { termMonths: 180, apr: 0.0849 }, { termMonths: 240, apr: 0.0874 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.8, terms: [
          { termMonths: 60, apr: 0.0874 }, { termMonths: 120, apr: 0.0899 }, { termMonths: 180, apr: 0.0924 }, { termMonths: 240, apr: 0.0949 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.85, terms: [
          { termMonths: 60, apr: 0.0999 }, { termMonths: 120, apr: 0.1024 }, { termMonths: 180, apr: 0.1049 }, { termMonths: 240, apr: 0.1074 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 60, apr: 0.1149 }, { termMonths: 120, apr: 0.1174 }, { termMonths: 180, apr: 0.1199 }, { termMonths: 240, apr: 0.1224 },
      ],
    },
    personal: {
      defaultTermMonths: 48,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 36, apr: 0.0974 }, { termMonths: 48, apr: 0.0999 }, { termMonths: 60, apr: 0.1024 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 36, apr: 0.1174 }, { termMonths: 48, apr: 0.1199 }, { termMonths: 60, apr: 0.1224 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 36, apr: 0.1524 }, { termMonths: 48, apr: 0.1549 }, { termMonths: 60, apr: 0.1574 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 36, apr: 0.1874 }, { termMonths: 48, apr: 0.1899 }, { termMonths: 60, apr: 0.1924 },
      ],
    },
  },

  coreSync: {
    system: 'fiserv',
    displayName: 'Fiserv',
    mode: 'mock',
  },

  loTeam: {
    name: 'Southern First Lending',
    title: 'Mortgage & Commercial Lending',
  },
};
