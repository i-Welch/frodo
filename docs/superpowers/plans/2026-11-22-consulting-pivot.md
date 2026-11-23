# Consulting Pivot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition reportraven.tech from verification software to a founder-led bank technology consulting practice, with RAVEN verification software kept as one service.

**Architecture:** Two new data modules are the single source of truth: `founder.ts` (bio facts, Person JSON-LD) and `services/services-data.ts` (six services, engagement steps). New `/services` pages render from them; homepage, About, llms.txt and AI-info read from them. Everything else is a copy and CTA sweep. Existing URLs are untouched.

**Tech Stack:** Next.js App Router (TSX, inline `<style>` blocks, `SiteShell`), Vitest content tests (source-text and data-module assertions), Bun in CI.

**Spec:** `docs/superpowers/specs/2026-11-22-consulting-pivot-design.md`

**Branch:** `consulting-pivot` (already created on top of `product-analytics`; both must merge to `master` together or in order).

## Global Constraints

- Positioning line (fixed copy): "A bank technology consultant who built the banking arm of Upstart and Affirm, helping banks set up operations, integrate modern technology, adopt AI safely, and pass examiner scrutiny, with software he has built himself."
- High-level biography only: no job titles, no dates, no bank-client names. Name Upstart and Affirm directly; name Finxact, Plaid income verification and Vesta as hands-on experience.
- Vendors are never described as partners, certified, endorsed or official. No security credentials claimed (no CISSP/CISA/CISM/OSCP).
- Security service = readiness and gap assessment against the FFIEC IT Examination Handbook and NIST CSF 2.0; formal audits and penetration tests "delivered with a partner."
- Primary CTA label everywhere: `Book a call` (existing Calendly URL). Phone `(229) 379-6131` and `isaac@reportraven.tech` stay.
- No prices anywhere on the site.
- No existing URL removed, redirected or dropped from the sitemap (`/solutions/*`, `/integrations/*`, `/roi/*`, `/glossary/*`, research pages).
- `/integrations` pages keep their "RAVEN + X" software framing; no Finxact or Vesta entries added there.
- Pre-open banks: no free-audit form on the new-bank service page or De Novo Watch pages.
- House style: concrete, specific, no hype ("digital transformation journey", "synergy", "cutting-edge", "best-in-class", "in today's fast-paced").
- No placeholder text ever ships (merges to `master` auto-deploy).
- CLAUDE.md: forms submit `application/json` only; never `application/x-www-form-urlencoded`.
- Repo is public: no requester PII or unapproved client names in any file.
- Analytics continuity: keep existing `source` strings and event names (`get_demo_click`, `lead_submitted`, lead `kind: 'demo'`); only visible labels change.

## Review Focus

- Mobile visitors: the shell hides nav links under 640px and shows only "Blog"; they must still reach Services and Book a call → Task 3 test `mobile nav reaches services`.
- Search equity: every pre-existing solutions, integrations and glossary URL stays in the sitemap after the services entries are added → Task 2 test `sitemap keeps every existing solutions and integrations URL`.
- Old demo copy hiding inside article bodies and email templates (e.g. "*Request a demo at reportraven.tech*" in blog content, `'Your RAVEN demo'` email subject) → Task 3 test `no demo CTA copy remains` scans those files too.
- A pre-open de novo landing on the new-bank page or De Novo Watch sees an audit form they cannot use → Task 1 test `new-bank service hides the audit` and Task 2 test `de novo pages render no audit form`.
- Overclaiming slipping into copy written later (partner/certified language, credentials, dates) → Task 1 `copy-guard` helper applied in Tasks 1, 4, 5, 7 tests.

---

## File Structure

