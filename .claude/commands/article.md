---
description: Research, write, and ship one RAVEN blog article (plus companions and a LinkedIn post) in the house style
argument-hint: "[auto | type number or name] [subject]"
---

# /article

Write one article for reportraven.tech/blog in the established RAVEN house style, wire it into the site, draft its LinkedIn post, verify it builds, and ship it as a pull request.

Arguments: `$ARGUMENTS`

- Empty or `auto`: unattended run. Pick the type from the weekly rotation (below), pick the subject yourself, and do not ask questions. Make every decision and record it in the PR body.
- A type number or name (e.g. `6`, `credit union`), optionally followed by a subject (e.g. `2 Security Federal Bank`): write that.
- When a human is present and the subject is ambiguous, propose a subject with one line of reasoning before researching.

The existing articles in `dashboard/src/app/(marketing)/blog/[slug]/page.tsx` are the style reference. Before writing, read at least two published articles of the same type in full (find them via `articles-index.ts` category and the slug list in `published.ts`). Match them. When this file and the existing articles disagree, the articles published since July 2026 win.

## Article types

| # | Type | Category | Companions | Reference articles |
|---|---|---|---|---|
| 1 | Institutional research drop: an original data finding about the industry | `bank` (or `fintech` for fintech-side data) | LinkedIn | `one-in-116-mortgage-fraud`, `south-carolina-de-novo-drought`, `foreclosure-wave-hiding-in-plain-sight`, `59-billion-compliance-burden` |
| 2 | Bank deep dive: one community bank, usually off a fresh earnings release or call report | `bank` | ROI audit, audit record, white-label demo, LinkedIn | `optimumbank-98-percent-cre-growth`, `southern-bank-spartanburg-side-door`, `arthur-state-bank-upstate-bet`, `oconee-federal-quiet-comeback` |
| 3 | Fintech vs. community bank comparison: how a named fintech does one job, step by step, against the bank version | `fintech` | LinkedIn | `affirm-vs-community-bank-personal-loans`, `rocket-mortgage-22-days-how`, `how-figure-closes-heloc-in-5-days`, `income-verification-fintech-vs-bank` |
| 4 | Neobank launch / growth deep dive: a neobank, fintech charter, or bank launch and what it means for community banks | `fintech` | LinkedIn | `chime-account-opening-deposit-war`, `what-neobanks-get-right-community-banks` |
| 5 | Macro news commentary: a market or economic event translated into community bank consequences | `bank` | LinkedIn | `trillion-dollar-ipo-wave-2026`, `huntington-bank-southeast-expansion`, `first-reliance-sells-at-the-top` |
| 6 | Credit union deep dive: one credit union, from its NCUA 5300 call report | `creditunion` | ROI audit, audit record, white-label demo, LinkedIn | `robins-financial-20-million-rebate`, `founders-credit-union-mill-town`, `champions-first-fsu-rebrand` |
| 7 | State of the market: a periodic read on community banking (quarterly FDIC QBP, lending share, deposit flows) | `bank` | LinkedIn | `community-banks-are-losing-the-lending-race`, `community-banks-lose-loans-fintechs` |
| 8 | De Novo Watch: a newly chartered or proposed bank | `denovo` | LinkedIn, de novo data row | `portrait-bank-winter-park-de-novo`, `glades-bank-broward-de-novo` |

Types 1 and 6 match numbers used in earlier commit messages; the others were renumbered when this command was rebuilt.

### Weekly rotation (auto mode)

Runs happen Tuesday, Wednesday, Thursday.

