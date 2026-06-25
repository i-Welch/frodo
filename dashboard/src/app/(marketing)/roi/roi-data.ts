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

/**
 * White-label digital intake (new-resident lead generation). [footnote 6]
 * Share of new-to-market households captured as leads by a fintech-grade
 * digital pre-qualification flow, anchored to TD Bank research showing ~30%
 * of movers open an account with a new bank, and purchased-lead conversion
 * floors of 1-2%.
 */
const LEAD_CAPTURE_RATE: Record<Scenario, number> = {
  conservative: 0.015,
  expected: 0.04,
  optimistic: 0.09,
};
// Lead (started application in the bank's own flow) -> funded loan.
// Expected case: ~55% completion x ~55% depository pull-through.
const LEAD_TO_FUNDED: Record<Scenario, number> = {
  conservative: 0.12,
  expected: 0.3,
  optimistic: 0.5,
};
// Avoided acquisition cost per funded loan vs. purchased leads ($500-$3,000
// per funded loan via shared/exclusive lead channels).
const AVOIDED_ACQUISITION: Record<Scenario, number> = {
  conservative: 500,
  expected: 1000,
  optimistic: 1500,
};

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
  // New households moving into the bank's footprint each year. [footnote 6]
  market: { newHouseholdsPerYear: number; source: string };
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

export interface DigitalIntakeResult {
  leads: number;
  fundedLoans: number;
  value: number;
}

export interface RoiResult {
  conservative: RoiScenarioResult;
  expected: RoiScenarioResult;
  optimistic: RoiScenarioResult;
  digitalIntake: Record<Scenario, DigitalIntakeResult>;
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

  const digitalIntake = {} as Record<Scenario, DigitalIntakeResult>;
  for (const s of scenarios) {
    const leads = Math.round(input.market.newHouseholdsPerYear * LEAD_CAPTURE_RATE[s]);
    const fundedLoans = Math.round(leads * LEAD_TO_FUNDED[s]);
    // Value = profit on funded loans plus the acquisition spend the bank
    // avoids by owning the lead instead of buying it. [footnote 6]
    const value = fundedLoans * (PROFIT_PER_LOAN + AVOIDED_ACQUISITION[s]);
    digitalIntake[s] = { leads, fundedLoans, value };
  }

