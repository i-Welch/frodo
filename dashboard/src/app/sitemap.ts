import type { MetadataRoute } from 'next';
import { AUDITS } from './(whitelabel)/_config/audit-data';
import { getRoiBank } from './(marketing)/roi/roi-data';

const SITE = 'https://reportraven.tech';
const APP = 'https://app.reportraven.tech';

// Blog article slugs — phased rollout to avoid content flood signals.
// To publish a phase: uncomment the slugs on/after the target date and deploy.
//
// Phase 1 LIVE (Jun 26): foundational institutional + 7 SEO articles (LinkedIn Jun 30–Jul 10)
// Phase 2a (Jul 3): uncomment beacon-community-bank-charleston-growth-capacity
// Phase 2b (Jul 7): uncomment queensborough through first-community-bank
// Phase 3 (Jul 14): uncomment first-capital through white-label + security-federal
// Phase 4 (Jul 21): uncomment bank-travelers through open-banking
// Phase 5 (Jul 28): uncomment first-reliance through colony-bankcorp
// Phase 6 (Aug 4):  uncomment chime + southern-bank-nc
// Phase 8 (Aug 11): uncomment jack-henry + fiserv (core-specific SEO)

const BLOG_SLUGS = [
  // — Institutional research & macro (Feb–Mar 2026) —
  'one-link-complete-verification',
  'how-figure-closes-heloc-in-5-days',
  '59-billion-compliance-burden',
  'next-generation-borrowers-wont-wait',
  'community-banks-are-losing-the-lending-race',
  'why-it-takes-42-days-to-close-a-mortgage',
  // — SEO articles (May–Jun 2026, LinkedIn Jun 30–Jul 10) —
  'community-bank-compete-neobank-core',
  'community-banks-lose-loans-fintechs',
  'community-bank-ceo-digital-lending-2026',
  'community-bank-digital-lending-platform-guide',
  'community-bank-borrower-experience-roi',
  'what-neobanks-get-right-community-banks',
  'fintech-grade-loan-application-community-bank',
  // — Established articles (already had varied dates, May–Jun 2026) —
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
  // — Phase 2: add Jul 7 (bank deep dives, Mar–Apr 2026 dates) —
  // 'queensborough-national-bank-trust-deep-dive',
  // 'first-palmetto-bank-sc-performance-deep-dive',
  // 'beacon-community-bank-charleston-growth-capacity',
  // 'optus-bank-cdfi-columbia-growth',
  // 'countybank-greenwood-sc-sba-deep-dive',
  // 'first-community-bank-sc-cre-merger-growth',
  // — Phase 3: add Jul 14 (+ promote community-bank-ai + white-label via LinkedIn) —
  // 'first-capital-bank-charleston-growth-digital-gap',
  // 'ccnb-myrtle-beach-merger-growth-2026',
  // 'security-federal-bank-cdfi-rate-rebound-aiken',
  // 'community-bank-ai-lending-guide',
  // 'white-label-borrower-portal-community-bank',
  // — Phase 4: add Jul 16 (promote digital-account + open-banking via LinkedIn posts 10–11) —
  // 'digital-account-opening-community-bank',
  // 'open-banking-community-bank-guide',
  // — Phase 5: add Jul 21 (remaining June bank deep dives) —
  // 'bank-travelers-rest-greenville-growth-engine',
  // 'conway-national-bank-grand-strand-dominance',
  // 'south-atlantic-bank-coastal-growth-engine',
  'first-reliance-sells-at-the-top',
  // — Phase 6: add Jul 28 —
  // 'first-reliance-outgrew-florence',
  // 'carolina-bank-between-two-economies',
  // 'colony-bankcorp-farm-to-fees',
  // — Phase 6: add Aug 4 —
  // 'chime-account-opening-deposit-war',
  // 'southern-bank-nc-digital-bet',
  // — Phase 8: add Aug 11 (core-specific SEO: Jack Henry + Fiserv, LinkedIn posts 12–13) —
  // 'jack-henry-symitar-loan-origination',
  // 'fiserv-premier-digital-lending',
];

const LEGAL_PATHS = [
  'security',
  'subprocessors',
  'wisp',
  'incident-response',
  'business-continuity',
  'vendor-risk-management',
  'data-retention',
  'privacy-policy',
  'terms-of-service',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Slugs added to the codebase but not yet ready to surface in search.
  // Remove a slug from this list when it's ready to be indexed.
  const SITEMAP_HOLD: Set<string> = new Set(['oconee-state-bank', 'ameris-bank', 'united-bank']);

  // Audit pages are generated exactly where the route generates them
  // (an audit needs a matching ROI model), so the sitemap never lists a 404
  // and never misses a page as banks are added. Note: /roi/<slug> 301-redirects
  // to /audit/<slug>, so only the canonical /audit URLs belong here.
  const auditUrls = AUDITS.filter((a) => getRoiBank(a.slug) && !SITEMAP_HOLD.has(a.slug)).map((a) => ({
    url: `${SITE}/audit/${a.slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    { url: SITE, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/blog`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    ...BLOG_SLUGS.map((slug) => ({
      url: `${SITE}/blog/${slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...auditUrls,
    ...LEGAL_PATHS.map((path) => ({
      url: `${APP}/legal/${path}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: path === 'privacy-policy' || path === 'terms-of-service' ? 0.3 : 0.4,
    })),
  ];
}
