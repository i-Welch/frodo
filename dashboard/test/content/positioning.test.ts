import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { copyGuard } from './copy-guard';
import { FOUNDER, founderJsonLd } from '../../src/app/(marketing)/founder';
import { SERVICES, ENGAGEMENT_STEPS, getService } from '../../src/app/(marketing)/services/services-data';
import { SOLUTIONS } from '../../src/app/(marketing)/solutions/solutions-data';
import { GLOSSARY_TERMS } from '../../src/app/(marketing)/glossary/glossary-data';
import { BLOG_SLUGS } from '../../src/app/(marketing)/blog/published';
import { INTEGRATIONS } from '../../src/app/(marketing)/integrations/integrations-data';
import sitemap from '../../src/app/sitemap';
import { buildLlmsTxt, buildLlmsFullTxt } from '../../src/app/(marketing)/llms-content';

const SRC = resolve(__dirname, '../../src');
const MARKETING = join(SRC, 'app/(marketing)');
/** Read a file under src/app/(marketing)/. */
const read = (rel: string) => readFileSync(join(MARKETING, rel), 'utf8');
/** Every file named `name` under src/app/(marketing)/<dir>, as paths relative to (marketing). */
function walk(dir: string, name: string): string[] {
  return readdirSync(join(MARKETING, dir)).flatMap((f) => {
    const rel = join(dir, f);
    if (statSync(join(MARKETING, rel)).isDirectory()) return walk(rel, name);
    return f === name ? [rel] : [];
  });
}
const noFdic = () => vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ data: [] })));
afterEach(() => vi.unstubAllGlobals());

// The consulting pivot (docs/superpowers/specs/2026-11-22-consulting-pivot-design.md).

describe('copy guard', () => {
  it('flags overclaims, placeholders, prices and dates', () => {
    expect(copyGuard('An official partner of Finxact')).toHaveLength(1);
    expect(copyGuard('We partnered with Vesta')).toHaveLength(1);
    expect(copyGuard('Isaac, CISSP')).toHaveLength(1);
    expect(copyGuard('TBD')).toHaveLength(1);
    expect(copyGuard('$250 per hour')).toHaveLength(1);
    expect(copyGuard('Affirm, 2019–2022')).toHaveLength(1);
    expect(copyGuard('Hands-on experience with Finxact, Plaid and Vesta.')).toEqual([]);
    // CSS and form attributes are code, not copy.
    expect(copyGuard('.form-input::placeholder { color: red; } <input placeholder="Bank" />')).toEqual([]);
  });
});

describe('services data', () => {
  it('has the six services in order', () => {
    expect(SERVICES.map((s) => s.slug)).toEqual([
      'new-bank-launch',
      'technology-integration',
      'ai-governance',
      'security-readiness',
      'fintech-partnerships',
      'verification-software',
    ]);
  });

  it('every service is complete', () => {
    for (const s of SERVICES) {
      expect(s.metaTitle.length, s.slug).toBeLessThanOrEqual(60);
      expect(s.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.intro.length > 0 && s.sections.length >= 2 && s.deliverables.length > 0 && s.faqs.length > 0, s.slug).toBe(true);
    }
  });

  it('new-bank service hides the audit', () => {
    expect(getService('new-bank-launch')!.showAudit).toBe(false);
  });

  it('security is framed as readiness with a partner for audits', () => {
    const t = JSON.stringify(getService('security-readiness'));
    expect(t).toMatch(/FFIEC IT Examination Handbook/);
    expect(t).toMatch(/NIST CSF 2\.0/);
    expect(t).toMatch(/with a partner/i);
  });

  it('technology integration names the hands-on stack', () => {
    const t = JSON.stringify(getService('technology-integration'));
    for (const v of ['Finxact', 'Plaid', 'Vesta']) expect(t).toContain(v);
  });

  it('verification service links to existing software pages', () => {
    const hrefs = getService('verification-software')!.related.map((r) => r.href);
    expect(hrefs).toEqual(expect.arrayContaining(['/solutions', '/integrations']));
  });

  it('every related link resolves to a real page', () => {
    const glossary = new Set(GLOSSARY_TERMS.map((t) => t.slug));
    const solutions = new Set(SOLUTIONS.map((s) => s.slug));
    const services = new Set(SERVICES.map((s) => s.slug));
    const statics = new Set(['/solutions', '/integrations', '/de-novo-watch', '/bank-tech-stack', '/bank-snapshot', '/bank-rankings', '/about', '/services', '/legal/security']);
    for (const s of SERVICES) {
      for (const { href } of s.related) {
        const [, kind, slug] = href.match(/^\/([a-z-]+)\/?([a-z0-9-]*)$/) ?? [];
        const ok =
          statics.has(href) ||
          (kind === 'blog' && BLOG_SLUGS.includes(slug)) ||
          (kind === 'glossary' && glossary.has(slug)) ||
          (kind === 'solutions' && solutions.has(slug)) ||
          (kind === 'services' && services.has(slug));
        expect(ok, `${s.slug}: ${href}`).toBe(true);
      }
    }
  });

  it('engagement has three steps', () => {
    expect(ENGAGEMENT_STEPS).toHaveLength(3);
  });

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
    const p = founderJsonLd() as { '@id': string; alumniOf: { name: string }[]; sameAs: string[] };
    expect(p['@id']).toBe('https://reportraven.tech/about#founder');
    expect(p.alumniOf.map((o) => o.name)).toEqual(['Upstart', 'Affirm']);
    expect(p.sameAs).toContain('https://www.linkedin.com/in/isaac-welch-22a463179');
    expect(JSON.stringify(p)).not.toMatch(/startDate|endDate|\b(19|20)\d{2}\b/);
  });
});

