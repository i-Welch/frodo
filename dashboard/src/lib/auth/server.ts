import { createNeonAuth } from '@neondatabase/auth/next/server';

/**
 * Server-side Neon Auth instance (route handler, middleware, server components).
 *
 * Env:
 * - NEON_AUTH_BASE_URL       e.g. https://ep-xxx.neonauth.<region>.aws.neon.tech/neondb/auth
 * - NEON_AUTH_COOKIE_SECRET  at least 32 characters
 */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
