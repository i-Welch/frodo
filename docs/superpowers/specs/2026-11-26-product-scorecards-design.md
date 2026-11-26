# Product Scorecards

Date: 2026-11-26 · Status: approved in conversation ("ship it")

## Intent and the why

Isaac wants to research, document and publish head-to-head comparisons of consumer financial products across institutions: fintechs and neobanks (X Money, Robinhood, Chime, SoFi ...), the big five banks, and Southeast community banks and credit unions. Each product type gets a scorecard with per-criterion scores, an overall score and a rank, so the site can answer "where is the best savings account" or "where can I get the best HELOC". The data is a standing dataset (like De Novo Watch) as well as published pages and articles. A recurring worker keeps it current, adds product types and institutions, and writes the articles.

## Goals

1. One public scorecard per product type at `/scorecards/<product>`, filterable by Southeast state, plus a page per state (`/scorecards/<product>/<state>`) for SC, NC, GA and FL that can rank in search.
2. Every row is dated and sourced. Unverifiable facts read "not published", never a guess.
3. Per-criterion scores (0-10) and an overall score from weights, ranked.
4. A CSV export per product, free to cite with attribution, like the other trackers.
5. A weekly worker (`/scorecard-update`) that re-verifies rows, and every second week adds a product type or institutions and writes an article. Ships through auto-publish PRs and the LinkedIn queue.

## Non-goals

- No affiliate links, paid placement or sponsored rows.
- No reader-adjustable weighting (approach B, not chosen).
- No national coverage of local banks: local means SC, NC, GA, FL community banks and credit unions.
- No live rate scraping service or database. Rates are verified by the worker and committed.

## Anti-goals

- A number on the page that the worker could not trace to a source it read.
- Framing a local bank as a loser (house style). Pages describe leaders and what each product is best for; low scores are shown, not editorialized.
- Weights appearing on pages or in articles (Isaac's call: weights live in the repo, but are not published in content).

## Decisions

| Decision | Choice | Who |
|---|---|---|
| Who is scored | National fintechs/neobanks, big five (Chase, Bank of America, Wells Fargo, Citi, U.S. Bank), SC/NC/GA/FL community banks and credit unions | Isaac |
| State pages | National page filterable by state, plus a page per state | Isaac |
| Scores | Per-criterion scores plus a weighted overall score | Isaac |
| Weights | In the repo (`scorecards/weights.ts`), not in pages or articles | Isaac |
| Reader | Anyone asking "where is the best X", in RAVEN's concrete, sourced voice; articles add the bank-leader angle | Claude |
| Product order | Savings, checking, HELOC, then CDs, money market, personal loans, auto loans | Claude |
| In-person access | The only criterion scored per state (branches in that state); others are the same everywhere | Claude |
| Launch coverage | Savings: ~10 national fintechs/online banks, the big five, ~6 local institutions per state; the worker grows it toward 10-15 per state | Claude |
| Worker cadence | Weekly re-verify (Sunday, audits clone); every second week expand and write an article | Claude |

## Approaches

| | Approach | Trade-off |
|---|---|---|
| **A (chosen)** | Repo data files + static pages + scheduled Claude worker, the De Novo Watch / Bank Tech Stack pattern | Matches everything the site already runs; every change is a reviewable PR; scaling is bounded by worker time |
| B | Database (Neon) + automated rate scrapers | Fresher numbers, but bank rate pages vary too much to scrape reliably, and it bypasses the PR review that keeps rows sourced |
| C | Hybrid scrapers for machine-readable sources + worker | More moving parts than the launch needs; can be added later per source |

There is one sensible way for launch (A): the site's other research products already work this way and the worker pattern is proven.

## Shape

- `dashboard/src/app/(marketing)/scorecards/`
  - `types.ts`: institutions, product rows, criteria.
  - `institutions.ts`: institution facts shared across products (type, insurance, HQ, branches per Southeast state with source and date, support hours).
  - `products/<type>.ts`: product rows (facts, sources, `asOf`) and the product type's criteria with scoring rubrics.
  - `weights.ts`: criterion weights per product type.
  - `scoring.ts`: per-criterion scores, overall score, ranking for a state or nationally.
  - Pages: `/scorecards`, `/scorecards/[product]`, `/scorecards/[product]/[state]`, `/scorecards/[product]/data.csv`.
- Sitemap, nav, llms content updated. Content tests guard dates, sources, ranges, weights and em dashes.
- `.claude/commands/scorecard-update.md` and a Sunday task in `register-tasks.ps1`. `/article` gains type 9 (product scorecard) so articles share the house style and wiring.

## Left to the builder

Exact rubric thresholds, page layout within the existing `snapshotStyles` look, and which local institutions make the launch set (largest by assets that publish a savings rate online).
