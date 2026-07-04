import type { Metadata } from 'next';
import { CalendlyButton } from '../calendly-button';

export const metadata: Metadata = {
  title: 'RAVEN Blog — Insights for Community Banks',
  description:
    'Articles on borrower verification, lending automation, compliance, and how community banks can compete with fintechs. Research-backed insights from RAVEN.',
  openGraph: {
    title: 'RAVEN Blog — Insights for Community Banks',
    description:
      'Research-backed articles on lending speed, compliance costs, and verification automation for community banks.',
    url: 'https://reportraven.tech/blog',
    siteName: 'RAVEN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://reportraven.tech/blog',
  },
};

type ArticleCategory = 'bank' | 'fintech' | 'guide' | 'platform';

interface Article {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  date: string;
  category: ArticleCategory;
  auditSlug?: string;
  featured?: true;
}

const articles: Article[] = [
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
      'SilverLake powers 425 banks, Symitar serves 700+ credit unions. Neither ships a native digital LOS. Here is what Jack Henry actually provides for loan origination, what requires a separate license, and how the 950-partner integration ecosystem works in practice.',
    readTime: '6 min read',
    date: 'June 2026',
    category: 'platform',
  },
  {
    slug: 'fiserv-premier-digital-lending',
    title: 'Digital Lending on Fiserv: What Premier and Portico Actually Support',
    description:
      'Premier serves 194 community banks. Portico serves nearly 500 credit unions. None of the three Fiserv legacy cores ships with a native digital LOS. Here is what Communicator Open actually costs, which AppMarket vendors have delivered results, and where the Portico gap is.',
    readTime: '6 min read',
    date: 'June 2026',
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
      'Community bank AI adoption tripled in 2026. Here is what the regulations actually require, where AI fits today, and how to implement it without triggering examiner problems.',
    readTime: '7 min read',
    date: 'June 2026',
    category: 'guide',
  },
  {
    slug: 'white-label-borrower-portal-community-bank',
    title: 'The White-Label Borrower Portal: What It Is and Why Community Banks Need One',
    description:
      'Only 24% of small banks accepted small business loan applications online in 2024. Here is what a white-label borrower portal is, what it costs, and why it is the fastest path to closing the digital gap.',
    readTime: '6 min read',
    date: 'June 2026',
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
      'Section 1033 is enjoined, but open banking is already deployed at community banks. Here is what Plaid, Fiserv, and Jack Henry actually offer, what works, and what still requires custom integration.',
    readTime: '7 min read',
    date: 'June 2026',
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
      "South Atlantic Bank turned a 2007 startup in Myrtle Beach into a $1.93B coastal lending machine in under 17 years. How in-migration math, a 53% CRE concentration, and 13% loan growth are forcing a digital reckoning.",
    readTime: '6 min read',
    date: 'June 2026',
    category: 'bank',
    auditSlug: 'south-atlantic-bank',
  },
  {
    slug: 'conway-national-bank-grand-strand-dominance',
    title: "Conway National Bank's Quiet Dominance on the Grand Strand",
    description:
      "Conway National Bank runs a sub-48% efficiency ratio and holds the top deposit share in one of America's fastest-growing counties. What their numbers reveal about scaling a lean community bank into a surging coastal market.",
    readTime: '6 min read',
    date: 'June 2026',
    category: 'bank',
    auditSlug: 'conway-national-bank',
  },
  {
    slug: 'bank-travelers-rest-greenville-growth-engine',
    title: "Bank of Travelers Rest: Greenville's $1.6B Growth Engine",
    description:
      'Bank of Travelers Rest is posting 1.44% ROA and 21.82% ROE from a single county in South Carolina. How a 10-branch community bank became the quiet growth engine of one of the fastest-moving metros in the Southeast.',
    readTime: '6 min read',
    date: 'June 2026',
    category: 'bank',
    auditSlug: 'bank-of-travelers-rest',
  },
  {
    slug: 'security-federal-bank-cdfi-rate-rebound-aiken',
    title: 'Security Federal Bank: CDFI Giant Navigating the Rate Rebound',
    description:
      "South Carolina's largest CDFI-certified bank is growing into a hot Aiken-Augusta corridor with 19 branches and an ICE-powered mortgage stack. The missing piece is automated verification, and the efficiency ratio tells the whole story.",
    readTime: '6 min read',
    date: 'May 2026',
    category: 'bank',
    auditSlug: 'security-federal-bank',
  },
  {
    slug: 'ccnb-myrtle-beach-merger-growth-2026',
    title: "CCNB's $2.2B Merger Bet on SC's Fastest-Growing Coast",
    description:
      "CCNB grew from a 2009 de novo to a $1.28B franchise serving one of the fastest-growing metros in the US. Now a $2.2B merger bet is forcing the bank to standardize workflows before a 2027 systems conversion.",
    readTime: '6 min read',
    date: 'May 2026',
    category: 'bank',
    auditSlug: 'coastal-carolina-national-bank',
  },
  {
    slug: 'first-capital-bank-charleston-growth-digital-gap',
    title: 'First Capital Bank Hit $1B. Can It Keep Growing Without Going Digital?',
    description:
      "First Capital Bank crossed $1B in assets in a metro adding 17,500 residents a year. Here is why its four-branch, no-digital-application model is a structural bet that gets harder to win as the market heats up.",
    readTime: '6 min read',
    date: 'May 2026',
    category: 'bank',
    auditSlug: 'first-capital-bank-charleston',
  },
  {
    slug: 'first-community-bank-sc-cre-merger-growth',
    title: 'First Community Bank SC: The $2.4B CRE Bet Hiding in Plain Sight',
    description:
      'First Community Bankshares SC just completed a $1.6B merger and is running a 46% CRE concentration in a market where commercial real estate is simultaneously the best growth story and the biggest risk. Here is what the numbers show.',
    readTime: '6 min read',
    date: 'April 2026',
    category: 'bank',
    auditSlug: 'first-community-bank-sc',
  },
  {
    slug: 'countybank-greenwood-sc-sba-deep-dive',
    title: "Countybank's SBA Playbook: How a Greenwood, SC Bank Thinks About Small Business",
    description:
      'Countybank runs a 17.6% ROE and a 55% efficiency ratio from Greenwood, SC, and its SBA lending volume punches well above its weight class. A deep dive into how a $900M community bank competes for business borrowers in a shrinking market.',
    readTime: '6 min read',
    date: 'April 2026',
    category: 'bank',
    auditSlug: 'countybank',
  },
  {
    slug: 'optus-bank-cdfi-columbia-growth',
    title: "Optus Bank: Columbia's CDFI Institution Betting on Scale",
    description:
      "Optus Bank is South Carolina's only Black-owned CDFI bank, and it is in the middle of a growth push that has taken it from $130M to over $250M in assets in three years. The challenge is running CDFI mission economics at a scale that requires modern infrastructure.",
    readTime: '6 min read',
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
      'First Palmetto Bank has run a 1.07% ROA and 53% efficiency ratio for 22 offices across South Carolina while its four Grand Strand branches sit inside one of the fastest-growing metros in the country. The performance is real. The manual mortgage workflow is a risk.',
    readTime: '6 min read',
    date: 'April 2026',
    category: 'bank',
    auditSlug: 'first-palmetto-bank',
  },
  {
    slug: 'queensborough-national-bank-trust-deep-dive',
    title: "Queensborough's Long Runway: A $2.3B Georgia Bank Built to Last",
    description:
      "Queensborough National Bank & Trust has grown to $2.34B in assets across a 27-branch corridor from Louisville to Savannah without a single acquisition. A $477M commercial real estate book with no digital front door, 57 VA loans in 2024, and a mortgage operation still running on paper.",
    readTime: '6 min read',
    date: 'March 2026',
    category: 'bank',
    auditSlug: 'queensborough-national-bank',
  },
  {
    slug: 'southern-bank-nc-digital-bet',
    title: 'The Century Bank That Hired a Chief Digital Officer',
    description:
      "Southern Bank and Trust has run $5 billion across 57 eastern North Carolina branches for over a century. In 2024, they hired a Chief Digital Officer from First Citizens Bank. What that hire means for borrowers from the tobacco belt to the Outer Banks.",
    readTime: '6 min read',
    date: 'June 2026',
    category: 'bank',
    auditSlug: 'southern-bank-trust',
  },
  {
    slug: 'chime-account-opening-deposit-war',
    title: 'The 92% Problem',
    description:
      'Community banks built digital account opening. Then 92% of customers abandoned it on mobile. Chime does it in two minutes, added 700,000 members last quarter, and went public on NASDAQ. A step-by-step look at what each side actually does.',
    readTime: '5 min read',
    date: 'June 2026',
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
      'Carolina Bank & Trust runs a 1.68% ROA, a 44.86% efficiency ratio, and zero foreclosed real estate out of Lamar, SC — right between a county shedding timber jobs and a county landing a $1.62 billion EV battery plant. Here is how a 90-year-old family bank navigates the gap.',
    readTime: '5 min read',
    date: 'June 2026',
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
      'Anderson Brothers Bank runs a 6.1% net interest margin, a 16.7% ROE, and grew from $500M to $2.19B in assets in a decade without a single acquisition. The story is Myrtle Beach, a 60% deposit monopoly in rural SC, and 92 years of patience.',
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

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': 'https://reportraven.tech/blog#blog',
  url: 'https://reportraven.tech/blog',
  name: 'RAVEN Blog',
  description:
    'Research-backed articles on lending speed, compliance costs, and verification automation for community banks.',
  publisher: { '@type': 'Organization', name: 'RAVEN', url: 'https://reportraven.tech' },
  blogPost: articles.map((a) => ({
    '@type': 'BlogPosting',
    headline: a.title,
    description: a.description,
    url: `https://reportraven.tech/blog/${a.slug}`,
    // Index cards only carry month-level dates ('June 2026'); first of month
    // keeps this ISO-valid without claiming false precision.
    datePublished: new Date(`${a.date.replace(' ', ' 1, ')} UTC`).toISOString().slice(0, 10),
    author: { '@type': 'Organization', name: 'RAVEN' },
  })),
};

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

