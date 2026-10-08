#!/usr/bin/env bun
// ---------------------------------------------------------------------------
// SEO publish scheduler
//
// Usage:
//   bun scripts/seo-publish.ts             — check status and apply any due sitemap changes
//   bun scripts/seo-publish.ts --dry-run   — preview without writing files
//   bun scripts/seo-publish.ts --status    — full schedule view, no changes
//
// Run this on any publishing day. It's idempotent.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dir, '..');
const SITEMAP = join(ROOT, 'dashboard/src/app/sitemap.ts');
const STATE_FILE = join(ROOT, 'marketing/linkedin-posted.json');
const DRY_RUN = process.argv.includes('--dry-run');
const STATUS_ONLY = process.argv.includes('--status');

// ---------------------------------------------------------------------------
// Sitemap rollout schedule
// ---------------------------------------------------------------------------
const SITEMAP_PHASES: { date: string; label: string; slugs: string[] }[] = [
  {
    date: '2026-06-26',
    label: 'Phase 1 (live) — institutional research + 7 SEO articles',
    slugs: [
      'one-link-complete-verification',
      'how-figure-closes-heloc-in-5-days',
      '59-billion-compliance-burden',
      'next-generation-borrowers-wont-wait',
      'community-banks-are-losing-the-lending-race',
      'why-it-takes-42-days-to-close-a-mortgage',
      'community-bank-compete-neobank-core',
      'community-banks-lose-loans-fintechs',
      'community-bank-ceo-digital-lending-2026',
      'community-bank-digital-lending-platform-guide',
      'community-bank-borrower-experience-roi',
      'what-neobanks-get-right-community-banks',
      'fintech-grade-loan-application-community-bank',
      'foreclosure-wave-hiding-in-plain-sight',
      'southern-first-bank-upstate-sc-bet',
      'income-verification-fintech-vs-bank',
      'anderson-brothers-bank-myrtle-beach-bet',
      'trillion-dollar-ipo-wave-2026',
      'arthur-state-bank-upstate-bet',
      'affirm-vs-community-bank-personal-loans',
      'oconee-federal-quiet-comeback',
      'coastal-states-bank-boat-bank',
      'rocket-mortgage-22-days-how',
    ],
  },
  {
    date: '2026-07-03',
    label: 'Phase 2a — Beacon Community Bank deep dive (LinkedIn post 4)',
    slugs: [
      'beacon-community-bank-charleston-growth-capacity',
    ],
  },
  {
    date: '2026-07-07',
    label: 'Phase 2b — bank deep dives (Mar–Apr 2026 dates)',
    slugs: [
      'queensborough-national-bank-trust-deep-dive',
      'first-palmetto-bank-sc-performance-deep-dive',
      'optus-bank-cdfi-columbia-growth',
      'countybank-greenwood-sc-sba-deep-dive',
      'first-community-bank-sc-cre-merger-growth',
    ],
  },
  {
    date: '2026-07-14',
    label: 'Phase 3 — bank deep dives + AI lending + white-label portal (LinkedIn posts 8–9)',
    slugs: [
      'first-capital-bank-charleston-growth-digital-gap',
      'ccnb-myrtle-beach-merger-growth-2026',
      'security-federal-bank-cdfi-rate-rebound-aiken',
      'community-bank-ai-lending-guide',
      'white-label-borrower-portal-community-bank',
    ],
  },
  {
    date: '2026-07-16',
    label: 'Phase 4 — digital account opening + open banking (LinkedIn posts 10–11)',
    slugs: [
      'digital-account-opening-community-bank',
      'open-banking-community-bank-guide',
    ],
  },
  {
    date: '2026-07-21',
    label: 'Phase 5 — remaining June bank deep dives',
    slugs: [
      'bank-travelers-rest-greenville-growth-engine',
      'conway-national-bank-grand-strand-dominance',
      'south-atlantic-bank-coastal-growth-engine',
      'first-reliance-sells-at-the-top',
    ],
  },
  {
    date: '2026-07-28',
    label: 'Phase 6 — final bank deep dives',
    slugs: [
      'first-reliance-outgrew-florence',
      'carolina-bank-between-two-economies',
      'colony-bankcorp-farm-to-fees',
    ],
  },
  {
    date: '2026-08-04',
    label: 'Phase 7 — chime + southern bank NC',
    slugs: [
      'chime-account-opening-deposit-war',
      'southern-bank-nc-digital-bet',
    ],
  },
  {
    date: '2026-08-11',
    label: 'Phase 8 — core-specific SEO: Jack Henry + Fiserv (LinkedIn posts 12–13)',
    slugs: [
      'jack-henry-symitar-loan-origination',
      'fiserv-premier-digital-lending',
    ],
  },
];

