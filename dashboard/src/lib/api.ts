/**
 * Fetch wrapper for the RAVEN API.
 *
 * The API runs inside this Next.js app (src/server). On the server we call it
 * in-process; in the browser we use same-origin relative URLs. A Neon Auth JWT
 * is attached as a Bearer token when provided.
 */
export async function api<T>(
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    token?: string;
  },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const init: RequestInit = {
    method: options?.method ?? 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  };

  let res: Response;
  if (typeof window === 'undefined') {
    const { app } = await import('@/server/app');
    res = await app.fetch(new Request(`http://internal${path}`, init));
  } else {
    res = await fetch(path, init);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