- **Tuesday:** an institution deep dive. Alternate between type 2 (bank) and type 6 (credit union) based on whichever was published less recently. Use type 8 instead when a Southeast de novo has a fresh charter or FDIC approval, or when `marketing/topic-ideas.md` has an unchecked type 8 topic (take the oldest). De novo coverage is the site's strongest search traffic (the tracker and the Glades deep dive led search landings in Sept-Oct 2026), so it wins ties.
- **Wednesday:** type 3 or 4, whichever was published less recently. **Search-gap override:** if `marketing/topic-ideas.md` has an unchecked topic (written by the monthly `/visibility-check`), write the oldest one instead, whatever its type, aiming the title, description and first section at its target query. Check it off in that file (`- [x]`, add `published <slug>`) in the same PR. Any article whose subject matches an unchecked topic in that file (for example a Tuesday type 8 on a bank `/de-novo-update` queued) checks it off the same way.
- **Thursday:** type 5 or 7. Use type 7 when a quarterly dataset dropped in the past three weeks (FDIC Quarterly Banking Profile, NCUA quarterly data); otherwise type 5. Use type 1 when research turned up a strong original finding.

Work out what ran recently from `marketing/article-log.md`, falling back to `published.ts` and `git log`. A breaking event (big earnings surprise, merger announcement, regulatory action against a covered institution) overrides the rotation. Say so in the PR.

### Picking a subject

- Geography: the Southeast footprint first (SC, NC, GA, FL, then TN, VA, AL), since that is where the existing series lives and where RAVEN sells. Credit unions and banks between roughly $150M and $5B in assets. Type 3/4/5/7 subjects are national.
- Never repeat an institution already covered. Check the slugs and names in `articles-index.ts`, `ROI_BANKS` in `roi-data.ts`, and `bank-audits.json`.
- Look for an angle with a number in it: something surprising in the call report, an earnings release, a merger, a branch move, a leadership change, an enforcement action. The headline is the finding, not the institution (e.g. "The 98.7% Bank", "The Credit Union That Can't Spend Its Money Fast Enough").
- Timeliness wins. A deep dive published the week of an earnings release beats one on a stale quarter.

## Data sources

Every number in the article must come from a primary or authoritative source you actually fetched in this run. Never write a figure from memory. If you cannot source a number, cut the sentence. Keep a running source list as you research; it goes into the PR body and, for deep dives, the `sources` strings.

**Banks (types 2, 8, and bank data in 1/5/7):**
- FDIC BankFind Suite API (`https://banks.data.fdic.gov/api/`): `institutions` (cert, name, city, assets, charter, established date), `financials` (call report: assets, loans, deposits, ROA, ROE, NIM, efficiency, loan segments, noninterest-bearing deposits, allowance), `sod` (Summary of Deposits branch deposits and county market share), `history` (mergers, charter changes, name changes). Filter by `CERT:<n>`. Fields are the call report variable names (e.g. `ASSET`, `DEP`, `LNLSNET`, `ROA`, `NIMY`, `EEFFR`).
- SEC EDGAR for public holding companies: 8-K Exhibit 99.1 earnings releases, 10-Q/10-K. Note the CIK.
- FFIEC/CFPB HMDA Data Browser API (`https://ffiec.cfpb.gov/v2/data-browser-api/`) for mortgage origination counts and dollars by LEI and year (actions_taken=1). Cite LEI and year.
- OCC/FDIC applications and press releases, the bank's own press releases and investor relations pages, CRA public files.
- Census (ACS, population estimates) for county population and household figures.

**Credit unions (type 6):**
- NCUA 5300 call report data: NCUA's Credit Union Locator / quarterly call report data, and the profile pages on ncuso.org. Use the charter number.
- IRS Form 990 on ProPublica Nonprofit Explorer for state-chartered credit unions (executive comp, rebates, mission).
- HMDA as above. Field of membership from the credit union's own site or charter documents.

**Fintechs and neobanks (types 3, 4):**
- S-1, 10-K, 10-Q, earnings releases and shareholder letters (EDGAR).
- CFPB enforcement actions and the CFPB Consumer Complaint Database; state regulator consent orders.
- OCC charter applications and conditional approvals, FDIC deposit insurance applications.
- The company's own product pages, help center, and disclosures for how the flow actually works (walk through it step by step, as the Chime and Affirm pieces do).
- Third-party research with named methodology: J.D. Power, Cornerstone Advisors, MBA, Federal Reserve surveys, ICBA.

