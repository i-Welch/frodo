import { describe, it, expect } from 'vitest';
import { copyGuard } from './copy-guard';
import { FOUNDER, founderJsonLd } from '../../src/app/(marketing)/founder';
import { SERVICES, ENGAGEMENT_STEPS, getService } from '../../src/app/(marketing)/services/services-data';
import { SOLUTIONS } from '../../src/app/(marketing)/solutions/solutions-data';
import { GLOSSARY_TERMS } from '../../src/app/(marketing)/glossary/glossary-data';
import { BLOG_SLUGS } from '../../src/app/(marketing)/blog/published';

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