describe('services pages', () => {
  it('sitemap lists the hub and every service', async () => {
    noFdic();
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain('https://reportraven.tech/services');
    for (const s of SERVICES) expect(urls).toContain(`https://reportraven.tech/services/${s.slug}`);
  });

  it('sitemap keeps every existing solutions and integrations URL', async () => {
    noFdic();
    const urls = new Set((await sitemap()).map((e) => e.url));
    for (const s of SOLUTIONS) expect(urls.has(`https://reportraven.tech/solutions/${s.slug}`), s.slug).toBe(true);
    for (const i of INTEGRATIONS) expect(urls.has(`https://reportraven.tech/integrations/${i.slug}`), i.slug).toBe(true);
  });

  it('service page shows the audit only when showAudit', () => {
    expect(read('services/[slug]/page.tsx')).toMatch(/service\.showAudit\s*&&[\s\S]*variant="audit"/);
  });

  it('de novo pages render no audit form', () => {
    for (const f of walk('de-novo-watch', 'page.tsx')) expect(read(f), f).not.toContain('variant="audit"');
  });
});

/** Every .tsx file under src/app/(marketing), relative to it. */
function walkTsx(dir = ''): string[] {
  return readdirSync(join(MARKETING, dir)).flatMap((f) => {
    const rel = join(dir, f);
    if (statSync(join(MARKETING, rel)).isDirectory()) return walkTsx(rel);
    return f.endsWith('.tsx') ? [rel] : [];
  });
}
const CTA_FILES = walkTsx();
const readSrc = (rel: string) => readFileSync(join(SRC, rel), 'utf8');
const OLD_CTA = /Request a Demo|Book a Demo|Get a Demo|Request a demo|Your RAVEN demo|live demo for your bank/;

describe('calls to action', () => {
  it('no demo CTA copy remains', () => {
    for (const f of CTA_FILES) expect(read(f), f).not.toMatch(OLD_CTA);
    expect(readSrc('app/(whitelabel)/audit/[slug]/page.tsx')).not.toMatch(OLD_CTA);
    expect(readSrc('server/messaging/leads.ts')).not.toMatch(OLD_CTA);
  });

  it('Calendly defaults to Book a call', () => {
    expect(read('calendly-button.tsx')).toMatch(/label = 'Book a call'/);
  });

  it('nav links services, research and about', () => {
    const nav = read('site-shell.tsx');
    for (const h of ['/services', '/de-novo-watch', '/blog', '/about']) expect(nav).toContain(`href="${h}"`);
  });

  it('mobile nav reaches services', () => {
    expect(read('site-shell.tsx')).toMatch(
      /<a[^>]*href="\/services"[^>]*site-nav-mobile-link|<a[^>]*site-nav-mobile-link[^>]*href="\/services"/,
    );
  });

  it('footer keeps solutions, integrations and glossary', () => {
    const shell = read('site-shell.tsx');
    for (const h of ['/solutions', '/integrations', '/glossary', '/services']) expect(shell).toContain(`href="${h}"`);
  });
});

describe('about page', () => {
  it('is founder-led', () => {
    const src = read('about/page.tsx');
    expect(src).toContain('founderJsonLd()');
    expect(src).toMatch(/FOUNDER.bio/);
    expect(src).not.toContain('a software engineer based in');
    expect(src).toContain('href="/services"');
    expect(src).toMatch(/not affiliated with RavenPack/i);
    expect(copyGuard(src)).toEqual([]);
  });
});

