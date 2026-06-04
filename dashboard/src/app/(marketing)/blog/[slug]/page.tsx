import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InterestForm } from '../../interest-form';

/* ---------- Markdown-to-HTML helper ---------- */

function convertMarkdown(md: string): string {
  let html = md;

  // Horizontal rules (--- on its own line)
  html = html.replace(/^---$/gm, '<hr />');

  // Headers: ### before ## before #
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* (but not inside strong tags)
  html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Process unordered lists: consecutive lines starting with "- "
  html = html.replace(/((?:^- .+$\n?)+)/gm, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^- /, '')}</li>`)
      .join('\n');
    return `<ul>\n${items}\n</ul>`;
  });

  // Process ordered lists: consecutive lines starting with "1. ", "2. ", etc.
  html = html.replace(/((?:^\d+\. .+$\n?)+)/gm, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^\d+\. /, '')}</li>`)
      .join('\n');
    return `<ol>\n${items}\n</ol>`;
  });

  // Paragraphs: wrap remaining non-tag lines separated by blank lines
  const blocks = html.split(/\n\n+/);
  html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      // Don't wrap blocks that are already HTML elements
      if (/^<(h[1-3]|ul|ol|hr|p|div|section|blockquote)[ />]/i.test(trimmed)) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, ' ')}</p>`;
    })
    .join('\n\n');

  return html;
}

/* ---------- Article data ---------- */

interface Article {
  title: string;
  description: string;
  content: string;
  publishedDate: string;
  readTime: string;
}

const articles: Record<string, Article> = {
  'trillion-dollar-ipo-wave-2026': {
    title: 'The $3.6 Trillion Question',
    description: 'SpaceX prices on June 12. OpenAI targets September. Anthropic filed confidentially on June 1. Three companies worth a combined $3.6 trillion are going public at once. Here is what that means for banks, investors, and the market segments caught in between.',
    publishedDate: 'June 4, 2026',
    readTime: '7 min read',
    content: `
The three biggest IPOs in history are coming at once. Banks are licking their chops. They should also be nervous.

SpaceX prices on June 12. OpenAI targets September. Anthropic filed confidentially on June 1 and is aiming for October. Combined, these three companies are targeting public market valuations north of $3.6 trillion. For context, that's larger than the entire GDP of Germany.

Nothing like this has ever happened before. Not even close.

## The Fee Bonanza (With a Catch)

Goldman Sachs, JPMorgan, Morgan Stanley, Bank of America, and Citi are all in the SpaceX syndicate. Goldman is leading. CEO David Solomon said publicly this week that there's enough "greed" in the market to absorb all three deals. That's the most honest sentence a Wall Street CEO has uttered in years.

The fee math is staggering on paper. SpaceX alone is raising ~$75 billion. At a standard 2% underwriting fee, that's $1.5 billion split across a 21-bank syndicate. Except SpaceX isn't paying 2%. They're pushing for sub-0.75%, a historic low. At that rate, the fee pool drops below $560 million.

That's the catch. When you're SpaceX, you have leverage. Every bank on the street wants their name on this deal, and Elon Musk knows it. If the sub-0.75% rate sticks, it sets a precedent that OpenAI and Anthropic will absolutely cite in their own negotiations.

The banks will still make money. They'll make a lot of money. But the per-dollar economics of underwriting are about to compress significantly, just as the deal sizes balloon to historic levels.

## What's Actually Being Priced

Let's be direct about what investors are buying.

SpaceX is the most straightforward of the three. Revenue of $18.7 billion in 2025, up 33% year-over-year. Starlink generates $11.4 billion of that, with $4.4 billion in operating profit. The company lost $4.94 billion net last year, a swing from a $791 million profit in 2024, largely due to Starship development costs. There's a real business here, with a real moat, in a sector (aerospace and satellite internet) that is genuinely hard to replicate.

OpenAI and Anthropic are a different animal. OpenAI is targeting a $60 billion raise at an $852 billion valuation, with 2025 revenues of roughly $20 billion and a projected $14 billion net loss in 2026. Anthropic's annualized revenue run rate is about $47 billion (up from $10 billion a year ago), but the company has never disclosed a path to profitability.

These are not valuations grounded in discounted cash flows. They are bets on category dominance in a technology that may be the most consequential since the internet. That's not irrational. It is, however, a different kind of risk than buying into a company that makes rockets and sells broadband.

## The Bank Lending Problem Nobody Is Talking About Loudly Enough

The underwriting fees are the visible part. The scarier number is on the loan book.

US banks have committed $450 billion in AI-related lending, representing roughly 25% of aggregate Tier 1 capital for participating banks. That's an 80% surge over the past year. The commitments are largely undrawn, meaning actual drawn AI loans represent only about 0.8% of total bank assets today. But committed facilities convert fast when a borrower needs liquidity.

The Chicago Fed has flagged this explicitly: prolonged high interest rates could trigger massive losses if committed facilities get drawn during adverse conditions. The St. Louis Fed noted that AI investment contributed 39% of US GDP growth in 2025, a higher share than tech contributed at the peak of the dot-com bubble in 2000 (28%).

That last comparison deserves to sit with you for a moment.

Nobody is saying this is the dot-com bubble. The companies are bigger, the revenues are real, and the infrastructure buildout is serving genuine demand. But the concentration of bank exposure to a single sector, at a moment when that sector is going through simultaneous mega-IPOs and valuation resets, creates a specific kind of fragility that doesn't show up clearly in any single institution's 10-K.

## A Tale of Two Markets

The 2026 IPO wave isn't rising all boats. It's bifurcating them.

Q1 2026 was the strongest IPO quarter in five years, with 22 traditional deals raising $9.4 billion. Projections for the full year range from $40-60 billion in the base case to over $142 billion if the mega-deals execute on schedule. That's a potential all-time US record.

But capital is concentrating. Mega deals ($100 million+ VC financings) represented 70% of all US venture deal value in 2025, up from 56% in 2024. The companies at the top of the food chain are getting bigger, better-funded, and more dominant faster than ever before.

For institutional investors, this creates a clear two-tier risk/return picture:

**The mega-cap tier** (SpaceX, OpenAI, Anthropic): High absolute risk, high potential return, but the real money was made in private markets years ago. Public investors are buying into the story at prices that assume continued dominance. First-day trading on SpaceX is already projected to push the valuation toward $2.2 trillion, a 24% premium over IPO pricing before the stock trades for a full week.

**The mid-tier** (profitable SaaS, B2B software, fintech without clear AI integration): These companies are getting crowded out. Investor attention is finite. Capital is flowing up-market. A solid enterprise software company with $200 million in ARR and 30% growth is a much harder sell in a market where Anthropic is compounding revenue at 130% year-over-year.

The window for mid-tier IPOs isn't closed, but it's narrower than it looks. Companies that can credibly claim AI infrastructure relevance will price well. Companies that can't are going to spend 2026 watching from the sidelines.

## What This Means for Community Banks

The capital markets story is mostly a Wall Street story, but it has downstream effects that matter for community and regional banks.

The Fed's rate path is softening. Current projections put the federal funds rate at 3.125% by end of 2026, down meaningfully from recent highs. Lower rates compress net interest margins but also loosen credit conditions, which supports loan demand and refinancing activity.

The bigger issue is balance sheet positioning. Banks sitting on large unrealized securities losses from the 2022-2023 rate cycle are watching those losses slowly recover as rates fall. A successful IPO wave that sustains equity market enthusiasm extends that recovery window.

But community banks don't have meaningful direct exposure to SpaceX loans or OpenAI debt. Their exposure is indirect: consumer wealth effects, local business confidence, and the general availability of capital in the broader economy. If the mega-IPOs land cleanly and don't trigger a tech sector correction, that's net positive for loan demand and asset quality across the board. If one of them stumbles badly, the contagion risk depends heavily on how much the institutional money that buys these deals is also funding the community bank deposit base or local commercial real estate.

The open banking angle matters here too. As these AI companies go public and start generating real-time financial data at scale, the demand for verified, portable financial data infrastructure accelerates. Lenders that aren't ready to work with that data programmatically will find themselves at an underwriting disadvantage faster than they expect.

## The Bottom Line

Goldman's David Solomon said the market has enough greed to absorb these deals. He's probably right. The investor demand is real, the companies are genuinely important, and the macro conditions are reasonably supportive.

But "enough greed to absorb" and "rationally priced" are not the same sentence. The banks will collect their fees, the VCs will get their liquidity, and public markets will get to decide what a world-historical AI company is actually worth.

We're about to find out if that's a question the market is ready to answer.
    `,
  },
  'anderson-brothers-bank-myrtle-beach-bet': {
    title: 'From Tobacco Warehouses to Myrtle Beach: The Quiet Dominance of Anderson Brothers Bank',
    description:
      'Anderson Brothers Bank runs a 6.1% net interest margin, a 16.7% ROE, and grew from $500M to $2.19B in assets in a decade without a single acquisition. The story is Myrtle Beach, a 60% deposit monopoly in rural SC, and 92 years of patience.',
    publishedDate: 'May 31, 2026',
    readTime: '7 min read',
    content: `
In 1933, two brothers started a bank in Mullins, South Carolina by financing tobacco farmers from the back of a warehouse. Ninety-two years later, that same bank is posting a 16.7% return on equity, a net interest margin more than double the industry average, and a stock price that has gone from $23 to $1,000 a share.

Anderson Brothers Bank is not a bank most people outside the Pee Dee region have heard of. It probably should be.

## The Numbers That Don't Make Sense at First

A 6.1% net interest margin. That's the figure that stops you when you pull the call report data for Anderson Brothers Bank.

The industry average NIM for community banks is around 3.3%. Most banks would consider 4% a very good year. Anderson Brothers is running at nearly twice that, and it's not a fluke of one quarter. ROA came in at roughly 1.46% for 2025. ROE at 16.7%. The efficiency ratio sits at about 59%, meaning for every dollar the bank brings in, it spends 59 cents running the place. Not spectacular on its own, but strong for a bank growing assets at 12% a year.

Full-year 2025 net income: $29 million. Record.

To put that in context, the bank had $500 million in total assets in 2015. Today it has $2.19 billion. That's 16% compounded annual growth over a decade, and not a single acquisition since buying Anderson State Bank in Hemingway in 2000. Every dollar of growth has come the hard way.

How does a community bank in rural South Carolina generate margins that would make most regional bank CFOs do a double-take? Two things: what they lend, and who they fund it with.

