# RAVEN pivot: from verification software to bank technology consulting

Date: 2026-11-22 · Status: draft for approval

## Intent and the why

RAVEN (reportraven.tech) today is positioned as borrower verification and digital account opening software for community banks. Isaac wants to spend his time on broader work than one product: being a **general technology consultant for banks**, sold on his own background. He built the banking side of fintechs at **Upstart and Affirm** (he worked at both), and he has helped traditional banks modernize their stack with named technology: **Finxact** (core), **Plaid income verification**, and **Vesta** (mortgage LOS).

The verification software stays, but as one offering in the suite rather than the headline. The new story in one line:

> A bank technology consultant who built the banking arm of Upstart and Affirm, helping banks set up operations, integrate modern technology, adopt AI safely, and pass examiner scrutiny, with software he has built himself.

## Audience

- **Primary: new banks**, from FDIC filing through the first three years of operation (de novos). *Call made in conversation:* this is where the existing content engine (De Novo Watch, charter articles, `marketing/denovo-targets.csv`) already reaches, and pre-open banks have no incumbent vendors or advisors yet.
- **Secondary: community banks** modernizing an existing stack (the Southeast footprint the blog already covers: SC, NC, GA, FL, then TN, VA, AL).
- The reader is still "a smart community bank CEO" (or COO/CTO), the same reader `.claude/commands/article.md` writes for.

## Goals

1. Anyone landing on reportraven.tech understands within one screen that RAVEN is a consulting practice led by a named person with Upstart/Affirm and bank-modernization experience.
2. The services are clear and each has its own page that can rank in search.
3. Verification software is still discoverable and sellable as one service, with its existing pages intact.
4. The content and outreach engine (articles, LinkedIn, visibility check, de novo outreach, free audit) keeps running, now pointing readers at the consulting offer.
5. A Vesta-as-LOS article ships as the first article in the new voice (separate follow-on project, see below).

## Non-goals

- No new brand or domain. The name RAVEN and reportraven.tech stay. (Approach A, chosen.)
- No pricing on the site. Engagements are scoped on a call.
- No changes to the Frodo/RAVEN product code, whitelabel demo pages, or the API. This is a positioning and content change.
- No deletion of existing SEO pages. Nothing that currently ranks gets removed or redirected.
- No change to the research products themselves (De Novo Watch, bank snapshot, rankings, tech stack): they stay as they are and become "research" in the new story.

## Anti-goals (would be a failure even if it ships)

- **Overclaiming.** Vendors are named as hands-on experience ("implemented," "integrated," "worked with"), never as partnerships, certifications or endorsements. Employer names, titles and dates must match Isaac's LinkedIn exactly. No implied security credentials he does not hold.
- **Generic consultancy fluff.** "Digital transformation journey," "synergies," stock-photo copy. The site must keep the house style: concrete, specific, data-dense, fair-minded.
- **Losing search equity.** Breaking URLs, removing ranked pages, or stripping the structured data AI assistants cite.
- **A split message.** A visitor should never land on a product demo pitch from the homepage or nav.

## Approaches considered

| | Approach | Trade-off |
|---|---|---|
| **A (chosen)** | **Pivot the existing site.** reportraven.tech becomes the consulting firm's site; homepage leads with Isaac and services; verification becomes one service page; research engine and blog stay. | Most rewriting up front; keeps all search equity and the existing audience. |
| B | Add an `/advisory` section, keep the product homepage. | Cheapest, but every visitor lands on a software pitch, which contradicts "general tech consultant." |
| C | New brand and domain for consulting; RAVEN stays the product. | Cleanest separation, but restarts search ranking and the De Novo Watch audience from zero. |

Isaac picked A.

## What was decided

### Positioning and voice
- Founder-led. The site speaks about Isaac by name and his experience is the main proof. RAVEN-the-software is evidence that he builds, not the pitch.
- Vendors named: Finxact, Plaid (income verification), Vesta (LOS), plus the providers RAVEN already integrates (Socure, Truework, ATTOM, Melissa, FullContact) as "hands-on." Phrase as experience, not partnership.
- Upstart and Affirm are named directly, since Isaac worked at both.

### Services (practice areas)
Each gets a page under a new `/services` hub. Items 1–4 come from Isaac; 5 and 6 are calls made by Claude (marked) and can be cut.

