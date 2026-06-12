/**
 * RAVEN Verification ROI methodology (v2) and per-bank audit inputs.
 *
 * v2 changes vs. the original PDF audits:
 * - Scenario ranges (conservative / expected / optimistic) instead of point estimates
 * - Loan-mix-specific hours saved per file (mortgage vs. commercial vs. consumer)
 * - Every assumption surfaced as a numbered footnote on the page
 *
 * All inputs come from public data (FDIC call reports, HMDA, CRA evaluations).
 * Volume figures marked `estimated: true` are derived, not reported.
 */

export type Scenario = 'conservative' | 'expected' | 'optimistic';

// Hours of staff time saved per verified file, by file type. [footnote 1]
const HOURS_SAVED: Record<string, Record<Scenario, number>> = {
  mortgage: { conservative: 6, expected: 10, optimistic: 14 },
  commercial: { conservative: 8, expected: 12, optimistic: 16 },
  consumer: { conservative: 2, expected: 4, optimistic: 6 },
};

// Loaded staff cost per hour, blended across roles. [footnote 2]
const LOADED_HOURLY: Record<Scenario, number> = {
  conservative: 38,
  expected: 42,
  optimistic: 48,
};

// Percentage-point reduction in mortgage application abandonment. [footnote 4]
const PULL_THROUGH_PTS: Record<Scenario, number> = {
  conservative: 1,
  expected: 3,
  optimistic: 5,
};

// MBA-reported average profit per closed mortgage. [footnote 4]
const PROFIT_PER_LOAN = 785;

export interface BankRoiInput {
  slug: string;
  name: string;
  shortName: string;
  articleSlug: string;
  articleTitle: string;
  fdicCert: number;
  // At-a-glance stats shown in the header
  stats: { label: string; value: string }[];
  // Annual verification volumes
  volumes: {
    mortgage: { count: number; source: string; estimated: boolean };
    commercial: { count: number; source: string; estimated: boolean };
    consumer: { count: number; source: string; estimated: boolean };
  };
  // One-paragraph framing for the page intro
  intro: string;
  // Bank-specific strategic notes (beyond the dollar math)
  strategic: { title: string; body: string }[];
  // Data sources line
  sources: string;
  auditDate: string;
}

export interface RoiScenarioResult {
  laborValue: number;
  pullThroughLoans: number;
  pullThroughRevenue: number;
  totalValue: number;
  hoursRecovered: number;
}

export interface RoiResult {
  conservative: RoiScenarioResult;
  expected: RoiScenarioResult;
  optimistic: RoiScenarioResult;
  totalVerifications: number;
  laborByCategory: {
    category: string;
    label: string;
    count: number;
    hours: Record<Scenario, number>;
    value: Record<Scenario, number>;
  }[];
}

export function computeRoi(input: BankRoiInput): RoiResult {
  const scenarios: Scenario[] = ['conservative', 'expected', 'optimistic'];
  const categories = [
    { key: 'mortgage', label: 'Mortgage files', count: input.volumes.mortgage.count },
    { key: 'commercial', label: 'CRE / C&I files', count: input.volumes.commercial.count },
    { key: 'consumer', label: 'Consumer / HELOC files', count: input.volumes.consumer.count },
  ];

  const laborByCategory = categories.map((c) => {
    const hours = {} as Record<Scenario, number>;
    const value = {} as Record<Scenario, number>;
    for (const s of scenarios) {
      hours[s] = c.count * HOURS_SAVED[c.key][s];
      value[s] = hours[s] * LOADED_HOURLY[s];
    }
    return { category: c.key, label: c.label, count: c.count, hours, value };
  });

  const result = {} as Record<Scenario, RoiScenarioResult>;
  for (const s of scenarios) {
    const laborValue = laborByCategory.reduce((sum, c) => sum + c.value[s], 0);
    const hoursRecovered = laborByCategory.reduce((sum, c) => sum + c.hours[s], 0);
    // Additional closed loans from reduced abandonment, applied to mortgage
    // volume only. Deliberately conservative: applied to originations rather
    // than the larger application pool. [footnote 4]
    const pullThroughLoans = Math.round(
      input.volumes.mortgage.count * (PULL_THROUGH_PTS[s] / 100),
    );
    const pullThroughRevenue = pullThroughLoans * PROFIT_PER_LOAN;
    result[s] = {
      laborValue,
      pullThroughLoans,
      pullThroughRevenue,
      totalValue: laborValue + pullThroughRevenue,
      hoursRecovered,
    };
  }

  return {
    ...result,
    totalVerifications: categories.reduce((sum, c) => sum + c.count, 0),
    laborByCategory,
  };
}

