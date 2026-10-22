// Shared blog index data: used by the blog index page and by article pages
// for related-article cross-linking.

export type ArticleCategory = 'bank' | 'fintech' | 'guide' | 'platform' | 'denovo' | 'creditunion';

export interface Article {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  date: string;
  category: ArticleCategory;
  auditSlug?: string;
  featured?: true;
}

export const articles: Article[] = [
  {
    slug: 'best-digital-account-opening-software-community-banks',
    title: 'Best Digital Account Opening Software for Community Banks (2026)',
    description:
      'An honest comparison of digital account opening platforms for community banks: MANTL (Alkami, $40 billion in deposits raised), Narmi, Apiture (now CSI), core-attached options from Jack Henry and Fiserv, and verification-first intake. Written by a vendor, with the disclosure.',
    readTime: '6 min read',
    date: 'October 2026',
    category: 'guide',
  },
  {
    slug: 'the-work-number-alternatives-community-banks',
    title: 'The Work Number Alternatives for Community Banks (2026)',
    description:
      'Equifax raised The Work Number’s prices again in January 2026, and one mortgage with two borrowers can cost $280 to verify. A community bank buyer’s guide to the alternatives: Truework (now Checkr), Truv, Argyle, Experian Verify after Workday, and the verbal VOE.',
    readTime: '6 min read',
    date: 'October 2026',
    category: 'guide',
  },
  {
    slug: 'robins-financial-20-million-rebate',
    title: "The Credit Union That Can't Spend Its Money Fast Enough",
    description:
      'Robins Financial runs a 17% net worth ratio, earns two and a half times the industry ROA, and still handed members $20 million in December, $151 million since 2017. Inside the inverted capital problem of middle Georgia’s giant.',
    readTime: '6 min read',
    date: 'August 2026',
    category: 'creditunion',
    auditSlug: 'robins-financial-credit-union',
  },
  {
    slug: 'founders-credit-union-mill-town',
    title: "The Mill Closed. The Credit Union Didn't.",
    description:
      "Springs Mills left South Carolina in 2007. The credit union its workers founded in 1950 now holds $5.18 billion, serves 2.5 members for every resident of its home county, and just lived through a succession reversal you'd need an 8-K to see at a bank.",
    readTime: '6 min read',
    date: 'August 2026',
    category: 'creditunion',
    auditSlug: 'founders-federal-credit-union',
  },
  {
    slug: 'champions-first-fsu-rebrand',
    title: 'The Credit Union Formerly Known as FSU',
    description:
      "Champions First Credit Union grew assets 34% since 2022 through two mergers and a rebrand. It added roughly 900 members. Inside a $535 million Tallahassee credit union whose new name still hasn't reached its application layer.",
    readTime: '6 min read',
    date: 'August 2026',
    category: 'creditunion',
    auditSlug: 'champions-first-credit-union',
  },
  {
    slug: 'palmetto-citizens-90-year-wait',
    title: 'Palmetto Citizens Could Have Opened in Georgia Decades Ago. It Took 90 Years.',
    description:
      "Palmetto Citizens Federal Credit Union's own charter has let Georgia residents join for years. It still took a struggling bank's branch sale, and the same Sardis, Georgia institution RAVEN already profiled, to actually show up there.",
    readTime: '6 min read',
    date: 'August 2026',
    category: 'creditunion',
    auditSlug: 'palmetto-citizens-federal-credit-union',
  },
  {
    slug: 'rev-credit-union-west-virginia-bet',
    title: "REV Federal Credit Union's 520-Mile Bet on West Virginia",
    description:
      "A Charleston-area credit union bought a bank two states away, the first-ever credit union purchase of a bank in West Virginia history. Its home turf is 520 miles away.",
    readTime: '6 min read',
    date: 'August 2026',
    category: 'creditunion',
    auditSlug: 'rev-federal-credit-union',
  },
  {
    slug: 'optimumbank-98-percent-cre-growth',
    title: 'The 98.7% Bank',
    description:
      'OptimumBank added $432.5 million in loans over twelve months and $427.0 million of it was commercial real estate. A 2.04% ROA, a 48.78% efficiency ratio, and a concentration ratio north of 600% of capital, all in the same quarter.',
    readTime: '6 min read',
    date: 'July 2026',
    category: 'bank',
    auditSlug: 'optimumbank',
  },
  {
    slug: 'huntington-bank-southeast-expansion',
    title: 'The $284 Billion Bank Down the Street',
    description:
      "Huntington's average deposits rose $18.8B in one quarter, absorbed the Gulf South's biggest homegrown bank, and is building 55 branches across the Carolinas. What the super-regional march south means for the community banks already there.",
    readTime: '6 min read',
    date: 'July 2026',
    category: 'bank',
  },
  {
    slug: 'southern-bank-spartanburg-side-door',
    title: "South Carolina's Newest Bank Is 81 Years Old",
    description:
      "On April 14, 2026, Southern Bank moved its headquarters to Spartanburg on a charter issued in 1945. The recapitalization that took a $93M Sardis, Georgia bank to $400M across South Carolina's growth markets, through the de novo process's side door.",
    readTime: '6 min read',
    date: 'July 2026',
    category: 'bank',
  },
  {
    slug: 'south-carolina-de-novo-drought',
    title: 'No One Starts Banks in South Carolina Anymore',
    description:
      'South Carolina chartered 56 banks in the 15 years before 2010 and one in the 16 years since. Thirteen charters have retired since 2018, in the fastest-growing state in America. The de novo drought, in FDIC data.',
    readTime: '6 min read',
    date: 'July 2026',
    category: 'guide',
  },
  {
    slug: 'portrait-bank-winter-park-de-novo',
    title: 'Portrait Bank: The $43M Bet That Orlando Wants Its Hometown Bank Back',
    description:
      "Central Florida's last de novo grew to $827M and got absorbed by a Michigan credit union. Eight months later, Portrait Bank chartered in the same city with $43M from 256 local investors and 'agentic AI' in its press release.",
    readTime: '6 min read',
    date: 'July 2026',
    category: 'denovo',
  },
  {
    slug: 'glades-bank-broward-de-novo',
    title: 'Glades Bank and Trust: A $45M Filing for the County the Banks Left Behind',
    description:
      "The five banks still headquartered in Broward County hold 2.4% of its $69.7B in deposits. A group led by the ex-Amerant executive who digitized Florida's largest community bank just filed to build a new one.",
    readTime: '6 min read',
    date: 'July 2026',
    category: 'denovo',
  },
  {
    slug: 'first-party-fraud-community-banks',
    title: 'First-Party Fraud: The Applicant Is Real. The Application Isn’t.',
    description:
      'First-party fraud jumped from 15% to 36% of all reported fraud in one year and now leads every category globally. Your KYC program can’t see it, because the identity checks out. Here is what catches it.',
    readTime: '6 min read',
    date: 'July 2026',
    category: 'guide',
  },
  {
    slug: 'account-opening-fraud-prevention',
    title: 'Preventing Fraud at Account Opening Without Killing the Channel',
    description:
      'Banks that turned off online account opening after a fraud wave diagnosed the wrong problem. A walkthrough of verification-first account opening: what runs, in what order, and what it catches.',
    readTime: '6 min read',
    date: 'July 2026',
    category: 'guide',
  },
  {
    slug: 'suspect-fraud-cant-prove-it',
    title: 'You Suspect Fraud. You Can’t Prove It. Now What?',
    description:
      'Every BSA officer knows the file: strong suspicion, thin evidence. The standards for SARs and account closure are lower than you think, and the evidence problem is solvable, mostly at onboarding.',
    readTime: '5 min read',
    date: 'July 2026',
    category: 'guide',
  },
  {
    slug: 'how-to-start-a-bank',
    title: 'How to Start a Bank: The De Novo Playbook',
    description:
      '31 charter applications were filed in 2025. Four banks actually opened. What it really takes to start a de novo bank: the capital math, the 18-to-24-month timeline, the three-year supervision period, and the stack you build before day one.',
    readTime: '6 min read',
    date: 'July 2026',
    category: 'guide',
  },
  {
    slug: 'de-novo-bank-day-one-fraud-program',
    title: 'The De Novo Bank’s Day-One Fraud Program',
    description:
      'A new bank’s first exam tests whether the fraud program in its business plan actually exists. Why document-based intake fails that test, and what a source-verified day-one program looks like.',
    readTime: '5 min read',
    date: 'July 2026',
    category: 'guide',
  },
  {
    slug: 'one-in-116-mortgage-fraud',
    title: 'One in 116 Mortgage Applications Is Lying to You',
    description:
      'Cotality data shows 1 in 116 mortgage applications carries indications of material misrepresentation, and income fraud leads Fannie Mae findings at 46%. The VOE phone call your bank relies on is the exact attack surface fraud rings are built around.',
    readTime: '6 min read',
    date: 'July 2026',
    category: 'guide',
  },
  {
    slug: 'jack-henry-symitar-loan-origination',
    title: 'Digital Lending on Jack Henry: What SilverLake and Symitar Actually Support',
    description:
      "SilverLake runs at more than 500 banks and Symitar at more than 700 credit unions, but neither core is a loan origination system. What Jack Henry sells for lending today, what its forthcoming Jack Henry Origination changes, and what to ask any vendor before you buy.",
    readTime: '5 min read',
    date: 'October 2026',
    category: 'platform',
  },
  {
    slug: 'fiserv-premier-digital-lending',
    title: 'Digital Lending on Fiserv in 2026: What Premier, Precision and Portico Support',
    description:
      "Fiserv changed CEOs and cut guidance, but it says it is not consolidating its cores. None of Premier, Precision or Portico ships with a digital loan application. How Communicator Open, the AppMarket and Loan Director fit together, and where the Portico gap is.",
    readTime: '5 min read',
    date: 'October 2026',
    category: 'platform',
  },
  {
    slug: 'first-reliance-sells-at-the-top',
    title: 'First Reliance Spent 27 Years Building a Bank. Then It Sold at the Top.',
    description:
      'First Reliance Bancshares just posted record growth, then agreed to sell to Colony Bankcorp for $163 million. Why a winning $1 billion bank chose to partner up, and what the four-state, $5 billion result says about Southeast consolidation.',
    readTime: '6 min read',
    date: 'June 2026',
    category: 'bank',
  },
  {
    slug: 'community-bank-ai-lending-guide',
    title: 'How Community Banks Can Use AI in Lending Without the Risk',
    description:
      'Bank generative AI adoption tripled going into 2026, and in April regulators replaced SR 11-7 with new model risk guidance that leaves generative AI out of scope. What the rules now say, where AI fits in lending, and how to stay out of exam findings.',
    readTime: '6 min read',
    date: 'October 2026',
    category: 'guide',
  },
  {
    slug: 'white-label-borrower-portal-community-bank',
    title: 'The White-Label Borrower Portal: What It Is and Why Community Banks Need One',
    description:
      'Only 24% of small banks took small business loan applications through an online portal in the FDIC\'s latest survey, and just 6% of banks ran the whole process online. What a white-label borrower portal is, when it pays off, and how to evaluate one.',
    readTime: '5 min read',
    date: 'October 2026',
    category: 'platform',
  },
  {
    slug: 'digital-account-opening-community-bank',
    title: 'Digital Account Opening for Community Banks: The Deposit Side of the Gap',
    description:
      'Neobanks captured 44% of new checking accounts in 2024. Community banks opened only 16% of their new accounts digitally. Here is what top-performing platforms do differently and what closing this gap is worth.',
    readTime: '6 min read',
    date: 'June 2026',
    category: 'guide',
  },
  {
    slug: 'open-banking-community-bank-guide',
    title: 'Open Banking for Community Banks: What Plaid, Fiserv, and Jack Henry Actually Support',
    description:
      'Section 1033 is enjoined and being rewritten, with data access fees back on the table. Open banking is already live at community banks anyway. What Plaid, Fiserv and Jack Henry actually offer, and where it pays off now.',
    readTime: '6 min read',
    date: 'October 2026',
    category: 'platform',
  },
  {
    slug: 'fintech-grade-loan-application-community-bank',
    title: 'How to Offer a Fintech-Grade Loan Application as a Community Bank',
    description:
      "The banking industry's average loan application conversion rate is 3%. Here is how fintechs get it to 80%, and how community banks can copy the playbook without replacing their core.",
    readTime: '7 min read',
    date: 'June 2026',
    category: 'guide',
  },
  {
    slug: 'what-neobanks-get-right-community-banks',
    title: "What Neobanks Get Right (and What Community Banks Already Have That They Don't)",
    description:
      "Neobanks won on UX. Community banks won on trust, deposits, and relationships. 70% of small businesses prefer community banks but only 31% use one. The gap is digital capability, not preference.",
    readTime: '7 min read',
    date: 'June 2026',
    category: 'guide',
  },
  {
    slug: 'community-bank-borrower-experience-roi',
    title: 'The ROI of Modernizing Your Community Bank Borrower Experience',
    description:
      "Blend's third-party ROI study found a 10.15x return per loan and $914 in cost savings per file. A documented community bank case study showed 50% faster processing and 25% higher revenue. These are not projections.",
    readTime: '7 min read',
    date: 'June 2026',
    category: 'guide',
  },
  {
    slug: 'community-bank-digital-lending-platform-guide',
    title: 'What to Look for in a Community Bank Digital Lending Platform',
    description:
      "There are five platforms most community banks evaluate when they go shopping for a loan origination system. Pricing runs $50K to $500K annually. Here is what to ask before you sign anything.",
    readTime: '7 min read',
    date: 'May 2026',
    category: 'guide',
  },
  {
    slug: 'community-bank-ceo-digital-lending-2026',
    title: "The Community Bank CEO's Guide to Digital Lending in 2026",
    description:
      "94% of community bank CEOs say they would adopt digital lending if the economics made sense. Most haven't. Here is the decision framework for 2026 that skips the $2B core replacement debate.",
    readTime: '7 min read',
    date: 'May 2026',
    category: 'guide',
  },
  {
    slug: 'community-banks-lose-loans-fintechs',
    title: 'Why Community Banks Lose Loans to Fintechs (and How to Win Them Back)',
    description:
      "Non-bank lenders now hold 66% of the U.S. mortgage market. Community banks dropped from 42.5% to 30.1% in six years. The gap isn't rates or trust. It's the application experience.",
    readTime: '7 min read',
    date: 'May 2026',
    category: 'guide',
  },
  {
    slug: 'community-bank-compete-neobank-core',
    title: 'How Community Banks Can Compete With Neobanks Without Replacing Their Core',
    description:
      "Chime spent $519M on marketing last year and added 22M customers. Community banks don't need to replace their core to fight back. Here's the third option most vendors don't want to sell you.",
    readTime: '6 min read',
    date: 'May 2026',
    category: 'guide',
  },
  {
    slug: 'south-atlantic-bank-coastal-growth-engine',
    title: 'South Atlantic Bank: The $2B Coastal Lender Built on In-Migration',
    description:
      "South Atlantic Bank turned a 2007 Myrtle Beach startup into a $1.98B coastal lender with branches from Myrtle Beach to Hilton Head. How in-migration, a 56% CRE and construction concentration and a $1M-plus Lowcountry mortgage book are forcing a digital reckoning.",
    readTime: '6 min read',
    date: 'October 2026',
    category: 'bank',
    auditSlug: 'south-atlantic-bank',
  },
  {
    slug: 'conway-national-bank-grand-strand-dominance',
    title: "Conway National Bank's Quiet Dominance on the Grand Strand",
    description:
      "Conway National Bank has held the top deposit share in Horry County every year since at least 2021, and ran a 47.9% efficiency ratio in the first half of 2026. What its numbers reveal about scaling a lean community bank into a surging coastal market.",
    readTime: '6 min read',
    date: 'October 2026',
    category: 'bank',
    auditSlug: 'conway-national-bank',
  },
  {
    slug: 'bank-travelers-rest-greenville-growth-engine',
    title: "Bank of Travelers Rest: Greenville's $1.6B Growth Engine",
    description:
      'Bank of Travelers Rest earned a 1.60% ROA in the first half of 2026 from a single South Carolina county, and just opened its 11th branch. How an 80-year-old community bank became the quiet growth engine of Greenville, and where its loan intake still lags.',
    readTime: '5 min read',
    date: 'October 2026',
    category: 'bank',
    auditSlug: 'bank-of-travelers-rest',
  },
  {
    slug: 'security-federal-bank-cdfi-rate-rebound-aiken',
    title: 'Security Federal Bank: CDFI Giant Navigating the Rate Rebound',
    description:
      "Security Federal, the Aiken CDFI bank with 19 branches and an ICE-powered mortgage stack, cut its efficiency ratio from 75.35% to 70.44% in a year. Still above 70%, and the missing piece is automated verification for its hardest borrower files.",
    readTime: '7 min read',
    date: 'October 2026',
    category: 'bank',
    auditSlug: 'security-federal-bank',
  },
  {
    slug: 'ccnb-myrtle-beach-merger-growth-2026',
    title: "CCNB's $2.3B Merger Bet on SC's Fastest-Growing Coast",
    description:
      "CCNB grew from a 2009 de novo to a $1.35B bank on one of the fastest-growing coasts in the US. On October 1 it closed a merger of equals with Beacon, creating a $2.3B franchise that converts systems and rebrands in March 2027. The clock is running.",
    readTime: '6 min read',
    date: 'October 2026',
    category: 'bank',
    auditSlug: 'coastal-carolina-national-bank',
  },
  {
    slug: 'first-capital-bank-charleston-growth-digital-gap',
    title: 'First Capital Bank Hit $1B. Can It Keep Growing Without Going Digital?',
    description:
      "First Capital Bank grew from $1.05 billion to $1.32 billion in assets in the year to June 2026, in a metro adding 17,500 residents a year, with no online loan application. Why its phone-and-email intake is a bet that gets harder to win as Charleston grows.",
    readTime: '6 min read',
    date: 'October 2026',
    category: 'bank',
    auditSlug: 'first-capital-bank-charleston',
  },
  {
    slug: 'first-community-bank-sc-cre-merger-growth',
    title: 'First Community Bank SC: A $2.4B Bank, a Georgia Deal and a New CEO',
    description:
      "First Community Bank of Lexington, SC closed its acquisition of Signature Bank of Georgia in January 2026, reached $2.38 billion in assets and grew second-quarter earnings 46%. Its bank CEO retires at year-end. What the numbers show, and what the next leadership team inherits.",
    readTime: '5 min read',
    date: 'April 2026',
    category: 'bank',
    auditSlug: 'first-community-bank-sc',
  },
  {
    slug: 'countybank-greenwood-sc-sba-deep-dive',
    title: 'Countybank Is From Greenwood. Its Mortgage Business Lives in Greenville',
    description:
      "Countybank has banked Greenwood, SC since 1933, but its 2025 HMDA data shows more home loans in Greenville County than at home, and mortgage sale gains are its biggest fee line. A look at a $733 million bank that earns like a mortgage company, and what that means for its other loans.",
    readTime: '5 min read',
    date: 'April 2026',
    category: 'bank',
    auditSlug: 'countybank',
  },
  {
    slug: 'optus-bank-cdfi-columbia-growth',
    title: 'Optus Bank Grew From $65 Million to $764 Million. Now Comes M&F',
    description:
      "Optus Bank grew from $65 million in assets in 2018 to $764 million in mid-2026, and in July agreed to merge with Durham's M&F Bank to form a $1.27 billion CDFI. What drove the growth, what the bank actually lends, and what the merger has to get right.",
    readTime: '5 min read',
    date: 'April 2026',
    category: 'bank',
    auditSlug: 'optus-bank',
  },
  {
    slug: 'beacon-community-bank-charleston-growth-capacity',
    title: 'Beacon Community Bank: Growth at the Edge of Capacity',
    description:
      "Beacon Community Bank grew from $36M to $972M in assets in seven years without building a digital front door. In a market adding 8,500 households a year, a 404 mortgage page is a strategy problem, not a website bug.",
    readTime: '6 min read',
    date: 'April 2026',
    category: 'bank',
    auditSlug: 'beacon-community-bank',
  },
  {
    slug: 'first-palmetto-bank-sc-performance-deep-dive',
    title: 'First Palmetto Bank: 120 Years Old, $1B in Assets, Zero Excuses',
    description:
      'First Palmetto Bank earned a 1.36% ROA with a 54.8% efficiency ratio in the first half of 2026 across 22 South Carolina offices, while its four Grand Strand branches sit in one of the fastest-growing counties in the state. The performance is real. The manual mortgage workflow is a risk.',
    readTime: '6 min read',
    date: 'April 2026',
    category: 'bank',
    auditSlug: 'first-palmetto-bank',
  },
  {
    slug: 'queensborough-national-bank-trust-deep-dive',
    title: "Queensborough's Long Runway: A $2.3B Georgia Bank Built to Last",
    description:
      "Queensborough National Bank & Trust has grown to $2.34B in assets across a 25-office corridor from Louisville to Savannah without a single acquisition. A $477M commercial real estate book with no digital front door, 57 VA loans in 2024, and a mortgage operation still running on paper.",
    readTime: '6 min read',
    date: 'March 2026',
    category: 'bank',
    auditSlug: 'queensborough-national-bank',
  },
  {
    slug: 'southern-bank-nc-digital-bet',
    title: 'Southern Bank Rebuilt Its Digital Banking. The Loan Application Is Next',
    description:
      "Southern Bank and Trust, chartered in Mount Olive, NC in 1901, cut its efficiency ratio from 69.4% to 52.6% in two years and switched on a new digital banking platform on October 19, 2026. What drove the turnaround, what its 2025 mortgage data shows, and where the next efficiency gain has to come from.",
    readTime: '5 min read',
    date: 'October 2026',
    category: 'bank',
    auditSlug: 'southern-bank-trust',
  },
  {
    slug: 'chime-account-opening-deposit-war',
    title: 'Chime Opens Accounts in Two Minutes. What Community Banks Can Actually Copy',
    description:
      'Chime reached 10.4 million active members in mid-2026 without a branch, a signature card or a ChexSystems check. A side-by-side look at its account opening and a community bank\'s, what Chime gave up to be fast, and which parts a community bank can copy.',
    readTime: '5 min read',
    date: 'October 2026',
    category: 'fintech',
  },
  {
    slug: 'first-reliance-outgrew-florence',
    title: "The Bank That Didn't Wait for the Battery Plant",
    description:
      "First Reliance Bancshares posted net income up 113% year-over-year while the AESC battery plant in its home market sat half-built and on hold. Nine branches, eight cities, $1.12 billion in assets, and a balance sheet that outgrew Florence, SC.",
    readTime: '5 min read',
    date: 'June 2026',
    category: 'bank',
    auditSlug: 'first-reliance-bank',
  },
  {
    slug: 'colony-bankcorp-farm-to-fees',
    title: 'Built on Peanuts, Betting on Fees',
    description:
      'Colony Bankcorp grew from a 1975 agricultural lender in Fitzgerald, GA to a $3.7 billion serial acquirer. Now it faces a two-front stress test: a multi-year peanut cost-price squeeze and a post-acquisition loan growth miss. The plot twist is a fee income pivot that tripled AUM in a year.',
    readTime: '5 min read',
    date: 'June 2026',
    category: 'bank',
    auditSlug: 'colony-bankcorp',
  },
  {
    slug: 'carolina-bank-between-two-economies',
    title: 'The Bank Between Two Economies',
    description:
      'Carolina Bank & Trust earned a 1.85% ROA with a 43.2% efficiency ratio in the first half of 2026, out of Lamar, SC, between a county that lost its sawmill and a county whose $1.6 billion battery plant is on pause. How a 90-year-old family bank thrives while both economies wait.',
    readTime: '5 min read',
    date: 'October 2026',
    category: 'bank',
    auditSlug: 'carolina-bank-trust',
  },
  {
    slug: 'rocket-mortgage-22-days-how',
    title: 'How Rocket Mortgage Closes in 22 Days',
    description:
      'Independent mortgage banks now originate 84% of U.S. mortgages. Banks gave that market away one slow VOE call at a time. A step-by-step breakdown of what Rocket does differently, and what community banks can actually copy.',
    readTime: '7 min read',
    date: 'June 2026',
    category: 'fintech',
    featured: true,
  },
  {
    slug: 'coastal-states-bank-boat-bank',
    title: 'The Boat Bank of Beaufort County',
    description:
      'Coastal States Bank out-deposits Wells Fargo and Bank of America in Beaufort County, but nearly 19% of its loans are boats. Inside the island bank that became a national specialty lender, and the 42-mortgage footnote in its HMDA data.',
    readTime: '5 min read',
    date: 'June 2026',
    category: 'bank',
    auditSlug: 'coastal-states-bank',
  },
  {
    slug: 'oconee-federal-quiet-comeback',
    title: 'The Quiet Comeback at Oconee Federal',
    description:
      'The 102-year-old Seneca thrift saw core earnings triple while the headline number said decline. How a long-duration mortgage book repriced its way out of the rate shock, and why the next leg is harder.',
    readTime: '6 min read',
    date: 'June 2026',
    category: 'bank',
    auditSlug: 'oconee-federal',
  },
  {
    slug: 'arthur-state-bank-upstate-bet',
    title: 'The Bank That Depression Built',
    description:
      'Arthur State Bank has run a 4.44% net interest margin and 16% ROE out of a declining South Carolina county for 93 years. The secret is portfolio lending, a booming Upstate geography, and a family that has never needed to sell.',
    readTime: '7 min read',
    date: 'June 2026',
    category: 'bank',
    auditSlug: 'arthur-state-bank',
  },
  {
    slug: 'affirm-vs-community-bank-personal-loans',
    title: 'The Two-Second Loan',
    description:
      'Affirm approved 24 million Americans for credit last year using real-time cash flow data and ML underwriting. Your community bank probably took a week. Here is what that gap actually means, and what banks can do about it.',
    readTime: '7 min read',
    date: 'June 2026',
    category: 'fintech',
  },
  {
    slug: 'trillion-dollar-ipo-wave-2026',
    title: 'The $3.6 Trillion Question',
    description:
      'SpaceX prices on June 12. OpenAI targets September. Anthropic filed confidentially on June 1. Three companies worth a combined $3.6 trillion are going public at once. Here is what that means for banks, investors, and the market segments caught in between.',
    readTime: '7 min read',
    date: 'June 2026',
    category: 'guide',
  },
  {
    slug: 'anderson-brothers-bank-myrtle-beach-bet',
    title: 'From Tobacco Warehouses to Myrtle Beach: The Quiet Dominance of Anderson Brothers Bank',
    description:
      'Anderson Brothers Bank runs a 6.1% net interest margin, a 16.7% ROE, and grew from $500M to $2.28B in assets in a decade without a single acquisition. The story is Myrtle Beach, a 60% deposit monopoly in rural SC, and 92 years of patience.',
    readTime: '7 min read',
    date: 'May 2026',
    category: 'bank',
    auditSlug: 'anderson-brothers-bank',
    featured: true,
  },
  {
    slug: 'income-verification-fintech-vs-bank',
    title: 'The $70 Phone Call: How Fintechs Are Killing the Income Verification Tax',
    description:
      'Community banks pay $55–$280 per file to verify borrower income through The Work Number and IRS transcripts. Plaid does it in seconds for $1–$3. The gap is not regulatory necessity — it\'s infrastructure debt.',
    readTime: '6 min read',
    date: 'May 2026',
    category: 'fintech',
  },
  {
    slug: 'southern-first-bank-upstate-sc-bet',
    title: 'The Bank That Bet on Upstate South Carolina (And Won)',
    description:
      'Southern First Bancshares just reported Q4 EPS up 73% year-over-year. The story behind that number is 30 people a day moving to Greenville-Spartanburg, a $1.7 billion BMW investment, and a 26-year relationship banking bet that\'s finally paying off.',
    readTime: '8 min read',
    date: 'May 2026',
    category: 'bank',
    auditSlug: 'southern-first-bank',
  },
  {
    slug: 'foreclosure-wave-hiding-in-plain-sight',
    title: 'The Foreclosure Wave Is Already Here. Your Bank Just Can\'t See It Yet.',
    description:
      '118,727 households entered foreclosure in Q1 2026, up 26% from a year ago. Your call report probably looks fine. Here\'s why that\'s the problem.',
    readTime: '7 min read',
    date: 'May 2026',
    category: 'guide',
  },
  {
    slug: 'why-it-takes-42-days-to-close-a-mortgage',
    title: 'Why It Takes 42 Days to Close a Mortgage (And What That\'s Costing Your Bank)',
    description:
      'The average mortgage takes 42 days to close. FHA loans take 77. The average file is 500 pages thick. Every one of those days costs money in staff time, borrower patience, and loans that never close.',
    readTime: '8 min read',
    date: 'March 2026',
    category: 'guide',
    featured: true,
  },
  {
    slug: 'community-banks-are-losing-the-lending-race',
    title: 'Community Banks Are Losing the Lending Race. Here\'s How to Catch Up.',
    description:
      'Banks originated 42.5% of mortgages in 2018. By 2024, that fell to 30.1%. Non-bank lenders now close more than half of all home loans. This is a structural shift, and it is accelerating.',
    readTime: '9 min read',
    date: 'March 2026',
    category: 'guide',
  },
  {
    slug: 'next-generation-borrowers-wont-wait',
    title: 'Your Next Generation of Borrowers Won\'t Wait 42 Days',
    description:
      '54% of Gen Z rely primarily on non-traditional financial providers. 61% switched banks in the last two years. Only 14% trust traditional banks "a lot." Your future borrowers are already gone.',
    readTime: '8 min read',
    date: 'March 2026',
    category: 'guide',
  },
  {
    slug: '59-billion-compliance-burden',
    title: 'The $59 Billion Compliance Burden — And How Automation Is Cutting It in Half',
    description:
      'U.S. banks spend $59 billion a year on BSA/AML compliance alone. For community banks under $100 million in assets, compliance eats 8.7% of noninterest expenses — three times the rate at larger banks.',
    readTime: '10 min read',
    date: 'March 2026',
    category: 'guide',
  },
  {
    slug: 'how-figure-closes-heloc-in-5-days',
    title: 'How Figure Closes a HELOC in 5 Days (And What Community Banks Can Learn)',
    description:
      'Figure originates at $730 per loan versus the industry average of $11,230. Their S-1 reveals the speed comes from automated data aggregation, not blockchain. The playbook is more replicable than you think.',
    readTime: '11 min read',
    date: 'February 2026',
    category: 'fintech',
  },
  {
    slug: 'one-link-complete-verification',
    title: 'One Link, Complete Verification: How RAVEN Works for Community Banks',
    description:
      'What if verifying a borrower took 5 minutes instead of 5 weeks? One link, one borrower interaction, complete verification data back to the bank in minutes from seven providers with a full audit trail.',
    readTime: '12 min read',
    date: 'February 2026',
    category: 'guide',
  },
];

/**
 * Related articles for cross-linking: same category, excluding the article
 * itself, in index order (roughly recency) starting after the article's own
 * position and wrapping around, so links vary across the category instead of
 * everything pointing at the same three newest posts.
 */
export function getRelatedArticles(slug: string, count = 3): Article[] {
  const pos = articles.findIndex((a) => a.slug === slug);
  const category = pos >= 0 ? articles[pos].category : undefined;
  const pool = articles.filter((a) => a.slug !== slug && (!category || a.category === category));
  if (pool.length <= count) return pool;
  // rotate the pool so selection starts after this article's index position
  const offset = pos >= 0 ? articles.slice(pos + 1).filter((a) => pool.includes(a)).length : pool.length;
  const start = pool.length - offset;
  return [...pool.slice(start), ...pool.slice(0, start)].slice(0, count);
}
