import type { Metadata } from 'next';
import { getRelatedArticles } from '../articles-index';
import { notFound } from 'next/navigation';
import { CalendlyButton } from '../../calendly-button';
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
  readTime: string;
}

const articles: Record<string, Article> = {
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

The verification-of-employment call, the one your processor makes to the number the borrower provided, is not a fraud control. It's the attack surface. A fraud ring that can print a fake paystub can absolutely answer a phone and say "yes, she works here." The entire scheme is designed around the assumption that your bank verifies employment by calling a number on the application.

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
      'SilverLake powers 425 banks, Symitar serves 700+ credit unions. Neither ships a native digital LOS. Here is what Jack Henry actually provides for loan origination, what requires a separate license, and how the 950-partner integration ecosystem works in practice.',
    publishedDate: 'June 26, 2026',
    readTime: '6 min read',
    content: `
# Digital Lending on Jack Henry: What SilverLake and Symitar Actually Support

*Published June 26, 2026*

If you are a community bank CEO running a Jack Henry core, you have more company than you might think. SilverLake powers roughly 425 commercial banks, including about one in five U.S. banks in the $1 billion to $30 billion asset range. Symitar, Jack Henry's credit union platform, serves more than 700 credit unions with a 95% retention rate.

That footprint means when you search for Jack Henry Symitar loan origination or SilverLake digital lending, you are not asking a niche question. You are asking the same question hundreds of community banks asked this year. The real question underneath it: what does my core actually support, and what do I need to build or buy separately?

The honest answer: more than most vendors will tell you, and less than the marketing suggests.

## Two Platforms, Two API Layers

SilverLake and Symitar are not two names for the same product. They use completely different integration architectures.

SilverLake connects to third parties via jXchange (SOAP/XML). Symitar uses SymXchange (SOAP/WSDL). A fintech that wants to integrate both platforms must certify on each independently.

This matters for your vendor conversations. When a lending software vendor says "we integrate with Jack Henry," the next question is: which Jack Henry? Certified on SilverLake via jXchange is not the same as certified on Symitar via SymXchange. If you are a community bank on SilverLake evaluating a vendor that built its integration primarily for credit unions on Symitar, you may be looking at a 6-to-12 month certification process before anything goes live.

Ask for the core-specific certification before the demo, not after.

:::pullquote
Ask for the core-specific certification before the demo, not after.
:::

## What Jack Henry Ships for Lending

Neither SilverLake nor Symitar bundles a full-featured modern LOS. Both are systems of record. The core handles general ledger, account servicing, and transaction processing. Origination workflow, borrower-facing applications, automated decisioning, and document management all require something separate.

Jack Henry sells several of those separately.

**LoanVantage** is Jack Henry's commercial LOS. It covers C&I, CRE, SBA, construction, and ABL loans. It handles financial spreading across business and personal tax returns, automated decisioning with customizable scorecards, covenant tracking, and document imaging. It integrates with both SilverLake and Symitar.

The results are documented. Independent Financial, an $18.7 billion Texas bank, selected LoanVantage enterprise-wide in 2022. Killbuck Savings Bank, an $800 million institution, grew commercial loan volume 25% after replacing Excel-based manual processes with a Jack Henry lending solution.

**Jack Henry Origination** (formerly branded "Opening Act") handles the consumer side: auto loans, home equity, credit cards, and mortgage. The pre-qualifying engine generates decisions in 10 to 15 seconds. It covers real-time credit and OFAC checks, automated document generation, and same-day funding into new accounts.

The catch on both: LoanVantage and Jack Henry Origination are separately licensed products. They are not features included in your core contract. Pricing and implementation are separate conversations from your SilverLake or Symitar agreement.

## The MeridianLink Deal and What It Reveals

In 2025, Jack Henry and MeridianLink expanded a 15-year partnership into a formal reseller agreement. Jack Henry now officially sells MeridianLink One, MeridianLink Consumer, and MeridianLink Mortgage to its community bank and credit union clients.

More than 500 banks and credit unions across both companies now run this combination.

The practical translation: for many Jack Henry institutions, the right path to modern digital lending is a third-party LOS connected to the core via jXchange or SymXchange, not a Jack Henry native module. The reseller deal acknowledges this openly. For Symitar credit unions specifically, Synergent (Jack Henry's CU services arm) lists MeridianLink Consumer and MeridianLink Mortgage as preferred vendors.

Banno, Jack Henry's digital banking frontend, surfaces a related gap. Banno consolidates online and mobile banking under one codebase but does not originate loans natively. For lending, Banno relies on embedded fintech partners or a connected LOS. The Banno embedded fintech marketplace includes Autobooks, QuickBooks, Atomic (payroll), Array (credit scoring), and Finicity/Plaid (account aggregation). There is no dedicated loan origination engine listed as a native Banno feature.

## The Integration Ecosystem

Jack Henry's Fintech Integration Network (FIN) has more than 950 certified fintech partners. Certification confirms technical soundness, not endorsement. And because each platform uses its own API, FIN membership does not automatically mean the integration works on your specific core.

Notable 2024-2025 additions for lending:

- **Algebrik AI** joined in March 2025, integrating an AI-driven LOS with Symitar via SymXchange
- **Blend** certified digital account opening with both SilverLake (jXchange) and Symitar (SymXchange) separately, requiring two distinct certification passes
- **MeridianLink** moved from FIN member to formal reseller partner in 2025

The FIN is open to fintechs competing directly with Jack Henry products. That is a meaningful commitment to open architecture. It is also why "Jack Henry integrates with everyone" is true in principle and sometimes complicated in practice. Any FIN listing requires verifying core-specific certification before assuming a clean integration path.

## What This Means for a Community Bank CEO

Jack Henry's 2025 Strategy Benchmark found that 90% of surveyed institutions plan to enhance lending capabilities in the next 12 to 18 months. The top priorities: automated workflow, financial spreading, and portfolio credit monitoring for commercial banks; AI-assisted underwriting and decision engines for credit unions.

:::stat
**90%**
Nine in ten Jack Henry institutions surveyed plan to enhance lending capabilities within the next 12 to 18 months.
:::

That number confirms where the gap is. It is not in the core. SilverLake and Symitar are reliable systems of record, which is why retention rates run so high. The gap is in the origination layer: the borrower-facing application, the income and employment verification, the automated decision, the document assembly.

The standard deployment pattern for a Jack Henry institution that has solved this: SilverLake or Symitar as the system of record, a separate LOS (LoanVantage, MeridianLink, Blend, or Algebrik AI) handling origination workflow, and an open banking layer handling real-time income and employment verification at intake.

The borrower experience is determined by the origination and verification layer, not by the core.

:::pullquote
The borrower experience is determined by the origination and verification layer, not by the core.
:::

A community bank on SilverLake with a modern front-end LOS and real-time income verification can close loans as fast as any digital lender. That combination exists today, and the integration paths are well-documented. The core is not the constraint. The integration is.
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
    publishedDate: 'June 21, 2026',
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
    description: 'Community bank AI adoption tripled in 2026. Here is what the regulations actually require, where AI fits today, and how to implement it without triggering examiner problems.',
    publishedDate: 'June 26, 2026',
    readTime: '7 min read',
    content: `# How Community Banks Can Use AI in Lending Without the Risk

*Published June 26, 2026*

Forty-nine percent of community banks deployed generative AI in 2026. That is triple the rate from 2025, according to Cornerstone Advisors. In mortgage lending specifically, 38% of lenders were using AI or machine learning in 2024, up from 15% just one year earlier.

The adoption wave is not theoretical. It is happening now, and the banks watching from the sidelines are falling behind on speed. Banks with AI underwriting handle three to four times more loan applications with the same staff. Processing times run 30 to 40% faster.

:::stat
**49%**
The share of community banks that deployed generative AI in 2026 — triple the rate from 2025, according to Cornerstone Advisors.
:::

The question is not whether to use AI. It is how to do it without handing examiners a finding.

## What the Regulations Actually Say

The governing framework is SR 11-7, issued by the Federal Reserve and OCC in 2011 and adopted by the FDIC in 2017. The core rule has not changed: model risk exists when model outputs are wrong or misused, vendor models count just as much as in-house models, and governance must be documented.

This is where community banks sometimes get a false sense of security. If a fintech built the AI model and you are licensing it, you cannot disclaim responsibility when an examiner asks about model validation. You are the institution. The model is yours to validate.

:::pullquote
The question is not whether to use AI. It is how to do it without handing examiners a finding.
:::

Two regulatory updates in 2025 and 2026 add important context. OCC Bulletin 2025-26 clarified that community banks are not required to perform annual model validation. Requirements must be proportionate to the bank's size and complexity. Then on April 17, 2026, the OCC, Federal Reserve, and FDIC issued updated interagency Model Risk Management guidance that explicitly reset expectations for community-bank scale. It is the clearest signal regulators have sent that they understand a $300 million community bank cannot maintain the same MRM apparatus as JPMorgan Chase.

There is one hard floor that does not bend for size: adverse action explainability. The CFPB is explicit that when AI influences a credit denial, lenders must provide specific, accurate reasons. Generic explanations do not satisfy ECOA or Regulation B simply because an algorithm made the call. Black-box models are not just a regulatory risk. They are a compliance liability.

## Where AI Actually Fits Today

The three examiner requirements banks need to prepare for, based on OCC Bulletin 2026-13 and the updated interagency SR 26-2 framework: source-page citations on every figure an AI extracts, override history preserved when an underwriter adjusts an AI-generated value, and a named model risk owner inside the bank. These are auditable artifacts. The question every vendor should be able to answer is whether their system generates them automatically.

With that framework in mind, the low-risk entry points are narrow.

**Fraud detection** is the fastest-ROI AI application for community banks. AI fraud detection reduces false positives by 50 to 70% while catching more actual fraud. Measurable results typically arrive within 60 to 90 days. Implementation costs for community bank tiers run $2,000 to $15,000 per month plus $15,000 to $80,000 upfront depending on core system complexity. ROI typically arrives within 6 to 12 months. The examiner risk is low because fraud detection models do not trigger adverse action decisions.

**Document processing and data extraction** is the other clear entry point. One implementation documented in ICBA coverage in 2025 describes an AI agent that monitors a bank's email inbox for customer-submitted financial statements, downloads and extracts the key figures, runs calculations, and routes the summary into underwriting automatically. No human touches the document until the summary is ready for review.

This is a deliberately narrow use case. The AI did not make a credit decision. It extracted data from a PDF and did some arithmetic. The underwriter reviewed the output and made the call. That is the architecture examiners can follow.

**Credit underwriting support** is where things get more complicated. ICBA's 2026 AI Task Force position is that AI can help community banks meet regulatory burdens and expand credit access, but "cannot replace the personal relationships and local knowledge integral to the community banking model." That framing is not anti-AI. It is a clear description of where AI belongs: supporting the underwriter, not replacing them. Banks that position AI as a recommendation engine with documented human override are in a far better regulatory position than those pitching AI as an autonomous credit decisioning system.

## How to Implement Without Getting in Trouble

Start with a use case that does not touch credit decisions. Fraud detection, statement extraction, document classification, and customer routing are all AI applications where the risk framework is simpler and the value is demonstrable within a quarter.

When you do move toward underwriting, build the paper trail before you go live. Identify your model risk owner (that person needs to be named, not just implied). Document how you validated the model before deployment. Establish a process for preserving override history when underwriters adjust AI outputs.

For vendor selection, apply the same standard to AI tools that you would apply to any LOS vendor: ask which community banks in your asset range are running this system, how many examiners have reviewed it, and what the certification path looks like on your core. An AI vendor that cannot produce exam-ready documentation is not ready for community banking.

The banks that will benefit most from AI over the next three years are not the ones who adopt it fastest. They are the ones who build a defensible governance structure from day one, then iterate within that framework as the regulatory landscape stabilizes.

:::pullquote
The banks that will benefit most from AI over the next three years are not the ones who adopt it fastest.
:::

ICBA's formal position to Congress is that AI-specific federal regulation is premature. The OCC, Fed, and FDIC have all signaled proportionality. The window for early adoption, with reasonable regulatory risk, is open. It will not stay this clear for long.
  `,
  },
  'white-label-borrower-portal-community-bank': {
    title: 'The White-Label Borrower Portal: What It Is and Why Community Banks Need One',
    description: 'Only 24% of small banks accepted small business loan applications online in 2024. Here is what a white-label borrower portal is, what it costs, and why it is the fastest path to closing the digital gap.',
    publishedDate: 'June 26, 2026',
    readTime: '6 min read',
    content: `# The White-Label Borrower Portal: What It Is and Why Community Banks Need One

*Published June 26, 2026*

Twenty-four percent.

That is the share of small banks that accepted small business loan applications online in 2024, according to the FDIC's Small Business Lending Survey. And of those that did, fewer than half could handle the process digitally end to end. The application might start online, but somewhere before approval, the borrower was handed a PDF or asked to come into a branch.

Meanwhile, Chime opened checking accounts in two minutes. Rocket Mortgage collected income data without a single uploaded document. The experience gap is not a data point anymore. It is the reason 44% of new checking accounts went to neobanks in 2024.

The most common response from community bank leadership is: "We would love to fix it, but we cannot afford to build something from scratch." That is correct. You should not. There is already a product for this.

## What a White-Label Portal Actually Is

A white-label borrower portal is a ready-made lending platform that the bank deploys under its own brand. The bank's logo, colors, and domain sit on top of a third-party technology stack that handles loan application intake, document collection, credit decisioning support, e-signatures, and a borrower self-service dashboard.

The vendor is invisible. The borrower applies, gets a status update, receives a proposal, signs, and accesses servicing all inside a branded interface that looks like the bank built it. The bank owns the customer relationship and the data. The vendor owns the infrastructure and the maintenance burden.

:::pullquote
The experience gap is not a data point anymore. It is the reason 44% of new checking accounts went to neobanks in 2024.
:::

This is not a new concept in software. It is how most industries operate. What has changed is that the fintech vendors serving community banks have matured to the point where the integration story is credible. Q2, MeridianLink, Baker Hill, Abrigo, Jifiti, and Hawthorn River all offer white-labeled front ends that sit on top of the bank's existing core without requiring a full replatform. Banks on Fiserv and Jack Henry have multiple certified options.

## The Cost Case

Building a branded digital lending platform from scratch costs north of $5 million before compliance. That is just development. Add integration, testing, security audits, and ongoing maintenance and you are looking at an annual cost structure that exceeds most community bank IT budgets entirely.

White-label deployments run $50,000 to $600,000 depending on customization level and integrations, based on published ranges from SDK.finance. That is a 10x to 100x cost difference for a bank that needs a functioning product, not a custom one.

:::stat
**$5M+**
What building a branded digital lending platform from scratch costs before compliance — before integration, testing, security audits, or ongoing maintenance.
:::

Time is the other number that matters. A custom build takes 12 to 24 months before a borrower can use it. White-label solutions shorten time-to-market to weeks. A bank that commits to a white-label deployment in Q1 can have a branded borrower portal live before Q2 earnings.

The global digital banking market sits at $22.4 billion in 2026 and is growing at 18.6% annually. The white-label banking segment alone is projected to reach $5.1 billion by 2028. This market exists because community banks and credit unions figured out it was cheaper to buy than build.

## What Branded Means in Practice

The customer experience matters as much as the economics. One pattern that matters operationally: the borrower never leaves the bank's branded environment during the application.

This sounds obvious. It is not. Many community banks send borrowers to a third-party URL during the application process, either for identity verification or document upload. Every time a borrower sees a different domain, trust erodes. Conversion falls. In cases where a borrower abandons mid-application, they often do not know whether to contact the bank or the vendor.

:::pullquote
Every time a borrower sees a different domain, trust erodes.
:::

A properly implemented white-label portal keeps the borrower inside one branded experience from start to funded. The bank's domain, the bank's logo, the bank's communication templates. DocuSign or a similar e-signature layer gets embedded; it does not redirect. Plaid income verification happens inline. The borrower never sees the infrastructure.

Banks that go further and tailor the portal to a specific niche see meaningful conversion gains over generic deployments. When the borrower experience is built specifically for the institution's target customer, rather than configured for generic use, trust and completion metrics both improve.

## What to Look for When Evaluating Vendors

Four questions that reveal whether a white-label vendor is ready for community banking:

**Core certification.** Is the integration with your specific core (Fiserv Precision, Jack Henry Silverlake, etc.) a certified integration with community bank references, or is it a custom build they will maintain as one-off code? The distinction matters for implementation timelines and long-term support.

**Regulatory audit trail.** Does the system generate the document artifacts required for BSA/AML and fair lending compliance automatically, or does the bank have to configure that separately? Ask to see an example audit log.

**Abandonment recovery.** Can the portal save partial applications and resume them? Email or SMS outreach to borrowers who abandon is the single fastest way to improve pull-through rates. Ask for the vendor's documented abandonment recovery rate.

**Timeline.** Get a reference from a community bank in your asset range that launched in the last 12 months. Ask them how long it actually took. Ask what went wrong. The vendor's sales timeline and the implementation reality are often different numbers.

A 2024 Digital Banking Report survey found 90% of institutions let consumers apply online for consumer credit. The gap is not whether the channel exists. It is whether the experience inside that channel is good enough to compete. A white-label portal built to the right standard closes that gap in a quarter, not a decade.
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
    description: 'Section 1033 is enjoined, but open banking is already deployed at community banks. Here is what Plaid, Fiserv, and Jack Henry actually offer, what works, and what still requires custom integration.',
    publishedDate: 'June 26, 2026',
    readTime: '7 min read',
    content: `# Open Banking for Community Banks: What Plaid, Fiserv, and Jack Henry Actually Support

*Published June 26, 2026*

The CFPB's Section 1033 open banking rule was issued on October 22, 2024. A federal district court enjoined enforcement. The Trump administration initiated reconsideration. The CFPB released an Advance Notice of Proposed Rulemaking on August 22, 2025. A new proposed rule is forthcoming. No compliance dates are currently active.

For community banks, the temptation is to treat open banking as a regulatory problem that has been postponed. That reading is wrong.

Open banking is already deployed at community banks. Plaid processes income verification for community lenders through MeridianLink. Jack Henry has certified integrations with every major U.S. data exchange platform. Fiserv has an open API gateway, though it requires deliberate adoption. The question is not whether open banking is coming. It is which of your institution's workflows would benefit from connecting to it now.

:::pullquote
Open banking is already deployed at community banks.
:::

## What the Regulation Actually Says

Section 1033 of the Dodd-Frank Act requires covered financial institutions to make consumer-permissioned data available to authorized third parties. The CFPB's 2024 rule would have implemented that mandate through a standardized developer interface requirement.

Two things matter for community banks in the current state. First, the third-party developer interface mandate in the 2024 rule exempted institutions below $850 million in assets. ICBA has formally asked the CFPB to raise that threshold to $10 billion under any new rule, and to exempt all community banks from the mandate to build and maintain a third-party developer interface. Second, even with the rule enjoined, the underlying statutory obligation has not changed. If a consumer asks for their data, the institution still has to provide it. The regulatory uncertainty is about the technical standards and compliance timelines. The directional obligation is settled law.

The practical effect for most community banks right now: you are not required to build an API. You are still required to participate in consumer-permissioned data sharing in some form. And the lenders who have implemented open banking connectivity are not waiting for the rule.

## What Plaid Actually Supports for Community Banks

Plaid's network covers more than 12,000 financial institutions. The coverage is not uniform. Smaller community banks are often reached via screen-scraping fallbacks rather than direct API connections, which is less reliable and creates liability questions when account credentials are involved.

In November 2025, Plaid expanded its Data Partner Dashboard to let community banks and credit unions self-manage their Plaid presence: fix connection issues, update branding, enable the Auth product. This was a direct response to the connectivity gap for smaller institutions.

The most concrete deployment in community bank lending happened in April 2026, when MeridianLink announced an expanded Plaid partnership embedding Plaid Income directly into MeridianLink Consumer. The integration drives 80% conversion in lending flows by replacing manual document uploads with real-time income verification. A borrower connects their bank account once; Plaid pulls income and asset data automatically. Plans to expand to cash flow underwriting are on the roadmap for later 2026.

:::stat
**80%**
Conversion rate in lending flows when Plaid Income replaces manual document uploads in MeridianLink Consumer.
:::

For a community lender running MeridianLink, this is not a future capability. It is available today. The income verification step that used to take days now takes minutes.

## What Fiserv and Jack Henry Actually Offer

The core platforms differ significantly in how they approach open banking connectivity.

**Fiserv.** Open banking runs through Communicator Open, described as an enterprise services framework and a prerequisite for deploying pre-integrated apps or building custom applications. API usage is free up to a defined threshold, then shifts to consumption-based pricing. Fiserv serves community banks on Portico, Precision, and Premier. The important caveat: Communicator Open access is not automatic. Banks have to activate the framework deliberately. If your bank is on Fiserv and you have not had a conversation with your rep about Communicator Open, you probably do not have it turned on.

**Jack Henry.** The most fintech-integrated of the three platforms for community banks. Jack Henry announced integrations with Plaid, Akoya, Finicity, and Yodlee, making it the first core processor to have certified relationships with all major U.S. financial data-exchange platforms. Its Fintech Integration Network (FIN) gives fintechs direct access to Jack Henry's core technical resources, which meaningfully reduces time-to-deployment for community bank clients. A fintech that wants to integrate with a Jack Henry bank does not have to build a custom connection: they use the FIN.

The practical difference: a community bank on Jack Henry that wants to enable Plaid income verification for loan applications has a shorter path to implementation than one on Fiserv, primarily because the certification work is already done.

## Where Open Banking Adds Value Right Now

Three use cases are documented and live at community banks today.

**Income and employment verification.** This is the highest-ROI entry point. Replacing manual document collection with Plaid Income or similar tools cuts the verification step from days to minutes and eliminates the single most common point of abandonment in digital loan applications. The MeridianLink/Plaid deployment is the clearest community bank case study in the current data.

**Deposit opening and funding.** Open banking connections allow instant bank verification during account opening, replacing the micro-deposit verification flow that adds two to three days to the new account timeline. For community banks trying to close the account opening speed gap against Chime's two-minute flow, removing the micro-deposit wait is a direct conversion improvement.

**Cash flow underwriting.** Using transaction data from a borrower's connected accounts to supplement or replace traditional income documentation is a growing use case for thin-file borrowers and small business applicants who have revenue but limited W-2 history. Jack Henry's roadmap and MeridianLink's announced plans both point to cash flow underwriting as a near-term capability.

Only about 11% of U.S. consumers used open banking payments as of 2025, according to Plaid's own consumer research. Seventy percent said they were comfortable sharing financial data with tools they trust, but 56% of non-adopters cited security and trust concerns. The infrastructure is ahead of consumer behavior.

For community banks, this asymmetry is an advantage. The friction is not technical anymore. It is trust. And trust is the one thing community banks have spent decades building that fintech competitors cannot replicate at scale.

:::pullquote
Trust is the one thing community banks have spent decades building that fintech competitors cannot replicate at scale.
:::

The regulatory uncertainty around Section 1033 will resolve. The direction is not in doubt. The banks that have built operational experience with open banking while compliance timelines are soft will implement faster when the timelines harden. The ones waiting for the final rule will be building under a deadline.
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
    description: 'South Atlantic Bank turned a 2007 startup in Myrtle Beach into a $1.93B coastal lending machine in under 17 years. Here\'s how in-migration math, a 53% CRE concentration, and 13% loan growth are forcing a digital reckoning.',
    publishedDate: 'June 20, 2026',
    readTime: '6 min read',
    content: `# South Atlantic Bank: The $2B Coastal Lender Built on In-Migration

*Published June 26, 2026*

South Atlantic Bank opened its doors in November 2007. Two months later, the financial crisis started pulling apart the banking industry. Most startups launched into that environment did not survive the decade. South Atlantic Bank is now approaching $2 billion in assets.

That detail alone tells you something about the market they picked and how they operate.

## A Startup That Outlasted the Crash

Founded in Myrtle Beach under holding company South Atlantic Bancshares (OTCQX: SABK), the bank has compounded from zero to $1.93B in assets in under 17 years. Net income hit $16.17M in 2025, up 60.8% year-over-year. The efficiency ratio sits at 59.99%. Return on assets is 1.05%, respectable for any community bank and genuinely impressive for one still in aggressive growth mode.

:::stat
**$16.17M**
Net income in 2025, up 60.8% year-over-year, for a bank launched two months before the financial crisis.
:::

The numbers look even better when you consider the headcount. South Atlantic runs 12 branches and 159 full-time employees. That is a lean operation for a book this size. Net interest margin holds at 3.06%, and nonperforming assets are essentially zero. CEO K. Wayne Wicker was elected to the American Bankers Association board, which is not something that happens to banks just treading water.

What's powering it? The zip codes.

Horry County, home to Myrtle Beach, Conway, and North Myrtle Beach, is growing at 3.8% annually. That is not organic birth-rate growth. Every percentage point of it is in-migration. Retirees from Ohio and Pennsylvania relocating to the Grand Strand. Remote workers from the Northeast choosing Myrtle Beach over Miami. Second-home buyers who looked at Florida prices and turned north on I-95. The bank's footprint also reaches into Georgetown County and the Beaufort/Jasper MSA covering Hilton Head and Bluffton, all of which are running similar in-migration dynamics. Horry County alone is projected to add 216,000 residents by 2042.

Roughly 15,000 new residents arrive each year. That translates to approximately 7,500 net new households entering the footprint annually, all of them shopping for mortgages, HELOCs, and auto loans with no existing relationship at a local bank.

:::pullquote
South Atlantic Bank is positioned exactly where the people are going.
:::

South Atlantic Bank is positioned exactly where the people are going.

## The Loan Book That 159 People Are Running

The real story in the financials is what's happening to the balance sheet.

Total loans grew 13.1% in 2024 and another 9.5% in 2025. Real estate loans are now approaching $1.4B across residential, construction, and commercial categories. The construction and land development portfolio alone sits at $241M. Nonfarm nonresidential CRE adds another $559M. Together those two categories represent more than 53% of total loans, and they are concentrated in one of the most active coastal construction markets in the Southeast.

That is a lot of deal flow for 12 branches.

Secondary mortgage income jumped 80% in 2024, driven by increased origination commissions. The bank is writing more loans, faster. The pipeline is clearly moving. But nothing in the publicly available technology stack suggests the processing infrastructure has scaled at the same pace.

:::stat
**80%**
Secondary mortgage income growth in 2024, driven by origination commissions, while the manual processing infrastructure remained unchanged.
:::

The digital banking page covers bill pay, transfers, and account viewing. There is no mention of online loan applications, document upload portals, income verification integrations, or any automated workflow tools for the lending side. Job postings for a Digital Banking Specialist I and a Systems Administrator III suggest they are building out IT capacity, but those roles are foundational hires, not fintech integrations.

A loan officer closing a residential mortgage on an in-migrant retiree from New Jersey is currently doing some version of the same manual document shuffle that every other community bank does: emailing requests for pay stubs, waiting for bank statements to come back via PDF, chasing down the second piece of ID. Multiply that by a pipeline growing at double-digit annual rates and you have a meaningful drag on throughput.

## The Competitive Problem Nobody's Talking About

Here's the uncomfortable part for any community bank in this market.

The borrowers arriving in Horry County from the Northeast and Midwest are not loyal to South Atlantic Bank. They have no prior relationship. They are transaction shoppers, often comparing rates across multiple lenders simultaneously. And many of them have recent experience applying for a mortgage with Rocket Mortgage, Better.com, or a regional lender that offered a fully digital application with near-instant income and asset verification.

:::pullquote
Closing speed matters enormously in a market with active construction and high CRE transaction volume.
:::

Closing speed matters enormously in a market with active construction and high CRE transaction volume. A developer building a 40-unit condominium complex on Ocean Boulevard is not going to wait three extra days for a term sheet while a loan officer manually requests two years of business tax returns and entity documents. They will call the next bank.

That is not a hypothetical. It is basic pipeline math.

South Atlantic Bank's 1.05% ROA is a function of disciplined underwriting and a favorable market, not operational inefficiency in the lending workflow specifically. But efficiency ratios only stay below 60% if the revenue side grows faster than the cost side, and the cost side includes underwriter hours spent on file cleanup, document chasing, and borrower follow-up that should not require a human at all.

The commercial book is where this gets most acute. CRE and construction borrowers, developers and resort operators and commercial investors, expect a different level of transactional responsiveness than a first-time homebuyer does. When a bank can verify income, employment, and assets in minutes rather than days, it changes the relationship dynamic. The bank becomes the one issuing the fast term sheet backed by verified financials instead of a pending checklist. That is a competitive differentiator that shows up directly in pipeline close rates and relationship retention.

The residential mortgage side has its own version of the same problem. In-migrant borrowers who are shopping between South Atlantic and a national direct lender are making a decision partly on service experience. If the national lender returns a verification decision in four minutes and South Atlantic is still waiting on the borrower's third-party W-2, the comparison has already started to tilt.

## What the Growth Trajectory Demands

Newsweek named South Atlantic Bank one of the best regional banks in 2024. The OTCQX listing and the ABA board seat signal real ambitions. The bank is not trying to stay at $1.93B. The footprint additions into Beaufort and Jasper counties, the construction lending concentration, the secondary mortgage commission growth: all of it points toward a bank trying to ride the South Carolina coastal growth wave to $3B and beyond.

That scale changes what the operational stack needs to do.

At $1.93B with 159 employees, every basis point of efficiency ratio improvement requires either growing the revenue line faster than costs or reducing the labor intensity of processing the existing volume. Probably both. The in-migration wave delivers a steady supply of new borrowers who need mortgages and HELOCs and commercial credit lines. The construction market delivers large CRE transactions with complex documentation requirements. Running both categories through a manual verification workflow caps throughput at the pace of human document review.

The banks that will own the coastal South Carolina market over the next decade are the ones that can close a mortgage for a Pennsylvania retiree as fast as a national lender, issue a term sheet for a Grand Strand developer before the competing bank returns a call, and do both while keeping the efficiency ratio below where it is today.

Real-time income and employment verification, automated asset confirmation, and digital borrower identity checks at the front of the application funnel are what make that possible at scale. Not because technology is inherently better than people, but because the volume math no longer works when every file requires manual intervention. A bank at $1.93B growing at 10% per year cannot add headcount at the same rate and maintain a sub-60% efficiency ratio. The math does not work.

South Atlantic Bank has built something genuinely impressive in under two decades. The in-migration tailwind is real and it is durable. The question now is whether the origination infrastructure catches up to the growth rate before the competitive gap on digital borrower experience becomes a relationship-retention problem. Banks that solve the intake bottleneck first will write the next chapter of coastal South Carolina lending.
`,
  },
  'conway-national-bank-grand-strand-dominance': {
    title: "Conway National Bank's Quiet Dominance on the Grand Strand",
    description: 'Conway National Bank runs a sub-48% efficiency ratio and holds the top deposit share in one of America\'s fastest-growing counties. Here\'s what their numbers reveal about scaling a lean community bank into a surging coastal market.',
    publishedDate: 'June 13, 2026',
    readTime: '6 min read',
    content: `# Conway National Bank's Quiet Dominance on the Grand Strand

*Published June 26, 2026*

Here is the number that stops you cold: Conway National Bank has held the number one deposit market share position in Horry County for at least four consecutive years, beating out 20 competing institutions, while running an efficiency ratio below 48%. That combination is rare. Most banks that dominate a market do it by spending their way there. CNB does it by being genuinely disciplined.

This is a $1.94 billion bank based in Conway, South Carolina. Founded in 1903. Sixteen branches. No flashy fintech partnerships, no press releases about AI, no splashy acquisitions. Just 120-plus years of compounding community relationships in a county that is now one of the fastest-growing in the entire country.

The question worth asking: how long does that formula hold as the county transforms underneath them?

## The Market That Moved In Overnight

Horry County added 7,331 new housing units in 2024 alone. The county is projected to absorb 216,000 additional residents by 2042. The people arriving are not just retirees looking for warm weather (though there are plenty of those, many from New York, New Jersey, Pennsylvania, and the DC metro). Remote workers. Families chasing coastal affordability. Second-home buyers from the Mid-Atlantic who found they could work from Pawleys Island just as well as from Bethesda.

:::pullquote
Most banks that dominate a market do it by spending their way there. CNB does it by being genuinely disciplined.
:::

CNB's 2024 HMDA data captures this shift. The bank originated 309 mortgages last year, with 159 of those being conventional purchase loans. That purchase-heavy mix reflects a market driven by new arrivals, not just existing homeowners refinancing. And the Georgetown County footprint tells an even more interesting story: 41 originations there, with an average loan size around $352,000, well above the Horry County average. The Waccamaw Neck corridor (Pawleys Island, Murrells Inlet, Litchfield Beach) is a high-income second-home and retirement market, and CNB is already in it.

The bank's messaging leans heavily on community rootedness. "Our lenders live here too." That positioning works exceptionally well for the long-tenured local customer who wants to call someone they recognize. It works less well for the retired couple from Northern Virginia who is buying a $450,000 home in Murrells Inlet, has a pension plus brokerage income, and has never been inside a Conway branch.

That borrower is arriving in volume. The question is whether the bank's intake process is ready for them.

## The Efficiency Machine and Its Limits

CNB reported net income of $23.1 million in FY2025, up 26.6% from the prior year. Return on assets came in at 1.23% for the full year and accelerated to 1.40% annualized in Q1 2026. The net interest margin for Q1 2026 was approximately 3.10% annualized, with $15.2 million in quarterly net interest income on a $1.94 billion asset base.

The efficiency ratio tells the real story of how they get there. 51.76% for full-year 2025. 47.38% in Q1 2026. For context, the average community bank runs somewhere in the low-to-mid 60s. Getting below 50% with a growing loan portfolio and only 16 branches requires relentless cost control on every line item.

:::stat
**47.38%**
CNB's efficiency ratio in Q1 2026, well below the low-to-mid 60s average for community banks, achieved with only 16 branches and a loan portfolio near $850 million.
:::

The loan portfolio stood at $845 million net at the end of Q1 2026. Total noninterest expense for 2025 was $34.6 million. Think about that ratio: nearly a billion dollars in loans managed on a cost base that most banks that size would consider lean to the point of stress. Every dollar of operational friction matters.

That is where the math gets complicated as growth continues. Scaling from 309 mortgage originations to 450 or 500 annually does not happen by building another branch. It happens by compressing the time and labor cost per loan. A processor chasing pay stubs, making employer phone calls, waiting on bank statement PDFs, and manually keying income figures into the LOS is a fixed-cost drag that scales linearly with volume. The efficiency ratio discipline that defines CNB's financial profile depends on breaking that linear relationship.

## What the In-Migrant Borrower Actually Looks Like

The profile of a Conway National borrower in 2026 is more complex than it was in 2006. Or even 2016.

A retiree from New Jersey who closed on a primary residence in Little River last month might have Social Security income, a pension from a former employer, a Vanguard brokerage account generating qualified dividends, and a small rental property in another state. No W-2. Multiple income streams. Documentation spread across several institutions. Manual verification for that file means weeks, not days.

A remote software engineer who relocated from Northern Virginia brings a current W-2 but may have started the job six months ago, still owns a condo in Arlington, and is buying a home in the Forest Brook area of Conway. Recent employment, multi-property obligations, and a digital-first expectation built from a decade of using neobanks and mortgage apps.

These borrowers are not rare edge cases. They are a growing share of the purchase-mortgage pipeline in a county adding thousands of new housing units per year. And the branch-centric model that serves a multi-generational Conway family beautifully creates real friction for someone who moved here from 700 miles away and needs to close in 30 days.

CNB's digital infrastructure today reflects its community bank roots. The website routes all product inquiries to branch contact or "learn more" pages. Mobile banking exists through CNB2GO, but credit card management redirects to a third-party portal. There is no online mortgage application, no digital document collection, no e-signature workflow mentioned anywhere in their public presence. Those are not criticisms of a bank that has compounded impressively for 120 years. They are observations about where friction accumulates as the borrower profile evolves.

## The Waccamaw Neck Opportunity

The Georgetown County numbers deserve more attention than they usually get.

Forty-one originations at a $352,000 average loan size. That is a high-balance, high-income borrower segment that skews toward second homes and retirement relocations. A buyer purchasing a $400,000 property on the Waccamaw Neck is often comparing CNB against a regional bank with a robust digital application portal, or against a national lender offering a guaranteed 21-day close.

CNB's competitive advantage in that market is its local knowledge, its relationships with the real estate community along the Grand Strand, and the trust it has built over decades. Those matter enormously. But a buyer from Connecticut who is purchasing remotely, coordinating through a local agent, and trying to close before the school year starts in September is also paying attention to how quickly the bank can verify their assets and income.

The faster that verification happens, the more of that segment CNB can capture without adding a single underwriter.

:::pullquote
The faster that verification happens, the more of that segment CNB can capture without adding a single underwriter.
:::

A 20% increase in Georgetown County originations (about 8 additional loans per year) at the current average loan size would represent roughly $2.8 million in additional origination volume. Compounded across improved pull-through on the full pipeline, the revenue impact of cutting document collection time in half is not trivial for a bank managing a sub-50% efficiency ratio.

## Where the Trajectory Points

Conway National has built something genuinely difficult to replicate: 12.48% deposit market share in a high-growth coastal market, a loan portfolio near $850 million, and profitability metrics that most community banks only read about in peer group reports. The foundation is strong.

The next phase of growth will stress-test whether a relationship-first, branch-anchored model can absorb the complexity of a borrower population that looks less and less like it did ten years ago. Horry County is not slowing down. The 216,000 projected new residents represent hundreds of thousands of purchase, refinance, and home-equity transactions over the next 15 years, a significant portion of them arriving from states where digital-first lending is the baseline expectation.

The banks that capture the most of that volume will be the ones that can verify a retiree's pension income, a remote worker's employment, and a second-home buyer's asset reserves in hours rather than days. Frictionless borrower intake is not a differentiator anymore in most coastal markets. It is the price of admission for the high-value in-migrant segment that will define Horry County's mortgage market for the next decade. For a bank already running a 47% efficiency ratio on a growing book, the operational leverage in getting there is substantial.`,
  },
  'bank-travelers-rest-greenville-growth-engine': {
    title: "Bank of Travelers Rest: Greenville's $1.6B Growth Engine",
    description: 'Bank of Travelers Rest is posting 1.44% ROA and 21.82% ROE from a single county in South Carolina. Here is how a 10-branch community bank became the quiet growth engine of one of the fastest-moving metros in the Southeast.',
    publishedDate: 'June 11, 2026',
    readTime: '6 min read',
    content: `# Bank of Travelers Rest: Greenville's $1.6B Growth Engine

*Published June 26, 2026*

Here is the surprising part: Bank of Travelers Rest, a 10-branch community bank anchored in a town of fewer than 5,000 people, is now the 8th largest bank in South Carolina by deposit size. At $1.60 billion in assets, it sits comfortably above hundreds of institutions with twice the branch count. That kind of efficiency does not happen by accident.

Founded in 1946 in Travelers Rest, SC (a suburb sitting at the northern edge of Greenville County), the bank has spent 80 years doing something most community banks struggle with: staying focused. No branches outside Greenville County. No sprawling product lines. Just disciplined commercial and residential lending in one of the fastest-growing metros in the Southeast, executed well enough to post a 21.82% return on equity in fiscal 2025.

The numbers are worth sitting with. ROA of 1.44%. Net interest margin of 2.97% annualized. Efficiency ratio of 59.9%. Those are real results in an environment where most community banks are fighting margin compression and watching deposit costs eat their lunch. BTR is doing fine.

## A County That Keeps Growing

Greenville County added over 11,000 net new residents between 2023 and 2024. That is not a blip. The Greenville-Anderson MSA has been absorbing in-migration from higher cost-of-living states for years, with manufacturing and technology employers pulling transplants from the Northeast, Midwest, and West Coast. The county now holds 548,000 residents and counting, making it the most populous in South Carolina.

Bank of Travelers Rest is sitting in the middle of all of it. With $1.43 billion in deposits and $903 million in net loans as of Q1 2026, the bank's geographic concentration means it captures both the long-established community relationships of the Upstate and a steady wave of new arrivals who need mortgages, checking accounts, and business lines of credit.

The mortgage book tells the story clearly. Of the 170 mortgage originations BTR closed in 2024, 107 were purchase loans. Not refinances chasing rate windows. Actual home purchases, which means actual new borrowers entering the market, many of them relocating from out of state. The average loan size is running around $347,000, tracking with Greenville's steadily rising home prices. And the bank writes zero FHA, VA, or USDA volume. This is a conventional purchase shop serving buyers who, on paper at least, look like solid credits.

Net loans in residential real estate grew 4.3% year-over-year through Q1 2026. The pipeline is not slowing down.

## The Friction Hidden Inside a Smooth-Running Machine

The efficiency ratio of 59.9% is good. It is not great. Top-quartile community banks are pushing closer to 55%, and the difference matters on a $1.6 billion balance sheet where noninterest expense has nowhere to hide. BTR runs lean, but there is a cost structure that does not yet reflect what modern loan file assembly could look like.

The current mortgage intake flow routes applicants through mymortgage-online.com, a third-party portal that handles the front end but does not appear to include any real-time income, asset, or employment verification. Consumer and commercial applications direct borrowers to call or visit a branch. The May 2025 website rebuild (done by OMNICOMMANDER, which added ADA compliance and mobile responsiveness) improved the borrower experience at the surface. But there is no visible integration with open banking platforms, payroll data networks, or automated underwriting tools.

That matters because of who is now applying. An in-migrant buyer from Columbus, Ohio with a W-2 from a Midwest employer, a gig side income, and bank accounts at a credit union back home is not a hard credit. But manually verifying that file takes time. Loan officers chase pay stubs. They call employers. They wait on bank statement PDFs that arrive in batches, sometimes three days after the initial request. For a 10-branch bank with limited back-office headcount, that manual labor is a hidden tax that compounds across 170 mortgage files per year, plus hundreds of HELOC and consumer loan applications.

The math is not complicated. If each file adds two days of document-chasing time, a branch network this size is burning weeks of loan officer capacity per month on tasks that automated verification could handle in minutes with a borrower consent flow.

BTR's wealth management arm (run through Raymond James under the Gateway Wealth Strategies banner) shows the bank knows how to partner externally when the product requires it. The digital lending infrastructure has not seen the same investment yet.

## What the Next Chapter Could Look Like

Greenville is not slowing down. The economic base, manufacturing, automotive supply chain, technology back-office operations, is diversified enough to hold through a rate cycle. Home prices have compressed affordability at the margins but have not stopped the in-migration wave. The pipeline of buyers moving into Greenville County from out of state is not going to shrink, and Bank of Travelers Rest's geographic concentration means it will keep seeing those applications.

The bank's current profitability metrics give it real capacity to invest. A 21.82% ROE and 1.44% ROA generate retained earnings that can fund operational improvements without diluting capital. The question is where to direct that capital to get the most leverage on the expense base.

Faster loan file assembly is one clear answer. The banks that are pulling ahead in purchase mortgage markets right now are not necessarily the ones with the lowest rates. They are the ones that can turn a complete application in eight business days instead of eighteen. For a borrower under contract on a Greenville home with a 30-day close window, that speed difference is the product. The mortgage does not exist unless it closes on time.

The broader shift in community banking is toward verification that happens before underwriting begins, not during it. Income pulled directly from payroll systems. Bank balances confirmed in real time against borrower-reported assets. Employment status verified without a phone call to an HR department. That kind of intake process does not require ripping out a core system or rebuilding a loan origination platform from scratch. It layers on top of existing workflows, replacing the document-chase step with a single borrower-authorized data pull.

For Bank of Travelers Rest, which already has the market position, the profitability, and the growth tailwind, the next competitive edge is operational. A $1.6 billion bank writing conventional purchase loans in a county growing by thousands of residents per year has every reason to close faster, document cleaner, and underwrite with less manual friction than it does today. The financial performance is already there. The intake infrastructure is where the gap lives, and closing it is how a community bank turns a favorable market into a durable lead.
`,
  },
  'security-federal-bank-cdfi-rate-rebound-aiken': {
    title: 'Security Federal Bank: CDFI Giant Navigating the Rate Rebound',
    description: "South Carolina's largest CDFI-certified bank is growing into a hot Aiken-Augusta corridor with 19 branches and an ICE-powered mortgage stack. The missing piece is automated verification, and the efficiency ratio tells the whole story.",
    publishedDate: 'May 21, 2026',
    readTime: '6 min read',
    content: `# Security Federal Bank: CDFI Giant Navigating the Rate Rebound

*Published June 26, 2026*

South Carolina's largest CDFI-certified bank isn't in Charlotte. It isn't in Columbia. It's in Aiken, a small city most people associate with horse farms and the Masters, and it's sitting on $1.56 billion in assets with 19 branches spanning two states.

That's the part that surprises people. Security Federal Bank has been operating since 1922, longer than most community banks still standing, and it earned its CDFI certification from the US Treasury back in 2010. It has been quietly building a franchise across one of the Southeast's more interesting demographic corridors while the industry chases fintech partnerships and digital-first branding. The bank's mission statement is four words: "Helping People...Changing Lives." It's not catchy. It is, however, accurate.

Understanding why this bank is positioned the way it is requires understanding the market it serves.

## The Aiken-Augusta-Columbia Corridor Is Not a Sleepy Market

People outside the Southeast tend to underestimate this geography. Aiken County added 7,962 residents between 2020 and 2023, a 4.71% gain that runs at nearly five times the national average. The in-migration is not random. Retirees are coming from the Northeast and mid-Atlantic, drawn by home prices that still make financial sense. In 2024, the median home sale price in Aiken was $289,900, with 3,321 total transactions, up 9.5% year over year.

But retirees are only part of the story. Augusta, just across the Georgia line, is anchored by Savannah River Site, a federal nuclear complex that employs more than 10,000 workers directly. Fort Gordon hosts US Army Cyber Command. Augusta University Medical Center is a major regional employer. These are stable, salaried, federal and quasi-federal jobs, exactly the kind of borrower base that a community bank loves to underwrite.

Security Federal operates across Aiken, Lexington, and Richland counties in South Carolina and into Columbia and Richmond counties in the Augusta metro. That footprint puts the bank directly in the path of population growth on both sides of the state line. Branch expansion is planned through 2027. The strategic logic is clear: the bank is growing because its market is growing.

The current numbers reflect a bank performing steadily but not spectacularly. Return on assets sits at 0.79%, net interest margin at 3.03%, and the efficiency ratio at 71.77%. For context, community banks with efficiency ratios below 60% are generally considered well-run on the cost side. At 71.77%, Security Federal is leaving margin on the table somewhere in its operations. Finding where is the interesting question.

:::stat
**71.77%**
Security Federal's efficiency ratio, against a community bank benchmark of below 60% for well-run operations on the cost side.
:::

## The CDFI Charter Creates a Document Problem Nobody Talks About

Here is the part that rarely makes it into analyst commentary on community banks with CDFI designations. Serving LMI borrowers, first-time homebuyers, and underbanked households is genuinely good mission work. It is also, operationally, much harder than conventional mortgage lending.

A W-2 employee with two years at the same employer is a simple file. Two pay stubs, one employer verification call, done. The borrowers Security Federal is explicitly chartered to serve often look nothing like that. Gig workers. Seasonal laborers. Self-employed applicants with Schedule C income that requires two years of tax returns, a year-to-date profit and loss statement, and sometimes a CPA letter. Households with multiple part-time jobs. Federal contractors on short-term assignments who technically have stable income but unconventional documentation.

For these files, manual document collection can run two to three times longer than a conventional loan. That is not an exaggeration. It is a structural reality of CDFI lending.

:::pullquote
For these files, manual document collection can run two to three times longer than a conventional loan.
:::

A processor chasing a self-employed borrower's bank statements across three institutions, waiting on employer callbacks, and manually keying income figures into the LOS is burning hours that do not show up in a single line item on the income statement. They show up as a collectively elevated efficiency ratio.

Security Federal's mortgage portal runs on ICE Mortgage Technology. That is a meaningful fact. ICE is a modern, integration-ready platform. Borrowers can apply online. The front-end infrastructure works. What the portal does not show is any open banking income or asset verification, no Plaid, no Finicity, no Day 1 Certainty or equivalent program, no automated verification of income, employment, or assets at the point of application. None of it.

That gap means the back half of every mortgage file is still manual. The borrower submits an application digitally, and then a human processor begins making calls and sending document requests. For a conventional borrower, that friction is an annoyance. For the CDFI borrower with complex income, it can add one to three weeks to the closing timeline and occasionally costs the bank the deal when a seller accepts a competing offer from a buyer with a faster lender.

## The ICE Stack Is Ready. The Verification Layer Is Not.

Security Federal has done the hard part of technology adoption. Running a modern LOS like ICE is not trivial for a 19-branch community bank. The integration work, the staff training, the process redesign around a digital origination workflow: that investment is real and it is done.

What sits between that investment and a meaningfully better efficiency ratio is the verification layer. Automated VOI, VOE, and VOA, verification of income, employment, and assets, pulled directly from payroll providers and financial institutions at the point of application, before a processor ever touches the file. This is not a rip-and-replace conversation. The LOS stays. The workflow stays. What changes is that the document-chasing step, historically the most time-consuming part of processing a complex CDFI borrower file, gets compressed from days to minutes.

Consider the math at a high level. If Security Federal's loan processors average even 30 minutes per file on manual verification tasks for straightforward borrowers, and two to four hours on complex CDFI files that represent a significant share of their volume, and if automated verification eliminates 80% of that time: the same team handles meaningfully more files per month. No new hires. No expanded branches ahead of the market demand.

For a bank planning branch expansion through 2027, processing capacity is a real constraint. More branches generate more applications. If the back-office staffing model does not scale with origination volume, cycle times lengthen, loan officers get frustrated, and borrowers go elsewhere. A 71.77% efficiency ratio does not give the bank much cushion to hire its way out of that problem.

The borrower profile makes this even more important. Security Federal's LMI and first-time buyer customers are often choosing between multiple lenders, not because they have great credit and lots of options, but because mission-driven lenders like credit unions and CDFIs are all competing for the same customer segment. Speed of closing is a real competitive factor. A borrower who gets to clear-to-close in 18 days wins the house. A borrower whose file sits in manual review for 35 days often does not.

That competitive reality is not abstract. In a market where Aiken County is adding thousands of new residents per year, many of them federal workers and retirees on fixed incomes who qualify for CDFI programs, the bank that closes fastest builds the referral network fastest. Realtors remember which lenders perform. Builders remember which lenders close on time. Word travels fast in a 19-branch footprint.

## What Faster Verification Means for This Market

Security Federal is not a bank that needs a strategy reset. The market is right, the charter is right, the mission is legitimate, and the LOS infrastructure is modern. The opportunity sitting in front of this bank is operational, not strategic.

:::pullquote
Security Federal is not a bank that needs a strategy reset. The opportunity sitting in front of this bank is operational, not strategic.
:::

Banks that close the verification gap in complex borrower segments tend to see efficiency ratios compress 300 to 600 basis points within 12 to 18 months of full deployment, based on industry data from similar community bank implementations. For Security Federal, moving from 71.77% to something closer to 66% would represent real earnings capacity, either returned to shareholders or reinvested in the branch expansion the bank has already signaled.

The Aiken-Augusta-Columbia corridor is going to keep growing. Federal employment at Savannah River Site is stable. Fort Gordon's Cyber Command mission is expanding. Remote workers and retirees are not stopping their migration southward. The bank that builds the fastest, most reliable borrower intake process in this market, one that handles the complexity of a CDFI borrower file without making the borrower wait four extra weeks, will compound the referral advantages that community banks live on.

Open banking verification infrastructure is no longer experimental. It is production-grade, it connects to the income and asset sources that CDFI borrowers actually use, and it fits inside the LOS workflows that Security Federal already operates. The question is not whether this technology works. The question is which lender in the Aiken-Augusta corridor gets there first.
`,
  },
  'ccnb-myrtle-beach-merger-growth-2026': {
    title: "CCNB's $2.2B Merger Bet on SC's Fastest-Growing Coast",
    description: "CCNB grew from a 2009 de novo to a $1.28B franchise serving one of the fastest-growing metros in the US. Now a $2.2B merger bet is forcing the bank to standardize workflows before a 2027 systems conversion, and the clock is ticking.",
    publishedDate: 'May 14, 2026',
    readTime: '6 min read',
    content: `# CCNB's $2.2B Merger Bet on SC's Fastest-Growing Coast

*June 26, 2026*

Here is the counterintuitive fact about Coastal Carolina National Bank: it was founded in June 2009, right in the teeth of the financial crisis, in a coastal resort market that was getting crushed by falling vacation-property values and tourist spending collapse. Most community banking veterans would have called that timing suicidal. Fifteen years later, CCNB sits at $1.28 billion in assets, just announced a merger of equals with Beacon Holding Company that will create a $2.2 billion SC franchise, and posted $10.94 million in net income for FY2025, up 29% year over year. Bad timing turned out to be very good timing.

:::pullquote
Bad timing turned out to be very good timing.
:::

The market context matters here. Myrtle Beach is not a typical community bank territory. The Myrtle Beach-Conway-North Myrtle Beach MSA grew 3.8% in 2024, making it the third fastest-growing metro in the country. Horry County ranked 10th nationally for domestic in-migration in the July 2022-2023 period. That growth is not driven by young families chasing starter homes. CCNB's own HMDA 2024 data shows the dominant income band among its mortgage borrowers was $250,000-plus, with $150,000 to $250,000 running a close second. Average mortgage loan size was $342,000. This is a move-up and retirement-community buyer profile, retirees and remote workers relocating from the Northeast and Midwest who arrive with complex income documentation and meaningful purchasing power.

## How a De Novo Becomes a Regional Franchise

CCNB did not stay put on the strand. The bank now holds branches across Horry, Georgetown, Richland, Aiken, Greenville, Spartanburg, and Brunswick (NC) counties, 10 branches in total, expanding deliberately into SC's interior population-growth corridors rather than just stacking up presence along the coast. The inland pivot into Columbia, Aiken, Greenville, and Spartanburg gives the bank exposure to markets that are less weather-dependent and less seasonal than a pure coastal book.

The financials back the strategy. Net interest margin held at 3.54% in FY2025. Return on assets came in at 0.93% for the full year, with the trailing Q4 figure clocking 1.03%, suggesting momentum heading into 2026. The efficiency ratio improved materially, from 66.24% in FY2024 to 61.78% in FY2025. That is real operating leverage. The loan book grew 13% to $945 million, concentrated in non-owner occupied commercial real estate and 1-4 family residential. Zero non-performing assets as of Q4 2024. For a bank that originated through a credit crisis and scaled through a pandemic, the credit quality is notable.

:::stat
**$10.94 million**
CCNB's net income for FY2025, up 29% year over year from a bank founded during the worst financial crisis in a generation.
:::

The mortgage product mix tells you something about positioning. CCNB markets condotel loans, bridge loans, lot loans, and portfolio ARM structures. These are loan types that the big banks either won't touch or make borrowers fight for. The "We Can Do That" tagline is not just marketing copy; it reflects a deliberate credit philosophy. Condotel and portfolio ARM borrowers in coastal SC frequently have self-employment income, rental income streams, or asset-heavy financial profiles that do not fit cleanly into agency underwriting boxes. That complexity is a feature of the franchise, not a bug. It is also operationally demanding.

## The Merger Window Is the Moment That Matters

Now comes the interesting part. In May 2026, CCNB announced a merger of equals with Beacon Holding Company (OTCQB: BCON). The combined entity will operate under the Beacon Bank, N.A. brand, with a systems conversion expected in early 2027. The transaction creates a 16-branch, $2.2 billion franchise.

Every bank executive who has lived through a merger of equals knows what the next 18 months look like. Two loan origination environments. Two sets of workflows. Two underwriting teams with different document checklists and process habits. The compliance and integration workload is enormous, and the temptation is to defer process rationalization until after conversion. That is exactly the wrong approach.

The banks that come out of a merger conversion in good shape are the ones that standardized their critical workflows before the new core went live, not after. Verification is the highest-friction point in any residential mortgage workflow: income verification, employment confirmation, asset documentation. Getting those steps consistent across both legacy environments before the 2027 cutover is not a nice-to-have. It is the difference between a smooth go-live and a retraining cycle that costs money and borrower goodwill simultaneously. CCNB's noninterest expense grew to $25.3 million in 2025, driven partly by data processing costs that have risen across both the 2024 and 2025 earnings releases. Rising data processing spend without corresponding efficiency gains in that cost line points toward a stack of point solutions rather than an integrated workflow. The merger window is the right moment to fix that.

## Serving 7,000 New Households a Year

Horry County is adding roughly 7,000 net new households per year. Those are not hypothetical future borrowers. They are buyers who are actively in contract or about to be, many of them relocating from out of state, many of them carrying complex income documentation. W-2s from a prior-state employer. Self-employment income from a remote business. Retirement distributions. Rental income from a property they are selling back home.

Manual verification of a file like that takes time. Time kills purchase contracts. In a coastal market where buyers are comparing multiple lenders simultaneously, a 48-hour difference in turnaround is meaningful. CCNB's HMDA borrower profile sits exactly in the $150,000-plus income band where these documentation patterns are most common. The borrower is financially strong; the paperwork is complicated. That is precisely the gap where automated income and employment verification earns its keep.

Speed is not just a customer service issue in a 3.8%-growth market. It is a competitive moat.

:::pullquote
Speed is not just a customer service issue in a 3.8%-growth market. It is a competitive moat.
:::

CCNB competes with regional banks, credit unions, and mortgage companies that all want the same high-income relocating buyer. The bank has already differentiated on product flexibility. Operational speed is the logical next layer. A lender that can confirm income and employment in hours instead of days, and hand the borrower a clear-to-close without a document chase, wins repeat business and referrals from the real estate community in a market that runs on relationships.

The digital picture today shows room to grow. CCNB's online mortgage application routes to a third-party portal at myccnb.mymortgage-online.com. The website discloses no automated income or asset verification capability, no digital appraisal ordering, no eClosing integration. No technology or digital lending roles are visible on the careers page. The bank has Zelle and IntraFi. That is a reasonable fintech footprint for a community bank, but it stops well short of a modern origination workflow.

None of that is unusual for a $1.28 billion community bank that built its franchise on credit judgment and product flexibility rather than technology investment. The question going into 2026 and 2027 is whether the merger context changes the calculus. Standardizing workflows before a core conversion is expensive and disruptive if done wrong. It is a clean implementation win if done right, at the right moment, with the right partner.

## What Digital Borrower Intake Could Mean for This Franchise

CCNB's core competitive advantage is saying yes to borrowers that larger institutions turn away, condotel buyers, bridge borrowers, self-employed coastal investors. That credit flexibility is valuable. But flexibility without speed leaves money on the table in a market adding thousands of households per year. A borrower who qualifies for a condotel loan and a conventional purchase simultaneously will sign with the lender that delivers the clear-to-close first.

The banks that are winning in high-growth coastal markets in 2026 are not winning on rate alone. Rate is visible to every borrower who has ever typed into a mortgage comparison site. They are winning on certainty and speed: the borrower knows quickly whether they are approved, what the terms are, and when they can close. Automated income, employment, and asset verification is the infrastructure layer that makes that certainty possible at scale. For a franchise that will be processing applications across two legacy systems through a merger transition, getting verification right before the 2027 conversion is not just an efficiency question. It is a question of whether CCNB can carry the "We Can Do That" brand promise into a $2.2 billion institution without operational drag slowing it down at the exact moment the market is accelerating around it.
`,
  },
  'first-capital-bank-charleston-growth-digital-gap': {
    title: 'First Capital Bank Hit $1B. Can It Keep Growing Without Going Digital?',
    description: "First Capital Bank crossed $1B in assets in a metro adding 17,500 residents a year. Here is why its four-branch, no-digital-application model is a structural bet that gets harder to win as the market heats up.",
    publishedDate: 'May 7, 2026',
    readTime: '6 min read',
    content: `# First Capital Bank Hit $1B. Can It Keep Growing Without Going Digital?

*Published June 26, 2026*

Here is the surprising part: First Capital Bank operates four branches, crossed $1 billion in assets in Q1 2025, and reached $1.24 billion by Q1 2026. That is $240 million in organic growth in roughly twelve months. In one of the hottest real estate markets on the East Coast. With no online loan application on its public website.

Not a limited one. Not a soft-launch beta. None. Every mortgage inquiry routes to an email address or a phone number.

That tells you something important about how Charleston, South Carolina's community bank landscape actually works, and about how long that dynamic can hold.

---

## A $1.24B Bank in a Market That Added 70,000 People

The Charleston-North Charleston MSA is not a sleepy Southern coastal market anymore. The tri-county area covering Charleston, Berkeley, and Dorchester counties has grown nearly 9% since 2020. Berkeley County alone grew 3.2% in 2024, ranking 61st nationally among all US counties by growth rate. The region is projected to reach 1 million residents by 2032. That is roughly 17,500 new arrivals per year, sustained, for the better part of a decade.

First Capital Bank is headquartered at 304 Meeting St in downtown Charleston, founded in September 1999, and structured as a wholly owned subsidiary of First Capital Bancshares, Inc. (OTCQX: FCPB). The bank's loan portfolio reflects exactly what you would expect in this market: $466 million in commercial real estate, $338 million in residential real estate, and another $80 million in C&I. Commercial credits alone represent over 55% of the $973 million loan book.

The bank has made smart strategic moves recently. It divested its Laurinburg, NC branch in May 2025 via a Purchase and Assumption Agreement with Citizens Bank, sharpening focus exclusively on the South Carolina Lowcountry. It added a Lowcountry Market President, Andy Thomas, in February 2025. Joseph Kassim was appointed CEO in 2024, and Tradd Rodenberg was promoted to President in November 2025. New leadership, tighter geographic focus, $1.24B in assets, and a 1.12% ROA that most community banks would be envious of.

The financials are genuinely strong. A net interest margin of 3.49% is healthy in the current rate environment. An efficiency ratio of 53.63% means the bank is keeping operating costs at roughly 54 cents for every dollar of revenue, which is well below the 60-plus percent that many peers are running. Four branches serving a metro area of nearly 900,000 people means this bank is doing a lot with a little.

:::stat
**53.63%**
First Capital Bank's efficiency ratio — keeping operating costs at roughly 54 cents per dollar of revenue, well below the 60-plus percent that many peers are running, across just four branches serving a metro of nearly 900,000 people.
:::

So the question is not whether First Capital Bank is well-run. It clearly is. The question is whether the intake model that got it to $1.24B is the same one that gets it to $2B.

:::pullquote
The question is not whether First Capital Bank is well-run. It clearly is. The question is whether the intake model that got it to $1.24B is the same one that gets it to $2B.
:::

---

## Every Loan Starts With a Phone Call

Mortgage applicants visiting bankwithfirstcapital.com are directed to email ConsumerLending@bankwithfirstcapital.com or call (843) 990-7770. There is no digital document upload. No e-signature workflow. No borrower portal. The site uses BankSITE Services for hosting and MainStreet Inc. for check ordering. Open job postings are Branch Manager, Loan Processor (entry-level), and Assistant Branch Manager. No technology, digital transformation, or data roles are listed anywhere.

This is a traditional staffing model operating in a high-velocity market. That combination creates friction at exactly the wrong moment.

Charleston's growth is not driven by locals trading up. It is driven by in-migration: professionals relocating from Atlanta, Charlotte, Northern Virginia, and further afield, many of them employed by tech and aerospace firms that have set up in the region, or by Joint Base Charleston's military-affiliated household base. These borrowers have out-of-market employers, sometimes variable income structures, recent job changes, and financial histories distributed across banks in other states. They are comparing three lenders simultaneously on a Saturday afternoon from a laptop, and they are not waiting two days for a callback.

A loan processor manually chasing paystubs from Workday or ADP instances they have never seen, calling out-of-state HR departments, and waiting on paper bank statements from distant depositories can easily burn two to three weeks just on document assembly. That is not a staffing problem. It is a structural limitation of the intake model.

Commercial lending has the same issue, amplified. A $3 million CRE deal requires business tax returns, rent rolls, entity verification, bank statements, and personal financial statements from every guarantor. When all of that flows through email and courier, the diligence phase alone can take three weeks. For a bank with $466 million already on the CRE book and a market that is actively building, faster diligence is not a nice-to-have. It is how you close more deals per lender per quarter.

The bank's 53.63% efficiency ratio shows it is running lean. The risk is that lean headcount plus manual intake creates a ceiling on origination volume that looks fine until the market accelerates past it.

---

## What Digital Intake Actually Changes

The specific bottleneck is file assembly, not underwriting judgment. Experienced loan officers at community banks are good at credit decisions. What slows them down is waiting for documents.

Direct connections to payroll providers (ADP, Workday, Gusto), financial data aggregators, and IRS transcript retrieval can compress the document-gathering phase from weeks to hours. A borrower connects their bank accounts, authorizes a payroll pull, and the loan officer has verified income and employment before the first substantive conversation. For a relocating borrower with a non-local employer, that verification is just as fast as for someone who has banked locally for twenty years.

For commercial deals, automated business financial pulls from accounting integrations and parallel identity verification for multiple guarantors cut the back-and-forth that drags out CRE timelines. The underwriting still requires a human. The paper chase does not.

First Capital's four-branch model is actually well-suited for this kind of upgrade. The bank is not trying to integrate digital intake across 40 locations with inconsistent workflows. It has a small, coherent operation with new leadership that has already shown willingness to make structural changes: divesting a branch, adding a market president, sharpening the geographic focus. Those are not the moves of an institution opposed to change.

The 3.49% NIM and 1.12% ROA give the bank financial room to invest. The 53.63% efficiency ratio means it is not under cost pressure that would crowd out any new spend. And the market is handing it a growth opportunity that most community banks would not encounter in a generation: a metro adding nearly 70,000 residents over five years, with a loan book already weighted toward exactly the asset classes that market demands.

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
    title: 'First Community Bank SC: The $2.4B CRE Bet Hiding in Plain Sight',
    description: 'First Community Bankshares SC just completed a $1.6B merger and is running a 46% CRE concentration in a market where commercial real estate is simultaneously the best growth story and the biggest risk. Here is what the numbers show.',
    publishedDate: 'April 30, 2026',
    readTime: '6 min read',
    content: `# First Community Bank SC: The $2.4B CRE Bet Hiding in Plain Sight

*Published June 26, 2026*

First Community Bank of South Carolina is not a bank most people outside the Midlands would know by name. It does not have a flashy digital presence. It has not announced a fintech partnership. It does not run Super Bowl ads. What it has done is compound quietly from a $200M community bank into a $1.18B institution serving Columbia, Sumter, Orangeburg, and surrounding markets, and then agree to a merger that will create a $2.4B franchise. All while running a commercial real estate concentration that regulators watch closely and competitors rarely match.

The merger in question is with Palmetto Bancshares, finalized in early 2026. The combined entity operates across the Midlands and Upstate under the First Community Bank brand. The $2.4B asset figure places the merged institution squarely in the mid-tier community bank category where deal economics, efficiency ratios, and technology platforms all come under more scrutiny than they did when the bank was half that size.

## The Midlands Growth Story That Explains the Numbers

Columbia, South Carolina is not a coastal market. It does not have the in-migration story of Myrtle Beach or the aerospace economy of Charleston. What it has is a state government employment base, a large university hospital system, Fort Jackson (one of the largest Army training bases in the country), and a steady, mid-single-digit growth rate that has compounded steadily through multiple rate cycles.

Richland County, home to Columbia, added 6,241 residents between 2020 and 2023. Lexington County next door added 9,421, reflecting the suburban expansion that is reshaping the Columbia MSA. The growth here is different from the coast: it is driven by military families, state government professionals, healthcare workers, and University of South Carolina's administrative and research staff. Stable incomes. Predictable employment verification. Lower documentation complexity than a coastal CRE market full of short-term rental investors and seasonal workers.

:::pullquote
That is a favorable borrower profile for a community bank running a manual verification workflow. But the CRE book is a different story.
:::

First Community Bank SC's loan portfolio carries a commercial real estate concentration around 46% of total loans. For a $2.4B institution, that is a $1.1B CRE position spanning owner-occupied commercial properties, investor CRE, and construction loans across the Midlands and Upstate. At current collateral values and with the merger integration still ongoing, that concentration is not a risk flag. It is, however, a documentation management challenge.

:::stat
**46%**
First Community Bank SC's commercial real estate concentration, putting $1.1B in CRE exposure across the Midlands and Upstate on a $2.4B balance sheet.
:::

## Why CRE at Scale Is a Workflow Problem

Here is the operational reality of running a $1.1B commercial real estate portfolio through a community bank's back office.

Every new CRE origination requires: entity documents for the borrowing entity and all guarantors, two to three years of business tax returns, rent rolls for income-producing properties, environmental documentation for applicable property types, appraisals, and personal financial statements for key principals. A typical investor CRE deal might involve five or six document requests per guarantor and three rounds of follow-up before the file is complete enough to underwrite.

At First Community Bank SC's historical origination pace, which based on loan growth rates implies somewhere between $150M and $200M in new CRE originations per year, the document assembly phase across the full commercial pipeline represents thousands of hours of processor time annually. That time is not billable. It does not generate fee income. It does not strengthen the borrower relationship. It is pure overhead that sits between the signed term sheet and the closed loan.

The merger compounds this problem in the near term. Two origination teams, two document checklists, two sets of processor habits, and two LOS environments running in parallel until the core conversion is complete. Every merged bank goes through this transition. The banks that come out with lower post-merger efficiency ratios are the ones that standardized their document collection workflows before the conversion, not after it.

## The Digital Intake Gap at the $2.4B Level

First Community Bank SC's digital presence reflects a bank that built its franchise on in-person commercial relationships and has not made significant investments in digital origination infrastructure. The public website routes all loan inquiries to branch contact. There is no online commercial loan application. No digital document collection portal. No borrower-facing verification workflow.

For a bank at $500M, that is a defensible model. Branch-based commercial bankers who know their borrowers personally can manage a manual document process without significant throughput loss. At $2.4B post-merger, with a $1.1B CRE portfolio to manage and a pipeline of new originations in multiple markets, the math changes.

The post-merger bank will need to process more loans, with more complex documentation requirements, across a larger geographic footprint, with a combined team that is still calibrating its workflows. That is the definition of a situation where automated document collection, automated income and business financial verification, and digital borrower-facing intake deliver the most leverage. Not because the relationship bankers need to be replaced, but because the document-chasing overhead that scales linearly with loan volume is the constraint that limits how much revenue the same team can generate.

## What Efficiency Looks Like at $2.4B

The merged entity has disclosed a target efficiency ratio in the low-to-mid 60s. For context, the community bank peer average sits around 60-65%, and top quartile institutions push closer to 55%. Getting to the low 60s from a standing start post-merger requires either revenue growth that outpaces expense growth, or expense reduction in the processing and overhead categories that typically inflate during an integration.

Automated verification is one of the cleanest levers available. The cost per loan of manual income and employment verification, across phone calls, document requests, follow-up emails, and manual keying into the LOS, ranges from $200 to $600 per file depending on complexity. For a bank originating $150M-$200M in loans per year across commercial and residential categories, compressing that per-loan cost by even 50% represents hundreds of thousands of dollars in annual savings. Savings that flow directly to the efficiency ratio without requiring branch closures or headcount reductions.

The Midlands market will keep delivering borrowers. The Fort Jackson employment base is stable. The University hospital system is growing. Columbia's suburban ring is expanding into Lexington and Richland counties at a pace that will sustain mortgage originations for years. The borrowers are available. The question is how efficiently First Community Bank SC can process them as a $2.4B institution competing against both larger regional banks with modern digital onboarding and smaller community banks with tighter local relationships.

:::pullquote
Getting the document collection infrastructure right during the merger integration window is the moment where that efficiency gap either closes or compounds.
:::
`,
  },
  'countybank-greenwood-sc-sba-deep-dive': {
    title: "Countybank's SBA Playbook: How a Greenwood, SC Bank Thinks About Small Business",
    description: "Countybank runs a 17.6% ROE and a 55% efficiency ratio from Greenwood, SC, and its SBA lending volume punches well above its weight class. A deep dive into how a $900M community bank competes for business borrowers in a shrinking market.",
    publishedDate: 'April 23, 2026',
    readTime: '6 min read',
    content: `# Countybank's SBA Playbook: How a Greenwood, SC Bank Thinks About Small Business

*Published June 26, 2026*

Greenwood, South Carolina is not where you would expect to find one of the state's more sophisticated small business lending operations. The city of 23,000 sits in the Piedmont region, two hours from Charlotte and ninety minutes from Columbia, with an economy anchored in manufacturing, healthcare, and agriculture. It is not a high-growth coastal market. It is not a college-town economy with venture-backed startups. It is a steady, relationship-driven Midlands market that has been doing the same things for decades.

Countybank has been doing them for more than a century. Founded in 1934 as Greenwood County Bank, the institution now holds approximately $900M in assets, operates 14 branches across five Upstate and Midlands counties, and posts performance metrics that most banks its size would be proud to claim: a return on equity of 17.6%, an efficiency ratio of 55%, and a net interest margin above 4% in a rate environment where most community banks are fighting for every basis point.

:::stat
**55%**
Countybank's efficiency ratio, a level most community banks its size would struggle to match, achieved in a declining-population market.
:::

The SBA lending program is the part of the story that most people outside the Upstate SC banking market do not know about.

## The SBA Advantage in a Shrinking Market

Greenwood County has been losing population. The 2020 Census counted roughly 71,600 residents, and estimates through 2023 show continued slow decline as younger workers leave for the Charlotte and Columbia metros. Self-Regional Healthcare is the county's largest employer, followed by manufacturing plants in the textile remnant and automotive supply chain industries. The agricultural base is real but shrinking.

For a bank in a market like this, the traditional community bank playbook, grow deposits, grow consumer loans, grow residential mortgage volume, is difficult to execute when the population base is contracting. Countybank's response has been to double down on small business lending, where the bank's local knowledge and speed advantage over regional competitors creates durable relationships that are stickier than rate-sensitive consumer deposits.

The SBA program is the cornerstone of that strategy.

:::pullquote
The SBA program is the cornerstone of that strategy.
:::

Countybank is not the largest SBA lender in South Carolina, but it punches well above its weight class relative to asset size. SBA 7(a) loans, the program's workhorse, are particularly attractive for small business borrowers in markets like Greenwood because they allow longer amortization periods and lower down payments than conventional commercial loans, making capital more accessible for businesses that might not qualify for standard CRE or C&I terms. For the bank, the government guarantee on the guaranteed portion reduces credit risk while the fee income from originating and servicing SBA loans adds a meaningful noninterest income line.

The mechanics of SBA lending are also where the document problem is most acute.

## Why SBA Files Are the Hardest to Assemble

A conventional commercial loan for an existing customer is relatively straightforward from a documentation standpoint. The bank already has the entity documents, prior tax returns are on file, and the relationship officer knows the business well enough to pre-screen the application before it enters the pipeline.

SBA loans for new or growing businesses look nothing like that. The documentation requirements include: two to three years of business tax returns, year-to-date profit and loss statements, personal tax returns for all principals with 20% or more ownership, personal financial statements, business licenses and organizational documents, evidence of equity injection for 7(a) loans requiring it, and for real estate projects, appraisals, environmental studies, and title work. For a manufacturing or food-service business, there may be additional licensing or regulatory documentation.

Gathering that packet manually, through email requests, PDF uploads, and physical delivery, is a multi-week process for a complex borrower. And complex borrowers are the ones most likely to be using SBA programs in the first place. A well-capitalized business with clean financials and multiple banking relationships can usually get a conventional commercial loan without the government guarantee. The SBA borrower is often newer, smaller, or less capitalized, which makes their documentation more complicated, not less.

Countybank's 55% efficiency ratio suggests the bank is running a lean operation that is managing this document complexity without excessive overhead. But as the SBA program grows, the linear scaling of manual document collection becomes a constraint. More SBA loans means more processors chasing more documents across more applications simultaneously. At some point, adding SBA loan volume without improving the intake workflow requires adding headcount, which pressures the efficiency ratio, which limits the program's profitability.

## What Digital Intake Changes for SBA

The specific bottleneck in SBA document collection is income verification and financial statement confirmation. A processor who can pull two years of business bank statements, verify business income against IRS tax transcript data, and confirm personal financial information automatically, using borrower-authorized data connections rather than manual document requests, compresses what used to be a two-week chase into a process that can be initiated and substantially completed in a single borrower session.

For Countybank, the operational leverage of faster document collection on SBA loans is significant. Each file the bank closes generates origination fee income (typically 2-3% on the guaranteed portion), plus servicing income over the life of the loan. The faster the bank can close, the more of that fee income it generates per year. In a market where SBA loan demand from small businesses is steady but not explosive, throughput improvement delivers more revenue per processor than adding origination volume.

The borrower experience improvement matters too. A small business owner in Greenwood who is applying for an SBA loan to buy equipment or expand a location is comparing Countybank's timeline against whatever the nearest regional bank or SBA-specialized non-bank lender is offering. If the regional competitor can get to conditional approval in two weeks and Countybank takes four, the relationship advantage starts to erode. If Countybank can get there in ten days using a digital document collection workflow, it has turned operational speed into a durable competitive differentiator in a market where the bank already has the local knowledge advantage.

## The Greenwood Model and What It Proves

Here is the underappreciated insight from Countybank's performance numbers. A 17.6% ROE and 55% efficiency ratio in a declining-population market is not an accident. It is the result of a bank that has found the borrower segments where it can win on local knowledge and relationship depth, built a lending program around those segments (SBA small business in this case), and executed with enough discipline to maintain strong credit quality while generating above-average fee income.

:::pullquote
A 17.6% ROE and 55% efficiency ratio in a declining-population market is not an accident.
:::

That model scales better with digital document infrastructure than without it. The relationship and local knowledge advantages that Countybank has built over 90 years do not go away when a borrower submits documents digitally rather than by fax. The credit judgment that protects the bank's credit quality does not get replaced by automation. What automation replaces is the weeks of document chasing that sit between a signed term sheet and a complete credit file.

For a bank in a market that is not going to grow its way to higher loan volume, squeezing more throughput out of the existing SBA pipeline through faster document collection is the most direct path to maintaining the performance metrics that define the franchise. The $900M mark is not the ceiling. Getting past it in a flat-population market requires doing more with the same team, and that is precisely where verified income, employment, and financial data delivered digitally changes the arithmetic.
`,
  },
  'optus-bank-cdfi-columbia-growth': {
    title: "Optus Bank: Columbia's CDFI Institution Betting on Scale",
    description: "Optus Bank is South Carolina's only Black-owned CDFI bank, and it is in the middle of a growth push that has taken it from $130M to over $250M in assets in three years. The challenge is running CDFI mission economics at a scale that requires modern infrastructure.",
    publishedDate: 'April 16, 2026',
    readTime: '6 min read',
    content: `# Optus Bank: Columbia's CDFI Institution Betting on Scale

*Published June 26, 2026*

Optus Bank is not a bank most people in the financial industry have heard of. It does not have branches in major metros. It does not issue press releases about fintech partnerships. It is a $250M community development financial institution headquartered in Columbia, South Carolina, and it is the only Black-owned bank in the state.

Those two facts together, the CDFI certification and the ownership structure, tell you nearly everything you need to know about who the bank serves and what the operational challenges of serving them actually look like.

## The Columbia Market and Who Gets Left Out

Columbia is South Carolina's capital and its largest city, with a metro population around 840,000. The University of South Carolina, Fort Jackson, and a large state government employment base make it a stable, mid-growth market with a diverse income distribution. Richland County, where Columbia sits, added 6,241 residents between 2020 and 2023. The growth is real, and it includes a significant population of LMI households, federal workers, healthcare employees, and small business owners who make up exactly the borrower base that CDFI banks are chartered to serve.

Optus Bank holds a CDFI certification from the US Treasury, which means a substantial portion of its lending must go to LMI borrowers, LMI communities, or borrowers who would not qualify for conventional credit on standard terms. That mission focus shapes everything about the bank's operations, the borrower profile it serves, the documentation complexity of those loans, and the financial economics of running the institution profitably enough to sustain the mission.

The asset growth from $130M to $250M over three years is meaningful. In absolute terms, it is a small bank. In mission terms, it represents a doubling of the lending capacity directed at underserved Columbia-area borrowers. Getting to $500M, which appears to be the bank's medium-term target based on its strategic communications, would require sustaining that growth rate while managing the operational complexity that comes with scale.

:::pullquote
In mission terms, it represents a doubling of the lending capacity directed at underserved Columbia-area borrowers.
:::

:::stat
**$250M**
Optus Bank's current asset size after doubling from $130M in three years, making it South Carolina's only Black-owned CDFI bank at this scale.
:::

## The CDFI Borrower Documentation Problem

Here is the operational reality that most CDFI bank commentary overlooks.

The borrowers Optus serves are not harder to credit-decision because they are less creditworthy in some abstract sense. They are harder to document because their income sources are more varied, their employment histories more complex, and their financial institutions more fragmented.

A household earning $52,000 per year from a combination of a part-time W-2 position, Medicaid reimbursements from informal caregiving, and a small business with annual revenues under $80,000 is not an unusual CDFI borrower profile. Verifying that income manually requires: an employer verification call for the part-time job, documentation of the Medicaid payments from the state agency, and two years of Schedule C tax returns plus a year-to-date profit and loss for the small business. Each of those three income streams requires a different verification approach. None of them appear on a standard credit report.

A first-time homebuyer in the Eau Claire neighborhood of Columbia who receives down payment assistance through the SC Housing program, has a thin credit file, and has banked at a regional credit union for three years is a creditworthy borrower for a CDFI lender with the right underwriting model. But pulling together that complete file manually takes time, often weeks, because the documentation sources are not consolidated anywhere.

Manual verification of complex, multi-source income is where CDFI lenders spend a disproportionate amount of processing capacity. It is also where the risk of error is highest, because income figures that are calculated manually from multiple sources are more likely to contain transcription errors that trigger re-underwriting cycles.

## The Scale Tension

Optus Bank's growth trajectory creates a tension that is familiar to any CDFI institution that has tried to scale. The mission requires serving borrowers with complex documentation needs. The economics of serving those borrowers profitably require processing efficiency. Processing efficiency historically has required either simplified borrower profiles (which limits mission fidelity) or significant back-office headcount (which limits profitability).

The banks that have resolved this tension successfully are the ones that adopted digital income and asset verification early, before the throughput problem became a headcount problem. Not because digital verification makes the credit decision easier, but because it makes the document collection step dramatically faster and less prone to the errors and delays that come from manual aggregation.

For a CDFI bank, there is an additional equity argument for digital verification. A borrower applying at Optus Bank for a mortgage on a $175,000 home in Eau Claire should not have to wait five weeks for document collection when a borrower applying at a conventional lender for a $450,000 home in Forest Acres gets a digital income pull in two days. The speed disparity is not the borrower's fault. It is a function of the verification infrastructure available to the lender. CDFI banks that deploy the same verification tools that conventional lenders use eliminate that disparity without compromising the underwriting rigor that protects the bank's credit quality.

:::pullquote
CDFI banks that deploy the same verification tools that conventional lenders use eliminate that disparity without compromising the underwriting rigor that protects the bank's credit quality.
:::

## What Getting to $500M Requires

Optus Bank's path to $500M in assets runs through Columbia's LMI and first-time buyer markets, small business lending in underserved commercial corridors, and potentially geographic expansion into other South Carolina markets with significant CDFI-eligible borrower populations.

None of those growth paths can be executed efficiently on a manual document collection model at scale. Not because the bank lacks capable people, but because the document complexity of CDFI borrowers is high enough that manual processing becomes a hard ceiling on throughput before the bank reaches the size it needs to operate with sustainable economics.

Digital verification in the CDFI context means connecting to payroll systems that serve gig workers and part-time employees, not just large-employer Workday instances. It means pulling Medicaid payment records and public benefit income data through authorized channels. It means reading Schedule C data from tax transcripts and reconciling it against business bank accounts in real time. The technology exists for all of these use cases. It is deployed in various configurations at mission-driven lenders that are larger and better-resourced than Optus. Bringing it to a $250M South Carolina CDFI bank is a matter of integration priority and partner selection.

The case for moving now, rather than after the next growth milestone, is straightforward. Verification infrastructure is easier to implement at $250M than at $500M. Workflows scale with the institution when they are established early. And the borrowers Optus serves, the ones who have been waiting the longest for a lender that understands their income complexity, deserve the same speed of response that their wealthier neighbors get from conventional lenders.

The CDFI mission and operational excellence are not in tension. They are aligned when the right tools make it possible to serve complex borrowers faster and more accurately than any manual process can.
`,
  },
  'beacon-community-bank-charleston-growth-capacity': {
    title: 'Beacon Community Bank: Growth at the Edge of Capacity',
    description: "Beacon Community Bank grew from $36M to $972M in assets in seven years without building a digital front door. In a market adding 8,500 households a year, a 404 mortgage page is a strategy problem, not a website bug.",
    publishedDate: 'April 9, 2026',
    readTime: '6 min read',
    content: `
Beacon Community Bank started 2018 with $36 million in assets. Seven years later it sits at $972 million, and its mortgage application page returns a 404 error.

That single fact explains more about where this bank is headed than any line on the balance sheet.

## A Balance Sheet That Outgrew Its Intake

The numbers are real. Net loans climbed from $788 million to $848 million in just three quarters of 2025, a pace that implies roughly $80 million in new originations every 90 days. The bank's ROA improved from 0.38% for full-year 2025 to 0.52% annualized through Q1 2026. NIM moved up too, from 2.28% to 2.42%, and while those figures sit below the community bank average of roughly 3.36%, the trajectory is clearly upward.

Six branches. One relationship-driven model. One COO with a background in financial technology and customer experience.

The loan book is growing at roughly 10% annually, but the origination infrastructure still runs on phone calls.

That is not a sustainable combination.

At the current pace, loan officers at Beacon's six Mount Pleasant locations are processing a rising volume of mortgage and commercial files with no automated income verification, no employment verification tools, and no borrower self-service intake. Every new application begins with a call to 843-936-5100. Every document arrives via email or fax. Every income check involves a human chasing a pay stub or dialing an HR department.

This is the throughput ceiling. It is not visible on the call report yet. But at $80 million a quarter in new originations, it is coming.

:::stat
**$80 million**
New originations every 90 days at Beacon, processed through a manual intake model with no automated income or employment verification and no borrower self-service portal.
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

The COO's background in financial technology is the tell that this is not an ideological opposition to digital tools. Someone in that seat understands the problem clearly. The constraint is more likely bandwidth and prioritization than philosophy.

For a bank with six relationship bankers handling a $972 million loan book growing at 10% annually, the math is unforgiving. Cutting borrower verification time from four days to four hours does not just feel better. It is the difference between closing 15 loans a month per officer and closing 22.

## The Capacity Question

The efficiency ratio at Beacon is estimated in the 78-82% range, derived from the NIM and ROA spread relative to peer norms for growth-stage community banks at this asset size. That is notably above the community bank average of roughly 60-65%. For a bank that has compounded asset growth at roughly 75% per year since founding, some margin compression is expected. Growth costs money.

But efficiency ratios in the high 70s also mean that every loan that takes three extra days to close because a borrower's income took two days to verify is expensive labor. At loaded staff rates of $38-48 per hour across loan officers and processors, a mortgage file that takes 10 additional hours to work through manual verification represents $380-$480 in overhead per loan. Multiply that across 300+ originations a year and the number becomes material.

The inverse matters too. A borrower-facing verification portal that lets applicants consent and connect their accounts directly eliminates the three-to-five day document-request cycle without removing the banker from the relationship. The officer still reviews the file. The bank still makes a relationship-based credit decision. But the verification report arrives in minutes instead of days, and the borrower has already done most of the work by the time the officer calls.

That is the specific workflow improvement that scales without adding headcount.

## What the Charleston Migration Wave Means Long-Term

The Charleston MSA is not slowing down. The migration drivers, coastal lifestyle, military presence, lower cost than Northeast metros, a genuine job market across healthcare, aerospace, and technology, are structural rather than cyclical. Beaufort County next door was one of the fastest-growing counties in the country by household formation. The Lowcountry's growth story has runway.

Beacon is positioned at the center of that story with a relationship banking model that should win the trust of precisely the affluent transplants who arrive skeptical of megabanks and want a local alternative. The brand positioning is right. The balance sheet is growing. The team is clearly executing.

The question is whether the origination infrastructure can keep pace with the market without either burning out the loan officers or adding headcount faster than revenue supports.

Banks that solve that problem with technology, connecting the right data sources in the right sequence automatically, keep compounding. Banks that solve it with headcount eventually hit a margin wall. The Charleston market is going to deliver borrowers either way. How fast Beacon can turn an application into a closed loan will determine how much of that flow stays in-house versus leaks to lenders who answer with a link instead of a phone number.

:::pullquote
The $972 million loan book is the easy part. The next $400 million is where verification speed becomes the product.
:::

The $972 million loan book is the easy part. The next $400 million is where verification speed becomes the product.
    `,
  },
  'first-palmetto-bank-sc-performance-deep-dive': {
    title: 'First Palmetto Bank: 120 Years Old, $1B in Assets, Zero Excuses',
    description: 'First Palmetto Bank has run a 1.07% ROA and 53% efficiency ratio for 22 offices across South Carolina while its four Grand Strand branches sit inside one of the fastest-growing metros in the country. The performance is real. The manual mortgage workflow is a risk.',
    publishedDate: 'April 2, 2026',
    readTime: '6 min read',
    content: `
First Palmetto Bank was founded in 1904. The Wright Brothers had just flown at Kitty Hawk. The Federal Reserve didn't exist yet. And the bank still doesn't have an online mortgage application.

That last fact is the most interesting thing about a $1.08 billion institution that has survived every rate cycle, economic crisis, and competitive wave since Theodore Roosevelt was president.

## A Balance Sheet That Earns Respect

Start with the numbers, because they're genuinely good.

ROA of 1.07% for fiscal year 2025. Net interest margin of 3.54%. Efficiency ratio of 53%. Twenty-two offices across 12 South Carolina counties. Named America's Best Bank by Newsweek three consecutive years: 2021, 2022, and 2023.

The efficiency ratio is worth sitting with. The community bank average runs around 60-65%. First Palmetto is spending 53 cents to make every revenue dollar, a full dime cheaper per dollar than the typical peer. That's not a fluke. It reflects disciplined staffing, a clean loan book, and a management culture that doesn't chase growth it can't underwrite.

:::pullquote
First Palmetto is spending 53 cents to make every revenue dollar, a full dime cheaper per dollar than the typical peer.
:::

The footprint is genuinely diverse. First Palmetto's 22 offices span the Midlands (Camden, Columbia, Lugoff, Lexington), the Lowcountry (Mount Pleasant, Summerville), the Pee Dee (Darlington, Manning, Bishopville), four Grand Strand locations (Myrtle Beach, Surfside Beach, Little River, Loris), and Upstate markets including Greenville. That's five distinct South Carolina economies under one charter. Camden, where the bank is headquartered, is a quiet Midlands city with a manufacturing and agricultural base. Myrtle Beach is a different story entirely.

**The bank has been independent since 1904.** No holding company. No M&A activity. No private equity backstory. Just 120 years of relationship banking from the same city.

## 511 Mortgages, No Digital Front Door

Here's where the story gets interesting.

First Palmetto originated 511 residential mortgage loans in 2024. Roughly 78% of those were purchase transactions, meaning around 398 borrowers were competing to close on a home in a market where turn-time matters. Every single one of those files moved through a manual intake: a phone call or a contact form to "Find a Mortgage Banker," no embedded application, no automated verification link.

Go to firstpalmetto.com right now. Click on mortgage. You will find a list of Mortgage Bankers and a form to contact one. There is no self-service application portal. There is no fintech partnership disclosed anywhere on the site. The digital offering (mobile deposit, Zelle, Apple Pay, Google Pay) is transactional only.

This is a deliberate model. First Palmetto built its franchise on knowing borrowers personally, making relationship-based credit decisions, and keeping an examiner-clean audit trail. The approach works: that 53% efficiency ratio is the evidence.

The problem is what the approach costs in competitive markets at volume.

Each of those 511 files required someone on staff to chase pay stubs, W-2s, bank statements, employer confirmations, and IRS transcripts. At the industry average of 10-14 staff hours per mortgage file for document collection and income verification, that's somewhere between 5,100 and 7,100 staff hours a year spent gathering information that already exists in the borrower's bank accounts and payroll records. The information problem is solved. The connection to it isn't.

:::stat
**5,100 to 7,100**
Staff hours First Palmetto spends annually on mortgage document collection and income verification across its 511-loan pipeline.
:::

## The Grand Strand Volume Problem

Four of First Palmetto's 22 offices sit in Horry County.

Horry County added roughly 7,000 net new households in 2024 alone. The Myrtle Beach metro ranked among the top three fastest-growing population centers in the country that year. Median property values in the county jumped 13% year-over-year. That's not a coastal market gently appreciating. That's a market under sustained demographic pressure from people moving in, equity building, and demand for purchase mortgages, HELOCs, and vacation property financing running consistently above what any manual workflow can absorb efficiently.

The inland markets, Kershaw County, Lee County, Darlington, are slower and more stable. Borrowers there skew toward owner-occupied residential, small business, and agricultural. The verification complexity per file is real but manageable at the volume those markets produce.

The Grand Strand is different. Purchase mortgage demand from new residents. HELOC demand from existing homeowners sitting on 13% appreciation. Short-term rental investors financing vacation properties with income that comes from Airbnb rather than a W-2. Each file type requires a different verification approach. All of them are arriving at the same four offices inside a growth market that doesn't slow down to let the paperwork catch up.

Scaling that intake with the same manual document-collection process that works fine in Camden creates two problems. First, staffing pressure: you need more people to process more files. Second, turn-time risk: the buyer with a competing offer doesn't wait for HR to call back.

## Small Business Is the Hidden Complexity

First Palmetto is explicitly recognized for a higher-than-peer concentration of small business and commercial real estate loans. The bank also partnered with the CLIMB Fund to support SBA microlending, a program that serves exactly the borrowers that standard underwriting processes handle worst.

Small business borrowers don't have W-2s. Income comes from K-1s, Schedule C filings, business bank statements, and profit-and-loss summaries that tell different stories depending on the tax year, the entity structure, and whether the owner runs payroll through the business. Employment verification is self-referential: the owner is the employer.

Commercial loan officers at every bank spend disproportionate time assembling and validating financial documentation before they can credit-decision a file. At a bank whose commercial pipeline is central to its competitive identity (and to the community investment record that earned it three Newsweek awards), that document chase is happening at volume, on files that are legitimately complicated, with staff time that costs $38-50 an hour in loaded terms.

Bank-level asset verification and business income confirmation that runs in minutes, rather than the days it takes to manually pull business tax transcripts and reconcile them against bank statements, doesn't change the credit decision. It changes when the credit decision gets made. For a small business owner waiting on a line of credit, that timing difference is the whole experience.

## What 120 Years Earns You, and What It Doesn't

The Camden headquarters, the Newsweek recognition, the CLIMB Fund partnership, the pristine efficiency ratio: all of it reflects an institution that has made thoughtful decisions for a long time.

The absence of a digital mortgage application in 2026 is also a decision. It's defensible from a relationship-banking philosophy. It's expensive from an operational standpoint. And it's a real risk in the four counties where First Palmetto's growth opportunity is largest.

:::pullquote
The absence of a digital mortgage application in 2026 is also a decision.
:::

No job postings for technology or digital roles appear on the bank's site as of mid-2026. No fintech partnership is disclosed. The current digital infrastructure (Zelle, mobile deposit, contactless payments) is payment rails, not origination infrastructure.

Banks that close this gap tend to do it in phases: automate income and employment verification first, because it's a single-point integration that doesn't require replacing the core system, the loan origination system, or the branch model. The Mortgage Bankers keep their relationships. The files just stop requiring days of document collection.

The balance sheet First Palmetto has built over 120 years is a real asset. A 1.07% ROA and a 53% efficiency ratio in a rate environment that humbled most community banks is not luck. It's execution. The question heading into the next decade is whether the Myrtle Beach office can absorb 7,000 new Horry County households a year on the same intake workflow that served Camden in 1985.

The banks that answer that question fastest, without sacrificing the relationship model or the credit discipline that built the franchise, are the ones that enter their second century with the same independence they started with.

First Palmetto has earned the right to make that choice on its own terms. The borrower-permissioned data infrastructure that makes that choice possible is already available, and the gap between a 511-loan manual pipeline and a 511-loan digitally-verified one is measured in weeks, not years.
    `,
  },
  'queensborough-national-bank-trust-deep-dive': {
    title: "Queensborough's Long Runway: A $2.3B Georgia Bank Built to Last",
    description: "Queensborough National Bank & Trust has grown to $2.34B in assets across a 27-branch corridor from Louisville to Savannah without a single acquisition. The bank carries a $477M commercial real estate book with no digital front door, 57 VA loans in 2024, and a mortgage operation still running on paper. Here is the story behind the numbers.",
    publishedDate: 'March 26, 2026',
    readTime: '6 min read',
    content: `
Queensborough National Bank & Trust has never made an acquisition. Not one. Every dollar of its $2.34 billion in assets was built the old-fashioned way: one relationship at a time, in markets that most bank strategists would have passed on.

That is either the most disciplined growth story in Georgia community banking or the most stubborn one, depending on your vantage point. Maybe both.

## Louisville to Savannah: The 150-Mile Franchise

Founded in 1902 in Louisville, Georgia, the seat of Jefferson County, Queensborough has grown into a 27-branch institution that runs roughly 150 miles from its rural middle-Georgia home base through the Augusta MSA and on into the Savannah market. The holding company, The Queensborough Co., has kept the bank independent through 124 years of rate cycles, farm credit collapses, and now the fastest digital disruption in lending history.

The footprint is deliberate and unusual. Eight branches serve the Augusta area. Six cover Savannah. The rest connect rural communities: Sandersville, Wadley, Sylvania, Waynesboro, Wrens, Millen, Midville, Metter, Statesboro. These are agricultural towns, timber markets, and small manufacturing communities. Not exactly the zip codes that attract venture-backed digital lenders.

But the Augusta anchor is meaningful. The metro is growing at 1.1% annually, with Fort Eisenhower (formerly Fort Gordon) and the U.S. Army Cyber Command providing a durable institutional employment base. Columbia County, on Augusta's western side, is one of the fastest-growing counties in Georgia. That is where the mortgage volume is, and that is where Queensborough's brand recognition is strongest.

The numbers behind the operation are solid. A 1.06% ROA. Net interest margin of 3.5%. Efficiency ratio of 65.8%, which is respectable for a 27-branch institution operating across this geography. The FDIC classifies them as Specialty Group 4: Commercial Lending Specialization. CEO William Easterlin and CFO Jeffrey Karafa have run a clean ship.

## The Verification Problem Hidden Inside a $520M Mortgage Book

Queensborough originated 453 residential mortgages in 2024. The residential real estate book, construction plus permanent, is approaching $520 million. That is a serious mortgage operation for a $2.3 billion bank.

Here is the problem. The mortgage page on qnbtrust.bank says borrowers can "apply online, upload documents, and sign electronically," guided by a "dedicated local lender." There is no mention of automated income verification, open-banking data pulls, or any of the verification infrastructure that determines how fast a file actually moves from application to close.

No public reference to Plaid, Finicity, Truework, or The Work Number appears anywhere on the site or in job postings. The QNBTNOW interactive teller machines, which Queensborough operates from a centralized Augusta hub, handle teller transactions. They do not connect to loan origination. The online banking platform offers check, transfer, bill pay, and a money management budgeting add-on. That is it.

Which means 453 mortgage files a year are moving through a process that involves local lenders collecting paper pay stubs and bank statements, processing them manually, and chasing borrowers by email when something is missing. In Sylvania. In Midville. In Wadley. Places where the nearest branch competitor is 20 minutes away but the nearest digital mortgage lender is one app download away.

Fifty-seven of those 2024 originations were VA loans. About 12.6% of the mortgage mix. Fort Eisenhower's military population generates that demand, and it is the segment national digital lenders target most aggressively. Rocket Mortgage held 5.8% market share in the Augusta footprint last year versus Queensborough's 3.6%. Military households move frequently. They decide fast. A VA borrower hunting for LES statements and DD-214s while waiting on a local lender callback will choose the lender who can do it in a single digital step.

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

Queensborough has built a franchise that most community banks cannot replicate: 124 years in the same markets, 27 branches across an agricultural spine and two growing MSAs, a $2.34 billion balance sheet grown entirely organically. That is a competitive moat.

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
    title: 'The Century Bank That Hired a Chief Digital Officer',
    description: "Southern Bank and Trust has run $5 billion across 57 eastern North Carolina branches for over a century. In 2024, they hired a Chief Digital Officer from First Citizens Bank. What that hire means for borrowers from the tobacco belt to the Outer Banks.",
    publishedDate: 'June 25, 2026',
    readTime: '6 min read',
    content: `
Southern Bank and Trust has been in Mount Olive, North Carolina since 1901. That is twenty-two years before the Federal Reserve opened, twelve years before the income tax, and one year after Mount Olive itself was incorporated. The Wright Brothers flew at Kitty Hawk two years later.

In late 2024, the bank that survived the Depression, the farm credit collapse of the 1980s, and every interest rate cycle since hired a Chief Digital Officer.

That is the story worth following.

## The Balance Sheet

Southern Bank and Trust Company is the banking subsidiary of Southern BancShares (N.C.), Inc., traded OTC as SBNC. Total assets as of Q1 2026: $5.25 billion. Fifty-seven branches across eastern North Carolina and southeastern Virginia. Headquartered in Mount Olive, Wayne County.

The Q1 2026 numbers: ROA of 0.89% on $11.7 million in quarterly net income. Efficiency ratio of 53.23%. Net loans of $3.44 billion. Those are solid numbers for a bank operating in one of the less economically dynamic corners of the American Southeast.

:::stat
**53.23%**
Southern Bank's Q1 2026 efficiency ratio, trending down from the mid-50s, on a 57-branch footprint spanning three distinct borrower economies.
:::

Full year 2025 was stronger: ROA of approximately 1.17%, full-year net income approaching $60 million, and an efficiency ratio trending from the mid-50s toward the low 50s. The fourth quarter of 2025 showed ROA of 1.19%, consistent with a well-run institution operating near the top of its performance range. For a bank this size, in this geography, those numbers represent genuine execution.

## Eastern Carolina

Wayne County, North Carolina, where Southern Bank is headquartered, is one of the state's more complicated economic stories.

Seymour Johnson Air Force Base sits in Goldsboro, the county seat. It employs thousands of active-duty personnel, defense contractors, and civilian workers and has anchored the regional economy for decades. In 2024, the Air Force announced plans to divest 26 aircraft from the base, eliminating an estimated 520 Wayne County jobs. Congressman Don Davis has been pushing back publicly. The situation remains unresolved as of mid-2026.

Wayne County is also classified as one of North Carolina's most economically distressed counties. Tobacco country, historically. The decades-long shift away from tobacco farming reshaped the county's agricultural economy, and the replacement industries (poultry, food processing, distribution) pay materially less. Unemployment runs above the state average.

But Southern Bank's footprint is not just Wayne County. Their branches run from the tobacco-and-hog-farming interior (Duplin County, Lenoir County, Wilson County) to the coast. The Kill Devil Hills branch sits in Dare County, home of the Outer Banks. These are markets with entirely different borrower profiles: agricultural businesses with seasonal income cycles in the west, military families rotating through Goldsboro in the center, vacation property investors and hospitality workers on the coast.

That geographic complexity is not a liability if you can price and verify it correctly. It becomes a liability when your verification stack treats a crop-year-end payment from a Duplin County pork farmer the same as a Dare County beach house mortgage.

:::pullquote
That geographic complexity is not a liability if you can price and verify it correctly.
:::

## What 57 Branches Means in Practice

Southern Bank operates across three distinct economies connected geographically but not economically.

An agricultural borrower in Lenoir County has income that does not look like a W-2. A sergeant at Seymour Johnson AFB has base pay plus housing allowance (BAH) plus subsistence allowance (BAS) plus possible special duty pay. An Outer Banks vacation rental property owner has short-term rental income from Airbnb that does not appear on a standard pay stub.

Each borrower type requires a different verification approach if you want to close the loan at speed. Most community banks operating across footprints this diverse end up with a patchwork: different processors handling different income types with different document requests, different turnaround times, and no consistent audit trail across the portfolio.

A bank that closes a tobacco country commercial loan in 45 days and a Kill Devil Hills vacation property in 21 days is not operating consistently. It is accumulating risk in the form of process variance that does not show up on the efficiency ratio until it suddenly does.

The C&I book runs at $246 million. Agricultural loans are $39.6 million, less than 1% of total assets. The residential real estate and consumer book makes up the bulk of the $3.44 billion loan portfolio. That mix, across 57 branches and three borrower economies, is the operational challenge that a 53.23% efficiency ratio is hiding or solving depending on which direction it is moving.

## The Digital Officer

Sondra McCorquodale joined Southern Bank as Executive Vice President and Chief Digital Officer. She came from First Citizens Bank, where she built digital experience as that institution grew into a $220 billion bank after its Silicon Valley Bank acquisition. Before First Citizens, she was at RBC Bank. She completed the LSU Graduate School of Banking program in 2016.

The CDO title at a $5 billion eastern North Carolina bank is not a vanity appointment. Southern Bank is not a startup looking for a press release. The hire signals a specific thesis: that the next phase of growth at a 125-year-old institution requires a systematic upgrade to how borrowers move through the lending process, not just a better mobile app.

:::pullquote
The CDO title at a $5 billion eastern North Carolina bank is not a vanity appointment.
:::

The question McCorquodale is working through is how to modernize the intake layer across 57 branches serving three distinct borrower economies without dismantling what has worked for 125 years. That is a harder problem than the hire makes it sound.

## The Verification Layer

At 65% loan-to-asset ratio, Southern Bank has room to grow loans. The question is whether they can grow them efficiently without adding proportional verification overhead.

With a 57-branch footprint spanning agricultural, military, and coastal markets, the income verification complexity per file runs above the community bank average. Farm income, military compensation structures, and vacation rental cash flow all require different data sources and produce different document types. Manual collection processes that work adequately at low volume become the binding constraint as the pipeline scales.

The efficiency ratio trending from the mid-50s toward 53% suggests management is already working the problem from the expense side. The other side of that ratio is fee income and origination throughput, both of which respond directly to how fast files move from application to close.

Banks at $5 billion in assets with a named Chief Digital Officer and a century-long franchise are typically at the moment where the next operational investment either compounds the advantage or gets absorbed by the complexity of the existing footprint. The verification layer is usually where that decision becomes visible first.

Eastern North Carolina is not the highest-growth market in the Southeast. Wayne County is working through a military base employment uncertainty. The tobacco economy finished its long decline years ago. But a bank running 1.17% ROA with 57 branches and a CDO making deliberate choices about digital infrastructure is building something that outlasts the current rate environment.

The Outer Banks will still need mortgages. The pork farmers in Duplin County will still need working capital lines. The sergeants cycling through Seymour Johnson will still need to close on a house in 30 days.

The question is who closes it for them.
    `,
  },
  'chime-account-opening-deposit-war': {
    title: 'The 92% Problem',
    description: 'Community banks built digital account opening. Then 92% of customers abandoned it on mobile. Chime does it in two minutes, added 700,000 members last quarter, and went public on NASDAQ. A step-by-step look at what each side actually does.',
    publishedDate: 'June 24, 2026',
    readTime: '5 min read',
    content: `
Community banks built digital account opening. Then 92% of customers abandoned it on mobile before finishing. Chime built the same thing and made it take two minutes.

That gap is where deposits go to die.

Chime now has 10.2 million active members, up 19% year-over-year, adding roughly 700,000 net new members in a single quarter. $2.2 billion in 2025 revenue. Just went public on NASDAQ. The entire operation runs without a single branch, without a signature card, and without a ChexSystems pull. For an increasing share of American consumers, that's not a compromise. It's the point.

## What Chime Actually Does

The Chime account opening flow takes under two minutes. Name, address, date of birth, Social Security number, photo ID upload. Done.

The account activates within minutes. A debit card shows up in the mail in 7-10 days. No initial deposit required. No branch visit. No utility bill. No waiting for a banker to finish with the person ahead of you.

The ChexSystems piece is deliberate. Chime doesn't use it, and they advertise that fact. ChexSystems is the consumer reporting agency most banks pull during account opening to flag applicants with prior overdraft history, bounced checks, or account misuse. An estimated 25 million Americans have ChexSystems records that limit their banking options. Chime's position: those people are customers too, and their money spends the same.

The verification that does happen runs in the background. Identity screening, fraud detection, OFAC checks. The customer never sees it. The account either opens or it doesn't.

## What a Community Bank Does Instead

Walk into a community bank to open a checking account and the process runs 20-45 minutes, depending on the branch, the banker, and whether the printer is cooperating.

You need a government-issued photo ID, your Social Security number, an initial deposit, and sometimes a utility bill for address verification. The banker runs a ChexSystems pull. They fill out a signature card. They walk you through account disclosures. They explain the overdraft protection options. They hand you a temporary debit card or tell you the permanent one arrives in 10 business days.

It is thorough. It is relationship-oriented. It is also 45 minutes when your competitor does it in two.

:::pullquote
It is thorough. It is relationship-oriented. It is also 45 minutes when your competitor does it in two.
:::

The digital version is theoretically faster. In practice, 67% of community bank digital account applications are abandoned before completion. On mobile, that number is 92%. Customers hit a friction point (document upload, video verification, initial deposit transfer) and leave. Most never come back.

Only 20% of community bank checking accounts originate online, despite 31% year-over-year growth in digital openings. The growth is real. The base is still small.

:::stat
**92%**
The mobile abandonment rate for community bank digital account opening flows — the share of customers who start an application on their phone and never finish it.
:::

## The CFPB File

Chime's model is not without its problems. The speed that makes account opening frictionless also makes account closing painful.

In May 2024, the CFPB fined Chime $3.25 million and ordered $1.3 million in consumer redress for illegally delaying refunds after account closures. In thousands of cases, customers waited more than 90 days to get their money back. A separate California DFPI consent order added a $2.5 million penalty for complaint handling failures.

The CFPB complaint database is full of variations on the same story: Chime freezes an account for suspected fraud, the customer can't reach anyone, bills go unpaid, and the dispute process disappears into a customer service queue with no end.

This is the tradeoff Chime made. No ChexSystems means more accounts opened. No branches means lower costs. But it also means no banker to call when something goes wrong and a dispute process that runs on email and chatbots.

A community bank's 45-minute account opening includes a human who knows the account number, can look at the screen, and can fix a problem on the spot. That's not nothing. The question is whether the people who value that are still the people opening new accounts.

## Where the Deposits Are Going

Fifty-two percent of consumers say they are open to switching banks in the next 12 months, according to J.D. Power's 2025 U.S. Retail Banking Satisfaction Study. Twenty percent moved money away from their primary bank in the prior three months, up from 17% the year before.

The average checking customer now holds accounts at three different institutions. Primary bank, high-yield savings somewhere else, maybe a fintech account for a specific purpose. The concept of a single banking relationship is eroding faster than most community bankers want to believe.

The top driver of switching? Mobile banking capability, cited by 36% of switchers. Not rate. Not fees. The phone.

:::pullquote
The top driver of switching? Mobile banking capability, cited by 36% of switchers. Not rate. Not fees. The phone.
:::

## What Can Actually Be Fixed

The gap between Chime and a community bank is not entirely closable. Chime has a decade of mobile-first product investment, a $2.2 billion revenue base, and no physical infrastructure to maintain. No community bank is going to out-engineer that.

But the 92% mobile abandonment rate is not a technology gap. It is a process gap. Most community bank digital account opening flows ask for too much information in the wrong order, time out before the customer finishes, require a branch visit to complete verification, or break on the document upload step.

Fixing those specific failure points does not require rebuilding the entire stack. It requires knowing where customers are leaving and eliminating the friction at those moments. The banks that have done it are already taking share from the ones that haven't.

Chime adds 700,000 members in a quarter. Most of them came from somewhere. The question is whether any of them came from yours.
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
    description: 'Carolina Bank & Trust runs a 1.68% ROA, a 44.86% efficiency ratio, and zero foreclosed real estate out of Lamar, SC — right between a county shedding timber jobs and a county landing a $1.62 billion EV battery plant. Here is how a 90-year-old family bank navigates the gap.',
    publishedDate: 'June 17, 2026',
    readTime: '5 min read',
    content: `
In August 2025, Canfor shut its Darlington, South Carolina sawmill permanently. One county over, workers were breaking ground on a $1.62 billion electric vehicle battery plant. Carolina Bank & Trust, headquartered in Lamar since 1936, had a front-row seat to both.

The bank didn't flinch.

ROA of 1.68%. Efficiency ratio of 44.86%. Net interest margin of 4.07%. Zero foreclosed real estate on the books. These are the numbers of a bank that has been quietly, methodically doing something right for three generations, while the economy around it lurched from tobacco to textiles to timber and now to lithium-ion batteries.

## A Balance Sheet Built for Turbulence

Carolina Bank & Trust runs $830 million in assets from 14 branches across 6 Pee Dee counties. Ninety-three employees. The Beasley family has run it since founding in 1936, and still does.

The numbers stand out immediately. A 1.68% ROA clears the community bank average of roughly 1.32% by a comfortable margin. The efficiency ratio, at 44.86%, means less than 45 cents of every revenue dollar goes to overhead, in a year when many community banks were watching expenses creep past 60 cents. Net interest margin sits at 4.07%, healthy even as the rate environment has whipsawed smaller institutions.

Then there's the capital ratio: 20.23% Tier 1 risk-based. Nearly double the regulatory minimums. Some banks call that overcapitalized. At Carolina Bank, it looks more like institutional philosophy.

The OREO line (other real estate owned, the catch-all for properties a bank has had to take back from borrowers) is zero. No foreclosures. No watch flags. For a community bank whose footprint includes counties with unemployment above 5%, that's not luck. That's underwriting.

:::stat
**1.68%**
Carolina Bank & Trust's return on assets, clearing the community bank average of roughly 1.32% by a comfortable margin while running a 44.86% efficiency ratio and zero foreclosed real estate.
:::

## Darlington's Hard Year

Darlington County has had a rough stretch. Unemployment hit 5.5% in mid-2025, ticking up as Canfor, the Canadian timber giant, announced it was closing its local sawmill for good. The company had posted a $942 million operating loss in 2024. About 120 jobs disappeared.

This kind of event ripples. A sawmill doesn't just employ sawyers. It employs the truckers who haul the logs, the mechanics who maintain the equipment, the lunch spots near the plant. In a county of roughly 60,000 people, 120 direct job losses carry a multiplier.

Carolina Bank operates right in the middle of this. Lamar is in Darlington County. Their customers include the kind of small businesses and households that feel a mill closure in their cash flow months before it shows up in any economic data.

The fact that their loan book looks pristine anyway says something.

:::pullquote
The fact that their loan book looks pristine anyway says something.
:::

## Florence and the Battery Bet

Drive 20 minutes northeast and you're in Florence County. Different story entirely.

Florence has attracted $917 million in announced capital investment in recent years, anchored by AESC's $1.62 billion electric vehicle battery facility. Total job creation from the AESC plant alone: 1,620 positions. Advanced manufacturing, not sawmill work. Higher wages, different skill profiles, longer ramp-up timelines.

The housing market is already pricing it in. Median home prices in Florence hit $264,000, up 12.4% year-over-year. Days on market are creeping up (80 days versus 68 the prior year), which usually means supply is starting to catch up with demand. But the underlying demand is real and the price appreciation suggests buyers are still showing up.

Carolina Bank has branches in Florence County. They're sitting on exactly the side of this story where money flows first: construction lending, small business formation, household deposit growth as new workers arrive and new paychecks clear.

## What Three Generations Gets You

There's a version of this story where a 90-year-old family bank in rural South Carolina is a cautionary tale. Sleepy. Slow to modernize. Running on relationship inertia until rates squeeze the margin out.

Carolina Bank is not that story.

The 44.86% efficiency ratio is not achieved by accident. It requires discipline in staffing, in technology decisions, in not chasing products the bank doesn't understand. Ninety-three people running $830 million in assets is a lean operation. The 4.07% NIM means the bank is pricing loans and deposits with precision, not desperation.

The 20.23% capital ratio is the most interesting number, though. That much capital on the balance sheet is expensive in good times. But it's also optionality. When the EV economy in Florence starts generating serious loan demand, when the new-resident wave from AESC creates a mortgage market that didn't exist two years ago, a bank with that capital position can move fast without asking permission from regulators.

It also means they can absorb a Canfor-level shock without blinking.

## What Comes Next

The Pee Dee region is at an inflection point most rural economies don't get twice. The old manufacturing base is contracting. The new one is arriving. The gap between those two economic arcs, played out at the county level, is exactly the kind of transition that tests a bank's underwriting judgment, its local knowledge, and its capital reserves.

Carolina Bank & Trust has spent 90 years learning this landscape. The Beasley family knows which Darlington businesses have the cash flow to survive a mill closure and which don't. They know which Florence contractors are positioned to benefit from AESC construction and which are overextended on equipment loans.

That kind of knowledge doesn't show up on a call report. But the results do.

Banks that navigate economic transitions well aren't always the ones with the slickest technology or the largest balance sheets. They're the ones that can distinguish between a borrower who's temporarily stressed and one who's structurally impaired. In a region where both types exist in the same zip code, that's the whole game.

:::pullquote
Banks that navigate economic transitions well aren't always the ones with the slickest technology or the largest balance sheets.
:::

The $0 OREO line is the evidence. Carolina Bank is playing it right.
    `,
  },
  'rocket-mortgage-22-days-how': {
    title: 'How Rocket Mortgage Closes in 22 Days',
    description: 'Independent mortgage banks now originate 84% of U.S. mortgages. Banks gave that market away one slow VOE call at a time. A step-by-step breakdown of what Rocket does differently, and what community banks can actually copy.',
    publishedDate: 'June 15, 2026',
    readTime: '7 min read',
    content: `
Independent mortgage banks now originate 84.1% of all U.S. single-family mortgages. Banks held that market. They gave it away, one slow VOE call at a time.

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
    readTime: '5 min read',
    content: `
Coastal States Bank holds more deposits in Beaufort County than Wells Fargo. More than Bank of America. More than SouthState, Truist, or TD. And the loan book behind that #1 hometown franchise is, to a degree that surprises almost everyone who looks, made of boats.

Marine vessels are 18.9% of total loans. Senior housing is another 15.6%. The "island bank" on Hilton Head is actually a national specialty lender that happens to dominate one of the wealthiest retirement markets in America.

:::stat
**18.9%**
Marine vessels make up nearly one-fifth of Coastal States Bank's total loan book, more than residential mortgages.
:::

## From recapitalization to the NYSE in eight years

Coastal States was founded in 2004 as southern Beaufort County's only locally owned bank, and for its first decade it behaved like one. The inflection came in 2017, when Stephen Stone arrived with a recapitalization and a different idea: keep the Lowcountry deposit franchise, but lend nationally in niches where a $2B bank can actually win.

It worked. Total assets reached $2.35 billion this March. The holding company, CoastalSouth Bancshares, listed on the NYSE last July at $21.50 a share; it trades around $25.50 today, up 28.5% in twelve months. The first dividend in company history, a nickel a share, went out in April.

:::pullquote
In a county with $6.55 billion in total deposits, Coastal States holds $1.17 billion, a 17.9% share that beats every megabank on the island.
:::

The deposit side is the quiet star. In a county with $6.55 billion in total deposits, Coastal States holds $1.17 billion, a 17.9% share that beats every megabank on the island. Its flagship Hilton Head branch alone gathered $735 million, up from $559 million a year earlier. Core deposits grew $117.9 million in the first quarter of 2026 alone.

That's the foundation national lenders dream about: cheap, sticky, locally gathered funding, deployed into specialty assets most community banks can't underwrite.

## What the niches actually look like

Pull apart the $1.8 billion loan book and the community-bank label dissolves. Income-producing CRE is 23.1%. Marine vessels, 18.9%. Senior housing, 15.6%. Residential mortgages, just 12.4%. Add national SBA/USDA lending and warehouse lines for mortgage bankers, and five of the bank's eleven branches sitting in metro Atlanta, and you have something closer to a mini Live Oak than a coastal thrift.

The model prints respectable numbers: 1.11% ROA, 3.61% NIM, a 59% efficiency ratio, and charge-offs of one basis point.

But the growth-mode costs are visible too. ROE has come down from 15.9% in 2023 to 10.0% now, diluted by the IPO raise and compressed by deposit competition. The efficiency ratio has drifted up eight points from its 52% best. Nonperforming assets, 0.21% of assets in 2023, now sit at 0.78%. None of it alarming. All of it the price of building Charleston, where the bank announced a new commercial team under Market President Edward Vaughan in January.

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
    readTime: '6 min read',
    content: `
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

What the bank did with its newfound quiet is the interesting part. It didn't hunker down. It bought Mutual Savings Bank, its second whole-bank acquisition since 2018 (Stephens Federal in Georgia was the first), extending its footprint to nine branches across Upstate South Carolina, two Georgia counties, and now Hartsville. It launched a 50,000-share buyback in April 2025. The supposedly sleepy thrift has been the most acquisitive bank in its weight class in the region.

## The Lake Keowee question

Oconee Federal's geography has been a gift. South Carolina led the nation in net migration of residents 65 and older, adding 5,427 in 2025 alone, and Oconee County, home to Lake Keowee and Lake Hartwell, is precisely where a lot of them land. The county's population grew 1.44% last year. Waterfront homes on Keowee carry a median sale price around $1.8 million and have appreciated 7% or more annually for a decade.

For a residential mortgage lender, that's about as good as local conditions get. And the bank has been leaning in: total loans grew from $478.7 million last June to $491.8 million by March, brisk movement for an institution this conservative.

But the tide may be turning just as the bank speeds up. Lake Keowee inventory has climbed to 7.8 months of supply, the highest in years and firmly buyer's-market territory. Countywide median sale prices went slightly negative year over year this spring even as price per square foot kept rising. Seneca's typical home value sits at a modest $273,146, up 3.7%, so the core market is fine. The froth, though, is coming off the waterfront.

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
    readTime: '7 min read',
    content: `
In 1933, Harry Arthur watched every bank in Union County fail. So he built one. Ninety-three years later, it's still in the family, and it's posting numbers that would make most regional bank CFOs uncomfortable.

Arthur State Bank is not a name that shows up in earnings coverage or fintech conference panels. It has 18 branches, 152 employees, and $825 million in assets. It is, by almost any measure, a small community bank in a part of South Carolina that has seen better decades.

And yet: a 4.44% net interest margin. A 16% return on equity. A Texas Ratio of 5.9%. A Tier 1 capital ratio of 12.17%.

Those are not small bank numbers. Those are the numbers of an institution that has figured something out.

## Born in a Crisis, Built to Last

The origin story matters here.

It's April 1933. Franklin Roosevelt has just ordered every bank in America closed for a four-day "bank holiday." When the dust settles in Union County, South Carolina, only one bank is deemed sound enough to reopen, and it's in Jonesville, not Union itself. The county seat has no functioning bank.

Harry Arthur, 33 years old, owned department stores, hosiery mills, and cattle herds. He had deposits to protect and a town to keep liquid. So he and his father and two brothers started the Arthur Depository. It became a full bank two years later. The family has run it ever since.

That founding context is not incidental. Banks born in crises tend to develop a constitutional aversion to risk that outlasts the people who lived through it. Arthur State Bank's Texas Ratio of 5.9% and non-current loan ratio under 0.6% are not accidents. They are the institutional expression of a family that watched the alternative play out in real time.

:::pullquote
Banks born in crises tend to develop a constitutional aversion to risk that outlasts the people who lived through it.
:::

## The Numbers That Don't Fit the Zip Code

Union County is not a growth market. Population is declining at roughly 0.93% annually. Unemployment sits at 6.4%, well above the state average. Median household income is $41,200, nearly 45% below the national median. The town where Arthur State Bank was founded is, by most economic metrics, struggling.

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

Greenville-Spartanburg is one of the ten fastest-growing metro areas in the country for the second consecutive year. The region added more than 10,500 residents between July 2023 and July 2024 alone. BMW's Spartanburg plant employs 11,000 people and is opening a $1.7 billion EV battery facility in 2026. Woodward just committed $200 million to a new aerospace components plant in Spartanburg. Michelin, Boeing, GE, and Lockheed Martin all have significant operations in the corridor.

South Carolina's GDP grew at 3.5% year-over-year in Q3 2025, the fastest rate in the nation. The Upstate is driving most of that.

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

Arthur State has the capital to absorb that transition. Tier 1 at 12.17%, loan loss reserves covering non-current loans at 183%, essentially no owned real estate on the books. The balance sheet is clean.

## What 93 Years Buys You

The thing about a bank that has been family-owned for 93 years is that it doesn't optimize for next quarter. The Arthur family has survived the Great Depression, the savings and loan crisis, the 2008 financial crisis, and the rate shock of 2022-2023. They didn't sell after any of those.

That institutional patience shows up in the portfolio lending strategy, in the long-tenured executives, in the decision to promote from within rather than sell out when the CFO retired. It shows up in a Texas Ratio that would be the envy of banks twice their size.

The Upstate South Carolina economy is in the middle of a genuine industrial renaissance. BMW's battery plant opens this year. The population keeps coming. The loan demand follows. Arthur State Bank has 18 branches sitting in the path of that growth, a clean balance sheet, and a management team that has been preparing for this moment for a long time.

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

:::stat
**6.1%**
Anderson Brothers' net interest margin, nearly double the community bank industry average of 3.3%.
:::

To put that in context, the bank had $500 million in total assets in 2015. Today it has $2.19 billion. That's 16% compounded annual growth over a decade, and not a single acquisition since buying Anderson State Bank in Hemingway in 2000. Every dollar of growth has come the hard way.

How does a community bank in rural South Carolina generate margins that would make most regional bank CFOs do a double-take? Two things: what they lend, and who they fund it with.

## The Tobacco Town Funding Machine

Anderson Brothers' home market is Marion County, South Carolina. This is not a glamour market.

Population: approximately 28,215 people, declining at about 0.5% per year. Median household income: $24,304. Every county in the Pee Dee region recorded more deaths than births from 2020 to 2023. The economic base is agricultural and light industrial: Sopakco Packaging, DMA Sales, tobacco farming legacy.

What that market lacks in growth it more than compensates for in deposit loyalty. Anderson Brothers holds roughly 60% of Marion County deposits. That's not a market share number, that's a lock. When you fund your loan book with low-cost deposits from a market where you've been the dominant bank for 90 years, your cost of funds stays structurally below what banks in competitive urban markets can achieve. That deposit advantage flows directly into NIM.

:::pullquote
60% of Marion County deposits. That's not a market share number, that's a lock.
:::

The bank explicitly tracks this. Management describes its retained earnings model as generating 16%+ return on reinvested capital, compounding equity without dilution. That framing is unusual for a community bank. It reflects a discipline about how deposit advantage translates into compounding shareholder value over time.

## The Non-Prime Auto Bet

The other half of the margin story is what Anderson Brothers lends.

Consumer loans represent 28.5% of the loan book, a notably high share for a bank this size. The product driving that number is non-prime indirect auto lending, a specialty the bank has deliberately built and maintained. Non-prime borrowers pay higher rates. They also default more. The bank's management is not naive about this: the shareholder letter acknowledges that auto delinquencies peaked in mid-2024 and spent most of 2025 recovering. As of early 2026, past-due accounts in that portfolio had returned to their lowest level since September 2022.

The math works because the yield on non-prime auto more than compensates for the higher loss rate, especially when you're funding it with 60%-market-share rural deposits. Anderson Brothers is essentially running a carry trade that most community banks either can't execute or won't touch. They've been doing it long enough to manage the cycle.

Credit quality across the full book is clean. Non-current loans sit at 0.52% of the portfolio. The Texas Ratio (a measure of problem assets relative to capital and reserves) is 4.16%. Any figure below 10% is considered healthy. The loan loss reserve covers non-current loans at 338%. These are not the numbers of a bank taking reckless risk.

:::stat
**338%**
Anderson Brothers' loan loss reserve covers non-current loans at more than triple the balance, signaling a conservative credit cushion despite the higher-yield non-prime book.
:::

## Six Years, Eleven Spots

The story that explains where Anderson Brothers is going is Horry County.

Myrtle Beach is a different world from Mullins. Horry County has unemployment around 3-4%, median home prices around $327,000-$360,000, over $100 million in active hotel investment, and a tourism-driven economy that has grown consistently for two decades. LinkedIn named Myrtle Beach one of its Top Cities on the Rise in July 2025.

Six years ago, Anderson Brothers Bank ranked 11th in Horry County deposit market share among 20 competing banks. Today they rank 2nd.

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

Meanwhile, the lender also needs to verify employment. If the employer is in The Work Number's database, an automated report comes back instantly. But The Work Number's coverage is inconsistent for small businesses, nonprofits, newer companies, and gig platforms. When an employer isn't in the database, a human initiates outbound verification: independently validate the employer's phone number and physical location, call HR, verbally confirm employment status and job title, and obtain income details in a separate written format. Fannie Mae requires a verbal VOE completed within 10 business days of the loan note date regardless, which means lenders cannot do this step early. It becomes a closing-week bottleneck on every single file.

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
    readTime: '8 min read',
    content: `
Art Seaver has been running Southern First Bank for 26 years. He's watched Greenville go from a post-textile mill town to a metro that just crossed one million residents. That context matters when you look at what his bank just reported.

Q4 2025 earnings per share: $1.21. Up 73% from a year ago.

## The Numbers First

Southern First Bancshares finished 2025 with $30.4 million in net income, a net interest margin of 2.72% (up 47 basis points year-over-year), and a loan book that grew 6% to $3.85 billion. CEO Seaver, President Justin Strickland, and CFO Andy Borrmann have spent the last two years fighting margin compression like every other community bank in America. They've come out the other side in genuinely strong shape.

The credit quality numbers are almost hard to believe.

Net charge-offs for the entire year: $69,000. On a $3.85 billion portfolio. That's not a rounding error, that's a bank whose borrowers are paying their bills. Nonperforming assets sit at 0.32% of total assets. Past due loans are 0.13%.

That kind of performance doesn't happen by accident. It happens when you're lending into a market that keeps growing.

:::pullquote
Net charge-offs for the entire year: $69,000. On a $3.85 billion portfolio. That's not a rounding error, that's a bank whose borrowers are paying their bills.
:::

## 30 People a Day

Here's the thing about Upstate South Carolina that most people outside the region don't fully appreciate.

Thirty people relocate to the Greenville-Spartanburg area every single day. South Carolina netted over 68,000 domestic migrants in 2023-2024 alone, and the Upstate captured the overwhelming share of that growth. They're coming from Florida, New York, Ohio, Michigan, Pennsylvania, Connecticut, California. People leaving high-cost metros and landing in a place where the cost of living runs as much as 88% lower than Manhattan.

Greenville County added 11,049 new residents in a single year. Spartanburg is the third-fastest growing metro in the country. The Greenville metro just crossed one million people for the first time, adding nearly 86,000 residents since the 2020 Census.

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

But 74% of their loan book is in real estate, commercial and consumer combined. And the Greenville housing market is shifting.

Inventory is up 28.2% year-over-year. Days on market climbed to 71, up from 62 a year ago. The median sales price dipped 0.8%. None of these numbers signal a crash. They signal a market normalizing after years of frenzied appreciation, which is healthy. But normalization looks different on a bank balance sheet than it does in a real estate brochure.

The honest read is that Southern First's credit quality has benefited from a rising-tide market. Borrowers who got in trouble could sell. Collateral values held. That cushion is thinner now. Not gone, just thinner.

The BMW battery plant opens next year. Migration is still running at 30 people a day. The industrial investment pipeline is full. Those are real tailwinds and Art Seaver has been navigating this market long enough to know the difference between a headwind and a speed bump.

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
        dateModified: toIsoDate(article.publishedDate),
        author: { '@type': 'Organization', name: 'RAVEN', url: 'https://reportraven.tech' },
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
            <span>{article.publishedDate}</span>
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