  return {
    ...result,
    digitalIntake,
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
  {
    id: 6,
    title: 'New-resident lead generation',
    body: 'TD Bank research reports roughly 30% of consumers open an account with a new bank after moving (and movers 55+ switch at a higher rate than millennials), while 91% of consumers say digital capability matters in choosing where to bank (MX, 2025) and more than half of online banking applications are abandoned mid-flow (The Financial Brand; Innovatrics). We model a bank with a white-label, fintech-grade intake flow capturing 1.5-9% of new-to-market households as started applications, converting 12-50% of those to funded loans (expected case: ~55% completion times the MBA-reported ~55% depository pull-through). Value per funded loan combines the $785 MBA average profit with $500-1,500 of avoided lead-acquisition spend, the going rate per funded loan from purchased shared and exclusive lead channels. New-household counts are derived from Census county population estimates and are not bank-reported figures. This line is shown separately and is not included in the headline savings number.',
  },
];

export const ROI_BANKS: BankRoiInput[] = [
  {
    slug: 'southern-bank-trust',
    name: 'Southern Bank and Trust Company',
    shortName: 'Southern Bank',
    articleSlug: 'southern-bank-nc-digital-bet',
    articleTitle: 'The Century Bank That Hired a Chief Digital Officer',
    fdicCert: 15359,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$5.25B' },
      { label: 'ROA (Q4 2025)', value: '1.19%' },
      { label: 'Efficiency ratio', value: '53.23%' },
      { label: 'Branch count', value: '57' },
    ],
    volumes: {
      mortgage: { count: 500, source: 'Estimated from 57-branch eastern NC + southeastern VA footprint and residential real estate concentration in $3.44B loan book; HMDA data pending', estimated: true },
      commercial: { count: 300, source: 'FDIC call report: C&I $246M, CRE and construction segments across 57 locations; estimated from loan mix', estimated: true },
      consumer: { count: 200, source: 'Estimated from branch footprint and consumer segment of loan portfolio', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 10000,
      source: '57-branch eastern NC + southeastern VA footprint spanning Wayne, Dare, Duplin, Lenoir, Wilson, Nash, Johnston, Pitt, and Onslow counties plus southeastern Virginia; Census county in-migration estimates',
    },
    intro:
      "Southern Bank and Trust operates $5.25 billion across three distinct borrower economies: tobacco and agricultural country in the interior, military communities around Seymour Johnson AFB, and coastal vacation markets on the Outer Banks. A 57-branch footprint with that kind of income complexity creates above-average verification load per file. The Chief Digital Officer hire signals the bank is working the problem from the top down.",
    strategic: [
      {
        title: 'Three borrower economies, one verification standard',
        body: "Farm operators carry seasonal income that looks nothing like a W-2. Military personnel at Seymour Johnson have base pay plus housing allowance (BAH) plus subsistence pay plus special duty pay. Outer Banks vacation property buyers show Airbnb income that standard pay stub pulls miss. Three income types, three verification workflows, thirty-seven extra days per file that shouldn't exist. A single bank-level integration eliminates the per-borrower-type patchwork.",
      },
      {
        title: "The CDO hire is the telling signal",
        body: "Sondra McCorquodale joined as EVP and Chief Digital Officer after years at First Citizens Bank, one of the most aggressive acquirers and technology integrators in the community bank space. Banks hire CDOs when the digital upgrade agenda has reached the CEO level. The verification layer is typically the first problem a CDO can close in a 6-month window: it has a measurable before and after, it does not require replacing core systems, and the efficiency ratio effect is visible in the next quarter.",
      },
      {
        title: 'Military borrowers are the highest-complexity files in the portfolio',
        body: 'Active duty and veteran borrowers near Seymour Johnson AFB represent exactly the income profile that manual verification handles worst: non-standard pay components, frequent PCS moves that create employment gaps, and VA loan requirements layered on top. Automated military income verification through open banking connections closes files that manual VOE calls miss entirely, and does it in hours instead of days.',
      },
    ],
    sources:
      'FDIC BankFind (Cert #15359); Southern BancShares Q4 2025 and Q1 2026 FDIC call report data; Sahm Capital SBNC analysis (Feb 2026); Seymour Johnson AFB economic impact data; NC Office of State Budget and Management 2026 Economic Outlook; MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
  {
    slug: 'first-reliance-bank',
    name: 'First Reliance Bancshares',
    shortName: 'First Reliance',
    articleSlug: 'first-reliance-outgrew-florence',
    articleTitle: "The Bank That Didn't Wait for the Battery Plant",
    fdicCert: 76181,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$1.12B' },
      { label: 'ROA', value: '1.25%' },
      { label: 'NIM', value: '3.77%' },
      { label: 'Loan growth (Q1 annualized)', value: '10.9%' },
    ],
    volumes: {
      mortgage: { count: 250, source: 'Estimated from consumer real estate book (30% of $801M) and 9-branch statewide SC footprint; HMDA data pending', estimated: true },
      commercial: { count: 200, source: 'FDIC call report: CRE 59%, C&I 9% of $801M loan book across 8 SC markets', estimated: true },
      consumer: { count: 80, source: 'Consumer segment is 2% of loan book; estimated from footprint', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 3000,
      source: 'Multi-market SC footprint: Greenville, Charleston/Mount Pleasant, Myrtle Beach, Columbia, Florence; Census county in-migration estimates',
    },
    intro:
      "First Reliance built a 9-branch statewide footprint from a Florence base, with heavy CRE exposure in some of the fastest-growing SC markets. Loan growth running at 10.9% annualized means more files, more complex commercial borrower profiles, and more pressure on the verification layer that sits between application and close.",
    strategic: [
      {
        title: 'Nine branches, eight cities, one verification standard',
        body: "Each market carries different employer types: government in Columbia, healthcare and tech in Greenville, hospitality in Myrtle Beach, manufacturing in Florence. A single borrower verification stack replaces eight locally-accumulated workflows with one audit trail and one borrower experience, regardless of which branch originates the file.",
      },
      {
        title: 'CRE at 59% means the heaviest files dominate the pipeline',
        body: 'Commercial real estate verification carries the highest hours-per-file load in banking: beneficial ownership, guarantor identity, business financials, and entity structure. At 59% of an $801M book growing at 10.9% annualized, that is roughly $87M in new CRE originations per year running through the same manual collection process.',
      },
      {
        title: 'Deposit pressure makes efficiency the whole game',
        body: 'Deposits fell 8.1% annualized in Q1 while loans grew 10.9%. Every basis point of NIM compression from funding costs has to be offset somewhere. Recovering verification labor on the CRE and mortgage pipeline is capacity that does not show up on the expense line and does not require paying up for deposits.',
      },
    ],
    sources:
      'FDIC BankFind (Cert #76181); First Reliance Bancshares Q1 2026 earnings release; Visbanking call report data; Florence County Economic Development (AESC project status); Zillow Florence SC market data; MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
  {
    slug: 'colony-bankcorp',
    name: 'Colony Bankcorp',
    shortName: 'Colony',
    articleSlug: 'colony-bankcorp-farm-to-fees',
    articleTitle: 'Built on Peanuts, Betting on Fees',
    fdicCert: 22257,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$3.7B' },
      { label: 'Q1 2026 net income', value: '$8.2M' },
      { label: 'Wealth AUM', value: '$555M' },
      { label: 'Loan-to-deposit ratio', value: '79%' },
    ],
    volumes: {
      mortgage: { count: 350, source: 'Estimated from 37-branch footprint and Q1 2026 mortgage income growth; HMDA data pending', estimated: true },
      commercial: { count: 250, source: 'FDIC call report loan mix: agricultural, CRE, and C&I across Georgia, Alabama, and north Florida', estimated: true },
      consumer: { count: 400, source: 'Estimated from 37-branch retail footprint', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 2000,
      source: 'Georgia, Alabama, and north Florida 37-location footprint; Tallahassee and Thomasville in-migration from Census county estimates',
    },
    intro:
      "Colony Bankcorp is in an active growth phase: digesting a $571 million acquisition, tripling wealth AUM, and expanding into Tallahassee's government and university market. Growth at that pace means more files, more complex borrower profiles, and more pressure on the verification layer that sits between application and close.",
    strategic: [
      {
        title: "Mortgage volume growing 7x needs infrastructure to match",
        body: "Mortgage pretax income was up 7x year-over-year in Q1 2026, off a low base. The verification bottleneck that was invisible at low volume becomes the binding constraint fast as originations scale. Every manual VOE call and IRS transcript request that took a week when the team was small takes the same week when volume doubles.",
      },
      {
        title: 'Agricultural borrowers are the hardest files to verify',
        body: 'Farm operators carry complex income pictures: FSA payments, crop insurance proceeds, equipment loans across multiple entities, and seasonal cash flow that looks nothing like a W-2. Manual verification of these borrowers is slow and error-prone. Automated income aggregation handles the complexity faster and with a cleaner audit trail.',
      },
      {
        title: 'Post-acquisition workflow standardization is a closing window',
        body: 'TC Bancshares brought 37 locations across two new markets. The months after close are when workflow standardization either happens or gets deferred for years. A single verification stack across all branches eliminates the acquired-bank-has-a-different-process problem before it becomes the new normal.',
      },
    ],
    sources:
      'FDIC BankFind (Cert #22257); Colony Bankcorp Q1 2026 earnings release; UGA Center for Agribusiness and Economic Development 2026 Georgia Economic Outlook; USDA peanut and cotton market data; MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
  {
    slug: 'carolina-bank-trust',
    name: 'Carolina Bank & Trust Co.',
    shortName: 'Carolina Bank',
    articleSlug: 'carolina-bank-between-two-economies',
    articleTitle: 'The Bank Between Two Economies',
    fdicCert: 355120,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$830M' },
      { label: 'ROA', value: '1.68%' },
      { label: 'Efficiency ratio', value: '44.86%' },
      { label: 'Tier 1 capital ratio', value: '20.23%' },
    ],
    volumes: {
      mortgage: { count: 160, source: 'FDIC call report loan mix, estimated from $588M net loan book and 6-county footprint', estimated: true },
      commercial: { count: 80, source: 'FDIC call report loan mix, estimated', estimated: true },
      consumer: { count: 120, source: 'Estimated from 14-branch footprint and rural SC consumer mix', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 1200,
      source: 'Darlington, Florence, and 4 adjacent Pee Dee counties; anchored by AESC EV plant (1,620 jobs) and Census county in-migration estimates',
    },
    intro:
      'Carolina Bank & Trust sits at the intersection of two economic stories: Darlington County shedding old-economy manufacturing jobs and Florence County absorbing a $1.62 billion EV battery plant. A 20.23% Tier 1 capital ratio means the capital to chase that Florence growth is already on the balance sheet. The constraint is throughput.',
    strategic: [
      {
        title: 'The EV economy brings complex borrowers first',
        body: 'AESC construction workers, relocating contractors, and skilled tradespeople arriving for the Florence plant carry the verification profiles that slow manual processing most: recent job starts, multiple W-2s, high hourly wages without long employment history. Automated income and employment verification handles exactly these borrowers faster than document collection.',
      },
      {
        title: 'A fortress capital ratio is optionality, not a trophy',
        body: 'At 20.23% Tier 1, Carolina Bank can move fast when Florence loan demand accelerates without asking regulators for permission. The binding constraint on capturing that demand is not capital: it is how many files the team can process in a week.',
      },
      {
        title: 'The Darlington stress test is still running',
        body: "A Canfor-level shock creates more complex files in the pipeline alongside growth: modification requests, recast applications, refinance inquiries from households managing tighter cash flow. Faster, more complete verification at that moment protects the bank's $0 OREO record and the borrower at the same time.",
      },
    ],
    sources:
      'FDIC BankFind (Cert #355120); Visbanking call report data; Florence County Economic Development (AESC announcement); Canfor 2024 Annual Report; Zillow Florence SC market data; MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
  {
    slug: 'coastal-states-bank',
    name: 'Coastal States Bank',
    shortName: 'Coastal States',
    articleSlug: 'coastal-states-bank-boat-bank',
    articleTitle: 'The Boat Bank of Beaufort County',
    fdicCert: 57756,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$2.35B' },
      { label: 'Beaufort County deposit share', value: '#1 (17.9%)' },
      { label: 'Loan book in marine vessels', value: '18.9%' },
      { label: '2024 HMDA originations', value: '42' },
    ],
    volumes: {
      mortgage: { count: 42, source: '2024 HMDA data (CFPB browser, LEI 549300EPUJMYHHCZPS30)', estimated: false },
      commercial: { count: 400, source: 'CRE/C&I/SBA/senior housing mix from call report, estimated', estimated: true },
      consumer: { count: 500, source: 'Marine lending channel (~19% of loans), estimated', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 2500,
      source: 'Beaufort County in-migration plus Jasper County (fastest-growing US county, 2025), Census estimates',
    },
    intro:
      'Coastal States runs two businesses: the #1 deposit franchise in Beaufort County, and a national specialty lender in marine, senior housing, and SBA. The specialty side lives on verification: vessel ownership, business financials, guarantor identity. The local side sits in one of the fastest-growing retiree markets in America. Both sides have a verification number attached.',
    strategic: [
      {
        title: 'Specialty files are the slowest files',
        body: 'Marine, senior housing, and SBA lending carry the heaviest verification loads in banking: collateral ownership, business financials, beneficial ownership, guarantors. These are the highest hours-per-file categories in this model.',
      },
      {
        title: 'The migration wave is unbanked on arrival',
        body: 'Roughly 2,500 households move into the Beaufort-Jasper footprint each year, and about 30% of movers pick a new bank. With 42 HMDA originations in 2024, nearly all of that lending relationship flow currently lands elsewhere.',
      },
      {
        title: 'Growth mode raises the cost of slow',
        body: 'A new Charleston team, a fresh NYSE listing, and an efficiency ratio eight points off its best mean every recovered verification hour lands directly on the metric public investors watch.',
      },
    ],
    sources:
      'FDIC BankFind and call reports (Cert #57756); FDIC Summary of Deposits (June 2025); CoastalSouth Bancshares Q1 2026 earnings release and SEC filings; 2024 HMDA data via CFPB; Zillow; Census county estimates; MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
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
    market: {
      newHouseholdsPerYear: 550,
      source: 'Oconee County population +1.44%/yr (~1,200 people), Census estimates',
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
    market: {
      newHouseholdsPerYear: 1500,
      source: 'Upstate SC in-migration across 5 assessment areas, Census county estimates',
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
    market: {
      newHouseholdsPerYear: 4000,
      source: 'Horry County among fastest-growing US metros (~3%/yr on ~390K), Census estimates',
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
    market: {
      newHouseholdsPerYear: 5000,
      source: 'Greenville, Columbia, Charleston, and Triangle-adjacent metro in-migration, Census estimates (conservative footprint slice)',
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
