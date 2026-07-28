import type { WhiteLabelConfig } from './types';

export const optimumbank: WhiteLabelConfig = {
  slug: 'optimumbank',

  // Commercial-first bank: pricing on CRE, SBA, and HUD bridge deals is
  // relationship-quoted, so the public entry points capture and verify the file
  // rather than surfacing a rate.
  defaultFlows: ['data_only', 'full_application'],

  branding: {
    name: 'OptimumBank',
    shortName: 'OptimumBank',
    wordmark: 'OPTIMUMBANK',
    tagline: 'Community Banking at its Best',
    primary: '#0d4a6b',
    primaryDark: '#093549',
    accent: '#2fa8a0',
    bg: '#f4f7f9',
    surface: '#ffffff',
    text: '#14202b',
    textMuted: '#5b6b78',
    border: '#dbe3e9',
    font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    radius: '6px',
  },

  purposes: [
    { value: 'commercial-property', label: 'Buy or refinance commercial property' },
    { value: 'business', label: 'Fund or grow my business' },
    { value: 'healthcare-property', label: 'Finance a healthcare or multifamily property' },
    { value: 'buy-home', label: 'Buy or refinance a home' },
  ],

  products: [
    {
      id: 'cre',
      type: 'business',
      label: 'Commercial Real Estate Loan',
      blurb: 'Acquisition, refinance, and repositioning financing for South Florida commercial property.',
      iconPath: 'M3 21h18 M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16 M13 21V10h5a1 1 0 0 1 1 1v10 M8 8v.01 M8 12v.01 M8 16v.01',
      minAmount: 250000,
      maxAmount: 25000000,
      defaultAmount: 3000000,
      purposes: ['commercial-property'],
      rateTeaser: 'Relationship-quoted pricing',
      disclosure:
        'Commercial requests are routed to a relationship manager. This demo captures sponsor, entity, and property basics plus financial verification. Not an offer of credit.',
    },
    {
      id: 'sba',
      type: 'business',
      label: 'SBA / Small Business Loan',
      blurb: 'Loans up to $5 million for equipment, inventory, working capital, expansion, and partner buyouts.',
      iconPath: 'M3 7h18v13H3z M8 7V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3 M3 12h18',
      minAmount: 25000,
      maxAmount: 5000000,
      defaultAmount: 500000,
      purposes: ['business'],
      rateTeaser: 'SBA loans up to $5 million',
      disclosure:
        'SBA financing is subject to program eligibility and SBA approval. This demo captures owner and business data plus financial verification. Not an offer of credit.',
    },
    {
      id: 'hud-bridge',
      type: 'business',
      label: 'Bridge-to-HUD Financing',
      blurb: 'Bridge financing that converts to HUD/FHA-insured permanent debt for skilled nursing, senior housing, and multifamily.',
      iconPath: 'M3 21h18 M6 21V8l6-4 6 4v13 M10 21v-6h4v6 M12 8v.01',
      minAmount: 1000000,
      maxAmount: 50000000,
      defaultAmount: 12000000,
      purposes: ['healthcare-property'],
      rateTeaser: 'Bridge and HUD/FHA permanent',
      disclosure:
        'Originated through OptimumFunding, LLC. HUD/FHA-insured permanent financing is subject to HUD program requirements and approval. Not an offer of credit.',
    },
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Residential Mortgage',
      blurb: 'Purchase and refinance financing for primary, second, and investment homes in South Florida.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 100000,
      maxAmount: 5000000,
      defaultAmount: 550000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to a local lender',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
      allowedFlows: ['rate_range', 'full_application', 'data_only'],
      webDefaultFlow: 'rate_range',
    },
  ],

  providerRouting: {
    cre: [
      { module: 'identity', provider: 'Socure', label: 'Verifying sponsor identity' },
      { module: 'contact', provider: 'FullContact', label: 'Confirming entity contact details' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting entity operating accounts', interactive: true },
      { module: 'residence', provider: 'Melissa', label: 'Pulling property details' },
      { module: 'credit', provider: 'Experian', label: 'Checking guarantor credit profile' },
    ],
    sba: [
      { module: 'identity', provider: 'Socure', label: 'Verifying owner identity' },
      { module: 'contact', provider: 'FullContact', label: 'Confirming business contact' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your business accounts', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying owner income' },
      { module: 'credit', provider: 'Experian', label: 'Checking credit profile' },
    ],
    'hud-bridge': [
      { module: 'identity', provider: 'Socure', label: 'Verifying sponsor identity' },
      { module: 'contact', provider: 'FullContact', label: 'Confirming ownership entity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting operator accounts', interactive: true },
      { module: 'residence', provider: 'Melissa', label: 'Pulling facility property details' },
      { module: 'credit', provider: 'Experian', label: 'Checking principal credit profile' },
    ],
    mortgage: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'residence', provider: 'Melissa', label: 'Pulling property details' },
      { module: 'credit', provider: 'Experian', label: 'Checking your credit profile' },
    ],
  },

  // Only the residential product carries a borrower-facing estimate. CRE, SBA,
  // and HUD bridge pricing is quoted by the relationship manager.
  rateCard: {
    mortgage: {
      defaultTermMonths: 360,
      tiers: [
        {
          label: 'Excellent credit, low LTV',
          minScore: 760,
          maxLtv: 0.7,
          terms: [
            { termMonths: 180, apr: 0.0599 },
            { termMonths: 360, apr: 0.0639 },
          ],
        },
        {
          label: 'Strong credit',
          minScore: 720,
          maxLtv: 0.8,
          terms: [
            { termMonths: 180, apr: 0.0649 },
            { termMonths: 360, apr: 0.0689 },
          ],
        },
        {
          label: 'Good credit',
          minScore: 680,
          maxLtv: 0.9,
          terms: [
            { termMonths: 180, apr: 0.0749 },
            { termMonths: 360, apr: 0.0789 },
          ],
        },
      ],
      fallbackTerms: [
        { termMonths: 180, apr: 0.0899 },
        { termMonths: 360, apr: 0.0939 },
      ],
    },
  },

  coreSync: {
    system: 'unknown',
    displayName: 'Core system (not publicly disclosed)',
    mode: 'mock',
  },

  loTeam: {
    name: 'OptimumBank Commercial Lending',
    title: 'Commercial Real Estate & Business Banking',
  },
};
