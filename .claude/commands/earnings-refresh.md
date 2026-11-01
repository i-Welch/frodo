---
description: Add each covered bank's newest quarterly results to its article, ROI model and audit, then ship it as an auto-publish PR
argument-hint: "[auto]"
---

# /earnings-refresh

Bank deep dives and audits go stale every quarter. Search engines and AI answers favor pages with the latest numbers, so after each earnings release the covered bank's pages should carry it. Run weekly; most weeks outside earnings season will find nothing.

Arguments: `$ARGUMENTS`. Empty or `auto`: unattended run, no questions; record every decision in the PR body.

## 1. Find new releases

Covered banks are the ROI models in `dashboard/src/app/(marketing)/roi/roi-data.ts` that have an `articleSlug` (and are in `BLOG_SLUGS` in `(marketing)/blog/published.ts`), plus the audits in `(whitelabel)/_config/bank-audits.json`. For each one, find its holding company's most recent quarterly earnings release (SEC EDGAR 8-K exhibit 99.1, the company's investor relations site, or PR Newswire / GlobeNewswire). Only use a release you actually read; secondary write-ups are not sources. Skip credit unions (they don't publish earnings releases) and private banks with no release.

A release is **new** when its quarter is later than the newest quarter the article already cites (check the article's `*Q… update:*` note and its body). Ignore anything older.

## 2. Update, for each new release

- **Article** (`(marketing)/blog/[slug]/page.tsx`): directly under the existing `*Updated …*` note (after any `# Title` and `*Published…*` lines, never before them), add or replace one italic paragraph:
  `*Q<n> <year> update: <Bank> reported <quarter> net income of $X million, or $Y per diluted share, on <release date>. <Two or three more figures from the release: total assets, loans/deposits growth, net interest margin, ROA, nonperforming assets>. (company release).*`
  Keep only the newest quarter's update paragraph (replace an older one). Then set `updatedDate` to today ("Month D, YYYY"), make the `*Updated …*` note's date today and mention the added quarter, and set `BLOG_UPDATED[slug]` in `published.ts` to today's ISO date. Don't rewrite the body; if a release contradicts a body claim outright (a sale, a closed branch, a new CEO), fix that sentence and say so in the note.
- **ROI model** (`roi-data.ts`): update the `Total assets` stat value to the release's figure with its quarter, e.g. `'$4.88B (Q3 2026)'`.
- **Audit** (`bank-audits.json`): update the total-assets stat and any `$X.XB` asset mentions in that audit's text to match (rounded the same way it already uses).
- **Tech stack** (`(marketing)/bank-tech-stack/stack-data.ts`, if present): update that row's `assets` the same way.

Use only figures printed in the release. No em dashes. Numbers keep the article's existing style.

## 3. Verify and ship

From `dashboard/`: `bun run typecheck`, `bun run lint`, and `LEAD_ENRICHMENT=off bunx vitest run test/content` pass. Start the dev server on `$ARTICLE_DEV_PORT` (default 3000) and confirm each changed `/blog/<slug>` returns 200 with one `<h1>`.

If nothing was new, stop without a PR and report "no new releases". Otherwise branch `earnings/<YYYY-MM-DD>` from an up-to-date `master`, commit (`Add latest quarterly results (<YYYY-MM-DD>)`, body listing each bank, quarter and release URL), push, and `gh pr create` titled `Earnings refresh: <YYYY-MM-DD>` with the same list. **Auto mode only:** `gh pr edit <n> --add-label auto-publish`. Report the PR URL.
