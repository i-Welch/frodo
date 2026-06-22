import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/legal(.*)',
  '/forms(.*)',
  '/blog(.*)',
  '/roi(.*)',
  '/wl(.*)',
  '/audit(.*)',
  '/api/v1/wl(.*)',
  '/sitemap.xml',
  '/robots.txt',
]);

const WL_DOMAIN = 'submit.loans';

/**
 * Host-based routing for the white-label domain.
 *
 *   <bank>.submit.loans/             -> /wl/<bank>            (default flow)
 *   <bank>.submit.loans/check-rate   -> /wl/<bank>/check-rate (rate_range)
 *   <bank>.submit.loans/apply        -> /wl/<bank>/apply      (full_application)
 *   <bank>.submit.loans/verify       -> /wl/<bank>/verify     (data_only)
 *
 * The subdomain label is the tenant slug. `chrome=0` is forced so the demo
 * banner / perspective toggle never shows on the real borrower domain (the
 * sales demo lives on reportraven.tech/wl/<slug> with chrome on). API, Next
 * internals, and assets pass through untouched (the /api proxy still applies).
 * Anything that isn't a valid journey path 404s, so only the borrower flow is
 * reachable on submit.loans. Custom bank domains (e.g. apply.bank.com) will
 * resolve via the HOST# records + Edge Config in a later step.
 */
function handleWhiteLabelHost(request: NextRequest, host: string): NextResponse | null {
  const isWlHost = host === WL_DOMAIN || host.endsWith(`.${WL_DOMAIN}`);
  if (!isWlHost) return null;

  const { pathname } = request.nextUrl;

  // Let API, Next internals, and static assets through unchanged.
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const sub = host === WL_DOMAIN ? '' : host.slice(0, -`.${WL_DOMAIN}`.length);
  if (sub === '' || sub === 'www') {
    return NextResponse.redirect('https://reportraven.tech');
  }

  const rewritten = request.nextUrl.clone();
  rewritten.pathname = `/wl/${sub}${pathname === '/' ? '' : pathname}`;
  rewritten.searchParams.set('chrome', '0');
  return NextResponse.rewrite(rewritten);
}

export default clerkMiddleware(async (auth, request) => {
  const host = (request.headers.get('host') ?? '').toLowerCase().split(':')[0];
  const wl = handleWhiteLabelHost(request, host);
  if (wl) return wl;

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
