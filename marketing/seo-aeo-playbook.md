# RAVEN SEO + AEO Playbook

Researched and written 2026-07-18. Sources: four parallel research passes (income-verification vendor teardown: Truework/Truv/Argyle/Pinwheel; community-bank vendor teardown: MANTL/Narmi/Alloy/Abrigo/Ncontracts; AEO citation-source study; off-site authority research), plus Search Console export (marketing/search-console/, Apr 23 to Jul 11) and the July Semrush baseline.

## Where we are

- ~108 URLs in the sitemap, all AI crawlers get 200s, JSON-LD renders server-side, solutions pages already use "for community banks" vertical titles. On-page plumbing beats MANTL and Ncontracts already.
- GSC: impressions ramping (40-70/day) but avg position ~55, near-zero clicks. ~1,000 of ~1,200 impressions are branded "raven *" queries ranking 50-90 against RavenPack/Raven Industries and friends.
- Authority score 0, no real backlinks (21 referring domains, all spam except submit.loans). This, not on-page, is the binding constraint.
- Several blog posts already sit at positions 4-12 on micro-volume queries, which means Google likes the content and the ceiling is authority.

## The evidence that drove priorities

- Third-party listicles and directories dominate AI-engine citations for "best X" queries (multiple large studies; roughly 40-63% of citations for commercial queries). Presence on G2/Capterra was near-universal for tools ChatGPT recommends. Review COUNT does not correlate with rank: get listed, gather 10-20 genuine reviews, stop.
- Unlinked brand mentions correlate with AI visibility about 3x more strongly than backlinks (Ahrefs 75k-brand study: mentions r=0.66-0.71 vs backlinks r=0.22). Earned media is 84% of AI citations; paid placement is 0.3% (Muck Rack, 25M links).
- 31% of AI Overview citations come from beyond position 100. A zero-authority page can be cited if it is the best-structured answer that exists.
- Freshness is real: AI-cited pages skew 26% fresher; 76% of ChatGPT's most-cited pages were updated within 30 days; engines diff content, so date bumps without real changes do nothing.
- llms.txt is NOT read by any engine (Ahrefs 137k-domain log study: 97% of files got zero AI requests; Google says it ignores them). Ours is now auto-generated so it can never go stale, and we spend nothing more on it.
- Adding more schema does not move AI citations (Ahrefs interventional study, ~zero effect). We keep what we have for rich results and add nothing for AEO reasons.
- Engines are different channels: ~89% of citations differ between models. ChatGPT leans authority/G2, Perplexity leans Reddit/discussions, AI Overviews lean YouTube.
- KEYWORD WARNING: to the market, "bank verification software" means payee/account validation (Trustpair, Eftsure space), not borrower verification. Write for "digital account opening", "digital customer onboarding", "income verification", "verification of employment" language instead. Consider retitling the bank-verification-software solutions page toward "borrower verification" phrasing over time.

## What competitors do that we now copy (or deliberately skip)