function FeaturedCard({ article }: { article: Article }) {
  return (
    <a href={`/blog/${article.slug}`} className="blog-featured-card">
      <div className="blog-featured-cat">{article.category === 'fintech' ? 'Fintech vs. Bank' : article.category === 'bank' ? 'Bank Deep Dive' : 'Industry Research'}</div>
      <h2>{article.title}</h2>
      <p>{article.description}</p>
      <span className="blog-card-read">
        Read article <ArrowRight />
      </span>
    </a>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="blog-card-wrap">
      <a href={`/blog/${article.slug}`} className="blog-card">
        <div className="blog-card-meta">
          <span>{article.date}</span>
          <span className="blog-card-meta-dot" />
          <span>{article.readTime}</span>
        </div>
        <h3>{article.title}</h3>
        <p>{article.description}</p>
        <span className="blog-card-read">
          Read article <ArrowRight />
        </span>
      </a>
      {article.auditSlug && (
        <a href={`/audit/${article.auditSlug}`} className="blog-card-audit-link">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          View ROI audit
        </a>
      )}
    </div>
  );
}

function SectionLabel({ num, label, description }: { num: string; label: string; description?: string }) {
  return (
    <div className="blog-section-header">
      <div className="blog-section-label">
        <span className="blog-section-num">{num}</span>
        {label}
      </div>
      {description && <p className="blog-section-desc">{description}</p>}
    </div>
  );
}

