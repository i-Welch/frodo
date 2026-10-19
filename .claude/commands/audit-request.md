---
description: Fulfill free digital lending audit requests from the site (build the audit page, ship it, queue the delivery email)
argument-hint: "[auto]"
---

# /audit-request

Turn free-audit requests submitted on reportraven.tech into published `/audit/<inst-slug>` pages. The requester gets an email from Isaac with the link automatically: `automation/auto-publish.ts` emails every claimed request once its audit page returns 200.

Arguments: `$ARGUMENTS`. Empty or `auto`: unattended run. Make every decision yourself and record it in the PR body.

**Privacy: this repository is public.** Never write a requester's name, email, or request id into any file, commit message, branch name, or PR. Refer to them only as "requested via the site".

## 1. Fetch the queue

From the repo root: `bun automation/audit-requests.ts list pending`. If the list is empty, say so and stop.

Handle at most **two institutions** per run, oldest first. Requests that name the same institution share one audit.

## 2. Triage each request

When the request has a `cert`, the requester picked their bank from the form's FDIC suggestions: that is the institution, so skip the lookup below (still fetch its record with `filters=CERT:<cert>` for name, city and website). Otherwise the `bank` field is free text typed by the requester. Resolve it to one institution:
- Banks: FDIC BankFind (`https://banks.data.fdic.gov/api/institutions?filters=ACTIVE:1&search=NAME:<words>&fields=NAME,CERT,CITY,STALP,ASSET,WEBADDR`).
- Credit unions: NCUA (`https://mapping.ncua.gov/api/Search/GetSearchLocations` or the NCUA Research a Credit Union pages) for the charter number.
- Use the requester's email domain to break ties (it usually matches the institution's website).

Decline with `bun automation/audit-requests.ts decline <id> "<reason>"` when the request is spam, names something that is not a US bank or credit union, or cannot be resolved with confidence. Isaac already received an alert for every request, so a decline sends nothing to the requester and he can follow up by hand.

## 3. Reuse an existing audit

Pick `<inst-slug>` using the existing naming convention (the institution's legal name in kebab case, e.g. `robins-financial-credit-union`, `optimumbank`). If `dashboard/src/app/(whitelabel)/_config/bank-audits.json` already has that institution, claim the request against it (step 6) and move on. No PR is needed; the next hourly auto-publish run emails the requester.

## 4. Build a new audit

Follow `.claude/commands/article.md`, section "Wiring it into the site", items **6-9** (ROI entry, `bank-audits.json` record, white-label config, registry) and the data-source rules in its "Data sources" section. Differences from an article run:
- No article. Leave `articleSlug` and `articleTitle` out of the `ROI_BANKS` entry; do not touch the blog files, LinkedIn queue, or article log.
- Fingerprint the institution's live website for `currentJourney` (online banking vendor, loan application domains and flow, account opening path) and date the observation. This is what makes the audit specific to them, so be concrete.
- Every number must trace to a public source (call report or NCUA 5300, HMDA, SOD, Census) listed in `sources`. Modeled figures are marked `estimated: true` with the derivation written out.
- The tone is a helpful analysis addressed to the institution itself: candid about gaps, never mocking.

## 5. Verify and ship

From `dashboard/`: `bun run typecheck` and `bun run lint` must pass. Start the dev server on `$ARTICLE_DEV_PORT` (default 3000) if one is not already running from this checkout, and confirm `http://localhost:<port>/audit/<inst-slug>` returns 200 and renders the journey, findings, and ROI sections. Fix anything that fails; never ship a broken audit.

Then:
1. Branch `audit/<inst-slug>` from an up-to-date `master`; commit with subject `Add <Institution> digital lending audit and white-label demo` and a body naming the identifiers and sources (e.g. "FDIC cert 12345, 2024 HMDA origination counts, website fingerprinted 2026-10-20").
2. `gh pr create` titled `Audit: <Institution Name>`. Body: "Requested via the site.", the resolved institution (name, city/state, cert or charter, assets), the source list with URLs, what is estimated, and the audit URL.
3. **Auto mode only:** `gh pr edit <n> --add-label auto-publish`. The auto-publisher merges it after the 24-hour review window, and once the page is live it emails the requester.

## 6. Claim

Only after the audit exists on `master` (step 3) or its PR is open (step 5), run, for each request it covers:

`bun automation/audit-requests.ts claim <id> <inst-slug> "<Institution Name>"`

`<Institution Name>` is how the institution writes its own name; it appears in the delivery email subject. Claiming is what queues the delivery email, so never claim before the audit is built.

## 7. Report

List each request handled: the institution, the outcome (reused audit, PR URL, or declined with reason), with no requester details.
