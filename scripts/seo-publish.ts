#!/usr/bin/env bun
// ---------------------------------------------------------------------------
// SEO publish scheduler
//
// Usage: bun scripts/seo-publish.ts [--dry-run]
//
// Checks today's date against the content rollout schedule and:
//   1. Uncomments any due slugs in sitemap.ts
//   2. Prints which LinkedIn posts are due today or overdue
//
// Run this daily (or whenever you remember) — it's idempotent.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dir, '..');
const SITEMAP = join(ROOT, 'dashboard/src/app/sitemap.ts');
const LINKEDIN = join(ROOT, 'marketing/linkedin-posts.md');
const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Sitemap rollout schedule
// Each phase has an ISO date (YYYY-MM-DD) and the slugs to activate.
// ---------------------------------------------------------------------------
const SITEMAP_SCHEDULE: { date: string; label: string; slugs: string[] }[] = [
  {
    date: '2026-07-07',
    label: 'Phase 2 — bank deep dives (Mar–Apr dates)',
    slugs: [
      'queensborough-national-bank-trust-deep-dive',
      'first-palmetto-bank-sc-performance-deep-dive',
      'beacon-community-bank-charleston-growth-capacity',
      'optus-bank-cdfi-columbia-growth',
      'countybank-greenwood-sc-sba-deep-dive',
      'first-community-bank-sc-cre-merger-growth',
    ],
  },
  {
    date: '2026-07-14',
    label: 'Phase 3 — more bank deep dives + AI lending + white-label portal (LinkedIn posts 8–9)',
    slugs: [
      'first-capital-bank-charleston-growth-digital-gap',
      'ccnb-myrtle-beach-merger-growth-2026',
      'security-federal-bank-cdfi-rate-rebound-aiken',
      'community-bank-ai-lending-guide',
      'white-label-borrower-portal-community-bank',
    ],
  },
  {
    date: '2026-07-21',
    label: 'Phase 4 — remaining June deep dives + digital account + open banking (LinkedIn posts 10–11)',
    slugs: [
      'bank-travelers-rest-greenville-growth-engine',
      'conway-national-bank-grand-strand-dominance',
      'south-atlantic-bank-coastal-growth-engine',
      'first-reliance-sells-at-the-top',
      'digital-account-opening-community-bank',
      'open-banking-community-bank-guide',
    ],
  },
  {
    date: '2026-07-28',
    label: 'Phase 5 — remaining bank deep dives',
    slugs: [
      'first-reliance-outgrew-florence',
      'carolina-bank-between-two-economies',
      'colony-bankcorp-farm-to-fees',
    ],
  },
  {
    date: '2026-08-04',
    label: 'Phase 6 — final articles',
    slugs: [
      'chime-account-opening-deposit-war',
      'southern-bank-nc-digital-bet',
    ],
  },
];

