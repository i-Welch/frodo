import { describe, it, expect } from 'vitest';
import { INSTITUTIONS } from '../../src/app/(marketing)/scorecards/institutions';
import { PRODUCT_TYPES } from '../../src/app/(marketing)/scorecards/products';
import { WEIGHTS } from '../../src/app/(marketing)/scorecards/weights';
import { rankedRows, rowsForView, scoreRow } from '../../src/app/(marketing)/scorecards/scoring';
import { scorecardFaqs } from '../../src/app/(marketing)/scorecards/faq';
import { scorecardCsv } from '../../src/app/(marketing)/scorecards/csv';
import { feeScore, rateScore, reachableApy } from '../../src/app/(marketing)/scorecards/savings';
import { NATIONAL_KINDS, SCORECARD_STATES, type SavingsFacts } from '../../src/app/(marketing)/scorecards/types';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const today = new Date().toISOString().slice(0, 10);
const EM_DASH = /—/;

function strings(v: unknown): string[] {
  if (typeof v === 'string') return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === 'object') return Object.values(v).flatMap(strings);
  return [];
}

describe('scorecard institutions', () => {
  it('have unique slugs, a branch count per state and a source for bank branches', () => {
    expect(new Set(INSTITUTIONS.map((i) => i.slug)).size).toBe(INSTITUTIONS.length);
    for (const i of INSTITUTIONS) {
      for (const s of SCORECARD_STATES) expect(Number.isInteger(i.branches[s]) && i.branches[s] >= 0, `${i.slug} ${s}`).toBe(true);
      expect(i.branchesAsOf, i.slug).toMatch(DATE);
      if (Object.values(i.branches).some((n) => n > 0)) expect(i.branchesSource, `${i.slug} branch source`).toMatch(/^https:\/\//);
      if (i.kind === 'credit-union') expect(i.membership, `${i.slug} membership`).toBeTruthy();
    }
  });

  it('cover the big five and each state has local institutions', () => {
    for (const slug of ['chase', 'bank-of-america', 'wells-fargo', 'citi', 'us-bank']) {
      expect(INSTITUTIONS.find((i) => i.slug === slug)?.kind, slug).toBe('big-bank');
    }
    for (const s of SCORECARD_STATES) {
      const local = INSTITUTIONS.filter((i) => !NATIONAL_KINDS.includes(i.kind) && i.hqState === s);
      expect(local.length, `${s} local institutions`).toBeGreaterThanOrEqual(5);
    }
  });

  it('have no em dashes', () => {
    for (const i of INSTITUTIONS) for (const t of strings(i)) expect(EM_DASH.test(t), `${i.slug}: ${t}`).toBe(false);
  });
});

describe.each(PRODUCT_TYPES.map((p) => [p.slug, p] as const))('%s scorecard', (_slug, type) => {
  const institutions = new Set(INSTITUTIONS.map((i) => i.slug));

  it('has weights for every criterion that sum to 1', () => {
    const w = WEIGHTS[type.slug];
    expect(w).toBeTruthy();
    for (const c of type.criteria) expect(w[c.key], c.key).toBeGreaterThan(0);
    expect(Object.keys(w).sort()).toEqual(type.criteria.map((c) => c.key).sort());
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
  });

  it('every row is dated, sourced and points at a known institution', () => {
    expect(type.updated).toMatch(DATE);
    expect(new Set(type.rows.map((r) => r.institution)).size).toBe(type.rows.length);
    for (const r of type.rows) {
      expect(institutions.has(r.institution), r.institution).toBe(true);
      expect(r.asOf, r.institution).toMatch(DATE);
      expect(r.asOf <= today, `${r.institution} asOf in the future`).toBe(true);
      expect(r.url, r.institution).toMatch(/^https:\/\//);
      expect(r.sources.length, `${r.institution} sources`).toBeGreaterThan(0);
      for (const s of r.sources) {
        expect(s.url, r.institution).toMatch(/^https:\/\//);
        expect(s.what.length, r.institution).toBeGreaterThan(2);
      }
      for (const t of strings(r)) expect(EM_DASH.test(t), `${r.institution}: ${t}`).toBe(false);
    }
  });

  it('scores every row 0 to 10 on every view', () => {
    for (const view of ['all', ...SCORECARD_STATES] as const) {
      for (const r of rowsForView(type, view)) {
        const s = scoreRow(type, r, view);
        for (const [k, v] of Object.entries(s.scores)) if (v !== null) expect(v >= 0 && v <= 10, `${r.institution} ${k} ${v}`).toBe(true);
        if (s.overall !== null) expect(s.overall >= 0 && s.overall <= 10).toBe(true);
        else expect(s.unranked).toMatch(/^Not ranked/);
      }
    }
  });

  it('ranks each state page with national rows plus local ones', () => {
    for (const s of SCORECARD_STATES) {
      const rows = rankedRows(type, s);
      const ranked = rows.filter((r) => r.overall !== null);
      expect(ranked.length, s).toBeGreaterThanOrEqual(15);
      expect(rows.some((r) => !NATIONAL_KINDS.includes(r.inst.kind)), `${s} has local rows`).toBe(true);
      for (let i = 1; i < ranked.length; i++) expect(ranked[i].overall! <= ranked[i - 1].overall!).toBe(true);
    }
  });

  it('FAQs and CSV are generated and never mention weights', () => {
    for (const view of ['all', ...SCORECARD_STATES] as const) {
      const faqs = scorecardFaqs(type, view);
      expect(faqs.length).toBeGreaterThanOrEqual(4);
      for (const f of faqs) {
        expect(EM_DASH.test(f.q + f.a)).toBe(false);
        expect(/weight|\d+%\s+of the (overall|score)/i.test(f.a), f.a).toBe(false);
      }
    }
    const csv = scorecardCsv(type);
    expect(csv.split('\n').filter(Boolean).length).toBe(type.rows.length + 1);
    expect(/weight/i.test(csv)).toBe(false);
  });

  it('lists checked-but-unpublished institutions with a source, outside the scored rows', () => {
    const scored = new Set(INSTITUTIONS.map((i) => i.name.toLowerCase()));
    for (const u of type.unpublished) {
      expect(u.url, u.name).toMatch(/^https:\/\//);
      expect(u.checked, u.name).toMatch(DATE);
      expect(SCORECARD_STATES as readonly string[]).toContain(u.state);
      expect(NATIONAL_KINDS.includes(u.kind), u.name).toBe(false);
      expect(u.note.length, u.name).toBeGreaterThan(10);
      expect(EM_DASH.test(u.name + u.note), u.name).toBe(false);
      expect(scored.has(u.name.toLowerCase()), `${u.name} is also scored`).toBe(false);
    }
  });

  it('criterion descriptions never state weights', () => {
    for (const c of type.criteria) expect(/weight|\d+\s?%/i.test(c.description), c.description).toBe(false);
  });
});

describe('savings rubric', () => {
  const base: SavingsFacts = {
    apy: 4,
    conditionalApy: null,
    condition: null,
    conditionMonthlyCost: 0,
    noRateWithoutCondition: false,
    apyNote: '',
    rateAsOf: null,
    monthlyFee: 0,
    waive: 'none-needed',
    waiveBalance: null,
    feeWaiver: null,
    minOpen: 0,
    minBalanceForApy: null,
    withdrawalsPerMonth: 'unlimited',
    excessWithdrawalFee: null,
    withdrawalLimit: null,
    externalTransfers: true,
    instantTransfers: true,
    transferNotes: null,
    atmAccess: true,
    subAccounts: true,
    jointAccounts: true,
    cashDeposit: true,
  };

  it('nets a paid subscription out of the reachable rate', () => {
    const robinhoodLike = { ...base, apy: null, noRateWithoutCondition: true, conditionalApy: 3.6, conditionMonthlyCost: 5 };
    expect(reachableApy(robinhoodLike)).toBeCloseTo(3.0, 6);
    expect(rateScore(robinhoodLike)).toBeCloseTo(0.3 * 7.5, 6);
  });

  it('leaves an unpublished rate unscored', () => {
    expect(rateScore({ ...base, apy: null })).toBeNull();
  });

  it('scores fees by how hard they are to avoid', () => {
    expect(feeScore(base)).toBe(10);
    expect(feeScore({ ...base, monthlyFee: 5, waive: 'balance', waiveBalance: 300 })).toBe(8);
    expect(feeScore({ ...base, monthlyFee: 12, waive: 'balance', waiveBalance: 3500 })).toBe(5);
    expect(feeScore({ ...base, monthlyFee: 5, waive: 'not-waivable' })).toBe(2);
    expect(feeScore({ ...base, monthlyFee: null })).toBeNull();
  });
});