describe('homepage', () => {
  it('leads with consulting', () => {
    const src = read('page.tsx');
    expect(src).toMatch(/title: { absolute: 'RAVEN — Bank Technology Consulting[^']*' }/);
    expect(src).toContain("'ProfessionalService'");
    expect(src).toContain('founderJsonLd()');
    expect(src).toMatch(/SERVICES.map/);
    expect(src).toMatch(/ENGAGEMENT_STEPS.map/);
    for (const gone of [
      'Three steps. No new workflows.',
      'Everything you need for the loan file.',
      'Live in your existing stack. In a week or less.',
      'Borrower verification software for community banks',
    ])
      expect(src).not.toContain(gone);
    expect(src).toContain('Research we publish from FDIC filings');
    expect(src).toContain('href="/services"');
    expect(copyGuard(src)).toEqual([]);
  });
});

describe('site-wide positioning', () => {
  it('default metadata and share image use the new positioning', () => {
    for (const rel of ['app/layout.tsx', 'app/opengraph-image.tsx', 'app/og-default.ts']) {
      const src = readSrc(rel);
      expect(src, rel).not.toMatch(/Borrower Verification for Community Banks|Borrower verification for community banks/);
      expect(src, rel).toMatch(/Bank Technology Consulting|bank technology consulting/i);
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

  it('glossary no longer calls RAVEN only a software product', () => {
    expect(read('glossary/glossary-data.ts')).not.toMatch(/RAVEN is (borrower )?verification software/);
  });
});

describe('AI assistant sources', () => {
  it('llms.txt describes the consulting practice and lists services', () => {
    for (const txt of [buildLlmsTxt(), buildLlmsFullTxt()]) {
      expect(txt).toMatch(/bank technology consulting/i);
      for (const v of ['Isaac Welch', 'Upstart', 'Affirm']) expect(txt).toContain(v);
      for (const s of SERVICES) expect(txt).toContain(`https://reportraven.tech/services/${s.slug}`);
      expect(txt).toMatch(/Not affiliated with: RavenPack/);
      expect(copyGuard(txt)).toEqual([]);
    }
  });

  it('ai-info matches', () => {
    const src = read('ai-info/page.tsx');
    expect(src).toMatch(/bank technology consulting/i);
    expect(src).not.toMatch(/Category: borrower verification and digital account opening software/);
    expect(src).toContain('href="/services"');
  });
});

describe('review fixes', () => {
  const claimSources = () => [
    JSON.stringify([SERVICES, FOUNDER]),
    buildLlmsFullTxt(),
    read('page.tsx'),
    read('ai-info/page.tsx'),
    read('about/page.tsx'),
  ];

  it('makes no false independence claims (RAVEN software uses Plaid and Socure)', () => {
    for (const src of claimSources())
      expect(src).not.toMatch(/no commercial relationship|independent of all of them|not a vendor with something to sell|does not resell vendors|paid by the bank, not by vendors/i);
  });

  it('discloses that its own software is never a condition of an engagement', () => {
    expect(buildLlmsTxt()).toMatch(/never a condition/i);
    expect(JSON.stringify(getService('new-bank-launch'))).toMatch(/never a condition/i);
    expect(JSON.stringify(getService('technology-integration'))).toMatch(/never a condition/i);
  });

  it('bio stays high level: no timing or implied build claims', () => {
    const bio = FOUNDER.bio.join(' ');
    expect(bio).not.toMatch(/Since then|a core, an origination system/);
    const integ = JSON.stringify(getService('technology-integration'));
    expect(integ).not.toMatch(/traditional community bank cores|to and from the core/);
  });

  it('mobile nav offers Book a call in every shell', () => {
    for (const f of ['site-shell.tsx', 'blog/layout.tsx', 'page.tsx'])
      expect(read(f), f).toMatch(/<CalendlyButton[^>]*-mobile"[^>]*label="Book a call"|<CalendlyButton[^>]*label="Book a call"[^>]*-mobile"/);
  });

  it('roi modal uses Book a call', () => {
    expect(read('roi/roi-client.tsx')).not.toMatch(OLD_CTA);
  });

  it('de novo articles point to the new-bank service', () => {
    const src = read('blog/[slug]/page.tsx');
    expect(src).not.toContain('RAVEN gives de novo banks source-verified onboarding');
    expect(src).toContain('/services/new-bank-launch');
  });

  it('sitemap keeps every glossary URL', async () => {
    noFdic();
    const urls = new Set((await sitemap()).map((e) => e.url));
    for (const t of GLOSSARY_TERMS) expect(urls.has(`https://reportraven.tech/glossary/${t.slug}`), t.slug).toBe(true);
  });
});