**Macro and market (types 1, 5, 7):**
- FDIC Quarterly Banking Profile, Federal Reserve (H.8, FRED, SLOOS), NCUA quarterly data, MBA, CFPB research, Cotality/CoreLogic, ATTOM, BLS, Census.
- Reputable reporting (Reuters, AP, Bloomberg, WSJ, American Banker, S&P Global Market Intelligence) for events, quoting the underlying filing or release whenever one exists.

Prefer the filing over the article about the filing. When two sources disagree, use the primary one and mention the discrepancy only if it matters to the story. Date your observations ("as of June 30, 2026", "fingerprinted October 2026").

## Writing the article

### Voice

Reported, data-dense business journalism. A smart community bank CEO is the reader. Short declarative sentences. Punchy fragments for emphasis ("First-quarter net income: $21.9 million. In three months."). Concrete numbers everywhere, with units and dates. Fair-minded: include the caveats that cut against your thesis ("Two caveats, in fairness."). Explain regulatory mechanics plainly when they matter (e.g. the 300% CRE concentration test). Compare against other institutions in the series and link to their articles. No hype words, no "in today's fast-paced landscape", no rhetorical questions as section openers, no listicle tone in deep dives.

**Never use em dashes (—) or en dashes as punctuation.** Use commas, colons, periods, or parentheses. (Ranges like "2017-2025" use a hyphen.)

### Structure

- Body begins with `# <Title>`, a blank line, then `*Published <Month D, YYYY>*`, a blank line, then the hook. (The page strips these two lines and renders its own title and byline, but every article includes them.)
- Hook: one to three short paragraphs that land the central number or tension immediately. Some deep dives open with an `##` heading first (Robins); most open straight into prose.
- Five `##` sections (minimum two, or the mid-article demo CTA will not render). Section titles are short and specific ("Where the $432 Million Went", "The Membership Math"). Title Case for institution deep dives; sentence case is fine for research and macro pieces.
- Length: deep dives and research pieces 1,100-1,450 words; comparisons and macro 1,000-1,450; never under 900.
- One or two `:::stat` blocks and two `:::pullquote` blocks per article:

```
:::stat
**$151 million**
One or two sentences explaining the number and why it matters.
:::

:::pullquote
A sentence from the article, usually verbatim, that carries the argument.
:::
```

- Each block sits in its own paragraph with blank lines around it. The stat headline is the first bold run.
- Internal links: link prior RAVEN articles where a comparison is natural, as `[Founders'](/blog/founders-credit-union-mill-town)`. Aim for one to six. Link glossary terms (`/glossary/<slug>`) where one exists. Only link slugs that exist.
- Data pages: the first time an article names an FDIC-insured bank, link its peer snapshot, `/bank-snapshot/<cert>-<name-slug>`: the FDIC cert you already looked up, then the FDIC institution name lowercased with `&` as `and` and every other run of non-alphanumerics as one hyphen (e.g. `/bank-snapshot/2102-the-conway-national-bank`; `bankSlug` in `bank-snapshot/peer-data.ts`). Fetch it on the dev server and expect 200, not a redirect. When an article compares a state's banks, link `/bank-rankings/<state-name-slug>` once (e.g. `/bank-rankings/south-carolina`). These count toward the one-to-six links. Credit unions have no snapshot page.
- Final section turns to the community bank takeaway. In deep dives (types 2, 6, 8) and research/macro pieces, describe the fix generically (verification-first intake, source-verified borrower data, minutes instead of weeks, audit trail) and **do not name RAVEN**. Types 3, 4, and 7 may name RAVEN once, briefly, near the end, only if the reference articles of that type do.
- End on a one-line kicker that turns the central number or tension ("OptimumBank has four quarters to show it never had to pick.").
- No CTA, no "request early access", no author bio. The template adds CTAs, the ROI callout, related reading, and JSON-LD.

### Markdown limits (`convertMarkdown`)

Supported: `#`/`##`/`###`, `**bold**`, `*italic*`, `[text](url)`, `- ` lists, `1. ` lists, `---`, `:::stat`, `:::pullquote`. **No tables, no images, no HTML.** The content is a JS template literal: escape backticks and `${`. Avoid stray asterisks (they become italics) and `)` inside link URLs. Use straight quotes in content; curly apostrophes are fine in descriptions.

