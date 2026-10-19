---
description: Refresh one held-back article against current data and release it (or retire it), shipped as an auto-publish PR
argument-hint: "[auto] [slug]"
---

# /release-draft

`dashboard/src/app/(marketing)/blog/published.ts` holds finished articles commented out of `BLOG_SLUGS` (a phased rollout from summer 2026 that stalled). They render at their URLs but are missing from the blog index, sitemap, RSS and llms.txt. Release them one at a time, each re-verified first: they were written months ago and a stale number or an outdated claim costs more credibility than the article earns.

Arguments: `$ARGUMENTS`. Empty or `auto`: unattended, no questions; record every decision in the PR body. A slug picks that article instead of the next one.

Read `.claude/commands/article.md` first: its voice, data source, markdown, wiring, LinkedIn and verify rules all apply here.

## 1. Pick the article

Take the first commented-out slug in `BLOG_SLUGS`, in file order, skipping any marked `retired`. Evergreen guides (AI lending, white-label portal, digital account opening, open banking, Jack Henry, Fiserv, Chime) age best. Bank deep dives need the most refreshing. The two `SEO drafts` at the end were never reviewed: give them a full editorial pass, not just a fact check.

## 2. Check it is still true

Read the article's `content` in `blog/[slug]/page.tsx` and list every dated claim, number and forward-looking statement. Then:

- **Overtaken by events?** Check `articles-index.ts` for a published article on the same institution (for example `first-reliance-sells-at-the-top` vs `first-reliance-outgrew-florence`) and search for news since the article's date: mergers, sales, failures, leadership changes, enforcement actions. If the article's thesis no longer holds and a refresh would mean a new article, **retire it**: change its comment to `// retired <YYYY-MM-DD>: <reason> — '<slug>'`, leave the page entry alone, and ship only that change (step 5, no LinkedIn files). Then stop.
- **Refresh the numbers.** Re-pull each figure from its primary source (FDIC BankFind `financials` for the latest call report quarter, NCUA 5300, HMDA, SEC filings, vendor documentation for the platform guides). Update figures, quarter labels and any sentence whose meaning changes, keeping the article's structure and voice. If a number cannot be re-sourced, cut the sentence. Never present an old quarter as current.
- For bank deep dives with an ROI entry or audit record, update the matching stats in `roi-data.ts` / `bank-audits.json` so the article and its audit agree.
- Keep the original `publishedDate`. Set `updatedDate` to the release date (tomorrow in auto mode, since the PR merges about 24 hours after it opens). In `BLOG_DATES`, set the slug's date to that same release date.

## 3. Wire it in

- Uncomment the slug in `BLOG_SLUGS` and move it to the top under a dated group comment (e.g. `// — Released from drafts (Oct 2026) —`).
- Make sure it has an `articles-index.ts` entry (the SEO drafts do not; add one per article.md) and that `date` there reflects the update month.
- Do not touch other held slugs.

## 4. LinkedIn

Write `marketing/linkedin/queue/<slug>.md` (and the `-followup.md` one week later) exactly as article.md describes, built around the refreshed numbers. Do not call it new research if it is a refresh; "updated with Q2 call report data" is fine.

## 5. Verify and ship

Run article.md's verify steps (typecheck, lint, `bunx vitest run test/content`, dev server on `$ARTICLE_DEV_PORT`, editor re-read, no em dashes).

Branch `release/<slug>` from an up-to-date `master`, commit (`Release <short title> (refreshed)`, body listing every changed number with its source), push, `gh pr create` titled `Release: <title>` with: what was stale and what changed, the full source list, and both LinkedIn post texts. For a retirement, title it `Retire draft: <slug>` and explain why. **Auto mode only:** `gh pr edit <n> --add-label auto-publish`. Report the PR URL and one line on what changed.