// ---------------------------------------------------------------------------
// LinkedIn post schedule (date → post header label)
// ---------------------------------------------------------------------------
const LINKEDIN_SCHEDULE: { date: string; post: string; url: string }[] = [
  { date: '2026-06-30', post: 'POST 1', url: '/blog/community-bank-compete-neobank-core' },
  { date: '2026-07-01', post: 'POST 2', url: '/blog/community-banks-lose-loans-fintechs' },
  { date: '2026-07-02', post: 'POST 3', url: '/blog/community-bank-ceo-digital-lending-2026' },
  { date: '2026-07-07', post: 'POST 4', url: '/blog/community-bank-digital-lending-platform-guide' },
  { date: '2026-07-08', post: 'POST 5', url: '/blog/community-bank-borrower-experience-roi' },
  { date: '2026-07-09', post: 'POST 6', url: '/blog/what-neobanks-get-right-community-banks' },
  { date: '2026-07-10', post: 'POST 7', url: '/blog/fintech-grade-loan-application-community-bank' },
  { date: '2026-07-14', post: 'POST 8', url: '/blog/community-bank-ai-lending-guide' },
  { date: '2026-07-15', post: 'POST 9', url: '/blog/white-label-borrower-portal-community-bank' },
  { date: '2026-07-16', post: 'POST 10', url: '/blog/digital-account-opening-community-bank' },
  { date: '2026-07-17', post: 'POST 11', url: '/blog/open-banking-community-bank-guide' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function today(): string {
  return new Date().toISOString().split('T')[0];
}

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Sitemap update
// ---------------------------------------------------------------------------
function updateSitemap(): { added: string[]; already: string[]; missing: string[] } {
  let content = readFileSync(SITEMAP, 'utf-8');
  const added: string[] = [];
  const already: string[] = [];
  const missing: string[] = [];
  const now = today();

  for (const phase of SITEMAP_SCHEDULE) {
    if (now < phase.date) continue;

    for (const slug of phase.slugs) {
      const commented = `  // '${slug}',`;
      const live = `  '${slug}',`;

      if (content.includes(commented)) {
        content = content.replace(commented, live);
        added.push(slug);
      } else if (content.includes(live)) {
        already.push(slug);
      } else {
        missing.push(slug);
      }
    }
  }

  if (added.length > 0 && !DRY_RUN) {
    writeFileSync(SITEMAP, content);
  }

  return { added, already, missing };
}

// ---------------------------------------------------------------------------
// LinkedIn reminders
// ---------------------------------------------------------------------------
function linkedinReminders(): { due: typeof LINKEDIN_SCHEDULE; upcoming: typeof LINKEDIN_SCHEDULE } {
  const now = today();
  const due = LINKEDIN_SCHEDULE.filter((p) => p.date <= now);
  const upcoming = LINKEDIN_SCHEDULE
    .filter((p) => p.date > now)
    .slice(0, 3);
  return { due, upcoming };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const todayStr = today();
console.log(`\nSEO Publish Scheduler — ${isoToDisplay(todayStr)}`);
if (DRY_RUN) console.log('(dry run — no files written)\n');
else console.log('');

// Sitemap
const { added, already, missing } = updateSitemap();

if (added.length > 0) {
  console.log(`✅ Added ${added.length} slug(s) to sitemap.ts:`);
  for (const s of added) console.log(`   + ${s}`);
  console.log('\n   → Deploy dashboard to make these pages indexable.\n');
} else {
  console.log('✅ Sitemap is up to date — no new slugs due today.\n');
}

if (already.length > 0) {
  console.log(`   Already live (${already.length}): ${already.slice(0, 3).join(', ')}${already.length > 3 ? '...' : ''}`);
}

if (missing.length > 0) {
  console.log(`⚠️  ${missing.length} slug(s) not found in sitemap (may have been removed):`);
  for (const s of missing) console.log(`   ? ${s}`);
  console.log('');
}

// Next phases
const now = today();
const upcoming = SITEMAP_SCHEDULE.filter((p) => p.date > now);
if (upcoming.length > 0) {
  console.log('📅 Upcoming sitemap phases:');
  for (const phase of upcoming.slice(0, 3)) {
    const days = Math.round(
      (new Date(phase.date).getTime() - new Date(now).getTime()) / 86400000
    );
    console.log(`   ${isoToDisplay(phase.date)} (${days}d): ${phase.label}`);
  }
  console.log('');
}

// LinkedIn
const { due: liDue, upcoming: liUpcoming } = linkedinReminders();
const unposted = liDue.filter((p) => p.date <= now);

if (unposted.length > 0) {
  console.log(`📣 LinkedIn posts due (${unposted.length} total):`);
  for (const p of unposted) {
    const isToday = p.date === now;
    const label = isToday ? '← TODAY' : `(was ${isoToDisplay(p.date)})`;
    console.log(`   ${p.post} ${label}`);
    console.log(`      https://reportraven.tech${p.url}`);
    console.log(`      Full copy: marketing/linkedin-posts.md`);
  }
  console.log('');
}

if (liUpcoming.length > 0) {
  console.log('🔜 Upcoming LinkedIn posts:');
  for (const p of liUpcoming) {
    console.log(`   ${isoToDisplay(p.date)}: ${p.post} — https://reportraven.tech${p.url}`);
  }
  console.log('');
}
