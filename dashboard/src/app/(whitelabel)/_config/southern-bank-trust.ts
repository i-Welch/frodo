import type { WhiteLabelConfig } from './types';

/**
 * Southern Bank and Trust Company — white-label demo config.
 *
 * Brand, products, and core platform grounded in public research
 * (southernbank.com, June 2026):
 *   - Southern BancShares (N.C.), Inc. (OTC: SBNC), HQ Mount Olive, NC;
 *     ~$5.25B assets, 57 branches across eastern NC and southeastern VA;
 *     FDIC cert #15359. CEO: Drew M. Covert. CDO: Sondra McCorquodale (2024).
 *   - Tagline: "Grounded in Tradition. Ready for What's Next."
 *   - Brand palette is navy/blue; hex values approximated from the live site.
 *   - Core system not publicly disclosed. online-banking-services.com hosting
 *     pattern is associated with FIS-hosted retail digital banking; used at
 *     LOW confidence. coreSync.mode is 'mock' regardless.
 *   - Digital reality: only mortgage has an online application
 *     (southernbank.mymortgage-online.com, a third-party Finastra portal).
 *     Personal, auto, boat, HELOC, and business lending have no digital intake.
 *     Account opening runs on a 32-character off-brand subdomain. This demo
 *     unifies all six lines behind one branded, verify-as-you-go front door
 *     with income flows for farm, military, and vacation-rental borrowers.
 *
 * All rates below are ILLUSTRATIVE demo estimates, not offers of credit.
 */
export const southernBankTrust: WhiteLabelConfig = {
  slug: 'southern-bank-trust',

  defaultFlows: ['rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Southern Bank and Trust',
    shortName: 'Southern Bank',
    wordmark: 'SOUTHERN BANK',
    tagline: 'Grounded in Tradition. Ready for What\'s Next.',
    primary: '#003366',
    primaryDark: '#002244',
    accent: '#0066cc',
    bg: '#f5f7fa',
    surface: '#ffffff',
    text: '#15202b',
    textMuted: '#546678',
    border: '#dde3ea',
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
    { value: 'agriculture', label: 'Agricultural or farm financing' },
  ],

  products: [
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Mortgage',
      blurb: 'Purchase or refinance, including VA, USDA, first-time buyer, renovation, and construction loans.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 75000,
      maxAmount: 2000000,
      defaultAmount: 300000,
      purposes: ['buy-home'],
      rateTeaser: 'Apply online — a mortgage specialist follows up',
      disclosure:
        'This demo collects the same borrower data RAVEN gathers for verification. A Southern Bank mortgage specialist completes the application.',
    },
    {
      id: 'heloc',
      type: 'heloc',
      label: 'Home Equity Line of Credit',
      blurb: 'Draw on your home equity as needed, up to 85% LTV. Fixed rate for the first 3 years.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 15000,
      maxAmount: 500000,
      defaultAmount: 75000,
      purposes: ['home-improvement', 'debt-consolidation', 'major-purchase'],
      rateTeaser: 'Variable rates from 7.99% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'home-equity',
      type: 'home-equity',
      label: 'Home Equity Loan',
      blurb: 'A fixed lump sum at a fixed rate for predictable monthly payments.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 15000,
      maxAmount: 400000,
      defaultAmount: 60000,
      purposes: ['home-improvement', 'debt-consolidation', 'major-purchase'],
      rateTeaser: 'Fixed rates from 8.24% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'Personal / Auto / Boat / RV Loan',
      blurb: 'Flexible financing for vehicles, boats, RVs, and personal expenses with fixed rates and flexible terms.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 2500,
      maxAmount: 100000,
      defaultAmount: 30000,
      purposes: ['major-purchase', 'debt-consolidation'],
      rateTeaser: 'Fixed rates from 8.74% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business / Agricultural / Commercial Loan',
      blurb: 'Operating lines, CRE, construction, equipment, and agricultural financing across eastern NC and Virginia.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 25000,
      maxAmount: 5000000,
      defaultAmount: 200000,
      purposes: ['business', 'agriculture'],
      rateTeaser: 'Custom commercial and agricultural pricing',
      disclosure:
        'Commercial and agricultural requests are routed to a relationship manager. This demo captures applicant and business basics plus financial verification.',
    },
  ],

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

  rateCard: {
    heloc: {
      defaultTermMonths: 180,
      tiers: [
        { label: 'Excellent credit, low LTV', minScore: 760, maxLtv: 0.7, terms: [
          { termMonths: 120, apr: 0.0799 }, { termMonths: 180, apr: 0.0824 }, { termMonths: 240, apr: 0.0849 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.8, terms: [
          { termMonths: 120, apr: 0.0874 }, { termMonths: 180, apr: 0.0899 }, { termMonths: 240, apr: 0.0924 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.85, terms: [
          { termMonths: 120, apr: 0.0999 }, { termMonths: 180, apr: 0.1024 }, { termMonths: 240, apr: 0.1049 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 120, apr: 0.1149 }, { termMonths: 180, apr: 0.1174 }, { termMonths: 240, apr: 0.1199 },
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
          { termMonths: 36, apr: 0.0874 }, { termMonths: 48, apr: 0.0899 }, { termMonths: 60, apr: 0.0924 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 36, apr: 0.1099 }, { termMonths: 48, apr: 0.1124 }, { termMonths: 60, apr: 0.1149 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 36, apr: 0.1449 }, { termMonths: 48, apr: 0.1474 }, { termMonths: 60, apr: 0.1499 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 36, apr: 0.1799 }, { termMonths: 48, apr: 0.1824 }, { termMonths: 60, apr: 0.1849 },
      ],
    },
  },

  coreSync: {
    system: 'fis',
    displayName: 'FIS',
    mode: 'mock',
  },

  loTeam: {
    name: 'Southern Bank Lending',
    title: 'Mortgage & Commercial Lending',
  },
};
