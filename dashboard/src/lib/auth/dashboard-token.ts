import { SignJWT } from 'jose';
import { auth } from './server';

/** Resolve the active Neon organization on every request before issuing API access. */
export async function getDashboardToken(): Promise<string | null> {
  const secret = process.env.RAVEN_DASHBOARD_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('RAVEN_DASHBOARD_TOKEN_SECRET must be at least 32 characters');
  }

  const { data: session, error: sessionError } = await auth.getSession();
  if (sessionError || !session?.user?.id) return null;
  const organizationId = session.session?.activeOrganizationId;
  if (!organizationId) return null;

  const { data: organizations, error: organizationError } = await auth.organization.list();
  if (organizationError || !organizations?.some((org) => org.id === organizationId)) return null;

  return new SignJWT({ organizationId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.user.id)
    .setIssuer('raven-dashboard')
    .setAudience('raven-api')
    .setIssuedAt()
    .setExpirationTime('60s')
    .sign(new TextEncoder().encode(secret));
}