### Metadata

- `slug`: lowercase, hyphenated, 3-6 words built around the hook (`robins-financial-20-million-rebate`, `optimumbank-98-percent-cre-growth`).
- `title`: the hook, not the institution's name alone. Under 70 characters.
- `description`: 200-280 characters, packed with the article's best numbers, written as a standalone teaser.
- `readTime`: `'6 min read'` for 1,100-1,500 words; `'5 min read'` under 1,100; `'7 min read'` over 1,500.
- `publishedDate`: the date the article goes live. In auto mode that is **tomorrow** (the PR auto-merges about 24 hours after it opens). Otherwise today, unless told differently.

## Wiring it into the site

Paths are under `dashboard/src/app/`. Keep title, description, and dates identical across files.

**Every article:**
1. `(marketing)/blog/[slug]/page.tsx`: add the entry at the **top** of `const articles` (`title`, `description`, `publishedDate`, `readTime`, `content`). Never touch the `SEO DRAFTS` block.
2. `(marketing)/blog/articles-index.ts`: add at the **top** of `articles`: `slug`, `title`, `description`, `readTime`, `date` (`'October 2026'`, month and year only), `category`, and `auditSlug` for deep dives. Never set `featured`.
3. `(marketing)/blog/published.ts`: add the slug at the top of `BLOG_SLUGS` under a dated group comment matching the existing ones (e.g. `// — Credit Union Deep Dives (Oct 2026) —`); create the group comment at the top if it does not exist. Add `'<slug>': 'YYYY-MM-DD'` at the top of `BLOG_DATES`, matching `publishedDate`.
4. Do **not** edit `sitemap.ts`, `llms-content.ts`, or llms routes (generated from the above). Do not use `dashboard/scripts/seo-publish.ts` (stale).
5. If you link a glossary term, add the article slug to that term's `relatedArticles` in `(marketing)/glossary/glossary-data.ts`.

**Institution deep dives (types 2 and 6), all keyed by the same `<inst-slug>`:**

6. `(marketing)/roi/roi-data.ts` → `ROI_BANKS`: a `BankRoiInput` entry. Banks go at the top of the array; credit unions at the head of the credit union block. `articleSlug` must equal the article slug (that is what attaches the ROI callout to the article). Required: `slug`, `name`, `shortName`, `articleSlug`, `articleTitle`, `fdicCert` (FDIC cert for banks; for credit unions, the NCUA charter number with a code comment saying so), `auditDate`, four `stats`, `volumes` (mortgage/commercial/consumer, each `{ count, source, estimated }`), `market.newHouseholdsPerYear` with `source`, `intro`, three `strategic` items, `sources`.
   - Real, with `estimated: false`: the mortgage count from HMDA (cite LEI and year). Stats from the call report or filings.
   - Modeled, with `estimated: true` and the derivation written in `source`: commercial and consumer counts (e.g. segment growth ÷ average note size; about 4.8% of members per year for CU consumer loans), households (Census county data and the SOD footprint for banks; field of membership ÷ ~2.5 people per household for CUs).
   - Never change the shared ROI constants at the top of the file.
