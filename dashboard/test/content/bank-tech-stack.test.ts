import { describe, it, expect } from 'vitest';
import { CATEGORIES, STACK_ROWS, STACK_UPDATED, stackFaqs } from '../../src/app/(marketing)/bank-tech-stack/stack-data';
import { AUDITS } from '../../src/app/(whitelabel)/_config/audit-data';
import { getRoiBank } from '../../src/app/(marketing)/roi/roi-data';

// Same set as SITEMAP_HOLD in src/app/sitemap.ts: audits not ready to surface.
const AUDIT_HOLD = new Set(['oconee-state-bank', 'ameris-bank', 'united-bank']);

// The tracker is derived from the audits; these keep the two from drifting.

describe('Bank Tech Stack data', () => {
  const slugs = new Set(AUDITS.map((a) => a.slug));

  it('has rows, each backed by an audit', () => {
    expect(STACK_ROWS.length).toBeGreaterThan(10);
    for (const r of STACK_ROWS) expect(slugs.has(r.slug), r.slug).toBe(true);
    expect(new Set(STACK_ROWS.map((r) => r.slug)).size).toBe(STACK_ROWS.length);
  });

  it('leaves out audits on hold and links the rest', () => {
    for (const r of STACK_ROWS) {
      expect(AUDIT_HOLD.has(r.slug), `${r.slug} is on hold`).toBe(false);
      expect(r.audit, r.slug).toBe(true);
      // /audit/<slug> only exists when the bank has an ROI model.
      expect(getRoiBank(r.slug), `${r.slug} has no ROI model`).toBeTruthy();
    }
  });

  it('names a vendor only when the audit text mentions it', () => {
    for (const r of STACK_ROWS) {
      const audit = JSON.stringify(AUDITS.find((a) => a.slug === r.slug)).toLowerCase();
      for (const c of CATEGORIES) {
        const v = r[c.key];
        if (!v) continue;
        // First word of the vendor ("Banno (Jack Henry)" -> "banno", "ICE Encompass" -> "encompass"
        // or a portal domain that identifies it).
        const key = v.replace(/^ICE |^Finastra /, '').split(/[ (]/)[0].toLowerCase();
        const domains: Record<string, string[]> = {
          mortgagebot: ['mortgagewebcenter', 'loanwebcenter', 'mortgagebot'],
          encompass: ['mymortgage-online', 'encompass', 'ice mortgage technology'],
          meridianlink: ['meridianlink', 'loanspq'],
          fiserv: ['fiserv', 'secureinternetbank'],
        };
        const needles = domains[key] ?? [key];
        expect(needles.some((n) => audit.includes(n)), `${r.slug} ${c.key} ${v}`).toBe(true);
      }
    }
  });

  it('has a valid date, no em dashes, and FAQ answers', () => {
    expect(STACK_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(JSON.stringify(STACK_ROWS)).not.toContain('—');
    expect(stackFaqs().length).toBeGreaterThan(0);
  });
  it('keeps the loan origination system glossary counts in sync with the tracker', async () => {
    const { GLOSSARY_TERMS } = await import('../../src/app/(marketing)/glossary/glossary-data');
    const term = GLOSSARY_TERMS.find((t) => t.slug === 'loan-origination-system');
    expect(term).toBeDefined();
    const text = JSON.stringify(term);
    const mort = STACK_ROWS.filter((r) => r.mortgage);
    const enc = mort.filter((r) => /Encompass/.test(r.mortgage!)).length;
    const mbot = mort.filter((r) => /Mortgagebot/.test(r.mortgage!)).length;
    expect(text).toContain(`${enc} of the ${mort.length} mortgage stacks`);
    expect(text).toContain(`Finastra Mortgagebot in ${mbot}`);
    expect(text).toContain(`Of ${STACK_ROWS.filter((r) => r.consumerLending).length} identified consumer loan applications`);
    expect(text).toContain(`behind ${STACK_ROWS.length} Southeast banks`);
  });
});
