import type { MetadataRoute } from 'next';
import { AUDITS } from './(whitelabel)/_config/audit-data';
import { getRoiBank } from './(marketing)/roi/roi-data';
import { GLOSSARY_TERMS } from './(marketing)/glossary/glossary-data';
import { SOLUTIONS } from './(marketing)/solutions/solutions-data';
import { INTEGRATIONS } from './(marketing)/integrations/integrations-data';
import { BLOG_SLUGS, BLOG_DATES } from './(marketing)/blog/published';

const SITE = 'https://reportraven.tech';
const APP = 'https://app.reportraven.tech';

// Bump manually when non-blog page content meaningfully changes.
const SITE_UPDATED = new Date('2026-07-05');
// About / AI-info / De Novo Watch pages: bump when their content changes.
const PAGES_ADDED = new Date('2026-07-18');

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
  // Slugs added to the codebase but not yet ready to surface in search.
  // Remove a slug from this list when it's ready to be indexed.
  const SITEMAP_HOLD: Set<string> = new Set(['oconee-state-bank', 'ameris-bank', 'united-bank']);

  // Audit pages are generated exactly where the route generates them
  // (an audit needs a matching ROI model), so the sitemap never lists a 404
  // and never misses a page as banks are added. Note: /roi/<slug> 301-redirects
  // to /audit/<slug>, so only the canonical /audit URLs belong here.
  const auditUrls = AUDITS.filter((a) => getRoiBank(a.slug) && !SITEMAP_HOLD.has(a.slug)).map((a) => ({
    url: `${SITE}/audit/${a.slug}`,
    lastModified: SITE_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    { url: SITE, lastModified: SITE_UPDATED, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/blog`, lastModified: SITE_UPDATED, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/solutions`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    ...SOLUTIONS.map((s) => ({
      url: `${SITE}/solutions/${s.slug}`,
      lastModified: SITE_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    { url: `${SITE}/integrations`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    ...INTEGRATIONS.map((i) => ({
      url: `${SITE}/integrations/${i.slug}`,
      lastModified: SITE_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${SITE}/about`, lastModified: PAGES_ADDED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/ai-info`, lastModified: PAGES_ADDED, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/de-novo-watch`, lastModified: PAGES_ADDED, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/glossary`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    ...GLOSSARY_TERMS.map((t) => ({
      url: `${SITE}/glossary/${t.slug}`,
      lastModified: t.updated ? new Date(t.updated) : SITE_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...BLOG_SLUGS.map((slug) => ({
      url: `${SITE}/blog/${slug}`,
      lastModified: BLOG_DATES[slug] ? new Date(BLOG_DATES[slug]) : SITE_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...auditUrls,
    ...LEGAL_PATHS.map((path) => ({
      url: `${APP}/legal/${path}`,
      lastModified: SITE_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: path === 'privacy-policy' || path === 'terms-of-service' ? 0.3 : 0.4,
    })),
  ];
}
