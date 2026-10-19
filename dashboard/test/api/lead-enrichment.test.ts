import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { bankSnapshot, describeInstitution, toSnapshot } from '../../src/server/messaging/lead-enrichment';

const optimum = { NAME: 'OptimumBank', CITY: 'Fort Lauderdale', STALP: 'FL', ASSET: 1386526, CERT: 35430, WEBADDR: 'www.optimumbank.com' };

function fdicResponse(rows: object[]) {
  return new Response(JSON.stringify({ data: rows.map((data) => ({ data })) }), { status: 200 });
}

describe('lead enrichment', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    process.env.LEAD_ENRICHMENT = 'on';
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    process.env.LEAD_ENRICHMENT = 'off';
    vi.unstubAllGlobals();
  });

  it('matches a bank by the email domain first', async () => {
    fetchMock.mockResolvedValueOnce(fdicResponse([optimum]));
    const lines = await describeInstitution({ email: 'ceo@optimumbank.com', bank: 'Optimum' });
    expect(lines).toEqual(['FDIC match (email domain): OptimumBank, Fort Lauderdale, FL: $1.39B assets, FDIC cert 35430']);
    expect(decodeURIComponent(fetchMock.mock.calls[0][0])).toContain('WEBADDR:*optimumbank*');
  });

  it('falls back to a name search for free-mail addresses', async () => {
    fetchMock.mockResolvedValueOnce(fdicResponse([optimum, { ...optimum, NAME: 'Other Bank', ASSET: 250000, CERT: 1 }]));
    const lines = await describeInstitution({ email: 'someone@gmail.com', bank: 'OptimumBank' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(lines[0]).toBe('Possible FDIC matches (by name):');
    expect(lines[2]).toContain('Other Bank, Fort Lauderdale, FL: $250M assets');
  });

  it('points credit unions to NCUA when FDIC has nothing', async () => {
    fetchMock.mockResolvedValue(fdicResponse([]));
    const lines = await describeInstitution({ email: 'a@gmail.com', bank: 'Palmetto Citizens Federal Credit Union' });
    expect(lines[0]).toContain('NCUA');
  });

  it('never throws when the FDIC API fails', async () => {
    fetchMock.mockRejectedValue(new Error('timeout'));
    expect(await describeInstitution({ email: 'ceo@examplebank.com', bank: 'Example Bank' })).toEqual([]);
  });

  it('is skipped when disabled', async () => {
    process.env.LEAD_ENRICHMENT = 'off';
    expect(await describeInstitution({ email: 'ceo@optimumbank.com' })).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('bank snapshot', () => {
  const fetchMock = vi.fn();
  const report = (REPDTE: string, LNLSNET: number) => ({ REPDTE, ASSET: 1386526, DEP: 1200000, LNLSNET, ROA: 1.234 });

  beforeEach(() => {
    process.env.LEAD_ENRICHMENT = 'on';
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    process.env.LEAD_ENRICHMENT = 'off';
    vi.unstubAllGlobals();
  });

  it('builds the latest quarter with year-over-year loan growth', () => {
    const snap = toSnapshot(optimum, [report('20260630', 1100000), report('20260331', 1050000), report('20250630', 1000000)]);
    expect(snap).toEqual({
      name: 'OptimumBank',
      city: 'Fort Lauderdale',
      state: 'FL',
      cert: 35430,
      quarter: 'Q2 2026',
      assets: '$1.39B',
      deposits: '$1.20B',
      loans: '$1.10B',
      loanGrowthPct: 10,
      roaPct: 1.23,
    });
  });

  it('omits loan growth without a year-ago report', () => {
    expect(toSnapshot(optimum, [report('20260630', 1100000)])?.loanGrowthPct).toBeUndefined();
  });

  it('only shows an ambiguous name search when there is one match', async () => {
    fetchMock.mockResolvedValueOnce(fdicResponse([optimum, { ...optimum, NAME: 'Other Bank', CERT: 1 }]));
    expect(await bankSnapshot({ email: 'someone@gmail.com', bank: 'Optimum' })).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fetches financials for a domain match', async () => {
    fetchMock.mockResolvedValueOnce(fdicResponse([optimum])).mockResolvedValueOnce(fdicResponse([report('20260630', 1100000)]));
    const snap = await bankSnapshot({ email: 'ceo@optimumbank.com' });
    expect(snap?.name).toBe('OptimumBank');
    expect(decodeURIComponent(fetchMock.mock.calls[1][0])).toContain('CERT:35430');
  });

  it('uses the cert picked from the autocomplete before guessing', async () => {
    fetchMock.mockResolvedValueOnce(fdicResponse([optimum])).mockResolvedValueOnce(fdicResponse([report('20260630', 1100000)]));
    const snap = await bankSnapshot({ email: 'someone@gmail.com', bank: 'Optimum', cert: 35430 });
    expect(snap?.cert).toBe(35430);
    expect(decodeURIComponent(fetchMock.mock.calls[0][0])).toContain('CERT:35430+AND+ACTIVE:1');
  });

  it('is off in tests by default and never throws', async () => {
    process.env.LEAD_ENRICHMENT = 'off';
    expect(await bankSnapshot({ email: 'ceo@optimumbank.com' })).toBeUndefined();
    process.env.LEAD_ENRICHMENT = 'on';
    fetchMock.mockRejectedValue(new Error('down'));
    expect(await bankSnapshot({ email: 'ceo@optimumbank.com' })).toBeUndefined();
  });
});
