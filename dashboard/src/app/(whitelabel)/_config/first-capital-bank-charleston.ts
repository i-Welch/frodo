import type { WhiteLabelConfig } from './types';

export const firstCapitalBankCharleston: WhiteLabelConfig = {
  slug: 'first-capital-bank-charleston',

  defaultFlows: ['rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'First Capital Bank',
    shortName: 'First Capital',
    wordmark: 'FIRST CAPITAL BANK',
    tagline: 'A hometown community bank with deep roots in the communities we serve.',
    primary: '#003e7e',
    primaryDark: '#002d5c',
    accent: '#0077c8',
    bg: '#f5f7f9',
    surface: '#ffffff',
    text: '#161e27',
    textMuted: '#5a6b78',
    border: '#dde4ea',
    font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    radius: '8px',
  },

  purposes: [
    { value: 'home-improvement', label: 'Home improvement or renovation' },
    { value: 'debt-consolidation', label: 'Consolidate debt' },
    { value: 'buy-home', label: 'Buy or refinance a home' },
    { value: 'vehicle', label: 'Buy a vehicle, RV, or boat' },
    { value: 'major-purchase', label: 'A major purchase or expense' },
    { value: 'business', label: 'Grow my business' },
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
      rateTeaser: 'Variable rates from 7.49% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
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
      rateTeaser: 'Fixed rates from 7.99% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'Personal Loan',
      blurb: 'Unsecured funds for life\'s expenses, with no collateral required.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 2000,
      maxAmount: 50000,
      defaultAmount: 15000,
      purposes: ['debt-consolidation', 'major-purchase'],
      rateTeaser: 'Fixed rates from 9.49% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'auto',
      type: 'auto',
      label: 'Auto / RV / Watercraft Loan',
      blurb: 'Financing for your car, truck, RV, or boat with a quick local decision.',
      iconPath: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M5 17H3v-6l2-5h11l4 5v6h-2',
      minAmount: 5000,
      maxAmount: 150000,
      defaultAmount: 35000,
      purposes: ['vehicle'],
      rateTeaser: 'Rates from 6.29% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and collateral valuation.',
    },
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Mortgage',
      blurb: 'Purchase, build, or refinance in Charleston and the Carolinas with a local mortgage lender.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 1500000,
      defaultAmount: 320000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to a local mortgage officer',
      disclosure: 'This demo collects the same borrower data RAVEN gathers for verification. A loan officer completes the mortgage application.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business / Commercial Loan',
      blurb: 'Local decisions for Lowcountry businesses — lines of credit, equipment, and commercial real estate.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 25000,
      maxAmount: 2000000,
      defaultAmount: 150000,
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
    'home-equity': {
      defaultTermMonths: 180,
      tiers: [
        { label: 'Excellent credit, low LTV', minScore: 760, maxLtv: 0.7, terms: [
          { termMonths: 60, apr: 0.0749 }, { termMonths: 120, apr: 0.0774 }, { termMonths: 180, apr: 0.0799 }, { termMonths: 240, apr: 0.0824 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.8, terms: [
          { termMonths: 60, apr: 0.0824 }, { termMonths: 120, apr: 0.0849 }, { termMonths: 180, apr: 0.0874 }, { termMonths: 240, apr: 0.0899 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.85, terms: [
          { termMonths: 60, apr: 0.0949 }, { termMonths: 120, apr: 0.0974 }, { termMonths: 180, apr: 0.0999 }, { termMonths: 240, apr: 0.1024 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 60, apr: 0.1099 }, { termMonths: 120, apr: 0.1124 }, { termMonths: 180, apr: 0.1149 }, { termMonths: 240, apr: 0.1174 },
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
    system: 'fiserv',
    displayName: 'Fiserv',
    mode: 'mock',
  },

  loTeam: {
    name: 'First Capital Bank Lending',
    title: 'Consumer & Mortgage Lending',
  },
};
