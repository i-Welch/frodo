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
  articleSlug?: string;
  articleTitle?: string;
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

  // Compute digital intake first so it can be included in totalValue. [footnote 6]
  const digitalIntake = {} as Record<Scenario, DigitalIntakeResult>;
  for (const s of scenarios) {
    const leads = Math.round(input.market.newHouseholdsPerYear * LEAD_CAPTURE_RATE[s]);
    const fundedLoans = Math.round(leads * LEAD_TO_FUNDED[s]);
    const value = fundedLoans * (PROFIT_PER_LOAN + AVOIDED_ACQUISITION[s]);
    digitalIntake[s] = { leads, fundedLoans, value };
  }

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
      totalValue: laborValue + pullThroughRevenue + digitalIntake[s].value,
      hoursRecovered,
    };
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
    body: 'TD Bank research reports roughly 30% of consumers open an account with a new bank after moving (and movers 55+ switch at a higher rate than millennials), while 91% of consumers say digital capability matters in choosing where to bank (MX, 2025) and more than half of online banking applications are abandoned mid-flow (The Financial Brand; Innovatrics). We model a bank with a white-label, fintech-grade intake flow capturing 1.5-9% of new-to-market households as started applications, converting 12-50% of those to funded loans (expected case: ~55% completion times the MBA-reported ~55% depository pull-through). Value per funded loan combines the $785 MBA average profit with $500-1,500 of avoided lead-acquisition spend, the going rate per funded loan from purchased shared and exclusive lead channels. New-household counts are derived from Census county population estimates and are not bank-reported figures. This line is included in the headline total.',
  },
];

