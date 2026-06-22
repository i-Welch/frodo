import type { WhiteLabelConfig } from './types';

/**
 * Anderson Brothers Bank — white-label demo config.
 *
 * Brand, products, and core platform are grounded in public research of
 * abbank.com and FDIC data (June 2026):
 *   - Brand green #2f7851 (btn-primary across main.min.css), darker #215338
 *     (hover state), orange accent #d04b00 (btn-info). Logo reads blue but the
 *     live site's working palette is green + orange. Tagline pulled from the
 *     personal-loan / debt-consolidation hero: "Consolidate. Simplify. Move
 *     Forward." Established 1933 in Mullins, SC; 26+ branches across the Pee
 *     Dee, Coastal, and Low Country regions. FDIC #9923, NMLS #410840,
 *     ~$1.78B assets, ROA ~1.46%.
 *   - Core platform: Jack Henry (high confidence). Personal online banking is
 *     Jack Henry NetTeller ("My NetTeller dashboard" at go.abbank.com) and
 *     remote deposit runs on ProfitStars (smartpay.profitstars.com) — both
 *     Jack Henry products. NetTeller is sold to banks on Jack Henry's
 *     SilverLake / CIF 20/20 cores, and ABB's $1.78B asset size is squarely
 *     SilverLake territory. So core sync targets Jack Henry.
 *   - Digital presence reality: Anderson Brothers is a CONSUMER / AUTO /
 *     PERSONAL installment-lending shop and has more online intake than most
 *     peers, but it's fragmented across three vendor domains:
 *       * Auto loans -> "Start your Hassle-Free Application" hands off to
 *         abbank.defidirect.com (defi SOLUTIONS indirect/consumer LOS).
 *       * Personal loans -> "apply online or at your branch," same defi flow.
 *       * Mortgage -> abbankconsumerconnect.mymortgage-online.com (a separate
 *         third-party mortgage POS on its own domain / brand).
 *     No published rates anywhere; deposits/account opening are largely
 *     branch-and-NetTeller. Every line bounces the borrower to a different
 *     vendor look. This demo collapses all of it into one branded, verify-as-
 *     you-go front door. Rates below are illustrative, not an offer of credit.
 */
