import type { WhiteLabelConfig } from './types';

/**
 * Community First Credit Union of Florida, Jacksonville, FL: brand colors
 * taken from the site stylesheet (communityfirstfl.org /Dist/General.min.css,
 * read November 2026): navy #001f5f is the dominant brand color, #007fad the
 * secondary blue, with #a9cb5c green and #ffc72a yellow accents. The site's
 * Whitney typeface is licensed, so Inter stands in. Products mirror what the
 * credit union offers (vehicle-led consumer lending, mortgage and home equity,
 * business lines and commercial real estate) and add business deposits, the
 * product line the First Southern Bank acquisition (closed Oct 2, 2026) made
 * central. Deposit products use share draft / share certificate language.
 * Rate teasers are illustrative, anchored to average rates in the June 30,
 * 2026 NCUA 5300 call report, not offers.
 */
export const communityFirstCreditUnionOfFlorida: WhiteLabelConfig = {
  slug: 'community-first-credit-union-of-florida',

  defaultFlows: ['account_opening', 'rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Community First Credit Union of Florida',
    shortName: 'Community First',
    wordmark: 'COMMUNITY FIRST CREDIT UNION',
    tagline: 'Member-owned in Northeast Florida and Southeast Georgia',
    primary: '#001f5f',
    primaryDark: '#00143f',
    accent: '#007fad',
    bg: '#f5f7fa',
    surface: '#ffffff',
    text: '#212529',
    textMuted: '#5f6670',
    border: '#cbd1d9',
    font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    googleFont: 'Inter',
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
    { value: 'business-banking', label: 'Open a business account' },
  ],

  products: [
    {
      id: 'auto',
      type: 'auto',
      label: 'Auto Loan',
      blurb: 'New, used or refinanced, with a decision in minutes for eligible members.',
      iconPath: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M5 17H3v-6l2-5h11l4 5v6h-2',
      minAmount: 5000,
      maxAmount: 150000,
      defaultAmount: 30000,
      purposes: ['vehicle'],
      rateTeaser: 'Rates from 5.09% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and collateral valuation.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'Personal Loan',
      blurb: 'Fixed-rate funds for life’s expenses, with no collateral required.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 1000,
      maxAmount: 40000,
      defaultAmount: 10000,
      purposes: ['debt-consolidation', 'major-purchase', 'home-improvement'],
      rateTeaser: 'Fixed rates from 10.25% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'heloc',
      type: 'heloc',
      label: 'Home Equity Line of Credit',
      blurb: 'Borrow against your home as you need it, and pay interest only on what you use.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 10000,
      maxAmount: 300000,
      defaultAmount: 50000,
      purposes: ['home-improvement', 'debt-consolidation', 'major-purchase'],
      rateTeaser: 'Variable rates; speak to a lender',
      disclosure: 'This demo collects the same borrower data RAVEN gathers for verification. Rates and terms are illustrative and subject to approval and property valuation.',
    },
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Mortgage',
      blurb: 'Buy or refinance a home in Florida with a local mortgage team.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 800000,
      defaultAmount: 300000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to a Community First mortgage loan officer',
      disclosure: 'This demo collects the same borrower data RAVEN gathers for verification. A loan officer completes the mortgage application.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business Loan',
      blurb: 'Lines of credit, equipment and commercial real estate for established businesses.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 10000,
      maxAmount: 2000000,
      defaultAmount: 250000,
      purposes: ['business'],
      rateTeaser: 'Custom business pricing',
      disclosure: 'Business requests are routed to the Community First business lending team. This demo captures owner and business basics plus financial verification. Start-up financing is not offered.',
    },
    {
      id: 'share-draft',
      type: 'deposit',
      label: 'Share Draft Account',
      blurb: 'Everyday checking for members, opened and funded in one sitting.',
      iconPath: 'M2 5h20v14H2z M2 10h20',
      minAmount: 5,
      maxAmount: 25000,
      defaultAmount: 100,
      purposes: ['everyday-banking'],
      rateTeaser: 'Membership starts with a $5 share deposit',
      disclosure: 'New membership and share draft accounts are subject to identity verification and field of membership eligibility. Demo uses sample data; no real account is opened.',
      allowedFlows: ['account_opening'],
      webDefaultFlow: 'account_opening',
    },
    {
      id: 'business-share-draft',
      type: 'deposit',
      label: 'Business Checking',
      blurb: 'Open a business account online, with owners verified in the same session.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 100,
      maxAmount: 250000,
      defaultAmount: 2500,
      purposes: ['business-banking'],
      rateTeaser: '$100 minimum opening deposit',
      disclosure: 'Business accounts are subject to verification of the business entity and its beneficial owners. Demo uses sample data; no real account is opened.',
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
      rateTeaser: 'Fixed terms with low minimums',
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
    heloc: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'residence', provider: 'Melissa', label: 'Valuing your property' },
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
    'business-share-draft': [
      { module: 'identity', provider: 'Socure', label: 'Verifying owner identity' },
      { module: 'contact', provider: 'FullContact', label: 'Confirming business contact' },
      { module: 'residence', provider: 'Melissa', label: 'Confirming the business location' },
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
          { termMonths: 48, apr: 0.0509 }, { termMonths: 60, apr: 0.0539 }, { termMonths: 72, apr: 0.0579 }, { termMonths: 84, apr: 0.0619 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 48, apr: 0.0619 }, { termMonths: 60, apr: 0.0649 }, { termMonths: 72, apr: 0.0689 }, { termMonths: 84, apr: 0.0729 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 48, apr: 0.0819 }, { termMonths: 60, apr: 0.0849 }, { termMonths: 72, apr: 0.0889 }, { termMonths: 84, apr: 0.0929 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 48, apr: 0.1119 }, { termMonths: 60, apr: 0.1169 }, { termMonths: 72, apr: 0.1219 }, { termMonths: 84, apr: 0.1269 },
      ],
    },
    personal: {
      defaultTermMonths: 48,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 36, apr: 0.1025 }, { termMonths: 48, apr: 0.1049 }, { termMonths: 60, apr: 0.1075 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 36, apr: 0.1225 }, { termMonths: 48, apr: 0.1249 }, { termMonths: 60, apr: 0.1275 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 36, apr: 0.1575 }, { termMonths: 48, apr: 0.1599 }, { termMonths: 60, apr: 0.1625 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 36, apr: 0.1925 }, { termMonths: 48, apr: 0.1949 }, { termMonths: 60, apr: 0.1975 },
      ],
    },
  },

  coreSync: {
    system: 'unknown',
    displayName: 'Core system not publicly disclosed',
    mode: 'mock',
  },

  loTeam: {
    name: 'Community First Lending',
    title: 'Consumer & Business Lending',
  },
};
