import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Proxy API and backend-served routes to the Elysia backend
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      // Legal pages are served by the API
      {
        source: '/legal/:path*',
        destination: `${apiUrl}/legal/:path*`,
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
