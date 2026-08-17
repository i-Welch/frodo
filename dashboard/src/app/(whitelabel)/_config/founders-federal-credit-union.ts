import type { WhiteLabelConfig } from './types';

/**
 * Founders Federal Credit Union, Lancaster, SC — brand colors approximated
 * from foundersfcu.com brand assets (deep green with gold accents), reviewed
 * August 2026; site CSS is bundled so exact tokens were not extractable.
 * Products lead with auto and the signature Express Loan (unsecured lending
 * is ~15% of Founders' book, the model's defining product). Deposit products
 * are modeled as share draft / share certificate rather than checking / CD,
 * matching credit union terminology.
 */
export const foundersFederalCreditUnion: WhiteLabelConfig = {
  slug: 'founders-federal-credit-union',

  defaultFlows: ['account_opening', 'rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Founders Federal Credit Union',
    shortName: 'Founders',
    wordmark: 'FOUNDERS FEDERAL CREDIT UNION',
    tagline: 'Member-owned in the Carolinas since 1950',
    primary: '#0b5c3f',
    primaryDark: '#083d2b',
    accent: '#c7a252',
    bg: '#f6f8f6',
    surface: '#ffffff',
    text: '#1a201c',
    textMuted: '#5c6862',
    border: '#dde5df',
    font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    googleFont: 'Inter',
    radius: '10px',
  },

  purposes: [
    { value: 'vehicle', label: 'Buy or refinance a vehicle' },
    { value: 'quick-cash', label: 'Cover an expense quickly' },
    { value: 'debt-consolidation', label: 'Consolidate debt' },
    { value: 'home-improvement', label: 'Home improvement or renovation' },
    { value: 'buy-home', label: 'Buy or refinance a home' },
    { value: 'business', label: 'Grow my business' },
    { value: 'everyday-banking', label: 'Open a new account' },
  ],

  products: [
    {
      id: 'auto',
      type: 'auto',
      label: 'Auto Loan',
      blurb: 'Finance a new or used vehicle with Carolina-market pricing.',
      iconPath: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M5 17H3v-6l2-5h11l4 5v6h-2',
      minAmount: 5000,
      maxAmount: 150000,
      defaultAmount: 30000,
      purposes: ['vehicle'],
      rateTeaser: 'Rates from 5.49% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and collateral valuation.',
    },
    {
      id: 'express',
      type: 'personal',
      label: 'Express Loan',
      blurb: 'A fast, small-dollar signature loan for when life happens.',
      iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      minAmount: 500,
      maxAmount: 7500,
      defaultAmount: 2000,
      purposes: ['quick-cash'],
      rateTeaser: 'Decisions in minutes',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'Personal Loan',
      blurb: 'Unsecured funds on your signature, with no collateral required.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 1000,
      maxAmount: 50000,
      defaultAmount: 12000,
      purposes: ['debt-consolidation', 'home-improvement'],
      rateTeaser: 'Fixed rates from 9.49% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Mortgage',
      blurb: 'Buy or refinance with a lender that closed 2,100+ home loans last year.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 1000000,
      defaultAmount: 280000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to a Founders mortgage originator',
      disclosure: 'This demo collects the same borrower data RAVEN gathers for verification. A loan officer completes the mortgage application.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business Loan',
      blurb: 'Financing for the employers and owners who anchor the Founders charter.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 10000,
      maxAmount: 1000000,
      defaultAmount: 100000,
      purposes: ['business'],
      rateTeaser: 'Custom business pricing',
      disclosure: 'Business requests are routed to the Founders lending team. This demo captures applicant and business basics plus financial verification.',
    },
    {
      id: 'share-draft',
      type: 'deposit',
      label: 'Share Draft Account',
      blurb: 'Everyday spending with a debit card and mobile deposit from day one.',
      iconPath: 'M2 5h20v14H2z M2 10h20',
      minAmount: 5,
      maxAmount: 25000,
      defaultAmount: 100,
      purposes: ['everyday-banking'],
      rateTeaser: 'No monthly fee for members',
      disclosure: 'New membership and share draft accounts are subject to identity verification. Demo uses sample data; no real account is opened.',
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
    express: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Linking your funding account', interactive: true },
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
      { module: 'residence', provider: 'Melissa', label: 'Confirming your eligibility' },
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
          { termMonths: 48, apr: 0.0549 }, { termMonths: 60, apr: 0.0579 }, { termMonths: 72, apr: 0.0619 }, { termMonths: 84, apr: 0.0659 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 48, apr: 0.0659 }, { termMonths: 60, apr: 0.0689 }, { termMonths: 72, apr: 0.0729 }, { termMonths: 84, apr: 0.0769 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 48, apr: 0.0859 }, { termMonths: 60, apr: 0.0889 }, { termMonths: 72, apr: 0.0929 }, { termMonths: 84, apr: 0.0969 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 48, apr: 0.1159 }, { termMonths: 60, apr: 0.1209 }, { termMonths: 72, apr: 0.1259 }, { termMonths: 84, apr: 0.1309 },
      ],
    },
    express: {
      defaultTermMonths: 12,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 6, apr: 0.1299 }, { termMonths: 12, apr: 0.1349 }, { termMonths: 18, apr: 0.1399 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 6, apr: 0.1499 }, { termMonths: 12, apr: 0.1549 }, { termMonths: 18, apr: 0.1599 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 6, apr: 0.1699 }, { termMonths: 12, apr: 0.1749 }, { termMonths: 18, apr: 0.1799 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 6, apr: 0.1799 }, { termMonths: 12, apr: 0.1799 }, { termMonths: 18, apr: 0.1799 },
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
  },

  coreSync: {
    system: 'unknown',
    displayName: 'Corelation KeyStone (signaled by Founders’ FIT CUSO product line)',
    mode: 'mock',
  },

  loTeam: {
    name: 'Founders Lending',
    title: 'Consumer & Member Business Lending',
  },
};
