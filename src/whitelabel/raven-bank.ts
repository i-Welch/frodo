import type { WhiteLabelConfig } from './types.js';

/**
 * Raven Bank — the fictional first-party demo tenant.
 *
 * Unlike the prospect configs (which wear a real bank's brand for a targeted
 * pitch), Raven Bank is the neutral demo we can send to anyone — de novo
 * organizers, conference contacts, inbound leads — without putting another
 * bank's name on the experience. It carries RAVEN's own palette and showcases
 * the full product surface: deposit account opening (the account_opening flow)
 * alongside the lending flows.
 */
export const ravenBank: WhiteLabelConfig = {
  slug: 'raven-bank',
  branding: {
    name: 'Raven Bank',
    shortName: 'Raven Bank',
    wordmark: 'RAVEN BANK',
    tagline: 'Banking without the paperwork',
    primary: '#4C6FE7',
    primaryDark: '#3B57C4',
    accent: '#6C8EFF',
    bg: '#F6F7FB',
    surface: '#FFFFFF',
    text: '#101322',
    textMuted: '#5C6478',
    border: '#E3E7F0',
    font: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
    googleFont: 'Inter',
    radius: '10px',
  },
  defaultFlows: ['account_opening', 'rate_range', 'full_application', 'data_only'],
  purposes: [
    { value: 'home-improvement', label: 'Home improvement or renovation' },
    { value: 'debt-consolidation', label: 'Consolidate debt' },
    { value: 'major-purchase', label: 'A major purchase or expense' },
  ],
  products: [
    {
      id: 'checking',
      type: 'deposit',
      label: 'Everyday Checking',
      blurb: 'No monthly fee, no minimum balance. Debit card and online banking from day one.',
      iconPath: 'M2 5h20v14H2z M2 10h20',
      minAmount: 25,
      maxAmount: 25000,
      defaultAmount: 100,
      purposes: [],
      rateTeaser: 'No monthly fee',
      disclosure: 'Deposit accounts are subject to identity verification. Demo uses sample data; no real account is opened.',
      allowedFlows: ['account_opening'],
      webDefaultFlow: 'account_opening',
    },
    {
      id: 'savings',
      type: 'deposit',
      label: 'High-Yield Savings',
      blurb: 'A competitive rate on every dollar, with no tiers and no minimums.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 25,
      maxAmount: 250000,
      defaultAmount: 5000,
      purposes: [],
      rateTeaser: '4.10% APY',
      disclosure: 'APY shown is illustrative for this demo, not an offer. Deposit accounts are subject to identity verification.',
      allowedFlows: ['account_opening'],
      webDefaultFlow: 'account_opening',
    },
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
      id: 'personal',
      type: 'personal',
      label: 'Personal Loan',
      blurb: 'Unsecured funds for life’s expenses, with no collateral required.',
      iconPath: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      minAmount: 2000,
      maxAmount: 50000,
      defaultAmount: 15000,
      purposes: ['debt-consolidation', 'major-purchase'],
      rateTeaser: 'Fixed rates from 9.49% APR',
      disclosure: 'Rates shown are illustrative estimates for this demo, not an offer of credit. Subject to credit approval.',
    },
  ],
  providerRouting: {
    checking: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'contact', provider: 'Socure', label: 'Confirming contact details' },
      { module: 'residence', provider: 'Melissa', label: 'Confirming your address' },
      { module: 'financial', provider: 'Plaid', label: 'Linking your funding account', interactive: true },
    ],
    savings: [
      { module: 'identity', provider: 'Socure', label: 'Verifying your identity' },
      { module: 'contact', provider: 'Socure', label: 'Confirming contact details' },
      { module: 'residence', provider: 'Melissa', label: 'Confirming your address' },
      { module: 'financial', provider: 'Plaid', label: 'Linking your funding account', interactive: true },
    ],
    heloc: [
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
  },
  rateCard: {
    heloc: {
      tiers: [
        {
          label: 'Excellent credit, low LTV',
          minScore: 760,
          maxLtv: 0.8,
          terms: [
            { termMonths: 120, apr: 0.0749 },
            { termMonths: 240, apr: 0.0789 },
          ],
        },
        {
          label: 'Good credit',
          minScore: 700,
          terms: [
            { termMonths: 120, apr: 0.0819 },
            { termMonths: 240, apr: 0.0859 },
          ],
        },
      ],
      fallbackTerms: [
        { termMonths: 120, apr: 0.0899 },
        { termMonths: 240, apr: 0.0939 },
      ],
      defaultTermMonths: 240,
    },
    personal: {
      tiers: [
        {
          label: 'Excellent credit',
          minScore: 760,
          terms: [
            { termMonths: 36, apr: 0.0949 },
            { termMonths: 60, apr: 0.0999 },
          ],
        },
        {
          label: 'Good credit',
          minScore: 700,
          terms: [
            { termMonths: 36, apr: 0.1099 },
            { termMonths: 60, apr: 0.1149 },
          ],
        },
      ],
      fallbackTerms: [
        { termMonths: 36, apr: 0.1299 },
        { termMonths: 60, apr: 0.1349 },
      ],
      defaultTermMonths: 60,
    },
  },
  coreSync: { system: 'jackhenry', displayName: 'Jack Henry SilverLake', mode: 'mock' },
  loTeam: { name: 'The Raven Bank team', title: 'Account Services' },
};
