import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Financials, Institution } from '../../src/app/(marketing)/bank-snapshot/peer-data';

const fin = (CERT: number, STALP: string, overrides: Partial<Financials> = {}): Financials => ({
  CERT, STALP, REPDTE: '20260630', ASSET: 1_000_000, DEP: 800_000, LNLSNET: 600_000,
  ROA: 1, NIMY: 3, EEFFR: 60, NUMEMP: 100, ...overrides,
});
const inst = (CERT: number, STALP: string): Institution => ({ CERT, STALP, NAME: `Bank ${CERT}`, CITY: 'Town', ASSET: 1_000_000, CB: '1' });

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

async function setup(institutions: Institution[], current: Financials[], prior: Financials[] = [], history: Financials[] = []) {
  const fetcher = vi.fn<typeof fetch>(async (url) => {
    const u = new URL(String(url));
    const filters = u.searchParams.get('filters');
    const rows = u.pathname.endsWith('/institutions') ? institutions :
      !filters ? [{ REPDTE: '20260630' }] :
      filters.startsWith('CERT:') ? history :
      filters === 'REPDTE:20250630' ? prior : current;
    return Response.json({ data: rows.map((data) => ({ data })), meta: { total: rows.length } });
  });
  vi.stubGlobal('fetch', fetcher);
  const api = await import('../../src/app/(marketing)/bank-snapshot/peer-data');
  return { api, fetcher };
}

describe('shared FDIC bank data', () => {
  it('renders Oregon rankings without passing OR as an FDIC search operator', async () => {
    const { api, fetcher } = await setup([inst(1, 'OR'), inst(2, 'SC')], [fin(1, 'OR'), fin(2, 'SC')]);
    const result = await api.stateRankings('OR');
    expect(result?.stateName).toBe('Oregon');
    expect(result?.banks.map((b) => b.cert)).toEqual([1]);
    expect(fetcher.mock.calls.every(([url]) => !new URL(String(url)).searchParams.get('filters')?.includes('STALP:'))).toBe(true);
  });

  it('shares four upstream queries across bank pages, rankings and sitemap', async () => {
    const current = Array.from({ length: 11 }, (_, n) => fin(n + 1, n < 10 ? 'SC' : 'OR'));
    const { api, fetcher } = await setup(current.map((f) => inst(f.CERT, f.STALP)), current,
      [fin(1, 'SC', { REPDTE: '20250630', LNLSNET: 500_000, DEP: 400_000 })]);
    const [a, b] = await Promise.all([api.peerReport(1), api.peerReport(2), api.stateRankings('OR'), api.sitemapInstitutions()]);
    expect(a?.peerCount).toBe(9);
    expect(a?.peerScope).toContain('SC banks');
    expect(a?.loanGrowthPct).toBe(20);
    expect(a?.depositGrowthPct).toBe(100);
    expect(b?.loanGrowthPct).toBeUndefined();
    expect(a?.closestPeers).toHaveLength(6);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it('falls back to national peers and excludes out-of-band banks', async () => {
    const current = [fin(1, 'OR'), fin(2, 'SC'), fin(3, 'SC', { ASSET: 3_000_000 })];
    const { api } = await setup(current.map((f) => inst(f.CERT, f.STALP)), current);
    const report = await api.peerReport(1);
    expect(report?.peerCount).toBe(1);
    expect(report?.peerScope).toContain('U.S. banks');
    expect(report?.closestPeers.map((p) => p.CERT)).toEqual([2]);
  });

  it('uses a bank\'s actual older filing when the newest quarter is incomplete', async () => {
    const { api } = await setup([inst(1, 'OR')], [fin(2, 'SC')], [], [fin(1, 'OR', { REPDTE: '20260331' })]);
    expect((await api.peerReport(1))?.quarter).toBe('Q1 2026');
  });

  it('returns undefined for inactive banks and invalid state codes', async () => {
    const { api, fetcher } = await setup([], []);
    expect(await api.peerReport(999)).toBeUndefined();
    expect(await api.stateRankings('INVALID')).toBeUndefined();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
