import { describe, it, expect } from 'vitest';
import {
  bankSlug,
  certFromParam,
  comparePeers,
  formatMetric,
  median,
  quarterLabel,
  type Financials,
} from '../../src/app/(marketing)/bank-snapshot/peer-data';
import { auditForCert } from '../../src/app/(whitelabel)/_config/audit-data';

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
