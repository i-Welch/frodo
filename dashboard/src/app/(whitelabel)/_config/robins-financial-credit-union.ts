import type { WhiteLabelConfig } from './types';

/**
 * Robins Financial Credit Union, Warner Robins, GA — brand colors
 * approximated from robinsfcu.org brand assets (deep blue with red accents),
 * reviewed August 2026; site CSS is bundled so exact tokens were not
 * extractable. Products lead with auto lending ($1.54B, 54.5% of the loan
 * book) and emphasize the day-one share draft, since Robins' December member
 * rebate pays on relationship depth. Deposit products are modeled as share
 * draft / share certificate rather than checking / CD, matching credit union
 * terminology.
 */
export const robinsFinancialCreditUnion: WhiteLabelConfig = {
  slug: 'robins-financial-credit-union',

  defaultFlows: ['account_opening', 'rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Robins Financial Credit Union',
    shortName: 'Robins Financial',
    wordmark: 'ROBINS FINANCIAL CREDIT UNION',
    tagline: 'Member-owned in middle Georgia since 1954',
    primary: '#003a70',
    primaryDark: '#00294f',
    accent: '#c8102e',
    bg: '#f5f7fa',
    surface: '#ffffff',
    text: '#1a1f26',
    textMuted: '#5b6570',
    border: '#dce3ea',
    font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    googleFont: 'Inter',
    radius: '10px',
  },

  purposes: [
    { value: 'vehicle', label: 'Buy or refinance a vehicle' },
    { value: 'debt-consolidation', label: 'Consolidate debt' },
    { value: 'home-improvement', label: 'Home improvement or renovation' },
    { value: 'buy-home', label: 'Buy or refinance a home' },
    { value: 'major-purchase', label: 'A major purchase or expense' },
    { value: 'business', label: 'Grow my business' },
    { value: 'everyday-banking', label: 'Open a new account' },
  ],

  products: [
    {
      id: 'auto',
      type: 'auto',
      label: 'Auto Loan',
      blurb: 'Finance a new or used vehicle with middle Georgia pricing.',
      iconPath: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M5 17H3v-6l2-5h11l4 5v6h-2',
      minAmount: 5000,
      maxAmount: 150000,
      defaultAmount: 30000,
      purposes: ['vehicle'],
      rateTeaser: 'Rates from 5.29% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and collateral valuation.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'Personal Loan',
      blurb: 'Unsecured funds for life’s expenses, with no collateral required.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 1000,
      maxAmount: 40000,
      defaultAmount: 10000,
      purposes: ['debt-consolidation', 'major-purchase', 'home-improvement'],
      rateTeaser: 'Fixed rates from 9.99% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Mortgage',
      blurb: 'Buy or refinance with a lender that closed 1,400+ home loans last year.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 800000,
      defaultAmount: 250000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to a Robins Financial mortgage officer',
      disclosure: 'This demo collects the same borrower data RAVEN gathers for verification. A loan officer completes the mortgage application.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business Loan',
      blurb: 'Financing for the contractors and small businesses of middle Georgia.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 10000,
      maxAmount: 750000,
      defaultAmount: 100000,
      purposes: ['business'],
      rateTeaser: 'Custom business pricing',
      disclosure: 'Business requests are routed to the Robins Financial lending team. This demo captures applicant and business basics plus financial verification.',
    },
    {
      id: 'share-draft',
      type: 'deposit',
      label: 'Share Draft Account',
      blurb: 'The account that counts toward your December Member Rebate, from day one.',
      iconPath: 'M2 5h20v14H2z M2 10h20',
      minAmount: 5,
      maxAmount: 25000,
      defaultAmount: 100,
      purposes: ['everyday-banking'],
      rateTeaser: 'No monthly fee for members',
      disclosure: 'New membership and share draft accounts are subject to identity verification. Demo uses sample data; no real account is opened. Member Rebate reference is illustrative.',
      allowedFlows: ['account_opening'],
      webDefaultFlow: 'account_opening',
    },
    {
      id: 'share-certificate',
      type: 'deposit',
      label: 'Share Certificate',
      blurb: 'Lock in a fixed dividend rate on a 6 to 24-month term.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 500,
      maxAmount: 250000,
      defaultAmount: 5000,
      purposes: ['everyday-banking'],
      rateTeaser: 'Terms from 6 to 24 months',
      disclosure: 'Dividend rate shown is illustrative for this demo, not an offer. Share certificates are subject to identity verification and early-withdrawal dividend penalties.',
      allowedFlows: ['account_opening'],
      webDefaultFlow: 'account_opening',
    },
  ],

  providerRouting: {
    auto: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'credit', provider: 'Experian', label: 'Checking your credit profile' },
    ],
    personal: [
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
    'share-draft': [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'contact', provider: 'Socure', label: 'Confirming contact details' },
      { module: 'residence', provider: 'Melissa', label: 'Confirming your eligibility area' },
      { module: 'financial', provider: 'Plaid', label: 'Linking your funding account', interactive: true },
    ],
    'share-certificate': [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'contact', provider: 'Socure', label: 'Confirming contact details' },
      { module: 'financial', provider: 'Plaid', label: 'Linking your funding account', interactive: true },
    ],
  },

  rateCard: {
    auto: {
      defaultTermMonths: 60,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 48, apr: 0.0529 }, { termMonths: 60, apr: 0.0559 }, { termMonths: 72, apr: 0.0599 }, { termMonths: 84, apr: 0.0639 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 48, apr: 0.0639 }, { termMonths: 60, apr: 0.0669 }, { termMonths: 72, apr: 0.0709 }, { termMonths: 84, apr: 0.0749 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 48, apr: 0.0839 }, { termMonths: 60, apr: 0.0869 }, { termMonths: 72, apr: 0.0909 }, { termMonths: 84, apr: 0.0949 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 48, apr: 0.1139 }, { termMonths: 60, apr: 0.1189 }, { termMonths: 72, apr: 0.1239 }, { termMonths: 84, apr: 0.1289 },
      ],
    },
    personal: {
      defaultTermMonths: 48,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 36, apr: 0.0999 }, { termMonths: 48, apr: 0.1024 }, { termMonths: 60, apr: 0.1049 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 36, apr: 0.1199 }, { termMonths: 48, apr: 0.1224 }, { termMonths: 60, apr: 0.1249 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 36, apr: 0.1549 }, { termMonths: 48, apr: 0.1574 }, { termMonths: 60, apr: 0.1599 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 36, apr: 0.1899 }, { termMonths: 48, apr: 0.1924 }, { termMonths: 60, apr: 0.1949 },
      ],
    },
  },

  coreSync: {
    system: 'unknown',
    displayName: 'Core system not publicly disclosed',
    mode: 'mock',
  },

  loTeam: {
    name: 'Robins Financial Lending',
    title: 'Consumer & Member Business Lending',
  },
};
