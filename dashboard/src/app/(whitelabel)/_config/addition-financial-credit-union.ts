import type { WhiteLabelConfig } from './types';

/**
 * Addition Financial Credit Union, Lake Mary, FL. Brand colors taken from
 * the CSS custom properties in additionfi.com/index.css (fetched November 10,
 * 2026): highlight blue #00538b (shade #00497a), cyan accent #00b2e3, text
 * #1e262e, off-white #f5f6fa, and the site's Open Sans typeface. Products
 * lead with direct auto lending, since the dealer (indirect) book is being
 * reduced, and include business lending, which has no online application on
 * additionfi.com today. Rate floors mirror the site's published "as low as"
 * APRs (new auto 5.05% as of 11/04/2026; signature loan 12.00% as of
 * 09/18/2026); tiers above the floor are illustrative. Deposit products use
 * share draft / share certificate language.
 */
export const additionFinancialCreditUnion: WhiteLabelConfig = {
  slug: 'addition-financial-credit-union',

  defaultFlows: ['account_opening', 'rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Addition Financial Credit Union',
    shortName: 'Addition Financial',
    wordmark: 'ADDITION FINANCIAL',
    tagline: 'Member-owned in Central Florida, the Big Bend and South Georgia',
    primary: '#00538b',
    primaryDark: '#00497a',
    accent: '#00b2e3',
    bg: '#f5f6fa',
    surface: '#ffffff',
    text: '#1e262e',
    textMuted: '#53575a',
    border: '#e6e9ef',
    font: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    googleFont: 'Open Sans',
    radius: '8px',
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
      blurb: 'Apply directly, get a decision, and walk into the dealership already approved.',
      iconPath: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M5 17H3v-6l2-5h11l4 5v6h-2',
      minAmount: 5000,
      maxAmount: 150000,
      defaultAmount: 32000,
      purposes: ['vehicle'],
      rateTeaser: 'New auto from 5.05% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and collateral valuation.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'Signature Loan',
      blurb: 'Unsecured funds for life’s expenses, with no collateral required.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 1000,
      maxAmount: 50000,
      defaultAmount: 10000,
      purposes: ['debt-consolidation', 'major-purchase', 'home-improvement'],
      rateTeaser: 'Fixed rates from 12.00% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Mortgage',
      blurb: 'Buy or refinance a home anywhere from Orlando to Tallahassee.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 800000,
      defaultAmount: 300000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to an Addition Financial mortgage officer',
      disclosure: 'This demo collects the same borrower data RAVEN gathers for verification. A loan officer completes the mortgage application.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business Loan',
      blurb: 'Lines of credit, term, vehicle and equipment loans for Florida and Georgia businesses.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 5000,
      maxAmount: 500000,
      defaultAmount: 75000,
      purposes: ['business'],
      rateTeaser: 'Custom business pricing',
      disclosure: 'Business requests are routed to the Addition Financial business lending team. This demo captures applicant and business basics plus financial verification.',
    },
    {
      id: 'share-draft',
      type: 'deposit',
      label: 'Share Draft (Checking) Account',
      blurb: 'Join, fund and start banking in one sitting, no branch visit required.',
      iconPath: 'M2 5h20v14H2z M2 10h20',
      minAmount: 5,
      maxAmount: 25000,
      defaultAmount: 100,
      purposes: ['everyday-banking'],
      rateTeaser: 'Membership starts with a $5 share savings deposit',
      disclosure: 'New membership and share draft accounts are subject to identity verification and eligibility. Demo uses sample data; no real account is opened.',
      allowedFlows: ['account_opening'],
      webDefaultFlow: 'account_opening',
    },
    {
      id: 'share-certificate',
      type: 'deposit',
      label: 'Share Certificate',
      blurb: 'Lock in a fixed dividend rate for a set term.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 500,
      maxAmount: 250000,
      defaultAmount: 5000,
      purposes: ['everyday-banking'],
      rateTeaser: 'Fixed dividend, choose your term',
      disclosure: 'Dividend rate and terms shown are illustrative for this demo, not an offer. Share certificates are subject to identity verification and early-withdrawal penalties.',
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
      { module: 'residence', provider: 'Melissa', label: 'Confirming your eligibility county' },
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
          { termMonths: 48, apr: 0.0505 }, { termMonths: 60, apr: 0.0505 }, { termMonths: 72, apr: 0.0555 }, { termMonths: 84, apr: 0.0555 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 48, apr: 0.0629 }, { termMonths: 60, apr: 0.0649 }, { termMonths: 72, apr: 0.0699 }, { termMonths: 84, apr: 0.0739 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 48, apr: 0.0829 }, { termMonths: 60, apr: 0.0859 }, { termMonths: 72, apr: 0.0899 }, { termMonths: 84, apr: 0.0939 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 48, apr: 0.1129 }, { termMonths: 60, apr: 0.1179 }, { termMonths: 72, apr: 0.1229 }, { termMonths: 84, apr: 0.1279 },
      ],
    },
    personal: {
      defaultTermMonths: 48,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 36, apr: 0.12 }, { termMonths: 48, apr: 0.1225 }, { termMonths: 60, apr: 0.125 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 36, apr: 0.1399 }, { termMonths: 48, apr: 0.1424 }, { termMonths: 60, apr: 0.1449 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 36, apr: 0.1649 }, { termMonths: 48, apr: 0.1674 }, { termMonths: 60, apr: 0.1699 },
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
    name: 'Addition Financial Lending',
    title: 'Consumer, Mortgage & Business Lending',
  },
};
