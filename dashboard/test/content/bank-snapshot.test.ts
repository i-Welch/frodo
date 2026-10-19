import { describe, it, expect } from 'vitest';
import {
  bankSlug,
  certFromParam,
  comparePeers,
  formatMetric,
  median,
  nearestBySize,
  quarterLabel,
  stateFromSlug,
  stateSlug,
  topBanks,
  type Financials,
} from '../../src/app/(marketing)/bank-snapshot/peer-data';
import { auditForCert } from '../../src/app/(whitelabel)/_config/audit-data';
import { bankFaqs } from '../../src/app/(marketing)/bank-snapshot/bank-faq';

const row = (cert: number, over: Partial<Financials> = {}): Financials => ({
  CERT: cert,
  REPDTE: '20260630',
  ASSET: 1_000_000,
  DEP: 800_000,
  LNLSNET: 600_000,
  ROA: 1,
  NIMY: 3.5,
  EEFFR: 65,
  NUMEMP: 200,
  ...over,
});

describe('comparePeers', () => {
  const bank = row(1, { ROA: 1.5, EEFFR: 55 });
  const peers = [bank, row(2, { ROA: 0.8, EEFFR: 70 }), row(3, { ROA: 1.0, EEFFR: 60 }), row(4, { ROA: 1.2, EEFFR: 50 })];
  const metrics = comparePeers(bank, peers);
  const get = (key: string) => metrics.find((m) => m.key === key)!;

  it('takes the median of the peers, excluding the bank itself', () => {
    expect(get('roa').peerMedian).toBe(1.0);
    expect(get('efficiency').peerMedian).toBe(60);
  });

  it('ranks lower efficiency ratios as better', () => {
    expect(get('roa').betterThanPct).toBe(100);
    expect(get('efficiency').betterThanPct).toBe(67);
  });

  it('leaves neutral measures unranked', () => {
    expect(get('loan-to-deposit').bank).toBe(75);
    expect(get('loan-to-deposit').betterThanPct).toBeUndefined();
  });

  it('drops measures a bank cannot report', () => {
    expect(comparePeers(row(9, { NUMEMP: 0 }), peers).some((m) => m.key === 'assets-per-employee')).toBe(false);
  });
});

describe('helpers', () => {
  it('picks the peers nearest in assets, excluding the bank', () => {
    const peers = [{ CERT: 1, ASSET: 500 }, { CERT: 2, ASSET: 900 }, { CERT: 3, ASSET: 480 }, { CERT: 4, ASSET: 100 }];
    expect(nearestBySize({ CERT: 1, ASSET: 500 }, peers, 2)).toEqual([3, 2]);
  });

  it('median handles even counts and ignores non-numbers', () => {
    expect(median([3, 1, 2, 4])).toBe(2.5);
    expect(median([NaN, 5])).toBe(5);
    expect(median([])).toBeNaN();
  });

  it('builds URL slugs and reads the cert back', () => {
    expect(bankSlug('First-Citizens Bank & Trust Company')).toBe('first-citizens-bank-and-trust-company');
    expect(certFromParam('2102-the-conway-national-bank')).toBe(2102);
    expect(certFromParam('2102')).toBe(2102);
    expect(certFromParam('conway')).toBeUndefined();
  });

  it('formats quarters and metrics', () => {
    expect(quarterLabel('20260630')).toBe('Q2 2026');
    expect(formatMetric(1.234, 'pct')).toBe('1.23%');
    expect(formatMetric(8_050_000, 'money')).toBe('$8.1M');
  });

  it('finds a published audit by the FDIC cert its sources cite', () => {
    expect(auditForCert(15085)?.slug).toBe('arthur-state-bank');
    expect(auditForCert(1508)).toBeUndefined();
  });
});

describe('state rankings', () => {
  const bank = (cert: number, assets: number, roa: number, efficiency: number) => ({
    cert, name: `Bank ${cert}`, city: 'X', assets, roa, nim: 3, efficiency, loanToDeposit: 80, community: cert !== 5,
  });

  it('ranks ROA high to low and efficiency low to high, skipping tiny banks', () => {
    const banks = [bank(1, 500_000, 1.1, 60), bank(2, 50_000, 3.0, 20), bank(3, 900_000, 1.4, 70), bank(4, 200_000, 0.9, 0), bank(5, 800_000, 9, 10)];
    expect(topBanks(banks, 'roa').map((b) => b.cert)).toEqual([3, 1, 4]);
    expect(topBanks(banks, 'efficiency').map((b) => b.cert)).toEqual([1, 3]);
  });

  it('round-trips state slugs', () => {
    expect(stateSlug('SC')).toBe('south-carolina');
    expect(stateFromSlug('district-of-columbia')).toBe('DC');
    expect(stateFromSlug('narnia')).toBeUndefined();
  });
});

describe('bank FAQs', () => {
  it('answers from the report figures without em dashes', () => {
    const report = {
      institution: { NAME: 'Example Bank', CITY: 'Conway', STALP: 'SC', ASSET: 2_000_000, CERT: 1, OFFICES: 16, ESTYMD: '01/01/1914' },
      quarter: 'Q2 2026',
      repdte: '20260630',
      peerCount: 11,
      peerScope: 'SC banks with half to twice its assets',
      metrics: comparePeers(row(1, { ROA: 1.5 }), [row(1), row(2, { ROA: 1 }), row(3, { ROA: 1.2 })]),
      loanGrowthPct: 3.6,
      depositGrowthPct: -1.2,
      closestPeers: [],
    };
    const faqs = bankFaqs(report);
    expect(faqs[0].a).toBe('Example Bank, established in 1914, is headquartered in Conway, SC. It reported $2.00B in total assets in its Q2 2026 FDIC call report and operates 16 offices.');
    expect(faqs.find((f) => f.q.includes('return on assets'))?.a).toContain('ahead of 100% of them');
    expect(faqs.at(-1)?.a).toBe('Net loans grew 3.6% over the year to Q2 2026, while deposits shrank 1.2%.');
    expect(faqs.map((f) => f.a).join(' ')).not.toContain('—');
  });
});
