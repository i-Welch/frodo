import type { Metadata } from 'next';
import { getRelatedArticles } from '../articles-index';
import { notFound } from 'next/navigation';
import { CalendlyButton } from '../../calendly-button';
import { LeadCapture } from '../../lead-capture';
import { ROI_BANKS } from '../../roi/roi-data';

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

  // Pull quotes: :::pullquote ... ::: (must be on its own paragraph)
  html = html.replace(/^:::pullquote\n([\s\S]+?)\n:::/gm, (_match, inner) => {
    return `<blockquote class="pullquote">${inner.trim()}</blockquote>`;
  });

  // Stat callouts: :::stat ... ::: — first **bold** becomes the headline number
  html = html.replace(/^:::stat\n([\s\S]+?)\n:::/gm, (_match, inner) => {
    return `<div class="stat-callout">${inner.trim()}</div>`;
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
  /** Set only when the body gets a real content update; drives dateModified.
   *  AI engines diff content, so never bump this without a substantive edit. */
  updatedDate?: string;
  readTime: string;
}

const articles: Record<string, Article> = {
  'robins-financial-20-million-rebate': {
    title: "The Credit Union That Can't Spend Its Money Fast Enough",
    description:
      'Robins Financial runs a 16.1% net worth ratio, earns two and a half times the industry ROA, and still handed members $20 million in December, $151 million since 2017. Inside the inverted capital problem of middle Georgia’s giant.',
    publishedDate: 'August 17, 2026',
    readTime: '6 min read',
    content: `
# The Credit Union That Can't Spend Its Money Fast Enough

*Published August 17, 2026*

## The Number That Doesn't Fit

On December 9, Robins Financial Credit Union deposited $20 million into its members' accounts. Not a promotion. Not a rate special. A rebate, computed on each member's actual relationship over the year, loans paid, dividends earned, accounts used, and handed back because the cooperative earned more than it needed. It was the ninth one. Since 2017, Robins has returned $151 million to its members this way.

:::stat
**$151 million**
What Robins Financial has handed back to members through annual rebates since 2017, including $20 million this past December. A bank would call it a special dividend. Robins calls it Tuesday.
:::

The institution doing this started on April 1, 1954, when 13 civilian and military personnel at Robins Air Force Base signed a charter application. Seventy-two years later it holds $4.91 billion in assets, serves 272,542 members from 24 branches, and runs a 16.1% net worth ratio while earning a return on assets that annualized to roughly 1.8% in the first quarter of 2026, about two and a half times the industry's recent run rate.

Every other credit union in this series strains against a capital ceiling. Robins lives so far above its own that it gives the excess away, and the pile keeps growing anyway.

## The Membership Math

The charter tells you how they got here. For 62 years this was Robins Federal Credit Union, an Air Force base credit union with a base credit union's boundaries. In January 2016 it converted to a Georgia state charter, dropped "Federal" from its name, and unlocked a field of membership covering roughly 43 middle Georgia counties plus family of members.

The sponsor, meanwhile, did something sponsors in this series haven't done: it thrived. [Founders'](/blog/founders-credit-union-mill-town) textile mill closed in 2007. [Champions First](/blog/champions-first-fsu-rebrand) spent three years researching its way out of its sponsor's name. Robins Air Force Base grew 11% in two years to more than 21,000 workers, generates a $4.48 billion annual economic impact, and stands as Georgia's largest single-site industrial complex. Its payroll alone runs about $2.89 billion a year, and its employees live in 110 of Georgia's 159 counties.

:::pullquote
Founders' sponsor died. Champions First renamed its way around its sponsor. Robins' sponsor grew 11% in two years, and the credit union compounds on top of it.
:::

Membership grew from about 243,000 in March 2022 to 272,542 today, a steady 2.9% a year, no mergers required. That's 1.6 members for every resident of Houston County, the home county, population roughly 170,000. The base anchors it, but the arithmetic says most of those members now come from everywhere else in middle Georgia.

## The Balance Sheet

Start with the side most credit unions get wrong, because Robins is winning there. Of its $4.07 billion in shares, $1.26 billion, a full 30.9%, sits in share drafts, the checking-equivalent balances that mark a primary financial relationship. Founders runs 13%. Champions First runs 17%. Nobody else in this series is close, and the consequence lands directly on the income statement: Robins' cost of funds annualizes to about 1.15%, in a market where its peers pay north of 2%.

:::stat
**30.9%**
The share of Robins' $4.07 billion in shares held in share drafts, the highest primary-relationship funding mix in this series. Cheap, loyal money is the entire foundation of the model.
:::

The asset side is almost cautious by comparison. Loans total $2.82 billion, just 69% of shares, with the rest parked in cash and investments. Vehicles dominate at $1.54 billion, real estate runs $1.11 billion, and unsecured lending is a modest $159.4 million, under 6% of the book. The allowance sits at 0.94% of loans and provision expense annualizes to roughly 0.4%. Loan yield comes in around 5.8%. The mortgage operation files HMDA: 1,457 originations for $173.3 million in 2024, a real reported figure.

Put it next to Founders and you get a lesson in how differently two elite credit unions can win. Founders lends at 7.1%, reserves 2% of loans, and earns 1.29% on assets by taking priced risk. Robins lends at 5.8%, reserves under 1%, and earns 1.8% by funding itself for almost nothing. One wins on the asset side, one on the funding side. Both numbers embarrass the industry average.

First-quarter net income: $21.9 million. In three months.

## The Capital Ceiling

Here's where Robins becomes the mirror image of everyone we've covered. A credit union can't issue stock, so retained earnings normally act as a speed limit: grow faster than earnings can support and the net worth ratio compresses. Champions First lives right at that limit. Robins has the opposite condition. At a 1.8% return on a 16.1% ratio, it could fund roughly 11% annual growth from earnings alone. It's actually growing at about 5%. The capital pile rises every year it doesn't find something to do with the money.

The rebate is the release valve, and it's the purest expression of the cooperative structure you'll find. A bank in this position would announce a buyback and watch the stock pop. Robins computes each member's share of the surplus and wires it back. $20 million this year. $151 million and counting.

:::pullquote
Most credit unions hit a capital ceiling. Robins lives above its own, and once a year it lowers the roof by twenty million dollars.
:::

The 2016 charter conversion bought one more thing worth naming: disclosure. As a Georgia state charter, Robins is a 501(c)(14) that files a public Form 990. The FY2024 filing shows revenue of $251.5 million, expenses of $190.3 million, CEO Christina O'Brien's compensation at $949,487, and SVP of Lending Robert Dyal at $1,123,589, more than the CEO, a figure that likely reflects a long-tenure retirement plan payout, though the filing doesn't say. A federal charter files none of this. When Founders, a federal charter, reversed its CEO succession last November, the public record was a post on X. Robins' executive pay is on the internet, itemized, because of a paperwork consequence of the same conversion that unlocked 43 counties. Charter choices are disclosure choices, whether or not anyone frames them that way.

## The Stack

The digital setup is solid and conventional. Online banking runs on Q2. Account opening lives at newaccount.robinsfcu.org, a first-party subdomain, and loan applications route through the Q2 shell rather than a third-party portal. No Floridascu-style ghosts in the URLs, no handoff to a vendor domain at the moment of conversion.

The strategic question is hiding in that base statistic: Robins AFB employees live in 110 of Georgia's 159 counties. Robins has 24 branches. For most of the people with the strongest possible reason to join, the nearest branch is an hour away or more, and the digital front door isn't a convenience channel. It is the branch network.

That matters because the rebate, the thing that makes Robins famous, pays on relationship depth. A member who borrows, keeps a share draft, and runs their financial life through the credit union gets a real check in December. A member who parked a certificate gets a rounding error. The whole model compounds when a new member lands with a verified identity, a linked funding account, and a share draft on day one, and stalls when joining takes a branch visit that 110 counties' worth of eligible people will never make. Verification-first onboarding isn't a member-experience nicety for an institution like this. It's how the flywheel gets fed.

Robins is what the end state of the cooperative model looks like: a sponsor that kept its promise, funding that costs almost nothing because members actually live there, and so much retained surplus that the institution's hardest annual decision is how much to give back. The other credit unions in this series are trying to get here. The ones that make it will do it the same way Robins did, one primary relationship at a time.
    `,
  },
  'founders-credit-union-mill-town': {
    title: "The Mill Closed. The Credit Union Didn't.",
    description:
      "Springs Mills left South Carolina in 2007. The credit union its workers founded in 1950 now holds $5.18 billion, serves 2.5 members for every resident of its home county, and just lived through a succession reversal you'd need an 8-K to see at a bank.",
    publishedDate: 'August 17, 2026',
    readTime: '6 min read',
    content: `
# The Mill Closed. The Credit Union Didn't.

*Published August 17, 2026*

## The Number That Doesn't Fit

In 1950, a group of Springs Mills employees in Lancaster, South Carolina started a credit union to keep their coworkers away from loan sharks. They named it Springmaid, after the company's bedsheet brand. Springs wasn't just the sponsor; it was the town. At its peak, the company's original plant employed nearly a third of Lancaster County.

The mill side of that story ended in June 2007, when Springs closed the Grace plants in Lancaster, its last manufacturing operations in South Carolina after 120 years, and moved production to Brazil. Five hundred forty workers lost their jobs on the way out.

The credit union side kept going. Founders Federal Credit Union, as Springmaid has been called since 1980, holds $5.18 billion in assets as of March 31, 2026. It runs 49 branches across the Carolinas, employs 890 people, and serves 290,408 members from a headquarters in a county of 114,300 residents.

Read that again. Two and a half members for every man, woman, and child in Lancaster County.

:::stat
**2.5x**
Founders' 290,408 members, measured against the 114,300 people who live in its home county. The sponsor company that created it stopped manufacturing in South Carolina nineteen years ago.
:::

The sponsor died. The cooperative built on its payroll deduction became the largest credit union in South Carolina, and one of the most profitable institutions of its size in the country.

## The Membership Math

Founders is not a community charter like the credit unions in our recent deep dives. It's a multiple common bond charter, which means its legal market is not a map. It's a list.

More than 200 select employer groups anchor the charter, along with immediate family of any member and, in a nice touch for a credit union named Founders, students at Clemson University. Layered on top are underserved-area additions that cover Chester, Chesterfield, Lancaster, Laurens, and Union counties outright, census tracts in Cherokee, Spartanburg, and York counties, and, across the state line, Mecklenburg County, North Carolina. That last one is Charlotte. 1.1 million people, eligible.

The pivotal date is 1992, when Founders first opened membership beyond Springs Industries employees. Thirty-four years later, the layered charter reads like an org chart of the region's economy, assembled one employer at a time while the original employer disappeared.

And the funnel works. Founders added roughly 4,600 net members in the first quarter of 2026 alone. [Champions First](/blog/champions-first-fsu-rebrand), the Tallahassee credit union we profiled last week, nets about 220 a year from an 18-county community charter. Founders puts up twenty times that in ninety days, from a charter that is technically a list of employers.

:::pullquote
Founders' sponsor company has been gone for nineteen years. The credit union built on its payroll deduction now signs up more members in a quarter than some community charters add in two decades.
:::

Geography helps. Lancaster County grew 2.7% last year, roughly 3,000 new residents, the fastest-growing county in the Charlotte metro, driven by the Indian Land panhandle where Charlotte spills across the state line. Billion-dollar Sharonview Federal moved its own headquarters to Indian Land, in the same county. The mill town is now a boomtown, and Founders was already standing there when the growth arrived.

## The Balance Sheet

The loan book is where Founders stops looking like everyone else. Of $4.07 billion in total loans, real estate accounts for $2.30 billion, vehicles and other secured lending about $1.16 billion, and unsecured credit $605.8 million. That last figure is the tell: roughly one loan dollar in seven at Founders is unsecured, personal loans, express loans, and credit cards extended to ordinary members on signature. The mortgage operation is big enough that Founders actually files HMDA, a rarity in this series: 2,139 originations for $332.8 million in 2024, a real reported number rather than an estimate.

Lending deep pays. Loan income annualizes to a yield of about 7.1%. Cost of funds runs about 2.2% of shares. The spread between those two numbers is the engine.

It's also priced for the risk it takes. The allowance for credit losses stands at $81.5 million, a full 2.0% of loans; Champions First carries 0.73%. Provision expense is running $13.8 million a quarter. Founders reserves like an institution that expects some of that signature lending to go bad, because some of it will, and the yield covers it with room to spare.

The bottom line: $16.7 million in net income for the first quarter of 2026, an annualized return on assets of about 1.29%, roughly double the credit union industry's recent run rate.

:::stat
**1.29%**
Founders' annualized return on assets in the first quarter of 2026, earned while reserving 2% of loans for credit losses. High-yield lending, priced honestly.
:::

One familiar wrinkle hides in the funding. Share drafts, the primary-relationship balances, are just $570.5 million, about 13% of the $4.42 billion share base, while certificates and money market make up 64%. Even a 290,000-member franchise pays up for funding now. The difference between Founders and everyone else is that its asset side out-earns the cost.

## The Capital Ceiling

Net worth stands at $684.7 million, 13.2% of assets, against the 7% well-capitalized floor and an industry aggregate around 11.3% at the end of 2025. No subordinated debt. Every dollar of it retained since 1950. At a 1.29% return on a 13.2% ratio, Founders can fund roughly 10% annual asset growth from earnings alone, faster than it's actually growing. Most institutions in this series are capital-constrained or funnel-constrained. Founders is neither.

Which is why its 2026 story is about the one thing retained earnings can't buy: a succession.

In January 2025, Founders announced a multi-year transition. Keith Wilson, a 25-year veteran who had spent three years as executive vice president preparing for the role, became president, with longtime CEO Bruce Brumfield set to retire December 31, 2025. In November 2025, Wilson was abruptly no longer with the organization. No reason was given. The board asked Brumfield to stay. On January 27, 2026, CFO Evan Mathis was named president.

If Founders were a $5.2 billion bank, that sequence would live in the public record as an 8-K with effective dates, a proxy statement with severance terms, and pointed questions on the next earnings call. Founders is a federal credit union, a 501(c)(1) instrumentality that files no Form 990, no proxy, and no insider forms. The reversal of a CEO succession at South Carolina's largest credit union reached the public as a post on X, trade-press writeups, and a local radio story.

That's not a scandal. It's the structure. The owners are the members, and the volunteer board answers to them at the annual meeting, not to the SEC. But it does mean 290,408 member-owners have less paper on their institution's leadership change than a bank shareholder with a single share.

:::pullquote
A $5.2 billion bank would have filed an 8-K. Founders' succession reversal reached the public as a post on X and a local radio story.
:::

## The Stack

Here Founders inverts the usual community-institution story too. Every credit union in this series so far hands its applicants to a third-party domain at the moment of conversion. Founders doesn't: account opening and lending run at apply.foundersfcu.com, a first-party subdomain, and even the mortgage application, vendor-powered under the hood, lives on a Founders subdomain. Digital banking is Q2, confirmed both by the site's own external-link whitelist and a published Q2 customer story.

The core is the best part. Founders runs a technology CUSO, FIT (Founders Innovative Technology), based in Lancaster, that sells Corelation KeyStone-specific tooling to other credit unions: API automation, core data cleanup, online banking fraud defense. That product list is the clearest public signal of the core running underneath Founders itself, and it means Founders liked its internal tooling enough to commercialize it. Add an insurance agency and a wealth management arm and you have a credit union operating CUSOs the way a bank holding company operates subsidiaries.

The exposed nerve in all of this is intake quality. A 7% yield book with 15% unsecured lending and 2% reserves works precisely as long as the institution knows exactly who it's approving. Every basis point of future loss enters through an application, which makes verification-first intake, identity, income, and funding account confirmed at the point of application, cheap insurance for exactly the model Founders runs.

And that's the real lesson of both stories in Lancaster. Springmaid outlived the mill because the machinery mattered more than the sponsor. Founders will outlive its succession turbulence for the same reason, as long as the machinery, from the loan file to the front door, keeps carrying the model instead of any one person.
    `,
  },
  'champions-first-fsu-rebrand': {
    title: 'The Credit Union Formerly Known as FSU',
    description:
      "Champions First Credit Union grew assets 34% since 2022 through two mergers and a rebrand. It added roughly 900 members. Inside a $535 million Tallahassee credit union whose new name still hasn't reached its application layer.",
    publishedDate: 'August 12, 2026',
    readTime: '6 min read',
    content: `
# The Credit Union Formerly Known as FSU

*Published August 12, 2026*

## The Number That Doesn't Fit

Champions First Credit Union has spent six years doing everything a growth-minded credit union is supposed to do. It merged in Pensacola-based GPCE Credit Union in October 2020, picking up branches in Pensacola and Panama City. It merged in the Florida Department of Transportation Credit Union in January 2022. And on October 1, 2024, after what management described as nearly three years of research, it retired the FSU Credit Union name it had carried since 1954 and became Champions First, a brand built to tell 18 counties of North Florida that you don't need a Florida State connection to join.

Assets responded. The combined institution held nearly $400 million when the FDOT merger closed. As of March 31, 2026, it holds $535.8 million, growth of roughly 34% in a little over four years.

Membership didn't. The FDOT merger created a credit union with about 32,000 members. Today it has 32,930.

:::stat
**~900**
Net new members Champions First has added since January 1, 2022, a stretch in which total assets grew roughly 34%. That works out to about 220 net members a year.
:::

That's the number that doesn't fit. Two mergers, a seven-county charter expansion, a full rebrand, and a balance sheet a third bigger. Everything grew except the number of member-owners.

## The Membership Math

The legal ceiling here is generous. Champions First's field of membership covers anyone who lives or works in 18 North Florida counties, from Escambia on the Alabama line to Columbia County out east past Tallahassee. Add up the Census estimates and that's roughly 1.6 million people. At 32,930 members, penetration sits right around 2%.

For context, the two credit unions we profiled earlier this month, [REV Federal](/blog/rev-credit-union-west-virginia-bet) and [Palmetto Citizens](/blog/palmetto-citizens-90-year-wait), each penetrate their fields of membership at just under 9%. Champions First is working with a fraction of that, in a footprint that includes some of the fastest-growing counties in Florida.

There's a sharper version of this number in the regulatory record. When the credit union expanded west in 2018, adding Escambia, Santa Rosa, Okaloosa, Walton, Holmes, Washington, and Jefferson counties, Florida's Office of Financial Regulation approved the expansion with a condition attached: no more than 2,500 new members a year from the new territory.

:::pullquote
The state capped Champions First at 2,500 new members a year from its western expansion. The entire credit union is netting about 220.
:::

Net numbers hide churn, to be fair. The credit union signs up far more than 220 people a year and loses most of the gain to attrition. But that is the point. For a cooperative, net member growth is the growth rate that matters, because members are the customer base and the funding base at the same time.

Meanwhile the local market is consolidating around them. Envision Credit Union, the other Tallahassee credit union founded in 1954, was absorbed by Orlando's Addition Financial on October 1, 2025, creating a $3.8 billion institution with 250,000 members. First Commerce, at $1.15 billion, is now the largest credit union still headquartered in Tallahassee. Champions First is what remains of the second tier.

One structural note. For a bank, we'd check county deposit share from the FDIC Summary of Deposits and mortgage rank from HMDA. Neither exists here. Credit unions don't file into the FDIC's deposit data at all, and Champions First doesn't appear on the 2023 or 2024 HMDA filer lists. Membership penetration is the metric that's left, and it says the constraint isn't the charter.

## The Balance Sheet

Inside the $413.6 million loan book, the engine has been swapped mid-flight. Real estate lending grew 22% in 2024, from $113.4 million to $138.4 million, and stands at $162.4 million as of March 2026. Real estate went from under a third of the loan book two years ago to nearly 40% today.

The bucket that used to define this credit union is moving the other way. Autos and other consumer loans, $235.1 million at the end of 2023, slipped to $231.1 million in 2024. Credit cards fell 4%. About $42 million of 2024's auto volume came through the iDrive CUSO, an indirect lending pipeline that puts Champions First financing on dealership desks in Leon and Bay counties. Indirect paper keeps a loan book full, but a dealership-sourced borrower gets you a loan, not necessarily a member. Indirect members are notoriously single-product.

The funding side tells you what flat membership costs. Of $476.2 million in total shares, just $79.8 million, under 17%, sits in share drafts, the checking-equivalent balances that mark a member's primary financial relationship. Certificates and money market balances make up 54.5% of shares. That money is loyal to a rate, not to an institution.

And the rate got paid. Dividends on shares jumped 49% in 2024, to $8.0 million, while interest income grew 20%. Provision expense rose 24%. Net income fell 12%, to $3.0 million, a return on assets of about 0.6%.

:::stat
**49%**
The one-year increase in dividends Champions First paid on shares in 2024, against 20% growth in interest income. When new members don't walk in, funding has to be bought.
:::

## The Capital Ceiling

None of this is a solvency story. Net worth stands at roughly $54.2 million, 10.1% of assets, comfortably clear of the 7% floor that defines a well-capitalized credit union. Asset quality looks tame, with the allowance at 0.73% of loans.

The ceiling is arithmetic. A credit union cannot issue stock, and Champions First carries no subordinated debt, so every dollar of future capital has to come from retained earnings. An institution earning 0.6% on assets while holding a 10% net worth ratio can grow about 6% a year before the ratio starts to slide. Champions First grew 6.5% in 2024. It is running at almost exactly the speed its earnings allow, with nothing in reserve.

That's what makes the funding math risky to extrapolate. Flat membership means growth gets bought with certificate rates. Bought funding compresses earnings. Compressed earnings lower the speed limit. A $900,000 CDFI grant in 2024, nearly a third of that year's net income, helped the earnings line once. The flagship branch planned for Pensacola, on property purchased in 2024, adds fixed cost pointed at the market the GPCE members came from.

:::pullquote
Flat membership never shows up on a cooperative's income statement as a missing line. It shows up as a 49% jump in the price of funding.
:::

## The Stack

Here's the part of the story you can see from a browser. The rebrand made it to the signage, the ribbon cuttings, and the domain name. It has not made it to the application layer.

Online banking at my.championsfirst.org runs on Jack Henry's Banno platform, a credible mainstream front end. The lending and membership funnel is where the seams show. Click "Apply for a Loan" on any product page, auto, personal, mortgage, or the credit rebuilder program, and you leave the brand entirely for app.loanspq.com, MeridianLink's loan origination portal. Opening an account routes to a MeridianLink consumer domain whose URL still carries the lender reference "Floridascu." The loan page's App Store link still points to an iOS app named FSU Credit Union Mobility. Nearly two years after the name change, a prospective member who clicks "join" is handed to a vendor page that, under the hood, still calls the institution by its old name.

This month, that's changing. Champions First has been preparing members since January for an August 2026 rollout of a new online banking platform and mobile app, alongside a new chatbot and phone system. It's the first major infrastructure decision of the Champions First era.

The replatform will fix how the front door looks. Whether it fixes the funnel depends on what happens after someone taps "apply": whether identity, income, and a funding account get verified in one sitting, or whether the new brand still hands its most important moment to a third-party domain that remembers the old name. Champions First is allowed 2,500 new members a year from its western counties alone and is netting about 220 across the whole institution. In a footprint growing as fast as the Florida Panhandle, that gap isn't a demand problem. It's a funnel problem, and funnel problems, unlike charters and names, don't take three years of research to fix.
    `,
  },
  'palmetto-citizens-90-year-wait': {
    title: 'Palmetto Citizens Could Have Opened in Georgia Decades Ago. It Took 90 Years.',
    description:
      "Palmetto Citizens Federal Credit Union's own charter has let Georgia residents join for years. It still took a struggling bank's branch sale, and the same Sardis, Georgia institution RAVEN already profiled, to actually show up there.",
    publishedDate: 'August 3, 2026',
    readTime: '6 min read',
    content: `
# Palmetto Citizens Could Have Opened in Georgia Decades Ago. It Took 90 Years.

*Published August 3, 2026*

## The Number That Doesn't Fit

Palmetto Citizens Federal Credit Union didn't need anyone's permission to serve a member in Georgia. Its charter has allowed that for years, through a partnership with the Carolina Consumer Council that opens membership to residents of South Carolina, North Carolina, Georgia, Tennessee, and Virginia. Nobody had to file anything. Nobody had to wait on the NCUA.

And yet the Columbia, South Carolina credit union didn't put a branch in Georgia until August 1, 2026, when it closed on four branches bought from Southern Bank in Waynesboro, Sardis, Gibson, and Hephzibah. It started serving those roughly 7,000 customers as members two days later. Ninety years after its 1936 charter, this is Palmetto Citizens' first physical presence outside South Carolina.

The seller has its own story, and it's one we've told before. [Southern Bank is the 1945-chartered Georgia bank](/blog/southern-bank-spartanburg-side-door) that recapitalized, moved its headquarters to Spartanburg, and grew from $93 million to $400 million by planting itself squarely in South Carolina's growth corridor. This deal is Southern Bank finishing that job: selling off the Georgia branches it grew out of, the town of Sardis among them, to a South Carolina credit union that was legally free to serve those same Georgia customers the whole time and simply never had a reason to show up until the bank that started there decided to leave.

:::pullquote
The legal door to Georgia had been open for years. It took a bank deciding to leave for the credit union to actually walk through it.
:::

That's the number that doesn't fit: 90 years, against a membership rule that put no real barrier in the way at all. Charter access and market presence turned out to be two entirely different things.

## The Membership Math

Palmetto Citizens' core field of membership runs through eight counties in the South Carolina Midlands: Calhoun, Fairfield, Kershaw, Lexington, Newberry, Orangeburg, Richland, and Saluda. Add those up and you get something close to 990,000 people. Palmetto Citizens' 85,933 members work out to under 9% of that population, almost the exact headroom we found at REV Federal Credit Union on the coast a few weeks back. Whatever is keeping South Carolina credit unions from converting their own charters, it isn't a shortage of eligible people.

:::stat
**Under 9%**
Palmetto Citizens' approximate membership penetration across its eight-county South Carolina field of membership, before counting the Carolina Consumer Council states. The Georgia acquisition adds members faster than years of eligible-but-unconverted South Carolinians would.
:::

The Georgia side of the math looks nothing like the Midlands. Waynesboro, the biggest of the four new towns and the seat of Burke County, has 5,439 people and is shrinking at roughly 1% a year. Median household income sits at $41,620, with more than a quarter of residents below the poverty line. Sardis has 995 people. Gibson is the seat of Glascock County, the fourth-least-populous county in the entire state of Georgia, at 2,884 residents. Hephzibah, the largest by population at 3,830, at least sits inside the Augusta metro.

None of that is a knock on the deal. Palmetto Citizens has held CDFI certification since April 2023, one of only 20 credit unions in South Carolina to earn it, a designation that exists specifically to reward lenders serving low-income and underserved communities. A shrinking Georgia county with a 26% poverty rate is exactly the kind of market that certification is built around. It's just a very different member than the one Palmetto Citizens has spent 90 years signing up in growing, affluent Lexington County.

## The Balance Sheet

The acquisition itself barely moves Palmetto Citizens' numbers. The credit union carries roughly $1.44 billion in assets, $192.9 million in net worth, and a net worth ratio of 13.34%, comfortably above the 7% regulatory floor and ahead of the roughly 11.3% the credit union industry ran in aggregate at the end of 2025. Chief Lending Officer Robert Terrell oversees a loan portfolio of about $734 million. Palmetto Citizens doesn't publish category-level loan mix the way a bank's 10-Q footnotes would, and no CRA performance evaluation exists for a credit union at all, so the auto-versus-mortgage-versus-business split behind that $734 million stays private.

Against that balance sheet, the Georgia branches bring roughly $83 million in shares and $20 million in loans onto the books, per the terms disclosed when the deal was announced in November 2025. That's about 5.8% of Palmetto Citizens' total assets and less than 3% of its loan book. This is not a balance sheet-altering transaction. It's a rounding error with a press release attached, which is exactly why a credit union with no stock to issue and no equity market to tap could absorb it without much strain.

## The Capital Ceiling

Here's where the real constraint shows up, and it isn't this deal. CEO Robert Dozier has said he wants Palmetto Citizens above $2 billion in assets by 2028 or 2029. That's roughly 39% growth from today's $1.44 billion in three to four years, funded entirely by retained earnings the credit union kept instead of paying out as member dividends, tax-free, the tradeoff for a structure with no shareholders and no stock offering waiting in reserve if growth outpaces capital.

A $20 million loan book from four small-town Georgia branches doesn't test that math. A repeat of this deal, five or six times the size, would. Dozier's own target implies exactly that kind of repeat performance: either faster organic growth than a 13.34%-net-worth-ratio institution typically produces on its own, or more acquisitions like this one, each a little bigger, each drawing the same capital cushion down a little further.

:::pullquote
Ninety years of patience bought Palmetto Citizens a comfortable net worth ratio. Three years of an explicit growth target will test how much of that cushion is actually spendable.
:::

## The Stack

Palmetto Citizens' digital lending experience is, honestly, ahead of most of the community banks and credit unions we've profiled. Vehicle loans, mortgages, home equity, and credit cards all apply through one consolidated first-party flow at applynow.palmettocitizens.org, running on Tyfone's nFinia digital banking platform. New membership applications route through MeridianLink, a purpose-built account-opening platform, not the most seamless third-party handoff we've seen, but a long way from a dated legacy portal.

Then there's business lending. Lines of credit, term loans, commercial real estate, SBA 7(a) loans, and nonprofit financing: every single one requires a phone call, a Help Desk message, or a branch visit. Zero of the five have an online application. That gap was a curiosity for a Midlands credit union serving established South Carolina small businesses. It's a mismatch for an institution that just became the primary financial option in Georgia counties where the CDFI mission and small-business programs like SBA 7(a) are supposed to be the point. The member base just got more rural and more dependent on exactly the loan category Palmetto Citizens hasn't figured out how to put online.
    `,
  },
  'rev-credit-union-west-virginia-bet': {
    title: "REV Federal Credit Union's 520-Mile Bet on West Virginia",
    description:
      "A Charleston-area credit union is buying a bank two states away, the first-ever credit union purchase of a bank in West Virginia history. Its own charter doesn't reach anywhere near there.",
    publishedDate: 'August 2, 2026',
    readTime: '6 min read',
    content: `
# REV Federal Credit Union's 520-Mile Bet on West Virginia

*Published August 2, 2026*

## The Number That Doesn't Fit

Spencer, West Virginia sits 520 miles from Summerville, South Carolina. Nine hours by car, most of it through mountains that eat cell signal. REV Federal Credit Union has never had a member in Spencer. It's about to own the town's only bank.

The target is First Neighborhood Bank, a 114-year-old institution with roughly $150 million in assets, five branches, and 39 employees spread across Spencer, Ripley, and Parkersburg. REV announced the deal in 2024. West Virginia's Division of Financial Institutions, the FDIC, and the NCUA signed off on May 27, 2026, clearing the way for a close targeted for May 1, 2027. Lawyers on the transaction called it the first time a credit union has ever bought a bank in West Virginia. Nobody in that state had a form for this, which is a decent explanation for why approval took the better part of two years.

REV isn't some scrappy startup punching above its weight. It's a $1.15 billion federal credit union with 67,000 members and 17 branches around Charleston, and this is its third expansion in five years, after 2021 mergers with two small North Carolina credit unions, Riegelwood and Hamlet. CEO Jason Lee calls the strategy "Growth with Purpose," part of a five-year plan he's named VISION2030, and he's been explicit about the destination: he wants REV to "operate as a multi-billion financial institution."

:::pullquote
A credit union chartered around Charleston's harbor just became the presumptive owner of a bank in a county most of its own members couldn't find on a map.
:::

That's the number that doesn't fit. Not the price tag, which is small change against REV's balance sheet. It's the 520 miles, and everything they imply about why a growing institution goes looking for growth somewhere its own charter doesn't reach.

## The Membership Math

Here's what REV's federal charter actually authorizes. Anyone who lives, works, worships, volunteers, or goes to school in Berkeley, Charleston, Colleton, or Dorchester County, South Carolina, qualifies. So does anyone in Brunswick or Columbus County, North Carolina. So does anyone connected to Joint Base Charleston: active duty, veterans, retirees, their families. And if none of that applies, a $15 donation to the credit union's affiliated foundation buys eligibility anyway, the associational side door most multiple-common-bond credit unions build into their charter for exactly this purpose.

Not one line of that list touches West Virginia.

Which raises the obvious question: how does a customer of First Neighborhood Bank in Spencer become a member of REV once the deal closes? The honest answer, based on how the NCUA has handled prior credit-union-buys-bank deals, is that the agency effectively folds the acquired customer base into membership as a condition of approving the transaction. It's a workaround, not a charter expansion, and West Virginia had never seen the workaround applied before this deal.

Meanwhile, REV's actual home turf is nowhere near full. Charleston, Berkeley, and Dorchester counties alone hold something north of 840,000 people, and Colleton adds another 39,000. REV's 67,000 members work out to somewhere under 8% of that population, before anyone counts the North Carolina counties or the base affiliation. This is a credit union with a nine-figure runway of unconverted eligible members sitting inside its own charter, choosing to spend capital chasing 7,000 new members two states and a mountain range away instead.

:::stat
**8%**
Roughly REV's membership penetration across just its South Carolina field of membership, before counting North Carolina or Joint Base Charleston. There's more growth sitting inside its own charter than the West Virginia deal adds.
:::

## The Balance Sheet

Whatever REV is doing, it isn't doing it from a position of weakness. The credit union closed out 2025 with $167.5 million in net worth against total assets near $1.2 billion, a net worth ratio of 14.16%, more than double the 7% floor federal regulators use to call an institution well capitalized, and well ahead of the roughly 11.3% the credit union industry was running in aggregate at the same point.

Asset quality backs that up. Non-current loans sat at $9.93 million against $4.28 million in loan loss reserves, and REV's Texas ratio, a shorthand that compares troubled assets against the capital and reserves available to absorb them, came in at 5.84%. Anything under 100% is considered healthy. REV isn't close to the danger zone.

What the public numbers don't show is loan mix. REV doesn't publish the kind of category-level breakdown a bank's quarterly filings would carry, and unlike a public bank holding company, it has no 10-Q footnotes to fill that gap. What's visible from its own marketing is a push toward commercial lending, most notably the recent promotion of its business-solutions director to Vice President of Commercial Banking, layered on top of the usual credit union staples of auto loans, mortgages, and share certificates.

## The Capital Ceiling

This is where the structural difference between a credit union and a bank actually bites. First Bancorp, a public South Carolina bank holding company, financed its own acquisition of Carolina Bank & Trust this year with a mix of stock and cash: roughly $126 million in shares and $40 million in cash. REV doesn't have that option. It can't issue stock to anyone, member or outside investor. Every dollar it spends on First Neighborhood has to come from capital it already earned and kept, tax-free, over years of member dividends the credit union chose not to pay out.

That's not a knock on the model. It's the tradeoff for the exemption: no shareholders to answer to, and no equity market to tap when a deal gets expensive.

:::pullquote
A bank buying a bank can sell stock to cover the gap. A credit union buying a bank can only spend what it already has.
:::

Run the arithmetic. First Neighborhood carries roughly $150 million in assets against $12.7 million in capital. Absorb that onto a $1.2 billion balance sheet without a matching jump in net worth, and the post-close ratio mechanically drifts down from 14.16%, even if it lands somewhere still comfortably above 7%. REV has the cushion to absorb a deal this size. It does not have unlimited cushion to keep doing it every few years while still calling the plan "Growth with Purpose" rather than growth against the capital buffer. The ceiling on how fast REV can chase VISION2030 isn't ambition. It's retained earnings, one annual net income figure at a time, with no IPO waiting in the wings if the pace outruns the balance sheet.

## The Stack

REV is also mid-rebuild on the technology side. It relaunched its digital banking platform over the past year and has a new, in-house loan origination and application system targeted for a 2026 launch, a build decision rather than a buy decision, which is the harder and slower path but the one that gives REV control over how a Charleston-area member and a Mid-Ohio Valley member experience the same institution.

That gap is about to get tested for real. A retiree in Summerville and a borrower in Roane County, where median household income runs around $37,000 and unemployment sits near 11%, are not the same member, and REV's new intake system will need to verify both without REV doubling its back office to do it. Every credit union crossing into a market its charter never anticipated hits the same day-one decision: whether the stack was built for the members it has, or for the members it's about to inherit from somewhere the charter never reached.
    `,
  },
  'optimumbank-98-percent-cre-growth': {
    title: 'The 98.7% Bank',
    description:
      'OptimumBank added $432.5 million in loans over twelve months and $427.0 million of it was commercial real estate. A 2.04% ROA, a 48.78% efficiency ratio, and a concentration ratio north of 570% of capital, all in the same quarter.',
    publishedDate: 'July 28, 2026',
    readTime: '6 min read',
    content: `
# The 98.7% Bank

*Published July 28, 2026*

OptimumBank added $432.5 million in loans over the twelve months ending June 30, 2026. Commercial real estate accounted for $427.0 million of it.

That is 98.7% of a year's growth in one asset class. Depending on which table you read first, this is either the best community bank story in Florida or the most concentrated balance sheet in the state. The July 24 earnings release makes a strong case for the first. The loan segment table makes a quieter case for the second.

## A Record Quarter By Almost Any Measure

Start with what the Fort Lauderdale bank actually did, because it is genuinely impressive.

Second-quarter net income hit $6.7 million, up 85% from $3.6 million a year earlier. Return on average assets was 2.04% annualized. Return on average equity was 20.34%. The efficiency ratio came in at 48.78%, meaning the bank spends under 49 cents to earn a dollar of revenue while running one of the fastest balance sheet expansions in the country. Total assets went from $999.1 million to $1.40 billion in twelve months, a 40.2% increase.

The margin story is better than the growth story. Net interest margin expanded to 4.57%, up 25 basis points year over year, because loan yields rose 22 basis points to 6.75% while the cost of interest-bearing liabilities fell 19 basis points to 3.30%. Getting both sides of that trade to move your way in the same year is rare.

Credit looks pristine. Net charge-offs for the quarter were $11,000. Not $11 million. Eleven thousand dollars, against a $1.2 billion loan book. Nonaccruals sat at $2.1 million, or 0.17% of loans, down from $3.2 million a year ago, and one of those loans was settled after quarter end.

S&P Global Market Intelligence ranked OptimumBank 49th out of 3,465 U.S. community banks in the first quarter. Raymond James placed it in the top 10% of publicly traded community banks. All three research firms covering the stock rate it a buy.

:::pullquote
Net charge-offs for the quarter were $11,000. Not $11 million. Eleven thousand dollars, against a $1.2 billion loan book.
:::

## Where the $432 Million Went

Now the loan table.

Commercial real estate stood at $905.2 million on June 30, out of $1.217 billion in gross loans. That is 74.4% of the book. A year earlier it was $478.2 million, so the CRE portfolio grew 89.3% in four quarters. Add multifamily at $52.6 million and land and construction at $46.3 million, and property-secured commercial lending reaches $1.00 billion, or 82.5% of all loans.

Everything else shrank or crawled. Multifamily fell $15.8 million year over year. Land and construction fell $14.8 million. The actual C&I book grew $1.0 million, from $50.4 million to $51.4 million, on a balance sheet that added $402 million in assets.

:::stat
**570%**
OptimumBank's commercial real estate loans as a share of Tier 1 capital plus reserves. Interagency guidance flags banks that cross 300% while growing CRE 50% over three years. This book grew 89% in one.
:::

The interagency guidance on CRE concentrations, issued jointly by the FDIC, Federal Reserve, and OCC, singles out an institution for closer supervisory review when two things are true at once: total CRE loans exceed 300% of Tier 1 capital plus the allowance, and the CRE portfolio has grown 50% or more over the prior 36 months. OptimumBank reported Tier 1 capital at 10.54% of total assets, roughly $147.7 million. Add the $11.0 million allowance and the denominator is about $158.7 million. The CRE line alone works out to 570% of that. Both criteria are cleared by a wide margin, and the growth criterion was met in one year rather than three.

Two caveats, in fairness. The guidance excludes owner-occupied commercial property, and OptimumBank does not disclose that split, so the true regulatory ratio is lower. And 300% is a screening trigger, not a limit. Plenty of healthy banks operate above it for years. What it does mean is that examiners look harder at underwriting, stress testing, and capital planning. Tier 1 leverage has now declined four quarters running, from 11.89% to 10.54%, because earning assets are growing faster than retained earnings.

The allowance moved the other way. It ended June at 0.91% of loans, down from 1.01% in March and 1.19% a year ago. The provision swung from $770,000 of expense in the first quarter to a small net reversal in the second, an $807,000 improvement that landed directly in the $8.8 million pre-tax result. Credit quality genuinely improved. But a falling reserve rate and a doubling CRE book sit next to each other in the same filing.

## What Broward Is Actually Doing

Broward County holds $69.69 billion in deposits across 369 branches and 44 institutions. Only five of those institutions are still headquartered in the county, and together they hold 2.4% of the market. OptimumBank's three Broward branches held $865.3 million in the FDIC's June 2025 survey, more than half of that entire locally headquartered total. In a county that has exported seventeen bank charters since 2008, OptimumBank is most of what is left.

That scarcity is real franchise value. It is also why the concentration deserves a market test rather than a reflex.

Broward's office market is holding up better than the national picture without accelerating. Colliers put county office vacancy at 13.2% in the second quarter, flat from the first, on 57,400 square feet of negative absorption. The first quarter was worse at 161,637 square feet negative. Asking rents are at record highs, $42.83 per square foot overall and $48.51 for Class A, both more than 5% above year-ago levels, but that strength comes from constrained supply rather than tenant expansion. Newmark counted nearly two years without a new office delivery. Suburban submarkets are softer, with Sawgrass Park vacancy running above 22%.

The wildcard is maturities. A large volume of five-year loans written in 2020 and 2021 comes due across 2026 and 2027 into a much higher rate environment, and market analysts expect that to produce distressed sales and recapitalizations over the next eighteen months.

:::pullquote
A bank that just doubled its CRE book at 7.16% yields is underwriting into the maturity wall, not away from it.
:::

## The Funding Side of a Fast Balance Sheet

Deposits grew 38.1% year over year to $1.21 billion, a genuine achievement in a market where Bank of America, Chase, and Wells Fargo control most of the retail base. The mix is where it gets interesting.

Time deposits went from $318.1 million to $511.4 million, up 60.7%, and now make up 42.1% of all deposits at an average cost of 3.87%. Noninterest-bearing demand grew too, up 22.9% to $319.4 million, but its share of the funding base slipped to 26.3%. The loan-to-deposit ratio climbed from 88.13% to 99.20% in a year.

Then there is OptimumFinance. The new non-bank subsidiary made its first loan in the second quarter, $14.2 million, funded by a $14.0 million note payable at 10.00% that the holding company guarantees. Management described the logic plainly: the subsidiary "leveraged their balance sheet to attain the highest yield they could earn for the risk they took." That is a candid sentence to put in an earnings release, and it tells you the direction of travel.

## What the Next Four Quarters Test

None of this says OptimumBank is in trouble. A 2.04% ROA and $11,000 of net charge-offs are not the signature of a bank in trouble. Moishe Gubin took over a $154.5 million institution operating under a consent order in 2010 and built it past $1.4 billion, adding the CEO title in May after sixteen years as chairman. That is a real turnaround, and the market has priced it.

The question is what happens when a growth engine built on relationship CRE lending has to keep running at this speed. Adding $126 million of loans in a single quarter from four branches means every incremental dollar depends on underwriting throughput. Salaries rose 41% year over year and data processing expense rose 58%, both faster than the 40% asset growth. That is the shape of an operation buying people and systems to keep pace with volume.

This is the point where verification infrastructure stops being back-office plumbing and becomes the growth constraint. Property-secured commercial lending at scale means income and asset verification, entity documentation, and rent rolls on every borrower, and examiners looking at a 570% concentration will want evidence that file quality did not degrade while the book doubled. Banks that pull verified borrower and property data from source in minutes, with a full audit trail, can defend the growth rate and the exam at the same time. Banks that cannot eventually pick one.

OptimumBank has four quarters to show it never had to pick.
    `,
  },
  'huntington-bank-southeast-expansion': {
    title: 'The $284 Billion Bank Down the Street',
    description:
      "Huntington added $18.8B in deposits in one quarter, absorbed the Gulf South's biggest homegrown bank, and is building 55 branches across the Carolinas. What the super-regional march south means for the community banks already there.",
    publishedDate: 'July 23, 2026',
    readTime: '6 min read',
    content: `
# The $284 Billion Bank Down the Street

*Published July 23, 2026*

Huntington Bancshares reported second-quarter earnings this morning: $727 million in net income, loans up $15.0 billion, deposits up $18.8 billion. In one quarter.

Nobody grows like that. Huntington didn't either. Those numbers are what it looks like when the Gulf South's biggest homegrown bank finishes becoming a division of a Columbus, Ohio company, and they are the clearest picture yet of what is rolling toward every community bank market in the Southeast.

## The march south, in two deals

Huntington spent 2025 buying its way below the Mason-Dixon line. In October, it closed on Veritex, a $13 billion Dallas bank. Four months later, on February 1, 2026, it absorbed the big one: Cadence Bank, $53.5 billion in assets, headquartered in Tupelo, Mississippi, with a franchise stretching from Houston to the Florida panhandle.

The systems conversion finished in mid-June. This morning's release closed the book: "With the Veritex, Janney & TM Capital, and Cadence integrations behind us," CEO Steve Steinour said, "we are well positioned to deliver the full economic benefits of our combined company."

The combined company is now a $284 billion bank with 1,627 offices, and its FDIC branch map reads like a Southeast community banker's service area. Mississippi: 89 branches. Alabama: 52. Georgia: 39. Tennessee: 33. Florida: 21. Texas: 152. Every one of them acquired in a single February morning.

:::stat
**$18.8 billion**
Deposit growth Huntington reported for Q2 2026, mostly the Cadence effect. For scale: Beacon Community Bank, South Carolina's fastest-growing young bank, gathered $763 million in deposits in eight and a half years. Huntington added 24 times that in one quarter.
:::

## The organic front: 55 branches for the Carolinas

The acquisitions bought the Gulf South. The Carolinas, Huntington is building by hand.

The dates tell you how deliberate it is. Charleston opened in February 2025. Spartanburg in May 2025, eleven months before [an 81-year-old Georgia charter redomiciled there](/blog/southern-bank-spartanburg-side-door) to become the state's newest bank. Greenville in December 2025, into [the same Upstate market where Southern First spent 26 years building a $4 billion franchise](/blog/southern-first-bank-upstate-sc-bet). And last Monday, a newly built freestanding branch at 103 Station Street in Summerville, the fourth in South Carolina and the eleventh in the Carolinas, against a stated plan of roughly 55 across the two states.

"The opening of our first branch in Summerville represents another milestone in Huntington's continued expansion across the Carolinas," is how regional president Trent Holland put it. Milestone is the right word. There are 44 more coming.

## Mississippi's double loss

Set the Cadence deal next to a number from our [de novo drought research](/blog/south-carolina-de-novo-drought): Mississippi has not chartered a new bank since 2008. Eighteen years without a single new institution, and every Mississippi bank chartered since 2000 is already gone.

Now its largest homegrown bank is gone too, not failed, not diminished, just headquartered 700 miles north.

:::pullquote
Consolidation without replacement: the state that stopped making banks just lost its biggest one.
:::

This is the de novo drought thesis at super-regional scale. When acquisitions retire charters and nothing new gets born, decision-making migrates out of state one deal at a time. The [De Novo Watch tracker](/de-novo-watch) counts what's being born; the Cadence deal is a reminder of what the other side of the ledger looks like.

## The digital part is the point

Three days before the earnings release, Huntington put out a different announcement: it had been named the United States' best digital bank for consumers.

That pairing is the whole competitive story. The neobank threat community banks have watched for a decade was [an app with no branches](/blog/what-neobanks-get-right-community-banks). The super-regional threat is the app plus a freestanding branch on Station Street, plus a business banker who shows up to the chamber of commerce lunch. Huntington built its retail reputation on products like 24-Hour Grace and digital onboarding that finishes in minutes, and it has been the nation's most active SBA 7(a) lender by loan count for years, a claim it repeats in nearly every expansion announcement.

Read that last part again if you are a community bank that leans on SBA volume. The lender that does more 7(a) loans than anyone in America is opening branches in [the same markets where SBA lending has been a community bank differentiator](/blog/countybank-greenwood-sc-sba-deep-dive).

## The counter

Community banks have survived every previous wave of consolidation, and the survivors share a pattern: they kept the things scale can't buy and fixed the things it can.

What scale can't buy: local credit decisions made by people who know the borrower, board members who live in the market, the ability to structure around a business that doesn't fit a template. Huntington's Charleston market president is one person; the Lowcountry has dozens of bankers with thirty-year relationships.

What scale absolutely buys: intake. A Huntington customer opens an account or starts a loan application in minutes, verified digitally, from a couch. When that experience was in Columbus, a paper-first process in Summerville was a quirk. Now it is a side-by-side comparison, [and the fix is not turning off the digital channel](/blog/account-opening-fraud-prevention), it is making the community bank's intake as fast and as verified as the one down the street.

:::pullquote
When the best digital bank in America opens a branch on Main Street, the digital gap stops being theoretical.
:::

The $284 billion bank is coming either way. The 55 branches are announced, the systems are converted, and the Q2 numbers say the machine is fed. What happens next in Greenville, Spartanburg, and Summerville depends less on Huntington than on how quickly the banks already there close the intake gap. The relationships were never the problem.
`,
  },
  'southern-bank-spartanburg-side-door': {
    title: "South Carolina's Newest Bank Is 81 Years Old",
    description:
      "On April 14, 2026, Southern Bank moved its headquarters to Spartanburg on a charter issued in 1945. Inside the recapitalization that took a $93M Sardis, Georgia bank to $400M across South Carolina's growth markets, through the de novo process's side door.",
    publishedDate: 'July 22, 2026',
    readTime: '6 min read',
    content: `
# South Carolina's Newest Bank Is 81 Years Old

*Published July 22, 2026*

On April 14, 2026, South Carolina got its first new bank headquarters since 2018. No FDIC application, no conditional approval order, no capital campaign with a charter lawyer on retainer. The newest bank in the state arrived on a charter issued on July 2, 1945.

Southern Bank, now of Spartanburg, spent most of its life as the Bank of Sardis, serving a Burke County, Georgia town of about a thousand people. It was renamed Bank of Burke County in 2001 and kept doing what tiny rural banks do: $80 million in assets, $45 million in loans, a quiet half-percent return, decade after decade.

Then somebody bought the keys. (A reader pointed us to this one after last week's [drought piece](/blog/south-carolina-de-novo-drought). Credit where due.)

## The side door

The front door to banking is the de novo process: an FDIC application, roughly $30 million in committed capital, and a three-year supervisory leash. Nobody has walked through it in South Carolina since Beacon Community Bank in January 2018.

The side door is buying a charter that already exists. An investor group did exactly that with the Bank of Burke County, and the call reports mark the moment: the bank posted a $718,000 loss in 2020, its only loss in the modern record, and new equity started arriving by mid-2021. Capital stair-stepped from $9.5 million to $31.4 million across successive raises. The name became Southern Bank. The strategy became something no Sardis bank ever attempted.

:::pullquote
By headquarters date, the newest bank in South Carolina is three months old. By charter date, it is eighty-one.
:::

This is the same route Georgia's newest bank took this summer, when First City Bank relaunched in Alpharetta on a different 1945 charter. When the front door stays shut for eight years, the market routes around it. The charter purchase skips the application queue; what it cannot skip is everything that comes after.

## The rebuild

What came after, in Southern Bank's case, was growth at a pace that looks more like a de novo than an 80-year-old institution, because functionally that is what it is.

Assets ran $93 million at the end of 2020. Then $145 million in 2021. Then $224 million, $295 million, $338 million, $371 million at each following year-end. As of the first quarter of 2026: $400 million, with $347 million in deposits. The loan book grew from $45 million to $234 million over the same stretch.

:::stat
**$400 million**
Southern Bank's assets at Q1 2026, up from $93 million at the end of 2020. The loan book grew from $45 million to $234 million over the same period.
:::

The income statement tells the honest other half. Net income for 2025 was $856,000, a 0.24% return on assets. Margin compressed from 4.5% in the sleepy years to a 2.87% trough in early 2024 before recovering to 3.4% in 2025. That is what a balance sheet being built at speed looks like: the earnings come later, after the growth is paid for. Every de novo investor knows this curve. Southern Bank's shareholders are living it with an 81-year-old charter instead of a new one.

## The march up the map

The expansion sequence reads like a tour of South Carolina's growth markets, and, not coincidentally, like our own coverage map.

A Greenville branch opened in July 2022, planting the flag in [the Upstate market where Southern First built a $4 billion franchise on relationship banking](/blog/southern-first-bank-upstate-sc-bet). Aiken followed in December 2023, [Security Federal's territory](/blog/security-federal-bank-cdfi-rate-rebound-aiken). Myrtle Beach opened in September 2025, the Grand Strand market where [Anderson Brothers](/blog/anderson-brothers-bank-myrtle-beach-bet) has been proving what a community bank can do with a growth tailwind. And in April the headquarters moved to Spartanburg, with more Greenville and Spartanburg locations announced on the bank's site.

Spartanburg is a pointed choice. The county lost both of its homegrown charters in 2019, when Carolina Alliance and First South were acquired within a month of each other.

:::pullquote
Spartanburg lost two homegrown charters in 2019. In April, it imported one.
:::

Eight offices now span the two states: four in South Carolina's fastest-growing corridors, four in the legacy Burke County footprint that still anchors the charter's history.

## Forty decades of bankers, one modern stack

The leadership page explains how a $400 million balance sheet got built this fast. CEO M.J. "J." Huggins III brings nearly four decades in community banking. Jamin M. Hujik runs the holding company, Southern Financial Corp, as CEO and serves as the bank's executive vice-chairman. President and Chief Banking Officer Scott M. Frierson, Chief Lending Officer Frank Townsend, and Chief Administrative Officer Kristi Eller each carry more than 35 years. This is not a fintech cosplaying as a bank. It is five long-tenure bankers who have watched the state's charters disappear and decided the answer was to bring one in.

The posture is explicitly digital. The bank's tagline is "Modern bank technology. Small-town values." It runs online account opening for both personal and business customers, and it is currently paying 4.10% APY on a 10-month CD, which is what deposit-gathering mode looks like in 2026. Deposits grew $30 million in the first quarter alone.

## What a growth bank's intake has to carry

Here is the structural observation, and it applies to every bank on this trajectory, not to this one specifically.

A bank that grows 4x in five years across four metro markets is, by definition, onboarding customers its bankers have never met. Online account opening in growth markets means applications from people with no branch relationship, no referral, and no history with the institution. The industry's default intake, typed-in data and borrower-supplied documents, was built for the opposite customer, and it is [the mistake that made older banks retreat from digital channels entirely](/blog/account-opening-fraud-prevention) after fraud waves found them.

The banks that get this right treat verification as the growth enabler: identity checked against authoritative sources, funding accounts confirmed by direct connection, income and employment pulled from systems of record. Fast for the real customers, closed to the fake ones. A [de novo makes that choice on day one](/blog/de-novo-bank-day-one-fraud-program); a charter reborn at 81 gets to make it mid-flight, which is harder and matters more, because the volume is already arriving.

Southern Bank just became the newest entry on our [De Novo Watch](/de-novo-watch) map by the least likely route available. The next few call reports will show whether the earnings curve bends the way the growth curve promises. The intake question travels with them either way.
`,
  },
  'south-carolina-de-novo-drought': {
    title: 'No One Starts Banks in South Carolina Anymore',
    description:
      'South Carolina chartered 56 banks in the 15 years before 2010 and one in the 16 years since. Thirteen charters have retired since 2018, in the fastest-growing state in America. The de novo drought, in FDIC data.',
    publishedDate: 'July 21, 2026',
    updatedDate: 'July 22, 2026',
    readTime: '6 min read',
    content: `
# No One Starts Banks in South Carolina Anymore

*Published July 21, 2026*

The Census Bureau ranked South Carolina the fastest-growing state in America in 2023. The FDIC has not insured a new South Carolina bank since January 2018.

Hold those two facts next to each other for a second. Population growth is the entire underwriting case for a community bank: new households need mortgages, new businesses need operating accounts, new money needs somewhere local to sit. South Carolina has all three in abundance. What it no longer has is anyone building banks to catch them.

## The class of 56

From 1995 through 2009, the FDIC insured 56 new institutions chartered in South Carolina. Fifty-six. Nearly four a year, every year, for fifteen years, in a state that started the run with about 3.7 million people.

The class had range. Lowcountry startups chasing the Charleston boom. Upstate commercial lenders in Greenville and Spartanburg. Coastal banks built for the Grand Strand's growth machine. The last two members arrived in 2009: Regent Bank in Greenville that April, Coastal Carolina National Bank in Myrtle Beach that June.

Then the assembly line stopped.

## Then the door closed

Since 2010, the FDIC has issued exactly two new South Carolina certificates. One was CertusBank in 2011, a shelf charter assembled to buy failed banks out of receivership, which is a different animal from a community bank and is itself long gone. The other was Beacon Community Bank in January 2018.

One true [de novo](/glossary/de-novo-bank) in sixteen and a half years.

:::pullquote
One new bank in sixteen and a half years, in the fastest-growing state in America.
:::

The freeze had national causes. In 2009 the FDIC stretched de novo supervision from three years to seven, and organizers stopped organizing; the agency rescinded the policy in 2016, but the pipeline had emptied. A decade of zero interest rates wrecked the spread math a startup bank lives on. And the capital ante kept climbing: when Portrait Bank chartered in Florida last month, its FDIC order required exactly $27,996,000 in paid-in capital before the doors could open.

The operating math got harder too. CSBS data puts compliance at 8.7% of noninterest expense for banks under $100 million in assets, against 2.9% for banks over $1 billion. The smallest banks pay triple the regulatory tax, and every de novo starts as the smallest bank.

:::stat
**56**
FDIC-insured institutions were chartered in South Carolina in the 15 years from 1995 through 2009. In the 16 years since 2010: one true de novo.
:::

## Meanwhile, the exits never stopped

Since the day Beacon opened, thirteen South Carolina charters have been retired, nearly all through acquisition.

Independence National in Greenville went first, fifteen days after Beacon's opening. Then Atlantic Community in Bluffton. Palmetto Heritage in Pawleys Island. Heritage Community and, later, Mutual Savings, both of Hartsville. Clover Community. Carolina Alliance and First South, both of Spartanburg. CresCom in Charleston. Sandhills in North Myrtle Beach. GrandSouth in Greenville. Community First in Walhalla. And in 2020, South State, the biggest bank the state ever built, merged into a Florida charter and took its headquarters with it.

South Carolina is down to 44 FDIC-insured institutions headquartered in the state. Number fourteen is already in the pipeline: [First Reliance announced its sale in June](/blog/first-reliance-sells-at-the-top).

Consolidation is not a South Carolina quirk. It is the national story, and it is the stated rationale in nearly every de novo application filed anywhere. The South Carolina quirk is that nothing replaces the banks that leave.

Florida has filed five of the nation's fifteen deposit insurance applications in 2026, and one of them, Portrait Bank, is already chartered. Alabama produced two new banks in two years; the second, Solutions Plus Bank in Albertville, reached $34 million in assets within seven months of opening. Georgia's last new bank came in 2022, North Carolina's in 2020.

South Carolina has nothing pending on the FDIC's application list, and no organizing group has surfaced publicly.

**Update, July 22:** There is one asterisk, and it proves the rule. During the drought an investor group bought the 1945-chartered Bank of Burke County in Sardis, Georgia, relaunched it as Southern Bank, and in April 2026 moved its headquarters to Spartanburg, where it now holds $400 million in assets. A new bank for South Carolina without a new certificate: the side door. [We wrote up the full story.](/blog/southern-bank-spartanburg-side-door)

## The one that got in

Beacon Community Bank raised its capital in Mount Pleasant and opened in January 2018, the only true de novo to clear the door before it swung shut.

It started that year with $36 million in assets. As of the FDIC's latest data, it holds $972 million in assets and $763 million in deposits.

:::stat
**27x**
Beacon Community Bank's asset growth since opening in January 2018: from $36 million to $972 million, in a Charleston market adding roughly 8,500 households a year.
:::

Read that as a market signal, because that is what it is. If South Carolina's problem were demand, the one new bank of the past sixteen years would be small. Instead it compounded 27-fold in eight and a half years, fast enough that [its balance sheet outgrew its own intake](/blog/beacon-community-bank-charleston-growth-capacity), which is the kind of problem most bankers would trade for.

:::pullquote
The one bank that got through the door before it closed grew twenty-seven-fold. The demand was never the problem.
:::

## What it would take to break the drought

The mechanics are documented. [The de novo playbook](/blog/how-to-start-a-bank) runs from organizing group to FDIC application to conditional approval to a three-year heightened-supervision period, and nationally only ten to fifteen true community bank groups a year get one off the ground. The ante is roughly $30 million now, and Portrait's organizers raised $43 million from 256 local investors to clear it comfortably.

A South Carolina group would start with unusual advantages. The growth math writes itself. Thirteen retired charters mean thirteen sets of displaced veteran bankers and thirteen books of customers who did not choose their new, larger bank. Every acquisition that thinned the market also stocked it with exactly the people who start banks.

And a bank built in 2026 gets one advantage the class of 56 never had: it can skip the industry's intake mistake entirely. The banks that bolted digital account opening onto document-based processes learned that a fast application without verification behind it is a fraud channel, and [a de novo's first exam tests the fraud program its application promised](/blog/de-novo-bank-day-one-fraud-program). Starting source-verified from day one is an architectural decision that costs a fraction of retrofitting it later.

We track every new filing, charter, and opening at [De Novo Watch](/de-novo-watch). Florida's section keeps growing. Alabama earned two rows. The South Carolina row has been empty since January 2018.

Someone should fix that.
`,
  },
  // ---- SEO DRAFTS (Jul 18, 2026) ----------------------------------------
  // Routable for preview but NOT published: absent from articles-index.ts
  // (blog listing, related-article pool) and from blog/published.ts (sitemap,
  // llms.txt). To publish: review the competitor claims, then add the slug to
  // both files.
  'the-work-number-alternatives-community-banks': {
    title: 'The Work Number Alternatives for Community Banks (2026)',
    description:
      'Equifax raised The Work Number’s prices again in January 2026, and one mortgage with two borrowers can cost $280 to verify. A community bank buyer’s guide to the alternatives: Truework (now Checkr), Truv, Argyle, Experian Verify after Workday, and the verbal VOE.',
    publishedDate: 'July 18, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `
# The Work Number Alternatives for Community Banks (2026)

*Published July 18, 2026*

Disclosure up front: RAVEN, which publishes this site, sells verification software to community banks and uses one of the vendors below as a data source. This guide says plainly what each option is good at, because a wrong-fit verification contract is expensive in both directions.

The Work Number, owned by Equifax, is the default answer to employment verification in US lending. It is a database of payroll records contributed by employers and payroll providers, and when a borrower's employer is in it, a verification that used to take three phone calls comes back in seconds. Two things push lenders to look for alternatives anyway. The first is price: Equifax raised the cost of Work Number employment verifications again effective January 1, 2026, on top of increases the Community Home Lenders of America was already protesting in 2024, when it put a single verification at $55 to $70 and a mortgage with two borrowers at as much as $280. The second is coverage, which runs thinnest exactly where community banks lend: small employers, farms, municipalities, and self-employed borrowers who are in nobody's payroll database.

The alternatives also got more serious in the past year. Checkr, the background check company, agreed to buy Truework in April 2025, and in September 2026 Experian connected Workday's payroll data to its own verification network.

For a community bank, the question is not "what replaces The Work Number." It is "what mix of verification methods covers my borrower base at a cost that works on a $250,000 loan, and satisfies my examiner and the GSEs." Here are the realistic options.

## What you are actually buying

Employment and income verification tools differ on five axes:

- **Coverage model.** Database lookups (The Work Number, Experian Verify) cover employees of contributing employers. Consumer-permissioned connections (Truv, Argyle) cover anyone who can log into their payroll or bank account. Orchestration platforms (Truework) chain methods: instant lookup first, then credentials, then human outreach.
- **Borrower friction.** A database lookup asks nothing of the borrower. A permissioned connection asks them to log into their payroll provider, which most can do in under a minute and some will refuse.
- **GSE acceptance.** Fannie Mae's DU validation service and Freddie Mac's AIM each maintain lists of eligible report suppliers. If you sell to the agencies, confirm the vendor is on the current list before signing anything.
- **Compliance posture.** Employment verifications used in lending decisions are consumer reports under the FCRA; the vendor should be operating as a consumer reporting agency or clearly documenting why it is not.
- **Cost model.** Per-report pricing, subscriptions, and per-completed-verification pricing behave very differently at community bank volumes. We wrote about the underlying economics in [The $70 Phone Call](/blog/income-verification-fintech-vs-bank).

## The alternatives

### Truework

Truework is an orchestration layer: it tries an instant database match, then a borrower-permissioned payroll login, then, if both miss, its own team completes a manual verification with the employer. That waterfall is the honest response to the real world, where no single method covers everyone. It is strongest for mortgage lenders that need a completed verification on every file, not just the easy ones. Checkr agreed to acquire Truework in April 2025 and has kept it running as its own product; Truework says its customers include eight of the ten largest US lenders by origination volume. Ask any vendor in this category for per-completed-verification pricing in writing, since list prices are rarely the whole story.

### Truv

Truv is consumer-permissioned: the borrower connects their payroll account directly, and the lender receives source data rather than a database snapshot. Truv markets coverage of most of the US workforce, positions itself directly against The Work Number on price, and is eligible under both major GSE validation programs. The tradeoff of the permissioned model is completion: some borrowers will not or cannot connect, so plan a fallback path.

### Argyle

Argyle sells the same consumer-permissioned model as Truv, with direct payroll connections and GSE program eligibility, and competes explicitly on cost against database pricing. Mortgage lenders and IMBs are its center of gravity. As with Truv, the design question for a bank is what happens to the file when the borrower does not connect.

### Experian Verify

Experian built its own employer records network as a second database option. In September 2026 it added an integration with Workday, the payroll and HR system behind many of the largest US employers, and said the expansion gives Experian Verify a path to more than 80 million records, over half of US payroll employees. "Path to" is a projection, not a current count, so test hit rates on your own recent files. For lenders that already buy Experian data, it is an easy lookup to run before paying for a premium report elsewhere.

### The verbal VOE, still

For portfolio loans, the phone call remains free and compliant. Fannie Mae's rules for verbal verification of employment are specific about timing and about sourcing the employer's phone number independently; our [verification of employment glossary entry](/glossary/verification-of-employment) walks through the written and verbal requirements, including Form 1005 and Form 90. The verbal VOE does not scale and does not catch a coached reference on a fraud ring's phone line, but it is the correct floor for low-volume, in-market lending.

### Where RAVEN fits

RAVEN is not a standalone VOE database. It is the verification layer around the whole application: identity and synthetic-identity screening, bank-connected income and assets, employer-verified employment (Truework is our employment source), and property data, returned from one borrower link with the sources cross-referenced. Community banks buy it when the problem is not "verify this one employer" but "stop running a document chase on every loan." If you only need raw VOE reports at volume, buy one of the tools above directly; if the employment check is one of six verifications your processors are juggling per file, that is the problem RAVEN exists for. See [instant employment verification](/solutions/instant-employment-verification) for how it works.

## How to choose

- **You sell mostly to the GSEs:** shortlist vendors on the current DU validation and AIM eligibility lists, then compare completion rates on your actual borrower mix, not the marketing coverage number.
- **You lend to small-employer and self-employed borrowers:** a database-only strategy will miss often. Prefer orchestration or permissioned models with a manual fallback.
- **You are cost-sensitive at community bank volume:** get per-completed-verification pricing in writing from two vendors and compare against your current per-file spend, including staff time on callbacks.
- **You suspect application fraud:** no employment database catches a fabricated employer with a live phone line. Source-verified data does. Our piece on [first-party fraud](/glossary/first-party-fraud) explains why the identity can check out while the application lies.

## FAQ

**Is consumer-permissioned payroll data acceptable to Fannie Mae and Freddie Mac?**
Yes, when it comes through a vendor on the agencies' current eligible-supplier lists and is processed through DU validation or AIM. Confirm the specific vendor and report type against the current list; the lists change.

**Does any alternative fully replace The Work Number?**
No single tool matches its instant-hit rate on large-employer borrowers. Realistic strategies either orchestrate multiple methods or accept a manual fallback for the misses. The decision is about cost and coverage on your borrower base, not about a one-for-one swap.

**What does employment verification cost in 2026?**
Database reports are priced per pull, and The Work Number's prices rose again on January 1, 2026. The most recent public lender figure, from the Community Home Lenders of America in 2024, was $55 to $70 per verification, and a two-borrower mortgage verified during underwriting and again shortly before closing can reach $280. Permissioned and orchestrated vendors generally price per completed verification and compete on that number. Manual verification costs staff time, roughly an hour per file across the callbacks. Get current quotes in writing; published numbers age fast.
`,
  },
  'best-digital-account-opening-software-community-banks': {
    title: 'Best Digital Account Opening Software for Community Banks (2026)',
    description:
      'An honest comparison of digital account opening platforms for community banks: MANTL (Alkami, $40 billion in deposits raised), Narmi, Apiture (now CSI), core-attached options from Jack Henry and Fiserv, and verification-first intake. Written by a vendor, with the disclosure.',
    publishedDate: 'July 18, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `
# Best Digital Account Opening Software for Community Banks (2026)

*Published July 18, 2026*

Disclosure: RAVEN, which publishes this guide, is one of the vendors below. Every "best software" list in this category is written by a vendor; at least this one says so in the second sentence and tells you when a competitor is the better buy.

The benchmark numbers in this market are public and brutal. MANTL, the category's best-known platform, reports an average under five minutes to open a retail deposit account across online and in-branch channels. Megabank and neobank onboarding set borrower expectations, and an application that takes twenty minutes and ends with "visit a branch to fund your account" loses most of its applicants before the finish line. Meanwhile the banks that moved fast without verification learned the other lesson: an account-opening flow that accepts whatever the applicant types is a fraud vector, and more than one bank has [turned online account opening off entirely](/blog/account-opening-fraud-prevention) after a fraud wave.

So the honest selection criteria are speed to funded account, fraud controls at the front door, core compatibility, implementation weight, and what it costs at your asset size. Here is how the field actually breaks down.

## The dedicated platforms

### MANTL (now part of Alkami)

MANTL built its reputation on deposit origination for community banks and credit unions and was acquired by Alkami in March 2025. Its numbers are the category benchmark: in June 2026 Alkami reported that MANTL customers have raised more than $40 billion in deposits on the platform, with an average under five minutes to open a retail account and about ten minutes for a business account, across channels. The branch is now its fastest-growing channel; more than a million in-branch applications have been booked through MANTL. It is a strong choice for deposit-growth-driven banks that want a proven engine and are comfortable buying from a larger digital-banking company post-acquisition. Pricing is not published.

### Narmi

Narmi sells digital banking and consumer and business account opening built specifically for community banks and credit unions. Its case studies name real community institutions with real numbers, which is rarer in this market than it should be. Narmi fits banks that want a modern digital banking front end and account opening from one vendor. Most pricing is not published.

### Apiture

Apiture provides digital banking with account opening for US banks and credit unions. It used to be the shortlist entry for institutions that wanted a full digital banking suite from a vendor that was not a core provider; that changed when CSI completed its acquisition of Apiture in October 2025. For CSI core banks it is now close to a core-attached option. For banks on other cores, ask how the roadmap and integration priorities have changed under a core owner.

## The core-attached options

If you run a Jack Henry, Fiserv, or CSI core, each will sell you account opening that is already integrated: Banno for Jack Henry shops, Fiserv's digital origination products, and CSI's account opening, which now includes Apiture. The integration is the point; the tradeoff is that your account-opening roadmap moves at the core vendor's pace, and switching cores later means switching this too. See our notes on [Jack Henry](/integrations/jack-henry), [Fiserv](/integrations/fiserv), and [CSI](/integrations/csi) for how third-party tools coexist with each.

### Candescent

Candescent (the former NCR Voyix digital banking business) serves more than 1,300 banks and credit unions and partners with fintech vendors for capabilities like direct deposit switching. It launched a rebuilt mobile experience, Votiv, in April 2026. Banks already on Candescent digital banking typically evaluate its native flows first.

### nCino

nCino is the heavyweight option: onboarding and origination on a Salesforce foundation, strongest in commercial and business banking. For a community bank whose pain is consumer deposit account opening, it is usually more platform than the problem requires.

## The verification-first option

### RAVEN

RAVEN, our product, approaches the same problem from the fraud end. The flow verifies at the source as the applicant moves through it: identity and synthetic-identity screening against authoritative records, watchlist checks, bank-account verification by direct connection rather than a typed routing number, and income or employment data when the account or the relationship calls for it. The output is a funded, verified account and an examiner-ready record of what was checked and where every data point came from.

Where it fits: banks that turned digital account opening off after fraud losses, banks opening it for the first time and unwilling to accept typed-and-unverified intake, and de novo banks building a [day-one stack](/solutions/de-novo-bank-technology). It layers on your existing core and LOS rather than replacing your digital banking. Where it does not fit: if you want one vendor for your entire digital banking experience, buy one of the platforms above; RAVEN is the verification-first intake layer, not a mobile banking suite. Details at [digital account opening](/solutions/digital-account-opening).

## How to run the evaluation

- **Time yourself.** Open an account at your own bank on your phone, stopwatch running, and then do the same at a neobank. The gap is your requirement document.
- **Ask every vendor the fraud question first.** What is checked at the source before an account can be funded: identity, SSN issuance, funding account ownership? "We integrate with a fraud tool" is a different answer than "these checks run on every application."
- **Count the implementation.** Core-attached options integrate fastest; dedicated platforms bring more capability and more project; a verification layer in front of intake is the smallest lift but is not a full digital banking replacement.
- **Get funding-rate numbers, not application numbers.** Applications started is a vanity metric. Ask references for funded-account rate and first-30-day deposit balances.

## FAQ

**How fast should digital account opening be in 2026?**
Under five minutes for a retail account is the competitive benchmark: MANTL reports an average under five minutes across online and in-branch channels, and about ten minutes for business accounts. If your flow takes twenty minutes or ends with a branch visit to fund, that is the gap to close.

**Why do community banks turn off online account opening?**
Fraud, almost always: flows that accepted typed, unverified data at internet speed attracted first-party fraud, synthetic identities, and [new account fraud](/glossary/new-account-fraud) faster than back offices could review it. The fix is verification at the source, not abandoning the channel.

**Do I have to replace my core to offer digital account opening?**
No. Every option in this guide, including the core vendors' own products, runs alongside an existing core. The real variable is how much of your digital front end you want to replace at the same time.
`,
  },
  // ---- END SEO DRAFTS ----------------------------------------------------
  'portrait-bank-winter-park-de-novo': {
    title: "Portrait Bank: The $43M Bet That Orlando Wants Its Hometown Bank Back",
    description:
      "Central Florida's last de novo grew to $827M and got absorbed by a Michigan credit union. Eight months later, Portrait Bank chartered in the same city with $43M from 256 local investors and 'agentic AI' in its press release.",
    publishedDate: 'July 11, 2026',
    readTime: '6 min read',
    content: `
# Portrait Bank: The $43M Bet That Orlando Wants Its Hometown Bank Back

*Published July 11, 2026*

On November 3, 2025, the Orlando area's only new bank of the past two decades disappeared into a Michigan credit union. Eight months later, and a few blocks away, Portrait Bank got its charter.

That sequence is the whole story of Central Florida banking in miniature. Winter Park National Bank opened in 2017, grew to $827 million in assets, proved a hometown bank could still win in this market, and got bought for its trouble. DFCU Financial, a credit union headquartered 1,100 miles away in Dearborn, completed the acquisition last November. The market's reward for building a successful local bank was ceasing to be one.

Erik Weiner watched all of it. "Whenever there's a community bank that's proven successful, there's somebody waiting in the wings to pick them off," he told Florida Trend in April. His answer was to build the next one anyway.

## The filing: 54% over the floor

Portrait Bank's organizers filed with the FDIC on August 27, 2025. Conditional approval came February 5, 2026. The Florida Office of Financial Regulation granted the state charter on June 29, and the bank is now soft-open by appointment at 941 West Morse Boulevard in Winter Park, with a full public grand opening set for September.

The capital story is the part worth reading twice. The FDIC's order required initial paid-in capital of exactly $27,996,000. Portrait closed its raise at $43 million.

:::stat
**$43 million**
Raised from 256 local investors, with a $100,000 minimum buy-in and an average check around $200,000. That is 54% above the FDIC's required minimum.
:::

No private equity sponsor. No out-of-market anchor investor. 256 Central Florida households and business owners who wrote six-figure checks to get their bank back. The organizers set out to raise $30 million and had to keep raising the target because demand would not stop.

## The people: three careers, one pattern

Weiner, 52, is a Winter Park native and UCF finance graduate with roughly 30 years in Central Florida banking: SouthTrust, Fifth Third, BankUnited, and most recently City National Bank of Florida, where he was Central Florida market president from 2019 until January 2025.

His COO, Jay Darulla, spent 25-plus years in retail banking at Bank of America, at one point running the largest and most profitable financial center in Florida. Chairman Ed Timberlake has 50 years in the business: 15 as a Bank of America regional president, then 13 as regional board chairman of Seaside National Bank & Trust.

Notice the pattern. Seaside sold to United Community Banks in 2020. Winter Park National sold in 2025. Every strong local institution these three touched eventually got absorbed by someone bigger and farther away.

:::pullquote
Every strong local bank this team touched eventually got absorbed by someone bigger and farther away. This time they own the thing.
:::

The 14-member board reads like a Winter Park chamber of commerce meeting: a catering company owner, a construction executive, a managing partner of a law firm, the Central Florida market president of Florida Blue, a retired CPA. That is not window dressing. In community banking, a board of local operators is a deposit-gathering machine.

## The market: $44.6 billion, two thirds of it answering elsewhere

Orange County held $44.59 billion in deposits as of the FDIC's June 2025 Summary of Deposits. Truist, Bank of America, JPMorgan Chase, and Wells Fargo control 64.6% of it. The largest locally headquartered competitor, One Florida Bank, holds 2.4%.

The consolidation math behind that: Central Florida had 38 locally headquartered banks in 2000. Today it has about six. Portrait is the first new bank chartered in Orange County since 2008.

Meanwhile the market underneath keeps compounding. The Orlando metro added 37,690 residents in the year ending July 2025, reaching nearly 2.96 million, and posted the highest job growth rate among the 30 largest US metros in 2024. Winter Park itself is one of Florida's wealthiest enclaves: median household income of $105,724 and a median home value of $731,400.

More people, more businesses, more wealth, fewer local banks every year. That is the gap Portrait's 256 investors are betting on.

## The gauntlet: what the next three years require

New bank formation nationally has, in FDIC Chairman Travis Hill's words, "fallen off a cliff." Roughly 85 banks opened in the entire 2010 to 2025 stretch, fewer than six per year, against 93 or more every single year from 1995 to 2007. Only four opened in all of 2025. Six have opened so far in 2026, and the FDIC's pending list held about two dozen applications as of July 7, a real thaw by recent standards.

Getting the charter is the start, not the finish. Portrait's own FDIC order spells out the three-year de novo leash: a Tier 1 leverage ratio of at least 8%, no dividends without prior FDIC approval, annual independent audits, FDIC non-objection for every new director or senior executive, and operation within the business plan on file, with prior notice of any material deviation.

That last condition matters more than it sounds. The business plan Portrait submitted promises service to small and medium-sized businesses and individuals across the Orlando MSA. Whatever fraud and compliance program that plan describes, examiners will expect to see it running at the first exam, not on a roadmap.

## The stack: agentic AI in a charter press release

Portrait's June 29 charter announcement contains a sentence you will not find in many community bank press releases: the bank is "deploying advanced tools like agentic AI for real-time fraud detection." Timberlake went further, claiming "the technology to compete with any national bank on day one."

:::pullquote
A de novo community bank put "agentic AI for real-time fraud detection" in its charter press release. The vendor behind it has not been named.
:::

That is a genuinely differentiated posture for a de novo. Most new banks talk about relationships and local decision-making; Portrait is talking about relationships plus a fraud stack, which is exactly the right instinct. The banks that bolted digital account opening onto document-based intake over the past decade learned the hard way that a fast application without verification behind it is a fraud vector, not a growth channel. More than one bank COO has turned digital account opening off entirely after a fraud wave.

Portrait gets to skip that mistake. A bank built in 2026 can make source-verified onboarding, where identity, income, employment, and address come from authoritative data sources rather than borrower-typed documents, a day-one architectural decision instead of a retrofit. No public source yet names Portrait's core provider or its AI partner, so the most interesting question about the most interesting de novo in Florida is still open: what, exactly, is under the hood when the doors open in September?

The 256 investors who oversubscribed this bank are betting Orlando wants its hometown bank back. The September opening will start answering whether the technology matches the talk. Given who is building it, the smart money says take them seriously.
  `,
  },
  'glades-bank-broward-de-novo': {
    title: 'Glades Bank and Trust: A $45M Filing for the County the Banks Left Behind',
    description:
      "The five banks still headquartered in Broward County hold 2.4% of its $69.7B in deposits. A group led by the ex-Amerant executive who digitized Florida's largest community bank just filed to build a new one.",
    publishedDate: 'July 11, 2026',
    readTime: '6 min read',
    content: `
# Glades Bank and Trust: A $45M Filing for the County the Banks Left Behind

*Published July 11, 2026*

The five banks still headquartered in Broward County hold 2.4% of its deposits. The other 97.6% of a $69.7 billion market answers to boardrooms in Charlotte, New York, San Francisco, and Toronto.

Into that vacuum, on June 2, 2026, a group led by former Amerant executive Howard Levine filed an FDIC application for Glades Bank and Trust, a proposed new bank headquartered in Plantation. The filing itself is one sentence on the FDIC's pending list. The market it targets took two decades to hollow out.

## The filing: $45 million and a head start

The FDIC received the Glades application on June 2; it is pending, and the organizers are reportedly raising $45 million. For scale, that is more than the $38 million Locality Bank raised to open in Fort Lauderdale in 2022, and well above the roughly $30 million behind Evermore Bank the same year.

One detail suggests this has been in motion far longer than the filing date implies: gladesbank.com was registered on October 9, 2025, eight months before the application landed. Whatever Glades is building, it was not rushed.

:::pullquote
The domain was registered eight months before the FDIC filing. Whatever Glades is building, it was not rushed.
:::

Levine's own framing, from his LinkedIn announcement: a bank "built on relationships" for "founders, business owners, professionals, and growing companies," where a business owner "can easily reach someone who knows their name, understands their business, and is genuinely invested in their success."

## The people: the executive who digitized Florida's largest community bank

Levine is not a first-time operator testing a thesis. He spent four years in the executive suite of Amerant Bank, the $9.9 billion Coral Gables institution that calls itself the largest community bank headquartered in Florida. He arrived in 2021 as chief revenue officer of Amerant Mortgage, was named head of consumer banking in 2022 with Private Client, Wealth, Mortgage, Business Banking, and Retail under him, and rose to senior EVP and chief consumer banking officer before stepping down in February 2025.

The relevant part of that tenure is what happened to Amerant's consumer business while he ran it. The bank executed a digital transformation that made it a 2023 Banking Tech Awards USA finalist, partnering with Alloy for identity and onboarding, Numerated for digital business lending, Marstone for digital wealth, and Q2's ClickSWITCH for deposit acquisition. Levine has seen what a modern consumer banking stack looks like from the inside, at scale, in this exact market.

His co-organizers, per The Bank Slate, are executives from Exuma Capital Partners, a private equity firm founded in 2022 by Air Pros USA founder Anthony Perera. Exuma's headquarters sit in Plantation, the same city as the proposed bank. A hometown bank organized by people whose firm is already headquartered in that hometown is exactly how this is supposed to work.

## The market: the county the banks left behind

Broward County is Florida's second most populous county: 1.99 million people, a $136.6 billion economy, 81,809 business establishments, and a small business base of 58,510 employer firms plus another 336,055 nonemployer businesses.

Here is who banks it. Bank of America, Chase, Wells Fargo, and Truist hold 64% of the county's $69.7 billion in deposits. The five banks still headquartered in the county, two of which are Canadian-owned retail outposts, hold $1.7 billion combined.

:::stat
**2.4%**
The share of Broward County's $69.7 billion in deposits held by all five banks still headquartered in the county, combined.
:::

Seventeen Broward-headquartered banks have disappeared since 2008. The most recent was the most symbolic: American National Bank of Oakland Park, family-owned for 38 years and often called Broward's oldest community bank, sold to Georgia's United Community Banks for roughly $80 million in May 2025.

The counter-evidence that local demand survived the consolidation: Locality Bank, the county's first new bank since 2009, opened in January 2022 and passed $300 million in assets within three years. The market did not stop wanting a hometown bank. It just stopped having ones to choose from.

## The gauntlet: a Florida wave meets a friendlier FDIC

Glades is filing into the strongest de novo environment in years, and the epicenter is its home state. Five of the fifteen deposit insurance applications filed nationally in 2026 through early July are Florida banks: New South Bank in Tampa, Tidestone Bank and Florida Bank of Finance in Coral Gables, Portrait Bank in Winter Park (chartered June 29), and Glades. Add BankMiami's March 2025 opening and Echelon Bank's April 2026 opening in Clearwater, and Florida is producing new banks faster than any state in the country.

The regulatory weather helps. FDIC Chairman Travis Hill has called the post-2010 formation drought, roughly 86 new banks in 15 years against 412 in 1984 alone, a problem to fix, and has proposed easing capital expectations for noncomplex community banks. In June, the FFIEC issued a joint statement explicitly supporting new bank formation.

None of that softens the standard that follows approval: three years of enhanced supervision, an 8% minimum Tier 1 leverage ratio, dividend restrictions, and a first examination that tests whether the programs described in the business plan actually exist. For a bank whose stated market is founders and growing companies, the BSA and fraud program examiners will want to see is not a generic one. Business banking means entity documents, beneficial ownership, and owners whose income rarely fits on a pay stub.

## The stack: an early signal most de novos never send

Most bank organizing groups say nothing about technology until after approval. Levine has already named a core: he noted on LinkedIn that Glades is partnering with CSI, the community bank core processor, as the institution takes shape.

That is an unusually early commitment, and a revealing one. Choosing the core first is the conventional sequence; the decisions that follow it are the ones that will define how Glades actually feels to the founders and business owners it wants. Account opening, identity verification, income and employment data, fraud screening: the layer between the borrower and the core is where a 2026 de novo can be genuinely better than the incumbents, because it gets to start source-verified instead of retrofitting verification onto document-based intake the way every 20-year-old bank must.

Levine has already run that playbook once, wiring Alloy, Numerated, and Marstone into a $10 billion balance sheet. The interesting question for Glades is what the equivalent stack looks like when you get to design it before day one, for a county with 336,000 nonemployer businesses whose owners do not have W-2s.

Broward has been exporting its banks for twenty years. A $45 million filing organized by the executive who digitized Florida's largest community bank, backed by a PE firm headquartered in the same city, is the most credible attempt yet to reverse the flow.
  `,
  },
  'first-party-fraud-community-banks': {
    title: 'First-Party Fraud: The Applicant Is Real. The Application Isn’t.',
    description:
      'First-party fraud jumped from 15% to 36% of all reported fraud in one year and now leads every category globally. Your KYC program can’t see it, because the identity checks out. Here is what catches it.',
    publishedDate: 'July 10, 2026',
    readTime: '6 min read',
    content: `
# First-Party Fraud: The Applicant Is Real. The Application Isn't.

*Published July 10, 2026*

The fastest-growing fraud category in banking is committed by people using their own names.

LexisNexis Risk Solutions measured [first-party fraud](/glossary/first-party-fraud) at 36% of all reported fraud in 2024, up from 15% a year earlier. It has overtaken scams as the leading form of fraud attack globally. And it is close to invisible to the systems most banks call a fraud program, because those systems are built to answer one question: is this person who they say they are?

For first-party fraud, the answer is yes. That's the problem.

## The lie isn't the identity. It's everything else.

First-party fraud is a real person misrepresenting facts or intent for financial gain. The name, the SSN, the date of birth: all genuine. What's false is the income figure, the undisclosed debt, the chargeback claim, or the intention to ever repay.

:::stat
**36%**
of all reported fraud in 2024 was first-party fraud, up from 15% the year before. It now leads every category globally, per LexisNexis Risk Solutions.
:::

The taxonomy is broader than most bankers expect. Application fraud: inflating income or hiding obligations to qualify. Friendly fraud: disputing purchases that arrived just fine. Never-pay: borrowing with no intention of repayment. [Bust-out](/glossary/bust-out-fraud): months of model behavior, then every line drawn at once. Different schemes, one common trait: a legitimate identity at the center.

Economic pressure feeds it. Inflation and cost-of-living stress turn otherwise ordinary customers into rationalizers. Inflating income by 20% to qualify for the house doesn't feel like fraud to the person doing it. On your books, it performs exactly like fraud, two years later, as a default you priced as prime.

## Why your fraud program can't see it

Walk through what happens when a first-party fraudster applies. KYC verifies the identity: pass, it's real. Watchlist screening: clean, they're not a criminal, they're a schoolteacher who added $30,000 to their income. Document review: the paystub looks right, because paystub templates are a commodity. The verbal VOE: the number rings to a cooperative friend, or the real employer confirms employment without confirming wages.

:::pullquote
First-party fraud walks through KYC untouched. The identity is real; the lie is in the facts around it.
:::

Then the loan defaults, and here's the quiet part: the loss books as a credit loss, not a fraud loss. No identity theft victim ever calls to dispute anything. The file goes to collections, the charge-off goes in the credit bucket, and the fraud team never studies the case. LexisNexis puts the true cost at more than $5 for every $1 lost, and at community banks the miscategorization means nobody is even counting the $1.

Fannie Mae's numbers show the concentration point: income misrepresentation is 46% of confirmed mortgage fraud findings, year after year. Most of that is first-party. It's also the share of the 1-in-116 problem that no identity product will ever fix.

## What actually catches it

The control that works follows a simple principle: verify the claims, not just the claimant.

Income verified at the payroll source can't be inflated, no matter how good the paystub template is. Employment confirmed through the payroll system of record bypasses the cooperative phone number entirely. Bank transaction data, pulled with consent, surfaces the undisclosed mortgage payment and the three BNPL obligations that never made it onto the application. None of this asks whether the person is real. It asks whether their story is.

:::pullquote
Verify the claims, not just the claimant. A first-party fraudster can pass every identity check you own. They can't make a payroll system report income that doesn't exist.
:::

Community banks have a structural exposure here worth naming honestly: relationship lending. The assumption that we know our customers is real strength in a market and real weakness in an application file, because familiarity substitutes for verification exactly where first-party fraud lives. The teller has known the applicant for years. The applicant has never lied to the bank before. The income figure goes unchecked.

Source verification doesn't require abandoning the relationship model. It requires backing it with data: the same one-link verification that speeds files up happens to be the only control category that touches first-party fraud at all. Banks usually buy verification automation for the hours it saves. Against the fastest-growing fraud category in the industry, it's also the only defense on the field.
    `,
  },
  'account-opening-fraud-prevention': {
    title: 'Preventing Fraud at Account Opening Without Killing the Channel',
    description:
      'Banks that turned off online account opening after a fraud wave diagnosed the wrong problem. A walkthrough of verification-first account opening: what runs, in what order, and what it catches.',
    publishedDate: 'July 10, 2026',
    readTime: '6 min read',
    content: `
# Preventing Fraud at Account Opening Without Killing the Channel

*Published July 10, 2026*

There's a specific conversation that repeats across community banking. A bank launches online account opening. Fraudulent applications pour in: synthetic identities, mule accounts, bad-check funding. Losses mount, the board asks questions, and the channel gets turned off. The lesson recorded in institutional memory: digital account opening invites fraud.

One in five financial institutions reported losing more than $5 million to fraud in a recent twelve-month period, so the retreat is understandable. It's also a misdiagnosis. The channel didn't fail. The verification model behind it did, and it would have failed at the branch too, just more slowly.

## What actually attacked the channel

[New account fraud](/glossary/new-account-fraud) comes in a few distinct shapes, and the first-generation digital channels were open to all of them: stolen identities that pass because nobody checked the SSN against its issuance record, [synthetic identities](/glossary/synthetic-identity-fraud) whose documents are technically genuine, mule accounts opened by real people with clean histories, and deposit fraud that funds accounts with checks that bounce after the withdrawal.

The common enabler: those channels collected typed-in, self-reported data and verified almost none of it at the source. A form that accepts what the applicant types, at internet speed, without an authoritative check behind it, is an invitation with a submit button.

:::pullquote
The first generation of digital account opening didn't verify anyone. It collected the paper process's self-reported data at internet speed, and fraud rings automated against it.
:::

## The verification-first flow, step by step

Here's what account opening looks like when verification runs at the source. This is the flow RAVEN runs, named tools and all, because the specifics are the point.

**Identity, first and hardest.** Socure's RiskOS runs KYC identity verification against authoritative sources, fraud and synthetic-identity risk scoring, and OFAC/watchlist screening on every applicant. SSN checks validate that the name, number, and date of birth belong together per issuance records, the check that makes a synthetic identity visible (see [eCBSV](/glossary/ecbsv) for why that works). An OTP challenge and an "is this you?" confirmation bind the session to the person.

**Funding account, confirmed by connection.** Instead of micro-deposits (two days of waiting and a fat slice of abandonment), the applicant connects their existing bank account through Plaid. The connection proves the account is real, open, and theirs, and shows its age and standing: a days-old account funding a new relationship is a different risk than a five-year-old primary checking.

**Income and residence, where the product needs it.** For interest-bearing products or credit relationships, Truework pulls employment and income from payroll systems of record, and Melissa verifies the address is real and matches ownership records. Nothing rests on a typed answer.

**The audit trail, automatically.** Every check lands in a timestamped, source-attributed record: what was verified, when, against which source, and what flagged. That's the [CIP](/glossary/customer-identification-program) evidence examiners ask for, produced as a byproduct instead of a project.

:::stat
**1 in 5**
financial institutions lost more than $5 million to fraud in the past twelve months, per Alloy's industry survey. Most of it entered somewhere an applicant typed instead of verified.
:::

## What this does to the fraud math

Each fraud shape hits a wall it didn't face before. Stolen identities fail the binding between session and person. Synthetics fail the issuance-record check no cultivated credit file can fake. Bad-check funding disappears because funding is a verified connection, not a deposit. Mule recruitment gets harder when the funding account's history is visible. What remains, first-party misrepresentation by real customers, is exactly what the income and bank-data verification exists to catch.

Legitimate applicants, meanwhile, experience a flow that takes minutes and asks them to type almost nothing. That matters because the industry's mobile abandonment problem is brutal, and every extra manual step feeds it.

:::pullquote
Verified digital intake is a stronger fraud posture than a branch visit. Branch staff can't check SSN issuance records by eye.
:::

The banks that turned the channel off were right about the fraud and wrong about the cause. The fix was never to retreat to the branch. It was to stop trusting what applicants type, and start confirming what sources know.
    `,
  },
  'suspect-fraud-cant-prove-it': {
    title: 'You Suspect Fraud. You Can’t Prove It. Now What?',
    description:
      'Every BSA officer knows the file: strong suspicion, thin evidence. The standards for SARs and account closure are lower than you think, and the evidence problem is solvable, mostly at onboarding.',
    publishedDate: 'July 10, 2026',
    readTime: '5 min read',
    content: `
# You Suspect Fraud. You Can't Prove It. Now What?

*Published July 10, 2026*

Every BSA officer has the file. The activity looks wrong. The story doesn't hold together. Everyone in the room agrees something is off, and nobody can point to a piece of objective evidence that proves it. Meanwhile the account stays open, the exposure grows, and the question sits on the desk: file the SAR? Close the account? On what basis?

The paralysis usually comes from applying the wrong standard. So start there.

## The standards are lower than the instinct says

A Suspicious Activity Report requires suspicion, documented and reasonable, not proof. The filing threshold is knowing, suspecting, or having reason to suspect. Certainty is not in the regulation, and examiners fault banks far more often for late or absent SARs than for filed ones that didn't pan out.

Account closure runs on a lower standard still. A bank generally doesn't need to prove fraud to end a relationship; it needs documented, reasonable judgment that the risk exceeds its appetite, applied consistently with its own policies. The file has to show the judgment was grounded, not that a prosecutor could win with it.

:::pullquote
The SAR standard is documented suspicion, not proof. The closure standard is reasonable judgment, not a conviction.
:::

What both standards demand is the same thing the frustrated room is missing: objective material in the file. That's the real problem to solve, and it splits into what you can build now and what you should have captured at the start.

## Building the evidence file now

For the account already under suspicion, the work is converting narrative into specifics:

**Behavioral documentation.** Not "activity seems inconsistent with the customer's profile" but the specific transactions: dates, amounts, counterparties, and the pattern they form. Vague narrative reads as opinion; enumerated transactions read as evidence.

**Divergence from the onboarding profile.** Whatever the customer told you at account opening, expected activity, occupation, source of funds, is a baseline. Documented divergence from it is among the most defensible observations a file can contain, because the customer supplied the baseline themselves.

**The written request for explanation.** Ask the customer, in writing, to explain the activity. A credible answer resolves the case. An implausible one, or silence, is itself file material, and either way the bank has demonstrated the reasonable diligence the standard asks for.

**Identity re-verification.** Run the identity and account checks available today: does the SSN hold up against issuance records, is the funding account still theirs, does anything about the identity picture corroborate or contradict? A clean result narrows the theory; a flag can be the objective anchor the file was missing.

## The structural fix happens at onboarding

Here's the uncomfortable pattern behind most of these files: the evidence gap was created at account opening, when the bank accepted typed-in answers and filed documents instead of capturing verified data.

:::pullquote
The evidence file you need at month eighteen is mostly built in the first five minutes of the relationship, or it isn't.
:::

A verification-first onboarding produces, automatically, the objective baseline the suspicious-activity file later depends on: identity validated against authoritative sources with the results timestamped, fraud and synthetic-identity risk scores at opening, a verified funding account with its age and standing recorded, and stated income or occupation backed by source data instead of a form field. When activity later diverges, the file already contains what it diverges *from*, in evidence grade rather than anecdote.

That transforms the month-eighteen conversation. Instead of "we suspect but can't prove," it becomes: identity risk signals at opening were X, the customer's verified profile said Y, the observed activity is Z, the divergence is documented transaction by transaction, and the written explanation was requested on this date. Whether that file supports a SAR, a closure, or a clean bill, it supports *something*, which is exactly what the stuck file never does.

The suspicion you can't prove today is, more often than not, the verification you didn't run then. Banks fix the second one and discover the first mostly stops happening.
    `,
  },
  'how-to-start-a-bank': {
    title: 'How to Start a Bank: The De Novo Playbook',
    description:
      '31 charter applications were filed in 2025. Four banks actually opened. What it really takes to start a de novo bank: the capital math, the 18-to-24-month timeline, the three-year supervision period, and the stack you build before day one.',
    publishedDate: 'July 10, 2026',
    readTime: '6 min read',
    content: `
# How to Start a Bank: The De Novo Playbook

*Published July 10, 2026*

Thirty-one banking charter applications were filed in 2025, the busiest year in recent memory. Four new banks actually opened.

That gap is the whole story of starting a bank in America right now. The application surge is real, but most of it came from fintechs, payment platforms, and digital-asset firms chasing limited-purpose and trust charters. The true full-service community bank, a [de novo](/glossary/de-novo-bank) in the classic sense, remains rare: roughly ten to fifteen organizing groups a year nationally get one off the ground.

Here is what the journey actually looks like, for founders thinking about it and for everyone who wonders why their town hasn't seen a new bank since 2008.

## The money comes first

The FDIC's binding rule is simple to state and expensive to satisfy: a de novo must maintain a tier-1 leverage ratio of at least 8% throughout its first three years. Because the ratio is measured against the bank's own growth projections, the capital has to be there on day one, sized to the balance sheet you promised to have in year three.

:::stat
**$20M to $40M**
The initial capital raised by recently approved community de novo banks. The FDIC has cited $15M to $30M as a working floor.
:::

In practice that means an organizing group raises twenty to forty million dollars before the bank earns its first dollar of interest income. The raise itself is a filter: it forces a real market study, a credible management team, and directors willing to put their own money in, all of which the regulators will examine anyway.

## The timeline nobody shortens

From first organizing meeting to ribbon cutting, plan on 18 to 24 months. The regulatory clock is only part of it.

The pre-filing phase, assembling the board, recruiting a CEO examiners will accept, writing the business plan, and lining up capital commitments, typically takes two or three months of formal preparation after months of informal groundwork. Once the deposit insurance application is filed, the FDIC determines within about 30 days whether it's substantially complete, aims to finish its field investigation within 60 days, and targets a decision within roughly four months of acceptance. Six to eight months from filing to decision is the realistic band.

:::pullquote
The approval is not the finish line. It's the starting gun for the hardest phase: building an actual bank in the months before the doors open.
:::

Then comes the buildout. Conditional approval arrives with a list of conditions to satisfy before opening: the capital must fund, key hires must land, policies must exist, and the technology stack must work. Core system, digital banking, BSA program, verification layer, all of it gets selected, contracted, and stood up in this window.

## The three-year probation

A new bank doesn't graduate on opening day. The [de novo period](/glossary/de-novo-bank) runs three years, during which the FDIC holds the bank to the specific commitments in its application: the capital levels, annual financial statement audits, fidelity bond coverage, and material adherence to the approved business plan. Deviating from the plan requires regulator sign-off. Exams come more frequently than an established bank would see.

The first exam deserves particular respect. Examiners arrive with the business plan in hand and check whether the programs it promised exist in operation. A BSA officer on the org chart is not a BSA program. A fraud-controls section in the application is not a fraud control. The de novos that stumble early are usually the ones that treated compliance and verification as post-launch projects.

## The stack decision that gets underweighted

Most de novo technology conversations orbit the core: Jack Henry, Fiserv, FIS, or CSI, usually as a bundle with digital banking and payments. That decision matters and takes months. But the layer examiners test first, and the one that determines whether the digital channels in the business plan produce deposits or fraud losses, is verification: how the bank confirms that an applicant is real, employed, and creditworthy before booking them.

:::pullquote
A de novo has no legacy intake process to defend. It can be the first bank in its market where digital account opening is the most controlled channel, not the most dangerous one.
:::

The established-bank playbook, collect documents, call phone numbers, file PDFs, is the intake model fraud rings industrialized against, and it's why so many older banks turned their digital channels off. A bank built in 2026 gets to skip that inheritance entirely and [verify at the source from day one](/solutions/de-novo-bank-technology): identity checked against authoritative records, income and employment pulled from payroll systems, funding accounts confirmed by direct connection.

Starting a bank is a long, expensive, heavily supervised project, and that is arguably the point: the charter is valuable because it is hard to get. The founders who do it well treat the constraints as design inputs. The capital rule sizes the ambition, the timeline sequences the build, and the de novo period rewards the bank that opened with its promises already working.
    `,
  },
  'de-novo-bank-day-one-fraud-program': {
    title: 'The De Novo Bank’s Day-One Fraud Program',
    description:
      'A new bank’s first exam tests whether the fraud program in its business plan actually exists. Why document-based intake fails that test, and what a source-verified day-one program looks like.',
    publishedDate: 'July 10, 2026',
    readTime: '5 min read',
    content: `
# The De Novo Bank's Day-One Fraud Program

*Published July 10, 2026*

Every de novo bank application contains a promise: a BSA/AML and fraud program, described in detail, committed to in writing. The FDIC's conditional approval turns that promise into a condition, and the bank's first examination tests whether it came true.

That test arrives fast. A [de novo](/glossary/de-novo-bank) operates under heightened supervision for its first three years, with more frequent exams and less benefit of the doubt than an established bank gets. Examiners walk in with the business plan and check it against reality. A named BSA officer is not a program. A policy binder is not a control. What counts is whether the bank can show, applicant by applicant, that it verified who it let in the door.

## The default you inherited is the problem

Here's the uncomfortable part: the fraud program most banks would build by default is the one that's currently failing across the industry.

The default is document-based intake. The applicant types their information into a form or hands over paperwork; staff collect paystubs and statements; someone calls the employer number on the application. Every artifact in that chain is applicant-supplied, and applicant-supplied artifacts are precisely what fraud rings manufacture.

:::stat
**1 in 116**
mortgage applications now shows indications of material misrepresentation, and income fraud leads Fannie Mae's confirmed findings at 46%.
:::

The numbers from the lending side show where this ends up. Cotality puts material misrepresentation at 1 in 116 mortgage applications. Fannie Mae's fraud team maintains a watchlist of 63 fictitious employers, some with staffed phone lines whose entire purpose is to answer verification calls. On the deposit side, synthetic identities, real Social Security numbers attached to fabricated people, have cost lenders an estimated $6 billion, and they pass document-based onboarding because no document is technically fake.

:::pullquote
The fraud program most banks would build by default is the one that's currently failing across the industry.
:::

More than one bank executive has told us the ending of that story: they launched digital account opening, fraud poured in, and they shut the channel down. The channel wasn't the problem. The verification model behind it was.

## What source verification changes

A source-verified program inverts the trust model. Instead of trusting what the applicant supplies, the bank confirms every material fact against the system that originates it.

Identity gets validated against authoritative sources, with SSN issuance checks that make synthetic identities visible instead of invisible. Employment and income come from payroll systems of record, so a fake employer's phone line never enters the loop. Funding accounts are confirmed by direct, consented connection rather than a voided check. And each of those verifications produces a timestamped, source-attributed record, which is exactly the evidence a de novo needs sitting in the file when the first exam team asks how the bank knows its customers are real.

For a bank under [de novo conditions](/glossary/de-novo-bank), this isn't just better fraud math. It's the difference between telling examiners about a program and handing them one.

## The buildout window is the opportunity

The months between conditional approval and opening day are when the entire stack gets assembled: core, digital banking, compliance tooling. Verification belongs in that first wave, not the post-launch backlog, for a practical reason: it has no core dependency, so it can be [configured, tested, and demonstrably working](/solutions/de-novo-bank-technology) before the core conversion finishes and before the first customer walks in.

:::pullquote
An established bank has to unwind a decade of document-based habit. A de novo just has to make one good decision during the buildout.
:::

There's a competitive edge hiding in the compliance requirement, too. The de novo mandate is deposit growth, and the fastest deposit channel is digital, the same channel established competitors turned off after their fraud waves. A new bank that opens with verification-first intake can run digital account opening as its most controlled channel from the first day, in a market where the incumbents retreated to branch-only.

The business plan promised examiners a fraud program. Build it as source verification and it doubles as the growth engine.
    `,
  },
  'one-in-116-mortgage-fraud': {
    title: 'One in 116 Mortgage Applications Is Lying to You',
    description:
      'Cotality data shows 1 in 116 mortgage applications carries indications of material misrepresentation, and income fraud leads Fannie Mae findings at 46%. The VOE phone call your bank relies on is the exact attack surface fraud rings are built around.',
    publishedDate: 'July 4, 2026',
    readTime: '6 min read',
    content: `
# One in 116 Mortgage Applications Is Lying to You

*Published July 4, 2026*

Cotality's 2025 Annual Mortgage Fraud Report landed with a number that should bother every chief credit officer in the country: 1 in 116 mortgage applications now shows indications of material misrepresentation. On purchase loans, it's 1 in 106.

That's not a rounding error. That's roughly one fraudulent file per loan officer per quarter at a typical community bank origination pace.

The national fraud risk index rose 6.1% year over year through Q2 2025. And the categories driving the increase are exactly the ones a manual verification process is worst at catching.

## What borrowers actually lie about

The fastest-growing lie in mortgage lending right now is undisclosed real estate debt, up 12% year over year. A borrower buys an investment property, quietly carries the mortgage, and leaves it off the next application. Their DTI looks clean. It isn't.

Transaction fraud risk rose 6.2%. Income fraud risk rose 2.1%. Identity fraud crept up 0.4%. The only category that fell was occupancy fraud, down less than a point.

:::stat
**46%**
of Fannie Mae's confirmed mortgage fraud investigation findings involve income misrepresentation, the top category year after year.
:::

Income has led Fannie Mae's fraud findings for years, and it isn't close. Nearly half of everything their investigators confirm comes down to a borrower, or an ecosystem of paid helpers, inventing money that doesn't exist.

Some segments are worse. Applications on 2-to-4-unit properties, the classic house-hack investment play, flag at 1 in 27. If your bank is growing its small rental portfolio, your highest-fraud-risk product is also your fastest-growing one.

:::pullquote
One fraudulent application per loan officer per quarter. That's what 1 in 116 means at community bank volume.
:::

## The fake employer industry

Here's the part that should change how you think about your verification process, not just your fraud filters.

Fannie Mae's fraud team maintains a running list of fictitious employers: companies that appear on loan applications as the borrower's place of work but that investigators could not confirm exist. The list has grown to 63 named entities. These aren't typos or defunct businesses. They're purpose-built fakes, some with websites, staffed phone lines, and someone on the other end ready to verify employment for anyone who asks.

Read that again. The fake employers have staffed phone lines.

The [verification-of-employment call](/glossary/verification-of-employment), the one your processor makes to the number the borrower provided, is not a fraud control. It's the attack surface. A fraud ring that can print a fake paystub can absolutely answer a phone and say "yes, she works here." The entire scheme is designed around the assumption that your bank verifies employment by calling a number on the application.

:::pullquote
The fake employers have staffed phone lines. The VOE call isn't your fraud control. It's the attack surface.
:::

## Community banks are carrying the exposure with the fewest tools

The CSBS 2025 Annual Survey of Community Banks found that card fraud, check fraud, and identity theft account for nearly 88% of fraud cases at community banks. Those are the categories with dashboards, vendor tools, and daily attention. Application fraud doesn't make that list, because it doesn't show up as a fraud loss. It shows up two years later as a nonperforming loan.

Synthetic identity fraud, where a real Social Security number gets paired with a fabricated person, has already cost US lenders an estimated $6 billion, and the Federal Reserve calls it the fastest-growing financial crime in the country. ICBA is blunt about who's most exposed: it's one of the hardest fraud types for community banks to detect, because the synthetic borrower has no history to contradict, and community bank underwriting leans on documents the applicant provides.

That's the structural problem. A fintech lender ingests bank transaction data, payroll records, and IRS transcripts at the source. A community bank processor collects PDFs from the borrower and calls a phone number the borrower supplied. One of these processes can be gamed with a laser printer and a burner phone. The other can't.

## The fraud fix and the speed fix are the same fix

There's a version of this conversation happening in bank boardrooms right now, and it usually ends the wrong way. A bank tries online account opening, gets flooded with fraudulent applications, and shuts the channel down. The lesson gets recorded as "digital invites fraud." Branch-only feels safe again.

But look at what actually failed. The digital channel didn't verify anyone. It collected the same self-reported information and borrower-supplied documents as the paper process, just faster and at internet scale. Fraud rings automate; a front door that accepts unverified applications at machine speed is an invitation. The problem was never the front door. It was that the front door had no ID check.

Community banks usually evaluate verification automation as a speed and cost play: fewer phone calls, faster closes, less staff time per file. All true. But the same architecture is a fraud control, and arguably a better one than anything in the fraud budget.

Income verified directly from a payroll provider can't be inflated with an edited paystub. Employment confirmed at the data source can't be vouched for by a fraud ring's phone operator. Bank account data pulled with the borrower's consent shows the undisclosed mortgage payment that never made it onto the application. Identity checks run against authoritative sources make a synthetic borrower's thin file visible instead of invisible.

:::pullquote
Verified-at-source data isn't just faster than borrower-supplied documents. It's the only version fraud rings can't manufacture.
:::

None of this requires new underwriting standards. It requires replacing borrower-supplied documents with source-verified data, which is the same change that takes verification from weeks to minutes.

The 1-in-116 number is going to keep climbing. Fraud rings industrialize; community bank processes haven't. The banks that close that gap won't just close loans faster. They'll quietly stop being the softest target in the market.
    `,
  },
  'jack-henry-symitar-loan-origination': {
    title: 'Digital Lending on Jack Henry: What SilverLake and Symitar Actually Support',
    description:
      "SilverLake runs at more than 500 banks and Symitar at more than 700 credit unions, but neither core is a loan origination system. What Jack Henry sells for lending today, what its forthcoming Jack Henry Origination changes, and what to ask any vendor before you buy.",
    publishedDate: 'June 26, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '5 min read',
    content: `
If you run a community bank or credit union on a Jack Henry core, you have plenty of company. Jack Henry's annual report for fiscal 2026, which ended June 30, says SilverLake is used by more than 500 banks and its core systems serve more than 900 banks in total. Symitar runs at more than 700 credit unions, from $21 million to more than $36 billion in assets.

That makes "what does my core support for digital lending?" a common question. The short answer: the core is a system of record. The borrower-facing application, the decision and the verification come from separately licensed products, either Jack Henry's or a partner's.

:::stat
**500+**
Banks running SilverLake, alongside 700+ credit unions on Symitar, per Jack Henry's fiscal 2026 annual report.
:::

## Two Cores, Two Integration Paths

SilverLake and Symitar use different APIs. SilverLake and Jack Henry's other bank cores connect through jXchange, long a SOAP API. Jack Henry's developer site now also lists a REST version of jXchange. Symitar connects through SymXchange, which can also run PowerOn scripts on the core.

For a lending vendor, supporting both cores still means building two integrations. When a vendor says "we integrate with Jack Henry," ask three things: which core, which API, and how many institutions on your core are live with it today.

:::pullquote
Ask which core, which API and how many live clients before the demo, not after.
:::

## What Jack Henry Sells for Lending

**LoanVantage** is Jack Henry's loan origination system. Its core strength is commercial lending: C&I, commercial real estate, SBA and construction, with financial spreading, credit memos and decisioning. Jack Henry also positions it for consumer origination. It works with both SilverLake and Symitar.

Two documented results:

- **Independent Financial**, an $18.7 billion Texas bank, chose LoanVantage enterprise-wide in February 2022.
- **Killbuck Savings Bank** in Ohio, with about $827 million in assets, went live on LoanVantage in 2021. Total loan volume grew 25% in 2022, mostly in commercial, after the bank replaced spreadsheet-based processes (Independent Banker, January 2024).

**OpenAnywhere** is Jack Henry's digital account opening product. Consumer and business deposit accounts are live. Jack Henry lists consumer loans as "coming soon."

**Jack Henry Origination** is what comes next. Jack Henry describes it as a forthcoming loan and deposit origination solution, planned for the Jack Henry Platform, the public cloud-native, API-first core platform at the center of its strategy. For now, its features reach clients through OpenAnywhere and LoanVantage as they are delivered. Jack Henry's product page gives no general availability date.

Each of these is licensed separately from the core contract.

## The MeridianLink Option

In August 2025, Jack Henry and MeridianLink expanded their 15-year alliance into a reseller agreement. Jack Henry now sells MeridianLink's consumer and mortgage lending software to its own clients. The two companies said they jointly serve more than 500 banks and credit unions.

The deal says something about the market. For many Jack Henry institutions, modern consumer lending today means a partner's origination system connected to the core, sold by Jack Henry itself, while Jack Henry builds its own.

## The Partner Network Changed in 2025

On July 1, 2025, Jack Henry replaced its Vendor Integration Program with the Fintech Integration Network. Existing members had until July 1, 2026 to move over. Jack Henry says the network includes more than 850 fintechs.

Two lending-related companies joined the old program in early 2025:

- **Blend**, in February, to connect its digital account opening to both SilverLake and Symitar
- **Algebrik AI**, in March, to connect its AI-driven loan origination platform to Symitar through SymXchange

Network membership gives a vendor access to Jack Henry's APIs and a structured integration review. It is a starting point, not proof that the integration you need is live on your core.

## Where the Gap Actually Is

SilverLake and Symitar do their job as systems of record. For most Jack Henry institutions, the gap sits above the core: the borrower-facing application, income and employment verification, the decision and the documents.

A Jack Henry institution that has closed that gap usually has three layers:

- **The core** as the system of record
- **An origination system**, such as LoanVantage, MeridianLink or another partner, running the workflow
- **A verification layer** that pulls income, employment and bank data during the application, so the file reaches the loan officer complete

:::pullquote
The borrower experience is set by the origination and verification layers, not by the core.
:::

## Questions to Ask Before You Buy

1. Which core and which API does the integration use, and how many institutions on my core are live with it today?
2. Is the vendor in the Fintech Integration Network, and did it complete the move from the old program?
3. What does it write back to the core: the booked loan, the customer record, the documents?
4. Which Jack Henry Origination features will reach us through our existing LoanVantage or OpenAnywhere license, and when? Would a third-party tool overlap with them?
5. Where does income verification happen: during the application, or after a loan officer asks for documents?

The core is rarely the constraint. The integration choices around it are.
    `,
  },
  'fiserv-premier-digital-lending': {
    title: 'Digital Lending on Fiserv: What Premier and Portico Actually Support',
    description:
      'Premier serves 194 community banks. Portico serves nearly 500 credit unions. None of the three Fiserv legacy cores ships with a native digital LOS. Here is what Communicator Open actually costs, which AppMarket vendors have delivered results, and where the Portico gap is.',
    publishedDate: 'June 26, 2026',
    readTime: '6 min read',
    content: `
# Digital Lending on Fiserv: What Premier and Portico Actually Support

*Published June 26, 2026*

Fiserv runs more than 2,600 financial institutions. None of its three legacy community bank and credit union core platforms, Premier, Portico, and Precision, ships with a modern digital loan origination system.

That is not a knock on Fiserv. It is a structural fact about how community bank technology stacks work, and it has direct implications for any bank or credit union planning its digital lending roadmap.

## The Three Platforms

**Premier** is Fiserv's commercial bank core, with roughly 194 documented customers. Most are community banks in the $500 million to $5 billion asset range.

**Portico** serves nearly 500 credit unions. It uses a different integration architecture than Premier, and fewer AppMarket vendors have validated Portico support.

**Precision** is a third commercial bank platform, used by approximately 329 institutions, often smaller community banks.

All three handle account processing, general ledger, transaction management, and core servicing functions. None includes a fully built-in modern LOS.

## What Fiserv Sells for Lending

Fiserv offers two proprietary lending products: **Loan Director** (consumer and commercial) and **Mortgage Director** (mortgage origination). Both are described as open-architecture systems that work with Fiserv and non-Fiserv cores.

The important distinction: neither is a bundled module included in a Premier or Portico contract. Both require separate licensing and implementation. Neither is listed with a standard 30-day deployment path, which is the timeline Fiserv markets for AppMarket integrations.

A community bank evaluating digital lending on Fiserv is making at least two procurement decisions: the core contract and the LOS.

:::pullquote
A community bank evaluating digital lending on Fiserv is making at least two procurement decisions: the core contract and the LOS.
:::

## Communicator Open: The Integration Layer

Communicator Open is the API middleware that makes third-party LOS integrations possible on Premier, Signature, and Precision. It exposes RESTful JSON and FDX-compliant APIs, replacing older SOAP and APEX interfaces. More than 300 financial institutions actively use it.

The access model depends on how you run your core.

Cloud-hosted Premier clients get Communicator Open with no additional Fiserv implementation fee. On-premises Premier clients pay connectivity fees and require network SOWs (statements of work). Portico uses a different integration architecture, and the AppMarket vendor set for Portico is smaller than for Premier.

This distinction matters practically. A bank considering an AppMarket vendor's 30-day implementation claim should ask: am I on cloud-hosted Premier? If the answer is no, the timeline estimate likely does not apply.

## The AppMarket and What Actually Works

Fiserv's AppMarket is a curated fintech storefront for pre-integrated apps, marketed with a 30-calendar-day implementation window for cloud-hosted Premier clients. Current loan and deposit origination vendors include:

- **Baker Hill NextGen LOS** (Communicator Open-connected): First State Bank of the Florida Keys reported a 30% loan volume increase after deployment. Mechanics Bank reported a 200% production increase.
- **MANTL** (Premier-validated): Claims up to 60% reduction in account opening times. Portico, Precision, and others are listed as on inquiry, not validated.
- **MeridianLink One** (Premier-validated via Communicator Open)
- **Epic LOS by Integra Loan Tech** (Premier-native, with two-way core integration and native Fiserv Director imaging)
- **Narmi** (Premier)

Baker Hill is the clearest documented case of the pattern working at scale. The pre-built Communicator Open connector eliminates manual rekeying between origination and core booking, which is where most community bank LOS integrations break down.

:::stat
**200%**
Production increase reported by Mechanics Bank after deploying Baker Hill NextGen LOS on a Communicator Open-connected Premier core.
:::

The 30-day timeline applies to cloud-hosted Premier clients. For on-premises clients, additional connectivity setup and network SOWs add time and cost that the AppMarket listing does not mention.

## The Portico Gap

Portico's native lending covers consumer installment loans, mortgage servicing, lines of credit, and credit cards. For modern digital commercial loan origination, Portico credit unions must integrate externally.

The most documented path is BAFS BLAST, integrated with Portico to handle commercial lending from origination through servicing and compliance. The integration is explicitly positioned as a gap-fill: Portico handles account processing, BLAST handles the origination workflow.

If you are a Portico credit union evaluating digital commercial lending, the pre-integrated vendor universe is smaller than the AppMarket homepage implies. Verify Portico validation specifically, not generic Fiserv support.

## Where Fiserv Is Heading

Fiserv acquired Finxact, an API-first cloud-native core, in 2022. Thread Bank selected Finxact in August 2025 to run embedded banking strategies, explicitly positioning it as a model for community bank digital transformation. Fiserv is integrating its existing digital banking and payments solutions with Finxact, which signals that Premier's architecture is being gradually superseded for institutions that need a modern origination-first stack.

For a community bank on a multi-year Premier contract, the practical implication: AppMarket integrations and Communicator Open are well-supported and worth investing in now. The Finxact question becomes relevant when your next core evaluation window opens.

PortX joined the AppMarket in September 2024 specifically to provide pre-built connectors and advisory services for institutions that find Communicator Open implementation complexity a barrier. That business exists because the complexity is real enough to support an advisory market around it.

## What This Means If You Are Running Fiserv

Digital lending on Fiserv is an integration story. Communicator Open is the API layer. The AppMarket is the vendor marketplace. Third parties (Baker Hill, MANTL, MeridianLink, Epic LOS) are the actual origination engines.

Community banks that have solved this are seeing measurable results: 30% loan volume increases, 200% production gains. The question is not whether the integrations work. The question is whether your institution has clarity on its specific deployment (cloud vs. on-premises, Premier vs. Portico vs. Precision) to use the right vendor path.

A cloud-hosted Premier bank with a validated AppMarket LOS and a modern open banking layer for real-time income verification can close loans as fast as any fintech. That combination takes three vendors, two integration agreements, and a clear understanding of your own infrastructure.

The community banks moving fastest stopped treating "we are on Fiserv" as a constraint. They started treating it as a starting point.

:::pullquote
The community banks moving fastest stopped treating "we are on Fiserv" as a constraint. They started treating it as a starting point.
:::
    `,
  },
  'first-reliance-sells-at-the-top': {
    title: 'First Reliance Spent 27 Years Building a Bank. Then It Sold at the Top.',
    description:
      'First Reliance Bancshares just posted record growth, then agreed to sell to Colony Bankcorp for $163 million. Why a winning $1 billion bank chose to partner up, and what the four-state, $5 billion result says about Southeast consolidation.',
    publishedDate: 'June 26, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `# First Reliance Spent 27 Years Building a Bank. Then It Sold at the Top.

*Published June 26, 2026*

First Reliance Bancshares just posted the best numbers of its life. Net income up 113% year over year, $1.1 billion in assets, nine branches across eight South Carolina cities. So on June 24, founder Rick Saunders agreed to sell it.

:::stat
**113%**
Net income growth year over year at First Reliance — the best numbers in the bank's history, posted right before the sale was announced.
:::

Colony Bankcorp, the $3.7 billion Georgia bank out of Fitzgerald, is buying First Reliance in a cash-and-stock deal worth about $163 million. The combined company will run roughly $5 billion in assets, $4 billion in deposits, and $3.2 billion in loans across four states: Alabama, Florida, Georgia, and South Carolina. Both boards approved it unanimously. It is expected to close in the fourth quarter.

Here is the part worth sitting with. Most community banks sell because they are stuck. First Reliance sold because it was flying.

*Update, October 22, 2026: Regulators approved the merger on September 17, and shareholders of both companies approved it on October 15. The companies expect to close in the fourth quarter of 2026.*

## The terms

First Reliance shareholders get to choose: $19.75 in cash or 0.94 shares of Colony stock for each share they own. After proration, the mix lands near 20% cash and 80% stock. First Reliance Bank folds into Colony Bank. Colony says the deal is immediately accretive to earnings per share once you set aside one-time merger costs, which is the line every acquirer uses and the one every acquirer has to actually deliver.

Saunders does not ride off. He becomes Executive Vice Chairman and joins Colony's board. His bench comes with him. Justin Strickland stays on as President for South Carolina, CFO Robert Haile becomes Colony's Chief Investment Officer and Treasurer, and mortgage chief Chuck Stuart will co-run Colony Mortgage. Director Rick Redden takes a Colony board seat.

That is not how a distressed sale looks. That is a bank handing over the keys while keeping a hand on the wheel.

:::pullquote
That is not how a distressed sale looks. That is a bank handing over the keys while keeping a hand on the wheel.
:::

## Why sell when you're winning

The honest answer is that $1 billion is an awkward size. Big enough to need real compliance, technology, and lending infrastructure. Too small to spread the cost of all three across enough loans. First Reliance grew into a market, the Carolinas, where competitors get faster and better funded every quarter. Staying independent meant building a modern digital and lending stack alone, on a billion-dollar base, against banks spending far more.

Selling at a high-water mark is the smart version of this trade. You negotiate from strength. Your stock fetches a better exchange ratio. Your people land in senior roles instead of getting reorganized out. Saunders said it plainly on LinkedIn: the point is to "protect and expand" what First Reliance built, not walk away from it. "The names on our buildings won't change," he wrote. "The bankers you work with will be the same."

## Colony's acquisition machine

This is the context that makes the deal make sense. Colony does not dabble in M&A. It runs a program.

Start in 2019, when Colony absorbed LBC Bancshares and merged Calumet Bank into the franchise. Then came 2021 and the big one: SouthCrest Financial Group, about $84 million, which added more than $700 million in assets and nine branches and made Colony the fourth largest bank in Georgia at $2.4 billion. A year later it picked up TC Bancshares and its Thomasville thrift for roughly $86 million. Add the insurance agencies, Barnes in 2021 and Ellerbee in 2025, feeding the fee-income business that has become Colony's second engine.

First Reliance is the biggest bite yet. At $163 million, it runs close to double Colony's previous largest bank deal. And the structure is nearly a photocopy of the SouthCrest playbook: a cash-or-stock election (SouthCrest holders chose $10.45 or 0.7318 shares, First Reliance holders choose $19.75 or 0.94), heavy on stock, light on cash, built to keep the acquired bank's owners invested in the result.

:::stat
**$163 million**
Colony's purchase price for First Reliance — nearly double Colony's previous largest bank acquisition and the biggest deal in its M&A program to date.
:::

Colony CEO Heath Fountain framed the ambition without much hedging. The combined company, he said, is "a premier Southeast banking franchise that is uniquely positioned to capture market share." For a bank that started as a peanut-belt agricultural lender in 1975, a four-state, $5 billion footprint is a long way from Fitzgerald.

## What "nothing changes" actually means

Every merger release promises continuity. Same bankers, same relationships, same name on the door. Some of that is true. Some of it is the kind of thing you say to keep deposits from walking.

What actually changes is the plumbing. First Reliance customers will eventually move onto Colony's core systems, its online banking, its loan platforms. Core conversions are where community-bank mergers get tested, because that is the moment a customer feels the gap between a promise and an operating reality. Get it smooth and the "nothing changes" line holds. Get it wrong and a 27-year relationship reconsiders itself over a login screen.

It is also where the strategic logic lives or dies. The pitch to First Reliance customers is more products and better digital tools. Delivering that means Colony's onboarding, verification, and lending experiences have to be meaningfully better than what a billion-dollar bank could build alone. Scale is the promise. Execution is the invoice.

:::pullquote
Scale is the promise. Execution is the invoice.
:::

## The integration test

A $5 billion bank has options a $1 billion bank does not. More capital to lend, more room to invest in technology, more ability to absorb the rising fixed cost of compliance and fraud and data. That is the real prize, for both sides.

But scale does not automatically fix the parts borrowers actually feel. A bigger bank can still make someone wait days for income verification, still chase documents by email, still lose a fast-moving borrower to a lender that closes in a week. The Southeast is consolidating precisely because the cost of being slow keeps climbing, and bigger banks are not immune to slow. They just have more places to hide it.

The merger gives Colony and First Reliance the balance sheet. Whether borrowers in Florence and Fitzgerald feel the difference comes down to the boring, decisive work of making verification and onboarding fast across a four-state footprint. That is the part no press release can promise. It is the part that has to be built.
`,
  },
  'community-bank-ai-lending-guide': {
    title: 'How Community Banks Can Use AI in Lending Without the Risk',
    description: 'Bank generative AI adoption tripled going into 2026, and in April regulators replaced SR 11-7 with new model risk guidance that leaves generative AI out of scope. What the rules now say, where AI fits in lending, and how to stay out of exam findings.',
    publishedDate: 'June 26, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `# How Community Banks Can Use AI in Lending Without the Risk

*Published June 26, 2026*

Forty-nine percent of banks had deployed generative AI going into 2026, triple the share a year earlier, according to Cornerstone Advisors' What's Going On in Banking 2026 survey of 416 bank and credit union executives. Credit unions were further along, at 59%. Of the banks that had not deployed it, three in ten planned to invest in 2026.

The adoption wave is not theoretical. The question for a community bank is not whether to use AI. It is how to do it without handing examiners a finding.

:::stat
**49%**
The share of banks that had deployed generative AI going into 2026, triple the year before, according to Cornerstone Advisors.
:::

## What the Regulations Actually Say

For fifteen years the governing framework was SR 11-7, issued by the Federal Reserve and OCC in 2011 and adopted by the FDIC in 2017. That changed on April 17, 2026, when the three agencies issued revised interagency guidance on model risk management: SR 26-2 at the Fed, OCC Bulletin 2026-13, and FIL-15-2026 at the FDIC. It supersedes SR 11-7, and the FDIC rescinded its 2017 adoption.

Three things in the new guidance matter most to a community bank.

**It is explicitly proportional.** The guidance is risk-based and scaled to a bank's model risk profile, size and complexity, and its most detailed expectations are aimed at the largest institutions. It builds on OCC Bulletin 2025-26, issued in October 2025, which told community banks that OCC guidance does not require annual model validation and that examiners will not criticize a reasonable choice of validation frequency or scope.

**Vendor models are still your models.** Nothing in the revision lets a bank disclaim a model because a fintech built it. If you license it and it influences a decision, you are expected to understand it, monitor it and govern it at a level that fits the risk.

**Generative and agentic AI are outside its scope.** The agencies left those to a separate process, a planned request for information on how banks use AI. For a bank evaluating an AI tool that reads documents or drafts credit memos, that means there is no single checklist to satisfy yet. Examiners will fall back on general safety-and-soundness and third-party risk expectations, which reward documentation.

:::pullquote
The question is not whether to use AI. It is how to do it without handing examiners a finding.
:::

There is one hard floor that does not bend for size: adverse action. Regulation B requires a creditor to give an applicant the specific principal reasons for a denial. That requirement does not loosen because an algorithm influenced the decision, and "the model scored you low" is not a reason. Black-box models are not just a model risk problem. They are a fair lending and compliance liability.

## Where AI Actually Fits Today

Because the new guidance leaves generative AI to a later process, the safest approach is to build the artifacts an examiner would ask for anyway. For any AI that touches a loan file, three are worth requiring from day one: a citation back to the source page for every figure the AI extracts, a preserved history of every override when an underwriter changes an AI-generated value, and a named model risk owner inside the bank. Ask every vendor whether its system produces the first two automatically.

With that in mind, the low-risk entry points are narrow.

**Fraud detection** is the most common first deployment. Fraud models flag applications and transactions for human review rather than deciding credit, so they do not trigger adverse action notices, and the value shows up in fewer false positives for staff to clear. The model risk questions are about monitoring and drift, not explainability to a declined borrower.

**Document processing and data extraction** is the other clear entry point. A typical narrow implementation watches an inbox for customer-submitted financial statements, extracts the key figures, runs the spreading calculations, and routes a summary to the underwriter with each number linked to its page in the source document. No credit decision is made until a person reviews it.

That architecture is deliberately boring. The AI did not decide anything. It extracted data from a PDF and did arithmetic, and the underwriter made the call with the evidence in front of them. That is a structure an examiner can follow.

**Credit underwriting support** is where things get more complicated. ICBA's policy position is that AI can help community banks automate compliance and loan underwriting but "cannot replace the personal relationships and local knowledge integral to the community banking model." That is not anti-AI. It describes where AI belongs: supporting the underwriter, not replacing them. Banks that use AI as a recommendation engine with documented human override are in a far better position than those pitching AI as autonomous credit decisioning.

## How to Implement Without Getting in Trouble

Start with a use case that does not touch credit decisions. Fraud detection, statement extraction, document classification and customer routing are all AI applications where the risk questions are simpler and the value is visible within a quarter.

When you move toward underwriting, build the paper trail before you go live. Name your model risk owner. Document how you tested the model before deployment and how you will monitor it after. Preserve override history when underwriters adjust AI outputs. Keep the adverse action reasons traceable to factors a person can explain.

For vendor selection, apply the same standard you would apply to any LOS vendor: ask which community banks in your asset range run the system, whether it has been through an exam at a bank like yours, and what documentation it produces for your model inventory. An AI vendor that cannot produce exam-ready documentation is not ready for community banking.

The banks that will benefit most from AI over the next three years are not the ones that adopt it fastest. They are the ones that build a defensible governance structure from day one, then iterate as regulators fill in the generative AI piece.

:::pullquote
The banks that will benefit most from AI over the next three years are not the ones that adopt it fastest.
:::

ICBA launched an AI Task Force in 2026, published an AI security readiness guide for community bankers in June, and told the Senate Banking Committee the same month that AI policy should account for community banks. Regulators have signaled proportionality in both the October 2025 OCC bulletin and the April 2026 interagency guidance. The window for careful early adoption is open, and the rules for generative AI are still being written.
`,
  },
  'white-label-borrower-portal-community-bank': {
    title: 'The White-Label Borrower Portal: What It Is and Why Community Banks Need One',
    description: 'Only 24% of small banks took small business loan applications through an online portal in the FDIC\'s latest survey, and just 6% of banks ran the whole process online. What a white-label borrower portal is, when it pays off, and how to evaluate one.',
    publishedDate: 'June 26, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '5 min read',
    content: `# The White-Label Borrower Portal: What It Is and Why Community Banks Need One

*Published June 26, 2026*

Twenty-four percent.

That is the share of small banks that accepted small business loan applications through an online portal in 2022, according to the FDIC's Small Business Lending Survey, the agency's most recent, published in October 2024. Large banks were at 42%. Across all banks, only 6% let a borrower complete every step of the process online, and 60% offered no online steps at all.

The trend is moving. In the FDIC's previous survey, covering 2016, only 11% of small banks took applications online. But the last step is still the hardest: only 13% of banks could have an approved loan's closing documents signed online.

:::stat
**24%**
The share of small banks that accepted small business loan applications through an online portal, versus 42% of large banks, in the FDIC's 2022 Small Business Lending Survey.
:::

The most common response from community bank leadership is: "We would love to fix it, but we cannot afford to build something from scratch." That is correct. You should not. There is already a product category for this.

## What a White-Label Portal Actually Is

A white-label borrower portal is a ready-made lending front end that the bank deploys under its own brand. The bank's logo, colors and domain sit on top of a vendor's technology that handles application intake, document collection, status updates and e-signatures, and passes the file to the bank's loan origination system.

The vendor is invisible. The borrower applies, uploads documents, checks status and signs inside an interface that looks like the bank built it. The bank owns the customer relationship and the data. The vendor owns the infrastructure and the maintenance.

The lending software vendors that already serve community banks sell this layer. Baker Hill's online application is configured to the bank's brand and feeds its NextGen origination platform, and its client portal lets borrowers upload documents and track a request through closing. Abrigo's small business lending platform gives business owners an online application that flows into automated underwriting. MeridianLink Consumer takes consumer loan applications across online, mobile and branch channels. Most core providers have their own digital lending options as well. The question for most banks is not whether a product exists. It is which one fits their core, their lending mix and their staff.

## The Case Against, and Why It Is Incomplete

The FDIC's own survey makes the skeptic's argument. Only 36% of banks rated online portals very or extremely valuable for small business lending, against 94% for branches and 89% for on-site visits. Even among banks that offered a portal, only 38% valued it highly. The FDIC concluded that banks without a portal "are not at a significant disadvantage" to those with one.

That is a fair reading of how relationship lending works. A portal does not replace a banker who knows the business.

:::pullquote
A portal does not replace the banker. It removes the paperwork from the relationship.
:::

But it frames the choice wrongly. The value of a portal is not as a substitute for the relationship. It is the part of the relationship nobody enjoys: chasing a missing tax return, re-sending a document request, asking whether the file is complete. A borrower who can upload a statement at 9 p.m. and see what is still outstanding does not need a phone call to find out. The lender who used to make that call has the time back for the conversations that do require a banker.

And the comparison in the survey is between banks, not borrowers. The FDIC asked banks how much they valued each channel. It did not ask the business owner who started an application on a competitor's website because yours required a branch visit.

## Buy, Do Not Build

Building a branded lending front end means owning everything a vendor amortizes across hundreds of banks: integration with your core and LOS, security testing, accessibility, e-signature and document handling, and every change when a regulation or a browser does. For a bank with a small IT team, that is a permanent maintenance commitment, not a project.

Buying moves the bank's work to configuration, integration and process change, which is where the real implementation risk lives anyway. Vendors rarely publish pricing, so get quotes from at least three, and ask each one for the full first-year cost including implementation, core integration and training, not just the license.

## What Branded Means in Practice

One detail matters more than it looks: the borrower should never leave the bank's branded environment during the application.

Many lending flows hand the borrower to a third-party URL for identity verification, document upload or signing. Every unfamiliar domain is a moment where a cautious borrower stops to wonder whether this is a phishing page. When a borrower abandons mid-application, they often do not know whether to call the bank or the vendor.

:::pullquote
Every unfamiliar domain is a moment where a cautious borrower stops.
:::

A properly implemented portal keeps the borrower inside one branded experience from application to closing: the bank's domain, the bank's logo, the bank's email templates. E-signature is embedded rather than redirected, and any income or account verification happens inline.

## What to Look for When Evaluating Vendors

Four questions that show whether a white-label vendor is ready for community banking:

**Core and LOS integration.** Is the integration with your specific core and origination system a production integration with community bank references, or a custom build the vendor will maintain as one-off code? The difference shows up in the implementation timeline and every upgrade after.

**Audit trail.** Does the system keep a record of what the borrower submitted, when, and what changed, in a form your compliance team and examiners can use? Ask to see an example.

**Abandonment recovery.** Can the portal save partial applications and let the borrower resume? Does it follow up automatically by email or text with borrowers who stop partway? Ask for the vendor's completion rate and how it is measured.

**Timeline.** Get a reference from a community bank in your asset range that launched in the last 12 months. Ask how long it actually took, and what went wrong. The sales timeline and the implementation reality are often different numbers.

The FDIC survey shows community banks moving online slowly, and many of them comfortable with that. The banks that move first will not win because they have a portal. They will win because their bankers spend their time on borrowers instead of on paperwork.
`,
  },
  'digital-account-opening-community-bank': {
    title: 'Digital Account Opening for Community Banks: The Deposit Side of the Gap',
    description: 'Neobanks captured 44% of new checking accounts in 2024. Community banks opened only 16% of their new accounts digitally. Here is what top-performing platforms do differently and what closing this gap is worth.',
    publishedDate: 'June 26, 2026',
    readTime: '6 min read',
    content: `# Digital Account Opening for Community Banks: The Deposit Side of the Gap

*Published June 26, 2026*

Neobanks captured 44% of new checking account openings in 2024.

That number comes from Financial Brand and Bank On National Data Hub research. It means that when a consumer decided to open a new checking account last year, they chose a neobank nearly half the time. Not a big bank. Not their local community institution. A neobank.

Community bank digital account openings fell to just 16% of total openings at community financial institutions in the same period. The remaining 84% happened in a branch, by phone, or through some combination of paper and follow-up.

The deposit acquisition gap is not a lending problem with a digital face. It is its own structural problem, and it is worth solving separately.

## What Neobanks Are Doing That's Different

Chime opens an account in approximately two minutes. Download the app, enter name, date of birth, email, address, phone, and Social Security number, pass automated identity verification, and you are funded. No branch visit. No mailed forms. No follow-up call asking for documentation they did not mention on the website.

The abandonment data explains why this matters. Industry average abandonment for digital account applications sits around 51%. Some studies put it as high as 68% for financial services broadly. Abandonment exceeds 50% when the process takes more than three to five minutes. Every additional step after the first three minutes costs completions.

:::pullquote
Forty-eight percent of consumers who hit digital friction took their business to a different bank.
:::

Forty-eight percent of consumers who hit digital friction took their business to a different bank. That is not a close call. That is a majority of people who tried and failed, going somewhere else.

The best-performing community bank platforms have closed the gap on speed. Narmi's consumer account opening is documented at two minutes and thirteen seconds. MANTL, acquired by Alkami in March 2025, completes the process in under three minutes from application to funded account. MANTL processed nearly one million applications in 2024 across 150 community banks and helped those institutions raise close to $10 billion in deposits.

That last number deserves a second read. Ten billion dollars in deposits from one platform serving 150 community banks, in one year.

:::stat
**$10 billion**
Deposits raised in one year by 150 community banks using MANTL's digital account opening platform.
:::

## The Conversion Gap

Speed is necessary. It is not sufficient. Conversion rates vary dramatically by platform quality: high-performing digital account opening solutions convert above 35%. Low-performing ones convert below 10%. An RCG Global study across more than 50 community bank engagements found an average completion rate of 42%. Meaning on a typical community bank's OAO platform, more than half the people who start never finish.

The conversion gap has three causes that show up consistently across research:

**Length.** Every field beyond the minimum reduces completion. Most community bank applications ask for information at account opening that can be collected later: secondary contact, beneficiary designation, specific product preferences. Strip the application to the minimum required to open the account. Collect the rest after the customer is funded.

**Identity verification timing.** KYC processes that require document uploads see dramatically higher abandonment than those using real-time verification. The friction of finding a passport or driver's license, photographing it clearly, and uploading a legible file is enough to end most mobile sessions. Modern identity verification via data-matching (name, DOB, SSN against public records) completes in seconds.

**Mobile experience.** Seventy-seven percent of consumers prefer mobile or online account management. An account opening flow designed for desktop and adapted for mobile is not the same as one built mobile-first. The difference shows up in completion rates.

## The Intent Is There

The consumer demand for community bank accounts is real. Forty-one percent of Gen Z and 38% of millennials rank the ability to open an account online as a top requirement when choosing a financial institution. Half of Gen Z and millennials say they are open to switching their primary institution to a community bank or credit union, but only if the digital experience qualifies.

:::pullquote
The preference for local, relationship-based banking has not disappeared. It is being blocked by an experience problem.
:::

This is the part that should make community bank leadership uncomfortable: the preference for local, relationship-based banking has not disappeared. It is being blocked by an experience problem.

The 2023 SVB instability period is the clearest demonstration of this dynamic in recent history. When Silicon Valley Bank collapsed, neobanks Mercury and Brex captured an estimated 29% of the displaced deposit outflows. Not because business owners preferred neobanks. Because when they needed to move money fast, neobanks had the only account opening experience that worked in hours rather than days.

## What Closing This Gap Is Worth

Fifty-nine percent of community bank executives planned to increase digital marketing spend heading into 2025. Running paid search campaigns that drive consumers to a five-minute-or-more account opening flow converts that spend into abandonment. The acquisition math only works if the destination converts.

A community bank processing 2,000 new account applications annually with a 42% completion rate is opening 840 accounts digitally. Move to a 60% completion rate, achievable on high-performing platforms, and that is 1,200 accounts. At an average deposit balance of $8,000 per new checking account and a net interest margin of 3.5%, that is $112,000 in incremental annual NIM from the conversion improvement alone. Before cross-sell. Before relationships that deepen over years.

The deposit franchise is the community bank's core asset. A branch network builds it in one channel. A high-performing digital account opening platform builds it in another. MANTL's 150-bank deployment shows the solution exists and is implementable at community bank scale. The question is whether the deposit gap is a board-level priority or still a line item on the technology wish list.
  `,
  },
  'open-banking-community-bank-guide': {
    title: 'Open Banking for Community Banks: What Plaid, Fiserv, and Jack Henry Actually Support',
    description: 'Section 1033 is enjoined and being rewritten, with data access fees back on the table. Open banking is already live at community banks anyway. What Plaid, Fiserv and Jack Henry actually offer, and where it pays off now.',
    publishedDate: 'June 26, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `# Open Banking for Community Banks: What Plaid, Fiserv, and Jack Henry Actually Support

*Published June 26, 2026*

The CFPB finalized its Section 1033 open banking rule in October 2024. A year later, a federal court in Kentucky barred the agency from enforcing it, and the case on appeal is on hold while the CFPB rewrites the rule. The agency opened that reconsideration with an advance notice in August 2025. As of October 2026, no revised proposal has been published, and none of the original compliance dates are being enforced.

The biggest reported change in the rewrite is fees. The 2024 rule barred banks from charging for data access. According to news reports cited by Ballard Spahr in June 2026, the CFPB intends to drop that outright ban and let data providers charge after a set number of free requests.

For community banks, the temptation is to treat open banking as a regulatory problem that has been postponed. That reading is wrong. Open banking is already running at community banks, through their cores, their digital banking platforms and their loan origination systems. The question is not whether it is coming. It is which of your workflows would benefit from it now.

:::pullquote
Open banking is already running at community banks. The question is which workflows would benefit from it now.
:::

## What the Regulation Actually Says

Section 1033 of the Dodd-Frank Act gives consumers the right to access their financial data, subject to rules the CFPB writes. The 2024 rule would have required covered institutions to stand up a standardized developer interface for authorized third parties, on a schedule that started with the largest institutions.

Two things matter for community banks. First, the 2024 rule exempted depository institutions at or below $850 million in assets from the developer interface requirement. In October 2025, ICBA asked the CFPB to raise that exemption to every community bank with $10 billion or less in assets, and to let banks charge a reasonable fee for interface access. Other banking groups have opposed a broader exemption, so the final threshold is genuinely open.

Second, the federal pause is not the only front. New York lawmakers introduced bills in March 2026 that would require financial institutions to build a developer interface and bar them from charging for data access. Both were still in committee as of June.

The practical effect for most community banks right now: no rule requires you to build an API this year. But your customers are already sharing their data with fintechs through aggregators, and your vendors are already building for it.

## What Plaid Actually Supports for Community Banks

Plaid says its network covers more than 12,000 financial institutions. The quality of those connections is not uniform. Where an institution has no API connection, aggregators have historically fallen back on credential-based access, which is less reliable and puts the customer's online banking password in a third party's hands.

In November 2025, Plaid expanded its Data Partner Dashboard to community banks and credit unions, letting them see and fix their own connection issues, monitor connection health and update how their brand appears in Plaid Link. It is a free, practical first step for any bank that has never looked at how its customers connect to fintech apps.

The most concrete lending deployment came on April 28, 2026, when MeridianLink announced an expanded partnership embedding Plaid Income in MeridianLink Consumer. A borrower connects a bank account, and income is verified from deposit data instead of uploaded pay stubs. The companies cite 80% conversion in lending flows, which is a vendor figure, and plan to add cash flow underwriting data later in 2026.

:::stat
**80%**
Conversion in lending flows that MeridianLink and Plaid cite for Plaid Income, which went live inside MeridianLink Consumer in April 2026. A vendor figure.
:::

For a community lender already running MeridianLink Consumer, this is not a future capability. It is a configuration conversation.

## What Fiserv and Jack Henry Actually Offer

The two largest community bank core providers approach open banking differently.

**Fiserv.** Open banking runs through Communicator Open, which Fiserv describes as a way for institutions on its account processing platforms to reach third-party fintech capabilities and pursue open finance strategies, delivered as RESTful APIs. Integration partners list support for Premier, Signature and Precision. Access is not automatic: PortX, an integration vendor, notes that banks typically need to re-license for API-first contracts and plan for integration work and middleware. If your bank is on Fiserv and has not discussed Communicator Open with its account team, start there.

**Jack Henry.** Jack Henry built its open banking connections early, through its Banno digital platform. In 2020 and 2021 it signed API-based data access agreements with Plaid, Finicity and Envestnet Yodlee, and in May 2021 it became the first core provider to join Akoya's data access network. Those connections replace credential-based screen scraping for Banno users with token-based access.

The practical difference: a bank on Jack Henry's digital platform likely already has API-based connections to the major aggregators. A bank on Fiserv may need to make a deliberate licensing and integration decision first.

## Where Open Banking Adds Value Right Now

Three use cases are live at community banks today.

**Income verification.** Replacing manual document collection with deposit-based income verification cuts a step that can take days down to minutes, and removes a document request that borrowers often abandon over. The MeridianLink and Plaid integration is the clearest community lending example.

**Account opening and funding.** Instant account verification lets a new customer fund an account during opening, instead of waiting days for micro-deposits to post. For a bank trying to close the account opening gap with fintechs, that wait is a direct conversion cost.

**Cash flow underwriting.** Transaction data from a borrower's connected accounts can supplement traditional documentation for thin-file consumers and small businesses with revenue but little W-2 history. It is the use case most vendors, including MeridianLink, have named as next.

## Why Not Wait for the Rule

The rewrite will settle the threshold, the fee question and the timeline. It will not change the direction. Customers already connect their accounts to apps, and lenders already verify income from bank data.

:::pullquote
The banks waiting for the final rule will be building under a deadline.
:::

For community banks, there is an advantage hiding in the delay. The friction left in open banking is mostly trust: customers deciding whether to connect an account, and to whom. Community banks have more of that than any fintech. The banks that build operational experience while the timelines are soft will move faster when they harden. The banks waiting for the final rule will be building under a deadline.
  `,
  },
  'fintech-grade-loan-application-community-bank': {
    title: 'How to Offer a Fintech-Grade Loan Application as a Community Bank',
    description: "The banking industry's average loan application conversion rate is 3%. Here is how fintechs get it to 80%, and how community banks can copy the playbook without replacing their core.",
    publishedDate: 'June 16, 2026',
    readTime: '7 min read',
    content: `# How to Offer a Fintech-Grade Loan Application as a Community Bank

*Published June 26, 2026*

The banking industry's average loan application conversion rate is 3%. Three percent of people who start an application close a loan.

PeoplesChoice Credit Union doubled their completion rate and funded loan volume by switching to a three-step application. The change was not a new core system. It was a different form.

The gap between a fintech-grade loan application and a community bank loan application is not primarily a technology gap. It is a design gap, and design gaps are fixable.

## The Abandonment Problem

Loan application abandonment rates reach 97.5% in some segments, per Resolve Pay and Gnosari's 2026 research. The average digital application abandonment rate hit 67% in 2025. If your borrower cannot complete the application in under five minutes, abandonment likelihood rises above 60%.

:::pullquote
Every field you add to the form makes it worse.
:::

Every field you add to the form makes it worse. Every additional field beyond three reduces completion by 5 to 10%. A three-field form converts at a rate 10% higher than a six-field form. Complex identity verification steps alone can drive a 30% increase in abandonment.

Read those numbers and then count the fields in your current loan application.

## What Fintechs Do Differently

The fintech application design standard is: one screen, one action.

Not one page with a progress bar. One goal per screen, one decision per step, no cognitive load that bleeds from one section into the next. This is not aesthetics. It is conversion engineering.

Specifically, leading fintechs do the following that most community banks do not:

- **OCR auto-fill.** When a borrower uploads a driver's license or pay stub, the system reads the document and fills the form fields automatically. The borrower confirms rather than types.
- **Save and resume.** High-friction flows build in the ability to stop and continue from another device. A borrower who starts on a phone during lunch should be able to finish on a laptop that evening.
- **Linked account pre-fill.** If the borrower already has a checking account at the institution, the application pre-populates name, address, and account information. They should not have to type what you already know.
- **OTP login.** Phone-number-plus-code authentication instead of email, password, and security questions. Lower friction at the front door means more borrowers make it to the application itself.

These are design choices, not core system features. Most of them are implementable on top of existing infrastructure.

## The Income Verification Lever

The biggest abandonment driver in the back half of a loan application is document collection: asking borrowers to upload pay stubs, bank statements, and tax documents.

The fintech solution is open banking income verification.

MeridianLink announced a partnership with Plaid in April 2026 specifically to bring this capability to community financial institutions. The integration drives 80% conversion in lending flows by replacing manual document upload with a direct connection to the borrower's bank or payroll account. Instead of waiting days for the borrower to locate and scan documents, the bank pulls the data directly, with the borrower's authorization, in minutes.

:::stat
**80%**
Conversion rate in lending flows when Plaid Income replaces manual document uploads, per MeridianLink's April 2026 deployment data.
:::

Plaid connects to 9,706 financial institutions in the United States. Traditional bank verification that required faxed documents and took weeks now delivers account balance, account holder name, account number, and transaction history in real time.

That is not a marginal improvement. For a borrower applying for a personal loan at 8 PM on a Tuesday, it is the difference between completing the application and abandoning it.

## The KYC Timing Rule

KYC processes that take more than five minutes see a 40% drop in completion rates, per UX research from Eleken and ProCreator. The threshold is not arbitrary. Five minutes is approximately the point at which a mobile user's attention and patience break.

The implication: if your identity verification workflow, however compliant and thorough it may be, takes longer than five minutes in a mobile flow, you are losing 40% of applicants at that step alone.

The fix is not to weaken the KYC process. It is to front-load the steps that take less time and build in friction-reduction tools (OCR, pre-fill, direct data pull) that keep the borrower moving.

## The Implementation Path

Community banks do not need to rebuild their loan origination system to get here. The changes that move the needle most are at the interface layer: the application form, the document collection step, and the identity verification flow.

The Financial Brand's 12-step digital lending action plan for community institutions prioritizes: a configurable LOS with audit-ready workflow documentation, open banking integration for income and asset verification, e-sign at the disclosure step, and retargeting for incomplete applications.

Retargeting deserves specific mention. Most community banks do not follow up with borrowers who started an application and did not finish. Fintechs do, systematically, with automated reminders that bring the borrower back to exactly where they left off.

:::pullquote
The banks that compete on digital loan applications in 2026 are not the ones with the most features. They are the ones with the fewest steps between "I need a loan" and "I just got approved."
:::

The banks that compete on digital loan applications in 2026 are not the ones with the most features. They are the ones with the fewest steps between "I need a loan" and "I just got approved."
`,
  },
  'what-neobanks-get-right-community-banks': {
    title: 'What Neobanks Get Right (and What Community Banks Already Have That They Don\'t)',
    description: "Neobanks won on UX. Community banks won on trust, deposits, and relationships. 70% of small businesses prefer community banks but only 31% use one. The gap is digital capability, not preference.",
    publishedDate: 'June 9, 2026',
    readTime: '7 min read',
    content: `# What Neobanks Get Right (and What Community Banks Already Have That They Don't)

*Published June 26, 2026*

Let's be fair about what neobanks actually do well, because community banks can't compete with something they refuse to understand.

J.D. Power's 2025 U.S. Direct Banking Satisfaction Study put online-only direct bank checking accounts at 692 satisfaction points, 24 points above regional banks and 35 above national banks. That lead is real. It is driven by interface simplicity, fast onboarding, and no fees. Those things matter to consumers.

But the same study contained a number that gets far less attention: 28% of neobank customers reported a problem or complaint in the prior 12 months. For traditional online banks, that number was 23%. Neobanks win on experience and lose on reliability.

:::stat
**28%**
Share of neobank customers who reported a problem or complaint in the prior 12 months, versus 23% for traditional online banks.
:::

Community banks have something neobanks are spending years and billions trying to acquire. The right question is whether they are using it.

## What Neobanks Actually Got Right

Three things, specifically.

**Speed of onboarding.** Chime can open an account in two minutes. Community bank account opening, even digitally, routinely takes 15 to 30 minutes and often requires a branch visit to complete. The onboarding experience is the first impression, and first impressions determine whether a new borrower explores more products or files your institution under "too much friction."

**No fees.** Neobanks built their customer acquisition model around eliminating the fees that community banks historically relied on: overdraft fees, monthly maintenance fees, minimum balance requirements. Whether this is sustainable is a separate question. What matters is that it changed customer expectations permanently.

**Mobile-first design.** Fintech applications reduce scrolling, use drop-down menus instead of free-text fields, pre-fill from linked accounts or prior data, and build save-and-resume into every high-friction flow. The application is designed for a thumb, not a mouse. Community bank digital applications are typically designed for a desktop and tested on a phone as an afterthought.

These are real advantages. They are also all replicable.

## What Neobanks Cannot Replicate

The Chime story that does not get told in the press release is the enforcement action.

Chime accumulated more than 920 CFPB complaints since 2020, nearly 200 involving accounts that were locked with customer funds trapped inside. In May 2024, the CFPB ordered Chime to pay millions after the company failed to return funds within 14 days of account closure. Some customers waited more than 90 days for their own money back. For comparison, Wells Fargo generated 317 similar complaints over the same period.

That is a customer service problem at scale with no branch to walk into and no loan officer to call.

:::pullquote
That is a customer service problem at scale with no branch to walk into and no loan officer to call.
:::

The Synapse bankruptcy in April 2024 made the structural risk explicit. When the BaaS middleware provider that linked several neobanks to their sponsor banks filed for bankruptcy, approximately $85 million in customer deposits became inaccessible for months. A shortfall of $65 to $96 million was identified that FDIC coverage could not resolve because the account ledgers were contradictory. Customers had done nothing wrong and could not access their money.

Community banks do not have a Synapse problem. They have direct FDIC coverage, direct core access, and a loan officer the borrower can call by name.

## The Trust Gap Is Real

AlternaCX's analysis put traditional bank trust and stability perception scores at 87, versus 74 for neobanks. That 13-point gap reflects genuine differences in what happens when something goes wrong.

More than 70% of small businesses say they prefer or would prefer to bank with a community bank. Only 31% currently do. The gap is digital capability, not preference. Fifty-five percent of millennial-run small businesses say they would prefer a community institution if it matched digital capabilities.

:::pullquote
The gap is digital capability, not preference.
:::

That is the market opportunity in a single sentence. The preference is already there. The conversion barrier is the experience.

## The Profitability Reality

Only 15% of neobanks are profitable as of 2026. The average annual revenue per U.S. neobank retail customer is $70 to $80, well below the $100-plus global average. Fintech funding dropped 40% year-over-year as investors demanded viable paths to profitability. Most neobanks remain almost entirely dependent on interchange revenue, with no access to interest income because they lack full banking licenses.

Community banks have net interest income. They have fee income across a diversified product mix. They have customers with mortgages, business checking accounts, and 20-year relationships. The neobank customer has a debit card and a direct deposit.

The competitive asymmetry runs in both directions. Neobanks have better interfaces. Community banks have better businesses. The banks that recognize this will modernize the interface rather than abandon the model.
`,
  },
  'community-bank-borrower-experience-roi': {
    title: 'The ROI of Modernizing Your Community Bank Borrower Experience',
    description: "Blend's third-party ROI study found a 10.15x return per loan and $914 in cost savings per file. A documented community bank case study showed 50% faster processing and 25% higher revenue. These are not projections.",
    publishedDate: 'June 2, 2026',
    readTime: '7 min read',
    content: `# The ROI of Modernizing Your Community Bank Borrower Experience

*Published June 26, 2026*

Here is a number that most community bank CFOs have not seen: 10.15.

That is the documented return per loan that Blend's mortgage suite customers achieved in a third-party ROI study. Not 10.15 percentage points. 10.15 times the investment, per loan, after implementation costs.

The same study found $914 in cost savings per loan, 7.3 days removed from the average loan cycle, and a 50% reduction in borrower withdrawal rates. These are not projections. They are averages across Blend's actual customer base.

:::stat
**$914**
Cost savings per loan achieved by Blend mortgage suite customers in a third-party ROI study, alongside a 50% reduction in borrower withdrawal rates.
:::

The ROI of modernizing a community bank borrower experience is not theoretical. It is documented, and it is large.

:::pullquote
The ROI of modernizing a community bank borrower experience is not theoretical. It is documented, and it is large.
:::

## What the Hard Numbers Show

The Blend study is not an outlier.

A community bank case study published by Vantage Point documented a 360-employee bank that completed a digital transformation of its loan process and achieved: 25% increase in recurring service revenue, 50% faster loan processing, 60% fewer compliance errors, 20% lower operational costs, and 3 times return on marketing campaigns.

Abrigo reports that financial institutions on its lending platform show 38% higher loan growth on average compared to peer institutions. ScienceSoft's benchmarking of custom loan origination software implementations documents up to 225% ROI in year one, alongside a 2x increase in loan approval rates and 50% lower onboarding costs.

The range is wide, which is honest. The outcome depends on starting point, implementation quality, and which loan products you modernize first. But the direction is consistent across every documented case.

## What Drives the ROI

Two metrics generate most of the financial return: pull-through rate and processing cost per loan.

Pull-through rate is the percentage of applications that make it from submission to closing. The industry average for mortgage is 75.3%, per ICE Mortgage Technology. Every percentage point above that baseline is revenue your bank keeps instead of losing to abandonment, competitor offers, or borrower fatigue during a slow process.

A 1.8-percentage-point improvement in pull-through rate translates to $6.6 million in incremental annual revenue for an average-sized lender, according to LendArch benchmarking. A modern digital experience, with faster decisions, fewer document requests, and cleaner mobile UX, moves that number.

Processing cost per loan is the other lever. At community banks with manual workflows, origination costs run several thousand dollars per closed loan. Digital automation of income verification, document collection, and underwriting workflow cuts that substantially.

## The Digital Customer Revenue Gap

There is a less obvious driver of ROI that shows up in account-level analysis.

Digital banking customers generate incremental revenue at 10.7% annually. Non-digital customers generate it at 4.5%. That 6-point gap, documented by Cornerstone Advisors, reflects a customer who uses more products, stays longer, and costs less to serve.

Attrition tells the same story. Digital customers leave at 8.9% annually. Non-digital customers leave at 13.8%. The difference is nearly 5 percentage points of annual retention, which compounds dramatically over a 5 to 10-year relationship.

The ROI of a better borrower experience is not just in the loan file. It is in the lifetime value of the customer relationship.

:::pullquote
The ROI of a better borrower experience is not just in the loan file. It is in the lifetime value of the customer relationship.
:::

## The Small Things That Move the Metric

Some of the highest-ROI changes in the digital lending experience are also the least expensive.

Reducing an online loan application from 20 fields to 10 produces a 15% improvement in completion rate, per Gold Point Systems' analysis of documented bank redesigns. Removing a single unnecessary form field raises completion rates by 26%.

The average digital loan application abandonment rate hit 67% in 2025, more than double the prior year. Some of that is macroeconomic. Much of it is avoidable through simpler forms, fewer upload requirements, and income verification that pulls data automatically instead of asking borrowers to manually submit pay stubs.

Borrowers who complete an application in a single sitting close at much higher rates than borrowers who drop off and return later, if they return at all.

## The Calculation Your CFO Should Run

If your bank closes 500 loans a year and the current pull-through rate is 75%, a 5-point improvement closes 25 more loans. At an average loan balance of $250,000 and a net interest margin of 3%, that is $187,500 in incremental annual net interest income, before fees.

Apply the Blend benchmark of $914 in processing cost savings across those same 500 loans. That is $457,000 in efficiency savings.

Combined, the number is not small. And it does not require a new core.
`,
  },
  'community-bank-digital-lending-platform-guide': {
    title: 'What to Look for in a Community Bank Digital Lending Platform',
    description: "There are five platforms most community banks evaluate when they go shopping for a loan origination system. Pricing runs $50K to $500K annually. Here is what to ask before you sign anything.",
    publishedDate: 'May 26, 2026',
    readTime: '7 min read',
    content: `# What to Look for in a Community Bank Digital Lending Platform

*Published June 26, 2026*

There are five platforms most community banks evaluate when they go shopping for a loan origination system. All of them will solve some of your problems and create new ones. Knowing which questions to ask before you sign anything is the most important part of the process.

## The Shortlist

The community bank LOS market has consolidated around five names: nCino, Abrigo, Baker Hill, MeridianLink, and Finastra.

Abrigo serves more than 2,400 financial institutions and has the deepest community bank reference list in the segment. Baker Hill has worked with community banks since 1983 and is generally considered the lower total-cost option for smaller institutions. nCino is built on Salesforce, which adds capability but also adds Salesforce licensing costs that compound over time. MeridianLink is strong on consumer loan origination. Finastra's Mortgagebot is well-regarded for mortgage-specific workflows.

None of these are wrong choices. The right one depends on your asset size, loan mix, core system, and how much internal IT capacity you have to manage an implementation.

:::pullquote
None of these are wrong choices. The right one depends on your asset size, loan mix, core system, and how much internal IT capacity you have to manage an implementation.
:::

## The Real Cost

The pricing reality is that licensing runs $50,000 to $500,000 annually, depending on asset size, loan volume, and which modules you select. Implementation adds another $15,000 to $200,000 upfront. A full LOS replacement, accounting for data migration, configuration, core integration, staff training, and parallel processing, takes 6 to 18 months.

:::stat
**$50K–$500K**
Annual licensing cost for a community bank LOS, depending on asset size, loan volume, and modules selected.
:::

Mid-tier implementations land closer to 6 months. Phased approaches that prioritize one loan type first can deliver initial borrower-facing value in 3 to 6 months.

If your bank runs Fiserv or Jack Henry, AI-native overlay tools that sit on top of your existing LOS rather than replacing it can deploy in days to weeks. That is a fundamentally different implementation calculus.

## The Core Integration Question

Core integration is the make-or-break criterion. Every vendor shortlist should lead with it.

Jack Henry runs its integration layer through jXchange, which provides read, write, and workflow-trigger access across both SilverLake and CIF 20/20 cores. Jack Henry also operates a curated Fintech Integration Network of pre-certified third-party vendors. If your bank runs Jack Henry, vendors listed in that network should get priority in your evaluation. Uncertified integrations carry materially longer implementation timelines and ongoing maintenance risk.

Fiserv has consolidated its community bank cores, Premier, Precision, and Cleartouch, under the CoreAdvance umbrella. Vendors without a documented, certified integration path to your specific core should be eliminated early in the process.

Ask every vendor you talk to: "What is your certified integration with our core and how many community banks in our asset range are running it today?"

## The ICBA Vendor Evaluation Framework

ICBA's fintech vendor evaluation guidance flags five risk categories that should appear on every community bank's checklist:

- Financial stability of the vendor (ask for audited financials or ownership structure)
- Data security and SOC 2 Type II certification
- Regulatory compliance posture (SR 11-7 model risk, OCC Bulletin 2025-26)
- Exit and data-portability terms (what happens if you want to leave)
- References from institutions at comparable asset size and loan volume

Contracts without explicit data-portability and off-boarding provisions are a red flag. The vendor's incentive is to make switching expensive. Yours is to preserve optionality.

:::pullquote
Contracts without explicit data-portability and off-boarding provisions are a red flag. The vendor's incentive is to make switching expensive. Yours is to preserve optionality.
:::

## The ROI Benchmark to Hold Vendors To

When vendors present ROI projections, the industry benchmarks give you something to push back with.

Digital lending implementations at community bank scale have produced an 80% reduction in per-loan origination costs in documented cases. Blend's mortgage-specific ROI study showed a 10.15x return per loan and a 20% higher pull-through rate. Abrigo reports that customers on its platform show 38% higher loan growth on average than peer institutions.

:::stat
**80%**
Reduction in per-loan origination costs documented in community bank digital lending implementations.
:::

The 2 to 4 times return within 2 to 3 years benchmark is achievable. Ask vendors to show you reference customers in your asset class who have hit it, with specific numbers, not testimonial quotes.

The community bank technology landscape is full of implementations that looked right on paper and delivered half the projected value because the integration was harder than promised and the training timeline was longer than scoped. Reference checking is not optional.
`,
  },
  'community-bank-ceo-digital-lending-2026': {
    title: "The Community Bank CEO's Guide to Digital Lending in 2026",
    description: "94% of community bank CEOs say they would adopt digital lending if the economics made sense. Most haven't. Here is the decision framework for 2026 that skips the $2B core replacement debate.",
    publishedDate: 'May 19, 2026',
    readTime: '7 min read',
    content: `# The Community Bank CEO's Guide to Digital Lending in 2026

*Published June 26, 2026*

Ninety-four percent of community bank CEOs say they would adopt digital lending if the economics made sense.

Most haven't. That gap is the central challenge of community banking in 2026.

The intent is not the problem. The problem is execution, and specifically the assumptions that get built into the evaluation process before the first vendor demo is scheduled.

## The Intent-Execution Gap

The 94% figure comes from Jifiti's survey of community bank decision-makers, and it holds up against other data sources. CSI's 2025 Banking Priorities Report found that 45% of community bank executives named AI as their top innovation priority, for the third consecutive year. ICBA's 2026 priorities formally designated AI, payments, fraud, and digital customer experience as the top technology focuses for the year.

The intent is clearly there. The execution gap is what varies.

What keeps banks stuck is not a lack of desire to modernize. It is the framing of the problem. When "digital lending" is understood as "replace the core," the economics are terrible. A full core migration runs $100 million to $2 billion over 3 to 7 years. That math does not work for a $500 million community bank.

:::pullquote
But that is not what digital lending has to mean.
:::

## What "Digital Lending" Actually Means

Ninety percent of community banks already offer online loan applications, up from 76% in 2019. The channel exists.

The problem is what happens when borrowers find it. Auto loan completion rates run at 28%. Personal loans complete at 42%. Credit cards at 34%. The average digital application abandonment rate hit 67% in 2025, more than double the prior year.

:::stat
**67%**
The average digital loan application abandonment rate in 2025, more than double the prior year, despite 90% of community banks offering online applications.
:::

The bank built a front door. Nobody is walking through it.

Digital lending, in the sense that matters for 2026, is not about whether a link exists on your website. It is about the experience on the other side of that link: speed of decisioning, number of form fields, mobile optimization, document upload, income verification that takes five minutes instead of five days.

## The Completion Rate Problem

Community banks issued 38% of total U.S. small and medium business credit in 2025, down from 41% the prior year. That slide tracks directly with the experience gap in the digital channel.

When only 25% of visitors who reach a community bank loan page even begin the application, and of those, 67% abandon before finishing, the actual conversion rate from visitor to completed application is under 10%.

Fintechs are not winning on rates. They are not winning on trust. They are winning because a borrower who starts an application on their platform has a meaningfully higher probability of finishing it.

:::pullquote
The fix is not a new core. It is a better application flow, integrated with the core you already have.
:::

The fix is not a new core. It is a better application flow, integrated with the core you already have.

## 2026 Priorities: What Actually Matters

The ICBA has flagged four areas as the top technology focuses for 2026: AI, payments, fraud, and customer experience. The BNY Voice of Community Banks Survey for 2025 surfaced core modernization (44% of respondents) and deposit growth (40%) as the top two strategic goals.

Both of those can be addressed without a core replacement.

On the AI front, 37% of community bank executives say automation and AI are critical to back-office operations. The highest-ROI applications are the ones closest to the loan file: automated income verification, document classification, and fraud flagging. Not large-language-model experiments that generate more internal meetings than borrower value.

On customer experience: every documented implementation of a modern digital front-end on top of an existing community bank core has produced faster cycle times and improved borrower retention. The question is not whether it works. It is whether the implementation is scoped correctly.

## The Decision Framework

The way to evaluate a digital lending initiative in 2026 is not "which core should we move to." It is three questions.

**Can we add a modern front-end to the core we have?** For Fiserv and Jack Henry shops, the answer is yes. Both cores expose API layers that modern software connects to. The integration is not trivial, but it is documented and it has been done.

**What does the ROI look like?** Industry benchmarks for digital lending implementations cluster around 2 to 4 times return within 2 to 3 years. Blend's documented study put the mortgage-specific ROI at 10.15 times per loan. These are not promotional figures. They reflect real changes in pull-through rates, processing speed, and borrower retention.

**What is the time to value?** A full core migration means 3 to 7 years before borrowers experience anything different. A layered digital experience can go live in months. For a community bank competing with neobanks right now, the timeline matters as much as the end state.

The banks that make the right decision in 2026 will be the ones that stopped asking "what should our core look like" and started asking "what does my borrower experience look like in 90 days."
`,
  },
  'community-banks-lose-loans-fintechs': {
    title: 'Why Community Banks Lose Loans to Fintechs (and How to Win Them Back)',
    description: "Non-bank lenders now hold 66% of the U.S. mortgage market. Community banks dropped from 42.5% to 30.1% in six years. The gap isn't rates or trust. It's the application experience.",
    publishedDate: 'May 12, 2026',
    readTime: '7 min read',
    content: `# Why Community Banks Lose Loans to Fintechs (and How to Win Them Back)

*Published June 26, 2026*

Non-bank lenders now control 66.4% of the U.S. mortgage market. Six years ago, community banks held 42.5% of mortgage originations. By 2024, that had fallen to 30.1%.

This is not a blip. It is a structural shift, and it is accelerating.

The question worth asking is not whether it's happening. It clearly is. The question is why, and more practically, whether community banks can reverse it.

## The Market Share Collapse

Start with the mortgage numbers, because they are the starkest.

Of the 25 largest mortgage lenders in the United States today, 17 are non-bank institutions. Banks collectively dropped to 28.9% of the mortgage market in 2024. Credit unions held 15.4%. Non-banks took the rest.

The same trend is playing out in small business lending. Fintechs now capture 28% of new small business loan originations, a segment that community banks historically dominated with roughly 45% market share. The FDIC's 2024 Small Business Lending Survey found that 31% of community banks are already using fintech partnerships in their small business lending process, an implicit acknowledgment that going it alone isn't working.

Community banks' overall share of U.S. banking assets has fallen from more than 40% in 1994 to roughly 20% today. The compression is slow but relentless.

:::pullquote
Community banks' overall share of U.S. banking assets has fallen from more than 40% in 1994 to roughly 20% today. The compression is slow but relentless.
:::

## The Application Experience Leak

The reasons behind the numbers are not mysterious.

Fintech platforms issue loan approval decisions in minutes. AI-driven underwriting at leading neobanks has cut small business loan approval from days to under 10 minutes. Traditional banks take 3 to 8 weeks. SBA loans can stretch to 90 days.

That speed gap creates a specific problem in the digital channel that most community banks have not measured carefully enough.

The average digital loan application abandonment rate hit 67% in 2025, more than double the prior year, according to Cornerstone Advisors. Some research puts mobile banking application abandonment even higher: Forrester has measured it at 97.5% for certain product types. And only 25% of users who visit a community bank's loan page even begin the application.

:::stat
**67%**
The average digital loan application abandonment rate in 2025, more than double the prior year, according to Cornerstone Advisors.
:::

Read that again. Three out of four prospective borrowers who show up at the digital front door and look at the loan page leave without starting.

That is not a marketing problem. It is a product problem.

## Where the Next Generation Already Is

Gen Z is not waiting for community banks to catch up.

Twenty-nine percent of Gen Z consumers now name a digital bank or fintech as their primary checking provider, up from 11% just four years ago. Sixty-one percent say fintech apps specifically help them manage financial challenges better than their bank does. Seventy-seven percent insist that their financial institution integrates with the apps they already use.

These are not edge cases. They are early signals of a generation building financial habits outside the traditional banking system. Once a 24-year-old opens a Chime account and takes out an SoFi personal loan, the community bank relationship has to be rebuilt from scratch, and the switching cost makes that unlikely.

:::pullquote
Once a 24-year-old opens a Chime account and takes out an SoFi personal loan, the community bank relationship has to be rebuilt from scratch, and the switching cost makes that unlikely.
:::

The borrowers who are forming financial habits right now are doing so with fintech-native experiences as their baseline. When they need a mortgage in five years, that baseline is what they will compare a community bank application against.

## The Comeback Play

The path back is not complicated. It is just hard to execute without the right infrastructure.

Community banks that have closed the experience gap share a common approach: they added a modern digital front-end to their existing core rather than replacing the core entirely. The result is an application flow that feels like SoFi, built on Fiserv or Jack Henry infrastructure that the bank already operates.

The economics of this approach matter. A full core replacement runs $100 million to $2 billion and takes 3 to 7 years. A layered digital experience can go live in months. The difference in time-to-market is the difference between winning borrowers who are available now and chasing borrowers who have already made a different choice.

ICBA's 2025 CEO Outlook survey found multiple bank CEOs explicitly citing plans to implement loan origination software to improve turnaround times on business loans. The will is there. The constraint has been finding an implementation path that does not require betting the bank on a multi-year infrastructure project.

That path exists. Community banks that find it are the ones that will be gaining market share five years from now rather than continuing to lose it.
`,
  },
  'community-bank-compete-neobank-core': {
    title: 'How Community Banks Can Compete With Neobanks Without Replacing Their Core',
    description: "Chime spent $519M on marketing last year and added 22M customers. Community banks don't need to replace their core to fight back. Here's the third option most vendors don't want to sell you.",
    publishedDate: 'May 5, 2026',
    readTime: '6 min read',
    content: `# How Community Banks Can Compete With Neobanks Without Replacing Their Core

*Published June 26, 2026*

Chime spent $519 million on marketing last year. For context, that's more than most community banks have in total assets. And it's working.

Chime now counts 22.34 million customers, up 21% in a single year. SoFi has 5.34 million more. Together, these two companies are doing what every community bank CEO has been warned about for a decade: pulling younger, digital-native customers away from institutions that have served their families for generations.

The question is what to do about it.

The instinct, for many banks, is to look at the technology stack and assume the problem lives there. Maybe it does. But the solution most technology vendors are selling, a full core replacement, is a trap that costs more than you bargained for and takes longer than you have.

There's a third option. Less dramatic, considerably cheaper, and it actually works.

## The Speed Gap Is Real

Let's be specific about what neobanks are actually offering, because it's not magic.

A customer applying for a personal loan at Chime or SoFi gets a decision in minutes. Funding follows in one to three business days. The application takes maybe ten minutes on a phone.

A customer applying at the average community bank waits two to four weeks for the same outcome. Even the fastest community lenders, the ones that have optimized their workflows, need at least five to seven business days.

That gap is not a technology problem. It's an experience problem.

:::pullquote
That gap is not a technology problem. It's an experience problem.
:::

And it's costing community banks real business. Seventy-nine percent of consumers say they'll pay more for convenience and fast transactions. Eighty-nine percent expect 24/7 access to banking services. Seventy-four percent want personalized experiences. These aren't fringe preferences; they're baseline expectations that neobanks have set, and that borrowers now apply everywhere, including their local bank.

## The Core Replacement Trap

Here's where most of the vendor conversation goes wrong.

When community bank leadership says "we need to modernize," the technology industry's answer is to sell a new core. The pitch is compelling: newer architecture, better APIs, purpose-built for digital. The problem is the price tag and the timeline.

A full core migration runs between $100 million and $2 billion. It takes three to seven years. During that entire window, your team is managing the migration instead of serving customers. Staff is in training. Integrations are being rebuilt. And at the end of it, you have a new core, but you still need a modern front-end to show borrowers.

:::stat
**$100M–$2B**
The cost range for a full core migration, which takes three to seven years and consumes staff and capital the entire time.
:::

Thirty-five percent of community banks are already dissatisfied with their core provider, according to the American Bankers Association's 2025 Core Platform Survey. That dissatisfaction is real. But dissatisfaction with your core is not the same thing as needing a new one.

Most community banks run Fiserv or Jack Henry. These are mature, stable platforms with deep integrations built over decades. They're not fundamentally broken. The problem is that the customer-facing interfaces sitting on top of them were designed in a different era. The loan application experience feels like it, too.

## The Third Option: Layer, Don't Replace

McKinsey calls it "hollowing out the core." The idea is straightforward: instead of replacing the core, extract specific functions through API middleware and run a modern digital layer on top. The core keeps doing what it does well, managing accounts, processing transactions, staying compliant. What changes is what the borrower sees.

For community banks, this means you can offer an experience that looks and feels like SoFi, a clean mobile interface, a short application, fast decisioning, without touching the infrastructure your operations team depends on and your examiners are familiar with.

The integration points already exist. Fiserv and Jack Henry both expose API layers that modern software can connect to. The challenge has been finding a front-end purpose-built for community banks rather than one designed for a large institution and scaled down as an afterthought.

This is not theoretical. Banks that have layered modern digital experiences on top of existing cores have reduced application completion time, increased pull-through rates, and started winning back borrowers who left for fintech alternatives.

## What Community Banks Already Have

Here's what the neobank narrative conveniently leaves out.

During the deposit crunch of 2022-2023, the first annual deposit decline in nearly 30 years, large banks took the steepest hits. Community banks reported deposit growth. The relationship model held.

:::pullquote
Chime's $519 million marketing spend exists because customer acquisition is expensive when you have no relationship and no trust. Community banks don't have that problem.
:::

Chime's $519 million marketing spend exists because customer acquisition is expensive when you have no relationship and no trust. Community banks don't have that problem. They have customers who have banked with them for twenty years. The challenge is keeping those customers as expectations shift, and attracting the next generation before it defaults to digital-only.

That's a different problem than what neobanks are solving. It has a different, more achievable solution.

The banks that figure this out won't be the ones who spent five years on a core migration. They'll be the ones that added a modern digital front-end to the infrastructure they already had, went live in months, and used the time and capital they saved to focus on the one thing neobanks can't replicate: actually knowing their customers.
`,
  },
  'south-atlantic-bank-coastal-growth-engine': {
    title: 'South Atlantic Bank: The $2B Coastal Lender Built on In-Migration',
    description: 'South Atlantic Bank turned a 2007 Myrtle Beach startup into a $1.98B coastal lender with branches from Myrtle Beach to Hilton Head. How in-migration, a 56% CRE and construction concentration and a $1M-plus Lowcountry mortgage book are forcing a digital reckoning.',
    publishedDate: 'June 20, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `# South Atlantic Bank: The $2B Coastal Lender Built on In-Migration

*Published June 20, 2026*

South Atlantic Bank opened its doors in Myrtle Beach on November 28, 2007. Within months, the financial crisis was pulling the banking industry apart. Many banks chartered in that window did not survive the decade. South Atlantic Bank is now a $1.98 billion institution.

That detail alone tells you something about the market it picked and how it operates.

## A Startup That Outlasted the Crash

The bank, owned by South Atlantic Bancshares (OTCQX: SABK), has grown to 12 offices along the South Carolina coast: Myrtle Beach, North Myrtle Beach, Murrells Inlet, Pawleys Island and Georgetown on the Grand Strand; Charleston, Mount Pleasant and Summerville around Charleston; and Bluffton, Hilton Head Island and Beaufort in the Lowcountry. The Summerville office, at Carnes Crossroads, opened in 2024.

Its first half of 2026, from the FDIC call report:

- Net income of $10.4 million, up 30% from a year earlier
- Return on assets of 1.07%, up from 0.87%
- Net interest margin of 3.30%, up from 3.12%
- Efficiency ratio of 59.2%, down from 63.8%
- Noncurrent loans at 0.01% of the book

For full-year 2025, the bank earned $17.3 million, up 47% from 2024, and its efficiency ratio fell from 68.4% to 61.4%. At the holding company, consolidated net income was $9.2 million for the first half of 2026, or $1.18 per diluted share.

:::stat
**59.2%**
South Atlantic Bank's efficiency ratio in the first half of 2026, down from 68.4% for full-year 2024, per its FDIC call reports.
:::

The bank does it with 175 full-time-equivalent employees. Chairman and CEO K. Wayne Wicker has served on the American Bankers Association board since 2022 and as its treasurer since 2024, which is not a seat that goes to banks treading water.

What is powering it? The zip codes.

Horry County, home to Myrtle Beach, grew 17.8% from 2020 to 2024, to an estimated 413,391 residents, according to the Census Bureau. Retirees relocating to the Grand Strand, remote workers, and second-home buyers who looked at Florida prices and turned north on I-95. The Charleston and Lowcountry markets the bank has expanded into run on the same kind of in-migration, at higher price points.

:::pullquote
South Atlantic Bank is positioned exactly where the people are going.
:::

South Atlantic Bank is positioned exactly where the people are going.

## The Loan Book That 175 People Are Running

The real story is the balance sheet.

Gross loans reached $1.54 billion in June 2026, up 7.6% in a year, after 10.0% growth in 2025. Construction and land development loans alone are $266 million, up 40% from $190 million a year earlier. Nonfarm commercial real estate adds $592 million. Together those two categories are about 56% of the loan book, concentrated in some of the most active coastal construction markets in the Southeast. Another $548 million is 1-4 family residential mortgages.

That is a lot of deal flow for 12 offices.

The mortgage side is growing too. HMDA data shows the bank originated 252 home loans in 2025, up from 225, and the dollar volume rose from $113.5 million to $148.4 million. Of those, 174 were purchase loans averaging about $527,000. Every one of the 477 loans across both years was conventional. And the geography is striking: the bank's 2025 loans in Charleston County averaged about $1.09 million, and in Beaufort County about $1.19 million, against about $394,000 in Horry County.

:::stat
**$1.19M**
South Atlantic Bank's average 2025 mortgage in Beaufort County (Hilton Head, Bluffton), per HMDA data, about three times its Horry County average.
:::

The digital front door has improved. As of October 2026, the bank's mortgage page links each loan officer's online application, and deposit accounts can be opened online on a bank-branded subdomain. But the mortgage application runs on a third-party ICE portal on a separate domain, and HELOCs, personal and auto loans, and every commercial product still begin with a contact form or a phone call.

A loan officer closing a mortgage for a retiree relocating from New Jersey is still doing some version of the manual document shuffle every community bank does: emailing for pay stubs, waiting on bank statement PDFs, chasing a second piece of ID. Multiply that across a pipeline growing at high single digits a year and the drag on throughput is real.

## The Competitive Problem Nobody's Talking About

Here is the uncomfortable part for any community bank in this market.

Borrowers arriving on the coast are not loyal to South Atlantic Bank. They have no prior relationship. They compare lenders at once, and many have recently applied with a national lender that offered a fully digital application with near-instant income and asset verification.

:::pullquote
Closing speed matters enormously in a market with active construction and high CRE transaction volume.
:::

Closing speed matters enormously in a market with active construction and high CRE transaction volume. A developer building a condominium project on the Grand Strand will not wait three extra days for a term sheet while a loan officer manually requests two years of business tax returns and entity documents. They will call the next bank.

That is basic pipeline math.

South Atlantic Bank's improving returns come from disciplined underwriting, a widening margin and a favorable market. But an efficiency ratio only keeps falling if revenue grows faster than costs, and costs include underwriter hours spent on file cleanup, document chasing and borrower follow-up that should not require a person at all.

The commercial book is where this gets most acute. Developers, resort operators and commercial investors expect a different level of responsiveness than a first-time homebuyer does. When a bank can verify income, employment and assets in minutes rather than days, it becomes the one issuing the fast term sheet backed by verified financials instead of a pending checklist.

The residential side has its own version. A buyer choosing between South Atlantic and a national direct lender is deciding partly on service. If the national lender returns a verification decision in minutes and South Atlantic is still waiting on a W-2, the comparison has already started to tilt. At a $1 million average loan in the Lowcountry, each one of those decisions matters.

## What the Growth Trajectory Demands

The OTCQX listing, the ABA leadership role, the expansion into Charleston and the Lowcountry, the growing construction book: all of it points to a bank aiming well past $2 billion.

That scale changes what the operating stack needs to do. Every point of efficiency improvement requires growing revenue faster than costs, or reducing the labor in processing the volume the bank already has. Probably both. In-migration delivers a steady supply of new borrowers who need mortgages, HELOCs and commercial lines. The construction market delivers large CRE transactions with complex documentation. Running both through a manual verification workflow caps throughput at the pace of human document review.

The banks that will own coastal South Carolina lending over the next decade are the ones that can close a mortgage for a relocating retiree as fast as a national lender, issue a term sheet for a developer before the competing bank returns a call, and do both while keeping the efficiency ratio falling.

Real-time income and employment verification, automated asset confirmation and digital identity checks at the front of the application are what make that possible at scale. Not because technology is better than people, but because the volume math stops working when every file requires manual intervention. A bank growing its loan book 8% to 10% a year cannot add headcount at the same rate and keep its efficiency gains.

South Atlantic Bank has built something impressive in under two decades. The in-migration tailwind is real and durable. The question is whether origination catches up to the growth rate before the gap in digital borrower experience becomes a relationship problem. Banks that solve the intake bottleneck first will write the next chapter of coastal South Carolina lending.
`,
  },
  'conway-national-bank-grand-strand-dominance': {
    title: "Conway National Bank's Quiet Dominance on the Grand Strand",
    description: 'Conway National Bank has held the top deposit share in Horry County every year since at least 2021, and ran a 47.9% efficiency ratio in the first half of 2026. What its numbers reveal about scaling a lean community bank into a surging coastal market.',
    publishedDate: 'June 13, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `# Conway National Bank's Quiet Dominance on the Grand Strand

*Published June 13, 2026*

Here is the number that stops you cold: Conway National Bank holds the largest deposit share in Horry County, South Carolina, ahead of 20 other institutions including Truist, Wells Fargo and Bank of America, and has every year since at least 2021. In the first half of 2026 it did that while running a 47.9% efficiency ratio. That combination is rare. Most banks that dominate a market spend their way there. CNB does it by being disciplined.

This is a $2.0 billion bank based in Conway, in business since 1903, with 16 offices across Horry and Georgetown counties. No flashy fintech partnerships, no press releases about AI, no acquisitions. Just more than 120 years of compounding community relationships in a county that keeps growing around it.

The question worth asking: how long does that formula hold as the county transforms underneath it?

:::stat
**12.41%**
Conway National Bank's share of Horry County deposits in June 2026, the largest of 21 institutions, per the FDIC's Summary of Deposits.
:::

## The Market That Moved In

Horry County had an estimated 413,391 residents in July 2024, up 17.8% from the 2020 census, according to the Census Bureau. Builders pulled permits for 7,331 new housing units in the county in 2024 alone. The people arriving are not just retirees looking for warm weather, though there are plenty of those. Remote workers, families chasing coastal affordability, and second-home buyers who found they could work from Pawleys Island as easily as from a city office.

:::pullquote
Most banks that dominate a market spend their way there. CNB does it by being disciplined.
:::

CNB's mortgage data captures the shift. HMDA filings show the bank originated 329 home loans in 2025, up from 309 in 2024, for $82.1 million. Of those, 161 were purchase loans and 131 were refinances. Every one was conventional: no FHA, VA or USDA loans in either year.

The Georgetown County footprint tells a more interesting story. CNB made 27 loans there in 2025, at an average of about $599,000, nearly three times its Horry County average of about $205,000. In 2024 it made 41 loans there at about $352,000. Fewer loans, much larger ones. The Waccamaw Neck corridor (Pawleys Island, Murrells Inlet, Litchfield Beach) is a high-income second-home and retirement market, and CNB already has branches in it.

The bank's messaging leans on community roots, and that works well for the long-tenured customer who wants to call someone they recognize. It works less well for a retired couple from out of state buying a $600,000 home in Pawleys Island, with pension and brokerage income, who has never been inside a Conway branch.

## The Efficiency Machine and Its Limits

CNB earned $23.2 million in 2025, up 26.5% from 2024, for a 1.23% return on assets. The first half of 2026 was stronger, from the FDIC call report:

- Net income of $13.9 million, up 34.7% from a year earlier
- Return on assets of 1.42%, up from 1.11%
- Net interest margin of 3.31%, up from 2.98%
- Efficiency ratio of 47.9%, down from 52.9%
- Noncurrent loans at 0.02% of the book

The efficiency ratio is the real story. It was 57.0% in 2024, 51.8% in 2025, and 47.9% in the first half of 2026. Most of that came from revenue: net interest income rose while noninterest expense grew about 5%. Getting below 50% with 16 offices and a growing loan book takes relentless cost control on every line.

Net loans stood at $856 million in June, up 3.6% in a year: $296 million in nonfarm commercial real estate, $259 million in 1-4 family mortgages, $125 million in construction, $97 million in C&I and $59 million in consumer loans. Noninterest expense for all of 2025 was $34.5 million. That is a lean cost base for a $2 billion bank, and it means every hour of operational friction shows up in the ratio.

That is where growth gets complicated. Scaling from about 330 mortgage originations a year to 450 or 500 will not come from another branch. It comes from compressing the time and labor per loan. A processor chasing pay stubs, calling employers, waiting on bank statement PDFs and keying income into the loan system is a cost that rises in step with volume. CNB's efficiency depends on breaking that link.

## What the In-Migrant Borrower Actually Looks Like

The Conway National borrower in 2026 is more complex than in 2006, or even 2016.

Picture a retiree who just bought a primary residence in Little River: Social Security, a pension from a former employer, a brokerage account paying dividends, and a small rental property in another state. No W-2. Several income streams, documented across several institutions. Verifying that by hand takes weeks, not days.

Or a remote software engineer who relocated from the Mid-Atlantic, started the current job six months ago, still owns a condo back home, and expects the digital experience of a national lender.

These borrowers are not edge cases. They are a growing share of purchase mortgages in a county adding thousands of housing units a year. The branch-centric model that serves a multigenerational Conway family well creates friction for someone who moved from 700 miles away and needs to close in 30 days.

CNB's website reflects its roots. As of October 2026, its mortgage and construction page offers a payment calculator but no online application, its home equity page asks borrowers to stop by an office, and its business loan page has a contact form rather than an application. The CNB2GO mobile app serves existing customers well. Those are not criticisms of a bank that has compounded impressively for 120 years. They are observations about where friction builds as the borrower changes.

## The Waccamaw Neck Opportunity

A buyer purchasing a $600,000 property on the Waccamaw Neck is often comparing CNB with a regional bank that has a digital application, or a national lender promising a fast close. CNB's advantages there are local knowledge, relationships with the Grand Strand real estate community, and decades of trust. Those matter. But a buyer purchasing remotely, coordinating through a local agent and trying to close before the school year starts also notices how quickly a bank can verify their assets and income.

:::pullquote
The faster that verification happens, the more of that segment CNB can capture without adding an underwriter.
:::

The faster that verification happens, the more of that segment CNB can capture without adding an underwriter. At an average loan near $600,000, each additional Georgetown County purchase is worth roughly three Horry County loans in volume.

## Where the Trajectory Points

Conway National has built something hard to replicate: the top deposit share in a fast-growing coastal market for six straight Summary of Deposits reports, $856 million in loans, and profitability most community banks only read about in peer reports. The foundation is strong.

The next phase will test whether a relationship-first, branch-anchored model can absorb a borrower population that looks less and less like it did ten years ago. The banks that capture the most of Horry County's growth will be the ones that can verify a retiree's pension, a remote worker's employment and a second-home buyer's reserves in hours rather than days. For a bank already running below a 48% efficiency ratio, the operational leverage in getting there is substantial.
`,
  },
  'bank-travelers-rest-greenville-growth-engine': {
    title: "Bank of Travelers Rest: Greenville's $1.6B Growth Engine",
    description: 'Bank of Travelers Rest earned a 1.60% ROA in the first half of 2026 from a single South Carolina county, and just opened its 11th branch. How an 80-year-old community bank became the quiet growth engine of Greenville, and where its loan intake still lags.',
    publishedDate: 'June 11, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '5 min read',
    content: `# Bank of Travelers Rest: Greenville's $1.6B Growth Engine

*Published June 11, 2026*

Bank of Travelers Rest has never had a branch outside Greenville County. Founded in 1946 in Travelers Rest, at the county's northern edge, it has spent 80 years doing something most community banks struggle with: staying focused. Disciplined commercial real estate and residential lending in one county, executed well enough to earn a 1.60% annualized return on assets in the first half of 2026.

The bank reached $1.60 billion in assets at the end of June, up 5.8% from a year earlier, with $1.42 billion in deposits. In July it opened its 11th branch, in Simpsonville, its first new office in a decade.

The first-half numbers are worth sitting with, from the FDIC call report:

- Net income of $12.7 million, up 18.5% from $10.7 million a year earlier
- Net interest margin of 3.27%, up from 3.12%
- Return on equity of 17.99%
- Efficiency ratio of 59.0%
- Noncurrent loans at 0.12% of the book

For full-year 2025, the bank earned $21.9 million, a 1.44% ROA and an 18.28% ROE. The first quarter of 2026 was stronger still, at a 21.82% annualized ROE, before settling back in the second quarter. In an environment where many community banks are still fighting deposit costs, BTR's margin has widened for two straight years.

:::stat
**1.60%**
Bank of Travelers Rest's annualized return on assets in the first half of 2026, up from 1.42% a year earlier, per its FDIC call report.
:::

## A County That Keeps Growing

Greenville County is the most populous county in South Carolina, with an estimated 583,125 residents in July 2025, according to the Census Bureau. That is about 11% more than the 2020 census counted. The Greenville-Anderson metro has been absorbing in-migration for years, with manufacturing, automotive supply chain and technology employers pulling transplants from other states.

Bank of Travelers Rest sits in the middle of it. Its $911 million in net loans grew 5.0% over the year to June. The mix is commercial-led: $422 million in nonfarm commercial real estate and $264 million in 1-4 family residential mortgages, plus $82 million in construction, $73 million in C&I and $40 million in consumer loans. Residential mortgages grew fastest, up 12.7% in a year.

The mortgage book tells the story. HMDA data shows BTR originated 170 home loans in 2025, the same count as 2024, but the dollars rose from $59.1 million to $68.4 million. Of those 170, 108 were purchase loans, averaging about $494,000. Not refinances chasing rate windows. Actual home purchases, meaning new borrowers entering the market. And every one of the 340 loans across both years was conventional: no FHA, VA or USDA volume at all.

:::pullquote
Every one of the 340 home loans across 2024 and 2025 was conventional. No FHA, VA or USDA volume at all.
:::

## The Friction Hidden Inside a Smooth-Running Machine

An efficiency ratio of 59% is good. It has also barely moved: 61% at the end of 2024, 60% in 2025, 59% now, while margin and earnings climbed. The revenue side is doing the work. The cost side is where the next gains are.

The bank's website, rebuilt in 2025, shows where. Consumer loans (vehicle, personal and the RediReserv line) have an online application on the bank's own site, which is more than many banks its size offer, and personal checking and savings accounts can now be opened online. But the consumer application asks the borrower to type in their income, with nothing verified at intake. Mortgage applicants are sent to bankoftravelersrest.mymortgage-online.com, a third-party ICE portal on a separate domain. Construction and commercial loans route to a relationship banker.

That matters because of who is applying. Picture an in-migrant buyer with a W-2 from an employer in Ohio, some side income, and bank accounts at a credit union back home. Not a hard credit. But verifying that file by hand takes time: chasing pay stubs, calling an employer, waiting for statement PDFs that arrive in batches. For a bank writing 108 purchase mortgages a year, mostly to borrowers on a contract deadline, every day spent chasing a document is a day the closing date gets closer.

BTR's wealth management arm, Gateway Wealth Strategies, offered through Raymond James, shows the bank knows how to partner when a product requires it. The digital lending intake has not seen the same investment yet.

## What the Next Chapter Could Look Like

Greenville is not slowing down, and a new Simpsonville branch puts BTR closer to the county's growing southern suburbs. The bank's profitability gives it room to invest: a 1.60% ROA builds capital quickly, and equity rose from $117 million to $147 million in a year.

Faster loan file assembly is one clear place to spend it. In purchase mortgage markets, a borrower under contract with a 30-day close does not compare rates once they have chosen a lender. They notice whether the lender closes on time.

The broader shift in community banking is toward verification that happens before underwriting begins, not during it. Income confirmed from payroll or bank data with the borrower's consent. Balances confirmed against what the borrower reported. Employment verified without a phone call to HR. That kind of intake does not require replacing a core system or a loan origination platform. It layers on top of the workflow BTR already has, starting with the consumer form that already exists.

For a bank that already has the market, the profitability and a new branch in its fastest-growing corridor, the next competitive edge is operational. Bank of Travelers Rest's financial performance is already there. The intake layer is where the gap lives, and closing it is how a community bank turns a favorable market into a durable lead.
`,
  },
  'security-federal-bank-cdfi-rate-rebound-aiken': {
    title: 'Security Federal Bank: CDFI Giant Navigating the Rate Rebound',
    description: "Security Federal, the Aiken CDFI bank with 19 branches and an ICE-powered mortgage stack, cut its efficiency ratio from 75.35% to 70.44% in a year. Still above 70%, and the missing piece is automated verification for its hardest borrower files.",
    publishedDate: 'May 21, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '7 min read',
    content: `# Security Federal Bank: CDFI Giant Navigating the Rate Rebound

*Published May 21, 2026*

The bank that calls itself South Carolina's largest certified bank CDFI isn't in Charleston. It isn't in Columbia. It's in Aiken, a small city most people associate with horse farms and the Masters, and it's sitting on $1.54 billion in assets with 19 branches spanning two states.

That's the part that surprises people. Security Federal Bank has been operating since 1922, longer than most community banks still standing, and it earned its CDFI certification from the US Treasury back in 2010. It has been quietly building a franchise across one of the Southeast's more interesting demographic corridors while the industry chases fintech partnerships and digital-first branding. The bank's mission statement is four words: "Helping People...Changing Lives." It's not catchy. It is, however, accurate.

Understanding why this bank is positioned the way it is requires understanding the market it serves.

## The Aiken-Augusta-Columbia Corridor Is Not a Sleepy Market

People outside the Southeast tend to underestimate this geography. Aiken County added 7,962 residents between 2020 and 2023, a 4.71% gain that runs at nearly five times the national average. The in-migration is not random. Retirees are coming from the Northeast and mid-Atlantic, drawn by home prices that still make financial sense. In 2024, the median home sale price in Aiken was $289,900, with 3,321 total transactions, up 9.5% year over year.

But retirees are only part of the story. Augusta, just across the Georgia line, is anchored by Savannah River Site, a federal nuclear complex that employs more than 10,000 workers directly. Fort Eisenhower, renamed from Fort Gordon in 2023, hosts the headquarters of US Army Cyber Command. Augusta University Medical Center is a major regional employer. These are stable, salaried, federal and quasi-federal jobs, exactly the kind of borrower base that a community bank loves to underwrite.

Security Federal operates across Aiken, Lexington, Richland, and Saluda counties in South Carolina and into Columbia and Richmond counties in the Augusta metro. That footprint puts the bank directly in the path of population growth on both sides of the state line. Its newest offices are in Augusta (2019 and 2023) and Columbia (2022). The strategic logic is clear: the bank is growing because its market is growing.

The numbers are improving. In the first half of 2026, the bank's FDIC call report shows a 0.86% return on assets, up from 0.65% a year earlier, a 3.30% net interest margin, up from 3.02%, and an efficiency ratio of 70.44%, down from 75.35%. The holding company's second-quarter earnings were up about 55% year over year. That is real progress, mostly from the rate rebound in the title. But community banks with efficiency ratios below 60% are generally considered well-run on the cost side. At 70.44%, Security Federal is still leaving margin on the table somewhere in its operations. Finding where is the interesting question.

:::stat
**70.44%**
Security Federal's efficiency ratio in the first half of 2026, down from 75.35% a year earlier but still above the community bank benchmark of below 60% for well-run operations on the cost side.
:::

## The CDFI Charter Creates a Document Problem Nobody Talks About

Here is the part that rarely makes it into analyst commentary on community banks with CDFI designations. Serving LMI borrowers, first-time homebuyers, and underbanked households is genuinely good mission work. It is also, operationally, much harder than conventional mortgage lending.

A W-2 employee with two years at the same employer is a simple file. Two pay stubs, one employer verification call, done. The borrowers Security Federal is explicitly chartered to serve often look nothing like that. Gig workers. Seasonal laborers. Self-employed applicants with Schedule C income that requires two years of tax returns, a year-to-date profit and loss statement, and sometimes a CPA letter. Households with multiple part-time jobs. Federal contractors on short-term assignments who technically have stable income but unconventional documentation.

For these files, manual document collection can run two to three times longer than a conventional loan. That is not an exaggeration. It is a structural reality of CDFI lending.

:::pullquote
For these files, manual document collection can run two to three times longer than a conventional loan.
:::

A processor chasing a self-employed borrower's bank statements across three institutions, waiting on employer callbacks, and manually keying income figures into the LOS is burning hours that do not show up in a single line item on the income statement. They show up as a collectively elevated efficiency ratio.

Security Federal's mortgage portal runs on ICE Mortgage Technology's Encompass Consumer Connect. That is a meaningful fact. ICE is a modern, integration-ready platform. Borrowers can apply online. The front-end infrastructure works. What the portal's public pages did not show as of October 2026 is any open banking income or asset verification, no Plaid, no Finicity, no Day 1 Certainty or equivalent program, no automated verification of income, employment, or assets at the point of application. None of it.

That gap means the back half of every mortgage file is still manual. The borrower submits an application digitally, and then a human processor begins making calls and sending document requests. For a conventional borrower, that friction is an annoyance. For the CDFI borrower with complex income, it can add one to three weeks to the closing timeline and occasionally costs the bank the deal when a seller accepts a competing offer from a buyer with a faster lender.

## The ICE Stack Is Ready. The Verification Layer Is Not.

Security Federal has done the hard part of technology adoption. Running a modern LOS like ICE is not trivial for a 19-branch community bank. The integration work, the staff training, the process redesign around a digital origination workflow: that investment is real and it is done.

What sits between that investment and a meaningfully better efficiency ratio is the verification layer. Automated VOI, [VOE](/glossary/verification-of-employment), and VOA, verification of income, employment, and assets, pulled directly from payroll providers and financial institutions at the point of application, before a processor ever touches the file. This is not a rip-and-replace conversation. The LOS stays. The workflow stays. What changes is that the document-chasing step, historically the most time-consuming part of processing a complex CDFI borrower file, gets compressed from days to minutes.

Consider the math at a high level. If Security Federal's loan processors average even 30 minutes per file on manual verification tasks for straightforward borrowers, and two to four hours on complex CDFI files that represent a significant share of their volume, and if automated verification eliminates 80% of that time: the same team handles meaningfully more files per month. No new hires. No expanded branches ahead of the market demand.

For a bank that keeps adding offices in Augusta and Columbia, processing capacity is a real constraint. More branches generate more applications. If the back-office staffing model does not scale with origination volume, cycle times lengthen, loan officers get frustrated, and borrowers go elsewhere. A 70.44% efficiency ratio does not give the bank much cushion to hire its way out of that problem.

The borrower profile makes this even more important. Security Federal's LMI and first-time buyer customers are often choosing between multiple lenders, not because they have great credit and lots of options, but because mission-driven lenders like credit unions and CDFIs are all competing for the same customer segment. Speed of closing is a real competitive factor. A borrower who gets to clear-to-close in 18 days wins the house. A borrower whose file sits in manual review for 35 days often does not.

That competitive reality is not abstract. In a market where Aiken County is adding thousands of new residents per year, many of them federal workers and retirees on fixed incomes who qualify for CDFI programs, the bank that closes fastest builds the referral network fastest. Realtors remember which lenders perform. Builders remember which lenders close on time. Word travels fast in a 19-branch footprint.

## What Faster Verification Means for This Market

Security Federal is not a bank that needs a strategy reset. The market is right, the charter is right, the mission is legitimate, and the LOS infrastructure is modern. The opportunity sitting in front of this bank is operational, not strategic.

:::pullquote
Security Federal is not a bank that needs a strategy reset. The opportunity sitting in front of this bank is operational, not strategic.
:::

The rate rebound has already taken the efficiency ratio from 75% to 70%. The next five points have to come from operations, and the processing hours spent on complex files are the most obvious place to look. Every point of efficiency ratio is real earnings capacity, either returned to shareholders or reinvested in the branch growth the bank is already pursuing.

The Aiken-Augusta-Columbia corridor is going to keep growing. Federal employment at Savannah River Site is stable. Army Cyber Command is headquartered at Fort Eisenhower. Remote workers and retirees are not stopping their migration southward. The bank that builds the fastest, most reliable borrower intake process in this market, one that handles the complexity of a CDFI borrower file without making the borrower wait four extra weeks, will compound the referral advantages that community banks live on.

Open banking verification infrastructure is no longer experimental. It is production-grade, it connects to the income and asset sources that CDFI borrowers actually use, and it fits inside the LOS workflows that Security Federal already operates. The question is not whether this technology works. The question is which lender in the Aiken-Augusta corridor gets there first.
`,
  },
  'ccnb-myrtle-beach-merger-growth-2026': {
    title: "CCNB's $2.3B Merger Bet on SC's Fastest-Growing Coast",
    description: "CCNB grew from a 2009 de novo to a $1.35B bank on one of the fastest-growing coasts in the US. On October 1 it closed a merger of equals with Beacon, creating a $2.3B franchise that converts systems and rebrands in March 2027. The clock is running.",
    publishedDate: 'May 14, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `# CCNB's $2.3B Merger Bet on SC's Fastest-Growing Coast

*Published May 14, 2026*

Here is the counterintuitive fact about Coastal Carolina National Bank: it was founded in June 2009, right in the teeth of the financial crisis, in a coastal resort market that was getting crushed by falling vacation-property values and tourist spending collapse. Most community banking veterans would have called that timing suicidal. Seventeen years later, CCNB had grown to $1.35 billion in assets by June 30, 2026, and on October 1 it closed a merger of equals with Beacon Holding Company that created a roughly $2.3 billion South Carolina franchise. Bad timing turned out to be very good timing.

:::pullquote
Bad timing turned out to be very good timing.
:::

The market context matters here. Myrtle Beach is not a typical community bank territory. The Myrtle Beach-Conway-North Myrtle Beach MSA grew 3.8% in 2024, making it the third fastest-growing metro in the country. Horry County ranked 10th nationally for domestic in-migration in the July 2022-2023 period. That growth is not driven by young families chasing starter homes. CCNB's own HMDA 2024 data shows the dominant income band among its mortgage borrowers was $250,000-plus, with $150,000 to $250,000 running a close second. Average mortgage loan size was $342,000. This is a move-up and retirement-community buyer profile, retirees and remote workers relocating from the Northeast and Midwest who arrive with complex income documentation and meaningful purchasing power.

## How a De Novo Becomes a Regional Franchise

CCNB did not stay put on the strand. Before the merger it held 10 branches across Horry, Georgetown, Richland, Aiken, Orangeburg, Greenville, Spartanburg, and Brunswick (NC) counties, expanding deliberately into SC's interior population-growth corridors rather than just stacking up presence along the coast. The inland pivot into Columbia, Aiken, Greenville, and Spartanburg gives the bank exposure to markets that are less weather-dependent and less seasonal than a pure coastal book.

The financials back the strategy. In the first half of 2026, the bank's FDIC call report shows a 3.60% net interest margin, a 1.05% return on assets, and a 59.17% efficiency ratio, down from 61.78% a year earlier. That is real operating leverage. Net income for the half was $6.82 million, up 26% from $5.41 million. Net loans grew 12% in the year to $977 million, concentrated in non-owner occupied commercial real estate and 1-4 family residential, and noncurrent loans stood at zero on June 30. For a bank that originated through a credit crisis and scaled through a pandemic, the credit quality is notable.

:::stat
**$6.82 million**
CCNB's net income for the first half of 2026, up 26% year over year, from a bank founded during the worst financial crisis in a generation.
:::

The mortgage product mix tells you something about positioning. CCNB markets condotel loans, bridge loans, lot loans, and portfolio ARM structures. These are loan types that the big banks either won't touch or make borrowers fight for. The "We Can Do That" tagline is not just marketing copy; it reflects a deliberate credit philosophy. Condotel and portfolio ARM borrowers in coastal SC frequently have self-employment income, rental income streams, or asset-heavy financial profiles that do not fit cleanly into agency underwriting boxes. That complexity is a feature of the franchise, not a bug. It is also operationally demanding.

## The Merger Window Is the Moment That Matters

Now comes the interesting part. CCNB announced a merger of equals with Beacon Holding Company on May 29, 2026 and closed it on October 1. The combined company reports about $2.3 billion in assets, $2.0 billion in deposits and $1.8 billion in loans across 16 branches and a loan production office. Beacon's six Charleston-area branches operate for now as Beacon Community Bank, a division of Coastal Carolina National Bank. Core systems convert in early 2027, and the whole bank rebrands as Beacon Bank, N.A. in mid-March 2027.

Every bank executive who has lived through a merger of equals knows what the months between legal close and conversion look like. Two loan origination environments. Two sets of workflows. Two underwriting teams with different document checklists and process habits. The compliance and integration workload is enormous, and the temptation is to defer process rationalization until after conversion. That is exactly the wrong approach.

The banks that come out of a merger conversion in good shape are the ones that standardized their critical workflows before the new core went live, not after. Verification is the highest-friction point in any residential mortgage workflow: income verification, employment confirmation, asset documentation. Getting those steps consistent across both legacy environments before the 2027 cutover is not a nice-to-have. It is the difference between a smooth go-live and a retraining cycle that costs money and borrower goodwill simultaneously. With roughly five months between legal close and the March rebrand, the merger window is the right moment to fix that.

## Serving 7,000 New Households a Year

Horry County is adding roughly 7,000 net new households per year. Those are not hypothetical future borrowers. They are buyers who are actively in contract or about to be, many of them relocating from out of state, many of them carrying complex income documentation. W-2s from a prior-state employer. Self-employment income from a remote business. Retirement distributions. Rental income from a property they are selling back home.

Manual verification of a file like that takes time. Time kills purchase contracts. In a coastal market where buyers are comparing multiple lenders simultaneously, a 48-hour difference in turnaround is meaningful. CCNB's HMDA borrower profile sits exactly in the $150,000-plus income band where these documentation patterns are most common. The borrower is financially strong; the paperwork is complicated. That is precisely the gap where automated income and employment verification earns its keep.

Speed is not just a customer service issue in a 3.8%-growth market. It is a competitive moat.

:::pullquote
Speed is not just a customer service issue in a 3.8%-growth market. It is a competitive moat.
:::

CCNB competes with regional banks, credit unions, and mortgage companies that all want the same high-income relocating buyer. The bank has already differentiated on product flexibility. Operational speed is the logical next layer. A lender that can confirm income and employment in hours instead of days, and hand the borrower a clear-to-close without a document chase, wins repeat business and referrals from the real estate community in a market that runs on relationships.

The digital picture today shows room to grow. As of October 2026, CCNB's online mortgage application routes to a third-party portal at myccnb.mymortgage-online.com. The website discloses no automated income or asset verification capability, no digital appraisal ordering, no eClosing integration. The bank has Zelle and IntraFi. That is a reasonable fintech footprint for a community bank, but it stops well short of a modern origination workflow.

None of that is unusual for a community bank that reached $1.35 billion on credit judgment and product flexibility rather than technology investment. The question for the months before the 2027 conversion is whether the merger changes the calculus. Standardizing workflows before a core conversion is expensive and disruptive if done wrong. It is a clean implementation win if done right, at the right moment, with the right partner.

## What Digital Borrower Intake Could Mean for This Franchise

CCNB's core competitive advantage is saying yes to borrowers that larger institutions turn away, condotel buyers, bridge borrowers, self-employed coastal investors. That credit flexibility is valuable. But flexibility without speed leaves money on the table in a market adding thousands of households per year. A borrower who qualifies for a condotel loan and a conventional purchase simultaneously will sign with the lender that delivers the clear-to-close first.

The banks that are winning in high-growth coastal markets in 2026 are not winning on rate alone. Rate is visible to every borrower who has ever typed into a mortgage comparison site. They are winning on certainty and speed: the borrower knows quickly whether they are approved, what the terms are, and when they can close. Automated income, employment, and asset verification is the infrastructure layer that makes that certainty possible at scale. For a franchise that will be processing applications across two legacy systems through a merger transition, getting verification right before the 2027 conversion is not just an efficiency question. It is a question of whether CCNB can carry the "We Can Do That" brand promise into a $2.3 billion institution without operational drag slowing it down at the exact moment the market is accelerating around it.
`,
  },
  'first-capital-bank-charleston-growth-digital-gap': {
    title: 'First Capital Bank Hit $1B. Can It Keep Growing Without Going Digital?',
    description: "First Capital Bank grew from $1.05 billion to $1.32 billion in assets in the year to June 2026, in a metro adding 17,500 residents a year, with no online loan application. Why its phone-and-email intake is a bet that gets harder to win as Charleston grows.",
    publishedDate: 'May 7, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `# First Capital Bank Hit $1B. Can It Keep Growing Without Going Digital?

*Published May 7, 2026*

Here is the surprising part: First Capital Bank operates four branches, crossed $1 billion in assets in Q1 2025, and reached $1.32 billion by June 30, 2026. That is $266 million of growth, 25%, in the twelve months to Q2 2026. In one of the hottest real estate markets on the East Coast. With no online loan application on its public website.

Not a limited one. Not a soft-launch beta. None. Every mortgage inquiry routes to an email address or a phone number.

That tells you something important about how Charleston, South Carolina's community bank landscape actually works, and about how long that dynamic can hold.

---

## A $1.32B Bank in a Market That Added 70,000 People

The Charleston-North Charleston MSA is not a sleepy Southern coastal market anymore. The tri-county area covering Charleston, Berkeley, and Dorchester counties has grown nearly 9% since 2020. Berkeley County alone grew 3.2% in 2024, ranking 61st nationally among all US counties by growth rate. The region is projected to reach 1 million residents by 2032. That is roughly 17,500 new arrivals per year, sustained, for the better part of a decade.

First Capital Bank is headquartered at 304 Meeting St in downtown Charleston, founded in September 1999, and structured as a wholly owned subsidiary of First Capital Bancshares, Inc. (OTCQX: FCPB). The bank's loan portfolio reflects exactly what you would expect in this market. At June 30, 2026 it held $461 million in one-to-four family residential loans, $356 million in nonfarm commercial real estate, $95 million in construction, $82 million in multifamily, and $92 million in C&I. Commercial credits together are about 58% of $1.08 billion in net loans.

The bank has made smart strategic moves recently. It agreed in May 2025 to sell its Laurinburg, NC branch to The Citizens Bank, leaving three offices in the Charleston area (downtown, Mount Pleasant and Summerville) and one in Pinehurst, NC. It added a Lowcountry Market President, Andy Thomas, in February 2025. Joseph Kassim was appointed CEO in 2024, and Tradd Rodenberg was promoted to President in November 2025. New leadership, tighter geographic focus, $1.32B in assets, and a 1.14% ROA that most community banks would be envious of, up from 0.88% a year earlier.

The financials are genuinely strong. A net interest margin of 3.47% is healthy in the current rate environment. An efficiency ratio of 53.34% means the bank is keeping operating costs at roughly 53 cents for every dollar of revenue, down from nearly 60 cents a year earlier and well below the 60-plus percent that many peers are running. Three Charleston-area branches serving a metro of nearly 900,000 people means this bank is doing a lot with a little.

:::stat
**53.34%**
First Capital Bank's Q2 2026 efficiency ratio: roughly 53 cents of operating cost per dollar of revenue, down from 59.8% a year earlier, with three branches serving a metro of nearly 900,000 people.
:::

So the question is not whether First Capital Bank is well-run. It clearly is. The question is whether the intake model that got it to $1.32B is the same one that gets it to $2B.

:::pullquote
The question is not whether First Capital Bank is well-run. It clearly is. The question is whether the intake model that got it to $1.32B is the same one that gets it to $2B.
:::

---

## Every Loan Starts With a Phone Call

Mortgage applicants visiting bankwithfirstcapital.com are directed to email ConsumerLending@bankwithfirstcapital.com or call (843) 990-7770. There is no digital document upload. No e-signature workflow. No borrower portal. As of October 2026 the loans page still tells mortgage applicants to contact a lender at that address or number to apply.

This is a traditional staffing model operating in a high-velocity market. That combination creates friction at exactly the wrong moment.

Charleston's growth is not driven by locals trading up. It is driven by in-migration: professionals relocating from Atlanta, Charlotte, Northern Virginia, and further afield, many of them employed by tech and aerospace firms that have set up in the region, or by Joint Base Charleston's military-affiliated household base. These borrowers have out-of-market employers, sometimes variable income structures, recent job changes, and financial histories distributed across banks in other states. They are comparing three lenders simultaneously on a Saturday afternoon from a laptop, and they are not waiting two days for a callback.

A loan processor manually chasing paystubs from Workday or ADP instances they have never seen, calling out-of-state HR departments, and waiting on paper bank statements from distant depositories can easily burn two to three weeks just on document assembly. That is not a staffing problem. It is a structural limitation of the intake model.

Commercial lending has the same issue, amplified. A $3 million CRE deal requires business tax returns, rent rolls, entity verification, bank statements, and personal financial statements from every guarantor. When all of that flows through email and courier, the diligence phase alone can take three weeks. For a bank with $356 million in nonfarm commercial real estate and $95 million in construction loans already on the book and a market that is actively building, faster diligence is not a nice-to-have. It is how you close more deals per lender per quarter.

The bank's 53.34% efficiency ratio shows it is running lean. The risk is that lean headcount plus manual intake creates a ceiling on origination volume that looks fine until the market accelerates past it.

---

## What Digital Intake Actually Changes

The specific bottleneck is file assembly, not underwriting judgment. Experienced loan officers at community banks are good at credit decisions. What slows them down is waiting for documents.

Direct connections to payroll providers (ADP, Workday, Gusto), financial data aggregators, and IRS transcript retrieval can compress the document-gathering phase from weeks to hours. A borrower connects their bank accounts, authorizes a payroll pull, and the loan officer has verified income and employment before the first substantive conversation. For a relocating borrower with a non-local employer, that verification is just as fast as for someone who has banked locally for twenty years.

For commercial deals, automated business financial pulls from accounting integrations and parallel identity verification for multiple guarantors cut the back-and-forth that drags out CRE timelines. The underwriting still requires a human. The paper chase does not.

First Capital's four-branch model is actually well-suited for this kind of upgrade. The bank is not trying to integrate digital intake across 40 locations with inconsistent workflows. It has a small, coherent operation with new leadership that has already shown willingness to make structural changes: divesting a branch, adding a market president, sharpening the geographic focus. Those are not the moves of an institution opposed to change.

The 3.47% NIM and 1.14% ROA give the bank financial room to invest. The 53.34% efficiency ratio means it is not under cost pressure that would crowd out any new spend. And the market is handing it a growth opportunity that most community banks would not encounter in a generation: a metro adding nearly 70,000 residents over five years, with a loan book already weighted toward exactly the asset classes that market demands.

---

## The Window Is Still Open, But Not Indefinitely

Regional banks and non-bank lenders with digital-native workflows are not ignoring Charleston. They see the same census numbers. They have pre-built borrower portals, automated income verification, and marketing funnels targeting relocating professionals by zip code. The in-migration borrowers who are hardest to verify manually are exactly the ones those competitors are built to serve quickly.

First Capital's competitive advantage right now is local relationships, local knowledge, and a reputation built over 25 years in the Charleston market. That is real. It matters. But relationship banking has always operated alongside process banking, and when the process gap gets wide enough, even strong relationships lose deals to faster closings.

:::pullquote
Relationship banking has always operated alongside process banking, and when the process gap gets wide enough, even strong relationships lose deals to faster closings.
:::

The bank that figured out how to pair its local credibility with a borrower intake process as fast as a fintech's could own the new-resident segment in a market projected to grow for another decade. For a four-branch community bank with a clean balance sheet and sharp new leadership, that combination is more achievable than it might look from the outside. The question is how long the current model holds before the growth rate of the market outpaces the capacity of a manual workflow to keep up.
`,
  },
  'first-community-bank-sc-cre-merger-growth': {
    title: 'First Community Bank SC: A $2.4B Bank, a Georgia Deal and a New CEO',
    description: "First Community Bank of Lexington, SC closed its acquisition of Signature Bank of Georgia in January 2026, reached $2.38 billion in assets and grew second-quarter earnings 46%. Its bank CEO retires at year-end. What the numbers show, and what the next leadership team inherits.",
    publishedDate: 'April 30, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '5 min read',
    content: `
*Updated October 22, 2026, with second-quarter 2026 results, the completed Signature Bank of Georgia acquisition and the bank's leadership transition. An earlier version of this article misidentified the merger partner and understated the bank's size.*

First Community Bank of Lexington, South Carolina, has spent 2026 doing three things at once: absorbing an acquisition, posting its best earnings in years and planning a change at the top.

On January 8, 2026, it closed its purchase of Signature Bank of Georgia, a two-office bank in Sandy Springs with about $274 million in assets. In July, it reported second-quarter net income up 46.5% from a year earlier. The same day, it announced that J. Ted Nissen, CEO and president of the bank, will retire on December 31, 2026.

## The Deal

First Community Corporation (Nasdaq: FCCO) announced the Signature acquisition on July 14, 2025, in an all-stock deal valued at about $41.6 million, or about $50 million at year-end 2025 prices. Signature brought $229.8 million in deposits, $195.7 million in loans, SBA and USDA lending, and a foothold in the Atlanta metro.

The systems conversion was completed in mid-March. Merger expenses fell from $1.6 million in the first quarter to $503,000 in the second.

The bank now runs 23 offices. Twenty are in South Carolina: six in Lexington County, four in Richland, three in Greenville, two in Newberry, and one each in Aiken, Anderson, Kershaw, Pickens and York counties. Three are in Georgia: Sandy Springs, Augusta and Columbia County.

## The Numbers

From the company's second-quarter release and the bank's June 30 call report:

- **Total assets:** $2.38 billion, up from $2.05 billion a year earlier (bank level, FDIC)
- **Loans:** $1.58 billion, with organic growth of 11% annualized in the first half
- **Deposits:** $2.03 billion
- **Q2 net income:** $7.6 million, up 46.5%; first-half net income $13.1 million, up 42.6%
- **Net interest margin:** 3.51%, the ninth straight quarter of expansion
- **Efficiency ratio:** 58.8% in Q2, down from 66.0% in Q1
- **Nonperforming assets:** 0.04% of total assets

:::stat
**0.04%**
First Community's nonperforming assets as a share of total assets at June 30, 2026, per the company's second-quarter release.
:::

Fee businesses are growing too. Investment advisory revenue rose 30.6% from a year earlier, and assets under management reached $1.38 billion. Mortgage banking income rose 21.7%.

## A Commercial Real Estate Bank

First Community is, by its loan book, a commercial real estate lender. Of $1.59 billion in gross loans at June 30, 2026:

- Nonfarm, nonresidential real estate: $906 million (57%), of which $371 million is owner-occupied and $535 million is not
- One-to-four family residential: $337 million
- Construction and land: $167 million
- Commercial and industrial: $90 million
- Multifamily: $48 million

Investor real estate, meaning non-owner-occupied commercial property, multifamily and construction, comes to about $750 million, or 47% of loans. That is a concentration regulators watch. So far, credit has been clean: second-quarter net charge-offs were $21,000.

## The Leadership Change

The transition splits one job into two. Effective January 1, 2027, Vaughan R. Dozier becomes CEO of the bank and Joseph A. "Drew" Painter becomes president. Both now serve as co-commercial and retail banking officers, and both join the company and bank boards. Michael Crapps remains CEO and president of the holding company, focused on strategy, capital and investor relations. Nissen will consult through 2027.

The chairman said Nissen is leaving earlier than planned for personal health reasons.

## What the Next Team Inherits

A new bank CEO inherits a bank in good shape: a widening margin, clean credit, a finished conversion and two growing fee businesses. The open question is how First Community brings in new borrowers in its newest markets.

The bank moved its website to firstcommunitybankers.com this year. Its online lending paths, as of October 2026:

- **Mortgage:** an "Apply Online" button that hands off to a separate mortgage portal, with rates listed as "Call for Rates"
- **Consumer loans, HELOCs and auto loans:** a "Request a Loan" contact form
- **Business loans and commercial real estate:** the same contact form

In Lexington and Columbia, where the bank has three decades of relationships, a contact form works because the borrower often already knows a banker. In Sandy Springs and Augusta, a new borrower comparing banks online sees a form and a wait.

A commercial book this concentrated in real estate also means heavy files: entity documents, tax returns, rent rolls and personal financial statements for every guarantor. Collecting and checking those documents at the start of the application, rather than through rounds of follow-up, is where the next efficiency gains are. The margin has done most of the work so far. Throughput has to do the rest.
    `,
  },
  'countybank-greenwood-sc-sba-deep-dive': {
    title: 'Countybank Is From Greenwood. Its Mortgage Business Lives in Greenville',
    description: "Countybank has banked Greenwood, SC since 1933, but its 2025 HMDA data shows more home loans in Greenville County than at home, and mortgage sale gains are its biggest fee line. A look at a $733 million bank that earns like a mortgage company, and what that means for its other loans.",
    publishedDate: 'April 23, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '5 min read',
    content: `
*Updated October 22, 2026, with second-quarter 2026 call report and 2025 HMDA data. An earlier version of this article overstated Countybank's size and efficiency and described an SBA focus that public data does not support.*

Countybank has been in Greenwood, South Carolina since 1933. Seven of its 13 offices are in Greenwood County.

Its mortgage business tells a different story. In 2025, Countybank originated 196 home loans in Greenville County, 74 in Greenwood County and 53 in Anderson County, according to its HMDA filing. The bank's growth market is an hour up the road.

## A Bank That Earns Like a Mortgage Company

Countybank held $733 million in assets and $623 million in deposits at June 30, 2026, with 169 full-time-equivalent employees. Its first half of 2026, from the FDIC call report:

- **Net income:** $5.4 million, up 30% from $4.1 million a year earlier
- **Return on assets:** 1.45%
- **Return on equity:** 23.1%
- **Net interest margin:** 3.85%, up from 3.59%
- **Efficiency ratio:** 75.9%, down from 78.3%

Those last two lines look like they disagree. A 75.9% efficiency ratio usually means a bank is struggling. Here it doesn't, because of where the revenue comes from.

In the first half of 2026, Countybank earned $13.3 million in net interest income and $10.1 million in noninterest income. Fees made up 43% of revenue, far more than at most community banks. The largest single piece was $3.9 million in gains on loan sales, up 47% from a year earlier. Trust and fiduciary income added $1.1 million.

:::stat
**43%**
Share of Countybank's first-half 2026 revenue that came from noninterest income, led by $3.9 million in gains on loan sales.
:::

A mortgage operation runs on people: loan officers, processors and underwriters. Salaries and benefits were $11.6 million of $17.8 million in noninterest expense. That is why the efficiency ratio is high and returns are still strong. The 23% return on equity also reflects a thin equity base, at 6.2% of assets, though the bank's Tier 1 risk-based capital ratio is a solid 14.8%.

## What 2025 HMDA Shows

Countybank originated 642 home loans totaling $215.9 million in 2025:

- **Purchase:** 489 loans, $166.4 million, averaging about $340,000
- **Refinance:** 78 loans, plus 53 cash-out refinances
- **Home improvement and other:** 22 loans

By loan type: 537 conventional, 73 FHA, 26 VA and 6 USDA. A bank that makes FHA and VA loans at that volume is serving first-time and military buyers, not just existing customers.

On the balance sheet, one-to-four family residential loans are $191 million, 46% of the $411 million loan book. Nonfarm, nonresidential real estate is $160 million. Commercial and industrial loans are $25 million.

## The Front Door

Countybank Mortgage is the most developed part of the bank's digital presence. It has an on-domain "Apply Now" path and its own mobile app, and underwriting is in-house.

The rest of the lending menu, as of October 2026:

- **Auto loans:** an "Apply Now" button that opens a multi-tab application (employment, marital status, assets and debts). Nothing is verified. A representative follows up within one business day.
- **HELOC and the Instant Cash Line of Credit:** product pages with "Contact Us" and "Questions" links
- **Business loans and lines of credit:** an inquiry form, with a callback promised within one business day

The auto application already collects employment and asset information. It just doesn't verify any of it. The borrower types it in, and a representative calls to start collecting the documents that prove it.

## What the Mortgage Model Proves

Countybank has already shown it can win borrowers outside its home county when it gives them a real application. Its mortgage team does it every year in Greenville and Anderson.

The question is whether its other loans can travel the same way. A Greenville homeowner who got a mortgage from Countybank and later wants a home equity line or an auto loan meets a contact form. A Greenville business owner meets an inquiry form.

The mortgage operation shows the formula: an application a borrower can finish without a phone call, and a team that can process the result. Extending that to home equity and consumer lending, with income and assets verified as the borrower applies, is how a Greenwood bank keeps the Greenville customers its mortgage team already found.
    `,
  },
  'optus-bank-cdfi-columbia-growth': {
    title: 'Optus Bank Grew From $65 Million to $764 Million. Now Comes M&F',
    description: "Optus Bank grew from $65 million in assets in 2018 to $764 million in mid-2026, and in July agreed to merge with Durham's M&F Bank to form a $1.27 billion CDFI. What drove the growth, what the bank actually lends, and what the merger has to get right.",
    publishedDate: 'April 16, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '5 min read',
    content: `
*Updated October 22, 2026, with second-quarter 2026 call report data and the M&F Bancorp merger. An earlier version of this article understated Optus Bank's size.*

At the end of 2018, Optus Bank had $65 million in assets. On June 30, 2026, it had $764 million. Few banks in the country have grown that fast without buying another bank.

Now Optus is buying one. In July 2026, Optus Financial Corporation agreed to acquire M&F Bancorp, the Durham, North Carolina parent of M&F Bank, in a deal valued at more than $105 million. The combined bank would have about $1.27 billion in assets, and its owners describe it as the largest African American-owned financial institution in the country.

## From Victory Savings to $764 Million

Optus traces its roots to Victory Savings Bank, founded in Columbia in 1921 by African American community leaders. It is South Carolina's only Black-owned bank and a Treasury-certified community development financial institution (CDFI).

Year-end total assets, from FDIC call reports:

- 2018: $65 million
- 2019: $78 million
- 2020: $187 million
- 2021: $315 million
- 2022: $405 million
- 2023: $525 million
- 2024: $663 million
- 2025: $778 million

:::stat
**$65M to $764M**
Optus Bank's total assets, year-end 2018 to June 30, 2026, per FDIC call reports.
:::

The jump started in 2020, when large companies moved deposits and capital into Black-owned banks. Optus was the first bank to receive funds from PayPal's $530 million commitment to Black and minority-owned businesses: a $50 million deposit. About $10 million of it went straight into Paycheck Protection Program loans. Bank of America was already a depositor. In 2021, seven outside investors, including Citigroup, Wells Fargo, JPMorgan Chase and Bank of America, put more than $20 million of capital into the bank.

Capital kept pace with the deposits. Equity grew from $6.5 million at the end of 2018 to $98 million in mid-2026, and the Tier 1 risk-based capital ratio stood at 19.5%.

## What Optus Actually Lends

Optus is a commercial lender. Of $456 million in gross loans at June 30, 2026:

- Nonfarm, nonresidential real estate: $198 million
- Commercial and industrial: $147 million
- Construction and land: $53 million
- Consumer: $24 million
- Multifamily: $19 million
- One-to-four family residential: $14 million

Residential mortgages are about 3% of the book, and Optus does not appear on the federal HMDA filer lists for 2024 or 2025. The growth went into small business and commercial real estate lending, the core of its CDFI mission.

The bank runs lean: 46 full-time-equivalent employees for $764 million in assets, about $16.6 million per employee.

## The 2026 Numbers

First half of 2026, from the June 30 call report:

- Net income: $3.7 million, up from $3.6 million a year earlier
- Return on assets: 0.95%; return on equity: 7.6%
- Efficiency ratio: 55.8%
- Net interest margin: 2.71%, down from 3.64% for 2023
- Net charge-offs: 0.94% of loans, annualized

The margin is the pressure point. Deposits that arrived on mission grounds still have to be paid market rates, and the margin has narrowed each year since 2023. That is one reason scale matters to the merger.

## The M&F Deal

M&F Bank, one of the oldest Black-owned banks in the country, had about $518 million in assets at March 31, 2026, according to American Banker. Under the agreement announced July 22, 2026:

- M&F Bancorp merges into Optus Financial, and M&F Bank into Optus Bank
- The combined bank operates 10 branches, eight of them current M&F branches in North Carolina
- James H. Sills III, M&F's president and CEO, becomes CEO of the combined company and bank; Optus chairman Paul Mitchell remains chairman
- Headquarters stay in Columbia, and the bank keeps its CDFI designation
- The M&F name phases out in favor of Optus over about two years
- Closing is expected in the fourth quarter of 2026, subject to M&F shareholder and regulatory approval

Sills put the logic plainly: "We'll be able to do larger loans. We'll be able to accept larger deposits."

## What the Merger Has to Get Right

Bank mergers are where technology decisions get made for the next decade. Two banks with different systems have to become one, and the borrower-facing pieces are usually decided last.

Today, almost all of Optus's lending starts with a conversation. Its consumer and business loan pages list products and a phone number, 803.733.8100, with no online application. New accounts start with a form and a follow-up call within 24 to 48 hours.

That model built a $764 million bank with 46 people. Spread across two states and 10 branches, it gets harder. A CDFI's borrowers are also the hardest files to document: a small business owner with uneven revenue, a household with a part-time W-2 job and self-employment income, a first-time borrower with a thin credit file. Each takes several documents from several sources, and collecting them by hand is where loan officers' time goes.

The merger gives the combined bank the size to make larger loans. A loan application that collects and verifies income and business data at the start would let the same team handle more of them.
    `,
  },
  'beacon-community-bank-charleston-growth-capacity': {
    title: 'Beacon Community Bank: Growth at the Edge of Capacity',
    description: "Beacon Community Bank grew from $36M to $972M in assets in seven years without building a digital front door. In a market adding 8,500 households a year, a 404 mortgage page is a strategy problem, not a website bug.",
    publishedDate: 'April 9, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `
*Update, October 22, 2026: Beacon is no longer independent. Beacon Holding Company closed a merger of equals with Coastal Carolina National Bank (CCNB) on October 1, 2026. The combined bank has about $2.3 billion in assets across 16 branches and a loan production office. Beacon's six Charleston-area branches operate for now as Beacon Community Bank, a division of CCNB. Core systems convert in early 2027, and the combined bank takes the name Beacon Bank, N.A. in mid-March 2027. [Our analysis of the merger](/blog/ccnb-myrtle-beach-merger-growth-2026) covers what comes next. The figures below are as of the original April 2026 publication, with the bank's net interest margin, efficiency ratio, loan growth and branch locations in the original April 2026 text.*

Beacon Community Bank started 2018 with $36 million in assets. Seven years later it sits at $972 million, and its mortgage application page returns a 404 error.

That single fact explains more about where this bank is headed than any line on the balance sheet.

## A Balance Sheet That Outgrew Its Intake

The numbers are real. Net loans climbed from $788 million in mid-2025 to $848 million by March 2026, about $20 million of net growth a quarter, with new originations running above that to replace payoffs. The bank's ROA improved from 0.38% for full-year 2025 to 0.52% annualized through Q1 2026. Net interest margin was 2.58% for 2025 and 2.52% in the first quarter of 2026, well below the community bank average of roughly 3.36%.

Six branches. One relationship-driven model.

The loan book is growing at roughly 10% annually, but the origination infrastructure still runs on phone calls.

That is not a sustainable combination.

At the current pace, loan officers at Beacon's six Charleston-area locations are processing a rising volume of mortgage and commercial files with no automated income verification, no employment verification tools, and no borrower self-service intake. Every new application begins with a call to 843-936-5100. Every document arrives via email or fax. Every income check involves a human chasing a pay stub or dialing an HR department.

This is the throughput ceiling. It is not visible on the call report yet. But as the loan book keeps growing, it is coming.

:::stat
**$848 million**
Beacon's net loans at March 31, 2026, up from $788 million nine months earlier.
:::

## The Borrower Profile Beacon Is Facing

Mount Pleasant is not a typical community bank market. It is the fourth-largest city in South Carolina and part of the Charleston-North Charleston MSA, one of the fastest-growing metro areas in the country. The Charleston MSA added nearly 70,000 residents between 2020 and 2024, growing close to 9% in four years. The region is adding an estimated 8,500 new households per year.

The people arriving are not simple borrowers.

A significant portion of new Charleston-area residents are transplants from the Northeast: New York, New Jersey, Massachusetts. They carry remote-work compensation packages, equity grants, rental income from properties they no longer live in, or self-employment income. Military personnel rotating through Joint Base Charleston bring base pay plus housing allowance (BAH) plus special duty pay. Retirees relocating from higher-cost markets often have pension income, Social Security, and investment distributions that look nothing like a W-2.

Each of these borrower profiles requires a different verification approach. Manual document collection handles all of them slowly, and some of them incorrectly. The self-employed Charleston entrepreneur whose business income runs through three accounts looks like a problem on paper until someone actually aggregates the cash flow. The remote worker getting paid by a California tech company fails a standard employer call to HR because there is no local office to call.

:::pullquote
The fastest-growing MSA in the Southeast is sending Beacon its most verification-intensive borrowers. Manual processes are the wrong answer for this specific population.
:::

Beacon competes directly against First Citizens, South State Bank, and every major national lender operating in this market. The average home in Mount Pleasant prices well above the South Carolina median. Borrowers at those price points are not forgiving about closing timelines. They shop on speed as much as rate.

## What the Digital Footprint Actually Shows

The missing mortgage page is not a minor website issue. It is a signal about the origination model.

There is no online application on Beacon's site anywhere. Online banking enrollment itself requires a phone call rather than a self-service flow. The bank uses Jack Henry's Banno platform for transactional digital banking, bill pay and mobile deposit, but there is no evidence of any integrated loan origination, income verification, or identity verification tooling connected to it. The commercial banking page also returns a 404.

No fintech partner integrations appear anywhere: no Plaid, no Finicity, no Truework, no Work Number connectivity. There are no job postings for digital mortgage, LOS, or verification technology roles, which suggests this is not a gap the bank is actively closing. It is structural.

Nothing suggests an ideological opposition to digital tools. The constraint is more likely bandwidth and prioritization than philosophy.

For a bank with a small team of relationship bankers handling an $848 million loan book growing at 10% annually, the math is unforgiving. Cutting borrower verification time from four days to four hours does not just feel better. It is the difference between closing 15 loans a month per officer and closing 22.

## The Capacity Question

The efficiency ratio at Beacon was 70.8% for 2025 and 70.2% in the first quarter of 2026. That is notably above the community bank average of roughly 60-65%. For a bank that has compounded asset growth at more than 50% a year since 2018, some margin compression is expected. Growth costs money.

But efficiency ratios above 70% also mean that every loan that takes three extra days to close because a borrower's income took two days to verify is expensive labor. Ten extra staff hours on a file, multiplied across hundreds of originations a year, becomes material.

The inverse matters too. A borrower-facing verification portal that lets applicants consent and connect their accounts directly eliminates the three-to-five day document-request cycle without removing the banker from the relationship. The officer still reviews the file. The bank still makes a relationship-based credit decision. But the verification report arrives in minutes instead of days, and the borrower has already done most of the work by the time the officer calls.

That is the specific workflow improvement that scales without adding headcount.

## What the Charleston Migration Wave Means Long-Term

The Charleston MSA is not slowing down. The migration drivers, coastal lifestyle, military presence, lower cost than Northeast metros, a genuine job market across healthcare, aerospace, and technology, are structural rather than cyclical. Beaufort County next door was one of the fastest-growing counties in the country by household formation. The Lowcountry's growth story has runway.

Beacon is positioned at the center of that story with a relationship banking model that should win the trust of precisely the affluent transplants who arrive skeptical of megabanks and want a local alternative. The brand positioning is right. The balance sheet is growing. The team is clearly executing.

The question is whether the origination infrastructure can keep pace with the market without either burning out the loan officers or adding headcount faster than revenue supports.

Banks that solve that problem with technology, connecting the right data sources in the right sequence automatically, keep compounding. Banks that solve it with headcount eventually hit a margin wall. The Charleston market is going to deliver borrowers either way. How fast Beacon can turn an application into a closed loan will determine how much of that flow stays in-house versus leaks to lenders who answer with a link instead of a phone number.

:::pullquote
The $972 million balance sheet is the easy part. The next $400 million is where verification speed becomes the product.
:::

The $972 million balance sheet is the easy part. The next $400 million is where verification speed becomes the product.
    `,
  },
  'first-palmetto-bank-sc-performance-deep-dive': {
    title: 'First Palmetto Bank: 120 Years Old, $1B in Assets, Zero Excuses',
    description: 'First Palmetto Bank earned a 1.36% ROA with a 54.8% efficiency ratio in the first half of 2026 across 22 South Carolina offices, while its four Grand Strand branches sit in one of the fastest-growing counties in the state. The performance is real. The manual mortgage workflow is a risk.',
    publishedDate: 'April 2, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `
*Updated October 22, 2026. An earlier version of this article paired the bank's 2025 return on assets with a single quarter's margin and efficiency ratio, overstated its independence, and cited growth figures we could not source. Figures below are corrected and updated through June 30, 2026.*

First Palmetto Bank was founded in 1904. The Wright Brothers had just flown at Kitty Hawk. The Federal Reserve didn't exist yet. And the bank still doesn't have an online mortgage application.

That last fact is the most interesting thing about a $1.10 billion institution that has survived every rate cycle, economic crisis, and competitive wave since Theodore Roosevelt was president.

## A Balance Sheet That Earns Respect

Start with the numbers, because they're genuinely good.

For full-year 2025: return on assets of 1.07%, net interest margin of 3.42%, efficiency ratio of 62.4%. The first half of 2026 was better: ROA of 1.36%, margin of 3.59%, efficiency ratio of 54.8%. Twenty-two offices across 12 South Carolina counties. Named America's Best Bank by Newsweek three consecutive years: 2021, 2022, and 2023.

The efficiency ratio is worth sitting with. In 2025, at 62.4%, First Palmetto sat close to the community bank average. In the first half of 2026 it spent about 55 cents to earn each revenue dollar, a sharp improvement in a single year. That reflects a wider margin, disciplined staffing, a clean loan book, and a management culture that doesn't chase growth it can't underwrite.

:::pullquote
In the first half of 2026, First Palmetto spent about 55 cents to earn each revenue dollar, down from 62 cents in 2025.
:::

The footprint is genuinely diverse. First Palmetto's 22 offices span the Midlands (Camden, Columbia, Lugoff, Lexington), the Lowcountry (Mount Pleasant, Summerville), the Pee Dee (Darlington, Manning, Bishopville), four Grand Strand locations (Myrtle Beach, Surfside Beach, Little River, Loris), and Upstate markets including Greenville. That's five distinct South Carolina economies under one charter. Camden, where the bank is headquartered, is a quiet Midlands city with a manufacturing and agricultural base. Myrtle Beach is a different story entirely.

**The bank has been independent since 1904.** It is owned by a holding company, First Palmetto Financial Corp., and its acquisitions have been small: branches bought from Wachovia and First Union in 1994 and 1995. No private equity backstory. Just 120 years of relationship banking from the same city.

## 511 Mortgages, No Digital Front Door

Here's where the story gets interesting.

First Palmetto originated 511 residential mortgage loans in 2024. Roughly 78% of those were purchase transactions, meaning around 398 borrowers were competing to close on a home in a market where turn-time matters. Every single one of those files moved through a manual intake: a phone call or a contact form to "Find a Mortgage Banker," no embedded application, no automated verification link.

Go to firstpalmetto.com right now. Click on mortgage. You will find a list of Mortgage Bankers and a form to contact one. There is no self-service application portal. There is no fintech partnership disclosed anywhere on the site. The digital offering (mobile deposit, Zelle, Apple Pay, Google Pay) is transactional only.

This is a deliberate model. First Palmetto built its franchise on knowing borrowers personally, making relationship-based credit decisions, and keeping an examiner-clean audit trail. The approach works: the bank's returns are the evidence.

The problem is what the approach costs in competitive markets at volume.

Each of those 511 files required someone on staff to chase pay stubs, W-2s, bank statements, employer confirmations, and IRS transcripts. Across a year, that is thousands of staff hours spent gathering information that already exists in the borrower's bank accounts and payroll records. The information problem is solved. The connection to it isn't.

:::stat
**511**
Residential mortgage loans First Palmetto originated in 2024, per HMDA data, about 78% of them purchase loans.
:::

## The Grand Strand Volume Problem

Four of First Palmetto's 22 offices sit in Horry County.

Horry County had 413,391 residents in 2024, up 17.8% since 2020, according to Census Bureau estimates. That's not a coastal market gently appreciating. That's a market under sustained demographic pressure from people moving in, equity building, and demand for purchase mortgages, HELOCs, and vacation property financing running consistently above what any manual workflow can absorb efficiently.

The inland markets, Kershaw County, Lee County, Darlington, are slower and more stable. Borrowers there skew toward owner-occupied residential, small business, and agricultural. The verification complexity per file is real but manageable at the volume those markets produce.

The Grand Strand is different. Purchase mortgage demand from new residents. HELOC demand from existing homeowners sitting on years of appreciation. Short-term rental investors financing vacation properties with income that comes from Airbnb rather than a W-2. Each file type requires a different verification approach. All of them are arriving at the same four offices inside a growth market that doesn't slow down to let the paperwork catch up.

Scaling that intake with the same manual document-collection process that works fine in Camden creates two problems. First, staffing pressure: you need more people to process more files. Second, turn-time risk: the buyer with a competing offer doesn't wait for HR to call back.

## Small Business Is the Hidden Complexity

First Palmetto is explicitly recognized for a higher-than-peer concentration of small business and commercial real estate loans. 
Small business borrowers don't have W-2s. Income comes from K-1s, Schedule C filings, business bank statements, and profit-and-loss summaries that tell different stories depending on the tax year, the entity structure, and whether the owner runs payroll through the business. Employment verification is self-referential: the owner is the employer.

Commercial loan officers at every bank spend disproportionate time assembling and validating financial documentation before they can credit-decision a file. At a bank whose commercial pipeline is central to its competitive identity (and to the community investment record that earned it three Newsweek awards), that document chase is happening at volume, on files that are legitimately complicated.

Bank-level asset verification and business income confirmation that runs in minutes, rather than the days it takes to manually pull business tax transcripts and reconcile them against bank statements, doesn't change the credit decision. It changes when the credit decision gets made. For a small business owner waiting on a line of credit, that timing difference is the whole experience.

## What 120 Years Earns You, and What It Doesn't

The Camden headquarters, the Newsweek recognition, the improving efficiency ratio: all of it reflects an institution that has made thoughtful decisions for a long time.

The absence of a digital mortgage application in 2026 is also a decision. It's defensible from a relationship-banking philosophy. It's expensive from an operational standpoint. And it's a real risk in the four counties where First Palmetto's growth opportunity is largest.

:::pullquote
The absence of a digital mortgage application in 2026 is also a decision.
:::

No job postings for technology or digital roles appear on the bank's site as of mid-2026. No fintech partnership is disclosed. The current digital infrastructure (Zelle, mobile deposit, contactless payments) is payment rails, not origination infrastructure.

Banks that close this gap tend to do it in phases: automate income and employment verification first, because it's a single-point integration that doesn't require replacing the core system, the loan origination system, or the branch model. The Mortgage Bankers keep their relationships. The files just stop requiring days of document collection.

The balance sheet First Palmetto has built over 120 years is a real asset. A 1.36% ROA and a 54.8% efficiency ratio in the first half of 2026, in a rate environment that humbled most community banks, is not luck. It's execution. The question heading into the next decade is whether the Grand Strand offices can keep up with a county that has grown 17.8% since 2020 on the same intake workflow that served Camden in 1985.

The banks that answer that question fastest, without sacrificing the relationship model or the credit discipline that built the franchise, are the ones that enter their second century with the same independence they started with.

First Palmetto has earned the right to make that choice on its own terms. The borrower-permissioned data infrastructure that makes that choice possible is already available, and the gap between a 511-loan manual pipeline and a 511-loan digitally-verified one is measured in weeks, not years.
    `,
  },
  'queensborough-national-bank-trust-deep-dive': {
    title: "Queensborough's Long Runway: A $2.3B Georgia Bank Built to Last",
    description: "Queensborough National Bank & Trust has grown to $2.34B in assets across a 25-office corridor from Louisville to Savannah without a single acquisition. The bank carries a $477M commercial real estate book with no digital front door, 57 VA loans in 2024, and a mortgage operation still running on paper. Here is the story behind the numbers.",
    publishedDate: 'March 26, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `
*Updated October 22, 2026: corrected the office count, the period and value of the net interest margin, and the size of the residential book, and removed market-share and growth figures we could not source.*

Queensborough National Bank & Trust has never made an acquisition. Not one. Every dollar of its $2.34 billion in assets was built the old-fashioned way: one relationship at a time, in markets that most bank strategists would have passed on.

That is either the most disciplined growth story in Georgia community banking or the most stubborn one, depending on your vantage point. Maybe both.

## Louisville to Savannah: The 150-Mile Franchise

Founded in 1902 in Louisville, Georgia, the seat of Jefferson County, Queensborough has grown into a 25-office institution that runs roughly 150 miles from its rural middle-Georgia home base through the Augusta MSA and on into the Savannah market. The holding company, The Queensborough Co., has kept the bank independent through 124 years of rate cycles, farm credit collapses, and now the fastest digital disruption in lending history.

The footprint is deliberate and unusual. Eight branches serve the Augusta area. Four are in the Savannah metro, with another in Hinesville. The rest connect rural communities: Sandersville, Wadley, Sylvania, Waynesboro, Wrens, Millen, Midville, Metter, Statesboro. These are agricultural towns, timber markets, and small manufacturing communities. Not exactly the zip codes that attract venture-backed digital lenders.

But the Augusta anchor is meaningful. Fort Eisenhower (formerly Fort Gordon) and the U.S. Army Cyber Command provide a durable institutional employment base. Columbia County, on Augusta's western side, is one of the fastest-growing counties in Georgia. That is where the mortgage volume is, and that is where Queensborough's brand recognition is strongest.

The numbers behind the operation are solid. In the first quarter of 2026: a 1.06% ROA, a 3.83% net interest margin and a 65.8% efficiency ratio, which is respectable for a 25-office institution operating across this geography. The FDIC classifies them as Specialty Group 4: Commercial Lending Specialization. CEO William Easterlin and CFO Jeffrey Karafa have run a clean ship.

## The Verification Problem Hidden Inside the Mortgage Book

Queensborough originated 453 residential mortgages in 2024. One-to-four family residential loans were $319 million at the end of the first quarter of 2026. That is a serious mortgage operation for a $2.3 billion bank.

Here is the problem. The mortgage page on qnbtrust.bank says borrowers can "apply online, upload documents, and sign electronically," guided by a "dedicated local lender." There is no mention of automated income verification, open-banking data pulls, or any of the verification infrastructure that determines how fast a file actually moves from application to close.

No public reference to Plaid, Finicity, Truework, or The Work Number appears anywhere on the site or in job postings. The QNBTNOW interactive teller machines, which Queensborough operates from a centralized Augusta hub, handle teller transactions. They do not connect to loan origination. The online banking platform offers check, transfer, bill pay, and a money management budgeting add-on. That is it.

Which means 453 mortgage files a year are moving through a process that involves local lenders collecting paper pay stubs and bank statements, processing them manually, and chasing borrowers by email when something is missing. In Sylvania. In Midville. In Wadley. Places where the nearest branch competitor is 20 minutes away but the nearest digital mortgage lender is one app download away.

Fifty-seven of those 2024 originations were VA loans. About 12.6% of the mortgage mix. Fort Eisenhower's military population generates that demand, and it is the segment national digital lenders target most aggressively. Military households move frequently. They decide fast. A VA borrower hunting for LES statements and DD-214s while waiting on a local lender callback will choose the lender who can do it in a single digital step.

:::pullquote
Speed is the competitive variable in VA lending. A borrower who can complete income and service verification in minutes rather than days will choose the faster lender, regardless of which bank has the better relationship story.
:::

## A $477M Commercial Book With No Online Application

Here is the number that stands out most on the balance sheet.

Queensborough's non-residential real estate exposure hit $477 million as of Q1 2026. That is the single largest loan category, representing over 35% of total loans. The bank holds Commercial Lending Specialization status from the FDIC, meaning CRE and C&I are the core business, not a side product.

:::stat
**$477M**
Queensborough's non-residential real estate book as of Q1 2026, the single largest loan category at over 35% of total loans, all flowing through a commercial intake process with no online application.
:::

Go to the commercial banking page on qnbtrust.bank. There is no online application. The page directs all inquiries to a branch visit or a phone call.

That is not unusual for a community bank. It is the standard approach. But consider what it means operationally: every commercial borrower in the CSRA (Central Savannah River Area) who wants a loan from Queensborough starts the process by driving to a branch or picking up a phone. Then they spend hours, sometimes days, assembling tax returns, business bank statements, rent rolls, and entity documents. The underwriting team re-keys those documents. Someone chases the missing ones.

Small business owners across rural CSRA markets, the farmers in Jefferson County, the small manufacturers in Burke County, the retail operators in Candler County, all of them are experiencing that document-gathering bottleneck. For a bank with $477 million already on the books and a specialty classification that signals lending is the core competency, moving commercial intake online is both a competitive upgrade and a capacity multiplier.

The rural borrower piece is real. Queensborough's branch towns serve agricultural borrowers, timber interests, and small manufacturers who have complex income pictures: FSA payments, timber sale proceeds, equipment across multiple entities. Manual collection of those documents is slow. Getting it wrong has consequences. An automated business bank account aggregation and income verification layer compresses that phase from days to hours while producing a cleaner audit trail than the current process.

## What Digital Intake Could Mean for the Next Phase

Queensborough has built a franchise that most community banks cannot replicate: 124 years in the same markets, 25 offices across an agricultural spine and two growing MSAs, a $2.34 billion balance sheet grown entirely organically. That is a competitive moat.

The question now is whether the lending intake process can keep pace with two converging pressures: a Fort Eisenhower military population that is accustomed to digital everything, and a Columbia County growth story that is attracting exactly the high-income borrowers that national lenders prioritize.

A bank that can offer a rural borrower in Sylvania the same speed of income and asset verification that Rocket Mortgage offers a borrower in suburban Augusta is not just competing on relationships anymore. It is competing on capability. The local decision-making stays local. The lender relationship stays intact. But the bottleneck that makes community banks look slow relative to digital lenders disappears.

For a 453-mortgage, $477M-commercial-book institution operating across a 150-mile corridor, the arithmetic is straightforward. Every verified file that moves faster is capacity recovered. Every VA loan that closes before a competing digital lender gets the call is market share retained. And every commercial borrower who does not have to drive to a branch to start a loan application is a relationship that does not have the opportunity to end up somewhere else.

:::pullquote
Every VA loan that closes before a competing digital lender gets the call is market share retained.
:::

Queensborough has been built to last. The next phase is built to move.
    `,
  },
  'southern-bank-nc-digital-bet': {
    title: 'Southern Bank Rebuilt Its Digital Banking. The Loan Application Is Next',
    description: "Southern Bank and Trust, chartered in Mount Olive, NC in 1901, cut its efficiency ratio from 69.4% to 52.6% in two years and switched on a new digital banking platform on October 19, 2026. What drove the turnaround, what its 2025 mortgage data shows, and where the next efficiency gain has to come from.",
    publishedDate: 'June 25, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '5 min read',
    content: `
On Monday, October 19, 2026, Southern Bank and Trust switched its customers to a new digital banking platform. Personal users got an update prompt, business users got a new app, and everyone got a new login. A bank chartered in Mount Olive, North Carolina, on January 29, 1901, rebuilt its online front door.

The conversion is the visible part. The numbers behind it are the better story.

## A Two-Year Turnaround

Southern Bank is the banking subsidiary of Southern BancShares (N.C.), Inc., which trades over the counter as SBNC. As of June 30, 2026, the bank held $5.30 billion in assets and $4.83 billion in deposits, with 603 full-time-equivalent employees and 57 offices: 47 in eastern North Carolina and 10 in Hampton Roads and the Richmond area.

Here is what its FDIC call reports show over two years:

- **Efficiency ratio:** 69.4% in Q1 2024, 65.2% for full-year 2024, 56.6% for 2025, and 52.6% for the first half of 2026
- **Net interest margin:** 2.68% in Q1 2024, 3.70% in the first half of 2026
- **First-half net income:** $36.8 million in 2026, up 57% from $23.5 million in 2025
- **Return on assets:** 1.40% for the first half of 2026, return on equity 17.1%

:::stat
**69.4% to 52.6%**
Southern Bank's efficiency ratio, Q1 2024 to the first half of 2026, per FDIC call reports. Seventeen points in two years.
:::

Most of that came from the margin. First-half interest expense fell from $30.3 million in 2025 to $24.6 million in 2026, while interest income rose 12%. Net interest income grew 24%. Noninterest expense rose about 7%. When revenue outruns expenses by that much, the efficiency ratio falls on its own.

One quarter muddies the trend. Q1 2026 included a $9.2 million loss on securities sales, which pulled that quarter's ROA down to 0.89%. By midyear, cumulative securities losses were down to $2.7 million, and the half-year ROA was 1.40%. Repositioning a bond portfolio like that trades a one-time loss for higher yields later.

Credit stayed clean throughout: net charge-offs ran 0.12% of loans, annualized, in the first half of 2026.

## What the Loan Book Actually Holds

Eastern North Carolina is farm country, but Southern Bank's balance sheet is mostly commercial real estate and homes. Of $3.60 billion in gross loans at midyear:

- Nonfarm, nonresidential real estate: $1.50 billion (42%)
- One-to-four family residential: $1.29 billion (36%)
- Commercial and industrial: $259 million
- Construction and land: $197 million
- Multifamily: $121 million
- Farmland and agricultural production combined: $165 million (about 5%)

The footprint is wider than "eastern North Carolina" suggests. Wayne, Nash, and Pitt counties each have five offices. Dare County, home of the Outer Banks, has three. Across the state line, there are three in Virginia Beach, two each in Norfolk and Chesapeake, and offices in Suffolk, Newport News, and Henrico County.

## What 2025 Mortgage Data Shows

Southern Bank's 2025 HMDA filing shows 1,557 originated home loans totaling $440.7 million. Purchase loans made up 678 of them, at $267.5 million and an average of about $395,000. The rest were refinances, home improvement, and other purposes.

Three markets show how different the borrowers are:

- **Dare County (Outer Banks):** 99 loans, $36.9 million, averaging about $372,000
- **Virginia Beach:** 65 loans, $23.1 million, averaging about $356,000
- **Wayne County (headquarters):** 49 loans, $7.8 million, averaging about $159,000

A second-home buyer in Kill Devil Hills, a Navy family in Virginia Beach, and a first-time buyer in Goldsboro are three different files. Rental income, military pay, and a single W-2 each need different documents to verify.

The military piece stands out. Southern Bank has offices near Seymour Johnson Air Force Base in Goldsboro and throughout Hampton Roads, home to Naval Station Norfolk. Yet of its 1,557 loans in 2025, 1,547 were conventional. It made 8 VA loans, 2 USDA loans, and no FHA loans.

:::pullquote
Of 1,557 home loans in 2025, Southern Bank made 8 VA loans, in a footprint built around an Air Force base and the largest naval station in the world.
:::

That is a choice many community banks make: VA lending has its own rules and servicing work. But military borrowers who don't use VA loans still bring the same income questions. Base pay, housing allowance, and special pays all show up on a Leave and Earnings Statement, not a standard pay stub.

## The Base Is Staying

The military customer base looks more secure now than it did a year ago. In 2024, the Air Force proposed retiring F-15E Strike Eagles at Seymour Johnson, and Congress blocked the move in the 2025 defense bill. In August 2026, Air Force Secretary Troy Meink wrote to Senator Ted Budd that Seymour Johnson will replace its F-15Es with new F-15EX Eagle IIs, subject to Congress funding them in the fiscal 2027 budget. He also said the Air Force has no plans to cut the base's F-15 missions until replacement aircraft are in place.

For a bank headquartered about 15 miles from the flight line, that removes a large unknown.

## The Next Front Door

Southern Bank has been building digital pieces for some time. It lists an Executive Vice President and Chief Digital Officer, Sondra McCorquodale, among its ten executive officers. That title is uncommon at a $5 billion bank.

Here is where its digital entry points stand as of October 2026:

- **Deposit accounts:** online, on a bank-branded site at openaccount.southernbank.com
- **HELOC:** an "Apply in Minutes" button for its home equity line special
- **Mortgage:** an online application through a separate mortgage portal
- **Personal, auto, boat, and RV loans:** a phone number and a contact form
- **Business and agricultural loans:** a contact form

That is a split many community banks have. Deposits and mortgages, the products with off-the-shelf software, went online first. Consumer and business loans still start with a phone call.

The efficiency gains so far came mostly from margin. Margin gains don't repeat forever. Rates move, and deposit costs follow. Once the margin stops widening, the next efficiency gains come from processing more loans with the same 603 people.

That is the case for the loan application being next. A borrower who can apply at 9 p.m., with income verified during the application, arrives at the loan officer as a complete file instead of a voicemail.

Southern Bank just showed it can move a whole customer base to a new digital platform. The new platform serves the customers it already has. The loan application is what brings in new ones.
    `,
  },
  'chime-account-opening-deposit-war': {
    title: 'Chime Opens Accounts in Two Minutes. What Community Banks Can Actually Copy',
    description: 'Chime reached 10.4 million active members in mid-2026 without a branch, a signature card or a ChexSystems check. A side-by-side look at its account opening and a community bank\'s, what Chime gave up to be fast, and which parts a community bank can copy.',
    publishedDate: 'June 24, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '5 min read',
    content: `
Chime advertises that you can open an account in under two minutes. No ChexSystems check, no credit check, no minimum balance, no monthly fee, no branch.

That pitch has worked. Chime ended June 2026 with 10.4 million active members, up 20% from a year earlier, and it now expects $2.7 billion in revenue this year. It went public on Nasdaq in June 2025.

Here is the part community bankers tend to miss: Chime is not a bank. Its accounts are held at The Bancorp Bank and Stride Bank, two FDIC-insured banks. The charter was never the advantage. The front door was.

:::stat
**10.4 million**
Chime's active members at the end of June 2026, up 20% year over year, with no branches.
:::

## What Chime Actually Does

The application asks for the basics: name, address, date of birth, Social Security number. Identity, fraud and sanctions screening run in the background. The customer sees a form, then an account.

The ChexSystems decision is deliberate, and Chime advertises it. ChexSystems is the consumer reporting agency most banks check at account opening for past overdrafts, unpaid balances and account misuse. Chime does not use it to screen applicants, and markets itself directly to people who have been turned away elsewhere. Its position: a past overdraft is not a reason to refuse someone a checking account.

## What a Community Bank Does Instead

Open a checking account at a community bank branch and it is a sit-down appointment. A government-issued ID, a Social Security number, an opening deposit, sometimes proof of address. The banker runs ChexSystems, completes a signature card, walks through the disclosures, explains the overdraft options and orders the debit card.

It is thorough. It is relationship-oriented. It is also an appointment when the competitor takes two minutes on a phone.

:::pullquote
It is thorough. It is relationship-oriented. It is also an appointment when the competitor takes two minutes on a phone.
:::

Most community banks now offer an online version too. But the online version often carries the branch process with it: the same long form, a document upload that fails on a phone camera, an opening deposit by micro-deposit that takes days, or a final step that asks the customer to come in to sign. Each of those is a point where an applicant who started on a phone at night simply stops.

## The CFPB File

Chime's model has costs, and they show up at the other end of the relationship.

In May 2024, the CFPB ordered Chime to pay a $3.25 million penalty and at least $1.3 million in redress for delaying refunds to customers whose accounts were closed. In thousands of instances, the CFPB found, customers waited more than 90 days for their money. Chime attributed most of the delays to a vendor configuration error in 2020 and 2021. Three months earlier, Chime had paid $2.5 million to resolve a California DFPI investigation into its customer service and complaint handling.

That is the tradeoff. Opening accounts without ChexSystems means more accounts, and more risk to manage after the account is open. Running without branches means lower costs, and nobody across a desk when an account is frozen.

A community bank's slower process comes with a person who knows the customer and can fix a problem on the spot. That is worth something. The question is whether the people who value it are still the people opening new accounts.

## Where the Deposits Are Going

J.D. Power's 2026 U.S. Retail Banking Satisfaction Study found that 20% of retail bank customers had moved money away from their primary bank in the prior three months, up from 17% a year earlier. Customers under 40 were the most likely to do it, at 23%. The average checking customer now holds deposit accounts at three different institutions.

The new accounts are going somewhere. Cornerstone Advisors estimates that digital banks and fintechs captured 44% of new checking accounts opened in 2024, down from 47% in 2023 but still more than big and regional banks combined.

J.D. Power calls it soft switching. Nobody closes the old account. They open a new one somewhere easier, and the balance drifts.

:::pullquote
Nobody closes the old account. They open a new one somewhere easier, and the balance drifts.
:::

For a community bank, that means the competition for deposits is no longer decided once, when a customer chooses a primary bank. It is decided every time a customer opens a second account, and the institution with the easiest front door wins that moment.

## What Can Actually Be Copied

No community bank is going to out-engineer a company with $2.7 billion in revenue and no branches to run. It does not need to. Most of what makes Chime's opening fast is process, not technology:

**Ask for less up front.** Collect what the account legally requires to open, and gather the rest after it is funded.

**Verify in the background.** Data-based identity verification against name, date of birth and SSN finishes in seconds. Make a document upload the fallback, not the first step.

**Fund instantly.** Instant account verification through an aggregator, or a debit card transfer, instead of micro-deposits that take days.

**Never send a digital applicant to a branch to finish.** If e-signature cannot complete it, the flow is not finished.

**Measure where people stop.** Most banks know how many accounts they opened online. Few know which step the rest quit on.

Chime added about 200,000 active members in the second quarter of 2026 alone. Many of them already had a bank account somewhere. The question is whose deposits followed them.
    `,
  },
  'first-reliance-outgrew-florence': {
    title: "The Bank That Didn't Wait for the Battery Plant",
    description: "First Reliance Bancshares posted net income up 113% year-over-year while the AESC battery plant in its home market sat half-built and on hold. Nine branches, eight cities, $1.12 billion in assets, and a balance sheet that outgrew Florence, SC.",
    publishedDate: 'June 22, 2026',
    readTime: '5 min read',
    content: `
In a city whose biggest economic promise spent most of 2025 on hold, First Reliance Bancshares quietly posted net income up 113% year-over-year. That's the kind of number that makes you look twice at Florence, South Carolina.

The $1.62 billion AESC electric vehicle battery plant was supposed to be the story. 1,620 jobs, a transformed local labor market, median home prices up 12% in anticipation. Then came the federal EV policy shifts, the tariff uncertainty, the financing disruption, and the pause. South Carolina pulled $111 million in bond incentives. Construction stopped. Florence unemployment climbed to 6.0% in January 2026.

First Reliance's Q1 2026 numbers didn't get that memo.

## A Balance Sheet That Earns the Headline

ROA of 1.25%. ROE of 14.53%. NIM of 3.77%, up 28 basis points year-over-year. Net charge-offs for the quarter: negative, meaning they recovered more than they charged off. Nonperforming assets at 0.19% of total assets.

These are not the numbers of a bank hunkering down in a challenging market. They are the numbers of a bank performing near the top of the South Carolina community bank peer group.

:::pullquote
These are not the numbers of a bank hunkering down in a challenging market. They are the numbers of a bank performing near the top of the South Carolina community bank peer group.
:::

First Reliance was founded in 1999, making it 27 years old, a relative newcomer compared to the 90-year-old institutions that dominate these profiles. $1.12 billion in total assets. Nine South Carolina branches. Loan book of $801 million, growing at 10.9% annualized in Q1. The loan mix skews heavily commercial: CRE is 59% of the book, consumer real estate another 30%, C&I 9%.

The NIM expansion is the number worth sitting with. Going from 3.49% to 3.77% in a year, in a rate environment where most community banks are fighting to hold margin flat, says something about how the bank is pricing its book.

:::stat
**113%**
Net income growth year-over-year at First Reliance in Q1 2026, posted while Florence unemployment climbed to 6.0% and the city's flagship battery plant sat half-built and on hold.
:::

## What Happened to the Battery Plant

To understand First Reliance's position, you need to understand what the AESC story has become.

AESC announced a $1.62 billion facility in Florence County in 2023. The projection: 1,620 jobs and the kind of investment that reorders a regional economy. Florence home prices jumped 12.4% year-over-year in anticipation. The Pee Dee had its headline.

Then 2025 arrived. Federal EV policy shifted. Tariffs complicated the supply chain math. Financing got harder. Construction on the facility, already 75% complete with $1.2 billion invested, paused in mid-2025. South Carolina pulled $111 million in bond incentives for the planned expansion. Florence unemployment hit 6.0% in January 2026, well above the 3.6% state average.

Only about 200 of the promised 1,620 jobs have been hired. The full expansion, a separate $1.5 billion second facility, is completely paused.

:::stat
**200**
Jobs actually hired at the AESC Florence battery plant out of the 1,620 promised, with the full second-facility expansion completely paused and the remaining hiring contingent on a recovery that could take years.
:::

Construction has technically restarted, and officials say major hiring could resume within 8-12 months. But "could resume within 8-12 months" is a sentence that requires a certain amount of faith to bank on.

## How First Reliance Stopped Depending on Florence

Here is the thing: First Reliance does not look like a bank waiting on a battery plant.

They have branches in Greenville, Mount Pleasant, Myrtle Beach, Columbia, Lexington, Simpsonville, and West Columbia. Florence is home base, with two branches there. But the loan production across those other markets is what is driving the 10.9% annualized growth. Greenville and the Charleston suburbs are among the strongest commercial real estate markets in the Southeast. Myrtle Beach is a deposit machine.

A bank founded in Florence in 1999 quietly built a statewide footprint over 25 years. Rick Saunders, who started First Reliance and still runs it as CEO, has a line for why: "Every time we grow, the money comes back to Florence County." That decision looks smart right now.

:::pullquote
A bank founded in Florence in 1999 quietly built a statewide footprint over 25 years.
:::

The CRE concentration (59% of the loan book) is worth watching in any environment, but the quality numbers are clean. $2.1 million in nonperforming assets on a $1.12 billion balance sheet is effectively nothing. An allowance coverage ratio of 1.14% against that NPA level means the reserve is conservatively set relative to actual stress.

## The Number to Watch

Not everything is clean.

Deposits fell 8.1% annualized in Q1 2026. Loans grew 10.9%. The loan-to-deposit ratio is now 86.24%, moving in the direction that requires attention.

For context, 86% LTD is not alarming. Many well-run community banks operate comfortably above that. But it is a trend, and trends in funding have a way of becoming constraints faster than trends in loans. If deposit outflows continue while loan demand holds, First Reliance will need to pay up for deposits, which compresses the NIM that is currently its strongest story.

The 64.84% efficiency ratio is decent but not the headline. For a bank posting 1.25% ROA and 28 basis points of NIM expansion, there is room to drive that number lower as scale builds.

## What the Next Twelve Months Look Like

Florence is not done waiting on its battery plant. The AESC facility will likely get finished. The question is whether the 1,620-job promise materializes on the original timeline or something longer. For a bank with two Florence branches and a diversified statewide book, the answer matters less than it would have for a pure Florence lender.

First Reliance's job is to keep the deposit base stable, hold the credit quality that has defined this quarter, and let the Greenville and Charleston-area commercial pipeline keep growing. If the Florence economy delivers, those two local branches benefit. If it takes another two years, the Myrtle Beach and Upstate books carry the weight.

Net income up 113% in the middle of a local economic disruption is a specific kind of evidence. It says this bank built something more resilient than its zip code. Whether Florence catches up to the balance sheet, or the balance sheet has simply outgrown Florence, is the story of the next few years.

The numbers, for now, say the latter.

---

**Update, June 26, 2026:** First Reliance CEO Rick Saunders reached out after publication to add context on the deposit picture: "Your observations on deposits is spot on but not the whole story. We've been moving to higher 80's loan-to-deposit and the deposit contraction was expected from targeted exposure to some law firm escrow accounts we knew were short lived."

That is a meaningful distinction. Managed runoff from known short-duration escrow balances is a deliberate liability mix decision, not organic attrition. If First Reliance intentionally let those accounts go while targeting an 85-88% LTD range, the trend reads as planned rather than concerning. The number to watch is whether the ratio stabilizes in that range or keeps climbing.
    `,
  },
  'colony-bankcorp-farm-to-fees': {
    title: 'Built on Peanuts, Betting on Fees',
    description: 'Colony Bankcorp grew from a 1975 agricultural lender in Fitzgerald, GA to a $3.7 billion serial acquirer. Now it faces a two-front stress test: a multi-year peanut cost-price squeeze and a post-acquisition loan growth miss. The plot twist is a fee income pivot that tripled AUM in a year.',
    publishedDate: 'June 17, 2026',
    readTime: '5 min read',
    content: `
Fitzgerald, Georgia has about 8,500 people, a peanut festival, and the headquarters of a $3 billion bank. That last part surprises most people.

Colony Bankcorp started in 1975 as a small agricultural lender in Ben Hill County, where peanuts, cotton, and poultry still define the local economy. Fifty years later, it has 37 branches across Georgia, Alabama, and north Florida, a wealth management division that tripled its AUM in a single year, and a loan book approaching $2.5 billion. The question now is whether the reinvention can outrun the stress building in the fields where the bank got its start.

## The Farm Problem

South Georgia agriculture is having a hard stretch. Peanut growers are losing money. Literally: net returns on peanuts turned negative as input costs (fertilizer, fuel, equipment) outpaced commodity prices. Cotton farmers responded by shifting acreage into peanuts for the first time in decades, betting the crop would recover. It hasn't yet.

The irony is that peanuts used to be the safe bet. Georgia produces roughly half of the U.S. peanut crop. Fitzgerald sits in the middle of it. Colony built its first decades on agricultural lending to exactly these farmers, so a multi-year cost-price squeeze in the sector isn't a distant macro story. It's a balance sheet question.

:::pullquote
The irony is that peanuts used to be the safe bet.
:::

The bright spot is poultry. Georgia's broiler industry generated $6.09 billion in cash receipts, and that part of the ag economy is running fine. Colony's agricultural credit quality has so far stayed clean: net charge-offs in Q1 2026 came in at $315,000, or 5 basis points annualized. NPL coverage sits at 122%. Nonaccruals are declining quarter over quarter.

Clean numbers. But the farm squeeze is ongoing, and cost-price pressure that runs for multiple years eventually shows up somewhere.

## The Acquisition Machine

While the home base has been dealing with farm economics, Colony has been shopping.

The bank has completed numerous acquisitions over the past decade, pushing the footprint further from Fitzgerald each time. The most recent closed in December 2025: TC Bancshares, a $571 million deal that added Thomasville, Georgia and Tallahassee, Florida to the branch map. Colony paid $86 million.

Tallahassee is a state capital with a university, a stable government employment base, and a housing market that has held up better than coastal Florida markets hammered by insurance costs. It is a deliberate move away from pure agricultural exposure. Thomasville, a small city on the Georgia-Florida border, adds a commercial and retail banking market that complements the rural ag footprint without duplicating it.

The TC acquisition is still digesting. Loan growth in Q1 2026 came in at 5.4% annualized, well below Colony's internal 8-12% target. Management blamed rate and tariff uncertainty cooling borrower demand. That's a reasonable explanation. It's also the kind of explanation that sounds better when loan growth eventually picks back up.

## The Fee Pivot

Here is where the story gets interesting.

Colony's wealth management division hit $555 million in assets under management, triple where it was a year ago. Their insurance business had a record quarter. Mortgage pretax income was up 7x year-over-year, off a low base but still a real move.

:::stat
**$555M**
Assets under management in Colony's wealth division, up 3x in a single year.
:::

Non-interest income is the metric that separates banks with a plan from banks running on rate tailwinds. At 3.48%, Colony's NIM is healthy but not exceptional for a bank its size. The fee income growth is the signal that management is deliberately reshaping the revenue mix.

:::pullquote
Tripling AUM in a year doesn't happen by accident.
:::

Tripling AUM in a year doesn't happen by accident. It requires hiring advisors, building a platform, and convincing existing deposit customers to bring their investment relationships to the bank. That Colony has done it while simultaneously integrating an acquisition and managing agricultural stress suggests real execution capacity.

## What Q1 Actually Said

Net income hit $8.2 million in Q1 2026, up from $6.6 million a year earlier. Management is targeting a 1.20% ROA in Q2, which implies Q1 came in just below that threshold. For context, the community bank average hovers around 1.10-1.15%. Colony is performing above peer.

Deposits are $3.05 billion against $2.41 billion in loans, a loan-to-deposit ratio of about 79%. Conservative. It means Colony has room to grow the loan book without raising expensive deposits, which matters in an environment where funding costs are still elevated.

The UGA economists are forecasting 4.1% unemployment in Georgia for 2026, up from 3.6%, with roughly 50-50 recession odds. That's not a crisis forecast, but it's not a green light either. For a bank simultaneously digesting an acquisition, managing farm stress, and building out fee income, the macro backdrop adds complexity to every number.

## What Comes Next

Colony Bankcorp has built something unusual: a $3 billion regional bank with agricultural roots, a multi-state footprint, and a serious bet on fee income as a second engine.

The bet is not without risk. Agricultural lending in south Georgia is not going to get easier before it gets better. Loan growth missing internal targets in the quarter after a major acquisition is a thing to watch. And Georgia's macro picture, while not alarming, is moving in the wrong direction heading into the back half of 2026.

But the credit quality numbers are clean, the wealth division is growing fast, and management has demonstrated they can execute deals without blowing up the balance sheet. A bank that triples its AUM, runs a record insurance quarter, posts mortgage income up 7x, and closes a $571 million acquisition in the same year is not sleepwalking.

Fitzgerald probably still has the peanut festival. Colony Bankcorp is becoming something its founders likely didn't picture: a diversified financial services company that just happens to be headquartered in a peanut town. Whether that transition sticks depends on whether the fee businesses keep compounding and whether the farm book stays as clean as the charge-off numbers say it is right now.

Both of those things are easier to manage with better data on your borrowers. That's the next frontier for banks at Colony's stage of growth.
    `,
  },
  'carolina-bank-between-two-economies': {
    title: 'The Bank Between Two Economies',
    description: 'Carolina Bank & Trust earned a 1.85% ROA with a 43.2% efficiency ratio in the first half of 2026, out of Lamar, SC, between a county that lost its sawmill and a county whose $1.6 billion battery plant is on pause. How a 90-year-old family bank thrives while both economies wait.',
    publishedDate: 'June 17, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '5 min read',
    content: `
In August 2025, Canfor permanently closed its Darlington, South Carolina sawmill. Two months earlier and one county over, AESC had paused construction on its $1.6 billion electric vehicle battery plant in Florence, citing policy and market uncertainty. Carolina Bank & Trust, headquartered in Lamar since 1936, had a front-row seat to both.

The bank didn't flinch.

Its first half of 2026, from the FDIC call report: a 1.85% return on assets, a 43.2% efficiency ratio, a 4.17% net interest margin and zero foreclosed real estate on the books. Those are the numbers of a bank that has been quietly doing something right for three generations, while the economy around it moved from tobacco to textiles to timber, and now waits on lithium-ion batteries.

## A Balance Sheet Built for Turbulence

Carolina Bank & Trust runs $845 million in assets from 14 offices across six counties: Darlington, Florence, Marion, Marlboro and Chesterfield in the Pee Dee, plus North Myrtle Beach. It has 92 full-time-equivalent employees. The Beasley family has run it since 1936.

The first half of 2026 was its best yet:

- Net income of $7.9 million, up 34.5% from a year earlier
- Return on assets of 1.85%, up from 1.49%
- Efficiency ratio of 43.2%, down from 50.2%
- Net interest margin of 4.17%, up from 3.99%
- Tier 1 risk-based capital ratio of 20.14%

An efficiency ratio of 43.2% means about 43 cents of every revenue dollar goes to overhead. A 20% Tier 1 ratio is more than double the 8% regulators require for a well-capitalized bank. Some would call that overcapitalized. At Carolina Bank, it looks more like institutional philosophy.

Other real estate owned, the line for properties a bank has had to take back from borrowers, is zero, down from $765,000 in early 2025. Noncurrent loans are 0.41% of the book: not nothing, but modest for a footprint that includes some of the state's harder-hit rural counties.

:::stat
**1.85%**
Carolina Bank & Trust's annualized return on assets in the first half of 2026, with a 43.2% efficiency ratio and zero foreclosed real estate, per its FDIC call report.
:::

## Darlington's Hard Year

Canfor announced in June 2025 that it would permanently close its Darlington sawmill, along with a second mill in Estill, citing weak markets and sustained losses. The Canadian lumber company had posted a $942 million operating loss in 2024. About 120 jobs in Darlington went with the mill.

A sawmill closure ripples. It employs the truckers who haul logs, the mechanics who maintain equipment, the lunch spots near the gate. Lamar is in Darlington County, and Carolina Bank's customers include the small businesses and households that feel a mill closure in their cash flow months before it shows up in economic data.

The loan book has held up anyway. That says something.

:::pullquote
The loan book has held up anyway. That says something.
:::

## Florence and the Paused Battery Bet

Drive 20 minutes northeast and you're in Florence County, where the story was supposed to be different.

AESC broke ground in 2023 on a $1.6 billion plant to make EV batteries for BMW, with about 1,600 jobs promised. In June 2025 it halted construction. The state later pulled $111 million in bonds it had set aside for a second AESC facility. As of mid-2026, local reporting found the first plant still paused, with AESC saying it remains committed to the investment and the jobs but giving no restart date.

Carolina Bank has four offices in Florence County. For now, the battery economy is a promise, not a payroll. If construction resumes, the bank sits exactly where money flows first: construction lending, small business formation, and deposits as new paychecks clear. If it doesn't, the bank's results show it never needed the plant to perform.

## What Three Generations Gets You

There's a version of this story where a 90-year-old family bank in rural South Carolina is a cautionary tale. Sleepy. Slow to modernize. Running on relationship inertia until rates squeeze the margin.

Carolina Bank is not that story.

A 43% efficiency ratio is not an accident. It takes discipline in staffing, in technology decisions, and in not chasing products the bank doesn't understand. Ninety-two people running $845 million in assets is a lean operation. A 4.17% margin means the bank is pricing loans and deposits with precision.

The bank has modernized where its existing customers feel it, moving online banking to Jack Henry's Banno platform in 2025. New-borrower intake is another matter. Only mortgages have an online application, on a third-party portal on a separate domain, and home equity, personal, auto and business loans start at a branch.

The 20% capital ratio is the most interesting number. That much capital is expensive in good times. It is also optionality. When Florence loan demand arrives, whenever that is, a bank with that capital can move fast. And it can absorb a Canfor-level shock without blinking.

## What Comes Next

The Pee Dee is at an inflection point most rural economies don't get twice. The old manufacturing base is contracting. The new one is on hold. The gap between those two arcs, playing out county by county, tests a bank's underwriting judgment, its local knowledge and its capital.

Carolina Bank & Trust has spent 90 years learning this landscape. The Beasley family knows which Darlington businesses have the cash flow to survive a mill closure and which don't, and which Florence contractors are positioned for a restart and which are overextended.

That kind of knowledge doesn't show up on a call report. The results do.

Banks that navigate economic transitions well aren't always the ones with the slickest technology or the largest balance sheets. They're the ones that can tell a borrower who is temporarily stressed from one who is structurally impaired. In a region where both live in the same zip code, that's the whole game.

:::pullquote
Banks that navigate economic transitions well aren't always the ones with the slickest technology or the largest balance sheets.
:::

The zero on the foreclosed real estate line is the evidence. Carolina Bank is playing it right.
    `,
  },
  'rocket-mortgage-22-days-how': {
    title: 'How Rocket Mortgage Closes in 22 Days',
    description: 'Independent mortgage banks now originate 84% of U.S. mortgages. Banks gave that market away one slow VOE call at a time. A step-by-step breakdown of what Rocket does differently, and what community banks can actually copy.',
    publishedDate: 'June 15, 2026',
    readTime: '7 min read',
    content: `
Independent mortgage banks now originate 84.1% of all U.S. single-family mortgages. Banks held that market. They gave it away, one slow [VOE call](/glossary/verification-of-employment) at a time.

The number that explains the shift isn't the interest rate or the loan limit. It's 22. That's how many days Rocket Mortgage takes to close, on average, against an industry average of 42 (ICE Mortgage Technology, June 2025). The gap isn't marketing. It's process. And the process difference is specific enough to walk through step by step.

:::stat
**22 days**
Rocket Mortgage's average time to close, against an industry average of 42 days — a 20-day gap built entirely out of process decisions, not rate advantages.
:::

## What Rocket actually does

The core of Rocket's speed advantage is front-loading. Where a traditional mortgage lender collects documents after an offer is accepted, Rocket's Verified Approval product runs full underwriting before the borrower ever makes an offer. A human underwriter, not just an algorithm, reviews credit, income, employment, and assets. The whole thing takes 1-2 hours.

The approval letter is valid for 90 days and functions as close to a conditional commitment as the market offers. Sellers know it. Buyer's agents know it. It changes the negotiation entirely.

On income and employment, Rocket pulls from The Work Number (Equifax's payroll database) and similar automated sources that cover roughly 60-70% of employed U.S. workers. Verification that would take a loan processor a phone call and potentially several days of waiting for HR to call back happens in seconds. For IRS transcript requests, Rocket uses automated tax data services that eliminate the manual form-filing process that still costs some lenders a week.

The appraisal piece is where the structural gap gets harder to close. Fannie Mae expanded its Value Acceptance program in Q1 2025, lifting the LTV cap from 80% to 90% for primary residences. That means borrowers with as little as 10% down can now potentially skip the appraisal entirely. Waiver usage in the 80-90% LTV band jumped from roughly 2% to 17% within seven months of the policy change. Rocket, with its volume and extensive data on prior appraisals from repeat and refinance customers, is structurally positioned to capture a disproportionate share of those waivers. On no-cash-out refinances, roughly half of GSE loans now skip the appraisal.

## What the community bank does instead

The standard community bank mortgage checklist runs to about a dozen document categories: two years of W-2s, 30 days of pay stubs, two months of bank statements (all pages), two years of personal and business tax returns if self-employed, credit explanation letters for any negative items, and more. The list exists because the bank has to gather manually what automated systems produce instantly.

Employment verification is the single most consistent friction point. A loan processor calls the borrower's employer HR department to verbally confirm job title, status, and income. The call has to use a phone number independently verified, not just the number the borrower provided. If HR doesn't answer, the processor calls back. If HR is slow, or the employer uses a third-party HR vendor, or the borrower was recently promoted and the file doesn't match the old records, the whole file sits.

This has to happen twice: once at origination, and again within 10 days of closing.

Initial underwriting under normal conditions takes roughly 72 hours. A full review with a complete file runs 7-10 business days. Add an appraisal (6-20 days depending on the market, with appraiser supply declining roughly 3% annually), and the math gets to 42 days before any complications arrive. A single HR department that takes four days to return a call and the loan slides to 46.

:::pullquote
The cost structure reflects the labor. The MBA puts average origination costs at $11,094 per loan in 2025, with a profit of $785.
:::

The cost structure reflects the labor. The MBA puts average origination costs at $11,094 per loan in 2025, with a profit of $785. That $785 margin is what the process has to earn after paying everyone who touched the file.

## Why banks gave up 70 points of market share

The bank retreat from mortgage isn't a mystery. It's a rational response to unfavorable economics made worse by technology inaction.

IMBs have structural advantages on the cost side: no capital requirements on mortgage loans held-for-sale, no deposit franchise to protect, no regulators asking why origination margins compressed this quarter. They built their entire operation around moving loans fast and selling them to the GSEs. Banks built their mortgage operations as an add-on to a branch relationship model, which made sense when the borrower walked in the door already a customer.

That borrower now shops on their phone. Ninety percent of 2024 homebuyers wanted a fully or mostly digital mortgage process. Rocket now services one in every six U.S. mortgages, has an 83% refinance recapture rate against an industry average of 25-28%, and just added Mr. Cooper's 6.7 million customers and Redfin's buyer network in the same year. The flywheel turns faster every cycle.

Freddie Mac's 2024 Cost to Originate study found that lenders fully adopting its digital tools originate loans $1,500 cheaper and close five days faster, with 10% higher net margin. That data is available to every community bank in the country. Most haven't moved on it.

The piece that doesn't require a technology overhaul is verification. VOE by phone call is a policy choice, not a technical constraint. The Work Number covers the majority of employed borrowers. Automated income verification through bank data connectivity is Fannie DU-certified. The community bank that wires these into its existing process captures most of the time savings without replacing its LOS, its underwriting team, or its relationships.

:::pullquote
Twenty days isn't magic. It's the sum of several verifications that take seconds instead of days, an appraisal that doesn't happen at all on half of refinances, and a document collection process that runs in parallel instead of serially.
:::

Twenty days isn't magic. It's the sum of several verifications that take seconds instead of days, an appraisal that doesn't happen at all on half of refinances, and a document collection process that runs in parallel instead of serially. The gap closes from the bottom up, one step at a time, and the first step is the easiest one to take.
    `,
  },
  'coastal-states-bank-boat-bank': {
    title: 'The Boat Bank of Beaufort County',
    description: 'Coastal States Bank out-deposits Wells Fargo and Bank of America in Beaufort County, but nearly 19% of its loans are boats. Inside the island bank that became a national specialty lender, and the 42-mortgage footnote in its HMDA data.',
    publishedDate: 'June 12, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '5 min read',
    content: `
*Updated October 22, 2026: corrected the date of the first dividend and the marine share of loans, and removed an unsourced share-price figure.*

Coastal States Bank holds more deposits in Beaufort County than Wells Fargo. More than Bank of America. More than SouthState, Truist, or TD. And the loan book behind that #1 hometown franchise is, to a degree that surprises almost everyone who looks, made of boats.

Marine vessels are about 19% of total loans. Senior housing is another 15.6%. The "island bank" on Hilton Head is actually a national specialty lender that happens to dominate one of the wealthiest retirement markets in America.

:::stat
**About 19%**
Marine vessels make up nearly one-fifth of Coastal States Bank's total loan book, more than residential mortgages.
:::

## From recapitalization to the NYSE in eight years

Coastal States was founded in 2004 as southern Beaufort County's only locally owned bank, and for its first decade it behaved like one. The inflection came in 2017, when Stephen Stone arrived with a recapitalization and a different idea: keep the Lowcountry deposit franchise, but lend nationally in niches where a $2B bank can actually win.

It worked. Total assets reached $2.35 billion this March. The holding company, CoastalSouth Bancshares, listed on the NYSE last July at $21.50 a share; its first dividend, a nickel a share, was paid in February 2026.

:::pullquote
In a county with $6.55 billion in total deposits, Coastal States holds $1.17 billion, a 17.9% share that beats every megabank on the island.
:::

The deposit side is the quiet star. In a county with $6.55 billion in total deposits, Coastal States holds $1.17 billion, a 17.9% share that beats every megabank on the island. Its flagship Hilton Head branch alone gathered $735 million, up from $559 million a year earlier. Core deposits grew $117.9 million in the first quarter of 2026 alone.

That's the foundation national lenders dream about: cheap, sticky, locally gathered funding, deployed into specialty assets most community banks can't underwrite.

## What the niches actually look like

Pull apart the $1.8 billion loan book and the community-bank label dissolves. Income-producing CRE is 23.1%. Marine vessels, about 19%. Senior housing, 15.6%. Residential mortgages, just 12.4%. Add national SBA/USDA lending and warehouse lines for mortgage bankers, and five of the bank's eleven branches sitting in metro Atlanta, and you have something closer to a mini Live Oak than a coastal thrift.

The model prints respectable numbers: 1.11% ROA, 3.61% NIM, a 59% efficiency ratio, and charge-offs of one basis point.

But the growth-mode costs are visible too. ROE has come down from 15.9% in 2023 to 10.0% now, diluted by the capital raised with the NYSE listing and compressed by deposit competition. The efficiency ratio has drifted up about seven points from 52% in 2023. Nonperforming assets, 0.21% of assets in 2023, now sit at 0.78%. None of it alarming. All of it the price of building Charleston, where the bank announced a new commercial team under Market President Edward Vaughan in January.

## The 42-mortgage footnote

One number stands out in the HMDA data: 42.

That's how many reportable mortgages Coastal States originated in 2024, roughly $51 million, in a market where the typical Hilton Head home is worth $704,740 (up 4.6% in a year) and Bluffton is up 6.8%. Next door, Jasper County was the single fastest-growing county in the United States last year. Beaufort County's growth is carried entirely by in-migration; the largest age cohort is 70 to 74.

:::pullquote
The 12.4% residential share isn't an oversight. It's the strategy.
:::

The 12.4% residential share isn't an oversight. It's the strategy. Residential mortgage is a low-margin, high-friction product, and the bank's capital earns more in marine vessels and senior housing. Most of its mortgage-adjacent exposure runs through warehouse lines to mortgage bankers instead: lending to the lenders rather than the borrowers.

The trade-off is concentration of a different kind. The bank that wins the county's deposits participates only marginally in the county's defining economic event, the housing migration, leaving that volume to national digital lenders and the megabanks it out-deposits.

## A franchise running in two gears

Where this leaves Coastal States is unusual. By Beaufort County standards it's the entrenched incumbent: twenty-two years local, #1 deposit share, the only bank headquartered on the island. By balance-sheet standards it's a growth-stage specialty lender: newly public, expanding into Charleston, running national lending lines from Atlanta.

The two gears mostly complement each other. Local deposits fund national assets at spreads that produce a 3.61% NIM. The risk shows up at the seams: deposit costs in a competitive coastal market, the efficiency ratio of an expansion footprint, and credit migration in specialty books that haven't been through a full cycle at this scale.

Q1 gave a cleanly positive read: $6.3 million in net income, core deposit growth that outran loan growth, and an allowance covering 103.5% of nonperformers. For a bank eight months into life as a public company, the numbers say the model is holding. The next few quarters of Charleston buildout will say whether it scales.
    `,
  },
  'oconee-federal-quiet-comeback': {
    title: 'The Quiet Comeback at Oconee Federal',
    description: 'The 102-year-old Seneca thrift saw core earnings triple while the headline number said decline. How a long-duration mortgage book repriced its way out of the rate shock, and why the next leg is harder.',
    publishedDate: 'June 10, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '6 min read',
    content: `
*Updated October 22, 2026: corrected the year of the Stephens Federal acquisition, the office count and the date of the buyback, and removed housing and migration figures we could not source.*

Three years ago, Oconee Federal looked like a cautionary tale. The 102-year-old Seneca thrift earned a 0.30% return on assets in 2023, spent 83 cents to make every dollar of revenue, and watched its long-duration mortgage book get steamrolled by the fastest rate-hiking cycle in four decades.

Today it's quietly putting up some of the best core numbers in its modern history. Almost nobody noticed, partly because the bank made itself harder to watch on purpose.

## The headline number is lying to you

Start with the figure that probably scared off anyone skimming the annual release: net income fell from $6.3 million in fiscal 2024 to $4.2 million in fiscal 2025. A 33% earnings decline. Sounds bad.

It isn't. Fiscal 2024 included a $4.9 million bargain purchase gain from the January 2024 acquisition of Mutual Savings Bank in Hartsville, a one-time accounting entry that shows up when you buy a bank for less than the fair value of its net assets. Strip it out and the real story inverts: core earnings went from roughly $1.4 million to $4.2 million.

:::pullquote
That's a tripling, dressed up as a decline.
:::

The quarterly cadence since then confirms it. $1.3 million in the September 2025 quarter (up from $790K a year earlier). $1.1 million in December. $1.13 million in March 2026. Net interest margin, the cleanest read on a thrift's health, has marched from 2.19% in early 2024 to 2.36%, then 2.71%, then 2.75%, and now 2.94%.

Nothing clever happened here. Oconee Federal holds a loan book that is 81% one-to-four family residential mortgages, $397 million of its $488 million in net loans. When rates spiked in 2022, those long fixed-rate loans were stuck yielding yesterday's coupons while funding costs jumped. The fix was time. Loans mature, new ones get written at today's rates, and the margin grinds back. Two years of grinding got them 75 basis points.

## The thrift that beats Wells Fargo at home

Here's the stat that should make larger competitors uncomfortable. In Oconee County, Oconee Federal holds $368.9 million in deposits across four branches, about 22.3% of the county's $1.66 billion total. That's the #1 position.

Wells Fargo is second at $261.6 million. Truist holds $161.9 million. Bank of America, with all its national advertising muscle, manages $106.2 million.

:::stat
**22.3%**
Oconee Federal's deposit market share in Oconee County — the #1 position, ahead of Wells Fargo, Truist, and Bank of America.
:::

A century-old savings and loan, with a product menu you could fit on an index card, out-gathers three of the four largest banks in America on its home turf. Deposit franchises like this are why community banking still works. They're also nearly impossible to build from scratch, which is why the bank's $560.6 million in total deposits (up from $486.5 million at the end of 2023) is the asset that matters most on its balance sheet.

And that balance sheet is built like a vault: equity to assets of 12.4%, capital ratios management plausibly describes as among the highest in the industry, and a $0.10 quarterly dividend that has now been paid 58 consecutive quarters, every quarter since December 2011.

## Getting smaller in public, bigger in private

In August 2023, Oconee Federal voluntarily delisted from NASDAQ and deregistered from the SEC. The shares now trade on OTCQX. The stated reason was cost, and for a bank that was then earning $1.4 million a year in core income, the price of being a public reporting company was real money.

That move fits a pattern worth watching among sub-$1 billion banks: shed the compliance overhead that exists for institutional investors who were never going to show up anyway, and redeploy the savings.

What the bank did with its newfound quiet is the interesting part. It didn't hunker down. It bought Mutual Savings Bank, its second whole-bank acquisition (Stephens Federal in Georgia, in 2014, was the first), extending its footprint to eight offices across Upstate South Carolina, two Georgia counties, and now Hartsville. It announced a 50,000-share buyback in April 2026. The supposedly sleepy thrift has been the most acquisitive bank in its weight class in the region.

## The Lake Keowee question

Oconee Federal's geography has been a gift. Retirees have been moving to South Carolina in large numbers, and Oconee County, home to Lake Keowee and Lake Hartwell, is precisely where a lot of them land.

For a residential mortgage lender, that's about as good as local conditions get. And the bank has been leaning in: total loans grew from $478.7 million last June to $491.8 million by March, brisk movement for an institution this conservative.

But the tide may be turning just as the bank speeds up. Countywide median sale prices went slightly negative year over year this spring even as price per square foot kept rising. Seneca's typical home value sits at a modest $273,146, up 3.7%, so the core market is fine. The froth, though, is coming off the waterfront.

None of this threatens a bank with 12.4% capital. It does mean the next leg of growth gets harder. Margin recovery from repricing is a finite resource; once the back book catches up to market rates, growth has to come from volume. And volume in a cooling, migration-dependent housing market is exactly where speed and borrower experience start to decide who wins the loan.

## What the comeback doesn't fix

Oconee Federal's recovery is a balance sheet story with a happy ending. The franchise, the deposits, the capital, the patience: all of it is real, and most banks would trade for it.

What time alone can't fix is the front of the house. The retirees relocating to Keowee are selling homes through digital-first lenders, wiring proceeds through apps, and arriving with expectations set by whoever closed their last mortgage in three weeks. A bank can dominate county deposits for a century and still lose the next loan to a lender that verifies income in an afternoon instead of a week.

:::pullquote
A bank can dominate county deposits for a century and still lose the next loan to a lender that verifies income in an afternoon instead of a week.
:::

The banks that hold positions like Oconee Federal's have already won the hard part. The remaining gap, the one between a great balance sheet and a great borrower experience, is the most closable problem in community banking. The ones that close it get to keep compounding for another hundred years.

    `,
  },
  'arthur-state-bank-upstate-bet': {
    title: 'The Bank That Depression Built',
    description: 'Arthur State Bank has run a 4.44% net interest margin and 16% ROE out of a declining South Carolina county for 93 years. The secret is portfolio lending, a booming Upstate geography, and a family that has never needed to sell.',
    publishedDate: 'June 6, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '7 min read',
    content: `
*Updated October 22, 2026: corrected the month of the 1933 bank holiday, the Texas ratio and reserve coverage, and BMW's investment, and removed economic figures we could not source.*

In 1933, Harry Arthur watched the banks in Union, South Carolina fail to reopen. So he built one. Ninety-three years later, it's still in the family, and it's posting numbers that would make most regional bank CFOs uncomfortable.

Arthur State Bank is not a name that shows up in earnings coverage or fintech conference panels. It has 18 branches, 152 employees, and $825 million in assets. It is, by almost any measure, a small community bank in a part of South Carolina that has seen better decades.

And yet: a 4.44% net interest margin. A 16% return on equity. A Texas Ratio around 6%. A Tier 1 capital ratio of 12.17%.

Those are not small bank numbers. Those are the numbers of an institution that has figured something out.

## Born in a Crisis, Built to Last

The origin story matters here.

It's March 1933. Franklin Roosevelt has just ordered every bank in America closed for a "bank holiday." When the dust settles in Union County, South Carolina, only one bank is deemed sound enough to reopen, and it's in Jonesville, not Union itself. The county seat has no functioning bank.

Harry Arthur, 33 years old, owned department stores, hosiery mills, and cattle herds. He had deposits to protect and a town to keep liquid. So he and his father and two brothers started the Arthur Depository. It became a full bank two years later. The family has run it ever since.

That founding context is not incidental. Banks born in crises tend to develop a constitutional aversion to risk that outlasts the people who lived through it. Arthur State Bank's Texas Ratio around 6% and non-current loan ratio of about 0.6% are not accidents. They are the institutional expression of a family that watched the alternative play out in real time.

:::pullquote
Banks born in crises tend to develop a constitutional aversion to risk that outlasts the people who lived through it.
:::

## The Numbers That Don't Fit the Zip Code

Union County is not a growth market. The town where Arthur State Bank was founded is, by most economic metrics, struggling.

Banks headquartered in markets like this are supposed to struggle too. Deposit pressure, thin loan demand, margin compression. That's the playbook.

Arthur State Bank is running a 4.44% net interest margin. The industry average for community banks right now is around 3.36%. The gap between those two numbers, sustained over $825 million in assets, is the difference between a bank that's grinding and one that's compounding.

:::stat
**4.44%**
Arthur State Bank's net interest margin, against a community bank industry average of 3.36% — a 108 basis point edge sustained over $825 million in assets out of one of South Carolina's most economically stressed counties.
:::

How do you run a 4.44% NIM out of Union, South Carolina? Two reasons.

First, they portfolio-lend. Half the loan book (50.4%) is residential mortgage, and rather than selling those loans into the secondary market, Arthur State keeps them. That means the yield stays on their balance sheet instead of being passed through to Fannie Mae. It also means they're making relationship-based credit decisions rather than conforming to GSE guidelines on every file. A borrower with a complex income history who has kept a checking account at Arthur State for fifteen years gets a fair look. A big bank's algorithm says no.

Second, their geography is more interesting than their headquarters suggests.

## The Upstate Bet

Arthur State Bank's 18 branches don't cluster around Union. They spread across Spartanburg, Greenville, Lexington, Rock Hill, and Columbia. That geographic footprint tells the real story.

Greenville-Spartanburg is one of the ten fastest-growing metro areas in the country for the second consecutive year. The region added more than 10,500 residents between July 2023 and July 2024 alone. BMW's Spartanburg plant employs 11,000 people, and the company's $1.7 billion South Carolina EV investment includes a battery assembly plant in nearby Woodruff. Michelin, Boeing, GE, and Lockheed Martin all have significant operations in the corridor.

:::stat
**10,500**
Residents added to the Greenville-Spartanburg metro in a single year, making it one of the ten fastest-growing metros in the country and the primary driver behind Arthur State Bank's residential mortgage concentration strategy.
:::

A bank with roots in declining Union County but branches throughout that growth corridor is quietly positioned in one of the best lending environments in the Southeast. The residential mortgage concentration starts to make more sense when you realize the collateral is increasingly located in a market where median home prices are $397,600 and rising 4.1% year-over-year.

## A Leadership Moment

January 2024 was a quiet inflection point.

CFO Danny Cook retired after a long tenure, and the bank responded with a simultaneous restructuring: five internal promotions to the C-suite and two new loan officer hires. JB Garrett came in as the new CFO, bringing 25 years of banking experience and a prior stint at GrandSouth Bank. John Gregory, a 19-year Arthur State veteran, was elevated to COO and Chief Lending Officer. Shannon Rector, with 33 years at the bank, became CTO.

What's notable about this is what didn't happen. No outside management consultants. No outside CEO. No private equity interest. The family promoted from within, brought in one experienced outside CFO, and signaled continuity. In an era when community banks of this size are routinely acquired by regionals, Arthur State responded to a leadership transition by doubling down on independence.

:::pullquote
They're not moving fast. They don't need to. The market is coming to them.
:::

The Q1 2026 numbers suggest it's working. ROA of 1.07%. Net income of $2.19 million for the quarter. Earning assets at 93.6% of total assets. These are not the metrics of a bank drifting.

## The Quiet Risk

There are things worth watching.

The efficiency ratio of 71.09% is acceptable but not exceptional. For a bank generating a 4.44% NIM, there's an argument that expenses should be tighter. A more digitally efficient operation might get that number into the mid-60s without sacrificing the relationship model that drives the margin.

The Union County exposure is real. The bank's headquarters market is economically stressed, and community banks are often the lender of last resort in markets like this. That's not inherently bad, but it creates concentration risk in a geography that may face continued headwinds as manufacturing employment continues to shift away from legacy textile towns.

And the interest rate environment is changing. A 4.44% NIM is partly a function of a higher-rate world. As the Fed's projected path brings rates to 3.125% by end of 2026, the funding cost relief will help borrowers but compress asset yields. Banks that built their margin on rate positioning will need the volume to compensate.

Arthur State has the capital to absorb that transition. Tier 1 at 12.17%, loan loss reserves covering non-current loans at about 173%, essentially no owned real estate on the books. The balance sheet is clean.

## What 93 Years Buys You

The thing about a bank that has been family-owned for 93 years is that it doesn't optimize for next quarter. The Arthur family has survived the Great Depression, the savings and loan crisis, the 2008 financial crisis, and the rate shock of 2022-2023. They didn't sell after any of those.

That institutional patience shows up in the portfolio lending strategy, in the long-tenured executives, in the decision to promote from within rather than sell out when the CFO retired. It shows up in a Texas Ratio that would be the envy of banks twice their size.

The Upstate South Carolina economy is in the middle of a genuine industrial renaissance. BMW is building its electric future here. The population keeps coming. The loan demand follows. Arthur State Bank has 18 branches sitting in the path of that growth, a clean balance sheet, and a management team that has been preparing for this moment for a long time.

They're not moving fast. They don't need to. The market is coming to them.

    `,
  },
  'affirm-vs-community-bank-personal-loans': {
    title: 'The Two-Second Loan',
    description: 'Affirm approved 24 million Americans for credit last year using real-time cash flow data and ML underwriting. Your community bank probably took a week. Here is what that gap actually means, and what banks can do about it.',
    publishedDate: 'June 6, 2026',
    readTime: '7 min read',
    content: `
Affirm approved 24 million Americans for credit last year. Your community bank probably took a week to approve one.

That's not a knock on community banks. It's a description of what happens when one side of a lending market rebuilds itself around real-time data and the other side still faxes pay stubs.

The personal loan market is at a record $277 billion in outstanding balances as of Q1 2026, up 21.7% year-over-year. Affirm alone processed $10.8 billion in loan volume in a single quarter, growing 42% from the prior year. They just turned profitable. Their average customer takes out 6.1 loans per year across the platform.

:::stat
**$277B**
Outstanding personal loan balances as of Q1 2026, up 21.7% year-over-year — a market that largely didn't exist at this scale a decade ago.
:::

Community banks are watching this happen from the sidelines.

## How Affirm Actually Works

The mythology around BNPL is that it's just installment credit with a better app. The reality is more interesting.

When a consumer checks out at Walmart, Amazon, or one of Affirm's 330,000+ merchant partners, Affirm runs a real-time underwriting decision in seconds. Not minutes. Not hours. The model pulls from three data sources simultaneously: a traditional bureau inquiry, the consumer's Affirm repayment history if they've borrowed before, and live bank account data through Plaid, which shows cash flow, recurring deposits, and spending patterns.

The bank account data is the key differentiator. A credit score tells you what a borrower did in the past. Cash flow data tells you what they can pay next month. Affirm's models weight the latter heavily, which is how they achieve a 79% approval rate while keeping charge-offs at 1.83% of loans. For context, that's lower than most community bank credit card portfolios.

:::pullquote
A credit score tells you what a borrower did in the past. Cash flow data tells you what they can pay next month.
:::

The whole process: two seconds at checkout.

## The Community Bank Version

A community bank personal loan works like this.

You come in (or apply online, if the bank has gotten that far). You provide proof of income, a few months of bank statements, and your Social Security number. A loan officer pulls your credit, reviews the file, and either approves it, escalates it for a second review, or declines it. The industry average from application to funding is 3-7 business days. Origination costs run $200-300 per loan before you factor in overhead.

The community bank version is not inherently worse. Local decision-making, relationship context, and the ability to consider factors that a model would miss are real advantages. A farmer with lumpy seasonal income who has banked at the same institution for 20 years is a good credit risk in ways that don't show up cleanly in a bureau pull.

But the community bank version is slower, more expensive to originate, and invisible at the moment of purchase. Affirm is embedded in the checkout flow. Your community bank is not.

## Who Is Actually Borrowing

Here's where it gets complicated.

Affirm's borrower profile skews toward FICO 600-699, the subprime and near-prime range. These are consumers who often can't get a credit card with a reasonable rate, or who don't want one. BNPL gives them point-of-sale credit with clear repayment terms and no revolving balance trap. From a consumer welfare standpoint, that's genuinely useful.

The problem is what happens at the margin. CFPB complaints against BNPL companies jumped 45% in 2026. The primary issues: hidden fees, inconsistent credit reporting (Affirm reports to Experian on some products but not others), and consumers stacking multiple simultaneous BNPL loans across providers without any single lender seeing the full picture.

The Trump administration signaled in 2025 that it would not enforce the CFPB's 2024 rule placing BNPL under Regulation Z, which would have required the same consumer protections as credit cards. So the regulatory arbitrage that made BNPL attractive to build on continues, at least for now.

Community banks don't have this problem, exactly. But they have a related one: the consumer loan quality at community banks worsened in 2024, more than at large banks. The most creditworthy, tech-comfortable borrowers went to Affirm. The community bank consumer loan book is left with a harder-to-underwrite pool.

## The Widening Gap

The data that should concern community bank executives most isn't Affirm's GMV growth. It's the transaction frequency.

Affirm's active consumers averaged 6.1 transactions per year in Q1 2026, up from 5.1 a year earlier. This is not a product people use once for a big purchase. It's becoming a primary financial tool for how tens of millions of Americans manage spending. The Affirm Card, a physical debit card tied to the platform, grew its active base 121% year-over-year to 3.7 million cardholders.

That's the real competitive threat. Not a faster personal loan. A parallel financial infrastructure that intercepts the customer relationship before a community bank even gets a chance to offer one.

:::pullquote
Affirm has 24 million active borrowers averaging 6 loans a year because they show up at the exact second the decision gets made.
:::

The cost math matters too. Affirm's scale allows it to originate at a fraction of a community bank's per-loan cost. Banks that have digitized their consumer lending can get origination costs down to $60-80 per loan from $200-300, but most community banks haven't made that investment.

:::stat
**$60-80**
Per-loan origination cost for digitized community banks, versus $200-300 for traditional manual processes — a gap that compounds across every loan in the book.
:::

## What Community Banks Can Actually Do

The answer is not to out-Affirm Affirm. Community banks cannot build real-time ML underwriting at checkout in a reasonable timeframe or budget.

The answer is to close the data gap on the borrowers they do see.

Affirm's edge is speed of information: they know a borrower's cash flow position in real time before making a credit decision. Community banks have access to that same data on their existing customers, depositors who have been running checking accounts at the institution for years. The problem is that most community banks don't use it. Income verification still means paper pay stubs. Employment verification still means a phone call to HR.

The banks that will compete are the ones that can turn their existing customer data into fast underwriting decisions, not two-second checkout approvals, but same-day personal loan decisions for known customers with verified income and clear cash flow. That's achievable. It requires connecting the right data sources in the right sequence, automatically, instead of asking a loan officer to chase documents.

Affirm built a data infrastructure to serve customers banks weren't reaching. The next move for community banks is to use data infrastructure to serve customers they already have, faster than anyone else can.
    `,
  },
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

:::stat
**$18.7 billion**
SpaceX's 2025 revenue, up 33% year-over-year, with Starlink alone generating $11.4 billion and $4.4 billion in operating profit.
:::

OpenAI and Anthropic are a different animal. OpenAI is targeting a $60 billion raise at an $852 billion valuation, with 2025 revenues of roughly $20 billion and a projected $14 billion net loss in 2026. Anthropic's annualized revenue run rate is about $47 billion (up from $10 billion a year ago), but the company has never disclosed a path to profitability.

These are not valuations grounded in discounted cash flows. They are bets on category dominance in a technology that may be the most consequential since the internet. That's not irrational. It is, however, a different kind of risk than buying into a company that makes rockets and sells broadband.

## The Bank Lending Problem Nobody Is Talking About Loudly Enough

The underwriting fees are the visible part. The scarier number is on the loan book.

US banks have committed $450 billion in AI-related lending, representing roughly 25% of aggregate Tier 1 capital for participating banks. That's an 80% surge over the past year. The commitments are largely undrawn, meaning actual drawn AI loans represent only about 0.8% of total bank assets today. But committed facilities convert fast when a borrower needs liquidity.

:::stat
**$450 billion**
US bank commitments to AI-related lending, representing 25% of participating banks' aggregate Tier 1 capital — an 80% surge in a single year.
:::

The Chicago Fed has flagged this explicitly: prolonged high interest rates could trigger massive losses if committed facilities get drawn during adverse conditions. The St. Louis Fed noted that AI investment contributed 39% of US GDP growth in 2025, a higher share than tech contributed at the peak of the dot-com bubble in 2000 (28%).

That last comparison deserves to sit with you for a moment.

:::pullquote
US banks have committed $450 billion in AI-related lending — 25% of Tier 1 capital — and 80% of that exposure was added in the last year alone.
:::

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

:::pullquote
AI investment contributed 39% of US GDP growth in 2025. At the dot-com peak in 2000, tech contributed 28%. That comparison doesn't disappear just because the companies are bigger this time.
:::

We're about to find out if that's a question the market is ready to answer.
    `,
  },
  'anderson-brothers-bank-myrtle-beach-bet': {
    title: 'From Tobacco Warehouses to Myrtle Beach: The Quiet Dominance of Anderson Brothers Bank',
    description:
      'Anderson Brothers Bank runs a 6.1% net interest margin, a 16.7% ROE, and grew from $500M to $2.28B in assets in a decade without a single acquisition. The story is Myrtle Beach, a 60% deposit monopoly in rural SC, and 92 years of patience.',
    publishedDate: 'May 31, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '7 min read',
    content: `
*Updated October 22, 2026: corrected 2025 return on assets, Marion County household income, the dates of the credit-quality figures, Horry County ranking and Forbes listing, and asset size.*

In 1933, two brothers started a bank in Mullins, South Carolina by financing tobacco farmers from the back of a warehouse. Ninety-two years later, that same bank is posting a 16.7% return on equity, a net interest margin more than double the industry average, and a stock price that has gone from $23 to $1,000 a share.

Anderson Brothers Bank is not a bank most people outside the Pee Dee region have heard of. It probably should be.

## The Numbers That Don't Make Sense at First

A 6.1% net interest margin. That's the figure that stops you when you pull the call report data for Anderson Brothers Bank.

The industry average NIM for community banks is around 3.3%. Most banks would consider 4% a very good year. Anderson Brothers is running at nearly twice that, and it's not a fluke of one quarter. ROA came in at 1.38% for 2025 and 1.48% in the first quarter of 2026. ROE at 16.7%. The efficiency ratio sits at about 59%, meaning for every dollar the bank brings in, it spends 59 cents running the place. Not spectacular on its own, but strong for a bank growing assets at 12% a year.

Full-year 2025 net income: $29 million. Record.

:::stat
**6.1%**
Anderson Brothers' net interest margin, nearly double the community bank industry average of 3.3%.
:::

To put that in context, the bank had $500 million in total assets in 2015. Today it has $2.19 billion. That's 16% compounded annual growth over a decade, and not a single acquisition since buying Anderson State Bank in Hemingway in 2000. Every dollar of growth has come the hard way.

How does a community bank in rural South Carolina generate margins that would make most regional bank CFOs do a double-take? Two things: what they lend, and who they fund it with.

## The Tobacco Town Funding Machine

Anderson Brothers' home market is Marion County, South Carolina. This is not a glamour market.

Population: approximately 28,215 people, declining at about 0.5% per year. Median household income: about $36,300. Every county in the Pee Dee region recorded more deaths than births from 2020 to 2023. The economic base is agricultural and light industrial: Sopakco Packaging, DMA Sales, tobacco farming legacy.

What that market lacks in growth it more than compensates for in deposit loyalty. Anderson Brothers holds roughly 60% of Marion County deposits. That's not a market share number, that's a lock. When you fund your loan book with low-cost deposits from a market where you've been the dominant bank for 90 years, your cost of funds stays structurally below what banks in competitive urban markets can achieve. That deposit advantage flows directly into NIM.

:::pullquote
60% of Marion County deposits. That's not a market share number, that's a lock.
:::

The bank explicitly tracks this. Management describes its retained earnings model as generating 16%+ return on reinvested capital, compounding equity without dilution. That framing is unusual for a community bank. It reflects a discipline about how deposit advantage translates into compounding shareholder value over time.

## The Non-Prime Auto Bet

The other half of the margin story is what Anderson Brothers lends.

Consumer loans represent about 27% of the loan book, a notably high share for a bank this size. The product driving that number is non-prime indirect auto lending, a specialty the bank has deliberately built and maintained. Non-prime borrowers pay higher rates. They also default more. The bank's management is not naive about this: the shareholder letter acknowledges that auto delinquencies peaked in mid-2024 and spent most of 2025 recovering. As of early 2026, past-due accounts in that portfolio had returned to their lowest level since September 2022.

The math works because the yield on non-prime auto more than compensates for the higher loss rate, especially when you're funding it with 60%-market-share rural deposits. Anderson Brothers is essentially running a carry trade that most community banks either can't execute or won't touch. They've been doing it long enough to manage the cycle.

Credit quality across the full book is clean. Non-current loans were 0.60% of the portfolio in the first quarter of 2026. The Texas Ratio (a measure of problem assets relative to capital and reserves) is 4.16%. Any figure below 10% is considered healthy. The loan loss reserve covered non-current loans about 2.75 times over. These are not the numbers of a bank taking reckless risk.

:::stat
**0.60%**
Anderson Brothers' non-current loans as a share of the portfolio in the first quarter of 2026.
:::

## Six Years, Eleven Spots

The story that explains where Anderson Brothers is going is Horry County.

Myrtle Beach is a different world from Mullins. Horry County has unemployment around 3-4%, median home prices around $327,000-$360,000, over $100 million in active hotel investment, and a tourism-driven economy that has grown consistently for two decades. LinkedIn named Myrtle Beach one of its Top Cities on the Rise in July 2025.

In 2018, Anderson Brothers Bank ranked 11th in Horry County deposit market share among 20 competing banks. Today they rank 2nd.

:::pullquote
Eleven spots in six years. In a market where they started as an outsider, against banks that had been there for decades.
:::

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

In 2018, Forbes named them 3rd best bank in South Carolina on its inaugural America's Best in State Banks list, based on customer surveys covering trust, digital services, branch services, and financial advice.

For a 92-year-old bank headquartered in a town of 4,500 people, this is a lot of momentum. The tobacco warehouse is long gone. What replaced it is a bank running margins its competitors can't quite explain, from a deposit base that took 90 years to build, pointed directly at one of the fastest-growing coastal markets in the South.

The Anderson family has been patient before. A $23 share, thirty years ago, turned into a thousand. The next move is into Myrtle Beach.

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

:::pullquote
The Work Number charges $55–$70 per verification. Plaid does the same job in seconds for $1–$3. That gap is not regulatory necessity. It's infrastructure debt.
:::

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

Meanwhile, the lender also needs to verify employment. If the employer is in The Work Number's database, an automated report comes back instantly. But The Work Number's coverage is inconsistent for small businesses, nonprofits, newer companies, and gig platforms. When an employer isn't in the database, a human initiates outbound verification: independently validate the employer's phone number and physical location, call HR, verbally confirm employment status and job title, and obtain income details in a separate written format. Fannie Mae requires a [verbal VOE](/glossary/verification-of-employment) completed within 10 business days of the loan note date regardless, which means lenders cannot do this step early. It becomes a closing-week bottleneck on every single file.

For self-employed borrowers, add a year-to-date profit and loss statement to the stack. Underwriting complexity scales up from there.

**Total income verification cost per mortgage file:** IRS transcript ($40+ per order, plus resubmission costs), Work Number ($55–280 depending on borrower count and timing), staff time for manual calls and document chasing. The average cost to originate a mortgage was approximately $11,800 in Q2 2025. Income verification is not a trivial line item.

:::stat
**$11,800**
The average cost to originate a mortgage in Q2 2025 — income verification alone can consume hundreds of dollars of that total through The Work Number and IRS transcript fees.
:::

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

:::pullquote
The verification delay is not an immutable fact of lending. It's a product of infrastructure built on top of institutions that did not design their systems around lender speed.
:::
    `,
  },
  'southern-first-bank-upstate-sc-bet': {
    title: 'The Bank That Bet on Upstate South Carolina (And Won)',
    description:
      'Southern First Bancshares just reported Q4 EPS up 73% year-over-year. The story behind that number is 30 people a day moving to Greenville-Spartanburg, a $1.7 billion BMW investment, and a 26-year-old relationship banking bet that\'s finally paying off.',
    publishedDate: 'May 24, 2026',
    updatedDate: 'October 22, 2026',
    readTime: '8 min read',
    content: `
*Updated October 22, 2026: corrected the names of the bank's president and CFO, full-year net charge-offs, the period of the net interest margin and the real estate share of loans.*

Art Seaver has been running Southern First Bank for 26 years. He's watched Greenville go from a post-textile mill town to a metro that just crossed one million residents. That context matters when you look at what his bank just reported.

Q4 2025 earnings per share: $1.21. Up 73% from a year ago.

## The Numbers First

Southern First Bancshares finished 2025 with $30.4 million in net income, a fourth-quarter net interest margin of 2.72% (up 47 basis points year-over-year), and a loan book that grew 6% to $3.85 billion. CEO Art Seaver, President Calvin Hurst, and CFO Christian Zych have spent the last two years fighting margin compression like every other community bank in America. They've come out the other side in genuinely strong shape.

The credit quality numbers are almost hard to believe.

Net charge-offs for the entire year: about $84,000. On a $3.85 billion portfolio. That's not a rounding error, that's a bank whose borrowers are paying their bills. Nonperforming assets sit at 0.32% of total assets. Past due loans are 0.13%.

That kind of performance doesn't happen by accident. It happens when you're lending into a market that keeps growing.

:::pullquote
Net charge-offs for the entire year: about $84,000. On a $3.85 billion portfolio. That's not a rounding error, that's a bank whose borrowers are paying their bills.
:::

## 30 People a Day

Here's the thing about Upstate South Carolina that most people outside the region don't fully appreciate.

Thirty people relocate to the Greenville-Spartanburg area every single day. South Carolina netted over 68,000 domestic migrants in 2023-2024 alone, and the Upstate captured the overwhelming share of that growth. They're coming from Florida, New York, Ohio, Michigan, Pennsylvania, Connecticut, California. People leaving high-cost metros for a lower cost of living.

Greenville County added 11,049 new residents in a single year. The Greenville metro just crossed one million people for the first time, adding nearly 86,000 residents since the 2020 Census.

Every one of those households needs a checking account. A mortgage. A car loan. A small business line of credit when the new restaurant opens on Main Street. Southern First has been standing in that town for over two decades, with the relationships and the brand recognition to capture a meaningful slice of that demand.

That's not luck. That's geography compounding over time.

## The BMW Effect

Migration doesn't happen in a vacuum. People follow jobs, and the Upstate has been manufacturing jobs at a remarkable clip.

BMW's plant in Spartanburg is already the largest BMW Group facility in the world by production volume. Now they're doubling down. A $1.7 billion investment in EV production, plus a new battery plant in Woodruff set to open in 2026, will bring hundreds more jobs online in Southern First's backyard. The annual economic impact of the BMW operation alone totals approximately $26.7 billion across South Carolina, per a University of South Carolina study.

:::stat
**$1.7 billion**
BMW's EV production investment in Spartanburg, landing in Southern First's primary lending territory and anchoring the industrial job growth that drives the bank's residential and commercial loan demand.
:::

Spartanburg County landed $3.5 billion in total new investment last year across 20 projects. Greenville's development arm secured $725 million in new capital and 1,293 jobs. The region now hosts 508 foreign companies from 38 countries, drawn by the BMW supplier ecosystem, Michelin, Boeing, GE, Lockheed Martin, and a manufacturing base that keeps expanding.

When a bank's loan book is 44% commercial real estate and 30% consumer real estate, this is the environment you want to be operating in. Rising incomes, population inflows, new commercial construction, and homebuyers who came from markets where $312,000 felt like a deal.

## What the Margin Recovery Actually Means

Southern First's NIM story is worth unpacking because it tells you something about how they're positioned going forward.

Two years ago, like most community banks, they were caught in a painful squeeze. Deposit costs rose fast. Loan yields repriced slowly. Margins compressed. The 2.72% they're reporting now isn't just a recovery, it's the result of a deliberate push into relationship-based deposit gathering that took time to show up in the numbers.

Core deposits grew 8% year-over-year to $2.9 billion. That's the stat that matters most. It means the funding base is stable and relatively low-cost. It means the margin expansion isn't just a rate environment gift, it's structural.

Efficiency ratio came in at 57.85% in Q4. Not best-in-class, but moving in the right direction for a bank that's been investing in growth markets.

## The Question Worth Asking

Southern First is, by almost any measure, performing well. The region they serve is genuinely one of the best economic stories in the country right now.

But about 84% of their loan book is secured by real estate, commercial and consumer combined, by the company's own loan categories. And the Greenville housing market is shifting.

Inventory is up 28.2% year-over-year. Days on market climbed to 71, up from 62 a year ago. The median sales price dipped 0.8%. None of these numbers signal a crash. They signal a market normalizing after years of frenzied appreciation, which is healthy. But normalization looks different on a bank balance sheet than it does in a real estate brochure.

The honest read is that Southern First's credit quality has benefited from a rising-tide market. Borrowers who got in trouble could sell. Collateral values held. That cushion is thinner now. Not gone, just thinner.

The BMW battery plant is set to open this year. Migration is still running at 30 people a day. The industrial investment pipeline is full. Those are real tailwinds and Art Seaver has been navigating this market long enough to know the difference between a headwind and a speed bump.

:::pullquote
For now, the numbers say this is a bank that has earned the right to be optimistic.
:::

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

:::pullquote
118,727 households entered foreclosure in Q1 2026. Up 26% from a year ago. The worst quarterly number in six years.
:::

## The Stress Has an Address

This isn't a broad-based mortgage collapse. It's surgical. Almost all of it is concentrated in one loan type: FHA.

As of March 2026, **11.6% of FHA borrowers were delinquent.** FHA loans now account for **55% of all seriously delinquent mortgages** in the country, despite being a fraction of total outstanding balances.

:::stat
**11.6%**
Share of FHA borrowers delinquent as of March 2026 — and FHA loans now represent 55% of all seriously delinquent mortgages in the country.
:::

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

:::pullquote
The Homeowner Assistance Fund runs out in September 2026. The safety net programs that kept the 2020 forbearance wave from becoming a foreclosure wave are gone now.
:::
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

:::pullquote
The average cost to originate a mortgage: $11,094. The average profit per loan: $785. That's a 7% margin on a process that takes six weeks.
:::

The average profit per loan? $785.

That's a 7% margin on a process that takes six weeks and involves dozens of manual steps. Origination costs have risen 35% over the past three years, according to Plaid's lending research. Revenue per loan has not kept pace.

At $11,094 per origination across a 42-day cycle, the daily carrying cost of an in-process loan is roughly $264. Every day a file sits waiting for a document is a day that cost accrues. Multiply that by your pipeline volume and the number gets uncomfortable fast.

:::stat
**$264**
The daily carrying cost of an in-process mortgage loan, based on $11,094 average origination cost spread across a 42-day cycle.
:::

## The Abandonment Problem

Here's where the cost becomes invisible — because it's the loans you never close.

Sixty-eight percent of mortgage applications are abandoned before closing, according to industry data tracked by the MBA. That's not 68% of unqualified applicants. That includes pre-approved borrowers who started the process and quit.

The reasons are predictable. The process is too slow. The document requests are too frequent. The communication is too opaque. Forty-eight percent of consumers who experience digital friction in financial services take their business to a competitor, according to J.D. Power.

Only 55% of mortgage applications at banks result in closings. That means for every two loans your team works, nearly one produces zero revenue — but consumed staff time, technology resources, and pipeline capacity.

:::pullquote
68% of mortgage applications are abandoned before closing. Those borrowers aren't disappearing from the market. They're closing with someone else.
:::

Those borrowers aren't disappearing from the market. They're closing with someone else.

## The NPS Cliff

Borrower satisfaction data tells the same story from the other side.

When borrowers need to call their lender for status updates — because the process doesn't proactively communicate — their Net Promoter Score drops by 83 points, according to J.D. Power's mortgage origination studies.

Eighty-three points. That's the difference between a promoter who refers three friends and a detractor who posts a one-star review. And it's driven by a single variable: whether the borrower felt informed or left in the dark.

In a 42-day process with dozens of moving parts, most borrowers end up calling. Most loan officers end up fielding those calls instead of originating new loans. The cycle reinforces itself.

## What Figure, Better, and Rocket Are Doing Differently

While community banks are managing 42-day timelines, a different class of lender has rewritten the math.

**Figure** approves HELOCs in 5 minutes and funds in 5 days. Their cost per loan is $730 — against an industry average of $11,230. That's a 15x cost advantage, and it drove $340.9 million in net revenue in 2024, up 62.7% year-over-year. They IPO'd at a $5.29 billion valuation.

:::stat
**$730**
Figure's cost per loan origination, versus the $11,230 industry average — a 15x cost advantage built entirely on automated verification pipelines.
:::

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
    publishedDate: 'March 17, 2026',
    readTime: '9 min read',
    content: `In 2018, banks originated 42.5% of all mortgages in the United States. By 2024, that number had fallen to 30.1%. Non-bank lenders — fintechs, independent mortgage companies, and digital-first platforms — now close more than half of all home loans, at 53.3% and climbing, according to the NCRC Mortgage Market Report and FDIC data.

This isn't a blip. It's a structural shift that has been accelerating for six years, and it's not limited to mortgages. Community banks' share of small business lending has been cut in half over two decades, falling from 24% to 12%, according to the Kansas City Fed. Fintech small business loan applications grew from 17% to 29% between 2020 and 2025.

Community banks aren't losing because of bad service. They're losing because the speed of their lending process no longer matches the speed their borrowers expect.

:::pullquote
Banks originated 42.5% of mortgages in 2018. By 2024, that fell to 30.1%. Non-bank lenders now close more than half of all home loans. This is a structural shift, not a cycle.
:::

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

:::stat
**$730**
Figure's cost to originate a loan, versus the MBA industry average of $11,230 — a 15x gap driven entirely by automated verification.
:::

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

:::pullquote
Community banks don't have a demand problem. They have a speed problem. And speed, unlike brand affinity or market presence, is a solvable engineering challenge.
:::

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
    publishedDate: 'March 10, 2026',
    readTime: '8 min read',
    content: `**54% of Gen Z rely primarily on non-traditional financial providers. 61% switched banks in the last two years. Only 14% trust traditional banks "a lot." Your future borrowers aren't just preferring digital — they're already gone.**

---

## The Generational Shift, in Hard Numbers

The data on younger consumers and banking is no longer directional. It is definitive.

According to a 2024 J.D. Power study, 29% of Gen Z consumers now consider a digital bank their primary checking account provider — up from 11% in 2020. Across all age groups, 44% of new checking accounts opened in 2024 went to fintechs and neobanks, not traditional banks (Cornerstone Advisors). Among Gen Z specifically, 54% rely primarily on non-traditional financial providers for core banking services (TransUnion, 2024).

And they are not sticking around to be won back. 61% of Gen Z consumers switched their primary bank in the past two years (Bankrate), compared to 28% of Gen X and 15% of boomers. Only 14% of Gen Z say they trust traditional banks "a lot" (Morning Consult).

This is not a preference. It is a migration.

:::pullquote
61% of Gen Z switched their primary bank in the past two years. Only 14% trust traditional banks "a lot." Your future borrowers aren't coming back — they were never there.
:::

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

:::stat
**$730**
Figure's cost per loan originated in 2024 — versus the $11,230 industry average — achieved by automating the data aggregation and verification work that community banks still do by hand.
:::

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

:::pullquote
For a Gen Z borrower whose baseline expectation was set by Figure and Rocket, this process is not "traditional." It is broken.
:::

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
    publishedDate: 'March 3, 2026',
    readTime: '10 min read',
    content: `**U.S. banks spend $59 billion a year on BSA/AML compliance alone. For community banks under $100 million in assets, compliance eats 8.7% of noninterest expenses — three times the rate at larger banks. The smallest banks pay the highest price for the same regulations.**

---

## The Scale of the Problem

Banking compliance in the United States costs an estimated $270 billion per year, consuming more than 10% of operating costs across the industry (American Bankers Association, 2024).

:::pullquote
For community banks under $100 million in assets, compliance eats 8.7% of noninterest expenses — three times the rate at large banks. The smallest banks pay the most for the same regulations.
:::

Of that total, $59 billion goes specifically to BSA/AML — Bank Secrecy Act and anti-money laundering programs (LexisNexis Risk Solutions).

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
    publishedDate: 'February 24, 2026',
    readTime: '11 min read',
    content: `Figure went from zero to $6 billion in annual home equity lending in four years. They close HELOCs in 5 days at a cost of $730 per loan — while the industry spends $11,230. They filed for a $5.29 billion IPO. And buried in their S-1 is a detail that should change how every community bank CTO thinks about competing with them.

Here is exactly what Figure is doing, where their speed actually comes from, and why the playbook is more replicable than you think.

---

## Figure by the Numbers

The scale is worth stating plainly.

Figure Technologies originated roughly $6 billion in home equity products in 2024, serving over 253,000 households. Net revenue hit $340.9 million, up 62.7% year-over-year. Their cost per loan sits at approximately $730 — compared to the Mortgage Bankers Association's reported industry average of $11,230 for a standard origination (MBA, 2025). That is a 15:1 cost advantage.

Their HELOC product approves borrowers in as little as 5 minutes and funds in 5 days. The industry median for a home equity line of credit is 39 days.

:::stat
**$730**
Figure's cost per loan — versus the industry average of $11,230. That is a 15:1 cost advantage, driven entirely by automated data aggregation.
:::

:::pullquote
Figure's cost per loan: $730. The industry average: $11,230. That's a 15:1 cost advantage — and it doesn't come from blockchain. It comes from automated data.
:::

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

:::pullquote
Figure's loan origination system "does not rely on the use of blockchain technology." The 5-minute approval comes from automated data aggregation. The same category of tech available to any lender willing to integrate it.
:::

Read that again. The system that originates $6 billion in home equity loans — the system responsible for the 5-minute approvals and 5-day closings — does not use blockchain.

What does it use? Automated data aggregation. Instant verification APIs. Digital workflows that eliminate manual handoffs. The same category of technology available to any lender willing to integrate it.

Figure's competitive advantage is not a proprietary blockchain. It is the decision to automate every verification step in the origination process and remove human bottlenecks from the critical path. The blockchain handles post-origination functions — securitization, secondary market trading, custody. Important for Figure's capital markets strategy, but irrelevant to why a borrower gets approved in 5 minutes.

This distinction matters because it means the speed advantage is not locked behind proprietary technology. It is an integration problem, not an invention problem.

---

## The Real Moat: Aggregation Speed

Figure's actual moat is the time between "borrower clicks apply" and "lender has verified data."

In a traditional origination, that gap is measured in weeks. The borrower fills out an application. The loan officer requests documents. The borrower gathers pay stubs, tax returns, bank statements. Someone uploads them. Someone else reviews them. Discrepancies trigger re-requests. The underwriter orders a credit report, an appraisal, a title search. Each step involves a queue.

The average mortgage file contains 500 pages of documentation (MBA). Lenders work from checklists with 55 line items. Borrowers submit an average of 16 separate documents per application. The process takes 42 days for a conventional mortgage, 77 days for FHA (ICE Mortgage Technology, 2025).

:::stat
**500 pages**
The average mortgage file size, per the MBA — assembled manually, document by document, across a 42-day origination cycle.
:::

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
    publishedDate: 'February 17, 2026',
    readTime: '12 min read',
    content: `What if verifying a borrower took 5 minutes instead of 5 weeks?

The average mortgage origination requires 16 separate documents, runs through a 55-item checklist, generates a 500-page file, and takes 42 days to close (ICE Mortgage Technology, MBA, 2025). The average cost: $11,094 per loan originated, with only $785 in profit at the end (MBA, 2025). Most of that time and cost is not spent making lending decisions. It is spent collecting and verifying data.

RAVEN replaces the collection phase. One link. One borrower interaction. Complete verification data back to the bank in minutes — identity, income, employment, property, and fraud screening — cross-referenced from seven providers with a full audit trail.

:::pullquote
The average mortgage file: 16 documents, a 55-item checklist, 500 pages, and 42 days. Most of that time is not spent making lending decisions. It's spent chasing data.
:::

Here is exactly how it works.

---

## The Current Process

A borrower walks into a branch or fills out an online application. The loan officer collects basic information, then begins the verification process.

Pull a credit report. Request pay stubs. Call the employer for verification. Wait for bank statements. Order an appraisal. Run KYC checks. Screen against OFAC and PEP watchlists. Cross-reference the address. Confirm employment dates. Check for fraud indicators.

Each of these steps involves a different system, a different provider, and often a different person. The loan officer toggles between platforms, re-enters data, waits for responses, and chases down discrepancies. Some verifications come back in hours. Others take days. An appraisal can take two weeks.

Meanwhile, the borrower waits. And 68% of mortgage applicants who start this process abandon it before closing. Among borrowers who experience digital friction, 48% take their business to a competitor (J.D. Power, Plaid).

:::stat
**68%**
The share of mortgage applicants who abandon the process before closing — not because they stopped wanting a loan, but because the verification workflow drove them away.
:::

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

:::pullquote
This is the difference between collecting data and verifying data. Traditional processes collect documents and trust that the borrower provided accurate information. RAVEN collects data from authoritative sources and tells the bank where the sources agree and where they do not.
:::

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

// 'June 26, 2026' → '2026-06-26'. Google's structured-data parser requires
// ISO 8601; human-readable dates are silently dropped.
function toIsoDate(publishedDate: string): string {
  const d = new Date(`${publishedDate} UTC`);
  return d.toISOString().slice(0, 10);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) {
    return { title: 'Article Not Found' };
  }
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `https://reportraven.tech/blog/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://reportraven.tech/blog/${slug}`,
      siteName: 'RAVEN',
      type: 'article',
      publishedTime: toIsoDate(article.publishedDate),
      modifiedTime: toIsoDate(article.updatedDate ?? article.publishedDate),
      authors: ['Isaac Welch'],
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

  const cleanContent = article.content
    .replace(/^[\s]*# [^\n]+\n+/, '')
    .replace(/^\*Published[^\n]+\*\n+/, '');
  const html = convertMarkdown(cleanContent);
  const roiBank = ROI_BANKS.find((b) => b.articleSlug === slug);
  const related = getRelatedArticles(slug);

  // Split the article at its middle <h2> so a CTA can sit mid-read.
  // Articles with fewer than 3 sections render in one piece (no mid CTA).
  const sections = html.split(/(?=<h2>)/);
  const splitAt = sections.length >= 3 ? Math.ceil(sections.length / 2) : sections.length;
  const firstHalf = sections.slice(0, splitAt).join('');
  const secondHalf = sections.slice(splitAt).join('');

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        url: `https://reportraven.tech/blog/${slug}`,
        image: 'https://reportraven.tech/opengraph-image',
        datePublished: toIsoDate(article.publishedDate),
        dateModified: toIsoDate(article.updatedDate ?? article.publishedDate),
        author: {
          '@type': 'Person',
          name: 'Isaac Welch',
          url: 'https://reportraven.tech/about',
          sameAs: [
            'https://www.linkedin.com/in/isaac-welch-22a463179',
            'https://github.com/i-Welch',
          ],
        },
        publisher: {
          '@type': 'Organization',
          name: 'RAVEN',
          url: 'https://reportraven.tech',
          logo: {
            '@type': 'ImageObject',
            url: 'https://reportraven.tech/icon.png',
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
        .article-body .article-meta-author { color: var(--gray-300); text-decoration: none; font-weight: 500; transition: color 200ms; }
        .article-body .article-meta-author:hover { color: var(--white); }
        .article-body .article-meta-audit { color: var(--gray-300); text-decoration: none; }
        .article-body .article-meta-audit:hover { color: var(--white); }
        .article-meta-audit {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--gray-300);
          text-decoration: none;
          font-weight: 500;
          transition: color 200ms;
        }
        .article-meta-audit:hover { color: var(--white); }
        .article-audit-callout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          margin: 3.5rem 0 1rem;
          padding: 2rem 2.25rem;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02));
          box-shadow: 0 12px 48px rgba(0,0,0,0.4);
        }
        .article-audit-tag {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gray-400);
          margin-bottom: 0.6rem;
        }
        .article-audit-callout h2 {
          font-size: 1.3rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          color: var(--white);
          margin: 0 0 0.5rem;
        }
        .article-audit-callout p {
          font-size: 0.88rem;
          color: var(--gray-400);
          line-height: 1.6;
          margin: 0;
        }
        .article-body .article-audit-btn, .article-body .article-audit-btn:hover {
          color: var(--black);
          text-decoration: none;
        }
        .article-audit-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          background: var(--white);
          color: var(--black);
          text-decoration: none;
          white-space: nowrap;
          transition: opacity 200ms, transform 200ms;
        }
        .article-audit-btn:hover { opacity: 0.85; transform: translateX(2px); }
        @media (max-width: 768px) {
          .article-audit-callout { flex-direction: column; align-items: flex-start; padding: 1.75rem 1.5rem; }
        }
        .article-related { margin-top: 3.5rem; padding-top: 2.25rem; border-top: 1px solid rgba(255,255,255,0.08); }
        .article-related-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--gray-500); margin-bottom: 1.25rem; }
        .article-related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .article-related-card { display: flex; flex-direction: column; gap: 0.6rem; padding: 1.25rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; background: rgba(255,255,255,0.015); text-decoration: none; transition: background 200ms, border-color 200ms; }
        .article-related-card:hover { background: rgba(255,255,255,0.035); border-color: rgba(255,255,255,0.16); }
        .article-related-title { font-size: 0.92rem; font-weight: 600; line-height: 1.4; color: var(--white); letter-spacing: -0.01em; }
        .article-related-meta { font-size: 0.75rem; color: var(--gray-500); margin-top: auto; }
        @media (max-width: 700px) {
          .article-related-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <article className="article-wrap">
        <a href="/blog" className="article-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          All articles
        </a>

        <div className="article-body">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <span>
              By{' '}
              <a href="/about" className="article-meta-author">
                Isaac Welch
              </a>
            </span>
            <span className="article-meta-dot" />
            <span>{article.publishedDate}</span>
            {article.updatedDate && (
              <>
                <span className="article-meta-dot" />
                <span>Updated {article.updatedDate}</span>
              </>
            )}
            <span className="article-meta-dot" />
            <span>{article.readTime}</span>
            {roiBank && (
              <>
                <span className="article-meta-dot" />
                <a href={`/audit/${roiBank.slug}`} className="article-meta-audit">
                  What RAVEN would save {roiBank.shortName}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              </>
            )}
          </div>
          <div dangerouslySetInnerHTML={{ __html: firstHalf }} />
          {secondHalf && (
            <>
              <aside className="article-mid-cta">
                <h2>Verification shouldn&apos;t take weeks</h2>
                <p>
                  RAVEN gives community banks a complete borrower report from one link.
                  Book a 20-minute call and see it live.
                </p>
                <CalendlyButton source="mid-article" label="Book a Demo Call" buttonClassName="article-mid-cta-btn" />
                {roiBank && (
                  <p className="article-mid-cta-alt">
                    Not ready to talk? We calculated what automation would save{' '}
                    {roiBank.shortName} every year:{' '}
                    <a href={`/audit/${roiBank.slug}`}>see the numbers</a>
                  </p>
                )}
              </aside>
              <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
            </>
          )}
          {roiBank && (
            <aside className="article-audit-callout">
              <div className="article-audit-text">
                <span className="article-audit-tag">RAVEN Analysis</span>
                <h2>What would automated verification save {roiBank.shortName}?</h2>
                <p>
                  We ran the numbers using public FDIC and HMDA data: staff hours recovered,
                  dollar value by lending line, and the full methodology behind every figure.
                </p>
              </div>
              <a href={`/audit/${roiBank.slug}`} className="article-audit-btn">
                See the numbers
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </aside>
          )}
          <LeadCapture variant="audit" source={`article:${slug}`} />
          <LeadCapture variant="subscribe" source={`article:${slug}`} />
          {related.length > 0 && (
            <nav className="article-related" aria-label="Related articles">
              <div className="article-related-label">Related reading</div>
              <div className="article-related-grid">
                {related.map((r) => (
                  <a key={r.slug} href={`/blog/${r.slug}`} className="article-related-card">
                    <span className="article-related-title">{r.title}</span>
                    <span className="article-related-meta">{r.readTime}</span>
                  </a>
                ))}
              </div>
            </nav>
          )}
        </div>
      </article>
    </>
  );
}
