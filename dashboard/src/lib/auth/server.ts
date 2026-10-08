import { createNeonAuth } from '@neondatabase/auth/next/server';

type NeonAuth = ReturnType<typeof createNeonAuth>;

let instance: NeonAuth | null = null;

/**
 * Server-side Neon Auth instance (route handler, middleware, server components).
 * Created lazily so `next build` works without runtime secrets.
 *
 * Env:
 * - NEON_AUTH_BASE_URL       e.g. https://ep-xxx.neonauth.<region>.aws.neon.tech/neondb/auth
 * - NEON_AUTH_COOKIE_SECRET  at least 32 characters
 */
export function getAuth(): NeonAuth {
  instance ??= createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: {
      secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    },
  });
  return instance;
}