## The Tobacco Town Funding Machine

Anderson Brothers' home market is Marion County, South Carolina. This is not a glamour market.

Population: approximately 28,215 people, declining at about 0.5% per year. Median household income: $24,304. Every county in the Pee Dee region recorded more deaths than births from 2020 to 2023. The economic base is agricultural and light industrial: Sopakco Packaging, DMA Sales, tobacco farming legacy.

What that market lacks in growth it more than compensates for in deposit loyalty. Anderson Brothers holds roughly 60% of Marion County deposits. That's not a market share number, that's a lock. When you fund your loan book with low-cost deposits from a market where you've been the dominant bank for 90 years, your cost of funds stays structurally below what banks in competitive urban markets can achieve. That deposit advantage flows directly into NIM.

The bank explicitly tracks this. Management describes its retained earnings model as generating 16%+ return on reinvested capital, compounding equity without dilution. That framing is unusual for a community bank. It reflects a discipline about how deposit advantage translates into compounding shareholder value over time.

## The Non-Prime Auto Bet

The other half of the margin story is what Anderson Brothers lends.

Consumer loans represent 28.5% of the loan book, a notably high share for a bank this size. The product driving that number is non-prime indirect auto lending, a specialty the bank has deliberately built and maintained. Non-prime borrowers pay higher rates. They also default more. The bank's management is not naive about this: the shareholder letter acknowledges that auto delinquencies peaked in mid-2024 and spent most of 2025 recovering. As of early 2026, past-due accounts in that portfolio had returned to their lowest level since September 2022.

The math works because the yield on non-prime auto more than compensates for the higher loss rate, especially when you're funding it with 60%-market-share rural deposits. Anderson Brothers is essentially running a carry trade that most community banks either can't execute or won't touch. They've been doing it long enough to manage the cycle.

Credit quality across the full book is clean. Non-current loans sit at 0.52% of the portfolio. The Texas Ratio (a measure of problem assets relative to capital and reserves) is 4.16%. Any figure below 10% is considered healthy. The loan loss reserve covers non-current loans at 338%. These are not the numbers of a bank taking reckless risk.

## Six Years, Eleven Spots

The story that explains where Anderson Brothers is going is Horry County.

Myrtle Beach is a different world from Mullins. Horry County has unemployment around 3-4%, median home prices around $327,000-$360,000, over $100 million in active hotel investment, and a tourism-driven economy that has grown consistently for two decades. LinkedIn named Myrtle Beach one of its Top Cities on the Rise in July 2025.

Six years ago, Anderson Brothers Bank ranked 11th in Horry County deposit market share among 20 competing banks. Today they rank 2nd.

That's eleven spots in six years. In a market where they started as an outsider, against banks that had been there for decades.

The mechanism was a dedicated Deposit Task Force launched in 2025 that secured over $100 million from sophisticated depositors in the corridor. That capital funded loan growth in the county. Seven facility expansion projects are currently underway along the Myrtle Beach and Conway stretch. In February 2026, the board approved nine additional leadership appointments to staff the expansion.

The bank also closed a large commercial real estate loan in 21 days in 2025. The industry standard for comparable transactions is 45-90 days. Speed is not incidental to the strategy. It's the pitch.

## The Real Estate Question

There is one thing worth watching closely, and it's the Horry County housing market.

After years of pandemic-driven appreciation, the Grand Strand has cooled. Median home prices are essentially flat to slightly negative year-over-year. Inventory has expanded to roughly four months of supply. The median days on market is 116 days, up from 110 a year ago. Seventy-five percent of homes in Horry County are now closing below asking price.

None of these numbers signal a crash. They signal normalization after an unusual run. But Anderson Brothers' loan book is 66% real estate, and a meaningful share of that is in Horry County collateral. The bank's credit quality track record is strong, but it's been built partly in a rising-price environment where problem borrowers could sell their way out of trouble. That cushion is thinner now.

Management knows the Horry County market as well as anyone: they've been watching it long enough to know the difference between a correction and a cycle. The bank's 12% annual growth target explicitly accounts for market conditions. But it's the number to watch in the 2026 call reports.

## What 2025 Said About Direction

Beyond the financial results, 2025 was the year Anderson Brothers signaled it intends to be a different kind of bank going forward.

The bank simultaneously deployed three new technology platforms: FedNow for real-time payments, LoanVantage for loan origination, and RingCentral for communications. AI integration is underway across loan collections, fraud detection, compliance, and underwriting. Four new C-suite roles were created in a single restructuring, adding a COO, a Chief Credit Officer, a Chief Banking Officer, and a Chief Risk Officer.

Forbes named them 3rd best bank in South Carolina on their inaugural America's Best in State Banks list, based on customer surveys covering trust, digital services, branch services, and financial advice.

For a 92-year-old bank headquartered in a town of 4,500 people, this is a lot of momentum. The tobacco warehouse is long gone. What replaced it is a bank running margins its competitors can't quite explain, from a deposit base that took 90 years to build, pointed directly at one of the fastest-growing coastal markets in the South.

The Anderson family has been patient before. Thirty dollars turned into a thousand. The next move is into Myrtle Beach.
    `,
  },
  'income-verification-fintech-vs-bank': {
    title: 'The $70 Phone Call: How Fintechs Are Killing the Income Verification Tax',
    description:
      'Community banks pay $55–$280 per file to verify borrower income through The Work Number and IRS transcripts. Plaid does it in seconds for $1–$3. The gap is not regulatory necessity — it\'s infrastructure debt.',
    publishedDate: 'May 30, 2026',
    readTime: '6 min read',
    content: `
Here's a number worth sitting with: a community bank can pay more to verify a borrower's income than it costs to buy a tank of gas, a nice dinner, or a month of streaming services. Sometimes all three.

The Work Number, Equifax's employment verification database, charges lenders $55 to $70 per standard verification order. For a two-borrower mortgage file requiring verification at underwriting and again before closing, that's $140 to $280 per loan, before accounting for the cases where verification fails and someone has to pick up the phone. The Community Home Lenders of America (CHLA) formally asked regulators to scrutinize the pricing. An antitrust class action filed in 2024 documented a 272% price increase since 2012, when the same verification cost $17.85. Equifax has a near-monopoly on automated employment data for GSE lending. They know it.

Meanwhile, Plaid returns income verification results in seconds. For somewhere between $1 and $3 per pull.

That gap is not a feature of borrower complexity or regulatory necessity. It's the cost of doing business on aging infrastructure, and it's one reason why fintechs serving personal loan and auto markets are lapping community banks on speed and economics, even when the underlying borrower population is identical.

## What Plaid Actually Does

Plaid Income is not one product. It's three verification paths that route automatically based on what data is available.

The first path is payroll connectivity. The borrower authenticates directly into their payroll account (ADP, Gusto, Workday, and roughly 250,000 other employers covering an estimated 80% of the US workforce). Plaid pulls structured data from the same source as the pay stub: gross income, pay frequency, employer name, job title, employment start date. The result is instantaneous once the user logs in.

The second path is bank income analysis. The borrower connects a checking account. Plaid's machine learning pipeline runs against up to 24 months of transaction history, extracts recurring income streams, classifies them into 13 categories (salary, gig economy, pension, long-term disability, and more), and returns a structured income report. For straightforward W-2 earners with direct deposit, this takes about 11 seconds. That's the actual measured response time from a published case study with Purpose Financial, a high-volume consumer lender.

The third path is document upload: pay stubs, W-2s, 1099s. Plaid's OCR and fraud detection layer checks more than 30 signals including photoshopped paystubs and name alterations, assigns a fraud risk score, and extracts the relevant figures.

In April 2026, Plaid announced it rebuilt its income classification layer using a transformer-based large language model trained on financial transaction data, claiming a 48% improvement in accuracy and 86% precision on earned income classification. The self-employed income category, historically the hardest to classify correctly because of irregular payment patterns, is now a named category for the first time.

The product also operates as a consumer reporting agency under Plaid Check, meaning income reports are FCRA-compliant and can be used in credit decisioning with adverse action notice requirements.

## What a Community Bank Actually Does

The traditional income verification chain for a mortgage involves several sequential steps, most of which cannot be parallelized and several of which involve waiting on parties the lender cannot control.

The borrower submits two recent pay stubs, two years of W-2s, and one to two years of federal tax returns. The lender orders tax transcripts from the IRS using Form 4506-C through the Income Verification Express Service (IVES). The IRS targets 10 business days for processing. That's two calendar weeks, minimum, assuming nothing goes wrong.

Here's what goes wrong: the IRS rejects 30–40% of all 4506-C requests. When a form is rejected, the IRS returns it without an error code. The lender has to diagnose the problem, correct the form, and resubmit from scratch, restarting the 10-business-day clock. A single rejection cycle can consume the entire back half of a 30-day purchase closing window.

Meanwhile, the lender also needs to verify employment. If the employer is in The Work Number's database, an automated report comes back instantly. But The Work Number's coverage is inconsistent for small businesses, nonprofits, newer companies, and gig platforms. When an employer isn't in the database, a human initiates outbound verification: independently validate the employer's phone number and physical location, call HR, verbally confirm employment status and job title, and obtain income details in a separate written format. Fannie Mae requires a verbal VOE completed within 10 business days of the loan note date regardless, which means lenders cannot do this step early. It becomes a closing-week bottleneck on every single file.

For self-employed borrowers, add a year-to-date profit and loss statement to the stack. Underwriting complexity scales up from there.

**Total income verification cost per mortgage file:** IRS transcript ($40+ per order, plus resubmission costs), Work Number ($55–280 depending on borrower count and timing), staff time for manual calls and document chasing. The average cost to originate a mortgage was approximately $11,800 in Q2 2025. Income verification is not a trivial line item.

## The Step-by-Step Comparison

Here's the same borrower moving through both systems.

**Salaried W-2 employee, direct deposit, major employer:**

| Step | Plaid | Traditional |
|---|---|---|
| Income data pull | Borrower logs into payroll portal: ~90 seconds | Borrower uploads pay stubs: minutes to days |
| Verification result | 11 seconds (bank income) or immediate (payroll) | Work Number: instant if employer is listed |
| Tax transcript | Not required for bank/payroll path | 4506-C: 10 business days minimum, 30–40% rejection rate |
| Verbal VOE | Not required | Required within 10 days of note date |
| Cost per file | $1–3 | $55–280+ |

**Gig worker or self-employed borrower:**

