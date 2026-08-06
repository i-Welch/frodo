import type { WhiteLabelConfig } from './types';

/**
 * Palmetto Citizens Federal Credit Union — brand colors sourced from
 * palmettocitizens.org's own CSS (blue #007aff, navy #131f72, lime accent
 * #a4dc44), reviewed August 2026. Products lead with vehicle lending, and
 * deposit products are modeled as share draft / share certificate rather than
 * checking / CD, matching credit union terminology. Palmetto Citizens already
 * consolidates consumer and mortgage lending into one first-party apply flow
 * (applynow.palmettocitizens.org); business lending has no online path at all,
 * which this config's disclosures reflect.
 */
export const palmettoCitizensFcu: WhiteLabelConfig = {
  slug: 'palmetto-citizens-federal-credit-union',

  defaultFlows: ['account_opening', 'rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Palmetto Citizens Federal Credit Union',
    shortName: 'Palmetto Citizens',
    wordmark: 'PALMETTO CITIZENS',
    tagline: 'Member-owned in the Midlands since 1936',
    primary: '#007aff',
    primaryDark: '#131f72',
    accent: '#a4dc44',
    bg: '#f5f7f9',
    surface: '#ffffff',
    text: '#161e27',
    textMuted: '#5a6b78',
    border: '#dde4ea',
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
      label: 'Vehicle Loan',
      blurb: 'Finance a car or truck with a great low rate and no payments for up to 90 days.',
      iconPath: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M5 17H3v-6l2-5h11l4 5v6h-2',
      minAmount: 5000,
      maxAmount: 100000,
      defaultAmount: 28000,
      purposes: ['vehicle'],
      rateTeaser: 'Rates from 5.49% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and collateral valuation.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'Personal Loan',
      blurb: 'Unsecured funds for life’s expenses, with no collateral required.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 2000,
      maxAmount: 40000,
      defaultAmount: 10000,
      purposes: ['debt-consolidation', 'major-purchase'],
      rateTeaser: 'Fixed rates from 9.99% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Mortgage',
      blurb: 'Purchase, refinance, or a First Time Buyer or Credit Rebuilder program, with a Palmetto Citizens mortgage banker.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 900000,
      defaultAmount: 260000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to a Palmetto Citizens mortgage banker',
      disclosure: 'This demo collects the same borrower data RAVEN gathers for verification. A loan officer completes the mortgage application.',
    },
    {
      id: 'home-equity',
      type: 'home-equity',
      label: 'Home Equity Loan / Line of Credit',
      blurb: 'Draw on your home’s equity for renovations, consolidation, or a major purchase.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 10000,
      maxAmount: 200000,
      defaultAmount: 40000,
      purposes: ['home-improvement', 'debt-consolidation', 'major-purchase'],
      rateTeaser: 'Variable rates from 7.99% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business / Commercial Loan',
      blurb: 'Lines of credit, term loans, commercial real estate, and SBA 7(a) financing for member-owned businesses.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 25000,
      maxAmount: 1000000,
      defaultAmount: 100000,
      purposes: ['business'],
      rateTeaser: 'Custom commercial pricing',
      disclosure: 'Every Palmetto Citizens business loan category today requires a Help Desk message, phone call, or branch visit; none has an online application. This demo shows what a verified digital intake would look like for the same products.',
    },
    {
      id: 'share-draft',
      type: 'deposit',
      label: 'Share Draft Account',
      blurb: 'Everyday banking with no monthly fee and mobile deposit from day one.',
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
      blurb: 'Lock in a fixed dividend rate for a term that fits your goals.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 500,
      maxAmount: 250000,
      defaultAmount: 5000,
      purposes: ['everyday-banking'],
      rateTeaser: 'Terms from 6 to 60 months',
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
    'home-equity': [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'residence', provider: 'Melissa', label: 'Valuing your property' },
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
          { termMonths: 48, apr: 0.0549 }, { termMonths: 60, apr: 0.0579 }, { termMonths: 72, apr: 0.0619 }, { termMonths: 84, apr: 0.0659 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 48, apr: 0.0669 }, { termMonths: 60, apr: 0.0699 }, { termMonths: 72, apr: 0.0739 }, { termMonths: 84, apr: 0.0779 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 48, apr: 0.0869 }, { termMonths: 60, apr: 0.0899 }, { termMonths: 72, apr: 0.0939 }, { termMonths: 84, apr: 0.0979 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 48, apr: 0.1169 }, { termMonths: 60, apr: 0.1219 }, { termMonths: 72, apr: 0.1269 }, { termMonths: 84, apr: 0.1319 },
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
    'home-equity': {
      defaultTermMonths: 180,
      tiers: [
        { label: 'Excellent credit, low LTV', minScore: 760, maxLtv: 0.7, terms: [
          { termMonths: 60, apr: 0.0799 }, { termMonths: 120, apr: 0.0824 }, { termMonths: 180, apr: 0.0849 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.8, terms: [
          { termMonths: 60, apr: 0.0874 }, { termMonths: 120, apr: 0.0899 }, { termMonths: 180, apr: 0.0924 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.85, terms: [
          { termMonths: 60, apr: 0.0999 }, { termMonths: 120, apr: 0.1024 }, { termMonths: 180, apr: 0.1049 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 60, apr: 0.1149 }, { termMonths: 120, apr: 0.1174 }, { termMonths: 180, apr: 0.1199 },
      ],
    },
  },

  coreSync: {
    system: 'unknown',
    displayName: 'Tyfone nFinia (digital banking); core not publicly disclosed',
    mode: 'mock',
  },

  loTeam: {
    name: 'Palmetto Citizens Federal Credit Union Lending',
    title: 'Consumer & Commercial Lending',
  },
};