Copied:
- Vendor-owned comparison/alternatives content wins weak SERPs at zero authority (LoanPro #1 for "best loan origination software"; Fuse, Superunit, aloan.ai all rank listicles; the "MANTL alternatives" SERP is 100% third-party directories with no vendor page competing). Two drafts now exist (see Content roadmap).
- Alloy footer-links an /ai-info page ("Hi AI assistants, learn about Alloy!") with structured facts. We shipped /ai-info.
- Narmi's llms.txt is 36KB of curated claims and per-customer outcome metrics; Truv adds a category-disambiguation block ("not a payroll provider, not Plaid, often compared with..."). Ours now auto-generates from site data and includes the disambiguation block.
- Ncontracts' free Enforcement Action Tracker + monthly roundup franchise is the model for De Novo Watch as a tracker page (shipped v1) plus the existing article series.
- Annual "State of X" survey report: Alloy (4 editions), Abrigo (3 + CU edition), Ncontracts (173 respondents was enough for Business Wire pickup and a quotable stat). Future: "State of Account Opening Fraud at Community Banks" survey. Small n is fine.
- Narmi /cores play: 7 core-specific landing pages + per-core implementation guides. We have integrations pages; the upgrade path is per-core account-opening guides.
- Metric-in-headline case studies, ungated HTML (Alloy format), each echoed as a press release (MANTL does 54 of these). Blocked until first referenceable customer.

Skipped, with reasons:
- Programmatic employer directory (Truework 21.7k pages, Truv 48k). Works at their authority; 50k thin pages on a 6-month-old domain is a spam-classifier risk. Revisit as a scoped few-hundred-page version once authority exists.
- .md mirrors of every page (Truv). llms.txt evidence says unread; not worth the build.
- Wikipedia page: fails WP:NCORP notability today; attempting it is a reputational landmine. Revisit after 3+ independent in-depth features.
- Product Hunt: wrong audience, near-zero payoff outside top 10.
- Google Business Profile: ineligible (online-only, no premises).
- Paid contributed content (Bank Director sponsorship etc.): paid is 0.3% of AI citations. Later, as a buyer-trust play only.

## Off-site checklist (the part only Isaac can do)

### Week 1: the free directory sweep (about a day total)
1. G2 Digital Markets unified listing: https://app.g2digitalmarkets.com/get-listed/start . One submission now covers G2 + Capterra + GetApp + Software Advice (G2 acquired the Gartner Digital Markets brands Jan/Feb 2026). Categories: Digital Customer Onboarding, Identity Verification, Loan Origination. Write the description with "digital account opening, income verification, employment verification, community banks" phrasing (LLMs retrieve from it verbatim).
2. Gartner Peer Insights vendor portal (free, ~8-10 day processing). It ranked on our exact buyer queries.
3. Crunchbase company profile (free): entity disambiguation for the "raven" name collision.
4. CB Insights: create profile + request a free analyst briefing (their FAQ: briefings are 100% free). Also ask Datos Insights for a briefing (they publish a first-party-fraud market-solutions guide that names vendors).
5. CBANC Marketplace vendor listing (free per their 2022 launch terms; reconfirm).
6. fintechvendors.com (free, has an Account Origination/Onboarding category).
7. SourceForge vendor listing (free tier at sourceforge.net/software/vendors/): puts RAVEN on the auto-generated "alternatives to Truework / The Work Number" pages that rank. Covers slashdot.org twins too.
8. Gitnux (gitnux.org) and ZipDo (zipdo.co) applications: their programmatic "Top 10" pages hold 4-6 of the top 10 slots for "best bank verification software" and "best digital account opening software" and both have on-page vendor application CTAs. Treat as low-trust, pay nothing significant.
9. Set up Bing Webmaster Tools (import from GSC, free) and enable IndexNow if convenient. Then stop investing in Bing.

### Weeks 1-2: earned media (the de novo data is the asset)
1. Paul Davis, The Bank Slate: info@thebankslate.com, (336) 707-3947. Nobody has covered Glades Bank; offer the deep dive as an exclusive, then propose a standing arrangement: RAVEN flags new FDIC/state applications with market data attached, credited to reportraven.tech. He also runs Bank Slate Convos (podcast) and interviews seed-stage vendor founders.
2. Portrait Bank angle to the three reporters who already covered it: John Reosti (american banker, john.reosti@arizent.com), Caitlin Mullen (Banking Dive, tips at bankingdive.com/submit-tip), Steve Cocheo (The Financial Brand). Portrait won its charter June 29 and opens ~September; offer market math and first-year tracking.
3. Brian Bandell, South Florida Business Journal: the Glades local-exclusive angle. Orlando Business Journal (Richard Bilbao) for Portrait follow-ups. Business journals run data-driven List features; deposit-market-share rankings are their native format.
4. Op-ed lanes (free, high DR): American Banker BankThink (full draft under 1,000 words to BankThink@Arizent.com, exclusive, no promotion), Banking Dive opinion (bankingdive.com/opinion/submit-opinion, ~1,000 words, explicitly no AI-written copy), The Financial Brand contributor program (editor@thefinancialbrand.com, frame as growth strategy not compliance), Independent Banker (paste ~500 words into email to magazine@icba.org; they are currently featuring de novo content).
5. S&P Global Market Intelligence: Lauren Seay (lauren.seay@spglobal.com) mines FDIC applications herself; pitch Isaac as a quotable founder or tip filings she missed. Quotes, not links.
6. Kiah Haslett (now Fintech Takes Network): feed her citable de novo/call-report data angles via LinkedIn/X (@khaslett).

### Month 1: associations (paid but verified links + access)
1. South Carolina Bankers Association associate membership: $1,200/yr, application grants a live directory link (scbankers.org/associate-membership-directory has verified outbound links). Contact: carolynbradley@scbankers.org.
2. Community Bankers Association of Georgia: $1,300/yr, states "direct link to your site" in writing; free priority publishing of expert articles in CBA Today. Their CONNECT convention is Sept 24-27, 2026 (Asheville), Supporter tier $1,000.
3. Independent Banks of SC (ICBA state affiliate): call Teresa Taylor (ttaylor@myibsc.org, 803-537-0414); dues were ~$750 historically (unverified). They route "banker calling for a vendor reference" requests.
4. ICBA ThinkTECH Accelerator: apply at f6s.com/icba-thinktech-accelerator-2026/apply (rolling). Fraud mitigation is an explicit focus; includes 1:1 bank-exec meetings and ICBA LIVE demo day. ICBA invests via SAFE (~$75k per the Gust listing, unverified; confirm terms before signing anything).
5. Skip for now: ICBA corporate membership ($6,000 unless the unpublished early-stage rate is small; ask matt@icbabanks.org), NC/GA/FL bankers associations (add when pipeline exists; FL directory has no hyperlinks), TrustRadius (requires ~100 customers), FinXTech Connect (requires FI client roster; revisit at 2-3 logos).

### Ongoing (30 min/day + one pitch/week)
1. Journalist-request stack, all free: HARO relaunched free under Featured (helpareporter.com, 3x daily), Source of Sources (sourceofsources.com, highest dofollow rate ~36%), Qwoted free tier (2 pitches/mo; strongest finance platform, 70% of requests from DR 80+ outlets), MentionMatch (register under SaaS/fraud angles). Optional: Featured Lite $29/mo. Isaac's beats (account-opening fraud, de novos, FDIC data) have little source competition.
2. Podcasts: The Community Bank Podcast (SouthState, host Caleb Stevens, SC-based, exact ICP, has hosted Portrait's CEO and vendor founders; pitch a data topic via southstatecorrespondent.com or LinkedIn), Bank Slate Convos (Paul Davis), Bankadelic (Lou Carlozo, lou@qwoted.com, books fraud/identity vendors readily), Fintech One-on-One (Peter Renton, books early-stage founders). Skip pay-to-play shows (Banking Transformed, Breaking Banks) and competitor house shows (Abrigo, Q2).
3. LinkedIn: wrap De Novo Watch as a LinkedIn newsletter (LinkedIn is a top-3 most-cited domain in AI answers; cited posts need only modest engagement; authors posting 5+/month dominate citations). Keep the existing posting cadence.
4. Reddit: r/fintech tolerates deep data posts with disclosure; never launch-style posts. Perplexity over-indexes Reddit. Data posts only.
5. Newsletters: Jason Mikula (jason@fintechbusinessweekly.com) accepts substantive guest analyses; This Week in Fintech takes one-line news items.

### Quarter 2+ (bigger swings)
1. Show HN: an interactive de novo tracker with open methodology. Precedents: FDIC failed-bank viz (819 points), credit-union rate dashboard (393 points). Post the tool, not the company, and be in the comments.
2. Open-source the FDIC call-report plumbing (typed FFIEC/CDR client + cleaned quarterly parquet releases). The niche's best repo has 31 stars and died in 2022; Moov's ach parser (555 stars) shows the brand payoff. Every data article then links a verifiable methodology repo.
3. "State of Account Opening Fraud at Community Banks" survey report: landing page + takeaways post + wire release (Ncontracts got Morningstar/StreetInsider pickup with n=173). Doubles as the answer to the bank-COO fraud objection.
4. No de novo podcast exists anywhere; a short interview series with de novo organizers would have zero competition and doubles as pipeline (new banks need account-opening stacks).

## Content roadmap (empty SERPs to own, in order)

1. SHIPPED AS DRAFT: "The Work Number Alternatives for Community Banks" (blog). The alternatives SERP is directories + vendor posts; no bank-specific page exists.
2. SHIPPED AS DRAFT: "Best Digital Account Opening Software for Community Banks (2026)" (blog listicle, honest, RAVEN included with disclosure). Only competitor advertorials rank today.
3. "De novo bank technology stack (2026)": no complete neutral answer exists online. Expand the de-novo-bank-technology solutions page or write the pillar with a vendor table per layer (core, digital banking, account opening, verification, BSA/AML).
4. "KYC software for community banks" roundup: no third-party roundup exists at all.
5. "What does digital account opening software cost?": every vendor hides pricing; the SERP has no vendor answer. Needs real market pricing data; consider publishing RAVEN pricing (Truework/Truv/Argyle all expose /pricing and use it as a wedge against Equifax opacity).
6. Freshness cadence: touch each money page (solutions, top glossary terms, the two pillar glossary pages) with a REAL content update every 60-90 days; set `updated` in glossary-data and `updatedDate` on articles so dateModified is honest.
7. Later: scoped employer-VOE directory (a few hundred large Southeast employers), per-core account-opening implementation guides, YouTube explainers (top-cited domain in AI Overviews; even plain product walkthroughs create the surface).

## On-site changes shipped 2026-07-18 (this repo, uncommitted until reviewed)

1. llms.txt and llms-full.txt are now route handlers generated from glossary/solutions/integrations/published-article data (they previously listed 6 of 45 articles and no glossary/solutions/integrations). Static files removed. Includes Truv-style disambiguation block.
2. /about page: entity anchor for branded queries, founder bio, what RAVEN is/is not, AboutPage + Person JSON-LD.
3. /ai-info page, footer-linked: structured facts for AI assistants (Alloy pattern).
4. /de-novo-watch tracker page: v1 table of tracked de novo activity from the published deep dives, ungated, with methodology note. The linkable-asset seed.
5. E-E-A-T: visible "By Isaac Welch" bylines on articles, Article JSON-LD author is now a Person with sameAs (LinkedIn, GitHub), founder added to Organization schema, updatedDate plumbing for honest dateModified.
6. Sitemap: added /about, /ai-info, /de-novo-watch.
7. Two draft articles (work-number alternatives, best DAO for community banks) exist in code but are OUT of the sitemap and blog index pending review. To publish: add slugs to articles-index.ts and blog/published.ts.

## Measurement

- Weekly: GSC impressions/position on the non-branded clusters (first-party fraud, VOE, digital account opening, de novo). Watch whether glossary positions move from 40-90 toward 10-30.
- Monthly: ask ChatGPT/Claude/Perplexity the 6 money questions ("best digital account opening software for community banks" etc.) and record whether RAVEN is mentioned and which sources are cited. That list of cited sources is the next outreach list.
- Directory referrals and demo-call sources ("how did you hear about us").
- Semrush MCP needs re-auth for authority/keyword tracking (run /mcp in Claude Code).