This is where the gap gets uncomfortable. Plaid's bank income ML now specifically handles irregular income streams and launched a dedicated self-employed classification category in April 2026. A borrower who drives for Uber, delivers for DoorDash, or runs a freelance design practice can connect their bank account and Plaid identifies, clusters, and categorizes the income streams automatically.

The traditional process for that same borrower requires two years of tax returns, a year-to-date P&L, possible additional scrutiny from the underwriter, and all of the IRS transcript delays described above. Self-employed borrowers are one of the most underserved segments in mortgage lending. The documentation burden alone disqualifies people who would otherwise qualify on the merits.

## The GSE Wrinkle

The obvious question: if Plaid is faster and cheaper, why isn't every lender using it for mortgages?

The honest answer is that GSE lending has specific requirements that bank transaction data alone cannot fully satisfy. Fannie Mae and Freddie Mac have their own approved vendor lists for income and employment validation. Plaid is a certified Fannie Mae Day 1 Certainty provider, which is meaningful progress. Fannie Mae updated its Desktop Underwriter in March 2024 to allow a single 12-month bank asset report to simultaneously validate income, employment, and assets, a structural change that directly benefits open banking providers.

But the full mortgage stack still requires tax transcripts for most self-employed borrowers, the verbal VOE requirement doesn't disappear, and The Work Number remains the default for large employers because it produces a report that maps directly to Fannie Mae Form 1005. Plaid supplements the traditional chain more than it replaces it, at least in the mortgage context.

For consumer installment loans, auto lending, and rental applications, the substitution is more complete. Purpose Financial, which has originated over 134 million loans, reported a 71% lift in customers able to instantly verify income after switching to Plaid, with a 99.8% approval rate for applicants who verified via the platform versus 78% for those going through the manual process.

## What This Means for Community Banks

The verification stack is a cost center that community banks have largely inherited rather than chosen. The Work Number's pricing power is a known problem: CHLA formally asked regulators to investigate in 2024, and antitrust litigation is now in the courts. The IRS transcript process has a rejection rate that would be unacceptable in almost any other operational context. Both constraints are structural, not borrower-driven.

Fintechs serving non-GSE loan categories have walked away from that infrastructure entirely. They've built on open banking APIs where the data is faster, cheaper, and more current than anything in The Work Number or an IRS file. Community banks originating consumer loans, personal lines of credit, or auto products have the same option.

The mortgage market is more constrained by GSE requirements, but even there, Plaid's Fannie DU certification means a bank could offer a genuinely faster pre-qualification experience by pulling bank income data upfront, before the full application stack starts, reducing borrower churn during the wait.

The verification delay is not an immutable fact of lending. It's a product of infrastructure built on top of institutions (a credit bureau, the IRS) that did not design their systems around lender speed. The data already exists in the borrower's bank account. How long lenders pay a premium to access it the slow way is increasingly a choice.
    `,
  },
  'southern-first-bank-upstate-sc-bet': {
    title: 'The Bank That Bet on Upstate South Carolina (And Won)',
    description:
      'Southern First Bancshares just reported Q4 EPS up 73% year-over-year. The story behind that number is 30 people a day moving to Greenville-Spartanburg, a $1.7 billion BMW investment, and a 26-year-old relationship banking bet that\'s finally paying off.',
    publishedDate: 'May 24, 2026',
    readTime: '8 min read',
    content: `
Art Seaver has been running Southern First Bank for 26 years. He's watched Greenville go from a post-textile mill town to a metro that just crossed one million residents. That context matters when you look at what his bank just reported.

Q4 2025 earnings per share: $1.21. Up 73% from a year ago.

## The Numbers First

Southern First Bancshares finished 2025 with $30.4 million in net income, a net interest margin of 2.72% (up 47 basis points year-over-year), and a loan book that grew 6% to $3.85 billion. CEO Seaver, President Justin Strickland, and CFO Andy Borrmann have spent the last two years fighting margin compression like every other community bank in America. They've come out the other side in genuinely strong shape.

The credit quality numbers are almost hard to believe.

Net charge-offs for the entire year: $69,000. On a $3.85 billion portfolio. That's not a rounding error, that's a bank whose borrowers are paying their bills. Nonperforming assets sit at 0.32% of total assets. Past due loans are 0.13%.

That kind of performance doesn't happen by accident. It happens when you're lending into a market that keeps growing.

## 30 People a Day

Here's the thing about Upstate South Carolina that most people outside the region don't fully appreciate.

Thirty people relocate to the Greenville-Spartanburg area every single day. South Carolina netted over 68,000 domestic migrants in 2023-2024 alone, and the Upstate captured the overwhelming share of that growth. They're coming from Florida, New York, Ohio, Michigan, Pennsylvania, Connecticut, California. People leaving high-cost metros and landing in a place where the cost of living runs as much as 88% lower than Manhattan.

Greenville County added 11,049 new residents in a single year. Spartanburg is the third-fastest growing metro in the country. The Greenville metro just crossed one million people for the first time, adding nearly 86,000 residents since the 2020 Census.

Every one of those households needs a checking account. A mortgage. A car loan. A small business line of credit when the new restaurant opens on Main Street. Southern First has been standing in that town for over two decades, with the relationships and the brand recognition to capture a meaningful slice of that demand.

That's not luck. That's geography compounding over time.

## The BMW Effect

Migration doesn't happen in a vacuum. People follow jobs, and the Upstate has been manufacturing jobs at a remarkable clip.

BMW's plant in Spartanburg is already the largest BMW Group facility in the world by production volume. Now they're doubling down. A $1.7 billion investment in EV production, plus a new battery plant in Woodruff set to open in 2026, will bring hundreds more jobs online in Southern First's backyard. The annual economic impact of the BMW operation alone totals approximately $26.7 billion across South Carolina, per a University of South Carolina study.

Spartanburg County landed $3.5 billion in total new investment last year across 20 projects. Greenville's development arm secured $725 million in new capital and 1,293 jobs. The region now hosts 508 foreign companies from 38 countries, drawn by the BMW supplier ecosystem, Michelin, Boeing, GE, Lockheed Martin, and a manufacturing base that keeps expanding.

When a bank's loan book is 44% commercial real estate and 30% consumer real estate, this is the environment you want to be operating in. Rising incomes, population inflows, new commercial construction, and homebuyers who came from markets where $312,000 felt like a deal.

## What the Margin Recovery Actually Means

Southern First's NIM story is worth unpacking because it tells you something about how they're positioned going forward.

Two years ago, like most community banks, they were caught in a painful squeeze. Deposit costs rose fast. Loan yields repriced slowly. Margins compressed. The 2.72% they're reporting now isn't just a recovery, it's the result of a deliberate push into relationship-based deposit gathering that took time to show up in the numbers.

Core deposits grew 8% year-over-year to $2.9 billion. That's the stat that matters most. It means the funding base is stable and relatively low-cost. It means the margin expansion isn't just a rate environment gift, it's structural.

Efficiency ratio came in at 57.85% in Q4. Not best-in-class, but moving in the right direction for a bank that's been investing in growth markets.

## The Question Worth Asking

Southern First is, by almost any measure, performing well. The region they serve is genuinely one of the best economic stories in the country right now.

But 74% of their loan book is in real estate, commercial and consumer combined. And the Greenville housing market is shifting.

Inventory is up 28.2% year-over-year. Days on market climbed to 71, up from 62 a year ago. The median sales price dipped 0.8%. None of these numbers signal a crash. They signal a market normalizing after years of frenzied appreciation, which is healthy. But normalization looks different on a bank balance sheet than it does in a real estate brochure.

The honest read is that Southern First's credit quality has benefited from a rising-tide market. Borrowers who got in trouble could sell. Collateral values held. That cushion is thinner now. Not gone, just thinner.

The BMW battery plant opens next year. Migration is still running at 30 people a day. The industrial investment pipeline is full. Those are real tailwinds and Art Seaver has been navigating this market long enough to know the difference between a headwind and a speed bump.

For now, the numbers say this is a bank that has earned the right to be optimistic.
    `,
  },
  'foreclosure-wave-hiding-in-plain-sight': {
    title: 'The Foreclosure Wave Is Already Here. Your Bank Just Can\'t See It Yet.',
    description:
      '118,727 households entered foreclosure in Q1 2026, up 26% from a year ago. Your call report probably looks fine. Here\'s why that\'s the problem.',
    publishedDate: 'May 24, 2026',
    readTime: '7 min read',
    content: `
118,727 households. That's how many American families entered foreclosure in the first three months of 2026.

Up 26% from a year ago. The worst quarterly number in six years. And in March alone, filings jumped 28% year-over-year.

Your bank's residential mortgage portfolio is probably showing sound credit quality right now. Both things are true at the same time. That gap is exactly what should keep you up at night.

## The Stress Has an Address

This isn't a broad-based mortgage collapse. It's surgical. Almost all of it is concentrated in one loan type: FHA.

As of March 2026, **11.6% of FHA borrowers were delinquent.** FHA loans now account for **55% of all seriously delinquent mortgages** in the country, despite being a fraction of total outstanding balances.

Community banks mostly originate conventional conforming loans. Stronger borrower profiles. Better coverage ratios. So your call report looks fine. The Fed's May 2026 Financial Stability Report says residential mortgage delinquencies at commercial banks "remained historically low." The FDIC's 2026 Risk Review agrees: credit quality in residential portfolios is "relatively sound."

All of that is accurate.

It's also a lagging indicator.

## Who Actually Takes Out an FHA Loan

First-time buyers. Lower-income households. Borrowers with credit scores that don't quite clear the conventional bar. Minimum 3.5% down. Higher debt-to-income ratios. Little margin for error.

These aren't reckless borrowers. In many cases they're the first homeowners in their families. But the math has turned on them in ways the original underwriting never captured.

- **Homeowners insurance is up 12%,** now averaging $2,948 per year
- **Property taxes rose 3%,** averaging $4,427
- Both costs hit after closing, after the DTI calculation, after the loan is on the books

The FDIC flagged insurance and taxes explicitly in its 2026 Risk Review as costs "further hampering affordability." These aren't rate-sensitive. They don't improve when the Fed cuts. They just keep going up.

Picture a borrower who closed on an FHA loan in Florida in 2022. Fixed mortgage payment. But insurance? Not fixed. Taxes? Not fixed. And the equity cushion they were counting on is compressing as prices in their market soften. There's no room left.

## The Net Just Got Pulled Away

