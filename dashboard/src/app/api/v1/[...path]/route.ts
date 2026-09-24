import { getDashboardToken } from '@/lib/auth/dashboard-token';

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function forward(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  // Borrower journeys and lead capture retain their existing public API flow.
  // The backend enforces tokens or API keys on protected white-label endpoints.
  const publicRoute = path[0] === 'wl' || path[0] === 'interest';
  const token = publicRoute ? null : await getDashboardToken();
  if (!publicRoute && !token) return Response.json({ message: 'Select an organization to access the dashboard' }, { status: 401 });

  const url = new URL(request.url);
  const incomingAuthorization = request.headers.get('authorization');
  const upstream = await fetch(`${API_URL}/api/v1/${path.map(encodeURIComponent).join('/')}${url.search}`, {
    method: request.method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : publicRoute && incomingAuthorization ? { Authorization: incomingAuthorization } : {}),
      ...(request.headers.get('content-type') ? { 'Content-Type': request.headers.get('content-type')! } : {}),
    },
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
    cache: 'no-store',
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
