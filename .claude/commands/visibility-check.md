---
description: Monthly search and AI-citation visibility check; logs where reportraven.tech shows up and feeds content gaps to /article
argument-hint: "[auto]"
---

# /visibility-check

Measure whether the people RAVEN sells to can find it, then turn the gaps into article topics. Run monthly. `$ARGUMENTS` empty or `auto`: unattended, no questions.

Background: `marketing/seo-aeo-playbook.md` (read its "Where we are" and "evidence" sections first). Authority, not on-page SEO, is the binding constraint, and third-party listicles and directories dominate AI citations for commercial queries. So this check tracks two things: whether our pages rank, and who ranks instead (the outreach targets).

## 1. Run the queries

Queries live in `marketing/visibility-queries.md` (one per line under `## Queries`; create the file from the seed list below if missing). For each query, run WebSearch and record:
- whether any reportraven.tech page appears in the results, its position, and which page;
- the top three results (domain and page type: vendor page, listicle, directory, news, forum).

Seed queries (buyer language first; avoid "bank verification software", which the market reads as payee validation):
```
digital account opening software for community banks
income verification for community banks
employment verification for banks
borrower verification software
MANTL alternatives
The Work Number alternatives for banks
digital loan application credit union
community bank digital lending
de novo banks 2026
new bank charters Florida 2026
South Carolina de novo bank
community bank fraud account opening
how long does it take to close a mortgage community bank
fintech vs community bank personal loans
credit union digital lending audit
```

Data-page queries: make sure these are also in `marketing/visibility-queries.md`, appending any that are missing. They track the free bank data pages (`/bank-snapshot`, `/bank-rankings`), which target questions about specific banks and states rather than software:
```
most efficient banks in South Carolina
Georgia bank rankings ROA
Conway National Bank return on assets
community bank peer comparison tool
```

## 2. Log it

Append one section to `marketing/visibility-log.md` (create with a short header if missing):

```
## <YYYY-MM-DD>
Visible on <n> of <total> queries.
| Query | RAVEN (position, page) | Top 3 |
|---|---|---|
...
Changes since last check: <queries gained or lost, in one or two lines>
```

## 3. Turn gaps into topics

Rewrite `marketing/topic-ideas.md` (replace, do not append) with up to five topics where a RAVEN article could realistically win: queries where we are absent but the results are weak (thin vendor pages, stale listicles, forum threads, no data-backed answer). For each:

```
- [ ] <working title> | type <article type # from /article> | target query: "<query>" | why winnable: <one line> | added <YYYY-MM-DD>
```

Keep any unchecked item from the previous file that is still a gap; drop items that are now checked off or that we now rank for. Never propose topics that would require claims the data cannot support, and never propose a topic an existing article already covers (check `articles-index.ts`).

Also list, under `## Outreach targets`, the directories, listicles and publications that ranked for three or more queries: they are the off-site targets Isaac should prioritize (the playbook's off-site checklist).

## 4. Ship

Branch `visibility/<YYYY-MM-DD>` from an up-to-date `master`, commit the three marketing files (`Visibility check <YYYY-MM-DD>: visible on <n>/<total>`), push, open a PR titled the same with the summary, the new topics, and the outreach targets in the body. **Auto mode only:** `gh pr edit <n> --add-label auto-publish`. These are internal files with no site change, so the PR only needs CI to pass.