Here's the part that turns a stress situation into a crisis.

The federal programs that historically caught falling borrowers are disappearing, right now, as the stress peaks.

**FHA partial claims** (the program that let servicers defer missed payments to a subordinate lien so borrowers could get current without a lump sum) just had its rules tightened. Borrowers can access it once every two years, with a 30% lifetime cap. It used to be more flexible. It isn't anymore.

**The VA loan rescue program** ended entirely.

**The Homeowner Assistance Fund** ($9.9 billion in pandemic-era grants for struggling homeowners) depletes in September 2026.

These programs were imperfect. They also worked. They're why the 2020-2022 forbearance wave didn't turn into a foreclosure wave. That buffer is gone now, and analysts are projecting roughly **250,000 distressed property sales** over the next 12 to 18 months.

## Why This Should Matter to Your Loan Committee

The direct exposure to FHA delinquencies probably isn't your problem. The indirect exposure is.

Distressed sales don't spread evenly across 50 states. They cluster in the markets with the highest FHA concentration and the sharpest insurance increases: Florida, Nevada, and **South Carolina**, where **1 in every 2,351 housing units** is already in some stage of foreclosure, before the safety net programs expire.

For a community bank with a residential portfolio concentrated in those markets, a few things are worth watching:

- **Appraisals on new originations** are starting to absorb distressed comps
- **Borrowers who look fine at application** may be quietly draining reserves to cover insurance and tax increases
- **Portfolios originated in 2021-2023** were underwritten against a different market than the one forming now

The FDIC doesn't predict a crisis. "Relatively sound underwriting standards and generally higher equity levels will likely offset potential credit quality risks," the report says. That's probably right at the national portfolio level.

It may not be right in Myrtle Beach.

## The Number to Watch Is Q3

The foreclosure tightening took effect this spring. The Homeowner Assistance Fund runs out in the fall. Servicers who've been working through loss mitigation options will hit the end of the waterfall for a meaningful group of borrowers around the same time.

No recession required. Just the current conditions, flat or softening home prices, insurance costs that don't stop climbing, a federal safety net with fewer rungs, continuing exactly as they are.

**118,727 foreclosures in 90 days.** That's not a blip.

The wave isn't coming. It's already in the water. Most community bank balance sheets just haven't felt the pull yet.
    `,
  },
  'why-it-takes-42-days-to-close-a-mortgage': {
    title: 'Why It Takes 42 Days to Close a Mortgage (And What That\'s Costing Your Bank)',
    description:
      'The average mortgage takes 42 days to close. FHA loans take 77. The average file is 500 pages thick. Every one of those days costs money in staff time, borrower patience, and loans that never close.',
    publishedDate: 'March 24, 2026',
    readTime: '8 min read',
    content: `## Where the Time Actually Goes

Forty-two days sounds like a process problem. It is — but not the kind most banks think.

The bulk of that timeline sits in underwriting and verification. Collecting pay stubs. Chasing down employment letters. Waiting for borrowers to scan and upload bank statements. Reconciling documents that arrive in different formats, at different times, with different levels of completeness.

According to Plaid, lenders "still fall back on manual, document-based processes" even when digital alternatives exist. The borrower fills out an application in 20 minutes, then spends the next five weeks feeding paper into a system that was designed for fax machines.

Underwriting alone consumes 30 to 50 of those 42 days. Not because underwriters are slow — because they're waiting. Waiting for documents. Waiting for third-party verifications. Waiting for the borrower to respond to the third email asking for a corrected W-2. As Blend's research describes it, traditional lending is defined by "clunky, disconnected onboarding journeys" — and their analysis estimates that automating these workflows could save banks up to $70 billion industrywide.

## The Real Cost: $11,094 Per Loan, $785 in Profit

The MBA's 2025 data puts the average cost to originate a mortgage at $11,094. That includes personnel, technology, occupancy, and overhead — everything it takes to move a loan from application to closing.

The average profit per loan? $785.

That's a 7% margin on a process that takes six weeks and involves dozens of manual steps. Origination costs have risen 35% over the past three years, according to Plaid's lending research. Revenue per loan has not kept pace.

At $11,094 per origination across a 42-day cycle, the daily carrying cost of an in-process loan is roughly $264. Every day a file sits waiting for a document is a day that cost accrues. Multiply that by your pipeline volume and the number gets uncomfortable fast.

## The Abandonment Problem

Here's where the cost becomes invisible — because it's the loans you never close.

Sixty-eight percent of mortgage applications are abandoned before closing, according to industry data tracked by the MBA. That's not 68% of unqualified applicants. That includes pre-approved borrowers who started the process and quit.

The reasons are predictable. The process is too slow. The document requests are too frequent. The communication is too opaque. Forty-eight percent of consumers who experience digital friction in financial services take their business to a competitor, according to J.D. Power.

Only 55% of mortgage applications at banks result in closings. That means for every two loans your team works, nearly one produces zero revenue — but consumed staff time, technology resources, and pipeline capacity.

Those borrowers aren't disappearing from the market. They're closing with someone else.

## The NPS Cliff

Borrower satisfaction data tells the same story from the other side.

When borrowers need to call their lender for status updates — because the process doesn't proactively communicate — their Net Promoter Score drops by 83 points, according to J.D. Power's mortgage origination studies.

Eighty-three points. That's the difference between a promoter who refers three friends and a detractor who posts a one-star review. And it's driven by a single variable: whether the borrower felt informed or left in the dark.

In a 42-day process with dozens of moving parts, most borrowers end up calling. Most loan officers end up fielding those calls instead of originating new loans. The cycle reinforces itself.

## What Figure, Better, and Rocket Are Doing Differently

While community banks are managing 42-day timelines, a different class of lender has rewritten the math.

**Figure** approves HELOCs in 5 minutes and funds in 5 days. Their cost per loan is $730 — against an industry average of $11,230. That's a 15x cost advantage, and it drove $340.9 million in net revenue in 2024, up 62.7% year-over-year. They IPO'd at a $5.29 billion valuation.

**Better.com** issues mortgage commitment letters in 24 hours and closes HELOCs in 3 days. Their HELOC volume grew 416% year-over-year in Q4 2024.

**Rocket Mortgage** closes 2.5x faster than the industry average, with initial approval in 8 minutes. They originated $130.4 billion in 2025 and hold 6.33% national market share.

None of these companies built a better branch network. They built automated verification pipelines that pull income, identity, employment, and asset data in real time — eliminating the weeks of document collection that define the traditional process.

As Better.com puts it: "The traditional processes around homeownership are opaque and stressful... the industry operates in the same way it has for decades — through opaque systems and expensive intermediaries."

## The Community Bank Bind

Community banks can't out-spend Rocket's technology budget. They shouldn't try. But they also can't keep running a 42-day process against competitors who close in 5.

The constraint isn't talent or service quality. Community bank loan officers consistently outperform on relationship metrics. The constraint is verification infrastructure — the plumbing that connects a borrower's financial data to an underwriting decision.

As Fed Governor Bowman acknowledged, "Community banks face competitive pressures from many sources... competitors can take the form of traditional banks, internet banks, and non-banks like fintechs." The pressure is real and it's recognized at the regulatory level.

When that plumbing is manual, it takes weeks. When it's automated, it takes minutes. The borrower experience is the same either way: they share their information and wait for an answer. The difference is whether the answer comes in 5 minutes or 5 weeks. And in a market where 48% of digitally frustrated consumers walk, that difference determines whether your pipeline converts or evaporates.

## How RAVEN Changes This

RAVEN is a verification platform built specifically for community banks. Instead of collecting documents over weeks, a loan officer sends one link. The borrower verifies their identity, income, employment, and assets in under 5 minutes — on any device, no branch visit required.

On the back end, RAVEN pulls from the same data sources the fintechs use: Plaid for financial accounts and income, Truework for employment, Socure for identity and fraud screening, ATTOM and Melissa for property data. Every data point is cross-referenced, timestamped, and delivered in an examiner-ready report with a full audit trail.

No six-figure platform contract. No 18-month implementation. Per-verification pricing that scales with your volume.

The 42-day mortgage isn't inevitable. It's a symptom of manual verification in a world where automated alternatives exist. The fintechs figured that out. Community banks can too — without giving up the relationship banking that makes them irreplaceable.

---