| File | Responsibility |
|---|---|
| Create `dashboard/src/app/(marketing)/founder.ts` | Founder facts, bio paragraphs, `founderJsonLd()` |
| Create `dashboard/src/app/(marketing)/services/services-data.ts` | `SERVICES`, `ENGAGEMENT_STEPS`, `getService()` |
| Create `dashboard/src/app/(marketing)/services/page.tsx` | Services hub |
| Create `dashboard/src/app/(marketing)/services/[slug]/page.tsx` | One service page |
| Create `dashboard/test/content/copy-guard.ts` | Shared banned-phrase checker for tests |
| Create `dashboard/test/content/positioning.test.ts` | All pivot assertions |
| Modify `dashboard/src/app/sitemap.ts`, `site-shell.tsx`, `page.tsx` (home), `about/page.tsx`, `llms-content.ts`, `ai-info/page.tsx`, CTA components, blog templates, audit page, `layout.tsx` files, OG files, `solutions/page.tsx`, `lead-capture.tsx`, `server/messaging/leads.ts` | Copy/CTA/metadata |
| Modify `.claude/commands/article.md`, `visibility-check.md`, `marketing/*.md`, `dashboard/scripts/gen-mailers.ts` | Content engine |

Run all test commands from `dashboard/`. Postgres-backed suites fail locally without a database; the content suite is the gate: `npx vitest run test/content`.

---

### Task 1: Founder and services data

**Files:**
- Create: `dashboard/src/app/(marketing)/founder.ts`
- Create: `dashboard/src/app/(marketing)/services/services-data.ts`
- Create: `dashboard/test/content/copy-guard.ts`
- Test: `dashboard/test/content/positioning.test.ts`

**Interfaces:**
- Produces:
  - `FOUNDER: { name: 'Isaac Welch'; location: 'Greenville, South Carolina'; headline: string; bio: string[]; experience: string[]; sameAs: string[]; email: 'isaac@reportraven.tech' }`
  - `founderJsonLd(): Record<string, unknown>` — `@type: 'Person'`, `@id: 'https://reportraven.tech/about#founder'`, `name`, `jobTitle: 'Founder, bank technology consultant'`, `url: 'https://reportraven.tech/about'`, `sameAs`, `alumniOf: [{ '@type': 'Organization', name: 'Upstart' }, { '@type': 'Organization', name: 'Affirm' }]`, `knowsAbout: string[]`. No dates.
  - `interface Service { slug; updated: string /* ISO */; navLabel; eyebrow; h1; metaTitle /* ≤60 chars */; metaDescription; intro: string[]; sections: SolutionSection[] /* import type from solutions-data */; deliverables: string[]; faqs: { q: string; a: string }[]; related: { href: string; label: string }[]; showAudit: boolean }`
  - `SERVICES: Service[]` in this order with these slugs: `new-bank-launch`, `technology-integration`, `ai-governance`, `security-readiness`, `fintech-partnerships`, `verification-software`
  - `ENGAGEMENT_STEPS: { title: string; body: string }[]` — exactly 3: free audit (operating banks) or intro call (new banks); scoped project; ongoing advisory (fractional-CTO style)
  - `getService(slug: string): Service | undefined`
  - `copyGuard(text: string): string[]` — returns the list of violations found (empty = clean)

- [ ] **Step 1: Write `copy-guard.ts`**

Export `copyGuard(text)` returning every match of these patterns (case-insensitive) as violation strings:
`/\b(official|certified|preferred|authorized) partner\b/`, `/\bpartner(ed|ship)? with (Finxact|Plaid|Vesta|Upstart|Affirm|Socure|Truework)\b/`, `/\b(CISSP|CISA|CISM|OSCP|CEH)\b/`, `/\b(TODO|TBD|lorem ipsum|placeholder)\b/`, `/digital transformation journey|synerg|cutting-edge|best-in-class|in today's fast-paced/`, `/\$\s?\d[\d,]*(\.\d+)?\s*(\/|per)\s*(hour|hr|month|mo|engagement)/` (pricing), `/\b(19|20)\d{2}\s*[–-]\s*((19|20)\d{2}|present)\b/` (employment dates).

