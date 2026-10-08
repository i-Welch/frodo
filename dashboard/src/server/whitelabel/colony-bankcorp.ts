import type { WhiteLabelConfig } from './types';

/**
 * Colony Bank / Colony Bankcorp, Inc. — white-label demo config.
 *
 * Brand, products, and core platform are grounded in public research
 * (colony.bank, reviewed June 2026):
 *   - Colony Bankcorp, Inc. (NYSE: CBAN), bank brand "Colony Bank," founded
 *     1975 in Fitzgerald, GA; ~$3.7B assets, ~37 locations across Georgia,
 *     Alabama, and north Florida. FDIC cert #22257.
 *   - 2026 logo: deep crimson/maroon lotus emblem with a gold corner flap and
 *     a slate-blue corner, over a slate-navy "COLONY BANK" wordmark. Brand
 *     hexes confirmed from the bank's theme CSS: crimson #840029 / #af0039,
 *     gold #e9bc55, slate-navy #25333e / #1a252e. Tagline "Simplifying your
 *     banking solutions since 1975."
 *   - Core/digital: online banking is served from digitalbanking.colony.bank
 *     on the secureinternetbank.com root domain, which is Fiserv's online
 *     banking platform (per Krebs on Security and Fiserv platform docs). That,
 *     plus a long-standing Fiserv data-processing relationship visible in
 *     Colony's SEC filings, points to a Fiserv core. Medium-high confidence.
 *   - Product reality today: mortgage has an "Apply Now" online application on
 *     a separate domain (mortgage.colonybank.com), personal loans apply online
 *     via colonybank.loanwebcenter.com, but auto, boat/RV/ATV, and HELOC are
 *     marketing detail pages only ("See loan details" / contact a lender), and
 *     business/SBA lending routes to a specialty lender. No rates published.
 *     This demo shows every line as one branded, verify-as-you-go front door.
 *
 * Rates below are ILLUSTRATIVE demo estimates, not an offer of credit. A bank
 * replaces the rate cards and provider routing at onboarding.
 */