*See how RAVEN works for community banks at [reportraven.tech](https://reportraven.tech).*`,
  },

  'community-banks-are-losing-the-lending-race': {
    title: 'Community Banks Are Losing the Lending Race. Here\'s How to Catch Up.',
    description:
      'Banks originated 42.5% of mortgages in 2018. By 2024, that fell to 30.1%. Non-bank lenders now close more than half of all home loans. This is a structural shift, and it is accelerating.',
    publishedDate: 'March 24, 2026',
    readTime: '9 min read',
    content: `In 2018, banks originated 42.5% of all mortgages in the United States. By 2024, that number had fallen to 30.1%. Non-bank lenders — fintechs, independent mortgage companies, and digital-first platforms — now close more than half of all home loans, at 53.3% and climbing, according to the NCRC Mortgage Market Report and FDIC data.

This isn't a blip. It's a structural shift that has been accelerating for six years, and it's not limited to mortgages. Community banks' share of small business lending has been cut in half over two decades, falling from 24% to 12%, according to the Kansas City Fed. Fintech small business loan applications grew from 17% to 29% between 2020 and 2025.

Community banks aren't losing because of bad service. They're losing because the speed of their lending process no longer matches the speed their borrowers expect.

## The Scale of the Problem

The numbers paint a clear picture of an industry in retreat.

Community banks hold 97% of all bank charters in the United States but control only 14% of total deposits, according to the FDIC. In 2024, 44% of new checking accounts were opened at fintechs or neobanks — not at traditional banks of any size.

The generational pipeline is worse. Fifty-four percent of Gen Z rely primarily on non-traditional financial providers, according to a 2024 study from Cornerstone Advisors. Only 14% of Gen Z trust traditional banks "a lot." Sixty-one percent switched banks in the past two years.

These aren't borrowers who are hostile to community banks. Most of them have never walked into one. By the time they need a mortgage or a business line of credit, their financial life already lives on a platform that processes requests in minutes — not weeks.

## Why Fintechs Are Winning (It's Not Magic)

The fintech advantage isn't some proprietary algorithm or billion-dollar AI system. It's automated data aggregation applied to a process that banks still run manually.

When a borrower applies for a HELOC through Figure, here's what happens: they enter basic information, connect their bank account, verify their identity digitally, and receive an approval in 5 minutes. Funding follows in 5 days. No scanning. No faxing. No branch visit. No 42-day timeline.

Behind the scenes, Figure is pulling the same types of data that a community bank loan officer collects by hand — income, assets, employment, identity, property value. The difference is that Figure pulls it programmatically from data providers in real time, cross-references it automatically, and renders an underwriting decision without a human touching a piece of paper.

Better.com does the same for mortgages, issuing commitment letters in 24 hours. Their HELOC volume grew 416% year-over-year in Q4 2024. Rocket Mortgage closes 2.5x faster than the industry average, with initial approval in 8 minutes. Upstart makes personal loan decisions in seconds, with 91% of loans fully automated.

None of these companies invented new financial products. They automated the verification layer that sits between application and decision — and that's where all the time goes in a traditional lending process.

## The Cost Gap That's Killing Competitiveness

The financial impact of this technology gap is stark.

Figure originates loans at a cost of $730 each. The industry average, according to the MBA, is $11,230. That is a 15x cost advantage — not because Figure pays its employees less or cuts corners on compliance, but because automation eliminates the manual labor that drives origination cost.

Figure generated $340.9 million in net revenue in 2024, up 62.7% year-over-year, and IPO'd at a $5.29 billion valuation. That valuation wasn't built on a better marketing campaign. It was built on a cost structure that traditional lenders cannot match with manual processes.

At the MBA's reported average of $11,094 per mortgage origination and $785 in profit per loan, community banks are running on a 7% margin for a process that takes six weeks. Figure runs on a fraction of the cost with a process that takes days. The math is not subtle.

When origination costs have risen 35% over the past three years, according to Plaid, and the competitive set is operating at a fraction of that cost, the pressure compounds. Every quarter that passes without closing the gap makes the next quarter harder.

## The Technology Gap Is Not About Budget

The instinctive response from most community bank leadership is: "We can't compete with Rocket's technology budget." That's true — and also irrelevant.

Rocket spent years and hundreds of millions building a proprietary loan origination system. Figure built on blockchain infrastructure (though their SEC filing quietly notes their LOS "does not rely on the use of blockchain technology" — the speed comes from automated data aggregation, not distributed ledgers). Better.com rebuilt the mortgage stack from the ground up.

Community banks don't need to replicate any of those builds. The competitive advantage these fintechs share isn't a single piece of proprietary technology. It's the fact that they automated the verification and data collection layer — the part of the lending process that consumes 70% to 80% of the elapsed time in a traditional origination.

That layer is now available as infrastructure. The same data providers that power Figure's 5-minute approval — Plaid for financial data, identity verification services, employment verification APIs, property data feeds — are accessible to any lender willing to integrate them.

The question for community banks is not whether to build a billion-dollar technology platform. It's whether to keep collecting pay stubs by email while competitors pull the same data programmatically in seconds.

## The Opportunity Hiding in the Data

Here is the number that should give every community banker hope: 70% of small businesses say they prefer to bank with a community institution, according to Federal Reserve small business survey data.

Seventy percent. But only 31% actually do.

That gap — between preference and behavior — is the entire opportunity. Small business owners want the relationship, the local knowledge, the flexibility, and the human judgment that community banks provide. They switch to fintechs anyway because they need speed, because they can't wait 60 to 90 days for an SBA loan decision, and because a Kabbage or OnDeck approval comes in 7 to 10 minutes while a community bank is still requesting two years of tax returns.

The same dynamic plays out in consumer lending. Borrowers don't leave community banks because they dislike them. They leave because someone else gave them an answer faster. According to J.D. Power, 48% of consumers who experience digital friction in a financial interaction take their business to a competitor.

Community banks don't have a demand problem. They have a speed problem. And speed, unlike brand affinity or market presence, is a solvable engineering challenge.

## What Community Banks Can Do Today

Closing the technology gap doesn't require a multi-year digital transformation initiative or an eight-figure contract with a core processor. It requires automating the specific bottleneck — verification and data collection — that accounts for most of the time difference between a fintech close and a community bank close.

Practically, that means:

**Automated income and asset verification.** Instead of requesting pay stubs and bank statements, pull them directly through consumer-permissioned data connections. This alone can cut days or weeks from the process.

**Real-time identity and fraud screening.** Instead of manual KYC reviews that take hours per applicant, run automated checks against identity databases and watchlists in seconds.

**Digital employment verification.** Instead of calling employers and waiting for HR to return a fax, query employment verification databases that return results immediately.

**Automated property data.** Instead of ordering appraisals and waiting for scheduling, pull automated valuation models and property records for preliminary underwriting.

Each of these capabilities exists as a standalone service. The challenge for community banks has been integrating them into a coherent workflow without a dedicated engineering team.

## How RAVEN Bridges the Gap

RAVEN was built to solve exactly this problem. It is a verification platform designed for community banks — not a core replacement, not a loan origination system, and not an 18-month implementation project.

A loan officer sends one link to a borrower. The borrower opens it on any device, enters their information, and connects their financial accounts. In under 5 minutes, the bank receives a complete verification report: identity and fraud screening from Socure, financial accounts and income from Plaid, employment verification from Truework, and property data from ATTOM and Melissa.

Every data point is cross-referenced across sources. When Plaid-reported income matches Truework-verified salary, confidence goes up. When they don't match, the discrepancy is flagged before the file reaches the loan committee. The full audit trail is examiner-ready from day one.

The result is a community bank that underwrites with the same speed and data quality as a fintech — but retains the relationship, local expertise, and borrower trust that no algorithm can replicate.

Figure proved that a $730 cost-per-loan is achievable with the right verification infrastructure. RAVEN brings that same infrastructure to banks that don't have Figure's engineering team, Rocket's technology budget, or Better's venture capital.

Community banks have something fintechs cannot build: decades of trust, local market knowledge, and borrower relationships that run deeper than a mobile app. What they've been missing is the speed to match. That gap is closable — and the banks that close it first will be the ones that stop losing the lending race.

---

*Request a demo at [reportraven.tech](https://reportraven.tech).*`,
  },

  'next-generation-borrowers-wont-wait': {
    title: 'Your Next Generation of Borrowers Won\'t Wait 42 Days',
    description:
      '54% of Gen Z rely primarily on non-traditional financial providers. 61% switched banks in the last two years. Only 14% trust traditional banks "a lot." Your future borrowers are already gone.',
    publishedDate: 'March 24, 2026',
    readTime: '8 min read',
    content: `**54% of Gen Z rely primarily on non-traditional financial providers. 61% switched banks in the last two years. Only 14% trust traditional banks "a lot." Your future borrowers aren't just preferring digital — they're already gone.**

---

## The Generational Shift, in Hard Numbers

The data on younger consumers and banking is no longer directional. It is definitive.

According to a 2024 J.D. Power study, 29% of Gen Z consumers now consider a digital bank their primary checking account provider — up from 11% in 2020. Across all age groups, 44% of new checking accounts opened in 2024 went to fintechs and neobanks, not traditional banks (Cornerstone Advisors). Among Gen Z specifically, 54% rely primarily on non-traditional financial providers for core banking services (TransUnion, 2024).

And they are not sticking around to be won back. 61% of Gen Z consumers switched their primary bank in the past two years (Bankrate), compared to 28% of Gen X and 15% of boomers. Only 14% of Gen Z say they trust traditional banks "a lot" (Morning Consult).

This is not a preference. It is a migration.

For community banks, where the median customer age skews older and relationship tenure is measured in decades, these numbers represent a slow-moving but existential problem. The generation entering its prime borrowing years — first homes, auto loans, small business starts — is building financial relationships with Square, Chime, SoFi, and Robinhood. Not with your branches.

## The Experience Gap

Gen Z logs into mobile banking 21 times per month, compared to 14 for millennials and 9 for boomers (Insider Intelligence). They interact with financial services more frequently than any prior generation — but through their phones, not your lobbies.

This is the context in which they encounter mortgage lending for the first time.

J.D. Power's 2024 U.S. Mortgage Origination Satisfaction Study pegged overall satisfaction at 760 out of 1,000 — with digital experience scores declining year-over-year. The specific pain points tracked directly to what younger borrowers tolerate least: lack of transparency into loan status, excessive document requests, and slow response times from loan officers.

When borrowers need to call for a status update, NPS drops by 83 points (ICE Mortgage Technology). For a generation that tracks packages in real time and gets Uber ETAs down to the minute, calling a loan officer to ask "where's my file?" is not an inconvenience. It is a disqualifying experience.

## What "Digital" Actually Means to a Borrower

Many banks describe their lending process as "digital" because they offer a PDF application form on their website, or because borrowers can upload documents through a portal. That is not what digital lending means to a Gen Z borrower.

Here is what digital lending looks like from the borrower's side at the fintechs already winning this generation's business:

**Figure**: The borrower opens a link on their phone. They enter basic information, connect their bank account, and receive a HELOC approval in 5 minutes. Funding arrives in 5 days. No branch visit, no document scanning, no phone tag with a processor. Figure funded $6 billion in home equity products in 2024, at a cost of $730 per loan — versus the industry average of $11,230 (Figure S-1 filing).

**Better.com**: A borrower can get a mortgage commitment letter in 24 hours and a HELOC approved in the same day. Better's HELOC volume grew 416% year-over-year in Q4 2024. Their positioning is explicit: "The traditional processes around homeownership are opaque and stressful... the industry operates in the same way it has for decades."

**Rocket Mortgage**: Approval in 8 minutes. Closing 2.5x faster than the industry average. Rocket processed $130.4 billion in originations in 2025 and built its market share to 6.33% — largely by making the borrower's experience feel effortless. Behind the scenes, Rocket processes 1.5 million documents per month, with 70% auto-identified and routed without human intervention. Borrowers never see the work.

The common thread is not that these companies have superior underwriting judgment. It is that the borrower's experience — the part they see — requires almost nothing from them. Open a link. Connect your bank. Done.

## Contrast That With the Typical Community Bank Experience

A first-time homebuyer walks into a community bank branch (or more likely, finds the bank's website). Here is what follows:

- Download or print a multi-page application
- Gather two years of tax returns, two months of bank statements, pay stubs, W-2s, ID documents
- Scan or photograph each document (often poorly)
- Upload to a portal, email to a loan officer, or physically deliver to a branch
- Wait for the loan officer to review, request clarifications, ask for additional documents
- Repeat the document cycle two or three more times as underwriting surfaces questions
- Call or email for status updates, often getting voicemail
- 42 days later — if the loan doesn't fall through — close in person at a title office

Every step in that process is a step where the borrower can abandon. And they do. 68% of mortgage applications started online are never completed (MBA). Among borrowers who experience digital friction, 48% take their business to a competitor (Signicat).

For a Gen Z borrower whose baseline expectation was set by Figure and Rocket, this process is not "traditional." It is broken.

## Community Banks Can Deliver the Same Experience

The good news: the technology gap between fintechs and community banks is not about proprietary algorithms or billion-dollar R&D budgets. When you break down what Figure and Better actually do, the speed advantage comes from one thing — automated data aggregation and verification.

Instead of asking borrowers to gather documents, these lenders pull the data directly. Income comes from payroll connections and bank transaction analysis. Identity is verified against authoritative databases in seconds. Employment is confirmed through direct employer integrations. Property data is pulled from public records and automated valuation models.

The borrower's experience is fast because the borrower doesn't do the work. The system does.

Community banks do not need to build this infrastructure from scratch. They need access to the same verification pipeline, delivered in a way that fits their existing workflows.

## RAVEN: The Fintech Borrower Experience, Through Your Bank

RAVEN gives community banks the same automated verification layer that powers Figure, Better, and Rocket — without requiring a new LOS, a six-figure platform fee, or a dedicated IT team.

Here is what the borrower experience looks like with RAVEN:

1. Your loan officer enters the borrower's email address
2. The borrower receives a single link — works on any device
3. The borrower enters their SSN and connects their bank account — under 5 minutes
4. RAVEN pulls and cross-references identity verification (Socure KYC, fraud scoring, OFAC/PEP watchlist screening), income and financial data (Plaid bank connections), employment verification (Truework), and property data (Melissa + ATTOM) — all automatically
5. Your bank receives a complete verification report with confidence scores, source attribution, and a full audit trail

The borrower's experience is indistinguishable from what they would get at a fintech lender. Five minutes, one link, no document scanning. But the loan closes at your bank, with your relationship, under your brand.

The next generation of borrowers has already decided what lending should feel like. The question for community banks is not whether to meet that expectation — it is how fast you can get there.

---

*See how RAVEN delivers a fintech-grade borrower experience for community banks at [reportraven.tech](https://reportraven.tech).*`,
  },

  '59-billion-compliance-burden': {
    title: 'The $59 Billion Compliance Burden — And How Automation Is Cutting It in Half',
    description:
      'U.S. banks spend $59 billion a year on BSA/AML compliance alone. For community banks under $100 million in assets, compliance eats 8.7% of noninterest expenses — three times the rate at larger banks.',
    publishedDate: 'March 24, 2026',
    readTime: '10 min read',
    content: `**U.S. banks spend $59 billion a year on BSA/AML compliance alone. For community banks under $100 million in assets, compliance eats 8.7% of noninterest expenses — three times the rate at larger banks. The smallest banks pay the highest price for the same regulations.**

---

## The Scale of the Problem

Banking compliance in the United States costs an estimated $270 billion per year, consuming more than 10% of operating costs across the industry (American Bankers Association, 2024). Of that total, $59 billion goes specifically to BSA/AML — Bank Secrecy Act and anti-money laundering programs (LexisNexis Risk Solutions).

These are not optional line items. They are the cost of holding a bank charter. Every institution, from JPMorgan Chase to a $75 million community bank in rural South Carolina, must run the same categories of compliance programs: Know Your Customer (KYC), Customer Due Diligence (CDD), suspicious activity monitoring, watchlist screening, and ongoing transaction surveillance.

The regulations do not scale by institution size. The costs do — but in the wrong direction.

## The Disproportionate Burden on Community Banks

A 2023 study by the Conference of State Bank Supervisors (CSBS) found that community banks with less than $100 million in assets spend 8.7% of their noninterest expenses on compliance. Banks above $1 billion spend 2.9%.

That is a 3x disparity for meeting the same regulatory obligations.

The reason is straightforward: compliance infrastructure has high fixed costs. A community bank needs the same categories of screening tools, the same types of trained personnel, and the same audit capabilities as a regional or national bank — but spreads those costs across a fraction of the revenue base.

At small community banks, compliance personnel and external consultants account for 50% to 64% of the total compliance budget (CSBS). Over 60% of industry-wide compliance spending goes to staffing (Fenergo). This is largely manual labor: reviewing documents, screening names against watchlists, verifying information across multiple sources, and documenting findings for examiners.

The economics are punishing. A community bank generating $4 million in noninterest income is spending approximately $350,000 on compliance — money that could fund two additional loan officers, a technology upgrade, or a meaningful deposit rate improvement. A large bank generating $400 million spends $11.6 million — proportionally, a rounding error.

## What It Takes to Verify One Borrower

Abstract compliance cost figures become concrete when you trace what happens each time a community bank processes a single loan application.

Before a loan officer can recommend approval, the bank must satisfy requirements from more than 20 federal regulations. For a standard mortgage borrower, the verification burden includes:

**Identity and KYC**: Under the USA PATRIOT Act and FinCEN's Customer Due Diligence Rule, the bank must verify the borrower's identity, assess risk, and screen against the OFAC Specially Designated Nationals list and Politically Exposed Persons databases. This is not a one-time check — it must be documented, timestamped, and retained.

**Income and Employment**: Regulation B (ECOA), the Truth in Lending Act, and agency guidelines require verified income documentation. The bank must confirm the borrower's stated income against actual records — pay stubs, tax returns, W-2s, or direct verification through employers.

**Financial Assets and Liabilities**: The bank needs to verify the borrower's bank account balances, existing debts, and cash reserves. This typically requires collecting and manually reviewing two months of bank statements, cross-referencing against the credit report.

**Property Valuation**: For secured lending, the Interagency Appraisal Guidelines and FIRREA require an independent assessment of collateral value.

**Suspicious Activity Monitoring**: BSA regulations require the bank to evaluate whether the transaction itself raises red flags — unusual income patterns, inconsistent documentation, structuring concerns.

Each of these verification steps historically involves separate systems, separate vendors, and significant manual labor. A compliance officer pulls a watchlist report from one vendor, checks income documentation from another source, and reviews property records from a third — then documents the findings in the bank's compliance management system.

The industry data on this process is sobering. According to Fenergo's 2023 KYC research, the average KYC review costs $2,211 per client. For corporate clients, the review takes an average of 95 days. Even routine individual screenings average 18 minutes or more per check (KPMG/Refinitiv).

The result: 70% of financial services firms report losing clients due to inefficient or slow onboarding processes (Fenergo). The compliance burden is not just a cost problem. It is a customer acquisition problem.

## The Human Cost Behind the Numbers

At a community bank with three loan officers and one compliance analyst, the math is unforgiving.

If each loan application requires 4 to 6 hours of cumulative verification and documentation work — gathering documents, running screens, cross-referencing data, preparing findings — a bank closing 15 loans per month is consuming 60 to 90 hours of staff time solely on verification. That is more than one full-time equivalent dedicated to a process that produces no revenue, only risk mitigation.

When volume spikes — during a rate drop, a HELOC promotion, or seasonal demand — the compliance bottleneck either slows closings (costing borrowers and revenue) or forces shortcuts (costing audit findings and enforcement risk). Neither outcome is acceptable.

Community bank executives know this tension intimately. The compliance team is never large enough, the tools are never fully integrated, and every new regulation adds another layer of manual process.

## How Automation Is Changing the Equation

The data on compliance automation adoption shows a market that is moving rapidly. According to KPMG, the share of financial institutions using AI-powered KYC solutions jumped from 42% to 82% in a single year (2023 to 2024). This is not a gradual trend. It is a recognition that manual compliance processes are no longer viable at current regulatory complexity.

The measurable impact of automation on compliance operations is significant:

- **Cost reduction**: Automation can reduce compliance costs by up to 60% (McKinsey, Deloitte)
- **False positives**: Automated screening reduces false positive rates by up to 70%, directly cutting the time compliance staff spend investigating non-issues (Fenergo)
- **Industry-wide savings**: Analysts estimate U.S. financial institutions could collectively save $23.4 billion through compliance automation (LexisNexis)
- **Processing speed**: Automated identity verification takes seconds versus days for manual reviews
- **Audit readiness**: Automated systems generate timestamped, immutable audit trails — eliminating the documentation scramble before examiner visits

For large banks, the automation transition is already well underway. JPMorgan Chase, Bank of America, and Wells Fargo have invested billions in compliance technology platforms that automate the bulk of screening and verification work.

The challenge for community banks is that these platforms are built for institutions processing millions of transactions. They carry enterprise price tags, require dedicated IT teams for integration, and are designed for operational scales that do not map to a 30-person bank.

Community banks need the same automation outcomes — faster verification, lower cost per review, fewer false positives, clean audit trails — delivered through tools that match their operational reality.

## What This Looks Like With RAVEN

RAVEN was built to automate the verification layer specifically for community bank lending. Not the entire compliance program — the specific, labor-intensive process of verifying borrower identity, income, employment, assets, and property data against authoritative sources.

When a loan officer initiates a verification through RAVEN, one link to the borrower triggers a cascade of automated checks:

**Identity and KYC** (Socure): Real-time identity verification, fraud risk scoring, synthetic identity detection, and document authentication — returning a confidence score, not just a pass/fail.

**Watchlist Screening** (OFAC/PEP): Automated screening against the Specially Designated Nationals list, Politically Exposed Persons databases, and global sanctions lists — with match scoring that dramatically reduces false positives.

**Income and Financial Verification** (Plaid): Direct bank account connection pulls transaction history, income patterns, and account balances — verified at the source, not from borrower-provided screenshots of bank statements.

**Employment Verification** (Truework): Direct confirmation of employer, title, tenure, and salary through payroll integrations — eliminating phone-based verification and multi-day delays.

**Property Data** (Melissa + ATTOM): Automated property valuation models, ownership records, tax assessments, and comparable sales data — pulled in seconds from authoritative real estate databases.

Every data point is timestamped, source-attributed, and stored with a complete audit trail. When the verification completes — typically in minutes — the bank receives a consolidated report that cross-references findings across all sources. When Plaid income data matches Truework salary records, the confidence score reflects the corroboration. When they diverge, the discrepancy is flagged before the file reaches a loan committee.

The compliance analyst's job shifts from gathering and documenting data to reviewing and acting on findings. The 4-to-6-hour manual verification process compresses to a review that takes minutes. The audit trail writes itself.

## The Math for a Community Bank

Consider a community bank closing 20 loans per month. At an estimated 5 hours of verification labor per loan, that is 100 hours of staff time — roughly $5,000 to $7,000 in loaded labor costs, plus vendor fees for individual screening tools, plus the opportunity cost of loan officers spending time on document collection instead of origination.

Automating the verification layer does not eliminate the compliance function. It eliminates the manual data gathering that consumes the majority of compliance time. The compliance officer still reviews findings, makes risk judgments, and signs off on decisions. But they do it from a complete, cross-referenced report instead of assembling one from scratch.

The banks spending 8.7% of noninterest expenses on compliance are not spending it on risk judgment. They are spending it on data collection, document review, and manual cross-referencing — precisely the work that automation handles better, faster, and more consistently than human labor.

The $59 billion compliance burden is real. But the portion of it that consists of manual verification — the part that slows lending, frustrates borrowers, and burns through community bank budgets — does not have to be.

---

*See how RAVEN automates the verification layer for community bank lending at [reportraven.tech](https://reportraven.tech).*`,
  },

  'how-figure-closes-heloc-in-5-days': {
    title: 'How Figure Closes a HELOC in 5 Days (And What Community Banks Can Learn)',
    description:
      'Figure originates at $730 per loan versus the industry average of $11,230. Their S-1 reveals the speed comes from automated data aggregation, not blockchain. The playbook is more replicable than you think.',
    publishedDate: 'March 24, 2026',
    readTime: '11 min read',
    content: `Figure went from zero to $6 billion in annual home equity lending in four years. They close HELOCs in 5 days at a cost of $730 per loan — while the industry spends $11,230. They filed for a $5.29 billion IPO. And buried in their S-1 is a detail that should change how every community bank CTO thinks about competing with them.

Here is exactly what Figure is doing, where their speed actually comes from, and why the playbook is more replicable than you think.

---

## Figure by the Numbers

The scale is worth stating plainly.

Figure Technologies originated roughly $6 billion in home equity products in 2024, serving over 253,000 households. Net revenue hit $340.9 million, up 62.7% year-over-year. Their cost per loan sits at approximately $730 — compared to the Mortgage Bankers Association's reported industry average of $11,230 for a standard origination (MBA, 2025). That is a 15:1 cost advantage.

Their HELOC product approves borrowers in as little as 5 minutes and funds in 5 days. The industry median for a home equity line of credit is 39 days.

When Figure filed for its IPO at a $5.29 billion valuation, the S-1 laid out the thesis in plain language: they are a technology company that happens to make loans. The filing describes "layers of intermediaries that have long slowed things down" and positions Figure as the company that strips them out.

This is not posturing. The numbers support it.

---

## What Figure Actually Does

Strip away the marketing and Figure's lending operation comes down to four things done fast and done digitally.

**Automated identity verification.** The borrower enters personal information and Figure runs instant KYC checks — identity validation, fraud screening, and watchlist checks — without a human reviewer in the loop. No branch visit, no notarized documents, no waiting for a compliance officer to pull up a screening tool. The entire identity verification step that might take a community bank's BSA team a day or more resolves in seconds.

**Instant income and asset verification.** Instead of asking borrowers to upload pay stubs and bank statements, Figure connects directly to financial data sources. The borrower authenticates their bank account through an aggregation provider, and Figure pulls verified income, assets, and transaction history in seconds. No document uploads. No manual review of PDFs. This single step replaces what is typically the longest manual process in origination — the back-and-forth of requesting, receiving, and reviewing financial documents. Plaid's own research found that lenders "still fall back on manual, document-based processes" even when digital alternatives exist. Figure simply decided not to.

**Digital property valuation.** Figure uses automated valuation models (AVMs) and property data providers to assess the collateral — the borrower's home — without scheduling an appraisal. They pull tax records, comparable sales, and property characteristics programmatically. For a HELOC where the home already has an established value, this eliminates weeks of waiting for an appraiser. The AVM runs against the same public records and comparable sales data that a human appraiser would use — it just returns a result in seconds instead of 14 days.

**Electronic closing.** The entire signing process is digital. No scheduling a closing at a title company. No wet signatures on 50 pages of documents. E-notarization where state law allows it. Title and lien searches are automated. Document generation is templated. The borrower signs on a screen and the loan funds.

Each of these steps replaces a process that, at a traditional lender, involves a human being waiting for another human being to produce a document, review it, and pass it along. Multiply that across four or five verification categories and you begin to see where 42 days becomes 5.

---

## The Blockchain Question

Figure built its early brand identity around blockchain. The Provenance blockchain. Digital asset custody. Tokenized securities. The pitch to investors and the press leaned heavily on distributed ledger technology as the enabler.

Then they filed the S-1.

Buried in the filing is a disclosure that should reframe how the industry thinks about Figure's advantage. Their loan origination system, the core technology that actually produces the 5-day close, **"does not rely on the use of blockchain technology."**

Read that again. The system that originates $6 billion in home equity loans — the system responsible for the 5-minute approvals and 5-day closings — does not use blockchain.

What does it use? Automated data aggregation. Instant verification APIs. Digital workflows that eliminate manual handoffs. The same category of technology available to any lender willing to integrate it.

Figure's competitive advantage is not a proprietary blockchain. It is the decision to automate every verification step in the origination process and remove human bottlenecks from the critical path. The blockchain handles post-origination functions — securitization, secondary market trading, custody. Important for Figure's capital markets strategy, but irrelevant to why a borrower gets approved in 5 minutes.

This distinction matters because it means the speed advantage is not locked behind proprietary technology. It is an integration problem, not an invention problem.

---

## The Real Moat: Aggregation Speed

Figure's actual moat is the time between "borrower clicks apply" and "lender has verified data."

In a traditional origination, that gap is measured in weeks. The borrower fills out an application. The loan officer requests documents. The borrower gathers pay stubs, tax returns, bank statements. Someone uploads them. Someone else reviews them. Discrepancies trigger re-requests. The underwriter orders a credit report, an appraisal, a title search. Each step involves a queue.

The average mortgage file contains 500 pages of documentation (MBA). Lenders work from checklists with 55 line items. Borrowers submit an average of 16 separate documents per application. The process takes 42 days for a conventional mortgage, 77 days for FHA (ICE Mortgage Technology, 2025).

Figure compressed this by replacing document collection with data collection. Instead of asking a borrower to prove their income with uploaded documents, they pull verified income data directly from the source. Instead of ordering an appraisal, they query AVM providers. Instead of running manual KYC checks, they hit identity verification APIs.

The result: the verification that takes a community bank 2-4 weeks happens at Figure in minutes. Not because of superior algorithms or AI breakthroughs — because of API integrations that pull data from the same underlying sources, automatically.

---

## What Figure Cannot Do

Here is the part Figure's investor deck does not emphasize.

**Figure does not know your market.** A community bank loan officer who has been working a county for 15 years knows which employers are stable, which neighborhoods are appreciating, which borrowers have character that does not show up on a credit report. Figure's algorithm sees data points. Your team sees the farmer whose income is cyclical but whose operation has been profitable for three decades. That judgment cannot be automated, and Figure does not try.

**Figure does not serve complex borrowers well.** Self-employed income. Agricultural operations. Small business owners with intermingled personal and business finances. Borrowers who need someone to walk them through the difference between a HELOC and a cash-out refinance. These borrowers need a conversation, not a funnel. Community banks handle them every day. Figure's 5-minute approval flow is optimized for clean, salaried W-2 borrowers with straightforward financials — a profitable segment, but not the only segment.

**Figure does not invest in your community.** Community banks deploy deposits locally. They fund the small business loans that national lenders will not touch. They meet CRA obligations through genuine community investment, not compliance checkboxes. Figure is a national lender backed by venture capital, headquartered in New York. Their capital goes where the risk-adjusted return is highest, not where Main Street needs it. Community banks hold 97% of banking charters and remain the primary credit source for rural and underserved markets (FDIC).

**Figure does not offer a branch.** For a significant segment of borrowers — larger than fintech evangelists admit — a branch matters. It matters when a borrower has a question about their draw period. It matters during the signing of the largest financial commitment of someone's life. It matters when something goes wrong and the borrower wants to talk to a human being who knows their name, not submit a support ticket.

**Figure does not do small business lending.** Community bank small business lending share has halved from 24% to 12% over two decades (Kansas City Fed), but the borrowers who remain do so because they need a lender who understands their business. Figure offers HELOCs. A community bank offers HELOCs, commercial real estate, SBA 7(a), equipment financing, and lines of credit — often to the same customer. That cross-sell depth is a moat Figure has no interest in building.

Community banks that try to become Figure will fail. They do not have the engineering headcount, the VC funding, or the appetite for the product constraints that make Figure's model work. But community banks that match Figure's verification speed while keeping their own advantages? That is a different equation.

---

## The Verification Gap Is Closable

Figure's S-1 reveals the real architecture: automated data pulls from identity providers, income verification services, property data vendors, and bank account aggregators — stitched into a single workflow.

That is not a technology stack that requires $200 million in venture funding to assemble. The individual components — Plaid for financial data, Socure for identity and fraud, Truework for employment, ATTOM for property valuations — are available as APIs to any lender. The hard part is integrating them into a single flow that is fast enough to compete.

This is what RAVEN does.

RAVEN aggregates the same categories of verification data that power Figure's origination system — identity (KYC, fraud scoring, watchlist screening), income and assets (bank-connected financial data), employment, and property valuation — into a single borrower verification that completes in under 5 minutes.

A loan officer sends one link. The borrower enters their SSN and connects their bank account. RAVEN pulls data from multiple providers simultaneously, cross-references the results, and delivers a complete verification report with confidence scores and full source attribution. The same data aggregation that Figure built internally, delivered as a service to community banks.

The difference: RAVEN does not replace the community bank. It arms the community bank with the same verification speed that Figure uses to close in 5 days — while the bank retains every advantage that Figure cannot replicate. Local relationships. Branch access. Complex borrower expertise. CRA commitment. Small business lending.

---

## The Strategic Choice

Community banks face a clear decision. They can continue originating with 42-day timelines and $11,094 per-loan costs (MBA, 2025) while fintechs close the same products in days at a fraction of the cost. Or they can close the verification gap — the specific, identifiable bottleneck that accounts for the majority of that time difference — and compete on the dimensions where they already win.

Figure proved that automated verification is the leverage point. Their own SEC filing confirms it is not proprietary technology that makes it work — it is the integration of available data sources into a fast, automated workflow.

Community banks do not need to become fintechs. They need to verify like fintechs. The rest of their model is already stronger.

**RAVEN gives community banks Figure-speed verification without Figure-sized engineering teams.** One integration. One link. Complete borrower verification in minutes.

[Request early access at reportraven.tech](https://reportraven.tech)`,
  },

  'one-link-complete-verification': {
    title: 'One Link, Complete Verification: How RAVEN Works for Community Banks',
    description:
      'What if verifying a borrower took 5 minutes instead of 5 weeks? One link, one borrower interaction, complete verification data back to the bank in minutes from seven providers with a full audit trail.',
    publishedDate: 'March 24, 2026',
    readTime: '12 min read',
    content: `What if verifying a borrower took 5 minutes instead of 5 weeks?

The average mortgage origination requires 16 separate documents, runs through a 55-item checklist, generates a 500-page file, and takes 42 days to close (ICE Mortgage Technology, MBA, 2025). The average cost: $11,094 per loan originated, with only $785 in profit at the end (MBA, 2025). Most of that time and cost is not spent making lending decisions. It is spent collecting and verifying data.

RAVEN replaces the collection phase. One link. One borrower interaction. Complete verification data back to the bank in minutes — identity, income, employment, property, and fraud screening — cross-referenced from seven providers with a full audit trail.

Here is exactly how it works.

---

## The Current Process

A borrower walks into a branch or fills out an online application. The loan officer collects basic information, then begins the verification process.

Pull a credit report. Request pay stubs. Call the employer for verification. Wait for bank statements. Order an appraisal. Run KYC checks. Screen against OFAC and PEP watchlists. Cross-reference the address. Confirm employment dates. Check for fraud indicators.

Each of these steps involves a different system, a different provider, and often a different person. The loan officer toggles between platforms, re-enters data, waits for responses, and chases down discrepancies. Some verifications come back in hours. Others take days. An appraisal can take two weeks.

Meanwhile, the borrower waits. And 68% of mortgage applicants who start this process abandon it before closing. Among borrowers who experience digital friction, 48% take their business to a competitor (J.D. Power, Plaid).

The process is not broken because bankers are slow. It is broken because the workflow requires serial, manual interactions with dozens of systems that were never designed to talk to each other.

---

## The RAVEN Process

RAVEN compresses the verification phase into a single borrower interaction.

**Step 1: Loan officer initiates.** The loan officer enters the borrower's email address in the RAVEN dashboard. One field. That triggers an email to the borrower with a secure verification link.

**Step 2: Borrower verifies.** The borrower opens the link on any device — phone, tablet, laptop. The verification takes two steps:

- **Enter their SSN.** This initiates identity verification, fraud screening, and watchlist checks through Socure's RiskOS platform. The borrower confirms their identity through a brief verification prompt. No document uploads. No selfie matching. Under 60 seconds.

- **Connect their bank.** The borrower authenticates their primary financial institution through Plaid Link — the same bank-connection interface used by Venmo, Cash App, and most major fintechs. They select their bank, enter their credentials, and authorize data sharing. Under 2 minutes.

That is it. Two steps. Under 5 minutes total. The borrower is done.

---

## What the Bank Gets Back

Behind those two borrower actions, RAVEN triggers verification requests across multiple providers simultaneously. The data comes back in a single, structured report organized by category.

### Identity Verification

Source: **Socure RiskOS**

- Full KYC validation — name, SSN, date of birth, address confirmed against authoritative sources
- Fraud risk scoring — synthetic identity detection, identity manipulation flags, device risk signals
- Watchlist screening — OFAC SDN, global PEP lists, adverse media, law enforcement databases
- Risk scores with granular reason codes for every flag

This is not a pass/fail checkbox. Socure returns a detailed risk profile with confidence scores across multiple dimensions. A clean result means the borrower is verified and screened. A flagged result tells the bank exactly what triggered the flag and why, so the compliance team can make an informed decision rather than chasing false positives.

### Financial Data

Source: **Plaid**

- All connected accounts — checking, savings, investment, loan accounts across the borrower's linked institution
- Transaction history — categorized income deposits, recurring expenses, cash flow patterns
- Income verification — employer-deposited income identified and annualized, with source attribution
- Asset balances — current balances across all connected accounts
- Existing liabilities — credit cards, loans, and other obligations visible through the connected institution

### Employment Verification

Source: **Truework**

- Current employer confirmed
- Employment dates verified
- Salary and compensation data (where available through employer payroll integrations)
- Verification delivered asynchronously — results flow into the report as they arrive

### Property and Residence Data

Sources: **Melissa, ATTOM**

- Address verification and standardization through Melissa's Personator platform
- Ownership status — confirmed owner, renter, or other occupancy
- Property type and characteristics — single family, condo, multi-unit, square footage, lot size, year built
- Automated valuation model (AVM) estimate from ATTOM — comparable to what national fintechs use for instant property assessment
- Tax assessment data
- Move-in date and residency duration

### Contact and Demographic Data

Source: **Melissa, FullContact**

- Verified phone numbers and email addresses
- Demographic indicators for fair lending analysis
- Social and professional profile data where publicly available

Every data point in the report includes its source, the timestamp of retrieval, and a confidence indicator. Nothing is a black box. The bank's compliance team can trace any piece of data back to its origin.

---

## Cross-Source Reconciliation

Pulling data from multiple providers is useful. Cross-referencing it is where the value compounds.

RAVEN automatically compares data across sources. When Plaid-verified income aligns with Truework-confirmed salary, the confidence score for income increases. When the Socure-verified address matches the Melissa-confirmed residence with property ownership status, the identity confidence strengthens.

When sources disagree, RAVEN flags the discrepancy. If Plaid shows deposits from Employer A but Truework verifies employment at Employer B, that shows up as a discrepancy in the report — before the loan committee sees the file, not after. If the stated address does not match the verified residence, the loan officer knows immediately.

This is the difference between collecting data and verifying data. Traditional processes collect documents and trust that the borrower provided accurate information. RAVEN collects data from authoritative sources and tells the bank where the sources agree and where they do not.

---

## Dashboard and Reporting

Loan officers access results through the RAVEN dashboard — a web interface that displays every verification in progress and every completed report.

**Dashboard view.** Each borrower shows a status card with module-by-module completion. Identity verified. Financials received. Employment pending. Property data complete. The loan officer sees at a glance which verifications are done and which are still in progress.

**PDF reports.** Every completed verification generates a print-ready PDF report suitable for the loan file. The report includes all verified data, source attribution, confidence scores, and any flagged discrepancies — formatted for the underwriter, the compliance reviewer, and the examiner.

**Audit trail.** Every action is logged with timestamps. When the borrower consented. When each data source responded. What data was returned. When the loan officer accessed the report. This is not just good practice — it is examiner-ready documentation that demonstrates the bank's verification process is consistent, sourced, and auditable.

---

## What This Means for Compliance

Community banks under $100 million in assets spend 8.7% of noninterest expenses on compliance — three times the rate at banks over $1 billion (CSBS). A significant share of that cost goes to the manual, repetitive work of verifying borrowers against regulatory requirements.

RAVEN does not replace compliance judgment. It replaces compliance data collection. The KYC checks, the watchlist screening, the identity verification, the income confirmation — these are executed automatically, sourced from authoritative providers, and documented with a full audit trail. The compliance officer reviews results and makes decisions, rather than gathering data and entering it into systems.

Every verification runs through the same process. Every borrower is screened against the same watchlists. Every report contains the same structured data. This consistency is what examiners look for — evidence that the bank applies its verification standards uniformly, not selectively.

---

## Integration and Pricing

RAVEN works as a standalone platform accessible through a web dashboard. No core system replacement. No six-month integration project. A loan officer can send their first verification link on day one.

For banks that want data flowing into their core banking system, RAVEN provides an API that integrates with Jack Henry, Fiserv, and FIS environments. The complete verification report is available as structured data through a REST API, ready for downstream systems.

Pricing is per-verification. No platform licensing fees. No six-figure annual commitments. The bank pays for what it uses. A bank running 50 verifications a month pays for 50 verifications. A bank running 500 pays for 500. The unit economics improve with volume, but there is no minimum to get started.

---

## The Bottom Line

Community banks do not need to become technology companies to compete with fintechs on verification speed. They need to stop asking borrowers to produce documents that machines can retrieve faster and more accurately.

RAVEN turns borrower verification from a weeks-long document chase into a 5-minute digital interaction. The borrower gets the experience they expect from any modern financial service. The bank gets verified data from authoritative sources, cross-referenced and audit-ready. The loan officer gets hours back in their week.

One link. Complete verification. Community bank values, fintech speed.

**Request early access at [reportraven.tech](https://reportraven.tech)**`,
  },
};

