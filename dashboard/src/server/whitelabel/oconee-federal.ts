import type { WhiteLabelConfig } from './types';

/**
 * Oconee Federal Savings and Loan Association — white-label demo config.
 *
 * Brand, products, and core platform are grounded in public research
 * (oconeefederal.com and SEC filings for Oconee Federal Financial Corp,
 * Nasdaq: OFED), reviewed June 2026:
 *   - Federally chartered thrift / S&L, founded 1924, HQ Seneca, SC; NMLS #810392.
 *     ~$663M total assets (3/31/2026), ~9 branches across upstate SC and NE GA.
 *   - A mortgage-first institution: conventional fixed/ARM, construction-permanent,
 *     and lot/land are the headline products; consumer/auto/personal lines are
 *     essentially absent. HELOC, government (FHA/VA/USDA) and commercial/SBA exist
 *     but route to "Contact Our Team," not an online app.
 *   - Today only the core conforming mortgage products have an online application
 *     (an "Apply Now" portal on the mortgage page). HELOC and commercial are
 *     phone/branch only. This demo shows every line as one branded, verify-as-you-go
 *     front door.
 *   - Online/mobile banking is delivered through FIS (login host
 *     web1.secureinternetbank.com, the pbi_pbi1151 / EBC_EBC1151 pattern that is the
 *     FIS / former-Metavante consumer + business online-banking signature), so core
 *     sync targets FIS. Confidence: moderate-high on FIS for digital banking; the
 *     deposit/loan core processor is not separately disclosed in filings.
 *   - Brand is navy blue on white from the Oconee Federal logo and site.
 *
 * Rates below are illustrative estimates for the demo, not an offer of credit.
 */