- [ ] **Step 2: Write the failing tests in `positioning.test.ts`**

```ts
describe('services data', () => {
  it('has the six services in order', () => {
    expect(SERVICES.map((s) => s.slug)).toEqual(['new-bank-launch','technology-integration','ai-governance','security-readiness','fintech-partnerships','verification-software']);
  });
  it('every service is complete', () => {
    for (const s of SERVICES) {
      expect(s.metaTitle.length, s.slug).toBeLessThanOrEqual(60);
      expect(s.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.intro.length && s.sections.length >= 2 && s.deliverables.length && s.faqs.length, s.slug).toBeTruthy();
    }
  });
  it('new-bank service hides the audit', () => {
    expect(getService('new-bank-launch')!.showAudit).toBe(false);
  });
  it('security is framed as readiness with a partner for audits', () => {
    const t = JSON.stringify(getService('security-readiness'));
    expect(t).toMatch(/FFIEC IT Examination Handbook/); expect(t).toMatch(/NIST CSF 2\.0/); expect(t).toMatch(/with a partner/i);
  });
  it('technology integration names the hands-on stack', () => {
    const t = JSON.stringify(getService('technology-integration'));
    for (const v of ['Finxact', 'Plaid', 'Vesta']) expect(t).toContain(v);
  });
  it('verification service links to existing software pages', () => {
    const hrefs = getService('verification-software')!.related.map((r) => r.href);
    expect(hrefs).toEqual(expect.arrayContaining(['/solutions', '/integrations']));
  });
  it('engagement has three steps', () => expect(ENGAGEMENT_STEPS).toHaveLength(3));
  it('services and founder copy pass the copy guard', () => {
    expect(copyGuard(JSON.stringify([SERVICES, ENGAGEMENT_STEPS, FOUNDER]))).toEqual([]);
  });
});

describe('founder', () => {
  it('names Upstart, Affirm and the stack, high level', () => {
    const t = FOUNDER.bio.join(' ') + FOUNDER.experience.join(' ');
    for (const v of ['Upstart', 'Affirm', 'Finxact', 'Plaid', 'Vesta']) expect(t).toContain(v);
  });
  it('Person JSON-LD lists both employers and keeps LinkedIn', () => {
    const p = founderJsonLd() as any;
    expect(p['@id']).toBe('https://reportraven.tech/about#founder');
    expect(p.alumniOf.map((o: any) => o.name)).toEqual(['Upstart', 'Affirm']);
    expect(p.sameAs).toContain('https://www.linkedin.com/in/isaac-welch-22a463179');
    expect(JSON.stringify(p)).not.toMatch(/startDate|endDate|\b(19|20)\d{2}\b/);
  });
});
```

- [ ] **Step 3: Run to verify failure** — `npx vitest run test/content/positioning.test.ts` → FAIL (modules not found).

- [ ] **Step 4: Implement `founder.ts` and `services-data.ts`**

