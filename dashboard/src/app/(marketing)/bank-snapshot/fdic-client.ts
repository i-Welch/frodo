const FDIC = 'https://api.fdic.gov/banks';
const DAY = 86_400_000;

class FdicError extends Error {
  constructor(message: string, readonly transient: boolean) { super(message); }
}

/** Shared daily requests, including coalescing concurrent cold-page requests. */
export function createFdicClient(options: {
  fetcher?: typeof fetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
} = {}) {
  // Resolve Next's patched fetch at request time, rather than module import time.
  const fetcher: typeof fetch = options.fetcher ?? ((...args) => fetch(...args));
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const cache = new Map<string, { rows: unknown[]; savedAt: number; retryAt?: number }>();
  const pending = new Map<string, Promise<unknown[]>>();

  async function page(path: string, params: Record<string, string>) {
    for (let attempt = 0; ; attempt++) {
      let res: Response;
      try {
        res = await fetcher(`${FDIC}/${path}?${new URLSearchParams(params)}`, {
          next: { revalidate: DAY / 1000 }, signal: AbortSignal.timeout(8000),
        });
      } catch {
        if (attempt === 0) { await sleep(1000); continue; }
        throw new FdicError(`FDIC ${path} unavailable`, true);
      }
      if (!res.ok) {
        const transient = res.status === 429 || res.status >= 500;
        const retryAfter = res.headers.get('retry-after');
        const delay = retryAfter === null ? 1000 : Math.max(0,
          Number.isFinite(Number(retryAfter)) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - now());
        // Respect a long Retry-After without tying up a page request or retrying early.
        if (transient && attempt === 0 && Number.isFinite(delay) && delay <= 2000) {
          await res.body?.cancel();
          await sleep(delay);
          continue;
        }
        throw new FdicError(`FDIC ${path} ${res.status}`, transient);
      }
      const body = await res.json() as { data?: { data: unknown }[]; meta?: { total?: number } };
      if (!Array.isArray(body.data)) throw new FdicError(`FDIC ${path} invalid response`, false);
      return { rows: body.data.map((row) => row.data), total: body.meta?.total };
    }
  }

  return async function fdic<T>(path: string, params: Record<string, string>): Promise<T[]> {
    const key = `${path}?${new URLSearchParams(params)}`;
    const saved = cache.get(key);
    if (saved && (now() - saved.savedAt < DAY || (now() < (saved.retryAt ?? 0) && now() - saved.savedAt < 7 * DAY))) return saved.rows as T[];
    const inflight = pending.get(key);
    if (inflight) return inflight as Promise<T[]>;
    const request = (async () => {
      try {
        const first = await page(path, params);
        const rows = first.rows;
        // 10,000 is the bulk query size. Paginate if the FDIC universe grows.
        if (params.limit === '10000') {
          while (first.total !== undefined && rows.length < first.total) {
            const next = await page(path, { ...params, offset: String(rows.length) });
            if (!next.rows.length) throw new FdicError(`FDIC ${path} incomplete response`, false);
            rows.push(...next.rows);
          }
        }
        cache.delete(key);
        cache.set(key, { rows, savedAt: now() });
        if (cache.size > 32) cache.delete(cache.keys().next().value!);
        return rows;
      } catch (error) {
        // An upstream outage must not turn an existing bank into a cached 404.
        // Keep the report's actual quarter/date; never synthesize financial data.
        if (error instanceof FdicError && error.transient && saved && now() - saved.savedAt < 7 * DAY) {
          saved.retryAt = now() + 60_000;
          return saved.rows;
        }
        throw error;
      } finally { pending.delete(key); }
    })();
    pending.set(key, request);
    return request as Promise<T[]>;
  };
}
