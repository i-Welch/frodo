import type { MetadataRoute } from 'next';
import { AUDITS } from './(whitelabel)/_config/audit-data';
import { getRoiBank } from './(marketing)/roi/roi-data';

const SITE = 'https://reportraven.tech';
const APP = 'https://app.reportraven.tech';

// Blog article slugs. Mirrors the articles rendered by /blog/[slug].
const BLOG_SLUGS = [
  '59-billion-compliance-burden',
  'affirm-vs-community-bank-personal-loans',
  'anderson-brothers-bank-myrtle-beach-bet',
  'arthur-state-bank-upstate-bet',
  'bank-travelers-rest-greenville-growth-engine',
  'beacon-community-bank-charleston-growth-capacity',
  'carolina-bank-between-two-economies',
  'ccnb-myrtle-beach-merger-growth-2026',
  'chime-account-opening-deposit-war',
  'coastal-states-bank-boat-bank',
  'colony-bankcorp-farm-to-fees',
  'community-bank-borrower-experience-roi',
  'community-bank-ceo-digital-lending-2026',
  'community-bank-compete-neobank-core',
  'community-bank-digital-lending-platform-guide',
  'community-banks-are-losing-the-lending-race',
  'community-banks-lose-loans-fintechs',
  'conway-national-bank-grand-strand-dominance',
  'countybank-greenwood-sc-sba-deep-dive',
  'fintech-grade-loan-application-community-bank',
  'first-capital-bank-charleston-growth-digital-gap',
  'first-community-bank-sc-cre-merger-growth',
  'first-palmetto-bank-sc-performance-deep-dive',
  'first-reliance-outgrew-florence',
  'foreclosure-wave-hiding-in-plain-sight',
  'how-figure-closes-heloc-in-5-days',
  'income-verification-fintech-vs-bank',
  'next-generation-borrowers-wont-wait',
  'oconee-federal-quiet-comeback',
  'one-link-complete-verification',
  'optus-bank-cdfi-columbia-growth',
  'queensborough-national-bank-trust-deep-dive',
  'rocket-mortgage-22-days-how',
  'security-federal-bank-cdfi-rate-rebound-aiken',
  'south-atlantic-bank-coastal-growth-engine',
  'southern-bank-nc-digital-bet',
  'southern-first-bank-upstate-sc-bet',
  'trillion-dollar-ipo-wave-2026',
  'what-neobanks-get-right-community-banks',
  'why-it-takes-42-days-to-close-a-mortgage',
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

  // Audit pages are generated exactly where the route generates them
  // (an audit needs a matching ROI model), so the sitemap never lists a 404
  // and never misses a page as banks are added. Note: /roi/<slug> 301-redirects
  // to /audit/<slug>, so only the canonical /audit URLs belong here.
  const auditUrls = AUDITS.filter((a) => getRoiBank(a.slug)).map((a) => ({
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