/* ---------- Static generation ---------- */

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) {
    return { title: 'Article Not Found' };
  }
  return {
    title: `${article.title} — RAVEN Blog`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://reportraven.tech/blog/${slug}`,
      siteName: 'RAVEN',
      type: 'article',
      publishedTime: article.publishedDate,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  };
}

/* ---------- Page component ---------- */

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];

  if (!article) {
    notFound();
  }

  const html = convertMarkdown(article.content);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        url: `https://reportraven.tech/blog/${slug}`,
        datePublished: article.publishedDate,
        dateModified: article.publishedDate,
        author: { '@type': 'Organization', name: 'RAVEN', url: 'https://reportraven.tech' },
        publisher: {
          '@type': 'Organization',
          name: 'RAVEN',
          url: 'https://reportraven.tech',
          logo: {
            '@type': 'ImageObject',
            url: 'https://reportraven.tech/raven-icon.svg',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://reportraven.tech/blog/${slug}`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reportraven.tech' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://reportraven.tech/blog' },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: `https://reportraven.tech/blog/${slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <style>{`
        .article-wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 4rem 1.5rem 2rem;
        }
        .article-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--gray-500);
          text-decoration: none;
          margin-bottom: 2.5rem;
          transition: color 200ms;
        }
        .article-back:hover { color: var(--white); }
      `}</style>

      <article className="article-wrap">
        <a href="/blog" className="article-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          All articles
        </a>

        <div className="article-body">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <span>{article.publishedDate}</span>
            <span className="article-meta-dot" />
            <span>{article.readTime}</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </article>
    </>
  );
}
