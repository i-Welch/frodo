import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { describeInstitution } from '../../src/server/messaging/lead-enrichment';

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