// ---------------------------------------------------------------------------
// LinkedIn post schedule
// ---------------------------------------------------------------------------
const LINKEDIN_POSTS: { id: number; date: string; slug: string; title: string }[] = [
  { id: 1,  date: '2026-06-30', slug: 'community-bank-compete-neobank-core',          title: 'How Community Banks Can Compete With Neobanks Without Replacing Their Core' },
  { id: 2,  date: '2026-07-01', slug: 'community-banks-lose-loans-fintechs',           title: 'Why Community Banks Lose Loans to Fintechs' },
  { id: 3,  date: '2026-07-02', slug: 'community-bank-ceo-digital-lending-2026',       title: "The Community Bank CEO's Guide to Digital Lending in 2026" },
  { id: 4,  date: '2026-07-03', slug: 'beacon-community-bank-charleston-growth-capacity', title: 'Beacon Community Bank: Growth at the Edge of Capacity' },
  { id: 5,  date: '2026-07-07', slug: 'community-bank-digital-lending-platform-guide', title: 'What to Look for in a Community Bank Digital Lending Platform' },
  { id: 6,  date: '2026-07-08', slug: 'community-bank-borrower-experience-roi',        title: 'The ROI of Modernizing Your Community Bank Borrower Experience' },
  { id: 7,  date: '2026-07-09', slug: 'what-neobanks-get-right-community-banks',       title: 'What Neobanks Get Right (and What Community Banks Already Have)' },
  { id: 8,  date: '2026-07-10', slug: 'fintech-grade-loan-application-community-bank', title: 'How to Offer a Fintech-Grade Loan Application as a Community Bank' },
  { id: 9,  date: '2026-07-14', slug: 'community-bank-ai-lending-guide',               title: 'How Community Banks Can Use AI in Lending Without the Risk' },
  { id: 10, date: '2026-07-15', slug: 'white-label-borrower-portal-community-bank',    title: 'The White-Label Borrower Portal: What It Is and Why Community Banks Need One' },
  { id: 11, date: '2026-07-16', slug: 'digital-account-opening-community-bank',        title: 'Digital Account Opening for Community Banks: The Deposit Side of the Gap' },
  { id: 12, date: '2026-07-17', slug: 'open-banking-community-bank-guide',             title: 'Open Banking for Community Banks: What Plaid, Fiserv, and Jack Henry Actually Support' },
  { id: 13, date: '2026-08-11', slug: 'jack-henry-symitar-loan-origination',           title: 'Digital Lending on Jack Henry: What SilverLake and Symitar Actually Support' },
  { id: 14, date: '2026-08-12', slug: 'fiserv-premier-digital-lending',                title: 'Digital Lending on Fiserv: What Premier and Portico Actually Support' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function display(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
}

function daysFromNow(iso: string, now: string): number {
  return Math.round(
    (new Date(iso).getTime() - new Date(now).getTime()) / 86400000
  );
}

function loadPosted(): Set<number> {
  if (!existsSync(STATE_FILE)) return new Set();
  try {
    const data = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    return new Set<number>(data.posted ?? []);
  } catch {
    return new Set();
  }
}

// ---------------------------------------------------------------------------
// Sitemap update
// ---------------------------------------------------------------------------
function updateSitemap(now: string): { added: string[]; alreadyLive: string[]; missing: string[] } {
  let content = readFileSync(SITEMAP, 'utf-8');
  const added: string[] = [];
  const alreadyLive: string[] = [];
  const missing: string[] = [];

  for (const phase of SITEMAP_PHASES) {
    if (now < phase.date) continue;

    for (const slug of phase.slugs) {
      const commented = `  // '${slug}',`;
      const live = `  '${slug}',`;

      if (content.includes(commented)) {
        content = content.replace(commented, live);
        added.push(slug);
      } else if (content.includes(live)) {
        alreadyLive.push(slug);
      } else {
        missing.push(slug);
      }
    }
  }

  if (added.length > 0 && !DRY_RUN && !STATUS_ONLY) {
    writeFileSync(SITEMAP, content);
  }

  return { added, alreadyLive, missing };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const now = todayISO();
console.log(`\nSEO Publish Scheduler — ${display(now)}`);
if (DRY_RUN) console.log('(dry run — no files written)');
console.log('');

const posted = loadPosted();

// ---- Sitemap ---------------------------------------------------------------
const { added, alreadyLive, missing } = updateSitemap(now);

const totalArticles = SITEMAP_PHASES.flatMap((p) => p.slugs).length;
const liveCount = alreadyLive.length + added.length;

console.log(`SITEMAP  ${liveCount} / ${totalArticles} articles live`);
console.log('─'.repeat(60));

if (added.length > 0) {
  console.log(`\n  ✅ Added ${added.length} slug(s) today:`);
  for (const s of added) console.log(`     + ${s}`);
  if (!DRY_RUN && !STATUS_ONLY) {
    console.log('\n  → sitemap.ts written. Deploy dashboard to apply.\n');
  }
} else {
  console.log('  ✅ No sitemap changes due today.\n');
}

if (missing.length > 0) {
  console.log(`  ⚠️  ${missing.length} scheduled slug(s) not found in sitemap.ts:`);
  for (const s of missing) console.log(`     ? ${s}`);
  console.log('');
}

// Upcoming phases
const upcoming = SITEMAP_PHASES.filter((p) => p.date > now);
if (upcoming.length > 0) {
  console.log('  Upcoming:');
  for (const p of upcoming) {
    const days = daysFromNow(p.date, now);
    console.log(`  ${display(p.date)} (+${days}d)  ${p.label}`);
    for (const s of p.slugs) console.log(`    · ${s}`);
  }
}

// ---- LinkedIn --------------------------------------------------------------
console.log('');
console.log(`LINKEDIN  ${posted.size} / ${LINKEDIN_POSTS.length} posts published`);
console.log('─'.repeat(60));

const due = LINKEDIN_POSTS.filter((p) => p.date <= now && !posted.has(p.id));
const upcoming2 = LINKEDIN_POSTS.filter((p) => p.date > now);

if (due.length > 0) {
  const todayPost = due.filter((p) => p.date === now);
  const overdue = due.filter((p) => p.date < now);

  if (todayPost.length > 0) {
    console.log('\n  📣 Due TODAY:');
    for (const p of todayPost) {
      console.log(`     Post ${p.id}: ${p.title}`);
      console.log(`     https://reportraven.tech/blog/${p.slug}`);
      console.log(`     Copy: marketing/linkedin-posts.md → POST ${p.id}`);
    }
  }

  if (overdue.length > 0) {
    console.log(`\n  ⚠️  Overdue (${overdue.length} not yet marked published):`);
    for (const p of overdue) {
      console.log(`     Post ${p.id} — was ${display(p.date)}: ${p.title}`);
    }
    console.log(`\n  To mark as published: echo '{"posted":[${[...posted, ...overdue.map((p) => p.id)].sort((a, b) => a - b).join(',')}]}' > marketing/linkedin-posted.json`);
  }
} else if (LINKEDIN_POSTS.filter((p) => p.date <= now).length > 0) {
  console.log('\n  ✅ All due posts are marked as published.\n');
} else {
  console.log('\n  No posts due yet.\n');
}

if (upcoming2.length > 0) {
  console.log('\n  Scheduled:');
  for (const p of upcoming2) {
    const days = daysFromNow(p.date, now);
    const marker = days <= 3 ? ' ← soon' : '';
    console.log(`  ${display(p.date)} (+${days}d)  Post ${p.id}: ${p.title}${marker}`);
  }
}

console.log('');
