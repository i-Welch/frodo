const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Fetch wrapper for the RAVEN API.
 * In the browser, attaches the Clerk session token as a Bearer token.
 * On the server, uses the token passed explicitly.
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

  const res = await fetch(`${API_URL}${path}`, {
    method: options?.method ?? 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
