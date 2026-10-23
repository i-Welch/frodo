import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The ROI audit and digital-presence audit are now one combined page at
  // /audit/<slug>; keep old /roi/<slug> links working.
  async redirects() {
    return [
      {
        source: '/roi/:slug',
        destination: '/audit/:slug',
        permanent: true,
      },
      // No pricing page yet; visitors who guess the URL land where they can book a demo.
      {
        source: '/pricing',
        destination: '/',
        permanent: false,
      },
    ];
  },

  // The Elysia API (src/server) runs inside Next route handlers. Keep these
  // out of the bundle: pino spawns worker threads, pg/googleapis are heavy.
  serverExternalPackages: ['pino', 'pg', 'googleapis', 'puppeteer-core'],

  // Legal HTML is read from disk at runtime by the /legal routes.
  outputFileTracingIncludes: {
    '/legal/[[...slugs]]': ['./legal/**/*'],
  },
};

export default nextConfig;