export const oconeeFederal: WhiteLabelConfig = {
  slug: 'oconee-federal',

  // Demo shows all three flows; the entry path selects which one a borrower gets.
  defaultFlows: ['rate_range', 'full_application', 'data_only'],

  branding: {
    name: 'Oconee Federal Savings and Loan',
    shortName: 'Oconee Federal',
    wordmark: 'OCONEE FEDERAL',
    tagline: 'Your hometown bank since 1924',
    primary: '#1c3f6e',
    primaryDark: '#142d4f',
    accent: '#c8a24a',
    bg: '#f5f7fa',
    surface: '#ffffff',
    text: '#16202e',
    textMuted: '#5b6677',
    border: '#dde3ea',
    font: "'Libre Franklin', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    googleFont: 'Libre Franklin',
    radius: '8px',
  },

  purposes: [
    { value: 'buy-home', label: 'Buy or refinance a home' },
    { value: 'build-home', label: 'Build a home or buy land' },
    { value: 'home-improvement', label: 'Home improvement or renovation' },
    { value: 'debt-consolidation', label: 'Consolidate debt' },
    { value: 'major-purchase', label: 'A major purchase or expense' },
    { value: 'business', label: 'Grow my business' },
  ],

  products: [
    {
      id: 'mortgage',
      type: 'mortgage',
      label: 'Home Mortgage',
      blurb: 'Fixed-rate and adjustable purchase or refinance loans, 15 to 30 years, with local servicing.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 50000,
      maxAmount: 1250000,
      defaultAmount: 285000,
      purposes: ['buy-home'],
      rateTeaser: 'Fixed rates from 6.49% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'construction',
      type: 'mortgage',
      label: 'Construction-to-Permanent Loan',
      blurb: 'One closing for building your home, then it rolls into a permanent mortgage when you move in.',
      iconPath: 'M3 21h18 M5 21V9l7-5 7 5v12 M9 21v-6h6v6 M9 9h.01 M15 9h.01',
      minAmount: 75000,
      maxAmount: 1250000,
      defaultAmount: 350000,
      purposes: ['build-home'],
      rateTeaser: 'Fixed rates from 6.99% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval, appraisal, and builder review.',
    },
    {
      id: 'lot-land',
      type: 'mortgage',
      label: 'Lot & Land Loan',
      blurb: 'Special rates to finance a residential lot now and build when you are ready.',
      iconPath: 'M3 20h18 M5 20l3-9 4 5 3-7 4 11 M5 20V8',
      minAmount: 25000,
      maxAmount: 500000,
      defaultAmount: 90000,
      purposes: ['build-home', 'major-purchase'],
      rateTeaser: 'Fixed rates from 7.49% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property valuation.',
    },
    {
      id: 'heloc',
      type: 'heloc',
      label: 'Home Equity Line of Credit',
      blurb: 'Tap your home equity for improvements, life events, or debt consolidation. Interest only on what you use.',
      iconPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      minAmount: 10000,
      maxAmount: 250000,
      defaultAmount: 45000,
      purposes: ['home-improvement', 'debt-consolidation', 'major-purchase'],
      rateTeaser: 'Variable rates from 7.74% APR',
      disclosure:
        'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval and property appraisal.',
    },
    {
      id: 'home-equity',
      type: 'home-equity',
      label: 'Home Equity Loan',
      blurb: 'A fixed amount at a fixed rate against your equity, repaid in predictable monthly payments.',
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
      id: 'business',
      type: 'business',
      label: 'Commercial & SBA Lending',
      blurb: 'Commercial real estate, equipment, and SBA financing for businesses across the Oconee County region.',
      iconPath: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-3 M9 9v.01 M9 12v.01 M9 15v.01',
      minAmount: 25000,
      maxAmount: 2000000,
      defaultAmount: 175000,
      purposes: ['business'],
      rateTeaser: 'Custom commercial pricing',
      disclosure:
        'Commercial and SBA requests are routed to a relationship manager. This demo captures applicant and business basics plus financial verification.',
    },
  ],

  // Which providers we pull, per product. Mortgage/equity/construction products
  // pull property + income + credit; commercial adds business financials via the
  // linked account.
  providerRouting: {
    mortgage: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'residence', provider: 'Melissa', label: 'Pulling property details' },
      { module: 'credit', provider: 'Experian', label: 'Checking your credit profile' },
    ],
    construction: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'employment', provider: 'Truework', label: 'Verifying income & employment' },
      { module: 'residence', provider: 'Melissa', label: 'Confirming lot & site details' },
      { module: 'credit', provider: 'Experian', label: 'Checking your credit profile' },
    ],
    'lot-land': [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your bank account', interactive: true },
      { module: 'residence', provider: 'Melissa', label: 'Valuing the property' },
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
    business: [
      { module: 'identity', provider: 'Socure', label: 'Verifying owner identity' },
      { module: 'contact', provider: 'FullContact', label: 'Confirming business contact' },
      { module: 'financial', provider: 'Plaid', label: 'Connecting your business accounts', interactive: true },
      { module: 'credit', provider: 'Experian', label: 'Checking credit profile' },
    ],
  },

  // Illustrative rate cards. Mortgage/construction/lot price on credit (LTV gates
  // the equity products). Each tier prices several terms, longer terms priced
  // slightly higher. Banks replace all of this at onboarding.
  rateCard: {
    mortgage: {
      defaultTermMonths: 360,
      tiers: [
        { label: 'Excellent credit', minScore: 760, maxLtv: 0.8, terms: [
          { termMonths: 180, apr: 0.0649 }, { termMonths: 240, apr: 0.0674 }, { termMonths: 360, apr: 0.0699 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.9, terms: [
          { termMonths: 180, apr: 0.0699 }, { termMonths: 240, apr: 0.0724 }, { termMonths: 360, apr: 0.0749 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.95, terms: [
          { termMonths: 180, apr: 0.0774 }, { termMonths: 240, apr: 0.0799 }, { termMonths: 360, apr: 0.0824 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 180, apr: 0.0924 }, { termMonths: 240, apr: 0.0949 }, { termMonths: 360, apr: 0.0974 },
      ],
    },
    construction: {
      defaultTermMonths: 360,
      tiers: [
        { label: 'Excellent credit', minScore: 760, maxLtv: 0.8, terms: [
          { termMonths: 180, apr: 0.0699 }, { termMonths: 240, apr: 0.0724 }, { termMonths: 360, apr: 0.0749 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.85, terms: [
          { termMonths: 180, apr: 0.0749 }, { termMonths: 240, apr: 0.0774 }, { termMonths: 360, apr: 0.0799 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.9, terms: [
          { termMonths: 180, apr: 0.0824 }, { termMonths: 240, apr: 0.0849 }, { termMonths: 360, apr: 0.0874 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 180, apr: 0.0974 }, { termMonths: 240, apr: 0.0999 }, { termMonths: 360, apr: 0.1024 },
      ],
    },
    'lot-land': {
      defaultTermMonths: 240,
      tiers: [
        { label: 'Excellent credit', minScore: 760, maxLtv: 0.75, terms: [
          { termMonths: 120, apr: 0.0749 }, { termMonths: 180, apr: 0.0774 }, { termMonths: 240, apr: 0.0799 },
        ] },
        { label: 'Strong credit', minScore: 720, maxLtv: 0.8, terms: [
          { termMonths: 120, apr: 0.0824 }, { termMonths: 180, apr: 0.0849 }, { termMonths: 240, apr: 0.0874 },
        ] },
        { label: 'Good credit', minScore: 680, maxLtv: 0.85, terms: [
          { termMonths: 120, apr: 0.0924 }, { termMonths: 180, apr: 0.0949 }, { termMonths: 240, apr: 0.0974 },
        ] },
      ],
      fallbackTerms: [
        { termMonths: 120, apr: 0.1099 }, { termMonths: 180, apr: 0.1124 }, { termMonths: 240, apr: 0.1149 },
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
    // business intentionally omits a rate card: commercial/SBA route to a
    // relationship manager after verification rather than quoting.
  },

  coreSync: {
    system: 'fis',
    displayName: 'FIS',
    mode: 'mock',
  },

  loTeam: {
    name: 'Oconee Federal Mortgage Lending',
    title: 'Mortgage & Commercial Lending',
  },
};
