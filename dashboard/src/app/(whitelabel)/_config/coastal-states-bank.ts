import type { WhiteLabelConfig } from './types';

/**
 * Coastal States Bank — white-label demo config.
 *
 * Brand, products, and core platform are grounded in public research
 * (coastalstatesbank.com, reviewed June 2026):
 *   - Subsidiary of CoastalSouth Bancshares (NYSE: COSO, listed Jan 2026),
 *     HQ Hilton Head Island, SC; ~$2.35B assets; FDIC cert #57756.
 *   - Taglines on site: "Partnerships That Perform" / "Local Banking With
 *     Real Impact". Coastal navy wordmark with a teal/aqua "wave" accent
 *     (brand redesigned 2019); colors below approximate the site palette.
 *   - Core / digital banking is Fiserv: the consumer/business login portal
 *     resolves to web13.secureinternetbank.com, Fiserv's shared online-banking
 *     domain (Corillian Online / Architect). So core sync targets Fiserv.
 *   - Runs two businesses: the #1 deposit franchise in Beaufort County
 *     (Lowcountry SC) plus Savannah/Atlanta, AND national specialty lending
 *     lines: Marine & RV, Government Guaranteed (SBA), Senior Housing, and
 *     Mortgage Banker / Warehouse Finance.
 *   - Digital reality today: online account opening exists
 *     (openlocal.coastalstatesbank.com), but lending has no self-serve front
 *     door. Marine/RV routes to a phone/email support team ((678) 396-4620);
 *     mortgage, home equity, and commercial all end at "contact a banker."
 *     This demo shows every line as a single, branded, verify-as-you-go intake.
 *
 * All rates below are illustrative estimates for the demo, not offers of credit.
 */
export const coastalStatesBank: WhiteLabelConfig = {
  slug: 'coastal-states-bank',

  // Flows offered for this bank (demo shows all three; the entry path selects
  // which one a borrower gets, gated by this list).
  defaultFlows: ['rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Coastal States Bank',
    shortName: 'Coastal States',
    wordmark: 'COASTAL STATES BANK',
    tagline: 'Partnerships That Perform',
    primary: '#0a3b5c',
    primaryDark: '#06283e',
    accent: '#2bb3c0',
    bg: '#f4f7f9',
    surface: '#ffffff',
    text: '#16242e',
    textMuted: '#5a6b76',
    border: '#dde5ea',
    font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    googleFont: 'Inter',
    radius: '8px',
  },

  purposes: [
    { value: 'buy-boat', label: 'Buy or refinance a boat, yacht, or RV' },
    { value: 'home-improvement', label: 'Home improvement or renovation' },
    { value: 'debt-consolidation', label: 'Consolidate debt' },
    { value: 'buy-home', label: 'Buy or refinance a home' },
    { value: 'major-purchase', label: 'A major purchase or expense' },
    { value: 'business', label: 'Grow my business' },
  ],

  products: [
    {
      id: 'marine',
      type: 'auto',
      label: 'Marine & RV Loan',
      blurb: 'Finance a boat, yacht, or RV through our national specialty lending team.',
      iconPath: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M5 17H3v-6l2-5h11l4 5v6h-2',
      minAmount: 15000,
      maxAmount: 500000,
      defaultAmount: 85000,
      purposes: ['buy-boat'],
      rateTeaser: 'Rates from 6.99% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and vessel valuation.',
    },
    {
      id: 'heloc',
      type: 'heloc',
      label: 'Home Equity Line of Credit',
      blurb: 'Draw on your home equity as you need it. Special intro rate for the first 12 months.',
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
      id: 'mortgage',
      type: 'mortgage',
      label: 'Residential Mortgage',
      blurb: 'Purchase or refinance a Lowcountry home with a local mortgage banker.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 2000000,
      defaultAmount: 425000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to a local mortgage banker',
      disclosure:
        'This demo collects the same borrower data RAVEN gathers for verification. A mortgage banker completes the application.',
    },
    {
      id: 'sba',
      type: 'business',
      label: 'SBA / Government Guaranteed Loan',
      blurb: 'SBA 7(a) and 504 financing from our national Government Guaranteed Lending team.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 50000,
      maxAmount: 5000000,
      defaultAmount: 350000,
      purposes: ['business'],
      rateTeaser: 'SBA pricing tied to Prime',
      disclosure:
        'SBA requests are routed to a Government Guaranteed Lending specialist. This demo captures owner and business basics plus financial verification.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Commercial / 48-Hour Small Business Loan',
      blurb: 'Working capital, equipment, and commercial real estate, with a fast local decision.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 25000,
      maxAmount: 2000000,
      defaultAmount: 150000,
      purposes: ['business'],
      rateTeaser: 'Custom commercial pricing',
      disclosure:
        'Commercial requests are routed to a relationship manager. This demo captures applicant and business basics plus financial verification.',
    },
  ],

  // Which providers we pull, per product. The journey plays these back as a
  // live data-pull animation. Marine pulls identity + income + credit (vessel
  // valued separately); equity/mortgage add property; commercial/SBA add
  // business financials via the linked account.
  providerRouting: {
    marine: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'contact', provider: 'Melissa', label: 'Confirming contact details' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
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
    mortgage: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'residence', provider: 'Melissa', label: 'Pulling property details' },
      { module: 'credit', provider: 'Experian', label: 'Checking your credit profile' },
    ],
    sba: [
      { module: 'identity', provider: 'Socure', label: 'Verifying owner identity' },
      { module: 'contact', provider: 'FullContact', label: 'Confirming business contact' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your business accounts', interactive: true },
      { module: 'credit', provider: 'Experian', label: 'Checking credit profile' },
    ],
    business: [
      { module: 'identity', provider: 'Socure', label: 'Verifying owner identity' },
      { module: 'contact', provider: 'FullContact', label: 'Confirming business contact' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your business accounts', interactive: true },
      { module: 'credit', provider: 'Experian', label: 'Checking credit profile' },
    ],
  },

  // Illustrative rate cards. Equity products gate on credit + combined LTV;
  // marine gates on credit (vessel valued separately). Each tier prices several
  // terms, longer terms priced slightly higher, so the borrower can trade term
  // against payment. Banks replace all of this at onboarding.
  rateCard: {
    marine: {
      defaultTermMonths: 180,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 120, apr: 0.0699 }, { termMonths: 180, apr: 0.0729 }, { termMonths: 240, apr: 0.0769 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 120, apr: 0.0819 }, { termMonths: 180, apr: 0.0849 }, { termMonths: 240, apr: 0.0889 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 120, apr: 0.0999 }, { termMonths: 180, apr: 0.1029 }, { termMonths: 240, apr: 0.1069 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 120, apr: 0.1299 }, { termMonths: 180, apr: 0.1329 }, { termMonths: 240, apr: 0.1369 },
      ],
    },
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
    // mortgage, sba, and business intentionally omit a rate card: those route
    // to a mortgage banker / relationship manager after verification rather
    // than quoting a borrower-facing estimate.
  },

  coreSync: {
    system: 'fiserv',
    displayName: 'Fiserv',
    mode: 'mock',
  },

  loTeam: {
    name: 'Coastal States Bank Lending',
    title: 'Consumer, Mortgage & Specialty Lending',
  },
};
