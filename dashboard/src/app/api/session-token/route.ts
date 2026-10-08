import { NextResponse } from 'next/server';
import { getApiToken } from '@/lib/auth/token';

export const dynamic = 'force-dynamic';

/** Returns the signed-in user's Neon Auth JWT so client components can call the RAVEN API. */
export async function GET() {
  const token = await getApiToken();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ token }, { headers: { 'Cache-Control': 'no-store' } });
}