export const METHODOLOGY_FOOTNOTES: { id: number; title: string; body: string }[] = [
  {
    id: 1,
    title: 'Hours saved per file',
    body: 'Published verification-automation case studies (Blend Labs, 2025) report 15-16+ staff hours saved per mortgage file across loan officers, processors, underwriters, and compliance. We model mortgages at 6-14 hours, commercial files (which add beneficial ownership, guarantor identity, and business financials) at 8-16 hours, and simpler consumer or HELOC files at 2-6 hours. The expected case sits well below published benchmarks on purpose.',
  },
  {
    id: 2,
    title: 'Loaded staff cost',
    body: 'The $38-48/hour range blends Bureau of Labor Statistics OEWS rates for South Carolina loan officers (~$30/hr), processors (~$28/hr), underwriters (~$55/hr), and compliance staff (~$50/hr), including benefits. Most verification labor falls on processors and loan officers, which is why the blend sits closer to the lower rates.',
  },
  {
    id: 3,
    title: 'Verification volume',
    body: 'Mortgage counts come from HMDA Modified LAR filings via FFIEC, which report actual originations. Commercial, HELOC, and consumer volumes are estimates derived from FDIC call report loan mix and branch footprint; they are not reported figures and could vary materially. The 60-day pilot exists to replace these estimates with the bank’s own measured numbers.',
  },
  {
    id: 4,
    title: 'Pull-through improvement',
    body: 'The MBA reports roughly 68% industry-wide mortgage application abandonment. We model a 1-5 percentage-point improvement applied to originations (not the larger application pool, which would produce a roughly 3x bigger figure), at the MBA-reported $785 average profit per closed loan. Published case studies report 10-15 point gains; our optimistic case is one-half to one-third of that.',
  },
  {
    id: 5,
    title: 'What this is not',
    body: 'These figures are directional estimates built from public data and industry benchmarks. They are not a quote, a guarantee, or an analysis of the bank’s internal workflows, and recovered hours are modeled as redeployed origination capacity rather than headcount reduction. Banks already running highly automated verification will see less; banks running fully manual document collection will see more.',
  },
];

