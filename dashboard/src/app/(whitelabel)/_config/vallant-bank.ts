import type { WhiteLabelConfig } from './types';

/**
 * Vallant Bank (Elberton, GA; FDIC cert 14065), formed April 1, 2026 when
 * Pinnacle Bank and Morris Bank merged; rebranded June 17, 2026.
 *
 * Brand colors come from the vallant.bank theme CSS (style.css and
 * custom.css, fetched November 24, 2026): navy #17215c is the dominant brand
 * color, #0e153e the dark navy, and #31d0ff the cyan accent used in the
 * logo mark. The site sets type in Typekit's Area and Trade Gothic Next with
 * Montserrat as a fallback, so the demo uses Montserrat.
 *
 * Products mirror what vallant.bank offers: HELOCs, MyFasTrack ($3,500 to
 * $30,000 unsecured, online) and MyFlexFund personal loans, auto loans,
 * mortgages through local loan officers, and Business FasTrack ($3,500 to
 * $50,000) plus SBA, agricultural, equipment and commercial real estate loans.
 */
export const vallantBank: WhiteLabelConfig = {
  slug: 'vallant-bank',

  defaultFlows: ['rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Vallant Bank',
    shortName: 'Vallant',
    wordmark: 'VALLANT BANK',
    tagline: 'A Georgia community bank',
    primary: '#17215c',
    primaryDark: '#0e153e',
    accent: '#31d0ff',
    bg: '#f4f5f8',
    surface: '#ffffff',
    text: '#121a4a',
    textMuted: '#535458',
    border: '#e0e3ec',
    font: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    googleFont: 'Montserrat',
    radius: '6px',
  },

  purposes: [
    { value: 'home-improvement', label: 'Home improvement or renovation' },
    { value: 'debt-consolidation', label: 'Consolidate debt' },
    { value: 'buy-home', label: 'Buy, build or refinance a home' },
    { value: 'vehicle', label: 'Buy a car, truck or boat' },
    { value: 'major-purchase', label: 'A wedding, adoption or major expense' },
    { value: 'business', label: 'Grow my business or farm' },
  ],

  products: [
    {
      id: 'heloc',
      type: 'heloc',
      label: 'Home Equity Line of Credit',
      blurb: 'Put your home\'s equity to work, and pay interest only on what you draw.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 10000,
      maxAmount: 250000,
      defaultAmount: 50000,
      purposes: ['home-improvement', 'debt-consolidation', 'major-purchase'],
      rateTeaser: 'Variable rates from 7.49% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'MyFasTrack Personal Loan',
      blurb: 'Unsecured funds from $3,500 to $30,000 for Vallant checking customers, with no collateral.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 3500,
      maxAmount: 30000,
      defaultAmount: 12000,
      purposes: ['debt-consolidation', 'major-purchase', 'home-improvement'],
      rateTeaser: 'Fixed rates from 9.49% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'auto',
      type: 'auto',
      label: 'Auto Loan',
      blurb: 'Financing for a new or used car, truck or boat with a local decision.',
      iconPath: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M5 17H3v-6l2-5h11l4 5v6h-2',
      minAmount: 5000,
      maxAmount: 100000,
      defaultAmount: 32000,
      purposes: ['vehicle'],
      rateTeaser: 'Rates from 6.29% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and collateral valuation.',
    },
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Mortgage',
      blurb: 'Purchase, refinance, adjustable-rate and All-The-Way-Home construction-to-permanent loans from local loan officers across Georgia.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 1500000,
      defaultAmount: 300000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to a local mortgage lender',
      disclosure: 'This demo collects the same borrower data RAVEN gathers for verification. A loan officer completes the mortgage application.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business, Farm & Commercial Loan',
      blurb: 'Lines of credit, equipment, SBA, agricultural, construction and commercial real estate loans with local decisions in 22 Georgia counties.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 25000,
      maxAmount: 3000000,
      defaultAmount: 200000,
      purposes: ['business'],
      rateTeaser: 'Custom commercial pricing',
      disclosure: 'Commercial requests are routed to a relationship manager. This demo captures applicant and business basics plus financial verification.',
    },
  ],

  providerRouting: {
    heloc: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'contact', provider: 'Socure', label: 'Confirming contact details' },
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

  rateCard: {
    heloc: {
      defaultTermMonths: 180,
      tiers: [
        { label: 'Excellent credit, low LTV', minScore: 760, maxLtv: 0.7, terms: [
          { termMonths: 120, apr: 0.0749 }, { termMonths: 180, apr: 0.0774 }, { termMonths: 240, apr: 0.0799 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.8, terms: [
          { termMonths: 120, apr: 0.0824 }, { termMonths: 180, apr: 0.0849 }, { termMonths: 240, apr: 0.0874 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.85, terms: [
          { termMonths: 120, apr: 0.0949 }, { termMonths: 180, apr: 0.0974 }, { termMonths: 240, apr: 0.0999 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 120, apr: 0.1099 }, { termMonths: 180, apr: 0.1124 }, { termMonths: 240, apr: 0.1149 },
      ],
    },
    personal: {
      defaultTermMonths: 48,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 36, apr: 0.0949 }, { termMonths: 48, apr: 0.0974 }, { termMonths: 60, apr: 0.0999 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 36, apr: 0.1149 }, { termMonths: 48, apr: 0.1174 }, { termMonths: 60, apr: 0.1199 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 36, apr: 0.1499 }, { termMonths: 48, apr: 0.1524 }, { termMonths: 60, apr: 0.1549 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 36, apr: 0.1849 }, { termMonths: 48, apr: 0.1874 }, { termMonths: 60, apr: 0.1899 },
      ],
    },
    auto: {
      defaultTermMonths: 60,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 48, apr: 0.0599 }, { termMonths: 60, apr: 0.0629 }, { termMonths: 72, apr: 0.0659 }, { termMonths: 84, apr: 0.0699 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 48, apr: 0.0719 }, { termMonths: 60, apr: 0.0749 }, { termMonths: 72, apr: 0.0779 }, { termMonths: 84, apr: 0.0819 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 48, apr: 0.0919 }, { termMonths: 60, apr: 0.0949 }, { termMonths: 72, apr: 0.0979 }, { termMonths: 84, apr: 0.1019 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 48, apr: 0.1249 }, { termMonths: 60, apr: 0.1299 }, { termMonths: 72, apr: 0.1349 }, { termMonths: 84, apr: 0.1399 },
      ],
    },
  },

  coreSync: {
    system: 'unknown',
    displayName: 'Core system not publicly disclosed',
    mode: 'mock',
  },

  loTeam: {
    name: 'Vallant Bank Lending',
    title: 'Consumer, Mortgage, Agricultural & Commercial Lending',
  },
};
