import 'server-only';
import { cookies } from 'next/headers';
import { NEON_AUTH_SESSION_COOKIE_NAME } from '@neondatabase/auth/server';

/**
 * Returns a Neon Auth JWT for the current request's session, to forward to the
 * RAVEN API as a Bearer token. Null when signed out. The API verifies it
 * against the project's JWKS and maps the user to a tenant.
 */
export async function getApiToken(): Promise<string | null> {
  const base = process.env.NEON_AUTH_BASE_URL;
  if (!base) return null;

  const session = (await cookies()).get(NEON_AUTH_SESSION_COOKIE_NAME)?.value;
  if (!session) return null;

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/token`, {
      headers: {
        cookie: `${NEON_AUTH_SESSION_COOKIE_NAME}=${encodeURIComponent(session)}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { token?: string };
    return body.token ?? null;
  } catch {
    return null;
  }
}