export const ROI_BANKS: BankRoiInput[] = [
  {
    slug: 'oconee-federal',
    name: 'Oconee Federal Savings & Loan',
    shortName: 'Oconee Federal',
    articleSlug: 'oconee-federal-quiet-comeback',
    articleTitle: 'The Quiet Comeback at Oconee Federal',
    fdicCert: 30111,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$663M' },
      { label: 'Branches', value: '9 across SC & GA' },
      { label: 'Loan book in 1-4 family residential', value: '81%' },
      { label: 'Mortgage run-rate (HMDA)', value: '~150/yr' },
    ],
    volumes: {
      mortgage: { count: 150, source: 'OCC CRA Performance Evaluation, post-rate-shock run-rate', estimated: false },
      commercial: { count: 10, source: 'FDIC call report loan mix', estimated: true },
      consumer: { count: 40, source: 'HELOC estimate from footprint', estimated: true },
    },
    intro:
      'A 102-year-old thrift with 81% of its loan book in residential mortgages is, structurally, a verification business. Every file Oconee Federal originates runs the same document chase: identity, income, employment, assets, property. This is what that chase costs today, and what a single verification link changes.',
    strategic: [
      {
        title: 'The mortgage book is the bank',
        body: 'With $397M of $488M in net loans in 1-4 family residential, verification speed is not a back-office detail. It is the production line. Every hour saved per file compounds across essentially the whole book.',
      },
      {
        title: 'Lake Keowee borrowers arrive with fintech expectations',
        body: 'South Carolina leads the nation in 65+ net migration, and relocating retirees closed their last mortgage with a digital-first lender. Matching that experience locally is how a deposit-dominant franchise keeps the loan too.',
      },
      {
        title: 'Margin recovery is finite; capacity is not',
        body: 'The NIM climb from 2.19% to 2.94% came from repricing, and that lever runs out as the back book catches up. The next leg of growth has to come from volume, which makes per-file capacity the binding constraint.',
      },
    ],
    sources:
      'FDIC BankFind (Cert #30111); OCC CRA Performance Evaluation (3/4/2024); HMDA Modified LAR via FFIEC; company quarterly releases; MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
  {
    slug: 'arthur-state-bank',
    name: 'Arthur State Bank',
    shortName: 'Arthur State',
    articleSlug: 'arthur-state-bank-upstate-bet',
    articleTitle: 'The Bank That Depression Built',
    fdicCert: 15085,
    auditDate: 'May 2026',
    stats: [
      { label: 'Total assets', value: '$814M' },
      { label: 'Branches', value: '18 across SC' },
      { label: 'ROA', value: '1.17%' },
      { label: '2024 HMDA originations', value: '208' },
    ],
    volumes: {
      mortgage: { count: 208, source: '2024 HMDA Modified LAR', estimated: false },
      commercial: { count: 150, source: 'FDIC call report loan mix, 5 assessment areas', estimated: true },
      consumer: { count: 100, source: 'Estimated from 18-branch footprint', estimated: true },
    },
    intro:
      'Eighteen branches across five CRA assessment areas means five loan-officer pools, each verifying borrowers with whatever workflow accumulated locally. One verification stack changes the math on every file, in every market, at once.',
    strategic: [
      {
        title: 'Five assessment areas, one audit trail',
        body: 'Each branch today verifies with its own accumulated workflow. A single 5-minute borrower flow with an examiner-ready audit trail simplifies the next CRA exam across all five assessment areas at once.',
      },
      {
        title: 'Mortgage is half the loan book',
        body: 'With ~50% of the portfolio in 1-4 family residential and 208 conventional originations in 2024, mortgage is the engine, and it is the product fintechs have automated most aggressively.',
      },
      {
        title: 'ROA protected by capacity, not headcount',
        body: 'A 1.17% ROA, top half of SC community banks, does not survive adding underwriting headcount to chase growth. Recovered verification labor is origination capacity that does not show up on the expense line.',
      },
    ],
    sources:
      'FDIC BankFind (Cert #15085); Arthur State Bank CRA Public File (rev. March 2024); 2024 HMDA Modified LAR via FFIEC; MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
  {
    slug: 'anderson-brothers-bank',
    name: 'Anderson Brothers Bank',
    shortName: 'Anderson Brothers',
    articleSlug: 'anderson-brothers-bank-myrtle-beach-bet',
    articleTitle: 'The Myrtle Beach Bet',
    fdicCert: 9923,
    auditDate: 'May 2026',
    stats: [
      { label: 'Total assets', value: '$1.78B' },
      { label: 'ROA / ROE', value: '1.46% / 17.7%' },
      { label: 'Branches', value: '25+ across coastal SC' },
      { label: 'Mortgage originations', value: '~250/yr' },
    ],
    volumes: {
      mortgage: { count: 250, source: 'HMDA / CRA Performance Evaluation (10/2024)', estimated: false },
      commercial: { count: 300, source: 'FDIC call report loan mix', estimated: true },
      consumer: { count: 350, source: 'High-volume personal loan channel, estimated', estimated: true },
    },
    intro:
      'Anderson Brothers runs one of the highest-velocity lending operations among SC community banks: a 1.46% ROA, a 25-branch coastal footprint, and a consumer loan channel that processes serious volume. Velocity is exactly where per-file verification time compounds fastest.',
    strategic: [
      {
        title: 'Volume is the multiplier',
        body: 'At roughly 900 verifications a year across mortgage, commercial, and a high-volume consumer channel, even the conservative scenario recovers thousands of staff hours annually.',
      },
      {
        title: 'The Grand Strand grows faster than headcount can',
        body: 'Horry County is one of the fastest-growing metros in the country. Growth at that pace either gets funded with new hires or with recovered capacity per file.',
      },
      {
        title: 'A 17.7% ROE has the most to protect',
        body: 'Best-in-class returns make expense discipline the whole game. Verification automation is one of the few levers that adds capacity while holding the efficiency ratio flat.',
      },
    ],
    sources:
      'FDIC BankFind (Cert #9923); Anderson Brothers Bank Q3 2024 call report; FDIC CRA Performance Evaluation (10/1/2024); MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
  {
    slug: 'southern-first-bank',
    name: 'Southern First Bank',
    shortName: 'Southern First',
    articleSlug: 'southern-first-bank-upstate-sc-bet',
    articleTitle: 'The Upstate SC Bet',
    fdicCert: 35179,
    auditDate: 'May 2026',
    stats: [
      { label: 'Total assets', value: '$4.4B' },
      { label: 'Total loans', value: '$3.9B' },
      { label: '2024 HMDA originations', value: '1,119' },
      { label: 'Branches', value: '12 across SC, NC, GA' },
    ],
    volumes: {
      mortgage: { count: 1119, source: '2024 HMDA data', estimated: false },
      commercial: { count: 350, source: 'FDIC call report: 45.7% CRE, 10% C&I', estimated: true },
      consumer: { count: 150, source: 'HELOC / consumer estimate', estimated: true },
    },
    intro:
      'Southern First originates more than 1,100 mortgages a year on top of a deep CRE and C&I book, with a growth plan that just expanded into Cary, NC. At this volume, verification is a capacity question: the labor in the expected scenario is roughly 3.5 full-time employees, recovered without hiring.',
    strategic: [
      {
        title: 'Growth capacity without the hires',
        body: 'Q1 2026 net income grew 88% YoY behind an expansion plan funded by a $65M equity raise. The verification layer decides whether closings keep pace with the growth plan, and the expected scenario equals about 3.5 FTEs of capacity.',
      },
      {
        title: 'Commercial verification is the slow lane',
        body: 'With 45.7% CRE and 10% C&I exposure, files carry beneficial ownership, guarantor identity, and business financials, the slowest verification work in the bank and the highest hours-per-file category in this model.',
      },
      {
        title: 'Compliance posture that scales',
        body: 'KYC, OFAC/PEP, and fraud screening on every file with a timestamped audit trail is examiner-visible risk reduction that grows with the bank rather than with the compliance headcount.',
      },
    ],
    sources:
      'FDIC call reports (12/31/2025); 2024 HMDA data; Southern First Bancshares 10-K (FY2025) and Q1 2026 earnings release; MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
];

export function getRoiBank(slug: string): BankRoiInput | undefined {
  return ROI_BANKS.find((b) => b.slug === slug);
}