1. **New bank operational setup.** Standing up operating processes, vendor selection and sequencing between conditional approval and opening, and examiner-ready documentation. (The existing `/solutions/de-novo-bank-technology` page is the seed for this.)
2. **Technology integration and stack modernization.** Core (Finxact), LOS (Vesta), income and asset verification (Plaid), digital account opening, and the integration work between them.
3. **AI integration and governance.** Helping banks adopt AI tools and set up the governance around them: AI use policy, model risk management (SR 11-7 style), third-party risk management under the 2023 interagency guidance, and examiner-facing documentation.
4. **Security and IT risk assessments.** Readiness and gap assessments against the FFIEC IT Examination Handbook and NIST CSF 2.0, covering vendor risk and examiner readiness. These are not certified audits or penetration tests, which are delivered with a partner. (Confirmed by Isaac.)
5. **Fintech partnership and bank-partner programs.** Helping banks evaluate, launch or run fintech lending partnerships, drawing on the Upstart/Affirm work. (Proposed by Claude, confirmed by Isaac.)
6. **RAVEN verification software.** The existing product, presented as a service offering: the current solutions pages, integrations pages and ROI calculator live under it.

### Engagement shape
*Claude's call (Isaac described the role, not packaging):* three tiers described in words, no prices.
- **Free entry point:** for operating banks, the existing free digital lending audit, kept as-is mechanically (it needs an active FDIC institution with call report data), reframed in copy as the first step of working together. *Claude's call:* for pre-open de novos (no call reports yet), the entry point is simply "Book a call"; the audit form is not shown on the new-bank service page or De Novo Watch pages, and `audit-request.md` mechanics are out of scope.
- **Scoped project:** a defined deliverable (vendor selection, an integration, an AI governance framework, a security readiness review).
- **Ongoing advisory:** a fractional-CTO-style retainer for banks that need someone on call.

Primary CTA everywhere: **"Book a call"** (the existing Calendly button), replacing "Request a Demo" / "Book a Demo Call". Phone and email stay.

