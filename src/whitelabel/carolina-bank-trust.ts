import type { WhiteLabelConfig } from './types.js';

/**
 * Carolina Bank & Trust Co. — white-label demo config.
 *
 * Brand, products, and core platform are grounded in public research
 * (carolinabank.net, June 2026):
 *   - Family-owned community bank founded 1936 in Lamar, Darlington County, SC
 *     (Beasley family, four generations). ~$830M assets, 14 branches across six
 *     Pee Dee / northeastern SC counties. FDIC #355120. Brand "Carolina Bank";
 *     legal "Carolina Bank & Trust Co." Tagline "Building on Tradition since 1936."
 *   - Brand palette pulled from the live site stylesheet (assets/css/main.min.css):
 *     primary blue #1c4493, dark navy #0b2545, red accent #c41137; body font Lato.
 *   - Core / digital banking is Jack Henry: the bank moved retail + business
 *     online banking onto Banno in Feb 2025 ("Created by Banno, a Jack Henry &
 *     Associates company"; my.carolinabank.net). So core sync targets Jack Henry.
 *   - Digital lending reality: only mortgages have an online application, and it
 *     lives on a separate third-party domain (carolinabanktrust.mymortgage-online.com).
 *     Home equity, HELOC, personal, auto/recreation, and all business/ag lending
 *     are "apply at any branch" / "contact a loan officer." No rates are published.
 *     This demo shows every line as a single, branded, verify-as-you-go front door.
 *
 *   Sources: carolinabank.net (/, /about/about-us, /lending/home-loans/*,
 *   /lending/personal-lending/*, /new-online-banking), my.carolinabank.net (Banno),
 *   carolinabanktrust.mymortgage-online.com, FDIC BankFind cert #355120.
 *   All rates below are illustrative demo estimates, not an offer of credit.
 */
export const carolinaBankTrust: WhiteLabelConfig = {
  slug: 'carolina-bank-trust',

  // Flows offered for this bank (demo shows all three; the entry path selects
  // which one a borrower gets, gated by this list).
  defaultFlows: ['rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Carolina Bank & Trust Co.',
    shortName: 'Carolina Bank',
    wordmark: 'CAROLINA BANK & TRUST',
    tagline: 'Building on Tradition since 1936',
    primary: '#1c4493',
    primaryDark: '#0b2545',
    accent: '#c41137',
    bg: '#f5f7fb',
    surface: '#ffffff',
    text: '#16213a',
    textMuted: '#5a6480',
    border: '#dde2ee',
    font: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    googleFont: 'Lato',
    radius: '10px',
  },

  purposes: [
    { value: 'home-improvement', label: 'Home improvement or renovation' },
    { value: 'debt-consolidation', label: 'Consolidate debt' },
    { value: 'buy-home', label: 'Buy or refinance a home' },
    { value: 'vehicle', label: 'Buy a vehicle, RV, or boat' },
    { value: 'major-purchase', label: 'A major purchase or expense' },
    { value: 'business', label: 'Grow my business or farm' },
  ],

  products: [
    {
      id: 'heloc',
      type: 'heloc',
      label: 'Home Equity Line of Credit',
      blurb: 'Draw on your home equity as you need it. Interest only on what you use.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 10000,
      maxAmount: 250000,
      defaultAmount: 50000,
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
      minAmount: 10000,
      maxAmount: 250000,
      defaultAmount: 40000,
      purposes: ['home-improvement', 'debt-consolidation', 'major-purchase'],
      rateTeaser: 'Fixed rates from 8.24% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'Personal Loan',
      blurb: 'Funds for life’s necessities and pleasures, with a quick local decision.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 2000,
      maxAmount: 50000,
      defaultAmount: 12000,
      purposes: ['debt-consolidation', 'major-purchase'],
      rateTeaser: 'Fixed rates from 9.74% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'auto',
      type: 'auto',
      label: 'Auto & Recreation Loan',
      blurb: 'Financing for your car, truck, boat, motor, or RV with a local decision.',
      iconPath: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M5 17H3v-6l2-5h11l4 5v6h-2',
      minAmount: 5000,
      maxAmount: 150000,
      defaultAmount: 32000,
      purposes: ['vehicle'],
      rateTeaser: 'Rates from 6.49% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and collateral valuation.',
    },
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Mortgage',
      blurb: 'Purchase or refinance with lenders who live in and understand the Pee Dee.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 1250000,
      defaultAmount: 280000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to a local mortgage lender',
      disclosure:
        'This demo collects the same borrower data RAVEN gathers for verification. A loan officer completes the mortgage application.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business, Commercial & Ag Loan',
      blurb: 'Working capital, equipment, commercial real estate, and agricultural lending.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 25000,
      maxAmount: 2000000,
      defaultAmount: 150000,
      purposes: ['business'],
      rateTeaser: 'Custom commercial pricing',
      disclosure:
        'Commercial and agricultural requests are routed to a relationship manager. This demo captures applicant and business basics plus financial verification.',
    },
  ],

  // Which providers we pull, per product. The journey plays these back as a
  // live data-pull animation. Equity/mortgage products pull property + income +
  // credit; unsecured pulls identity + income + credit; commercial adds
  // business financials via the linked account.
  providerRouting: {
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
    auto: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'credit', provider: 'Experian', label: 'Checking your credit profile' },
    ],
    mortgage: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'residence', provider: 'Melissa', label: 'Pulling property details' },
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
  // unsecured/auto gate on credit. Each tier prices several terms, longer terms
  // priced slightly higher, so the borrower can trade term against payment.
  // Banks replace all of this at onboarding.
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
          { termMonths: 60, apr: 0.0824 }, { termMonths: 120, apr: 0.0849 }, { termMonths: 180, apr: 0.0874 }, { termMonths: 240, apr: 0.0899 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.8, terms: [
          { termMonths: 60, apr: 0.0899 }, { termMonths: 120, apr: 0.0924 }, { termMonths: 180, apr: 0.0949 }, { termMonths: 240, apr: 0.0974 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.85, terms: [
          { termMonths: 60, apr: 0.1024 }, { termMonths: 120, apr: 0.1049 }, { termMonths: 180, apr: 0.1074 }, { termMonths: 240, apr: 0.1099 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 60, apr: 0.1174 }, { termMonths: 120, apr: 0.1199 }, { termMonths: 180, apr: 0.1224 }, { termMonths: 240, apr: 0.1249 },
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
    auto: {
      defaultTermMonths: 60,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 48, apr: 0.0619 }, { termMonths: 60, apr: 0.0649 }, { termMonths: 72, apr: 0.0679 }, { termMonths: 84, apr: 0.0719 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 48, apr: 0.0739 }, { termMonths: 60, apr: 0.0769 }, { termMonths: 72, apr: 0.0799 }, { termMonths: 84, apr: 0.0839 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 48, apr: 0.0939 }, { termMonths: 60, apr: 0.0969 }, { termMonths: 72, apr: 0.0999 }, { termMonths: 84, apr: 0.1039 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 48, apr: 0.1269 }, { termMonths: 60, apr: 0.1319 }, { termMonths: 72, apr: 0.1369 }, { termMonths: 84, apr: 0.1419 },
      ],
    },
    // mortgage + business intentionally omit a rate card: those route to a loan
    // officer / relationship manager after verification rather than quoting.
  },

  coreSync: {
    system: 'jackhenry',
    displayName: 'Jack Henry',
    mode: 'mock',
  },

  loTeam: {
    name: 'Carolina Bank & Trust Lending',
    title: 'Consumer, Mortgage & Commercial Lending',
  },
};
