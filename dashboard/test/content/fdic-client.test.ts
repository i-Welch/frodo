import { describe, expect, it, vi } from 'vitest';
import { createFdicClient } from '../../src/app/(marketing)/bank-snapshot/fdic-client';

const response = (rows: unknown[], total = rows.length) => Response.json({ data: rows.map((data) => ({ data })), meta: { total } });
const params = { filters: 'ACTIVE:1', limit: '10000' };

describe('FDIC shared dataset requests', () => {
  it('coalesces concurrent pages and caches successful datasets for a day', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(response([{ CERT: 1 }]));
    const fdic = createFdicClient({ fetcher });
    const results = await Promise.all(Array.from({ length: 20 }, () => fdic('institutions', params)));
    expect(results.every((rows) => rows.length === 1)).toBe(true);
    expect(await fdic('institutions', params)).toEqual([{ CERT: 1 }]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][1]).toMatchObject({ next: { revalidate: 86400 } });
  });

  it('retries a transient rate limit, honoring a short Retry-After', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('', { status: 429, headers: { 'Retry-After': '2' } }))
      .mockResolvedValueOnce(response([{ CERT: 1 }]));
    const sleep = vi.fn(async () => {});
    expect(await createFdicClient({ fetcher, sleep })('institutions', params)).toEqual([{ CERT: 1 }]);
    expect(sleep).toHaveBeenCalledWith(2000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('keeps a known-good dataset during an outage and backs off repeated pages', async () => {
    let time = 0;
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response([{ CERT: 1 }]))
      .mockImplementation(async () => new Response('', { status: 429, headers: { 'Retry-After': '60' } }));
    const fdic = createFdicClient({ fetcher, now: () => time });
    await fdic('institutions', params);
    time = 86400001;
    expect(await fdic('institutions', params)).toEqual([{ CERT: 1 }]);
    expect(await fdic('institutions', params)).toEqual([{ CERT: 1 }]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    time = 8 * 86400000;
    await expect(fdic('institutions', params)).rejects.toThrow('429');
  });

  it('throws cold-cache failures and does not cache an outage as an empty result', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('', { status: 429, headers: { 'Retry-After': '60' } }))
      .mockResolvedValueOnce(response([{ CERT: 1 }]));
    const fdic = createFdicClient({ fetcher });
    await expect(fdic('institutions', params)).rejects.toThrow('429');
    expect(await fdic('institutions', params)).toEqual([{ CERT: 1 }]);
  });

  it('does not retry invalid queries or silently substitute stale data for them', async () => {
    let time = 0;
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(response([{ CERT: 1 }]))
      .mockResolvedValueOnce(new Response('', { status: 400 }));
    const sleep = vi.fn(async () => {});
    const fdic = createFdicClient({ fetcher, sleep, now: () => time });
    await fdic('institutions', params);
    time = 86400001;
    await expect(fdic('institutions', params)).rejects.toThrow('400');
    expect(sleep).not.toHaveBeenCalled();
  });

  it('paginates complete datasets but leaves a latest-quarter limit intact', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response([{ CERT: 1 }, { CERT: 2 }], 3))
      .mockResolvedValueOnce(response([{ CERT: 3 }], 3))
      .mockResolvedValueOnce(response([{ REPDTE: '20260630' }], 4000));
    const fdic = createFdicClient({ fetcher });
    expect(await fdic('institutions', params)).toHaveLength(3);
    expect(new URL(String(fetcher.mock.calls[1][0])).searchParams.get('offset')).toBe('2');
    expect(await fdic('financials', { fields: 'REPDTE', limit: '1' })).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});
