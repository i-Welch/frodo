'use client';

import { createAuthClient } from '@neondatabase/auth/next';

export const authClient = createAuthClient();

/** Fetch a JWT for calling the RAVEN API from the browser. */
export async function getApiToken(): Promise<string | null> {
  const res = await fetch('/api/session-token', { cache: 'no-store' });
  if (!res.ok) return null;
  const body = (await res.json()) as { token?: string };
  return body.token ?? null;
}