`FOUNDER.sameAs`: `['https://www.linkedin.com/in/isaac-welch-22a463179', 'https://github.com/i-Welch']`. `FOUNDER.headline` is the positioning line from Global Constraints. `bio` (2–3 paragraphs) covers: built the banking arm at Upstart and Affirm; helped traditional banks modernize with Finxact, Plaid income verification and Vesta; built RAVEN verification software; based in Greenville, SC. Service copy follows spec §Services; seed `new-bank-launch` from the `de-novo-bank-technology` entry in `solutions-data.ts` (don't move or edit that entry). `verification-software` gets the homepage's product content in prose (one-link flow, report contents: identity, income, credit, employment, property, audit trail; works alongside the core/LOS) and `related` to `/solutions`, `/integrations`, `/roi`. `ai-governance` covers AI use policy, model risk management in the SR 11-7 style, third-party risk under the 2023 interagency guidance, examiner documentation. `fintech-partnerships` covers evaluating, launching and running fintech lending partnerships. `showAudit`: `false` for `new-bank-launch`, `true` for the rest.

- [ ] **Step 5: Run to verify pass** — same command → PASS.

- [ ] **Step 6: Commit** — `git add` the four files; message `Add founder and services data for consulting positioning`.

---

### Task 2: Services pages and sitemap

**Files:**
- Create: `dashboard/src/app/(marketing)/services/page.tsx`, `dashboard/src/app/(marketing)/services/[slug]/page.tsx`
- Modify: `dashboard/src/app/sitemap.ts` (after the `/solutions` block, ~line 79)
- Test: `dashboard/test/content/positioning.test.ts`

**Interfaces:**
- Consumes: `SERVICES`, `getService`, `ENGAGEMENT_STEPS`, `Service` (Task 1); `SiteShell`, `CalendlyButton`, `LeadCapture`, `DEFAULT_OG_IMAGES`.

- [ ] **Step 1: Write failing tests**

```ts
describe('services pages', () => {
  it('sitemap lists the hub and every service', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ data: [] })));
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain('https://reportraven.tech/services');
    for (const s of SERVICES) expect(urls).toContain(`https://reportraven.tech/services/${s.slug}`);
  });
  it('sitemap keeps every existing solutions and integrations URL', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ data: [] })));
    const urls = new Set((await sitemap()).map((e) => e.url));
    for (const s of SOLUTIONS) expect(urls.has(`https://reportraven.tech/solutions/${s.slug}`), s.slug).toBe(true);
    for (const i of INTEGRATIONS) expect(urls.has(`https://reportraven.tech/integrations/${i.slug}`), i.slug).toBe(true);
  });
  it('service page shows the audit only when showAudit', () => {
    const src = read('services/[slug]/page.tsx');
    expect(src).toMatch(/service\.showAudit\s*&&[\s\S]*variant="audit"/);
  });
  it('de novo pages render no audit form', () => {
    for (const f of walk('de-novo-watch', 'page.tsx')) expect(read(f), f).not.toContain('variant="audit"');
  });
});
```

`read(rel)` reads a file under `src/app/(marketing)/`; `walk(dir, name)` lists matching files recursively — add both as small helpers at the top of the test file. Import `sitemap` from `../../src/app/sitemap`; if the import pulls Next-only modules that fail under Vitest, replace the two sitemap tests with source assertions that `sitemap.ts` contains `SERVICES.map` and still contains `SOLUTIONS.map` and `INTEGRATIONS.map`.

- [ ] **Step 2: Run to verify failure** → FAIL.

- [ ] **Step 3: Build the pages**

Model both on `solutions/page.tsx` and `solutions/[slug]/page.tsx` (same style tokens, `SiteShell ctaSource`, JSON-LD shape with `Service` provider `{ '@id': 'https://reportraven.tech/#organization' }` and BreadcrumbList Home → Services → service). The hub lists the six services as cards, then an "How an engagement works" block from `ENGAGEMENT_STEPS`, then `CalendlyButton label="Book a call"`. A service page shows: eyebrow, h1, intro, hero `Book a call`, sections, deliverables list, FAQs (FAQPage JSON-LD), related links, then `{service.showAudit && <LeadCapture variant="audit" source={`services:${slug}`} />}`. Every page sets `openGraph.images: DEFAULT_OG_IMAGES`. Sitemap: hub `priority: 0.9`, services `priority: 0.9`, `lastModified: new Date(s.updated)`.

- [ ] **Step 4: Run to verify pass**, plus `npx vitest run test/content/og-images.test.ts` → PASS.

- [ ] **Step 5: Commit** — `Add services hub and service pages`.

---

### Task 3: Navigation and CTA sweep

**Files:**
- Modify: `calendly-button.tsx:39` (default label), `demo-modal.tsx:10`, `interest-form.tsx:69`, `site-shell.tsx` (nav, mobile link, `.site-cta` copy, footer links), `blog/layout.tsx:537-552`, `blog/page.tsx:453`, `blog/[slug]/page.tsx` (~6492-6498 mid-article CTA, line 5670 article content), `solutions/[slug]/page.tsx` (hero CTA), `(whitelabel)/audit/[slug]/page.tsx:154,404`, `dashboard/src/server/messaging/leads.ts` (`demo` email subject/body)
- Test: `positioning.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
const CTA_FILES = ['calendly-button.tsx','demo-modal.tsx','interest-form.tsx','site-shell.tsx','blog/layout.tsx','blog/page.tsx','blog/[slug]/page.tsx','solutions/[slug]/page.tsx','page.tsx','about/page.tsx','services/page.tsx','services/[slug]/page.tsx'];
describe('calls to action', () => {
  it('no demo CTA copy remains', () => {
    const files = [...CTA_FILES.map(read), readApp('(whitelabel)/audit/[slug]/page.tsx'), readSrc('server/messaging/leads.ts')];
    for (const src of files) expect(src).not.toMatch(/Request a Demo|Book a Demo|Get a Demo|Request a demo|Your RAVEN demo|live demo for your bank/);
  });
  it('Calendly defaults to Book a call', () => expect(read('calendly-button.tsx')).toMatch(/label = 'Book a call'/));
  it('nav links services, research and about', () => {
    const nav = read('site-shell.tsx');
    for (const h of ['/services', '/de-novo-watch', '/blog', '/about']) expect(nav).toContain(`href="${h}"`);
  });
  it('mobile nav reaches services', () => expect(read('site-shell.tsx')).toMatch(/site-nav-mobile-link"?[^>]*href="\/services"|href="\/services"[^>]*site-nav-mobile-link/));
  it('footer keeps solutions, integrations and glossary', () => {
    for (const h of ['/solutions', '/integrations', '/glossary', '/services']) expect(read('site-shell.tsx')).toContain(`href="${h}"`);
  });
});
```

(`readApp`/`readSrc` read under `src/app/` and `src/`.) The homepage, About and services files are rewritten in later tasks; this test covers them as they land. Until Task 5, `page.tsx` will fail this test, so in this task assert on every file except `page.tsx` and `about/page.tsx`, and add those two to the list in Tasks 4 and 5.

- [ ] **Step 2: Run to verify failure** → FAIL.

- [ ] **Step 3: Apply the sweep**

Labels → `Book a call`. Nav (desktop): Services, De Novo Watch, Blog, About, phone, `Book a call`; mobile shows Services and `Book a call` alongside Blog. `.site-cta` and `.blog-cta` copy: a 20-minute call with Isaac about the bank's technology, operations or AI plans. Mid-article default CTA (`blog/[slug]/page.tsx`): heading and body about getting help with the bank's technology from someone who built the banking side of Upstart and Affirm, button `Book a call`, keep the `roiBank` audit line. Article content line 5670 → `*Book a call at [reportraven.tech](https://reportraven.tech).*`. Audit page: both buttons `Book a call`; keep "Live demo ↗" links (they open the white-label demo, which still exists). `leads.ts` `demo` kind: subject `Your call with RAVEN`, body offers the Calendly link for a call about the bank's technology. Keep `kind: 'demo'`, event names and `source` strings.

- [ ] **Step 4: Run** `npx vitest run test/content` → PASS.

- [ ] **Step 5: Commit** — `Switch site CTAs from demo to Book a call and add Services to nav`.

---

### Task 4: About page

**Files:**
- Modify: `dashboard/src/app/(marketing)/about/page.tsx` (metadata lines 6-20, JSON-LD, body ~105-176)
- Test: `positioning.test.ts`

**Interfaces:** Consumes `FOUNDER`, `founderJsonLd()` (Task 1), `SERVICES` (links).

- [ ] **Step 1: Write failing tests** — add `'about/page.tsx'` to `CTA_FILES`, and:

```ts
it('about page is founder-led', () => {
  const src = read('about/page.tsx');
  expect(src).toContain('founderJsonLd()');
  expect(src).toMatch(/FOUNDER\.bio/);
  expect(src).not.toContain('a software engineer based in');
  expect(src).toContain('href="/services"');
  expect(src).toMatch(/not affiliated with RavenPack/i);
  expect(copyGuard(src)).toEqual([]);
});
```

- [ ] **Step 2: Run to verify failure** → FAIL.

- [ ] **Step 3: Rewrite** — h1 about Isaac and RAVEN; sections in order: who (renders `FOUNDER.bio`), what RAVEN does now (six services, linked), the software he built (verification, short, linking `/solutions`), research (De Novo Watch, snapshot, rankings), the name (keep the disambiguation paragraph), contact (keep). Drop "What RAVEN is not" and "The provider stack" lists (that content lives in the verification service and `/integrations`). JSON-LD graph: AboutPage + `founderJsonLd()`. Metadata description from the positioning line. Bottom `LeadCapture variant="audit"` stays.

- [ ] **Step 4: Run** `npx vitest run test/content` → PASS.

- [ ] **Step 5: Commit** — `Rewrite About page around the founder`.

---

### Task 5: Homepage

**Files:**
- Modify: `dashboard/src/app/(marketing)/page.tsx` (metadata 7-40, JSON-LD 70-~200, nav 1064-1078, sections 1080-1390, CTA 1414-1435, footer)
- Test: `positioning.test.ts`

**Interfaces:** Consumes `FOUNDER`, `founderJsonLd`, `SERVICES`, `ENGAGEMENT_STEPS`.

- [ ] **Step 1: Write failing tests** — add `'page.tsx'` to `CTA_FILES`, and:

```ts
it('homepage leads with consulting', () => {
  const src = read('page.tsx');
  expect(src).toMatch(/title: \{ absolute: 'RAVEN — Bank Technology Consulting[^']*' \}/);
  expect(src).toContain("'ProfessionalService'");
  expect(src).toContain('founderJsonLd()');
  expect(src).toMatch(/SERVICES\.map/);
  expect(src).toMatch(/ENGAGEMENT_STEPS\.map/);
  for (const gone of ['Three steps. No new workflows.', 'Everything you need for the loan file.', 'Live in your existing stack. In a week or less.', 'Borrower verification software for community banks'])
    expect(src).not.toContain(gone);
  expect(src).toContain('Research we publish from FDIC filings');
  expect(src).toContain('href="/services"');
  expect(copyGuard(src)).toEqual([]);
});
```

- [ ] **Step 2: Run to verify failure** → FAIL.

- [ ] **Step 3: Rewrite**

Metadata: title `RAVEN — Bank Technology Consulting for New and Community Banks` (or shorter, starting with `RAVEN — Bank Technology Consulting`); description and keywords around de novo bank consulting, core/LOS integration, AI governance for banks, examiner readiness, verification software. JSON-LD: Organization `@type: ['Organization', 'ProfessionalService']`, same `@id`, description from the positioning line, `knowsAbout` widened (core conversion, LOS, AI governance, model risk, third-party risk, IT examination readiness, fintech partnerships, borrower verification), `founder: { '@id': 'https://reportraven.tech/about#founder' }` plus `founderJsonLd()` as its own graph node; keep `WebSite`; keep `SoftwareApplication` but describe it as RAVEN verification software offered by the firm. Nav: same items as `site-shell` (Task 3). Sections in order: hero (tag "Bank technology consulting", h1 + sub from the positioning line, `Book a call` + secondary link to `/services`); founder (short `FOUNDER.bio[0]`, link to `/about`); services grid from `SERVICES`; how an engagement works from `ENGAGEMENT_STEPS`; "Software we built" (one paragraph on RAVEN verification, link `/services/verification-software`); keep the free-data research section; CTA "Book a call"; keep the bottom `LeadCapture variant="audit"`. Delete the how-it-works, team-split, report, and core-integration sections and their now-unused CSS. Footer adds `/services`.

- [ ] **Step 4: Run** `npx vitest run test/content` → PASS.

- [ ] **Step 5: Commit** — `Rewrite homepage for consulting positioning`.

---

### Task 6: Site-wide metadata, share images and leftover product copy

**Files:**
- Modify: `dashboard/src/app/layout.tsx` (10-31), `dashboard/src/app/opengraph-image.tsx` (6, 57), `dashboard/src/app/og-default.ts` (9), `solutions/page.tsx` (metadata, h1, sub), `lead-capture.tsx` (audit `COPY`), `glossary/glossary-data.ts` (lines that call RAVEN "verification software")
- Test: `positioning.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
it('default metadata and share image use the new positioning', () => {
  for (const src of [readApp('layout.tsx'), readApp('opengraph-image.tsx'), readApp('og-default.ts')]) {
    expect(src).not.toMatch(/Borrower Verification for Community Banks|Borrower verification for community banks/);
    expect(src).toMatch(/Bank Technology Consulting|bank technology consulting/);
  }
});
it('solutions hub is framed as the software service', () => {
  const src = read('solutions/page.tsx');
  expect(src).toContain('RAVEN Verification Software');
  expect(src).toContain('href="/services"');
});
it('audit lead copy reads as a first step, not a product pitch', () => {
  expect(read('lead-capture.tsx')).not.toMatch(/what verification automation would save/);
});
```

- [ ] **Step 2: Run to verify failure** → FAIL.

- [ ] **Step 3: Update copy** — root/OG: "RAVEN — Bank Technology Consulting". Solutions hub: h1 "RAVEN Verification Software", sub says it's one of the firm's services with a link to `/services`; card grid unchanged. Audit `COPY`: free digital lending audit as the first step of working together (current journey, gaps, what to fix first), still "built from your public call report and HMDA data". Glossary: run `grep -n "verification software\|RAVEN verifies\|RAVEN gives" src/app/(marketing)/glossary/glossary-data.ts` (4 hits expected) and reword each so RAVEN is a firm that offers verification software; don't touch definitions.

- [ ] **Step 4: Run** `npx vitest run test/content` → PASS.

- [ ] **Step 5: Commit** — `Update site metadata, share images and leftover product copy`.

---

### Task 7: llms.txt and AI-info page

**Files:**
- Modify: `dashboard/src/app/(marketing)/llms-content.ts` (`INTRO` line 26, `DISAMBIGUATION` line 32, build functions 119-140), `dashboard/src/app/(marketing)/ai-info/page.tsx`
- Test: `positioning.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
it('llms.txt describes the consulting practice and lists services', () => {
  const txt = buildLlmsTxt();
  expect(txt).toMatch(/bank technology consulting/i);
  for (const v of ['Isaac Welch', 'Upstart', 'Affirm']) expect(txt).toContain(v);
  for (const s of SERVICES) expect(txt).toContain(`https://reportraven.tech/services/${s.slug}`);
  expect(txt).toMatch(/Not affiliated with: RavenPack/);
  expect(copyGuard(txt)).toEqual([]);
});
it('ai-info matches', () => {
  const src = read('ai-info/page.tsx');
  expect(src).toMatch(/bank technology consulting/i);
  expect(src).not.toMatch(/Category: borrower verification and digital account opening software/);
});
```

- [ ] **Step 2: Run to verify failure** → FAIL.

- [ ] **Step 3: Rewrite** — `INTRO`: the firm, founder, audience (new banks first, community banks second), services. `DISAMBIGUATION`: category "bank technology consulting practice that also offers borrower verification software"; keep "Not affiliated with…" and "not crypto" lines; replace "Not a loan origination system…" with a line that RAVEN is not a core or LOS vendor and doesn't resell them. Add a services section (title + URL + one line per service) to both `buildLlmsTxt` and `buildLlmsFullTxt`. AI-info: same facts; "When RAVEN is a relevant answer" leads with consulting queries (de novo bank technology consultant, core/LOS integration help, AI governance for banks, IT exam readiness, fintech partnership programs) and keeps the verification ones after.

- [ ] **Step 4: Run** `npx vitest run test/content` → PASS.

- [ ] **Step 5: Commit** — `Rewrite llms.txt and AI-info for consulting positioning`.

---

### Task 8: Content and outreach engine

**Files:**
- Modify: `.claude/commands/article.md` (lines ~24, 45, 109), `.claude/commands/visibility-check.md` (seed queries ~18-30), `marketing/linkedin-posts.md`, `marketing/seo-aeo-playbook.md`, `marketing/backlink-playbook.md`, `dashboard/scripts/gen-mailers.ts` (`ctaNote` strings), `dashboard/src/server/messaging/leads.ts` (audit delivery email body, ~line 155-160)

No automated tests (prose and prompts); verification is the grep in Step 2.

- [ ] **Step 1: Edit**
  - `article.md` line 109 rule: the final takeaway may describe any technology or operational fix (core, LOS, verification, AI governance, examiner readiness), not only verification-first intake; deep dives still don't name RAVEN; types 3/4/7 may name RAVEN once as the consulting practice. Line 45 "where RAVEN sells" → "where RAVEN works". Add a line under topic types that Vesta, Finxact, Plaid income verification, AI governance and fintech partnership programs are valid subjects.
  - `visibility-check.md`: add seed queries `de novo bank consultant`, `bank technology consultant`, `AI governance for banks`, `core banking conversion consultant`, `Finxact implementation`, `Vesta LOS review`, `fintech bank partnership consultant`; keep the existing ones.
  - Marketing playbooks: update one-line positioning statements to the Global Constraints line; LinkedIn voice notes say posts can run from Isaac's own profile.
  - `gen-mailers.ts`: `ctaNote` keeps the audit contents and adds an offer of a call about the bank's broader technology plans.
  - `leads.ts` audit delivery email: add one line offering a call with Isaac about anything in the audit, or the bank's wider technology, operations or AI plans, with `CALENDLY_URL`.

- [ ] **Step 2: Verify** — `grep -rnE "where RAVEN sells|Request a Demo|Book a Demo" .claude/commands marketing/*.md dashboard/scripts/gen-mailers.ts dashboard/src/server/messaging/leads.ts` → no output. `npx vitest run test/content` → PASS.

- [ ] **Step 3: Commit** — `Point the content and outreach engine at the consulting offer`.

---

### Task 9: Whole-branch verification

- [ ] **Step 1:** `node node_modules/typescript/bin/tsc --noEmit` (from `dashboard/`) → exit 0, no output.
- [ ] **Step 2:** `npx eslint src test` → no errors.
- [ ] **Step 3:** `npx vitest run test/content` → all pass. Run the full `npx vitest run` and confirm every failure is `password authentication failed for user "postgres"` (local DB absent), nothing else.
- [ ] **Step 4:** `npx next build` → completes; `/services` and all six `/services/<slug>` routes appear in the route list. If the build fails for missing environment variables unrelated to these changes, record the exact error and stop rather than working around it.
- [ ] **Step 5:** `grep -rn "x-www-form-urlencoded" dashboard/src` → no output.
- [ ] **Step 6:** Report the branch state. Don't push or open a PR unless Isaac asks; note that `product-analytics` must merge first or together.

---

## Follow-on (separate, after this ships)

Vesta LOS article via `/article`, linking `/about` and `/services/technology-integration`.