export default function BlogIndex() {
  const featured = articles.filter((a) => a.featured);
  const bankArticles = articles.filter((a) => a.category === 'bank' && !a.featured);
  const fintechArticles = articles.filter((a) => a.category === 'fintech' && !a.featured);
  const platformArticles = articles.filter((a) => a.category === 'platform');
  const guideArticles = articles.filter((a) => a.category === 'guide' && !a.featured);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <style>{`
        :root {
          --accent: #6C8EFF;
          --accent-dim: rgba(108,142,255,0.12);
          --accent-border: rgba(108,142,255,0.25);
        }
        .blog-index {
          max-width: 1160px;
          margin: 0 auto;
          padding: 4rem 2rem 5rem;
        }
        .blog-index-header {
          margin-bottom: 4rem;
          max-width: 680px;
        }
        .blog-index-tag {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1.1rem;
        }
        .blog-index-header h1 {
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.12;
          margin-bottom: 1rem;
        }
        .blog-index-header p {
          font-size: 1.05rem;
          color: var(--gray-400);
          line-height: 1.7;
          margin-bottom: 1.75rem;
        }

        /* Section labels */
        .blog-section-header { margin-bottom: 1.75rem; }
        .blog-section-label {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--gray-400);
          margin-bottom: 0.5rem;
        }
        .blog-section-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: var(--accent-dim);
          border: 1px solid var(--accent-border);
          color: var(--accent);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0;
          flex-shrink: 0;
        }
        .blog-section-desc {
          font-size: 0.87rem;
          color: var(--gray-500);
          line-height: 1.6;
          max-width: 560px;
          margin: 0;
        }

        /* Featured strip */
        .blog-featured { margin-bottom: 4.5rem; }
        .blog-featured-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .blog-featured-card {
          display: flex;
          flex-direction: column;
          padding: 2.25rem;
          background: var(--black);
          text-decoration: none;
          color: inherit;
          transition: background 200ms;
          border-top: 3px solid var(--accent);
        }
        .blog-featured-card:hover { background: rgba(255,255,255,0.025); }
        .blog-featured-cat {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--accent);
          margin-bottom: 0.9rem;
        }
        .blog-featured-card h2 {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          line-height: 1.32;
          margin-bottom: 0.8rem;
          color: var(--white);
          flex: 1;
        }
        .blog-featured-card > p {
          font-size: 0.83rem;
          color: var(--gray-500);
          line-height: 1.65;
          margin-bottom: 1.25rem;
          flex: 2;
        }

        /* Section blocks */
        .blog-section { margin-bottom: 4.5rem; }

        /* Bank deep dive grid */
        .blog-bank-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .blog-card-wrap {
          display: flex;
          flex-direction: column;
          background: var(--black);
          transition: background 200ms;
        }
        .blog-card-wrap:hover { background: rgba(255,255,255,0.02); }
        .blog-card {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 1.75rem 1.75rem 1rem;
          text-decoration: none;
          color: inherit;
        }
        .blog-card-meta {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          font-size: 0.72rem;
          color: var(--gray-500);
          margin-bottom: 0.85rem;
        }
        .blog-card-meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--gray-600);
        }
        .blog-card h3, .blog-featured-card h2 {
          line-height: 1.32;
          letter-spacing: -0.015em;
        }
        .blog-card h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.6rem;
          color: var(--white);
        }
        .blog-card p {
          font-size: 0.82rem;
          color: var(--gray-500);
          line-height: 1.65;
          flex: 1;
        }
        .blog-card-read {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--gray-400);
          margin-top: 1rem;
          transition: color 200ms;
          text-decoration: none;
        }
        .blog-card:hover .blog-card-read,
        .blog-featured-card:hover .blog-card-read { color: var(--white); }
        .blog-card-audit-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--accent);
          padding: 0.55rem 1.75rem 1.1rem;
          text-decoration: none;
          opacity: 0.85;
          transition: opacity 200ms;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .blog-card-audit-link:hover { opacity: 1; }

        /* Fintech grid - 2 columns, more compact */
        .blog-fintech-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .blog-fintech-grid .blog-card-wrap {
          border-left: 3px solid rgba(245,158,11,0.4);
        }

        /* Platform grid - 2x2 */
        .blog-platform-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }

        /* Guides grid - 3 column */
        .blog-guide-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .blog-index-demo-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          background: var(--white);
          color: var(--black);
          cursor: pointer;
          transition: opacity 200ms;
          white-space: nowrap;
        }
        .blog-index-demo-btn:hover { opacity: 0.85; }

        @media (max-width: 900px) {
          .blog-featured-grid { grid-template-columns: 1fr; }
          .blog-bank-grid { grid-template-columns: repeat(2, 1fr); }
          .blog-guide-grid { grid-template-columns: repeat(2, 1fr); }
          .blog-featured-card { padding: 1.75rem; }
          .blog-section { margin-bottom: 3rem; }
        }
        @media (max-width: 640px) {
          .blog-index { padding: 2.5rem 1.1rem 3rem; }
          .blog-index-header { margin-bottom: 2.75rem; }
          .blog-featured { margin-bottom: 3rem; }
          .blog-featured-card { padding: 1.5rem; border-top-width: 2px; }
          .blog-featured-card h2 { font-size: 1.05rem; }
          .blog-bank-grid,
          .blog-fintech-grid,
          .blog-platform-grid,
          .blog-guide-grid { grid-template-columns: 1fr; }
          .blog-card { padding: 1.4rem 1.4rem 0.85rem; }
          .blog-card-audit-link { padding: 0.5rem 1.4rem 0.9rem; }
          .blog-section-header { margin-bottom: 1.25rem; }
        }
      `}</style>

      <div className="blog-index">
        <div className="blog-index-header">
          <div className="blog-index-tag">RAVEN Blog</div>
          <h1>Research-backed insights for community bankers</h1>
          <p>
            Original analysis of community bank performance, fintech competition, and the lending
            infrastructure gap. Built from public FDIC, HMDA, and earnings data.
          </p>
          <CalendlyButton source="blog-index" label="Book a Demo" buttonClassName="blog-index-demo-btn" />
        </div>

        {/* Featured */}
        <div className="blog-featured">
          <div className="blog-featured-grid">
            {featured.map((a) => (
              <FeaturedCard key={a.slug} article={a} />
            ))}
          </div>
        </div>

        {/* Bank Performance Deep Dives */}
        <div className="blog-section">
          <SectionLabel
            num="01"
            label="Bank Performance Deep Dives"
            description={`Original analysis of community banks using FDIC call reports, HMDA filings, and earnings data. ${bankArticles.filter((a) => a.auditSlug).length} of these have a free RAVEN ROI audit.`}
          />
          <div className="blog-bank-grid">
            {bankArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>

        {/* Fintech vs. Bank */}
        <div className="blog-section">
          <SectionLabel
            num="02"
            label="Fintech vs. Community Bank"
            description="Step-by-step breakdowns of how fintechs operate versus traditional bank workflows, and what community banks can realistically copy."
          />
          <div className="blog-fintech-grid">
            {fintechArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>

        {/* Core & Platform */}
        <div className="blog-section">
          <SectionLabel
            num="03"
            label="Core & Platform Research"
            description="What Jack Henry, Fiserv, and open banking platforms actually support for community bank lending and account opening."
          />
          <div className="blog-platform-grid">
            {platformArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>

        {/* Guides & Research */}
        <div className="blog-section">
          <SectionLabel
            num="04"
            label="Guides & Industry Research"
            description="Data-driven guides on digital lending strategy, compliance costs, borrower expectations, and the macro trends reshaping community banking."
          />
          <div className="blog-guide-grid">
            {guideArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