export const andersonBrothersBank: WhiteLabelConfig = {
  slug: 'anderson-brothers-bank',

  // Demo shows all three flows; the entry path picks which one a borrower gets,
  // gated by this list.
  defaultFlows: ['rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Anderson Brothers Bank',
    shortName: 'Anderson Brothers',
    wordmark: 'ANDERSON BROTHERS BANK',
    tagline: 'Consolidate. Simplify. Move Forward.',
    primary: '#2f7851',
    primaryDark: '#215338',
    accent: '#d04b00',
    bg: '#f7f8f7',
    surface: '#ffffff',
    text: '#26292e',
    textMuted: '#5f6a62',
    border: '#dee2e6',
    font: "'Mulish', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    googleFont: 'Mulish',
    radius: '8px',
  },

  purposes: [
    { value: 'vehicle', label: 'Buy or repair a vehicle' },
    { value: 'debt-consolidation', label: 'Consolidate debt' },
    { value: 'major-purchase', label: 'A major purchase or unexpected expense' },
    { value: 'home-improvement', label: 'Home improvement or renovation' },
    { value: 'buy-home', label: 'Buy or refinance a home' },
    { value: 'business', label: 'Grow my business' },
  ],

  products: [
    {
      id: 'auto',
      type: 'auto',
      label: 'Auto Loan',
      blurb: 'Financing for new or used vehicles, plus repairs, with a quick local decision.',
      iconPath: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M5 17H3v-6l2-5h11l4 5v6h-2',
      minAmount: 3000,
      maxAmount: 75000,
      defaultAmount: 22000,
      purposes: ['vehicle'],
      rateTeaser: 'Rates from 6.49% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. We finance a variety of credit situations. Subject to credit approval and collateral valuation.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'Personal Loan',
      blurb: 'Funds for unexpected expenses, debt consolidation, or life’s plans, with low-credit options available.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 1000,
      maxAmount: 25000,
      defaultAmount: 8000,
      purposes: ['debt-consolidation', 'major-purchase'],
      rateTeaser: 'Fixed rates from 9.99% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'home-equity',
      type: 'home-equity',
      label: 'Home Equity Loan',
      blurb: 'Tap your home’s equity at a fixed rate with predictable monthly payments.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 10000,
      maxAmount: 200000,
      defaultAmount: 35000,
      purposes: ['home-improvement', 'debt-consolidation', 'major-purchase'],
      rateTeaser: 'Fixed rates from 7.99% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Home Mortgage',
      blurb: 'Purchase or refinance with a local mortgage team based right here in South Carolina.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 1000000,
      defaultAmount: 285000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to a local mortgage officer',
      disclosure:
        'This demo collects the same borrower data RAVEN gathers for verification. A loan officer completes the mortgage application.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business / Commercial Loan',
      blurb: 'Working capital, equipment, and commercial real estate for Pee Dee and coastal businesses.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 25000,
      maxAmount: 1500000,
      defaultAmount: 120000,
      purposes: ['business'],
      rateTeaser: 'Custom commercial pricing',
      disclosure:
        'Commercial requests are routed to a relationship manager. This demo captures applicant and business basics plus financial verification.',
    },
  ],

  // Which providers we pull, per product. The journey plays these back as a
  // live data-pull animation. Auto/personal pull identity + income + credit;
  // equity/mortgage add property; commercial adds business financials.
  providerRouting: {
    auto: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'credit', provider: 'Experian', label: 'Checking your credit profile' },
    ],
    personal: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'contact', provider: 'Melissa', label: 'Confirming contact details' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
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
    business: [
      { module: 'identity', provider: 'Socure', label: 'Verifying owner identity' },
      { module: 'contact', provider: 'FullContact', label: 'Confirming business contact' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your business accounts', interactive: true },
      { module: 'credit', provider: 'Experian', label: 'Checking credit profile' },
    ],
  },

  // Illustrative rate cards. Auto/personal gate on credit; home equity gates on
  // credit + combined LTV. Longer terms priced slightly higher so the borrower
  // can trade term against payment. Banks replace all of this at onboarding.
  rateCard: {
    auto: {
      defaultTermMonths: 60,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 48, apr: 0.0619 }, { termMonths: 60, apr: 0.0649 }, { termMonths: 72, apr: 0.0689 }, { termMonths: 84, apr: 0.0729 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 48, apr: 0.0749 }, { termMonths: 60, apr: 0.0779 }, { termMonths: 72, apr: 0.0819 }, { termMonths: 84, apr: 0.0859 },
        ] },
        { label: 'Good credit', minScore: 640, terms: [
          { termMonths: 48, apr: 0.0989 }, { termMonths: 60, apr: 0.1019 }, { termMonths: 72, apr: 0.1059 }, { termMonths: 84, apr: 0.1099 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 48, apr: 0.1399 }, { termMonths: 60, apr: 0.1449 }, { termMonths: 72, apr: 0.1499 }, { termMonths: 84, apr: 0.1549 },
      ],
    },
    personal: {
      defaultTermMonths: 48,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 24, apr: 0.0999 }, { termMonths: 36, apr: 0.1029 }, { termMonths: 48, apr: 0.1059 }, { termMonths: 60, apr: 0.1089 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 24, apr: 0.1249 }, { termMonths: 36, apr: 0.1279 }, { termMonths: 48, apr: 0.1309 }, { termMonths: 60, apr: 0.1339 },
        ] },
        { label: 'Good credit', minScore: 640, terms: [
          { termMonths: 24, apr: 0.1649 }, { termMonths: 36, apr: 0.1679 }, { termMonths: 48, apr: 0.1709 }, { termMonths: 60, apr: 0.1739 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 24, apr: 0.2099 }, { termMonths: 36, apr: 0.2129 }, { termMonths: 48, apr: 0.2159 }, { termMonths: 60, apr: 0.2189 },
      ],
    },
    'home-equity': {
      defaultTermMonths: 180,
      tiers: [
        { label: 'Excellent credit, low LTV', minScore: 760, maxLtv: 0.7, terms: [
          { termMonths: 60, apr: 0.0799 }, { termMonths: 120, apr: 0.0824 }, { termMonths: 180, apr: 0.0849 }, { termMonths: 240, apr: 0.0874 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.8, terms: [
          { termMonths: 60, apr: 0.0874 }, { termMonths: 120, apr: 0.0899 }, { termMonths: 180, apr: 0.0924 }, { termMonths: 240, apr: 0.0949 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.85, terms: [
          { termMonths: 60, apr: 0.0999 }, { termMonths: 120, apr: 0.1024 }, { termMonths: 180, apr: 0.1049 }, { termMonths: 240, apr: 0.1074 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 60, apr: 0.1149 }, { termMonths: 120, apr: 0.1174 }, { termMonths: 180, apr: 0.1199 }, { termMonths: 240, apr: 0.1224 },
      ],
    },
    // mortgage + business intentionally omit a rate card: those route to a loan
    // officer / relationship manager after verification rather than quoting.
  },

  coreSync: {
    system: 'jackhenry',
    displayName: 'Jack Henry SilverLake',
    mode: 'mock',
  },

  loTeam: {
    name: 'Anderson Brothers Bank Lending',
    title: 'Consumer & Mortgage Lending',
    nmls: '410840',
  },
};
