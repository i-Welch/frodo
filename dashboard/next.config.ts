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
    ];
  },

  // Proxy API and backend-served routes to the Elysia backend
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      // Borrower forms are served by the API
      {
        source: '/forms/:path*',
        destination: `${apiUrl}/forms/:path*`,
      },
    ];
  },
};

export default nextConfig;
