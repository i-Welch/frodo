import { createNeonAuth } from '@neondatabase/auth/next/server';
import { randomBytes } from 'node:crypto';

export const auth = createNeonAuth({
  // Vercel builds route modules before deployment variables are available.
  // This inert endpoint permits builds; runtime sign-in requires real values.
  baseUrl: process.env.NEON_AUTH_BASE_URL ?? 'https://auth-unconfigured.invalid/neondb/auth',
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET ?? randomBytes(32).toString('base64') },
});
