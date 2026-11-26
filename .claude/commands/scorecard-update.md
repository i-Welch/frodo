---
description: Re-verify the Product Scorecards weekly; every second week add a product type or institutions and write the article; ship as an auto-publish PR
argument-hint: "[auto | verify | expand [product]]"
---

# /scorecard-update

Keep `reportraven.tech/scorecards` current and growing. The scorecards answer "where is the best savings account / HELOC / ..." for readers in SC, NC, GA and FL, scoring fintechs, the big five banks and local banks and credit unions. They are only worth citing because every number is dated and sourced: a stale or guessed number is worse than a missing one.

Arguments: `$ARGUMENTS`.
- Empty or `auto`: unattended run, no questions. Always do the weekly re-verification (step 1). Then do an expansion (step 2) if the last expansion in `marketing/scorecard-log.md` was 13 or more days ago (or the log has none). Record every decision in the PR body.
- `verify`: step 1 only.
- `expand [product]`: steps 1 and 2, expanding the named product type (e.g. `expand checking`) or the next one on the roadmap.

Design and decisions: `docs/superpowers/specs/2026-11-26-product-scorecards-design.md`. Read it first.

Code lives in `dashboard/src/app/(marketing)/scorecards/`:
- `institutions.ts`: one row per institution (kind, insurance, support, branches per state with source and date).
- `<product>-data.ts` (e.g. `savings-data.ts`): one row per institution per product, with `facts`, `sources`, `notes` and `asOf`.
- `<product>.ts` (e.g. `savings.ts`): the product type: criteria with their scoring rubrics, the facts shown per row, the method text.
- `weights.ts`: criterion weights per product. **Never put weights in page copy, FAQs, articles or LinkedIn posts.** Pages say what each criterion measures, never how much it counts.
- `products.ts`: the registry of live product types and the `COMING_NEXT` list.

## Rules for every number

- Read it on the institution's own pages today (product page, rates page, fee schedule, truth-in-savings or account agreement PDF, help center). Aggregators (Bankrate, NerdWallet, DepositAccounts) may point you at a page but are never the source.
- Record each page in `sources` as `{ url, what }`, and set the row's `asOf` to today only when you re-confirmed its facts. If a page could not be read, keep the old facts and old `asOf`, and add a note saying what failed. Never move `asOf` forward on facts you did not see.
- Unverifiable means `null` and a note, never an estimate. A row whose rate is `null` is shown as "not ranked", which is correct.
- Bank branch counts come from the FDIC locations API (`https://api.fdic.gov/banks/locations?filters=CERT:<cert> AND STALP:<ST>&limit=1`, read `meta.total`); credit union counts from the credit union's own branch locator (NCUA's locator as a fallback, noted). Update `branchesAsOf` when you recount.
- Rates are what a $10,000 balance earns; blend tiers (e.g. 5.00% on the first $2,000 and 0.01% above is 1.01% at $10,000) and say so in `apyNote`. A quarterly fee is divided by three into `monthlyFee`; a quarterly withdrawal allowance is divided by three into `withdrawalsPerMonth`.
- No em dashes anywhere. Plain, factual notes.
- Never frame a local bank as a loser. Low scores are shown, not editorialized.

## 1. Weekly re-verification

For every row of every live product type, re-check the facts that drive scores (rate, conditional rate and its condition, fees and waivers, withdrawal limits, transfer features) against the row's sources, update anything that changed, set `asOf`, and bump the product's `<PRODUCT>_UPDATED` date. Use parallel subagents when there are many rows (one per group: national, big five, each state), each told these rules and the exact fields to return. Recount branches monthly (first run of the month).

Rows with `null` rates: try again. Capital One's rate is rendered client-side; try its rates API or disclosure PDF.

Note in the PR body every rate that moved by 0.25 points or more, and every rank change in the top five of any view (compare `rankedRows` before and after; a scratch `bun` script printing both is the easy way).

## 2. Expansion (every second week)

Do one of these, in this order of preference:

**a. A new product type**, the next on the roadmap in `products.ts` `COMING_NEXT` (checking, then HELOC, CDs, money market, personal loans, auto loans), when the current types are at least 10 local institutions per state. Building one means:
1. Define the facts type in `types.ts` (follow `SavingsFacts`: every field nullable where it can be unpublished) and the criteria in a new `<product>.ts`. Keep the five-criterion shape where it fits (rate or cost, fees, product flexibility, in-person access via the shared `accessScore`, protections and features), adapted to the product: for a HELOC, cost is the APR (lower is better) and intro-rate terms, plus fees (origination, annual, early closure), draw period, max CLTV and time to close. Many HELOC rates are quoted per applicant: record the published "as low as" APR with its conditions and note it.
2. Add its weights to `weights.ts` (summing to 1) and register it in `PRODUCT_TYPES`; remove it from `COMING_NEXT`.
3. Research the same institutions as the existing scorecards first (same 15 national rows where they offer the product, the same local institutions), then fill gaps. Write `<product>-data.ts`.
4. Unit-test the rubric in `dashboard/test/content/scorecards.test.ts` (the product-level tests run automatically for every registered type).

**b. More institutions** for an existing type: add local banks and credit unions until each state has 10 to 15, largest by assets first (FDIC API for banks under $25B headquartered in the state; NCUA data for credit unions, preferring open membership). Skip institutions that publish no rate and list them in the PR body. Also add notable national products readers ask about (e.g. a new fintech savings account) when they launch.

**Article.** Each expansion ships with one article, written as `/article` type 9 (product scorecard), following `.claude/commands/article.md` for style, wiring, companions and the LinkedIn post. A new product type gets "Where to Get the Best <Product> in the Southeast (<Month YYYY>)" or a state-specific version for the state with the most interesting gap; an institutions expansion gets a state article ("The Best Savings Accounts in Georgia, Ranked (<Month YYYY>)") or a finding article when the data shows one (e.g. the gap between the big five and online banks). Link the scorecard near the top. No weights.

## 3. Log, verify and ship

Append a row to `marketing/scorecard-log.md` (create it with the header `| Date | Run | Product | Change |` if missing): run is `verify` or `expand`, change in one line (rows re-verified, rates moved, institutions or product added, article slug).

From `dashboard/`: `bun run typecheck`, `bun run lint` and `bunx vitest run test/content` pass. Start the dev server on `$ARTICLE_DEV_PORT` (default 3000) and confirm `/scorecards`, every `/scorecards/<product>` and `/scorecards/<product>/<state>` page and `/scorecards/<product>/data.csv` return 200.

Branch `scorecards/<YYYY-MM-DD>` from an up-to-date `master`, commit (`Update Product Scorecards (<YYYY-MM-DD>)`, or `Product Scorecards: add <product>` for a new type), push, and `gh pr create` titled `Product Scorecards update: <YYYY-MM-DD>` with the change list, rate moves, rank changes, skipped institutions and any facts that could not be re-verified. **Auto mode only:** `gh pr edit <n> --add-label auto-publish`. Report the PR URL and a one-line summary.

A LinkedIn post is written only for an expansion (the article's post, per `/article`). Re-verification alone gets no post.
