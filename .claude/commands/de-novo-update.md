---
description: Re-verify and update the De Novo Watch tracker (new filings, status changes), then ship it as an auto-publish PR
argument-hint: "[auto]"
---

# /de-novo-update

Keep `reportraven.tech/de-novo-watch` current. The tracker is cited by organizers, reporters and AI search because its rows are dated and sourced; a stale tracker loses that. Run weekly.

Arguments: `$ARGUMENTS`. Empty or `auto`: unattended run, no questions; record every decision in the PR body.

Data lives in `dashboard/src/app/(marketing)/de-novo-watch/de-novo-data.ts`. Read its header comment and every row first.

## 1. Research

Check, and note the URL and date of everything you use:
- **FDIC applications for deposit insurance**: the FDIC's pending and recently acted-on deposit insurance applications (search fdic.gov for "deposit insurance applications" and the weekly "Applications" bulletin). This is the primary source for new filings, approvals and withdrawals.
- **FDIC BankFind** (`https://banks.data.fdic.gov/api/institutions?filters=ESTYMD:[<YYYY-MM-DD of 12 months ago> TO *]&fields=NAME,CERT,CITY,STALP,ESTYMD,ASSET&sort_by=ESTYMD&sort_order=DESC&limit=50`) for banks that actually opened.
- **State regulators** for the tracker's states (Florida OFR first), and organizer or bank press releases and trade coverage (American Banker, The Bank Slate, local business journals) for capital raises, leadership and opening dates.

## 2. Update the data

- For each existing row: confirm or update `status`, `statusDetail`, `capital`, `leadership`, then set `asOf` to today. If a fact cannot be re-confirmed, keep it and leave `asOf` unchanged rather than inventing a date.
- Add rows for new filings in the tracker's scope (the Southeast first, plus any national filing notable enough for trade coverage). Every new row needs a source you actually read.
- Add to `CHARTER_MOVES` any bank entering a market by buying or relocating an existing charter.
- Update `TRACKER_SUMMARY` (`updated`, the national and Florida 2026 application counts, `note`) from the FDIC list.
- Never contradict a published article; if new facts supersede one, say so in `statusDetail` (e.g. "Opened 2026-10-01, after the article was published").
- No em dashes. Keep the existing tone: factual, dated, specific.

**Article leads.** Bank-name searches are among the site's best traffic (the Glades and Portrait deep dives), so for each Southeast row (SC, NC, GA, FL, TN, VA, AL) that is new or reached conditional approval, charter or opening in this run and has no `articleSlug`, append a topic to `marketing/topic-ideas.md` (create it with a `# Topic ideas` header if missing) unless one for that bank is already there:

```
- [ ] <Bank name>: <the angle, e.g. "a $25M Tampa de novo wins FDIC approval"> | type 8 | target query: "<bank name>" | why winnable: new bank, no existing coverage | added <YYYY-MM-DD>
```

If nothing changed beyond re-verification, still ship the refreshed `asOf` dates (they are what signal freshness), but skip the LinkedIn post.

## 3. LinkedIn post (only when there is news)

When a row was added or a status changed, write `marketing/linkedin/queue/de-novo-watch-<YYYY-MM-DD>.md`:

```
---
slug: de-novo-watch-<YYYY-MM-DD>
title: De Novo Watch
description: <one-sentence summary of what changed>
url: https://reportraven.tech/de-novo-watch
---
<post text>
```

Post text: 100-170 words, the news in the first line (e.g. "A new bank just filed for deposit insurance in Tampa."), the two or three facts that matter, one question for bankers or organizers, a blank line, then exactly five hashtags (e.g. `#DeNovo #CommunityBanking #BankCharter #Banking #Fintech`). No em dashes, no emoji, no link in the body.

## 3b. Reporter pitch (only when there is news)

Earned media is how the tracker gains authority, and only Isaac can send pitches, so make each one a two-minute job. When the run found a new filing, approval or opening that is newsworthy (first in a county or state in years, unusual capital, a notable founder, a fintech or foreign bank charter), write `marketing/pitches/de-novo-<YYYY-MM-DD>.md`:

```
---
to: <reporter and outlet from the earned-media list in marketing/seo-aeo-playbook.md best suited to the story (local business journal for a local bank, The Bank Slate or American Banker for broader news)>
subject: <specific, under 70 characters>
---
<email body, under 150 words: the news in one sentence, two or three data points from the tracker with their sources, one line offering the full data or an exclusive angle, a link to reportraven.tech/de-novo-watch, signed "Isaac Welch, RAVEN">
```

Plain, specific, no hype; reporters get dozens of these a day. Only facts already in the tracker with sources. Skip the pitch when nothing is newsworthy. The Monday digest links new pitches to Isaac.

## 4. Verify and ship

From `dashboard/`: `bun run typecheck` and `bun run lint` pass; start the dev server on `$ARTICLE_DEV_PORT` (default 3000) if needed and confirm `/de-novo-watch` returns 200 and shows the changes.

Branch `de-novo/<YYYY-MM-DD>` from an up-to-date `master`, commit (include the pitch file if written) (`Update De Novo Watch (<YYYY-MM-DD>)`, body listing each change with its source), push, and `gh pr create` titled `De Novo Watch update: <YYYY-MM-DD>` with the full change list and source URLs. **Auto mode only:** `gh pr edit <n> --add-label auto-publish`. Report the PR URL and a one-line summary of what changed.