export const ROI_BANKS: BankRoiInput[] = [
  {
    slug: 'optimumbank',
    name: 'OptimumBank',
    shortName: 'OptimumBank',
    articleSlug: 'optimumbank-98-percent-cre-growth',
    articleTitle: 'The 98.7% Bank',
    fdicCert: 35430,
    auditDate: 'July 2026',
    stats: [
      { label: 'Total assets', value: '$1.40B' },
      { label: 'ROA', value: '2.04% (Q2 2026, annualized)' },
      { label: 'NIM', value: '4.57%' },
      { label: 'Branch count', value: '4' },
    ],
    volumes: {
      mortgage: {
        count: 20,
        source:
          'OptimumBank was a HMDA reporter in 2023 only, originating 9 loans for $23.9M (CRA Public File, Feb 2026); bank records show 29 loans/$37.7M in 2021 and 39 loans/$87.5M in 2022. Residential real estate book was $78.3M at 6/30/26, up $11.7M YoY. Estimate of ~20 residential files per year reflects the 2021-2023 range and the current book growth.',
        estimated: true,
      },
      commercial: {
        count: 210,
        source:
          'Q2 2026 earnings release (8-K, 7/24/26): CRE $905.2M (+$427.0M YoY), multifamily $52.6M, land and construction $46.3M, commercial $51.4M. Net CRE growth of $427.0M plus assumed payoffs implies roughly $500-550M originated over twelve months; at a $3M average South Florida CRE note that is ~170 credits, plus SBA files (noninterest income includes gains on sale of government guaranteed SBA loans) and C&I renewals.',
        estimated: true,
      },
      consumer: {
        count: 180,
        source:
          'Q2 2026 earnings release: consumer loan segment $83.4M at 6/30/26, up $23.5M (39.2%) YoY. Estimate assumes an average consumer note in the low six figures, consistent with a commercially oriented book.',
        estimated: true,
      },
    },
    market: {
      newHouseholdsPerYear: 3500,
      source:
        'Broward County has roughly 1.99 million residents and approximately 740,000 households. Population growth has slowed sharply on affordability and domestic out-migration, so this uses a conservative ~0.5% annual household formation rate. OptimumBank operates 3 of Broward\'s 369 branches plus one Miami-Dade office, so only a fraction of county household formation is addressable.',
    },
    intro:
      "OptimumBank is the largest bank still headquartered in Broward County, holding $865.3 million of local deposits across three branches as of the FDIC's June 2025 survey. That is more than half of all deposits held by the five remaining Broward-headquartered institutions combined, in a $69.69 billion market dominated by Bank of America, Chase, and Wells Fargo. The bank grew total assets 40.2% in the twelve months ending June 30, 2026, to $1.40 billion, and 98.7% of its $432.5 million in loan growth was commercial real estate. The borrower base is South Florida commercial: investors and operators in CRE, HOA and property management relationships, SBA-eligible small businesses, and, through the new OptimumFunding subsidiary, skilled nursing, senior housing, and multifamily sponsors seeking bridge-to-HUD financing. This is a commercial verification problem, not a retail mortgage one.",
    strategic: [
      {
        title: 'A CRE Book That Nearly Doubled in a Year Has to Prove Its File Quality',
        body: "Commercial real estate went from $478.2 million to $905.2 million in four quarters, and now represents 74.4% of gross loans. Against Tier 1 capital plus reserves of roughly $158.7 million, that is about 570% of capital, well past the 300% level at which interagency guidance directs examiners to take a closer look, and the 50%-over-36-months growth criterion was met in a single year. Nothing about that is disqualifying on its own. What it does guarantee is that the next safety-and-soundness exam will test whether underwriting discipline held while the book doubled: global cash flow on sponsors, verified rent rolls, entity documentation, and consistent income and asset support on guarantors. Files assembled by email and PDF do not produce that evidence on demand. RAVEN captures borrower and guarantor income, assets, and entity data from source at intake, with a timestamped audit trail per file, which is precisely the artifact an examiner asks for when the concentration ratio is the first thing on the scoping memo.",
      },
      {
        title: "The Website Says 'Traditional In-Person Banking.' The Balance Sheet Says Otherwise.",
        body: "The title tag on optimumbank.com reads \"Traditional in-person banking for businesses and consumers residing in South Florida.\" The SBA page, advertising loans up to $5 million, ends at \"Schedule an Appointment Now.\" There is no online loan application for any product, no digital deposit account opening, and the online banking links serve existing customers only. That was a coherent posture for a $154.5 million bank. It is a strange one for a $1.4 billion bank adding $126 million of loans per quarter with four offices. Every dollar of that growth currently arrives through a lender's relationships and a calendar invitation. A branded digital intake layer does not replace the relationship model that built this bank; it stops the bank from losing the deals that arrive at 9pm from a sponsor who found them through a broker and wants to move this week.",
      },
      {
        title: 'Growth Is Outrunning the Cost Base, and Verification Is Where That Shows Up First',
        body: "OptimumBank runs a 48.78% efficiency ratio, which is genuinely excellent. Look at what it took to hold there. Salaries and employee benefits rose 41.2% year over year, from $3.74 million to $5.28 million per quarter. Data processing rose 57.8%, from $625,000 to $986,000. Both grew faster than the 40.2% asset growth. That is the signature of an operation buying headcount and systems to keep pace with volume rather than getting leverage from it. Commercial verification is the highest-labor step in the files driving this growth: two years of business returns, K-1s, rent rolls, operating statements, and guarantor financials, chased by email across multiple entities per deal. Automating source-verified collection on 200-plus commercial files a year is where a bank at this growth rate converts headcount spend into throughput, and it is the difference between a 48% efficiency ratio that holds and one that drifts as the book gets larger.",
      },
    ],
    sources:
      'OptimumBank Holdings 8-K and Exhibit 99.1 filed 7/24/26 (Q2 2026 results, SEC CIK 1288855); OptimumBank Holdings 10-Q for Q1 2026 and 10-K for FY2025; FDIC BankFind cert #35430; FDIC Summary of Deposits, June 30 2025 (Broward County market share); OptimumBank CRA Public File, February 2026 (HMDA and small business lending history, assessment area competition); optimumbank.com homepage, SBA and Small Business Services page, and Remote Banking page (reviewed July 2026); Colliers Broward County Office Market Report Q2 2026; Newmark Broward Florida Office Market Report Q1 2026; Interagency Guidance on Concentrations in Commercial Real Estate Lending; FDIC FIL-64-2023.',
  },
  {
    slug: 'south-atlantic-bank',
    name: 'South Atlantic Bank',
    shortName: 'South Atlantic',
    articleSlug: 'south-atlantic-bank-coastal-growth-engine',
    articleTitle: 'South Atlantic Bank: The $2B Coastal Lender Built on In-Migration',
    fdicCert: 58689,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$1.93B' },
      { label: 'ROA', value: '1.05%' },
      { label: 'NIM', value: '3.06%' },
      { label: 'Branch count', value: '12' },
    ],
    volumes: {
      mortgage: { count: 415, source: 'HMDA 2024 originations per CRA public file / search data: 415 loans totaling $196.4M', estimated: false },
      commercial: { count: 900, source: 'FDIC call report LNRERES $543M, LNRENRES $559M, LNRECONS $241M, LNCI $80M, LNCON $5M as of Q1 2026 (CERT 58689)', estimated: true },
      consumer: { count: 200, source: 'FDIC call report LNRERES $543M, LNRENRES $559M, LNRECONS $241M, LNCI $80M, LNCON $5M as of Q1 2026 (CERT 58689)', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 7500,
      source: 'Horry County ~155,909 households growing 3.8% annually (all in-migration) = ~5,924 net new; Georgetown County and Beaufort County footprint adds ~1,500-2,000 additional. Combined estimate ~7,500/year across assessment area (ACS 2019-2023, Census population estimates).',
    },
    intro: "South Atlantic Bank's footprint spans the fastest-growing coastal corridor in the Southeast: Horry County (Myrtle Beach, Conway, North Myrtle Beach) plus assessment areas in Georgetown County and the Beaufort/Jasper MSA (Hilton Head/Bluffton). Horry County's 3.8% annual population growth is driven almost entirely by in-migration, with projections of 216,000 additional residents by 2042. The bank serves a borrower base that skews toward retirees relocating from northern states, tourism-driven commercial borrowers, second-home buyers, and resort-area construction developers. The combination of high in-migration rates, active vacation home and CRE construction, and a relatively affluent transplant demographic creates strong ongoing demand for mortgage, HELOC, and commercial real estate financing.",
    strategic: [
      {
        title: 'A $1.4B RE Book Growing at 13% Needs Verification That Keeps Pace',
        body: 'South Atlantic Bank grew its loan book 13.1% in 2024 and another 9.5% in 2025, with real estate loans now approaching $1.4B across residential, construction, and commercial categories. That growth is being processed by 159 employees across 12 branches, a ratio that leaves little slack for manual document chasing. Secondary mortgage income surged 80% in 2024 driven by increased origination commissions, meaning the bank is writing more loans faster without any visible investment in automated verification to handle the throughput. RAVEN replaces the income-stub shuffle and borrower follow-up that eat underwriter hours at precisely the loan volume where friction compounds: when every basis point of efficiency ratio matters and you are trying to close more files without adding headcount. At South Atlantic\'s current growth trajectory, the cost of not automating borrower verification is measured in delayed closings, missed rate locks, and loan officers spending afternoons on file cleanup instead of production.',
      },
      {
        title: "Horry County's In-Migration Wave Is a New-Borrower Acquisition Machine",
        body: "Horry County adds roughly 15,000 new residents per year and all of it is in-migration, retirees from Ohio and Pennsylvania, remote workers from the Northeast, and second-home buyers choosing the Grand Strand over Florida. These borrowers do not have existing banking relationships in South Carolina and are actively shopping for mortgages, HELOCs, and auto loans. South Atlantic Bank is competing for these borrowers against national lenders who offer fully digital applications with instant income verification. RAVEN lets a community bank match the digital experience of Rocket Mortgage or Better.com at application intake, verifying identity, income, employment, and assets in minutes rather than days, which is exactly the differentiation a $1.9B bank needs to win a transaction borrower who has no loyalty anchor. The bank's 3.8% annual county growth rate means roughly 7,500 net new households per year enter the footprint as potential first-time customers, and the bank that closes fastest captures the relationship.",
      },
      {
        title: 'Construction and CRE Concentration Demands Faster Commercial Borrower Underwriting',
        body: "South Atlantic Bank carries $241M in construction and land development loans and $559M in nonfarm nonresidential CRE, together representing over 53% of its total loan book. These borrowers are developers, resort operators, and commercial real estate investors who expect transactional speed and view document-collection delays as a relationship risk. Commercial loan officers who manually request two years of business tax returns, bank statements, and entity documents from a developer building a 40-unit condominium complex on Ocean Boulevard are leaving the door open for a more responsive competitor. RAVEN's commercial income and asset verification closes that gap by letting the bank issue a faster term sheet backed by verified financials, not a pending checklist. For a bank growing C&I and CRE in a hot coastal construction market, verification speed is a competitive differentiator that shows up directly in relationship retention and pipeline close rates.",
      },
    ],
    sources: 'FDIC API institutions endpoint CERT 58689, FDIC API financials endpoint CERT 58689, southatlantic.bank/digital-banking/online-banking, southatlantic.bank/news, southatlantic.bank/about-us/investor-relations, prnewswire.com SABK FY2024 earnings release, stocktitan.net/news/SABK (Q1 2026 earnings), census.gov QuickFacts Horry County SC, neilsberg.com Horry County population by year, southatlantic.bank CRA Public File April 2025 (PDF), worldpopulationreview.com Horry County, southcarolina-demographics.com Horry County demographics, wbtw.com Horry County population projections, talents.vaia.com Digital Banking Specialist I job posting, ziprecruiter.com South Atlantic Bank jobs, leadiq.com South Atlantic Bank tech stack',
  },
  {
    slug: 'conway-national-bank',
    name: 'The Conway National Bank',
    shortName: 'Conway National',
    articleSlug: 'conway-national-bank-grand-strand-dominance',
    articleTitle: "Conway National Bank's Quiet Dominance on the Grand Strand",
    fdicCert: 2102,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$1.94B' },
      { label: 'ROA', value: '1.23% (FY2025); 1.40% annualized (Q1 2026)' },
      { label: 'NIM', value: '~3.10% annualized (Q1 2026 NIM: $15.2M quarterly on $1.94B assets)' },
      { label: 'Branch count', value: '16' },
    ],
    volumes: {
      mortgage: { count: 309, source: 'HMDA 2024 originations via OriginationData.com (LEI: 2549008EFPQHWHJ5MO60): 309 total originations, $77.5M volume. Breakdown: 159 purchase, 108 refi, 28 home improvement, 14 other. All conventional loans.', estimated: false },
      commercial: { count: 195, source: 'HMDA 2024 data via OriginationData.com: $77.5M mortgage origination volume. Residential RE book: $255.6M (FDIC call report Q1 2026). C&I book: $97.4M. Consumer loan book: $59.3M.', estimated: true },
      consumer: { count: 2372, source: 'HMDA 2024 data via OriginationData.com: $77.5M mortgage origination volume. Residential RE book: $255.6M (FDIC call report Q1 2026). C&I book: $97.4M. Consumer loan book: $59.3M.', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 1100,
      source: 'Horry County: 7,331 residential building permits issued in 2024 (Census/FRED BPPRIV045051). CNB holds 12.48% deposit market share in Horry County (4 consecutive years as #1). Applying ~12.5% share to 7,331 permits yields ~916 net-new owner-occupied households in footprint. Adding Georgetown County footprint (41 HMDA originations there in 2024) adds approximately 150-200 more. Total estimated ~1,100 new households per year in CNB\'s primary service area.',
    },
    intro: "CNB's primary market is Horry County, the fastest-growing county in South Carolina, anchored by Myrtle Beach and Conway. The county added 7,331 new housing units in 2024 alone and is projected to grow by 216,000+ residents by 2042. In-migration is driven by retirees from the Northeast (NY, NJ, PA, DC metro), remote workers, and families seeking coastal affordability. The Georgetown County footprint adds the Waccamaw Neck corridor (Pawleys Island, Murrells Inlet) - an affluent second-home and retirement market. The borrower base skews toward conventional purchase loans (159 of 309 HMDA originations in 2024), with meaningful refi and home-improvement volume from existing residents and retirees.",
    strategic: [
      {
        title: 'The In-Migration Borrower Problem: Verifying People Who Just Arrived',
        body: "Horry County added over 7,300 new housing units in 2024, with the majority of CNB's purchase-mortgage borrowers originating from the Northeast and Mid-Atlantic. These in-migrants often have complex income profiles: recent job changes, remote-work arrangements, multi-state pay stubs, or newly retired status with investment income replacing W-2 wages. Manual document collection for these borrowers is slow and error-prone, and branch-centric processes that work fine for long-tenured local residents create friction for buyers who may never set foot in a Conway branch. RAVEN's automated income, employment, and asset verification resolves the file within hours regardless of where the borrower is calling from, giving CNB a competitive edge in the market it dominates.",
      },
      {
        title: 'Efficiency Ratio Discipline Meets Loan Volume Growth',
        body: 'CNB runs one of the most efficient community banks in South Carolina, with a sub-48% efficiency ratio in Q1 2026 - a metric that requires relentless cost discipline as the loan book grows. The bank originated 309 mortgages in 2024 and holds an $845M net loan portfolio against only 16 branches and a lean noninterest expense base of $34.6M. Scaling further without proportionally adding underwriting staff is the central operational challenge. RAVEN replaces the hours a loan processor spends chasing pay stubs, bank statements, and employer phone verifications with a single API-triggered workflow, compressing per-loan labor cost precisely where the efficiency-ratio math is most sensitive.',
      },
      {
        title: 'Winning the Waccamaw Neck: Digital Reach Into an Affluent Second-Home Market',
        body: "CNB's Georgetown County footprint covers Pawleys Island, Murrells Inlet, and the Waccamaw Neck corridor - a high-income coastal strip where the typical buyer may be a second-home purchaser or retiree from another state with complex asset structures (brokerage accounts, trust income, rental property cash flow). These borrowers expect the closing speed they associate with larger digital lenders, not a week of back-and-forth document requests. CNB generated 41 HMDA originations in Georgetown County in 2024 at an average loan size of $352K, well above the Horry County average, suggesting significant upside if turnaround times improve. RAVEN's asset and identity verification layers make it possible for CNB to compete for this higher-balance segment without adding specialized staff.",
      },
    ],
    sources: 'FDIC API (institutions endpoint CERT:2102, financials endpoint), OriginationData.com HMDA 2024 (LEI: 2549008EFPQHWHJ5MO60), conwaynationalbank.com, Census Reporter Horry County SC profile, FRED BPPRIV045051 (Horry County building permits), Carolina Crafted Homes 2025 Myrtle Beach in-migration data, SEC EDGAR CNB Corp. filings, WBTW Horry County population projections',
  },
  {
    slug: 'bank-of-travelers-rest',
    name: 'Bank of Travelers Rest',
    shortName: 'Travelers Rest',
    articleSlug: 'bank-travelers-rest-greenville-growth-engine',
    articleTitle: "Bank of Travelers Rest: Greenville's $1.6B Growth Engine",
    fdicCert: 16389,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$1.60B' },
      { label: 'ROA', value: '1.44% (FY2025)' },
      { label: 'NIM', value: '2.97% (FY2025 annualized)' },
      { label: 'Branch count', value: '10' },
    ],
    volumes: {
      mortgage: { count: 170, source: 'HMDA 2024 origination data via originationdata.com (LEI 2549000A72B92T5BS479): 170 conventional loan originations totaling $59.09M, avg loan size $347K, 107 purchase / 33 refi / 18 home improvement / 12 other', estimated: false },
      commercial: { count: 75, source: 'FDIC call report Q1 2026: LNRE $766M (residential RE), LNCI $76M (C&I), LNCON $40M (consumer). Commercial count: $76M C&I book at $1M avg loan = ~76 active credits, estimated 75 annual originations at ~100% turnover on shorter-term lines. Consumer: $40M book at $25K avg = ~1,600 outstanding, ~35% annual turnover = ~560 new originations/year.', estimated: true },
      consumer: { count: 560, source: 'FDIC call report Q1 2026: LNRE $766M (residential RE), LNCI $76M (C&I), LNCON $40M (consumer). Commercial count: $76M C&I book at $1M avg loan = ~76 active credits, estimated 75 annual originations at ~100% turnover on shorter-term lines. Consumer: $40M book at $25K avg = ~1,600 outstanding, ~35% annual turnover = ~560 new originations/year.', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 460,
      source: 'Greenville County net population growth of ~11,000 in 2023-2024 (USAFacts/Census), divided by avg household size of 2.4 = ~4,580 net new households countywide. BTR operates 10 branches exclusively in Greenville County and is the 8th largest bank in SC, estimated 8-10% addressable share of new household formation = ~370-460 new households/year entering BTR\'s market.',
    },
    intro: "Greenville County, SC is the most populous county in South Carolina (548,000+ residents) and one of the fastest-growing metros in the Southeast. Upstate SC added ~11,000 net new residents in 2023-2024, driven heavily by domestic in-migration from other states. The Greenville-Anderson MSA is a manufacturing and technology hub attracting transplants from higher cost-of-living states. BTR's borrower base skews toward conventional purchase buyers (107 of 170 2024 mortgage originations were purchases) in a market where median home prices have risen steadily, pushing average loan sizes to $347K. The bank's geographic concentration in Greenville County means it captures both the established community banking relationships of the Upstate and a growing wave of in-migrant borrowers unfamiliar with local institutions.",
    strategic: [
      {
        title: "Serving Greenville's In-Migration Wave Without a Digital Intake Problem",
        body: "Greenville County added over 11,000 net new residents in 2023-2024, many of them out-of-state transplants with pay stubs from employers in other states, gig income, or self-employment arrangements that don't fit neatly into manual document checklists. Bank of Travelers Rest's purchase mortgage volume (107 of 170 originations in 2024) puts it squarely in the path of this in-migration demand, but its current intake process relies on a basic third-party mortgage portal with no income or asset verification automation. RAVEN's real-time payroll, bank account, and employment verification closes this gap without requiring a new LOS, letting BTR process more purchase loans faster in a competitive market where home-buying timelines are compressing. For a bank whose primary growth lever is geography, frictionless onboarding of new-to-market borrowers is a meaningful competitive moat.",
      },
      {
        title: '$766M Residential RE Book Concentrated in Conventional Product Needs Clean Files',
        body: "With 95% of its loan book in residential real estate and C&I lending, and zero FHA/VA/USDA volume in 2024, Bank of Travelers Rest is underwriting conventional borrowers where the margin for error on income and asset documentation is thin. Every stale pay stub or mismatched bank statement that makes it into underwriting costs hours of loan officer time and risks fallout at the closing table. RAVEN's automated verification of income (payroll + bank data), assets (real-time account balances), and employment status replaces the manual chase for documents with a single borrower consent flow, reducing underwriting cycle time by days on a file that already takes weeks through the current mymortgage-online portal. For a 10-branch bank with limited back-office headcount, that time savings compounds across 170 mortgage files per year and hundreds of HELOC and consumer loan applications.",
      },
      {
        title: 'Community Bank Efficiency at 60% Leaves No Room for Manual Document Processing',
        body: "Bank of Travelers Rest runs a 59.9% efficiency ratio, meaningfully above the top-quartile community bank benchmark of 55%, on a $1.6B balance sheet where every basis point of cost matters. Manual document collection for mortgage and consumer loan files is a hidden labor tax: loan officers spend hours chasing applicants for bank statements, pay stubs, and employer contacts that could be verified in minutes through open banking APIs. RAVEN replaces that labor with automated verification reports that are faster, more accurate, and audit-ready, directly reducing the per-loan cost that flows into noninterest expense. As BTR continues growing its loan book (LNRE up 4.3% year-over-year through Q1 2026), keeping headcount flat while volume grows requires the kind of workflow automation that community banks have traditionally left to the largest players, and RAVEN is built specifically for institutions of this size.",
      },
    ],
    sources: 'FDIC API (api.fdic.gov/banks/institutions?filters=CERT:16389, api.fdic.gov/banks/financials?filters=CERT:16389), originationdata.com HMDA 2024 (LEI 2549000A72B92T5BS479), bankoftravelersrest.com, omnicommander.com press release (May 28 2025), censusreporter.org Greenville County SC profile, usafacts.org Greenville County population, dew.sc.gov 2024 population estimates blog',
  },
  {
    slug: 'security-federal-bank',
    name: 'Security Federal Bank',
    shortName: 'Security Federal',
    articleSlug: 'security-federal-bank-cdfi-rate-rebound-aiken',
    articleTitle: 'Security Federal Bank: CDFI Giant Navigating the Rate Rebound',
    fdicCert: 31100,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$1.56B' },
      { label: 'ROA', value: '0.79%' },
      { label: 'NIM', value: '3.03%' },
      { label: 'Branch count', value: '19' },
    ],
    volumes: {
      mortgage: { count: 450, source: 'Estimated from Aiken MLS 2024 sales volume (3,321 transactions) and estimated 13-15% bank market share across 19-branch footprint spanning Aiken/Augusta/Columbia markets. Residential RE book of $222M at ~$185K avg balance implies ~1,200 loans in portfolio; annual origination flow estimated at 450. HMDA filer data not directly accessible.', estimated: true },
      commercial: { count: 520, source: 'FDIC call report Q1 2026 (CERT 31100): LNRERES $222.2M, LNLSNET $667.5M, LNCI $35.5M, LNCON $22.7M. Aiken MLS 2024 sales data: 3,321 homes sold at median $289,900.', estimated: true },
      consumer: { count: 900, source: 'FDIC call report Q1 2026 (CERT 31100): LNRERES $222.2M, LNLSNET $667.5M, LNCI $35.5M, LNCON $22.7M. Aiken MLS 2024 sales data: 3,321 homes sold at median $289,900.', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 1200,
      source: 'Aiken County net population growth of ~2,200 residents/year (2023-2024 Census estimates) at 2.5 persons per household = ~880 new households in Aiken County. Adding partial coverage of Richmond County GA (Augusta metro) and Lexington/Richland Counties SC (Columbia metro) where bank has branches, total footprint estimated at 1,200 new households/year.',
    },
    intro: 'Security Federal serves a three-city corridor: Aiken SC (retirement/quality-of-life destination with 1.67% annual population growth), Augusta GA (anchored by Savannah River Site nuclear complex employing 10,000+, Fort Gordon/Cyber Command, and Augusta University Medical Center), and greater Columbia SC suburbs. The Aiken-Augusta market is a steady in-migration destination attracting retirees, federal workers, and defense contractors. Aiken County grew by 7,962 residents (4.71%) between 2020-2023, outpacing the national average. Home sales totaled 3,321 in 2024 with median price $289,900. The borrower base skews toward first-time buyers, LMI households, and federal/government employees - all groups who benefit from CDFI-flexible underwriting but who also take longer to document through manual processes.',
    strategic: [
      {
        title: 'CDFI Mission Means Complex Borrowers - and Mountains of Paper',
        body: "As South Carolina's largest CDFI-certified bank, Security Federal is explicitly chartered to serve LMI borrowers, first-time homebuyers, and underbanked households across the Aiken-Augusta corridor. These borrowers often have non-standard income sources: gig work, seasonal employment, multiple part-time jobs, or self-employment income that requires more documentation than a W-2 employee. Manual document collection for these files can run two to three times longer than a conventional loan file, adding days or weeks to closing timelines. RAVEN's automated income and employment verification pulls directly from payroll providers and financial institutions, cutting verification time from weeks to minutes regardless of income complexity. For a mission-driven lender competing on personalized service, faster closings mean more borrowers served with the same loan officer headcount.",
      },
      {
        title: 'A Growing Market Demands Faster Throughput Without More Headcount',
        body: 'Aiken County added over 7,900 residents between 2020 and 2023, growing at nearly five times the national rate, driven by retirees from the Northeast and mid-Atlantic, federal workers at Savannah River Site, and remote workers drawn by home prices well below major metros. That growth translated to 3,321 home sales in 2024, up 9.5% year over year, putting steady pressure on Security Federal\'s mortgage team across all 19 branches. With an efficiency ratio still running above 71%, the bank cannot simply hire its way to faster throughput without further compressing returns. RAVEN\'s verification layer reduces the manual document-chasing work that consumes loan processor time, allowing the existing team to handle higher origination volume in the same number of hours. For a community bank with expansion plans through 2027, that capacity headroom matters.',
      },
      {
        title: 'ICE LOS Is In Place - The Verification Layer Is the Missing Piece',
        body: "Security Federal already operates on ICE Mortgage Technology for its mortgage origination workflow, meaning the core LOS infrastructure is modern and integration-ready. What the bank's mortgage portal does not show is any automated income, asset, or employment verification - no open banking connectivity, no direct payroll data pulls, no Day 1 Certainty or equivalent. That gap means loan officers and processors are still chasing pay stubs, bank statements, and employer phone calls manually after borrowers submit their applications online. RAVEN connects directly to the ICE ecosystem and financial data rails, inserting automated VOI, VOE, and VOA at the point of application without requiring a platform migration. For a bank that has already invested in modern origination technology, RAVEN is the logical next layer - not a rip-and-replace, but a targeted automation of the most time-consuming step in the file.",
      },
    ],
    sources: 'FDIC API institutions endpoint CERT 31100, FDIC API financials endpoint CERT 31100 Q1 2026 through Q2 2025, securityfederalbank.com homepage, securityfederalbank.com/about-us, securityfederalbank.com/careers, sfb-mortgage.securityfederalbank.com (ICE Mortgage Technology platform), Aiken MLS aikenmls.com 2024-2026 market stats, WRDW Aiken population boom article July 2024, Neilsberg Aiken County population by year, USAFacts Aiken County population data, Savannah River Site DOE employment data, SEC EDGAR Security Federal Corp 10-K FY2024 (sfdl20241231_10k.htm - 403 restricted), Security Federal Corp 10-K PDF securityfederalbank.com/assets/files/NCD4lBp9/10-K_2025.pdf, worldpopulationreview.com Aiken County 2026',
  },
  {
    slug: 'coastal-carolina-national-bank',
    name: 'Coastal Carolina National Bank',
    shortName: 'CCNB',
    articleSlug: 'ccnb-myrtle-beach-merger-growth-2026',
    articleTitle: "CCNB's $2.2B Merger Bet on SC's Fastest-Growing Coast",
    fdicCert: 58864,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$1.28B (Q1 2026)' },
      { label: 'ROA', value: '0.93% (FY2025); 1.03% trailing Q4 2025' },
      { label: 'NIM', value: '3.54% (FY2025)' },
      { label: 'Branch count', value: '10' },
    ],
    volumes: {
      mortgage: { count: 324, source: 'HMDA 2024 originations via originationdata.com (FFIEC LEI 54930004SDYVHYN4M716): 324 conventional originations, 292 home purchase + 17 cash-out refi + 14 rate/term refi + 1 home improvement', estimated: false },
      commercial: { count: 120, source: 'HMDA 2024 FFIEC data via originationdata.com: $110.9M total 2024 mortgage origination volume, avg loan $342K', estimated: true },
      consumer: { count: 490, source: 'HMDA 2024 FFIEC data via originationdata.com: $110.9M total 2024 mortgage origination volume, avg loan $342K', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 7100,
      source: 'Horry County 2024 population 413,391 (Census QuickFacts); 3.8% annual growth rate (34th nationally per Census 2024 estimates) = ~15,700 new residents/year; at 2.2 persons per household = ~7,100 net new households/year in CCNB\'s primary market',
    },
    intro: "CCNB operates in the Myrtle Beach-Conway-North Myrtle Beach MSA, the third fastest-growing metro in the US in 2024 at 3.8% annual growth. Horry County ranked 10th nationally for domestic in-migration (July 2022-2023). The borrower base skews toward higher-income retirees and remote workers relocating from the Northeast and Midwest: HMDA 2024 data shows the most common income band for CCNB borrowers was $250K+, with $150K-250K second. Average mortgage loan size was $342K, consistent with move-up and retirement-community buyers rather than first-time buyers. The bank has expanded inland into Columbia, Aiken, Greenville, and Spartanburg, diversifying beyond the coastal resort market into SC's population-growth corridors.",
    strategic: [
      {
        title: 'A Merger-Window Opportunity: Standardize Verification Before the Systems Conversion',
        body: "CCNB and Beacon Holding are scheduled to complete a systems conversion to a unified platform in early 2027. Any bank navigating a merger of equals faces a brief, high-stakes window to rationalize overlapping workflows before they get baked into the new stack. RAVEN can serve as the borrower verification layer that works independently of the core system, meaning it can be deployed on both legacy environments today and carried forward cleanly into the combined entity. Bringing RAVEN in now gives Gina Coltrane's team a consistent income, employment, and asset verification process that does not need to be re-implemented post-conversion. Banks that standardize verification before a core migration save significant re-training and re-integration cost on the back end.",
      },
      {
        title: "Serving the New-Resident Borrower: Speed Is the Competitive Moat in a 3.8%-Growth Market",
        body: "Horry County is adding roughly 7,000 net new households per year, making it one of the fastest household-formation markets in the country. Many of those buyers are relocating from out of state, which creates a specific verification friction: their income documentation may involve W-2s from a prior-state employer, self-employment income from a remote business, or retirement distributions that require more touchpoints to verify than a straightforward W-2 wage earner. CCNB's HMDA data shows its borrower base concentrates at $150K-250K+ income, exactly the profile where income sources are more complex and manual review is slower. RAVEN's automated income and employment verification removes the back-and-forth that kills purchase contracts in a competitive coastal market where buyers are choosing among multiple lenders. A faster clear-to-close is a durable competitive advantage when a bank is competing for 7,000 new households every year.",
      },
      {
        title: 'Portfolio Lending Needs Faster Underwriting: The "We Can Do That" Brand Promise Requires Operational Follow-Through',
        body: "CCNB has built its mortgage brand around flexible, custom solutions marketed under the \"We Can Do That\" tagline: condotel loans, bridge loans, lot loans, and portfolio ARM structures that larger banks will not touch. Non-standard loan types inherently involve more complex borrower profiles, because the borrower who needs a condotel loan or a construction-perm in a coastal market often has self-employment income, rental income streams, or asset-heavy rather than income-heavy financial profiles. Verifying those files manually is time-consuming and error-prone, and delays erode the goodwill that a flexibility-first brand is built on. RAVEN's asset and income verification automates exactly the document collection that makes non-QM and portfolio files expensive to process, letting loan officers spend their time on structuring rather than chasing pay stubs. For a bank that has differentiated itself on saying yes to harder deals, the operational bottleneck is the verification step, not the credit judgment.",
      },
    ],
    sources: 'FDIC BankFind API (CERT 58864), originationdata.com HMDA 2024 (LEI 54930004SDYVHYN4M716), myccnb.com, stocktitan.net CCNB 2024 and 2025 earnings releases, accessnewswire.com CCNB-Beacon merger announcement, citybiz.co merger details, charlestonbusinessmagazine.com merger announcement, Census Bureau QuickFacts Horry County SC 2024, SC DEW 2024 population estimates, WBTW/wpde.com Horry County migration data, macrotrends.net Myrtle Beach metro population',
  },
  {
    slug: 'first-capital-bank-charleston',
    name: 'First Capital Bank',
    shortName: 'First Capital',
    articleSlug: 'first-capital-bank-charleston-growth-digital-gap',
    articleTitle: 'First Capital Bank Hit $1B. Can It Keep Growing Without Going Digital?',
    fdicCert: 34966,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$1.24B' },
      { label: 'ROA', value: '1.12%' },
      { label: 'NIM', value: '3.49%' },
      { label: 'Branch count', value: '4' },
    ],
    volumes: {
      mortgage: { count: 300, source: 'Estimated from residential RE book ($338.4M) plus construction loans ($105M); assumed ~$300K average loan size and ~5-year portfolio duration implies roughly 300 originations per year. HMDA disclosure report exists at FFIEC (LEI 7DMUJTL9FFTVIAG9H788) but data tables require JS rendering not accessible via API.', estimated: true },
      commercial: { count: 729, source: 'FDIC Call Report via api.fdic.gov (CERT 34966), Q1 2026 (REPDTE 2026-03-31). Loan category detail fields: LNRENRES, LNRERES, LNRECONS, LNREMULT, LNCI, LNCON.', estimated: true },
      consumer: { count: 220, source: 'FDIC Call Report via api.fdic.gov (CERT 34966), Q1 2026 (REPDTE 2026-03-31). Loan category detail fields: LNRENRES, LNRERES, LNRECONS, LNREMULT, LNCI, LNCON.', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 7000,
      source: 'Charleston MSA (Berkeley, Charleston, Dorchester counties) added 70,000+ residents 2020-2024, averaging ~17,500/year. At 2.5 persons per household, approximately 7,000 new households per year across the tri-county market. Source: Charleston Regional Development Alliance / SC DEW 2024 population estimates.',
    },
    intro: "First Capital Bank operates four branches in the Charleston-North Charleston MSA, one of the fastest-growing metros in the Southeast. The tri-county area (Charleston, Berkeley, Dorchester) has grown nearly 9% since 2020, adding 70,000+ residents and is projected to reach 1 million residents by 2032. Berkeley County grew 3.2% in 2024 alone, ranking 61st nationally. The borrower base skews toward new-resident homebuyers, military-affiliated households (Joint Base Charleston), and a growing professional class attracted by tech and aerospace employers. The bank's loan book is dominated by CRE ($466M) and residential RE ($338M), reflecting Charleston's robust construction and real estate activity.",
    strategic: [
      {
        title: 'No Online Application Means Every Mortgage Starts with a Phone Call',
        body: "First Capital Bank has no online loan application on its public website. Every mortgage, HELOC, and commercial loan inquiry routes through an email address or a phone number, meaning the first verification touchpoint is a manual conversation with a loan officer. In a market where Charleston is adding roughly 17,500 new residents a year, many of whom are relocating professionals comparing multiple lenders simultaneously, a slow intake process directly costs deals. RAVEN's borrower portal lets applicants connect financial accounts, verify income, and authorize identity checks before the first loan officer call, compressing the file-gathering cycle from weeks to hours. For a four-branch bank competing against regionals and non-bank lenders with digital-native workflows, this is a structural disadvantage RAVEN resolves without requiring a new LOS.",
      },
      {
        title: 'CRE Concentration Demands Faster Commercial Underwriting',
        body: "Commercial real estate represents $466M of First Capital's $973M loan portfolio, making it by far the bank's largest exposure category. C&I adds another $80M, meaning commercial credits account for over 55% of the book. Commercial underwriting is document-intensive: business tax returns, rent rolls, entity verification, bank statements, and personal financial statements from guarantors all flow through email and courier in a traditional workflow. RAVEN automates income verification via direct IRS transcript retrieval, pulls business financials from accounting integrations, and verifies identity for all guarantors in parallel, cutting the document assembly phase that typically consumes two to three weeks in community bank commercial deals. For a bank growing its CRE book aggressively in a hot market, faster diligence means more closed deals per lender per quarter.",
      },
      {
        title: 'New-Resident Borrowers Are Hard to Verify Manually',
        body: "The Charleston MSA's growth is driven by in-migration: people arriving from other states with out-of-market employers, variable income structures, recent job changes, and financial histories spread across multiple institutions. These are precisely the borrowers that trip up manual verification workflows, where loan processors are chasing paystubs from unfamiliar HR platforms, calling out-of-state employers, and waiting on paper bank statements from distant depositories. RAVEN's direct data connections to payroll providers (Workday, ADP, Gusto), financial aggregators, and the IRS bypass that manual chase entirely, verifying income and employment for relocating borrowers as easily as for locals. For a bank whose primary market growth engine is in-migration, this means the bank can serve the new-resident segment competitively rather than losing files to lenders with better digital intake.",
      },
    ],
    sources: 'FDIC Institution API (api.fdic.gov/banks/institutions?filters=CERT:34966), FDIC Financials API (api.fdic.gov/banks/financials?filters=CERT:34966), Visbanking call report summary (visbanking.com/call-report/first-capital-bank-reports-2849463), First Capital Bank website (bankwithfirstcapital.com), First Capital Bank investor relations (bankwithfirstcapital.com/investor-relations/), FFIEC HMDA disclosure portal (ffiec.cfpb.gov/data-publication/disclosure-reports/2023/7DMUJTL9FFTVIAG9H788), Charleston Regional Development Alliance population data (crda.org/regional-data/population-demographics/), SC DEW 2024 population estimates (dew.sc.gov), ZoomInfo (zoominfo.com/c/first-capital-bank/562888303), LinkedIn (linkedin.com/in/aliciamogreen/), Macrotrends Charleston MSA population (macrotrends.net), Wikipedia Charleston metropolitan area (en.wikipedia.org/wiki/Charleston_metropolitan_area,_South_Carolina)',
  },
  {
    slug: 'first-palmetto-bank',
    name: 'First Palmetto Bank',
    shortName: 'First Palmetto',
    articleSlug: 'first-palmetto-bank-sc-performance-deep-dive',
    articleTitle: 'First Palmetto Bank: 120 Years Old, $1B in Assets, Zero Excuses',
    fdicCert: 28396,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$1.08B' },
      { label: 'ROA', value: '1.07% (FY2025)' },
      { label: 'NIM', value: '3.54%' },
      { label: 'Branch count', value: '22' },
    ],
    volumes: {
      mortgage: { count: 511, source: 'HMDA 2024 origination data via originationdata.com (LEI: 549300Z7EP1HO5CH1C36)', estimated: false },
      commercial: { count: 175, source: 'HMDA 2024 via originationdata.com; FDIC call report financials via api.fdic.gov (CERT 28396)', estimated: true },
      consumer: { count: 350, source: 'HMDA 2024 via originationdata.com; FDIC call report financials via api.fdic.gov (CERT 28396)', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 1200,
      source: "Estimated from new household formation across First Palmetto's 12-county SC footprint. Horry County (Myrtle Beach) alone adds 6,000-7,000 households/year; First Palmetto holds roughly 3-5% market presence in key markets. Total addressable new households across all served counties estimated at 1,200 per year conservatively.",
    },
    intro: "First Palmetto serves a geographically diverse South Carolina footprint spanning the Midlands (Camden, Columbia, Lugoff, Lexington), Lowcountry (Mount Pleasant, Summerville), Pee Dee (Darlington, Manning, Bishopville), Grand Strand (Myrtle Beach, Little River, Surfside Beach, Loris), and Upstate (Greenville). The coastal Horry County markets are among the fastest-growing in the US, with the Myrtle Beach metro area ranking among the top three fastest-growing population centers nationally in 2024. Inland markets like Kershaw and Lee counties are slower-growing rural communities. Borrower base skews toward owner-occupied residential, small business, and agricultural in inland markets, with heavier purchase-mortgage and vacation-home activity on the coast.",
    strategic: [
      {
        title: '511 Mortgages a Year, Zero Digital Verification',
        body: "First Palmetto originated 511 residential mortgage loans in 2024, roughly 78% of which were purchase transactions in a market where buyers often face competing offers and tight closing timelines. Their mortgage workflow still routes borrowers through a phone or email intake to a Mortgage Banker, with no embedded application or automated verification link. Every one of those 511 files requires someone on staff to chase pay stubs, tax returns, bank statements, and employer confirmations manually. RAVEN's borrower-permissioned income, employment, and asset verification eliminates that manual document chase, compressing the verification window from days to minutes and letting First Palmetto's Mortgage Bankers focus on the relationship rather than the paperwork.",
      },
      {
        title: 'Coastal Growth Creates a Verification Volume Problem',
        body: "First Palmetto's four Grand Strand offices (Myrtle Beach, Surfside Beach, Little River, Loris) sit inside one of the fastest-growing metro areas in the country. Horry County added roughly 7,000 net new households in 2024 alone, and the area's median property value jumped 13% year-over-year. That growth translates directly into purchase mortgage demand: new residents need home loans, existing residents are pulling HELOCs on appreciated equity, and short-term rental investors are financing vacation properties. Scaling that volume with the same manual document-collection process that works for a slower rural market creates staffing pressure and turn-time risk. RAVEN lets First Palmetto absorb coastal volume growth without a proportional headcount increase in their loan operations team.",
      },
      {
        title: 'A Small Business Specialty Deserves a Faster File',
        body: "First Palmetto is explicitly recognized for having a higher-than-peer concentration of small business and commercial real estate loans on its balance sheet, and it made a notable investment in CLIMB Fund's SBA microlending program. Small business borrowers are notoriously hard to verify: income comes from K-1s, business bank statements, and Schedule C filings rather than W-2s, and employment verification is self-referential. Commercial loan officers spend disproportionate time assembling and validating financial documentation before they can credit-decistion a file. RAVEN's business owner verification layer, including bank-level asset verification and business income confirmation, accelerates commercial and SBA loan underwriting at a bank whose commercial pipeline is central to its competitive identity.",
      },
    ],
    sources: 'FDIC Institutions API (api.fdic.gov, CERT 28396), FDIC Financials API (api.fdic.gov, CERT 28396), HMDA 2024 via originationdata.com (LEI 549300Z7EP1HO5CH1C36), Visbanking call report summary (visbanking.com/call-report/first-palmetto-bank-reports-586072), firstpalmetto.com/mortgage, firstpalmetto.com/about, firstpalmetto.com/locations, worldpopulationreview.com Kershaw County, datausa.io Kershaw County SC, heremyrtlebeach.com Horry County growth, CLIMB Fund press release (climbfund.org)',
  },
  {
    slug: 'beacon-community-bank',
    name: 'Beacon Community Bank',
    shortName: 'Beacon',
    articleSlug: 'beacon-community-bank-charleston-growth-capacity',
    articleTitle: 'Beacon Community Bank: Growth at the Edge of Capacity',
    fdicCert: 59106,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$972M' },
      { label: 'ROA', value: '0.38% (FY2025); 0.52% annualized Q1 2026' },
      { label: 'NIM', value: '2.28% (FY2025); 2.42% annualized Q1 2026' },
      { label: 'Branch count', value: '6' },
    ],
    volumes: {
      mortgage: { count: 400, source: 'Estimated from residential RE book of $439M (Q1 2026), assuming $375K average loan size and ~15% annual portfolio turnover plus net growth of ~$116M annualized, yielding roughly 400-500 originations/year. No HMDA data found via CFPB API for this institution.', estimated: true },
      commercial: { count: 175, source: 'FDIC Call Report financials via api.fdic.gov (CERT 59106), Q1 2026 and FY2025 data; CRDA population-demographics page; SC DEW 2024 population estimates report', estimated: true },
      consumer: { count: 875, source: 'FDIC Call Report financials via api.fdic.gov (CERT 59106), Q1 2026 and FY2025 data; CRDA population-demographics page; SC DEW 2024 population estimates report', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 8500,
      source: 'Charleston MSA (Berkeley, Charleston, Dorchester counties) adds roughly 40 new residents per day per CRDA (Charleston Regional Development Alliance), equating to ~14,600 new residents/year. At 2.5 persons per household, that implies ~5,800 new households/year. Additionally, IRS migration data shows Charleston County alone received 16,757 net in-migrants in the 2023-2024 period. MSA-wide new household formation is estimated at 8,000-9,000/year; 8,500 used as midpoint.',
    },
    intro: "Mount Pleasant is the fourth-largest city in South Carolina and part of the Charleston-North Charleston MSA, one of the fastest-growing metros in the country. The MSA (Berkeley, Charleston, Dorchester counties) grew nearly 9% from 2020-2024, adding 70,000+ residents. The borrower base skews toward higher-income professionals, military personnel (Joint Base Charleston), retirees relocating from the Northeast, and small-business owners in the Lowcountry economy. Home prices are well above state averages, making the $375K+ average mortgage size realistic. Beacon competes against First Citizens, South State Bank, and national lenders while deliberately positioning as a local alternative.",
    strategic: [
      {
        title: 'A $972M Loan Book Growing 10% Annually With No Digital Verification Stack',
        body: "Beacon grew its net loan portfolio from $788M to $848M in three quarters of 2025, a pace that implies loan officers are processing a rising volume of mortgage and commercial files without automated income, employment, or asset verification. At that origination velocity, document collection and manual review are almost certainly the throughput bottleneck. RAVEN's API-first verification stack plugs directly into community bank workflows, eliminating the paper-chase that slows closings without requiring a full LOS replacement. For a bank with six relationship bankers handling a $972M book, cutting borrower verification time from days to minutes frees capacity for the next tranche of growth. Beacon's COO background in financial technology suggests there is a champion in the C-suite who already understands why this matters.",
      },
      {
        title: 'The Charleston Migration Wave Is Creating a Verification Problem, Not Just an Opportunity',
        body: "The Charleston MSA is adding an estimated 8,500 new households per year, and a disproportionate share of those borrowers are transplants from higher-cost markets (New York, New Jersey, Massachusetts) with complex income profiles: remote-work compensation, equity grants, rental income from a former primary residence, or self-employment. These borrowers are exactly the applicants whose files take longest to verify manually and who are most likely to shop on speed and experience. RAVEN's income and employment verification instantly authenticates payroll data and employer records, letting Beacon compete with digitally native lenders on the one dimension where community banks have historically lost: closing speed. In a market where the average home price makes every basis point of rate and every day of cycle time meaningful, faster verification is a competitive weapon, not just an efficiency play.",
      },
      {
        title: "Relationship Banking Needs a Digital Front Door Before Devani Rici's Team Gets Overwhelmed",
        body: "Beacon has deliberately positioned its digital banking program under a dedicated AVP-level manager, signaling an intent to build out the channel, but the current digital offering stops at bill pay and mobile deposit. The mortgage page returns a 404 and loan applications begin with a phone call, meaning every new loan relationship requires manual borrower engagement before a single document is collected. RAVEN's borrower-facing verification portal gives Beacon a branded, self-service intake experience that fits the bank's relationship model: borrowers consent and connect their accounts directly, and the banker receives a clean verification report to review. This eliminates the three to five day document-request cycle without removing the banker from the relationship, which is exactly what a community bank needs to scale without adding headcount.",
      },
    ],
    sources: 'FDIC CERT 59106 institution data via api.fdic.gov/banks/institutions; FDIC financials via api.fdic.gov/banks/financials (Q1 2026, FY2025, Q3 2025, Q2 2025); beacon.bank homepage, digital banking page, executive team page, commercial bankers team page, who-we-are page; Charleston Regional Development Alliance population-demographics page (crda.org); SC Department of Employment and Workforce 2024 population estimates blog (dew.sc.gov); wheresmybank.com profile for CERT 59106; CFPB HMDA Data Browser (ffiec.cfpb.gov) -- no institution-specific HMDA record found; Post and Courier SC population growth coverage',
  },
  {
    slug: 'queensborough-national-bank',
    name: 'Queensborough National Bank & Trust Company',
    shortName: 'Queensborough',
    articleSlug: 'queensborough-national-bank-trust-deep-dive',
    articleTitle: "Queensborough's Long Runway: A $2.3B Georgia Bank Built to Last",
    fdicCert: 2138,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$2.34B' },
      { label: 'ROA', value: '1.06%' },
      { label: 'NIM', value: '3.5%' },
      { label: 'Branch count', value: '27' },
    ],
    volumes: {
      mortgage: { count: 453, source: 'HMDA 2024 originations via originationdata.com (LEI: 254900C2QXQ435D8TY78); 453 total mortgage originations, 388 home purchase, $161.7M total volume', estimated: false },
      commercial: { count: 777, source: 'FDIC call report financials API (CERT 2138), Q1 2026; LNRERES $319M, LNRECONS $199M, LNRENRES $477M, LNCI $105M, LNCON $41M', estimated: true },
      consumer: { count: 1635, source: 'FDIC call report financials API (CERT 2138), Q1 2026; LNRERES $319M, LNRECONS $199M, LNRENRES $477M, LNCI $105M, LNCON $41M', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 900,
      source: "Augusta-Richmond County MSA grew 2.82% from 2020-2023 (629K population, ~252K households). Applying ~0.94%/yr growth rate and QNB's ~3.6% mortgage market share across their Augusta-to-Savannah footprint yields roughly 900 new borrower households/yr within reach of their branches.",
    },
    intro: "Primary footprint runs the I-20/US-1 corridor from Louisville to Augusta (8 Augusta-area branches) and the Savannah market (6 branches), with a spine of rural middle Georgia branches in Sandersville, Wadley, Sylvania, Waynesboro, Wrens, Millen, Midville, Metter, and Statesboro. Augusta MSA is growing at 1.1% annually, anchored by Fort Eisenhower (formerly Fort Gordon), the U.S. Army Cyber Command, and a strong medical sector. Columbia County is one of Georgia's fastest-growing counties. The rural branch towns serve agricultural borrowers, timber interests, and small manufacturers -- a mix of conventional mortgage, farm-adjacent consumer, and small commercial credits.",
    strategic: [
      {
        title: 'Rural Borrower, Urban Ambition: Closing the Verification Gap Across a 27-Branch Footprint',
        body: "Queensborough's branch map runs from Wadley and Midville through Augusta and on to Savannah -- a 150-mile corridor where borrowers increasingly expect a digital experience but branch staff still collect paper pay stubs and bank statements. With 453 mortgage originations in 2024 and a residential RE book approaching $520M (construction plus permanent), the manual document burden on local lenders is significant. RAVEN's open-banking verification lets a borrower in Sylvania authorize income and asset data in minutes, while the Louisville underwriting team sees a verified, audit-ready file without chasing documents by email. For a bank that prides itself on \"local decision-making,\" RAVEN keeps decisions local while eliminating the bottleneck that makes community banks look slow next to digital lenders.",
      },
      {
        title: 'Fort Eisenhower Effect: Capturing Military Borrowers Before Rocket Mortgage Does',
        body: "Queensborough originated 57 VA loans in 2024 -- about 12.6% of their mortgage mix -- driven by the Fort Eisenhower (formerly Fort Gordon) military population that anchors the Augusta MSA. Military households move frequently and make purchase decisions quickly; they are also the most aggressively targeted segment by national digital lenders. Rocket Mortgage held 5.8% market share versus Queensborough's 3.6% in this same footprint. Speed is the competitive variable: a VA borrower who can get income and service verification in a single digital step rather than hunting down LES statements and DD-214s will choose the faster lender. RAVEN automates military income verification and employer data pulls, letting Queensborough compete on cycle time -- not just relationship -- for the area's most mobile borrowers.",
      },
      {
        title: 'A $477M Commercial RE Book With No Digital Front Door',
        body: "Queensborough's non-residential real estate exposure hit $477M as of Q1 2026 -- its single largest loan category, representing over 35% of total loans -- yet the commercial banking page on qnbtrust.bank offers no online application and directs all inquiries to a branch visit or phone call. Commercial borrowers, especially small business owners across rural CSRA markets, spend hours assembling tax returns, business bank statements, and rent rolls that underwriters then re-key manually. RAVEN's commercial verification layer -- business bank account aggregation, business owner identity, and employer/income verification for guarantors -- compresses the document-gathering phase that most community bank commercial lenders say is their biggest time sink. For a bank with Commercial Lending Specialization status (FDIC Spec Group 4), moving the commercial intake process online is both a competitive upgrade and a capacity multiplier for the existing lending team.",
      },
    ],
    sources: 'FDIC BankFind API (CERT 2138, Q1 2026): api.fdic.gov/banks/institutions, api.fdic.gov/banks/financials; HMDA 2024 origination data: originationdata.com/institution/254900C2QXQ435D8TY78; HMDA 2023 data: allmortgagedetail.com; QNB website: qnbtrust.bank (Mortgage, Business, QNBTNOW, Locations pages); Augusta CSRA population: WRDW/Census Bureau MSA estimates 2023; Columbia County housing: chris-still.com CSRA market update; FDIC CRA evaluation (OCC Jul 2024): occ.gov/static/cra/craeval/Jul24/6207.pdf',
  },
  {
    slug: 'first-community-bank-sc',
    name: 'First Community Bank',
    shortName: 'First Community',
    articleSlug: 'first-community-bank-sc-cre-merger-growth',
    articleTitle: 'First Community Bank: CRE Specialist on a Post-Merger Growth Curve',
    fdicCert: 34047,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$2.40B (Q1 2026, post-Signature Bank of Georgia acquisition)' },
      { label: 'ROA', value: '0.94% (full year 2025); 1.09% annualized Q1 2026' },
      { label: 'NIM', value: '3.32% (Q4 2025, tax equivalent); seven consecutive quarters of expansion' },
      { label: 'Branch count', value: '23' },
    ],
    volumes: {
      mortgage: { count: 800, source: 'Estimated from full-year 2025 mortgage production volume of $202.7M (per Q4 2025 earnings release) divided by estimated average loan size of $250K. Residential 1-4 family book at 12/31/25 was $322M (FDIC call report).', estimated: true },
      commercial: { count: 1100, source: 'Q4 2025 and full-year 2025 earnings press release (PRNewswire, First Community Corporation, Feb 2026); FDIC call report financials API cert 34047', estimated: true },
      consumer: { count: 760, source: 'Q4 2025 and full-year 2025 earnings press release (PRNewswire, First Community Corporation, Feb 2026); FDIC call report financials API cert 34047', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 3000,
      source: "Lexington County alone has ~122K households growing at 1.3% annually (~1,586 new households/yr per Census QuickFacts and USAFacts). Columbia MSA (which includes Richland, Kershaw, Newberry counties) is adding ~4,650 households/yr. Bank's 23-office footprint spans SC Midlands, Upstate Piedmont, Aiken/Augusta, and now 4 Atlanta-area offices; ~3,000 represents a conservative share of household formation across that territory.",
    },
    intro: "First Community Bank's primary market is the Columbia, SC MSA (Lexington and Richland counties), one of South Carolina's fastest-growing metros driven by state government employment, University of South Carolina, Fort Jackson military installation, and a steady in-migration from higher-cost Northeast and Midwest metros. Lexington County is the growth engine: population of ~317K growing at 1.3% annually with above-average homeownership rates (77.4%) and median household income of $77,408. The January 2026 Signature Bank acquisition extended the footprint into the Atlanta-Sandy Springs-Roswell MSA, adding exposure to one of the Southeast's most dynamic commercial real estate and small business markets. The bank's borrower base skews toward owner-operated businesses, real estate investors, and upwardly mobile professionals relocating to the Midlands.",
    strategic: [
      {
        title: 'Merger Integration Creates a Verification Backlog Window',
        body: "First Community completed its acquisition of Signature Bank of Georgia in January 2026 and finished systems conversion in March 2026, meaning it is currently operating across two merged loan portfolios and staff cultures simultaneously. Post-merger periods are notoriously high-friction for loan operations teams: loan officers from the acquired institution use different checklists, borrower relationships require re-documentation, and pipeline management becomes unwieldy. RAVEN can serve as a neutral, standardized verification layer that works across both legacy systems and new workflows, reducing the manual document collection burden that spikes during integration. Deploying a unified verification platform now helps First Community normalize the borrower experience across all 23 offices before the merged institution's habits calcify.",
      },
      {
        title: "Columbia's In-Migration Boom Means Thin Borrower Files",
        body: "Lexington County adds roughly 1,500-1,600 new households per year, heavily driven by domestic in-migrants from other states -- people relocating for Fort Jackson, the University of South Carolina, or lower cost of living. These borrowers often have non-traditional income profiles: recent job changes, multi-state employment histories, self-employment transitions, or assets spread across institutions they left behind. Manual document collection for these borrowers is slow and error-prone, leading to longer cycle times and higher fall-through rates. RAVEN's bank-permission-based income, employment, and asset verification resolves these thin-file challenges in hours rather than days, directly supporting First Community's ability to close purchase mortgages in the competitive Midlands market where the bank competes against larger regional lenders with more automated pipelines.",
      },
      {
        title: 'CRE-Heavy Book Means Manual Spreading Is a Bottleneck',
        body: "With non-residential CRE at $904M out of a $1.54B total loan book -- nearly 59% of loans -- First Community's commercial underwriting team handles a disproportionate volume of small-business financials, rent rolls, and entity documentation. The FDIC classifies the bank as a \"Commercial Lending Specialization\" institution, and the Q4 2025 earnings showed $202.6M in full-year commercial loan production. At an average deal size around $700K-$1M, that represents 200-300 new commercial credits per year each requiring income verification, business cash flow analysis, and borrower identity confirmation. RAVEN's commercial verification workflows -- pulling bank-permissioned business account data, payroll records, and tax transcripts -- can cut the document-chasing phase of commercial underwriting by several weeks per deal, compressing turn times and allowing the commercial team to handle post-acquisition volume growth without proportional headcount increases.",
      },
    ],
    sources: 'FDIC Institutions API (cert 34047), FDIC Financials API (cert 34047), First Community Corporation Q4 2025 earnings press release (PRNewswire), First Community Corporation 2025 10-K overview (StockTitan/SEC), PRNewswire Signature Bank of Georgia acquisition announcement (July 2025 and January 2026), Columbia Business Monthly acquisition coverage, firstcommunitysc.com website and careers pages, Census QuickFacts Lexington County SC, USAFacts Lexington County population data, MacroTrends Columbia SC MSA population data, OriginationData.com HMDA search',
  },
  {
    slug: 'countybank',
    name: 'Countybank',
    shortName: 'Countybank',
    articleSlug: 'countybank-greenwood-sc-sba-deep-dive',
    articleTitle: 'Countybank: The $748M SBA Leader Betting on Relationships',
    fdicCert: 9155,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$748M' },
      { label: 'ROA', value: '1.22% (FY2025); 1.50% annualized Q1 2026' },
      { label: 'NIM', value: '3.44% (FY2025 estimated from reported NIM income / avg assets)' },
      { label: 'Branch count', value: '13' },
    ],
    volumes: {
      mortgage: { count: 275, source: "Estimated from $187.6M residential RE book at $200K avg loan size and ~30% annual portfolio turnover, consistent with Countybank Mortgage's stated $3B cumulative / 15,000+ transactions since inception (avg $200K). Peak year 2021 was $525M; normalized 2023-2024 volumes estimated at $50-60M or ~250-300 originations/year. LEI 7DMUJTL9FFTVIAG9H788 confirmed in FFIEC HMDA system but disclosure table data unavailable via API.", estimated: true },
      commercial: { count: 366, source: 'FDIC Call Report via api.fdic.gov CERT 9155, Q1 2026 and FY2025 financials', estimated: true },
      consumer: { count: 444, source: 'FDIC Call Report via api.fdic.gov CERT 9155, Q1 2026 and FY2025 financials', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 1300,
      source: 'Greenwood County adds ~200 net new households/year (491 domestic in-migrants, avg 2.5 persons/household). Anderson County (230K pop, ~90K households, 1-1.5% growth) adds ~900-1,350/year. Laurens County adds ~200-300/year. Countybank has branches across all three counties plus Greenville and Greer markets. Combined primary-market estimate: ~1,300 new households/year. Source: Census QuickFacts, southcarolina-demographics.com, datausa.io.',
    },
    intro: 'Operates primarily in Upstate South Carolina across Greenwood, Anderson, Laurens, and Greenville counties. The Greenville-Spartanburg-Anderson MSA is one of the fastest-growing manufacturing and industrial corridors in the Southeast, anchored by BMW, Michelin, and a dense tier-1 auto supplier base. This drives steady commercial loan demand from owner-operated businesses and in-migration of manufacturing workers, supporting a durable mortgage pipeline. Greenwood itself is a smaller anchor city (~70K county population) with a growing Hispanic workforce. Anderson and Laurens counties are absorbing the overflow growth from the Greenville MSA, with housing permits and population rising 1-1.5% annually.',
    strategic: [
      {
        title: 'SBA Powerhouse Running Manual Verification',
        body: "Countybank was the top SC-based SBA 7(a) lender by volume in 2021 and 2022, surpassing $100M in SBA closings. SBA loan files are among the most document-intensive in community banking, requiring business tax returns, personal financial statements, bank statements, and third-party verifications that lenders typically chase manually. RAVEN's income, asset, and identity verification modules can pull verified data directly from IRS, payroll processors, and financial institutions, cutting the document collection cycle from weeks to hours. For a bank competing on SBA volume against larger regional banks with dedicated processing centers, faster file completion is a direct revenue and capacity advantage.",
      },
      {
        title: 'Mortgage Department Growth Is Outpacing Its Manual Process',
        body: "Countybank Mortgage has closed over 15,000 transactions and $3B in cumulative volume, with 2021 alone hitting $525M. That production came in a rate environment where purchase and refi demand were both surging, and the team clearly has the origination muscle to move loans at scale. What the bank's public digital footprint shows is a loan process that still routes applicants through loan officers and paper-based doc collection, with no borrower portal or verification API visible on the site. As purchase volume normalizes and each basis point of pull-through matters, automating income, employment, and asset verification through RAVEN removes one of the biggest cycle-time drags in the file and frees loan officers to work more deals rather than chase documents.",
      },
      {
        title: 'New-Resident Borrowers Across the Upstate SC Growth Corridor',
        body: "The Greenville-Anderson-Greenwood corridor is absorbing significant in-migration from the Northeast and Midwest, driven by BMW, Michelin, and a growing manufacturing base. These new residents arrive without existing banking relationships or local pay stubs, making traditional manual verification especially friction-heavy. Countybank's branch expansion into Greer and Simpsonville puts it directly in the path of these new-to-market borrowers, but converting them into closed loans quickly requires digital-first verification that can handle non-local employers, recent job starts, and out-of-state asset accounts. RAVEN's payroll and asset connectivity verifies these borrowers in minutes rather than days, letting Countybank win loans that would otherwise drift to national lenders with faster digital pipelines.",
      },
    ],
    sources: 'FDIC API api.fdic.gov CERT 9155, ecountybank.com, indexjournal.com Countybank $3B milestone, ffiec.cfpb.gov LEI 7DMUJTL9FFTVIAG9H788, datausa.io Greenwood County SC, southcarolina-demographics.com, ecountybank.com/about-us/news-events.html, ecountybank.com/personal/personal-services/digital-banking.html, ecountybank.isolvedhire.com',
  },
  {
    slug: 'optus-bank',
    name: 'Optus Bank',
    shortName: 'Optus',
    articleSlug: 'optus-bank-cdfi-columbia-growth',
    articleTitle: 'Optus Bank at $785M: Mission Bank, Market Discipline',
    fdicCert: 35241,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '$785M (Q1 2026)' },
      { label: 'ROA', value: '1.11% (FY2025); 1.32% annualized (Q1 2026)' },
      { label: 'NIM', value: '2.80% (FY2025, computed: $21.5M net interest income / ~$765M avg assets)' },
      { label: 'Branch count', value: '2' },
    ],
    volumes: {
      mortgage: { count: 160, source: 'Estimated from FDIC LNRE (residential real estate book $260M at Q1 2026) divided by estimated $200K avg loan size and 7-8 year weighted avg life for a growing CDFI portfolio, yielding ~160-185 annual originations. No HMDA file was directly accessible for Optus Bank via FFIEC data browser API queries.', estimated: true },
      commercial: { count: 130, source: 'FDIC Call Report CERT 35241, Q1 2026 and FY2025 via api.fdic.gov/banks/financials', estimated: true },
      consumer: { count: 520, source: 'FDIC Call Report CERT 35241, Q1 2026 and FY2025 via api.fdic.gov/banks/financials', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 1600,
      source: 'Richland County SC total population ~422K (2024 Census/ACS), ~168K households at 2.48 persons/household avg, annual population growth rate 0.96% per World Population Review 2026. New residents ~4,050/yr at 2.48/household = ~1,630 new households/year. Rounded to 1,600 reflecting Optus\'s 2-branch footprint concentrated in Columbia/Richland County.',
    },
    intro: "Optus operates two branches in Columbia, SC (Richland County), the state capital and second-most-populated county in South Carolina with ~422K residents. The Columbia MSA (766K population in 2024, growing 1.46%/yr) is a mid-sized university and government hub anchored by the University of South Carolina and Fort Jackson, the largest U.S. Army training installation. Optus serves a predominantly African American and low-to-moderate income borrower base across Columbia and statewide via relationships with CDFI networks. The bank's loan book skews heavily toward commercial real estate and C&I ($360M combined), with a growing residential mortgage portfolio ($260M). South Carolina continues to net domestic in-migration, supporting steady new-borrower demand.",
    strategic: [
      {
        title: 'Verification Friction Is the Bottleneck for LMI Borrowers',
        body: "Optus Bank's core borrowers, low-to-moderate income and minority households in the Columbia metro, are exactly the population most likely to have non-traditional income documentation: gig work, cash wages, multiple part-time jobs, or SSI. Manual document collection for these borrowers is slower, more error-prone, and more likely to cause application abandonment than for conventional wage earners. RAVEN's permissioned open-banking income and employment verification pulls payroll and bank-transaction data directly from the source, eliminating the back-and-forth phone calls and fax requests that drive up loan officer hours on files that are already complex. For a two-branch bank doing 160 mortgages and 130 commercial loans per year with a lean staff, shaving even two hours of manual verification per file translates directly into capacity for more loans and better service to the underserved borrowers Optus was built to help.",
      },
      {
        title: '$785M in Assets, Two Branches: RAVEN Extends the Reach',
        body: "Optus has grown from near-failure to $785M in assets with only two physical locations in Columbia, meaning its loan officers already serve borrowers across the state through CDFI network relationships, referrals, and online inquiries. Without a digital verification workflow, every out-of-branch loan still requires borrowers to drive in, fax documents, or email sensitive files in uncontrolled formats. RAVEN enables a fully remote borrower experience where income, employment, and asset verification happens in minutes through a mobile-first consent flow, not a trip to Gervais Street. This matters especially as Optus scales toward the $1B threshold: the bank needs operational leverage, not just more headcount, to maintain its efficiency ratio (52% in FY2025) while growing its footprint statewide.",
      },
      {
        title: 'Mission-Aligned Data: CDFI Reporting Needs Richer Loan-File Inputs',
        body: "As a Treasury-certified CDFI and MDI, Optus Bank must demonstrate community impact in its grant reporting, ECIP compliance disclosures, and CRA exam documentation. Richer verified data at origination (income levels, employment sectors, asset levels of underserved borrowers) feeds directly into that impact narrative and makes regulatory exams smoother. RAVEN's verification reports produce structured, auditable outputs that document borrower financial profiles at the time of application, exactly the kind of granular evidence CDFI funders and bank examiners want to see. For a bank whose entire funding model depends on maintaining credible impact metrics for PayPal, Citi, and Treasury, clean borrower-level data is not just an operational convenience but a strategic asset.",
      },
    ],
    sources: 'FDIC Institutions API (api.fdic.gov/banks/institutions, CERT 35241), FDIC Financials API (api.fdic.gov/banks/financials, CERT 35241), optus.bank (homepage, about page), American Banker (Optus Bank explosive growth article), Columbia Metropolitan Magazine (104 years article), CDFI.org Optus Bank profile, National Community Investment Fund (ncif.org), Community Development Bankers Association (cdbanks.org), World Population Review (Richland County 2026), datausa.io Richland County SC, southcarolina-demographics.com, SC Department of Employment and Workforce (2024 population estimates), ibanknet.com OPTUS Bank financial reports, ZoomInfo/LinkedIn (Jamel Roberts title confirmation), Optus Bank Impact Report 2023 (optus.bank/wp-content/uploads/2024/04/Impact-Report-2023.pdf)',
  },
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
  {
    slug: 'oconee-state-bank',
    name: 'Oconee State Bank',
    shortName: 'Oconee State',
    articleSlug: 'oconee-state-bank-digital-lending-oconee-county',
    articleTitle: 'Oconee State Bank: Serving the Athens Corridor Since 1954',
    fdicCert: 18143,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '~$640M' },
      { label: 'FDIC cert', value: '18143' },
      { label: 'Online loan products', value: '0 of 6' },
      { label: 'Market', value: 'Oconee County, GA (Athens MSA)' },
    ],
    volumes: {
      mortgage: { count: 200, source: 'Estimated from HMDA 2024 public data and FDIC call report loan portfolio composition for CERT 18143', estimated: true },
      commercial: { count: 80, source: 'Estimated from FDIC call report CRE and C&I balances for CERT 18143', estimated: true },
      consumer: { count: 300, source: 'Estimated from FDIC call report consumer loan balances for CERT 18143', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 2000,
      source: 'Oconee County GA adds approximately 1,800-2,200 new households annually driven by Athens MSA growth and UGA-adjacent in-migration (ACS 2019-2023, Census population estimates).',
    },
    intro:
      "Oconee State Bank is the hometown lender for one of Georgia's fastest-growing suburban counties, anchored by the University of Georgia and the Athens tech and research corridor. Oconee County has grown 32% over the past decade with no signs of slowing: new residential construction, professional in-migration from Athens, and retirees from metro Atlanta choosing the Watkinsville-Bogart corridor for affordability and quality of life. Despite a clean, modern site and a 70-year brand, none of the bank's lending products have a digital application path. All intake is phone or branch. At $640M and growing, manual verification is already the capacity bottleneck.",
    strategic: [
      {
        title: 'Athens MSA growth demands a digital front door',
        body: 'Oconee County added more than 10,000 residents in the 2020s, nearly all from in-migration. These borrowers arrive with existing banking relationships in other markets and choose their new bank based on digital experience first. A bank with no apply button loses the first-touch comparison to any lender that has one, including national brands with zero local presence.',
      },
      {
        title: 'EVP Innovation hire signals the board sees the gap',
        body: "The bank created an EVP Chief Innovation and Technology Officer role specifically to modernize the lending stack. That mandate requires a front-end verification layer before it can deliver on the digital promise. Without an intake that verifies income, identity, and employment at first touch, a new CTO just has a modern website pointed at a phone number.",
      },
      {
        title: 'University and tech workforce means complex income profiles',
        body: "Borrowers in the Athens corridor include UGA faculty on 9-month contracts, startup founders with equity comp, and Rivian (the nearby electric vehicle manufacturer) employees with RSU income. These profiles fail manual document chasing and are exactly the applicants RAVEN's automated Truework and Plaid verification resolves quickly.",
      },
    ],
    sources:
      'FDIC BankFind cert #18143; oconeestatebank.com site review (June 2026); ACS 2019-2023 Oconee County GA; Census population estimates; MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
  {
    slug: 'ameris-bank',
    name: 'Ameris Bank',
    shortName: 'Ameris',
    articleSlug: 'ameris-bank-southeast-regional-digital-gap',
    articleTitle: 'Ameris Bank: The $25B Southeast Regional With a Third-Party Mortgage Portal',
    fdicCert: 20504,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '~$25.6B' },
      { label: 'States', value: 'GA, AL, FL, SC, NC' },
      { label: 'Online loan products', value: '1 of 6 (partial)' },
      { label: 'Mortgage', value: 'Third-party portal' },
    ],
    volumes: {
      mortgage: { count: 2450, source: 'Estimated from HMDA 2024 public data and FDIC call report for CERT 20504 ($25.6B total assets, substantial mortgage origination volume)', estimated: true },
      commercial: { count: 1470, source: 'Estimated from FDIC call report CRE and C&I balances for CERT 20504', estimated: true },
      consumer: { count: 980, source: 'Estimated from FDIC call report consumer loan balances for CERT 20504', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 25000,
      source: "Ameris Bank footprint spans high-growth metros: Atlanta MSA (~50,000 net new households/year), Jacksonville FL MSA, Columbia SC MSA, and coastal GA/FL markets. Estimated 25,000 net new households in primary service areas annually (ACS 2019-2023, Census population estimates).",
    },
    intro:
      "Ameris Bank is the dominant Southeast-focused regional with $25.6 billion in assets across Georgia, Alabama, Florida, South Carolina, and North Carolina. The mortgage operation is substantial, but mortgage applications route to a third-party subdomain (mymortgage-online.com), breaking the brand at the highest-stakes conversion step. Personal loans have no digital application path. HELOC and home equity require a branch visit. Commercial is relationship-only. For a bank this size, automated borrower verification at intake is the infrastructure that makes the mortgage volume sustainable without proportional staffing.",
    strategic: [
      {
        title: '$25B mortgage operation running on a third-party portal',
        body: 'At 2,450 estimated annual mortgage originations, manual document collection is the single largest per-file labor sink in the bank. Automated income, employment, and identity verification at intake converts each file from a 10-hour staff project into a 90-second process, recovering an estimated 3.5 FTEs of underwriter capacity without a hire.',
      },
      {
        title: 'Retail Delivery & Innovation mandate requires a front-end layer',
        body: 'The SVP of Retail Delivery and Innovation role exists specifically to modernize how borrowers enter the lending process. The current state, a third-party mortgage portal plus no digital intake for any other product, is the problem that role was hired to solve. The verification layer is typically the first high-visibility win: measurable before/after, no core replacement required, visible in the efficiency ratio within two quarters.',
      },
      {
        title: 'Five-state footprint, one intake standard',
        body: 'Ameris operates in five high-growth Southeast states, each with different in-migration patterns and borrower income profiles (Atlanta startup equity, Jacksonville military, Hilton Head vacation home buyers). A single white-label intake layer that handles all income types and syncs to the existing core eliminates the fragmented branch-by-branch verification process that currently scales with headcount rather than with volume.',
      },
    ],
    sources:
      'FDIC BankFind cert #20504; amerisbank.com site review (June 2026); HMDA 2024 public data; FDIC call report financials; MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
  {
    slug: 'united-bank',
    name: 'United Bank',
    shortName: 'United Bank',
    articleSlug: 'united-bank-mid-atlantic-digital-strategy',
    articleTitle: 'United Bank: The $30B Mid-Atlantic Regional Expanding South',
    fdicCert: 5672,
    auditDate: 'June 2026',
    stats: [
      { label: 'Total assets', value: '~$30B' },
      { label: 'States', value: 'WV, VA, OH, MD, PA, NC, SC' },
      { label: 'Online loan products', value: '2 of 6 (partial)' },
      { label: 'HQ', value: 'Charleston, WV' },
    ],
    volumes: {
      mortgage: { count: 2900, source: 'Estimated from HMDA 2024 public data and FDIC call report for CERT 5672 (~$30B total assets, substantial mortgage origination across multi-state footprint)', estimated: true },
      commercial: { count: 1700, source: 'Estimated from FDIC call report CRE and C&I balances for CERT 5672', estimated: true },
      consumer: { count: 1100, source: 'Estimated from FDIC call report consumer loan balances for CERT 5672', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 15000,
      source: 'United Bank footprint includes Charlotte MSA (fast-growing), Richmond VA MSA, and expanding NC/SC markets. Estimated 15,000 net new households in primary growth markets annually (ACS 2019-2023, Census population estimates).',
    },
    intro:
      "United Bank is the primary subsidiary of United Bankshares, one of the largest bank holding companies headquartered in West Virginia with roughly $30 billion in total assets across seven states. The Charlotte, NC office reflects the bank's southward growth push into the fastest-expanding markets in the Mid-Atlantic. The bank has an online mortgage application but no automated income or property verification embedded in the flow: borrowers submit and then wait for manual document collection to begin. Personal lending is partially digital, HELOC has no standalone path, and commercial is entirely relationship-based. At $30B, the friction cost of manual verification is measured in weeks of underwriter time per quarter.",
    strategic: [
      {
        title: 'Mortgage volume without embedded verification is a capacity trap',
        body: 'At an estimated 2,900 annual mortgage originations, the difference between manual document collection and automated verification is roughly 29,000 staff-hours per year in the expected scenario. That is 14+ full-time positions in underwriting support that the bank currently funds through headcount rather than automation. RAVEN replaces document chasing with a single verified file delivered at intake.',
      },
      {
        title: 'Charlotte expansion demands digital-first acquisition',
        body: "United Bank's Charlotte office targets a market where Bank of America, Truist, and Wells Fargo set the digital baseline. In-migrants choosing a bank in the Charlotte MSA make that choice on digital experience before they ever visit a branch. A bank that offers an apply button that still requires a follow-up document email is not competing with Rocket Mortgage or Better.com for that borrower.",
      },
      {
        title: 'SVP Digital Strategy hire signals the inflection point',
        body: 'The Director of Digital Strategy role is the bank\'s signal that leadership understands the problem. Converting that mandate into a measurable outcome means automating the borrower verification workflow: income, identity, employment, and assets captured in 90 seconds at intake, verified file synced to the core on submission. That is the deliverable a digital strategy mandate requires, and it is the first place the efficiency ratio improves.',
      },
    ],
    sources:
      'FDIC BankFind cert #5672; bankwithunited.com site review (June 2026); United Bankshares 10-K (FY2025); HMDA 2024 public data; MBA Quarterly Mortgage Bankers Performance Report (2025); BLS OEWS (2025).',
  },
  {
    slug: 'robins-financial-credit-union',
    name: 'Robins Financial Credit Union',
    shortName: 'Robins Financial',
    articleSlug: 'robins-financial-20-million-rebate',
    articleTitle: "The Credit Union That Can't Spend Its Money Fast Enough",
    // NOTE: this field is named for the FDIC certificate a bank carries;
    // Robins Financial is a credit union with no FDIC cert. Populated with its
    // NCUA charter number (68670) instead until this field is generalized.
    // See `sources`.
    fdicCert: 68670,
    auditDate: 'August 2026',
    stats: [
      { label: 'Total assets', value: '$4.91B (Mar 2026)' },
      { label: 'Net worth ratio', value: '16.1% (Mar 2026)' },
      { label: 'Members', value: '272,542' },
      { label: 'Branch count', value: '24 across middle Georgia' },
    ],
    volumes: {
      mortgage: {
        count: 1457,
        source:
          'Reported 2024 HMDA originations (action taken = originated) for Robins Financial Credit Union, LEI 549300AUL77A8UKADB04, totaling $173.3M, via the FFIEC HMDA data browser API. An actual filed figure, not an estimate.',
        estimated: false,
      },
      commercial: {
        count: 80,
        source:
          'Robins Financial markets business accounts and lending but publishes no member-business-lending origination detail. Estimate reflects a $4.9B consumer-first credit union with a modest commercial book.',
        estimated: true,
      },
      consumer: {
        count: 13000,
        source:
          'Vehicles dominate the book at $1.54B of $2.82B total loans (54.5%) as of March 2026, with unsecured lending at $159.4M. Estimate scales the origination-per-member rate observed across this series (~4.8% of members annually) to 272,542 members. Not an NCUA-reported figure.',
        estimated: true,
      },
    },
    market: {
      newHouseholdsPerYear: 4500,
      source:
        "Robins Financial's Georgia state charter (converted from federal in January 2016) covers roughly 43 middle Georgia counties plus family of members. No FDIC Summary of Deposits equivalent exists for credit unions, so this is sized to the field of membership. Houston County (~170,000) and Bibb County (Macon, ~157,000) anchor the footprint; Robins AFB grew 11% in two years to 21,000+ workers whose homes span 110 of Georgia's 159 counties. Middle Georgia growth is slower than coastal or Atlanta-metro Georgia; at 2.5 persons per household, a conservative estimate nets roughly 4,500 new households a year across the 43-county footprint.",
    },
    intro:
      "Robins Financial is the end state the rest of this series is chasing: a 16.1% net worth ratio, a roughly 1.8% ROA earned on a 1.15% cost of funds, and so much structural surplus that it rebated $20 million to members in December ($151 million since 2017). The engine is relationship depth: 30.9% of shares sit in share drafts, the best primary-relationship funding mix we have measured. The strategic exposure is geographic: Robins AFB employees live in 110 of Georgia's 159 counties while the credit union operates 24 branches, so for most eligible members the digital front door is the branch network, and every step of friction in joining or borrowing is a member the rebate flywheel never gets to feed.",
    strategic: [
      {
        title: 'The Rebate Flywheel Only Compounds on Members the Funnel Actually Converts',
        body: "Robins' famous December rebate pays on relationship depth: loans held, dividends earned, accounts used. That makes new-member conversion quality, not just volume, the growth metric that matters, because a member who lands with a verified identity, a linked funding account, and a share draft on day one starts feeding the flywheel immediately. Verification-first onboarding, where identity, income, and the funding account are confirmed in one digital sitting, is the difference between a new member who qualifies for a real rebate check next December and an application abandoned at a branch-visit requirement.",
      },
      {
        title: '110 Counties of Eligible Members, 24 Branches',
        body: "Robins AFB's 21,000+ employees live in 110 of Georgia's 159 counties, and the 2016 state charter opened roughly 43 counties of eligibility, yet the branch network covers a fraction of that geography. For the majority of eligible members, Robins is digital or it is nothing. Account opening already runs on a first-party subdomain (newaccount.robinsfcu.org), which is the right architecture; the remaining question is verification depth inside that flow, so a base contractor in Valdosta or a member's daughter in Savannah can join, fund, and borrow without ever seeing Warner Robins.",
      },
      {
        title: 'A 30.9% Share-Draft Mix Is Worth Defending Like an Asset',
        body: 'Robins funds itself at roughly 1.15% because nearly a third of its shares are primary-relationship checking balances, while peers pay north of 2% for certificate money. Every fintech and neobank onboarding flow is aimed at exactly these balances, and the industry lost 44% of new checking accounts to digital-first competitors last year on speed of account opening alone. Matching that opening speed, with verification rigor a 16.1%-capitalized institution expects, is the cheapest defense of the funding advantage that makes the whole model work.',
      },
    ],
    sources:
      "robinsfcu.org (auto-loans, personal-loans, checking, membership pages, reviewed August 2026); newaccount.robinsfcu.org (first-party account opening) and onlinebanking.robinsfcu.org (Q2, fingerprinted August 2026); NCUA 5300 aggregation via ncuso.org for charter #68670 (Mar 31, 2026: assets, loans, loan mix, shares, share mix, equity, members, branches, income statement); FFIEC HMDA data browser API, 2024, LEI 549300AUL77A8UKADB04 (1,457 originations, $173.3M); IRS Form 990 FY2024 via ProPublica Nonprofit Explorer, EIN 580641605 (revenue, expenses, executive compensation; state-chartered 501(c)(14)); CUToday and CUInsight coverage of the December 2025 $20M member rebate and $151M cumulative total; Wikipedia and robinsfcu.org for the 1954 founding and January 2016 federal-to-state charter conversion; 13WMAZ 2026 State of the Base coverage (21,000+ workers, $4.48B impact, 110 of 159 counties). fdicCert field holds Robins Financial's NCUA charter number, not an FDIC certificate; Robins Financial is a federally insured credit union with no FDIC cert.",
  },
  {
    slug: 'founders-federal-credit-union',
    name: 'Founders Federal Credit Union',
    shortName: 'Founders',
    articleSlug: 'founders-credit-union-mill-town',
    articleTitle: "The Mill Closed. The Credit Union Didn't.",
    // NOTE: this field is named for the FDIC certificate a bank carries;
    // Founders is a credit union with no FDIC cert. Populated with its NCUA
    // charter number (24063) instead until this field is generalized. See
    // `sources`.
    fdicCert: 24063,
    auditDate: 'August 2026',
    stats: [
      { label: 'Total assets', value: '$5.18B (Mar 2026)' },
      { label: 'Net worth ratio', value: '13.2% (Mar 2026)' },
      { label: 'Members', value: '290,408' },
      { label: 'Branch count', value: '49 across the Carolinas' },
    ],
    volumes: {
      mortgage: {
        count: 2139,
        source:
          'Reported 2024 HMDA originations (action taken = originated) for Founders Federal Credit Union, LEI 5493001AGQGPJ3N3YL33, totaling $332.8M, via the FFIEC HMDA data browser API. Unlike most credit unions in this series, Founders is a HMDA reporter, so this is an actual filed figure, not an estimate.',
        estimated: false,
      },
      commercial: {
        count: 120,
        source:
          'Founders markets business services but publishes no member-business-lending origination detail, and no business-specific online application is visible on foundersfcu.com. Estimate reflects a $5.2B credit union with a consumer-first model and a modest commercial book.',
        estimated: true,
      },
      consumer: {
        count: 14000,
        source:
          'Auto, personal, express, and credit card lending dominate the book: $1.16B in vehicle/other secured loans plus $605.8M unsecured (14.9% of loans, far above industry norms) as of March 2026. Estimate scales the origination-per-member rate observed across this series (~4.8% of members annually) to 290,408 members; small-dollar express and credit-builder products push count above dollar-implied levels. Not an NCUA-reported figure.',
        estimated: true,
      },
    },
    market: {
      newHouseholdsPerYear: 9000,
      source:
        "Founders is a multiple common bond charter: 200+ select employer groups, immediate family, Clemson students, plus underserved-area additions covering Chester, Chesterfield, Lancaster, Laurens, and Union counties, census tracts in Cherokee, Spartanburg, and York counties (SC), and Mecklenburg County plus Gaston County tracts (NC). No FDIC Summary of Deposits equivalent exists for credit unions, so this is sized to the geographic components of the field of membership. Lancaster County added ~3,000 residents last year (fastest-growing in the Charlotte metro per Census estimates), and Mecklenburg County (Charlotte, 1.1M people, fully eligible) adds roughly 15,000+ residents a year; at 2.5 persons per household, a conservative reachable estimate nets to roughly 9,000 new households a year across the geographic FOM, before counting employer-group hiring.",
    },
    intro:
      "Founders Federal Credit Union is the institution the rest of this series gets compared to. South Carolina's largest credit union ($5.18B, 290,408 members, 2.5 members for every resident of its home county) runs a lend-deep model: one loan dollar in seven is unsecured, loan yield annualizes near 7.1%, the allowance sits at a heavy 2.0% of loans, and Q1 2026 ROA still annualized to roughly 1.29%, about double the industry run rate. Its stack is equally unusual: applications run on a first-party subdomain, digital banking is Q2, and its own technology CUSO sells Corelation KeyStone tooling to other credit unions. The model's exposed nerve is intake quality: every basis point of loss in a signature-lending book enters through an application, which is precisely where verification infrastructure earns its keep.",
    strategic: [
      {
        title: 'A 2% Reserve Model Lives or Dies at the Application',
        body: "Founders reserves $81.5M against its loan book (2.0% of loans, nearly triple what comparable credit unions in this series carry) because its model lends $605.8M unsecured to ordinary members and prices for the losses. That trade works exactly as long as intake quality holds: a signature loan approved on a misstated income or a synthetic identity has no collateral behind it. Verification-first intake (identity, income, and funding account confirmed at the point of application, from source data rather than borrower-typed fields) is not a member-experience upgrade for this model. It is loss-rate insurance on the exact product line that generates Founders' industry-leading 1.29% ROA.",
      },
      {
        title: 'The Rare First-Party Stack, Missing Its Verification Layer',
        body: "Founders already did what this series keeps recommending: account opening and lending run at apply.foundersfcu.com on its own subdomain, digital banking is Q2, and its FIT CUSO commercializes internal KeyStone tooling for other credit unions. An institution that builds and sells its own core tooling doesn't need a vendor to replace its front door; it needs the verification layer inside the flow it already owns. RAVEN slots under an existing first-party application as the data layer (identity, income, employment, funding account from source) which is also a natural fit for a CUSO-minded institution that prefers owning its machinery to renting someone else's.",
      },
      {
        title: '290,000 Members, 13% in Share Drafts: The Primary-Relationship Gap',
        body: 'Founders adds members at a pace the rest of the series can only envy (roughly 4,600 net in Q1 2026 alone) yet share drafts are just 13% of the $4.42B share base while certificates and money market run 64%. Even the best member-acquisition machine in South Carolina is buying much of its funding at rate. The cheapest fix is at loan intake: a borrower joining for an auto or express loan whose identity and funding account are already verified can open a share draft in the same flow, in seconds, converting rate-shoppers into primary members at the exact moment they have a reason to say yes.',
      },
    ],
    sources:
      "foundersfcu.com (auto-loans, personal-loans, express-loan, mortgage-loans, membership pages, reviewed August 2026); apply.foundersfcu.com (first-party account opening and lending subdomain) and mortgage.foundersfcu.com (mortgage application, vendor-powered on a Founders subdomain); Q2 external-link whitelist in foundersfcu.com page source and Q2 published customer story (info.q2.com); fitcuso.com (FIT CUSO, Founders Innovative Technology: KeyStone-specific products); NCUA 5300 aggregation via ncuso.org for charter #24063 (Mar 31, 2026: assets, loans, loan mix, shares, share mix, equity, members, branches, income statement); FFIEC HMDA data browser API, 2024, LEI 5493001AGQGPJ3N3YL33 (2,139 originations, $332.8M); WalletHub and foundersfcu.com membership eligibility; CUToday, CU Times, WRHI, and Tyfone news coverage of the 2025-2026 leadership transition; Home Textiles Today and SC Encyclopedia for Springs Industries history; USAFacts/Census for Lancaster County population. fdicCert field holds Founders' NCUA charter number, not an FDIC certificate; Founders is a federally insured credit union with no FDIC cert. Federal charter: no IRS Form 990 exists (unlike state-chartered credit unions).",
  },
  {
    slug: 'champions-first-credit-union',
    name: 'Champions First Credit Union',
    shortName: 'Champions First',
    articleSlug: 'champions-first-fsu-rebrand',
    articleTitle: 'The Credit Union Formerly Known as FSU',
    // NOTE: this field is named for the FDIC certificate a bank carries;
    // Champions First is a credit union with no FDIC cert. Populated with its
    // NCUA charter number (67874) instead until this field is generalized.
    // See `sources`.
    fdicCert: 67874,
    auditDate: 'August 2026',
    stats: [
      { label: 'Total assets', value: '$535.8M (Mar 2026)' },
      { label: 'Net worth ratio', value: '10.1% (Mar 2026)' },
      { label: 'Members', value: '32,930' },
      { label: 'Branch count', value: '9 across North Florida' },
    ],
    volumes: {
      mortgage: {
        count: 170,
        source:
          'Champions First does not appear on the 2023 or 2024 HMDA filer lists (verified against the FFIEC filer API), so no reported origination count exists. Real estate loans grew from $113.4M (2023) to $138.4M (2024) to $162.4M (Mar 2026) per the annual report and NCUA 5300 aggregation; estimate reflects roughly $25M/year of net real estate growth plus payoff replacement at North Florida loan sizes.',
        estimated: true,
      },
      commercial: {
        count: 30,
        source:
          'Champions First markets business loans but publishes no member-business-lending detail, and the Business Loans page carries no business-specific online application (it routes to the same generic MeridianLink consumer loan portal). Estimate reflects a $535M credit union with a small, relationship-driven commercial book.',
        estimated: true,
      },
      consumer: {
        count: 2400,
        source:
          'Auto is the volume product: roughly $42M of 2024 originations came through the iDrive CUSO indirect dealer channel alone (2024 annual report), which implies about 1,500 dealership-sourced loans at typical used-auto balances, before counting direct auto, personal, and credit rebuilder volume from $151M in total 2024 loan production. Not an NCUA-reported figure.',
        estimated: true,
      },
    },
    market: {
      newHouseholdsPerYear: 5500,
      source:
        "Champions First's state charter covers anyone who lives or works in 18 North Florida counties (roughly 1.6 million people per Census county estimates), the legal ceiling on who it can serve. No FDIC Summary of Deposits equivalent exists for credit unions, so this is sized to field of membership rather than a county deposit market. Census estimates show the western counties (Santa Rosa, Walton, Okaloosa, Escambia, Bay) among Florida's faster-growing, adding roughly 12,000-14,000 residents a year combined, with Leon County near flat and the rural eastern counties flat to shrinking; at 2.5 persons per household that nets to roughly 5,500 new households a year across the footprint.",
    },
    intro:
      "Champions First Credit Union spent six years assembling growth machinery: the GPCE Credit Union merger (2020), the FDOT Credit Union merger (2022), and the October 2024 retirement of the FSU Credit Union name in favor of a brand built for all 18 counties it can legally serve. Assets grew 34% to $535.8 million. Membership went from roughly 32,000 to 32,930. The gap between those two numbers is a funnel: every loan product hands applicants to MeridianLink's app.loanspq.com portal, account opening routes to a MeridianLink domain whose lender reference still reads 'Floridascu,' and the loan page's App Store link still points to an app named FSU Credit Union Mobility. Champions First is replatforming its digital banking in August 2026, which makes right now the moment the intake layer gets decided.",
    strategic: [
      {
        title: 'The Rebrand Reached the Signage. The Application Layer Still Says Floridascu.',
        body: "Champions First spent nearly three years researching its new name and celebrated it with ribbon cuttings in four counties. But a prospective member who clicks 'join' today is handed to app.consumer.meridianlink.com, a third-party domain whose URL still carries the FSU-era lender reference 'Floridascu,' and every loan product routes to MeridianLink's generic app.loanspq.com portal. The brand investment stops at exactly the moment a prospect decides whether to become a member. RAVEN's white-label intake keeps the entire join-and-apply experience on Champions First's own domain, with identity, income, and funding-account verification built into the flow instead of bolted on after the handoff.",
      },
      {
        title: 'Allowed 2,500 New Members a Year. Netting About 220.',
        body: "Florida's Office of Financial Regulation capped Champions First's 2018 western expansion at 2,500 new members a year, a ceiling the credit union has never approached: net membership growth since January 2022 is roughly 900 total, about 220 a year, across a field of membership of 1.6 million people growing as fast as anywhere in Florida. That is a conversion problem, not a demand problem. Verification-first account opening, where a new member proves identity and links a funding account in minutes instead of abandoning a third-party form, is the single highest-leverage fix for an institution whose penetration sits near 2% while comparable Southeast credit unions run near 9%.",
      },
      {
        title: 'Funding Costs Rose 49% Because New Members Did Not Show Up',
        body: 'Only 17% of Champions First shares sit in share drafts, the primary-relationship balances that come with new members. So 2024 growth was bought instead: dividends on shares jumped 49% to $8.0 million, net income fell 12%, and certificates plus money market now make up 54.5% of shares, money loyal to a rate rather than the institution. The indirect auto channel (roughly $42M through the iDrive CUSO in 2024) compounds this, because dealership-sourced borrowers are notoriously single-product. A digital front door that converts an indirect borrower into a verified, share-draft-holding primary member at the moment of loan intake attacks the cost-of-funds problem at its source.',
      },
    ],
    sources:
      "championsfirst.org (borrow/auto-loans, borrow/business-loans, borrow/mortgages, borrow/apply-for-a-loan, bank/open-an-account, exciting-2026-changes pages, reviewed August 2026); app.loanspq.com and app.consumer.meridianlink.com (application domains; lenderref 'Floridascu070816' observed August 2026); my.championsfirst.org (Jack Henry Banno online banking, fingerprinted August 2026); Champions First 2024 Annual Report (assets, loan mix, dividends, net income, iDrive CUSO volume, CDFI grant, Pensacola property); NCUA 5300 aggregation via ncuso.org for charter #67874 (Mar 31, 2026: assets, loans, shares, share mix, equity, members, branches); IRS Form 990 FY2024 via ProPublica Nonprofit Explorer (state-chartered 501(c)(14)); Florida OFR field-of-membership record (2018 seven-county expansion, 2,500 members/year condition); American Banker and cucentral.the-league.coop coverage of the FDOT CU merger (Jan 1, 2022) and GPCE CU merger (Oct 1, 2020); FFIEC HMDA filer lists 2023-2024 (absence verified); Census county population estimates for the 18-county field of membership. fdicCert field holds the NCUA charter number, not an FDIC certificate; Champions First is a federally insured credit union with no FDIC cert.",
  },
  {
    slug: 'rev-federal-credit-union',
    name: 'REV Federal Credit Union',
    shortName: 'REV',
    articleSlug: 'rev-credit-union-west-virginia-bet',
    articleTitle: "REV Federal Credit Union's 520-Mile Bet on West Virginia",
    // NOTE: this field is named for the FDIC certificate a bank carries; REV is
    // a credit union with no FDIC cert. Populated with REV's NCUA charter
    // number (9986) instead until this field is generalized. See `sources`.
    fdicCert: 9986,
    auditDate: 'August 2026',
    stats: [
      { label: 'Total assets', value: '$1.2B (net worth, not stock-issued)' },
      { label: 'Net worth ratio', value: '14.16% (Dec 2025)' },
      { label: 'Members', value: '67,000+' },
      { label: 'Branch count', value: '17 (plus 5 pending in WV)' },
    ],
    volumes: {
      mortgage: {
        count: 260,
        source:
          'REV\'s mortgage, HELOC, and land loans route through a third-party portal (mymortgage-online.com) rather than REV\'s own domain. No independently confirmed HMDA figure for this credit union: a same-named "Revity Federal Credit Union" (formerly Greensboro Municipal FCU, NC) creates a naming collision in public HMDA lookups that this estimate deliberately avoids relying on. Estimate derived from a $1.2B balance sheet at a typical credit-union residential-real-estate share of assets.',
        estimated: true,
      },
      commercial: {
        count: 90,
        source:
          'REV promoted its Director of Business Solutions to Vice President of Commercial Banking in 2025, signaling commercial as a growth priority, but commercial real estate has no online application (email-only) and REV does not publish NCUA 5300 category-level loan detail publicly. Estimate reflects a credit union of this size building a young commercial book.',
        estimated: true,
      },
      consumer: {
        count: 3200,
        source:
          'Auto, personal, and REVline (personal line of credit) are REV\'s highest-volume digitally-native products, all applied for at join.revfcu.com. Estimate reflects auto lending as the flagship product for a 67,000-member, $1.2B credit union; not an NCUA-reported figure.',
        estimated: true,
      },
    },
    market: {
      newHouseholdsPerYear: 7200,
      source:
        "REV's federal charter covers Berkeley, Charleston, Colleton, and Dorchester counties (SC), Brunswick and Columbus counties (NC), and Joint Base Charleston, a materially larger addressable area than a single county. No FDIC Summary of Deposits equivalent exists for credit unions, so this is sized to field of membership, the actual legal ceiling on who REV can serve, rather than a county deposit market. The Charleston Regional Development Alliance estimates the Berkeley-Charleston-Dorchester tri-county area (the bulk of REV's SC footprint) adds roughly 17,500 residents/year, about 7,000 households at 2.5 persons/household; Colleton County and the two North Carolina counties add modest additional growth, netting to roughly 7,200/year.",
    },
    intro:
      "REV Federal Credit Union is buying a bank 520 miles outside its own field of membership: First Neighborhood Bank in Spencer, West Virginia, the first-ever credit union purchase of a bank in that state's history. REV brings real strengths to that expansion. Net worth sits at 14.16% of assets, more than double the 7% regulatory floor, funded entirely from retained member dividends since credit unions cannot issue stock. What it does not yet bring is a consistent digital front door: auto, personal, and REVline loans apply directly on REV's own domain, but mortgage and commercial lending each hand off to a different third-party portal, and commercial real estate has no online path at all. That gap is a member-experience problem today. It becomes a member-acquisition problem the moment REV starts serving members two states away with no nearby branch.",
    strategic: [
      {
        title: 'Three Lending Portals for One Credit Union, Right Before the Member Base Spreads Across Two States',
        body: "A REV member financing a car applies at join.revfcu.com. The same member applying for a mortgage lands on revfcu3333.mymortgage-online.com, a different domain with a different look. Commercial term loans route through a third portal, revfcu.onlineportalnow.com. None of this matters much when every member lives within a short drive of a branch. It matters considerably more once REV is verifying members in Roane County, West Virginia, where the nearest REV branch is 500-plus miles away and every one of those handoffs becomes a place a member can get lost or give up. RAVEN's single verification layer works identically across every product REV offers, which turns three inconsistent systems into one experience regardless of which state a member is applying from.",
      },
      {
        title: 'Commercial Lending Is REV\'s Newest Priority and Its Least Digital Product',
        body: 'REV elevated its Director of Business Solutions to Vice President of Commercial Banking in 2025, a clear signal that commercial lending is where REV wants to grow next. Commercial real estate borrowers currently get an email address, businesssolutions@revfcu.com, and the business credit card requires a branch visit. Roane County, West Virginia is a rural, commercial-dependent county with 11% unemployment and no REV branch presence at all. Verifying a small-business borrower\'s income, entity documents, and guarantor financials by email across a time zone and 500 miles is exactly the kind of manual process that RAVEN\'s automated intake replaces, at the moment REV needs it most.',
      },
      {
        title: 'REV Is Already Building the Fix. The Question Is Whether It Builds Three of Them or One.',
        body: 'REV relaunched its digital banking platform over the past year and has an in-house loan origination and application system targeted for a 2026 launch, its own admission that the current patchwork needs replacing. That build-not-buy instinct is the right one for an institution that wants to control the member experience end to end. The risk is building a single new system that still has to reconcile data from three legacy vendor relationships (the consumer portal, the mortgage Mortgagebot-style platform, and the commercial portal) behind the scenes. RAVEN sits underneath a build like that as the verification layer, so REV\'s new front door captures identity, income, and asset data the same way for a Charleston auto loan and a West Virginia mortgage, instead of inheriting three different data shapes from three legacy systems.',
      },
    ],
    sources:
      'revfcu.com (auto-loans, business-lending, mortgage-rates, digital-banking, open-membership pages, reviewed August 2026); join.revfcu.com, revfcu3333.mymortgage-online.com, and revfcu.onlineportalnow.com (REV\'s three lending application domains); NCUA charter #9986 via bestcashcow.com and ncuso.org call-report aggregation (net worth, net worth ratio, non-current loans, loan loss reserves, Texas ratio; Dec 2025); revfcu.com press release "South Carolina CU Expands With Planned Bank Acquisition in West Virginia"; S&P Global Market Intelligence and CUToday.info coverage of the First Neighborhood Bank acquisition (approved May 27, 2026); Charleston Regional Development Alliance population data; Census QuickFacts Berkeley/Charleston/Colleton/Dorchester Counties SC; e-WV / Roane County WV economic data. fdicCert field holds REV\'s NCUA charter number, not an FDIC certificate; REV is a federally insured credit union with no FDIC cert.',
  },
  {
    slug: 'palmetto-citizens-federal-credit-union',
    name: 'Palmetto Citizens Federal Credit Union',
    shortName: 'Palmetto Citizens',
    articleSlug: 'palmetto-citizens-90-year-wait',
    articleTitle: 'Palmetto Citizens Could Have Opened in Georgia Decades Ago. It Took 90 Years.',
    // NOTE: this field is named for the FDIC certificate a bank carries; Palmetto
    // Citizens is a credit union with no FDIC cert. Populated with its NCUA
    // charter number (1472) instead until this field is generalized. See `sources`.
    fdicCert: 1472,
    auditDate: 'August 2026',
    stats: [
      { label: 'Total assets', value: '$1.44B' },
      { label: 'Net worth ratio', value: '13.34%' },
      { label: 'Members', value: '85,933' },
      { label: 'Branch count', value: '14 SC (plus 4 new in Georgia)' },
    ],
    volumes: {
      mortgage: {
        count: 310,
        source:
          'Palmetto Citizens consolidates vehicle, mortgage, home equity, and credit card applications into one first-party flow (applynow.palmettocitizens.org) but does not publish category-level NCUA 5300 loan detail publicly. Estimate derived from Chief Lending Officer Robert Terrell\'s disclosed ~$734M loan portfolio at a typical credit-union residential-real-estate share of the book.',
        estimated: true,
      },
      commercial: {
        count: 60,
        source:
          'All five Palmetto Citizens business loan categories (lines of credit, term loans, commercial real estate, SBA 7(a), nonprofit lending) require phone, Help Desk, or branch contact with no online application. Estimate reflects a CDFI-certified Midlands credit union with a modest, largely relationship-driven commercial book; not an NCUA-reported figure.',
        estimated: true,
      },
      consumer: {
        count: 4100,
        source:
          'Vehicle loans and personal loans are Palmetto Citizens\' highest-volume digitally-native products via the applynow.palmettocitizens.org flow. Estimate reflects an 85,933-member, $1.44B credit union with vehicle lending as a flagship product ("no payments for up to 90 days" marketing); not an NCUA-reported figure.',
        estimated: true,
      },
    },
    market: {
      newHouseholdsPerYear: 3600,
      source:
        "Palmetto Citizens' federal charter covers eight South Carolina Midlands counties (Calhoun, Fairfield, Kershaw, Lexington, Newberry, Orangeburg, Richland, Saluda), plus an associational partnership with the Carolina Consumer Council already open to SC, NC, GA, TN, and VA residents, a materially larger addressable area than a single county. No FDIC Summary of Deposits equivalent exists for credit unions, so this is sized to field of membership rather than a county deposit market. Census data shows Richland County added roughly 4,100 residents and Lexington County roughly 3,500 in the most recent year (about 3,000 households at 2.5 persons/household); the other six Midlands counties are slower-growing or flat, netting to roughly 3,600 households/year across the core SC footprint. The four new Georgia counties are flat to shrinking and are not counted toward this figure.",
    },
    intro:
      "Palmetto Citizens Federal Credit Union closed its first expansion outside South Carolina in 90 years on August 1, 2026, four former Southern Bank branches in rural Georgia, even though its charter's associational membership option had already made Georgia residents eligible to join for years. What it brings to that expansion is a genuinely solid consumer lending experience: vehicle loans, mortgages, home equity, and credit cards all apply through one consolidated first-party flow. What it doesn't bring is any digital path for business lending. All five commercial loan categories, including the SBA 7(a) program that is the natural fit for a CDFI-certified lender entering high-poverty Georgia counties, require a phone call, a Help Desk message, or a branch visit.",
    strategic: [
      {
        title: 'Consumer Lending Proves Palmetto Citizens Can Build This. Business Lending Proves It Hasn\'t.',
        body: "Vehicle loans, mortgages, home equity, and credit cards all run through one first-party application flow on Tyfone's nFinia platform, a genuinely better setup than most of the community banks and credit unions in this series. That makes the complete absence of an online application for any of the five business loan categories, lines of credit, term loans, commercial real estate, SBA 7(a), and nonprofit lending, harder to explain as a resourcing problem and easier to read as a sequencing one. RAVEN's verification layer plugs into an existing consumer flow like this one directly, which means extending the same automated identity, income, and financial verification to business borrowers is an extension of infrastructure Palmetto Citizens already runs, not a new build.",
      },
      {
        title: 'A CDFI-Certified Lender Just Inherited the Market Its Mission Was Built For, With No Digital Path to Serve It',
        body: 'Palmetto Citizens earned CDFI certification in 2023 specifically to serve low-income and underserved communities. Waynesboro, Georgia, the largest of its four new branch towns, carries a 26% poverty rate and a median household income of $41,620. SBA 7(a) lending, guaranteed in part by the federal government to expand small-business credit in exactly these markets, is the product built for this moment, and it has zero online application. A small-business owner in Gibson or Sardis, Georgia now has to drive to a branch or call a Help Desk for a loan program designed to reach borrowers like them. RAVEN\'s automated income, entity, and identity verification removes that distance requirement entirely.',
      },
      {
        title: 'New Membership and Lending Run on Two Different Systems That Happen to Sit Next to Each Other',
        body: "New membership applications route through MeridianLink, a real, purpose-built account-opening platform, while lending runs through Palmetto Citizens' own applynow.palmettocitizens.org flow on Tyfone. That's a smaller gap than a legacy third-party handoff, but it's still two systems instead of one. A new Georgia member who joins through MeridianLink and then wants a business loan starts over in a completely different flow. RAVEN sits underneath both as a single verification layer, so a member's identity and financial data verified at account opening doesn't have to be re-collected the moment they apply for credit.",
      },
    ],
    sources:
      'palmettocitizens.org (loan/, business/loans/, personal/vehicles/, personal/mortgage/, personal/homeequity/ pages, reviewed August 2026); applynow.palmettocitizens.org and app.consumer.meridianlink.com (application domains); fintechfutures.com coverage of the Tyfone nFinia digital banking platform adoption; NCUA charter #1472 via bestcashcow.com and ncuso.org call-report aggregation (assets, net worth, net worth ratio); palmettocitizens.org CDFI certification press release (April 2023) and CUInsight coverage; cutoday.info, coladaily.com, and Yahoo Finance coverage of the Southern Bank Georgia branch acquisition (announced November 2025, closed August 1, 2026, serving customers August 3, 2026); Census QuickFacts and worldpopulationreview.com for Burke, Glascock, and Richmond County GA and the eight South Carolina Midlands counties; theorg.com and Columbia Business Monthly for Palmetto Citizens leadership (CEO Robert Dozier, CFO Elizabeth Bunn, CLO Robert Terrell). fdicCert field holds Palmetto Citizens\' NCUA charter number, not an FDIC certificate; Palmetto Citizens is a federally insured credit union with no FDIC cert.',
  },
  {
    slug: 'uwharrie-bank',
    name: 'Uwharrie Bank',
    shortName: 'Uwharrie',
    fdicCert: 24919,
    auditDate: 'August 2026',
    stats: [
      { label: 'Total assets', value: '$1.25B' },
      { label: 'Branches', value: '10, Stanly/Cabarrus/Anson/Mecklenburg, NC' },
      { label: 'ROA', value: '1.14%' },
      { label: 'Online lending channels', value: '4 of 6' },
    ],
    volumes: {
      mortgage: { count: 220, source: 'Estimated from the 10-office Stanly County footprint', estimated: true },
      commercial: { count: 110, source: 'Estimated from FDIC call-report loan mix', estimated: true },
      consumer: { count: 70, source: 'Estimated from the 10-office footprint', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 800,
      source: 'Estimated from Census population growth in Stanly and Cabarrus counties, NC (Cabarrus County, adjacent to Charlotte, is the faster-growing of the two); not a bank-specific figure.',
    },
    intro:
      "Uwharrie Bank is the only commercial bank headquartered in Stanly County, NC, with loan-production offices reaching into Cabarrus and Mecklenburg counties toward Charlotte. The bank already runs real online application portals for mortgage, auto, personal loans, and deposit account opening. HELOC and business lending are the two exceptions: both dead-end at a contact form.",
    strategic: [
      {
        title: 'Two specific gaps in an otherwise solid stack',
        body: "Uwharrie already invested in self-serve infrastructure: a mortgage application portal (Home Hub), a loan portal for auto and personal loans, and a Fivision-hosted deposit account opening flow. HELOC and business lending are the exceptions, both routing to a pre-filled contact form instead of an application. Closing those two gaps completes a stack the bank has mostly already built.",
      },
      {
        title: 'Charlotte-adjacent branches face Charlotte-level digital competition',
        body: 'The loan-production offices reaching into Cabarrus and Mecklenburg counties put a portion of Uwharrie\'s pipeline in direct competition with national digital lenders on speed, even though the core franchise remains a rural, single-county bank by charter.',
      },
      {
        title: 'A 10-branch operation has little room for manual drag',
        body: 'At this scale, a few hours of manual document-chasing per file is a meaningful share of loan-ops capacity. Automated verification recovers that time without adding staff.',
      },
    ],
    sources:
      'uwharrie.com (personal-banking/mortgages, personal-banking/loans, business-banking/loans pages, reviewed August 2026); mymortgage.uwharrie.com, uwharrie.loanwebcenter.com, forms.fivision.com/uwharrie (application portal domains); FDIC BankFind cert #24919. Brand colors (#5C8118, #594A25) pulled from inline site styles, not an official brand guide.',
  },
  {
    slug: 'wilson-bank-and-trust',
    name: 'Wilson Bank and Trust',
    shortName: 'Wilson Bank',
    fdicCert: 26962,
    auditDate: 'August 2026',
    stats: [
      { label: 'Total assets', value: '$5.99B' },
      { label: 'Branches', value: '32, greater Nashville exurban ring, TN' },
      { label: 'ROA', value: '1.52%' },
      { label: 'Online lending channels', value: '5 of 6, on 3 different vendor portals' },
    ],
    volumes: {
      mortgage: { count: 1400, source: 'Estimated from the 32-branch, nine-county footprint', estimated: true },
      commercial: { count: 600, source: 'Estimated from FDIC call-report loan mix', estimated: true },
      consumer: { count: 300, source: 'Estimated from the 32-branch footprint', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 3000,
      source: 'Estimated from Census population growth across Wilson, Rutherford, Sumner, and Williamson counties, TN, among the fastest-growing counties in the Nashville MSA; not a bank-specific figure.',
    },
    intro:
      'Wilson Bank and Trust grew from a single 1987 de novo charter into a $6B, 32-branch bank across the counties ringing Nashville, largely through acquiring smaller local banks. Mortgage, auto, personal loans, HELOC, and deposit account opening all have real online applications today, but they run on three separate vendor portals (MortgageWebCenter, LoanWebCenter, and a dedicated openaccounts subdomain). Business lending has no online application at all.',
    strategic: [
      {
        title: 'Fragmentation, not absence, is the gap here',
        body: "Unlike most banks in this series, Wilson Bank already offers real self-serve applications across nearly every consumer lending line. The problem is that a borrower bounces between three different vendor portals, on three different domains, depending on which product they want. RAVEN's value here is consolidation into one verified flow, not adding capability that doesn't exist.",
      },
      {
        title: 'Business lending is the one channel with no digital path',
        body: 'Every other consumer lending line has an apply button. Business and commercial loans route only to a branch relationship manager. For a bank that grew by acquiring local community banks with strong commercial relationships, digitizing verification for that line is the one piece still missing.',
      },
      {
        title: 'A bank built by acquisition inherited a bank built by acquisition\'s verification habits',
        body: 'Each acquired community bank (DeKalb Community Bank, Community Bank of Smith County, among others) likely brought its own document-collection habits before consolidating onto the current three-portal setup. One standardized borrower session replaces that patchwork for good, across all 32 branches.',
      },
    ],
    sources:
      'wilsonbank.com (loans/home-loans, loans/vehicle, loans/personal, loans/home-equity-line-of-credit, loans/business-loans pages, reviewed August 2026); centralized-wilsonbanktn.mortgagewebcenter.com, wilsonbank.loanwebcenter.com, openaccounts.wilsonbank.com (application portal domains); treasury.jackhenry.com/wilsonbank (Treasury Management, indicating a Jack Henry relationship); FDIC BankFind cert #26962.',
  },
  {
    slug: 'cogent-bank',
    name: 'Cogent Bank',
    shortName: 'Cogent',
    fdicCert: 34908,
    auditDate: 'August 2026',
    stats: [
      { label: 'Total assets', value: '$2.45B' },
      { label: 'Branches', value: '10, Central & South Florida' },
      { label: 'ROE', value: '23.04%' },
      { label: 'Online lending channels', value: '0 of 5' },
    ],
    volumes: {
      mortgage: { count: 150, source: 'Estimated; Cogent is not primarily a retail mortgage lender', estimated: true },
      commercial: { count: 500, source: 'Estimated, weighted toward the Specialty Lending Group\'s deal flow', estimated: true },
      consumer: { count: 100, source: 'Estimated from the 10-branch Central/South Florida footprint', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 1000,
      source: 'Estimated from Central Florida population growth trends; Cogent\'s footprint and business mix are commercial-lending-weighted, so this is a smaller retail-intake estimate than a comparably-sized retail bank.',
    },
    intro:
      "Cogent Bank runs a Specialty Lending Group that doubled loan commitments from $100M to $200M in a single year and holds SBA Preferred Lender status across three federal programs. None of it has an online application. Mortgage, specialty lending, SBA, personal, and business lending all end at a phone call or a named specialist's contact info, and the site's 'open an account' form is a scheduling request, not a self-serve application.",
    strategic: [
      {
        title: 'A fast-growing specialty lender with no fast digital front door',
        body: "The Specialty Lending Group's growth (asset-based lending, lender finance, recurring-revenue lending) depends on speed to compete for $1M-$15M deals. Every one of those deals starts with a phone call today. Automated identity, income, and asset verification lets underwriters spend their time on the specialty-credit analysis that actually differentiates the deal, instead of the document chase before it.",
      },
      {
        title: 'SBA Preferred Lender status rewards the lender who closes fastest',
        body: 'SBA brokers route deals to whichever Preferred Lender can close quickest. Cogent\'s SBA page lists four named specialists and a phone number; there is no application to start a file before that first call happens.',
      },
      {
        title: 'The account-opening form isn\'t actually an application',
        body: 'Cogent\'s "Open a New Personal Account" page collects contact info and an appointment preference, then promises a callback within one business day. There is no identity verification or funding step online, for either personal or business accounts.',
      },
    ],
    sources:
      'cogentbank.com (personal/, business/, sba-lending/, open-a-new-personal-account/ pages, reviewed August 2026); FDIC BankFind cert #34908. Digital banking login vendor observed at a white-label "Flex" domain; not positively identified as a named core provider.',
  },
  {
    slug: 'chesapeake-bank',
    name: 'Chesapeake Bank',
    shortName: 'Chesapeake',
    fdicCert: 6862,
    auditDate: 'August 2026',
    stats: [
      { label: 'Total assets', value: '$1.72B' },
      { label: 'Branches', value: '19, Northern Neck & Middle Peninsula, VA' },
      { label: 'ROA', value: '1.49%' },
      { label: 'Online lending channels', value: '1 of 5 (mortgage only)' },
    ],
    volumes: {
      mortgage: { count: 500, source: 'Estimated from the 19-branch Chesapeake Bay footprint', estimated: true },
      commercial: { count: 250, source: 'Estimated from FDIC call-report loan mix', estimated: true },
      consumer: { count: 150, source: 'Estimated; no dedicated auto loan product was found, and HELOC/personal are contact-only', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 600,
      source: 'Estimated from Census population trends in Virginia\'s Northern Neck and Middle Peninsula, a slower-growing, second-home-heavy market; not a bank-specific figure.',
    },
    intro:
      "Chesapeake Bank runs Chesapeake Payment Systems, a 30-year-old merchant-payments subsidiary that recently partnered with fintech Silverflow, real sophistication in financial infrastructure. That sophistication hasn't reached borrower-facing lending: only mortgage has a real online application. Personal loans and business lending are contact-only, no dedicated auto loan product was found on the site, and one of the bank's three checking products is branch-only while the other two open online.",
    strategic: [
      {
        title: 'A bank that already backs fintech partnerships understands this ROI case',
        body: "Chesapeake Payment Systems' Silverflow partnership shows this bank invests in modern financial infrastructure when the case is clear. Verification automation is the same logic, applied to the lending side of the house instead of the payments side.",
      },
      {
        title: 'Business lending routes through a generic form',
        body: "Business loan inquiries go to a Microsoft Forms link and a phone number, a plain front door for a bank that runs its own payments-processing subsidiary and clearly has the technical sophistication to do better.",
      },
      {
        title: 'The newest customers face the most friction',
        body: 'Two of three checking products (Essential and Prosper) open online through a Salesforce self-registration portal. The entry-level Pathway Checking product, the one a first-time or credit-building customer is most likely to choose, is branch-only.',
      },
    ],
    sources:
      'ches.bank (personal/lending/home-loans, personal/lending/personal-loans, business/business-lending/business-loans, personal/personal-checking pages, reviewed August 2026); chesbank2.mortgagewebcenter.com, chesapeakebank.my.site.com (application portal domains); FDIC BankFind cert #6862. Brand colors (#002D5B, #E16B43) pulled directly from live site CSS.',
  },
  {
    slug: 'bankplus',
    name: 'BankPlus',
    shortName: 'BankPlus',
    fdicCert: 5903,
    auditDate: 'August 2026',
    stats: [
      { label: 'Total assets', value: '$8.28B' },
      { label: 'Branches', value: '75, Mississippi, Alabama & Louisiana' },
      { label: 'ROA', value: '1.40%' },
      { label: 'Online lending channels', value: '1 of 6 (mortgage only)' },
    ],
    volumes: {
      mortgage: { count: 1800, source: 'Estimated from the 75-branch, three-state footprint', estimated: true },
      commercial: { count: 1200, source: 'Estimated from FDIC call-report loan mix', estimated: true },
      consumer: { count: 500, source: 'Estimated from the 75-branch footprint', estimated: true },
    },
    market: {
      newHouseholdsPerYear: 2500,
      source: 'Estimated from Census population trends across BankPlus\' Mississippi, Alabama, and Louisiana footprint; not a bank-specific figure.',
    },
    intro:
      "BankPlus has made American Banker's 'Best Banks to Work For' list for nine consecutive years, one of only seven U.S. banks with that full streak, real evidence of investment in staff experience. The borrower-facing digital experience hasn't kept pace: of six lending lines (mortgage, auto, personal, HELOC, business, and wealth management access), only mortgage has a real online application. The remaining five all route to 'meet with a banker' or a branch locator, and the deposit-account-opening link found on multiple pages did not load correctly when tested.",
    strategic: [
      {
        title: 'Nine years of "Best Banks to Work For" is worth extending to borrowers',
        body: "A bank that consistently invests in staff experience has the same incentive to modernize the borrower-facing side of lending. Right now that investment hasn't reached the loan application, where auto, personal, HELOC, and business borrowers all get the same instruction: visit a branch.",
      },
      {
        title: 'At 75 branches, an $8.3B bank still has a phone-call front door',
        body: 'Scale doesn\'t eliminate the labor problem, it multiplies it across 75 branches and their loan officers. Automating verification protects margin as growth (including the 2021 First Trust Corporation acquisition) continues to add branches and files.',
      },
      {
        title: 'The account-opening link needs a direct check',
        body: 'Multiple deposit-product pages link to an "Open an Account" portal that returned an error page when tested directly. If that\'s broken for real customers too, and not just an artifact of how it was tested, there may currently be no working self-serve path into the bank at all outside a mortgage refinance.',
      },
    ],
    sources:
      'bankplus.net (personal/borrow/home-mortgages, personal/borrow/auto-loans, personal/borrow/personal-loan, personal/borrow/home-equity-line, business/borrow/business-loans, wealth-management/services pages, reviewed August 2026); bankplus.mymortgage-online.com (mortgage application portal); apply.bankplus.net (deposit account link tested, returned an error page); FDIC BankFind cert #5903.',
  },
];

export function getRoiBank(slug: string): BankRoiInput | undefined {
  return ROI_BANKS.find((b) => b.slug === slug);
}