7. `(whitelabel)/_config/bank-audits.json`: an `AuditContent` record (`slug`, `bankName`, `shortName`, `auditDate`, `demoSlug` = slug, four `stats`, `summary`, 5-7 `currentJourney` items with `status` `ok|weak|missing`, 4 `findings` with `severity` `gap|friction|note`, 5 `comparison` rows `{dimension, today, withRaven}`, `sources`). Banks at the top; credit unions after the last credit union. Build `currentJourney` by actually fingerprinting the institution's website (online banking vendor, loan application domains and flow, account opening path) and date the observation.
8. `(whitelabel)/_config/<inst-slug>.ts`: a `WhiteLabelConfig` modeled on the closest existing config (`robins-financial-credit-union.ts` for CUs, `optimumbank.ts` for commercial-first banks). Start with a JSDoc saying where the brand colors came from (the institution's site CSS or logo). Products should reflect what the institution actually offers. Credit unions use share draft/certificate language. `coreSync: { system: 'unknown', displayName: 'Core system not publicly disclosed', mode: 'mock' }` unless the core is public.
9. `(whitelabel)/_config/registry.ts`: import the config and add it to `WL_CONFIGS` beside similar institutions.

`/audit/<inst-slug>` 404s unless items 6-9 all exist. Check it renders.

**De Novo Watch (type 8):** end the article with an italic line linking [De Novo Watch](/de-novo-watch) and the [day-one stack page](/solutions/de-novo-bank-technology) (see the Glades article). Also set `articleSlug` on the matching row in `(marketing)/de-novo-watch/de-novo-data.ts`, adding a row if needed, and check whether `de-novo-watch/page.tsx` hardcodes a link list that needs the new article.

## LinkedIn post

Write `marketing/linkedin/queue/<slug>.md`:

```
---
slug: <slug>
title: <article title>
description: <article description>
url: https://reportraven.tech/blog/<slug>
---
<post text>
```

Post text, for the RAVEN company page, modeled on the variants in `marketing/linkedin-posts.md`:
- 150-220 words. Opens with the data hook (the article's sharpest number) in the first line, since only about two lines show before "see more".
- Short paragraphs of one or two sentences. Three to five concrete findings from the article. No em dashes. No emoji. No link in the body (the link preview card is attached automatically).
- Ends with one question to community bankers, then a blank line and exactly five hashtags (e.g. `#CommunityBanking #CreditUnions #BankingInnovation #Fintech #Lending`), chosen to fit the type.
- Must not claim anything the article does not support.

**Follow-up post.** Also write `marketing/linkedin/queue/<slug>-followup.md`, posted automatically a week later to bring the article back into the feed. Same front matter, except `slug: <slug>-followup` and an added line `notBefore: <publish date + 7 days, YYYY-MM-DD>`. Same rules as above, but 100-160 words built around a *different* finding from the launch post (a number, comparison or implication the launch post did not use), opening with that finding. Do not refer to the earlier post or say "last week".

## Verify

From `dashboard/`:
1. `bun run typecheck` and `bun run lint` must pass.
2. Use port `$ARTICLE_DEV_PORT` if that environment variable is set, otherwise 3000. Start the dev server on it if one is not already running from this checkout (`bun run dev -- -p <port>`, in the background), then fetch `http://localhost:<port>/blog/<slug>`, the blog index, and (for deep dives) `http://localhost:<port>/audit/<inst-slug>`. Each must return 200 and the article must show its stat and pullquote blocks.
3. Re-read the article once as an editor: every number traced to a source in your list, no em dashes (`grep -c "—"` on your additions must be 0), word count in range, title/description/dates consistent across all files, internal links point at real slugs.

Fix anything that fails. Do not ship a failing article.

## Ship

1. Append a row to `marketing/article-log.md` (create it with a header row if missing): `| <publish date> | <type #> <type name> | <slug> | <subject> |`.
2. Work on a branch named `article/<slug>` created from an up-to-date `master`. Commit everything (article, companions, both LinkedIn queue files, log). Commit message style:
   - Subject: `Add <Subject> deep dive, ROI audit, and white-label demo` for types 2/6; `Add <short title> analysis` or `Publish <short title> article` otherwise.
   - Body: `Type <n> <type name> on <subject> (<City>, <ST>): ` then what was added, the headline numbers, and the data sources (e.g. "NCUA charter 68670, real 2024 HMDA origination counts"). Note firsts ("First Georgia credit union in the series.").
3. Push and open a PR against `master` with `gh pr create`. Title: `Article: <title>`. Body: the type and why this subject, the description, word count, the full source list (URL per source), anything estimated, and both LinkedIn post texts.
4. **Auto mode only:** add the `auto-publish` label (`gh pr edit <n> --add-label auto-publish`). The auto-publisher merges labeled PRs about 24 hours after they open if CI is green and nobody closed the PR or removed the label, then posts the LinkedIn queue file to the company page once the article URL is live. When a human is present, leave the label off unless asked.
5. Report the PR URL, the slug, and one line on the angle.