export const colonyBankcorp: WhiteLabelConfig = {
  slug: 'colony-bankcorp',

  // Flows offered for this bank (demo shows all three; the entry path selects
  // which one a borrower gets, gated by this list).
  defaultFlows: ['rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Colony Bank',
    shortName: 'Colony',
    wordmark: 'COLONY BANK',
    tagline: 'Simplifying your banking solutions since 1975',
    primary: '#840029',
    primaryDark: '#5e001d',
    accent: '#e9bc55',
    bg: '#f7f4f2',
    surface: '#ffffff',
    text: '#25333e',
    textMuted: '#5f6b74',
    border: '#e7e1dc',
    font: "'Mulish', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    googleFont: 'Mulish',
    radius: '10px',
  },

  purposes: [
    { value: 'home-improvement', label: 'Home improvement or renovation' },
    { value: 'debt-consolidation', label: 'Consolidate debt' },
    { value: 'buy-home', label: 'Buy or refinance a home' },
    { value: 'vehicle', label: 'Buy a vehicle, boat, RV, or ATV' },
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
      maxAmount: 300000,
      defaultAmount: 50000,
      purposes: ['home-improvement', 'debt-consolidation', 'major-purchase'],
      rateTeaser: 'Variable rates from 7.59% APR',
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
      rateTeaser: 'Fixed rates from 8.09% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'personal',
      type: 'personal',
      label: 'Personal Loan',
      blurb: 'Fixed-rate funds for life’s expenses, with local decision-making.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 2000,
      maxAmount: 50000,
      defaultAmount: 15000,
      purposes: ['debt-consolidation', 'major-purchase'],
      rateTeaser: 'Fixed rates from 9.59% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
    {
      id: 'auto',
      type: 'auto',
      label: 'Auto / Boat / RV / ATV Loan',
      blurb: 'Financing for your car, truck, boat, RV, or ATV with a fast local decision.',
      iconPath: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z M5 17H3v-6l2-5h11l4 5v6h-2',
      minAmount: 5000,
      maxAmount: 150000,
      defaultAmount: 32000,
      purposes: ['vehicle'],
      rateTeaser: 'Rates from 6.39% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and collateral valuation.',
    },
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Mortgage',
      blurb: 'Purchase or refinance with a local mortgage team and quick answers.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 1500000,
      defaultAmount: 300000,
      purposes: ['buy-home'],
      rateTeaser: 'Speak to a local mortgage lender',
      disclosure:
        'This demo collects the same borrower data RAVEN gathers for verification. A mortgage lender completes the application.',
    },
    {
      id: 'business',
      type: 'business',
      label: 'Business / SBA / USDA Loan',
      blurb: 'Working capital, equipment, CRE, and SBA/USDA financing for Southeast businesses.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 25000,
      maxAmount: 5000000,
      defaultAmount: 250000,
      purposes: ['business'],
      rateTeaser: 'Custom commercial & SBA pricing',
      disclosure:
        'Commercial and SBA/USDA requests route to a specialty lender. This demo captures applicant and business basics plus financial verification.',
    },
  ],

  // Which providers we pull, per product. The journey plays these back as a
  // live data-pull animation. Equity/mortgage products pull property + income +
  // credit; unsecured pulls identity + income + credit; commercial adds
  // business financials via the linked account.
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

  // Illustrative rate cards. Equity products gate on credit + combined LTV;
  // unsecured/auto gate on credit. Each tier prices several terms, longer terms
  // priced slightly higher, so the borrower can trade term against payment.
  // Banks replace all of this at onboarding.
  rateCard: {
    heloc: {
      defaultTermMonths: 180,
      tiers: [
        { label: 'Excellent credit, low LTV', minScore: 760, maxLtv: 0.7, terms: [
          { termMonths: 120, apr: 0.0759 }, { termMonths: 180, apr: 0.0784 }, { termMonths: 240, apr: 0.0809 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.8, terms: [
          { termMonths: 120, apr: 0.0834 }, { termMonths: 180, apr: 0.0859 }, { termMonths: 240, apr: 0.0884 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.85, terms: [
          { termMonths: 120, apr: 0.0959 }, { termMonths: 180, apr: 0.0984 }, { termMonths: 240, apr: 0.1009 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 120, apr: 0.1109 }, { termMonths: 180, apr: 0.1134 }, { termMonths: 240, apr: 0.1159 },
      ],
    },
    'home-equity': {
      defaultTermMonths: 180,
      tiers: [
        { label: 'Excellent credit, low LTV', minScore: 760, maxLtv: 0.7, terms: [
          { termMonths: 60, apr: 0.0809 }, { termMonths: 120, apr: 0.0834 }, { termMonths: 180, apr: 0.0859 }, { termMonths: 240, apr: 0.0884 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.8, terms: [
          { termMonths: 60, apr: 0.0884 }, { termMonths: 120, apr: 0.0909 }, { termMonths: 180, apr: 0.0934 }, { termMonths: 240, apr: 0.0959 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.85, terms: [
          { termMonths: 60, apr: 0.1009 }, { termMonths: 120, apr: 0.1034 }, { termMonths: 180, apr: 0.1059 }, { termMonths: 240, apr: 0.1084 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 60, apr: 0.1159 }, { termMonths: 120, apr: 0.1184 }, { termMonths: 180, apr: 0.1209 }, { termMonths: 240, apr: 0.1234 },
      ],
    },
    personal: {
      defaultTermMonths: 48,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 36, apr: 0.0959 }, { termMonths: 48, apr: 0.0984 }, { termMonths: 60, apr: 0.1009 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 36, apr: 0.1159 }, { termMonths: 48, apr: 0.1184 }, { termMonths: 60, apr: 0.1209 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 36, apr: 0.1509 }, { termMonths: 48, apr: 0.1534 }, { termMonths: 60, apr: 0.1559 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 36, apr: 0.1859 }, { termMonths: 48, apr: 0.1884 }, { termMonths: 60, apr: 0.1909 },
      ],
    },
    auto: {
      defaultTermMonths: 60,
      tiers: [
        { label: 'Excellent credit', minScore: 760, terms: [
          { termMonths: 48, apr: 0.0609 }, { termMonths: 60, apr: 0.0639 }, { termMonths: 72, apr: 0.0669 }, { termMonths: 84, apr: 0.0709 },
        ] },
        { label: 'Strong credit', minScore: 700, terms: [
          { termMonths: 48, apr: 0.0729 }, { termMonths: 60, apr: 0.0759 }, { termMonths: 72, apr: 0.0789 }, { termMonths: 84, apr: 0.0829 },
        ] },
        { label: 'Good credit', minScore: 660, terms: [
          { termMonths: 48, apr: 0.0929 }, { termMonths: 60, apr: 0.0959 }, { termMonths: 72, apr: 0.0989 }, { termMonths: 84, apr: 0.1029 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 48, apr: 0.1259 }, { termMonths: 60, apr: 0.1309 }, { termMonths: 72, apr: 0.1359 }, { termMonths: 84, apr: 0.1409 },
      ],
    },
    // mortgage + business intentionally omit a rate card: those route to a
    // mortgage lender / specialty lender after verification rather than quoting.
  },

  coreSync: {
    system: 'fiserv',
    displayName: 'Fiserv',
    mode: 'mock',
  },

  loTeam: {
    name: 'Colony Bank Lending',
    title: 'Consumer, Mortgage & SBA Lending',
  },
};