### Founder content
- About page rewritten around Isaac: Upstart, Affirm, what he built there (the banking arm / bank-partner side), then bank modernization work with Finxact, Plaid income verification and Vesta, then why he built RAVEN, then Greenville, SC.
- Homepage gets a founder section near the top (short version of the above) with a link to About.
- JSON-LD updated: Organization becomes a `ProfessionalService` (or `Organization` + `ProfessionalService`), Person gets an updated `jobTitle` and lists Upstart and Affirm as past employers (no dates). Existing LinkedIn and GitHub `sameAs` links stay.
- **High-level biography only** (Isaac's decision). No titles, dates or client names. Merges to `master` deploy to production, so no placeholder text ever goes live.

## Site inventory: what changes

All paths are under `dashboard/src/app/(marketing)/` unless noted.

| Area | Change |
|---|---|
| `page.tsx` (homepage, ~1,470 lines) | Rewrite: hero (consultant positioning + founder), services overview, founder section, "how an engagement works," proof (RAVEN as something he built, research as free resources), CTA. Remove the product-demo flow sections ("Three steps. No new workflows.", report contents, "Live in your existing stack in a week") or move them to the verification service page. Keep the "Research we publish" section. Metadata and OG titles change. |
| `layout.tsx` (marketing) and `dashboard/src/app/layout.tsx` | Default title/description/OG: "Bank technology consulting" positioning. |
| `site-shell.tsx` | Nav: Services, Research (De Novo Watch, snapshot, rankings, tech stack), Blog, About, CTA "Book a call". Footer links updated the same way; Solutions/Integrations/Glossary stay in the footer. |
| New `services/` + `services/[slug]` | Hub and one page per service, data-driven like `solutions/solutions-data.ts`. Added to the sitemap and `llms-content.ts`. |
| `solutions/` (hub + ~20 slugs) | URLs unchanged. Hub reframed as "RAVEN verification software" within the services suite and linked from `/services/verification`. Per-page CTAs changed to "Book a call." Page bodies otherwise untouched. |
| `integrations/` | URLs, pages and hub framing unchanged: these are "RAVEN + X" software pages (RAVEN works alongside the bank's core/LOS) and are not experience claims. *Claude's call:* do **not** relabel the hub as "technology we work with," and do not add Finxact or Vesta entries here, since the software does not integrate with them. Isaac's hands-on vendor experience lives on the About page and the service pages instead, limited to vendors he confirms. |
| `roi/` | Kept, linked from the verification service page only (it models verification ROI). |
| `about/page.tsx` | Rewritten around Isaac (see Founder content). |
| `ai-info/page.tsx`, `llms-content.ts` | `INTRO` and `DISAMBIGUATION` rewritten: RAVEN is a bank technology consulting practice led by Isaac Welch, which also offers verification software. Keep the "not affiliated with" list. |
| `calendly-button.tsx`, `interest-form.tsx`, `demo-modal.tsx`, `lead-capture.tsx` | Button labels and copy from "demo" to "call." Submission behavior unchanged (JSON, per CLAUDE.md). |
| `blog/[slug]/page.tsx` and `blog/layout.tsx` | Mid-article and end CTAs: from "Request a demo" to a consulting CTA. The one hard-coded "*Request a demo at reportraven.tech*" in article content gets updated. |
| `glossary/` | Copy that calls RAVEN "verification software" updated; no structural change. |
| `(whitelabel)/audit/[slug]/page.tsx` | Audit page footer/CTA copy updated to the consulting framing. The `comparison` "withRaven" column stays (it compares against the software, which still exists). |

### Content and outreach engine (outside the site)

| File | Change |
|---|---|
| `.claude/commands/article.md` | The "final section" rule changes: the takeaway can describe the technology or operational fix broadly (not only "verification-first intake"). Allow a short, natural reference to consulting where RAVEN may currently be named. Reader stays the same. Add Vesta/Finxact/AI governance as valid article territory. |
| `.claude/commands/visibility-check.md` | Add consulting buyer queries to the seed list (e.g. de novo bank consultant, bank technology consultant, AI governance for banks, core conversion consultant, Finxact implementation, Vesta LOS). Keep the verification queries. |
| `.claude/commands/audit-request.md` | No mechanical change; delivery email copy (via `automation/auto-publish.ts`) reframed to offer a call. |
| `marketing/linkedin-posts.md`, `marketing/seo-aeo-playbook.md`, `marketing/backlink-playbook.md` | Positioning lines updated; LinkedIn voice can shift toward Isaac's own profile. |
| `dashboard/scripts/gen-mailers.ts`, `marketing/denovo-targets.csv` outreach copy | Pitch shifts from "verification layer" to "operator who has built this before." |

These skills also run unattended from the automation clones in `.automation/`, which are pulled from `master`. Changes take effect for automation once merged.

## Constraints

- **CLAUDE.md:** all form submissions stay `application/json`; no URL-encoded forms.
- **Public repo:** no requester PII, no client names Isaac hasn't approved for public use.
- **In-flight work on `master`:** the working tree has uncommitted changes to files this pivot touches (`layout.tsx`, `lead-capture.tsx`, `interest-form.tsx`, `calendly-button.tsx`, `demo-modal.tsx`, `roi-client.tsx`, bank-snapshot files) plus new product-analytics files. That work is now committed on branch `product-analytics` (see Decisions). The pivot builds on top of it, so the first pivot deploy does not remove tracking that is already live.
- Tests in `dashboard/test/content/` check marketing content; update or extend them where copy assertions change.
- Existing URLs must keep working and stay in the sitemap.

## Follow-on project: Vesta LOS article

Run through the existing `/article` pipeline **after** the About page and services pages ship, so it can link to them and speak with first-hand authority. Angle: Vesta as a modern LOS for community banks, from someone who has implemented it. The article type, research sources and house-style rules come from `/article`. It is scoped separately from this design.

## What's left to the builder

- Visual design, layout and component structure of the new homepage, services pages and About page (stay within the existing site's visual language).
- Exact copy, within the voice and claims rules above.
- Slugs for the service pages.
- How the work is split into PRs and in what order (suggested: nav + metadata + About + services hub first, then homepage, then CTA sweep, then engine/skills).
- Test updates.

## Decisions from Isaac (2026-11-22)

- **Biography stays high level.** No titles, dates or bank-client names on the site. The copy says he built the banking arm at Upstart and Affirm, and has helped traditional banks modernize their stack with Finxact, Plaid income verification and Vesta. It does not say in what capacity or when the modernization work happened. This also ends the "enrich later" step under Founder content.
- **Security service is a readiness and gap assessment** (no credentials claimed). Formal audits and penetration tests are delivered with a partner, as described under service 4.
- **Service 5 (fintech partnership programs) is kept.**
- **In-flight work committed** on branch `product-analytics` (`9734336` FDIC client for bank snapshot pages, `aaab289` product event tracking, including a vitest `@/` alias fix). The pivot branches from it, and it needs to merge to `master` before or with the first pivot PR.

## Still open (does not block the plan)

- Headshot for the About page and homepage founder section. Ship without one; add it when supplied.
