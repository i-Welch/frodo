import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://reportraven.tech'),
  title: {
    default: 'RAVEN — Borrower Verification for Community Banks',
    template: '%s — RAVEN',
  },
  description:
    'RAVEN automates borrower verification for community and regional banks. One link delivers identity, income, employment, and property data in minutes — with a full audit trail.',
  applicationName: 'RAVEN',
  authors: [{ name: 'RAVEN', url: 'https://reportraven.tech' }],
  openGraph: {
    siteName: 'RAVEN',
    type: 'website',
    locale: 'en_US',
    url: 'https://reportraven.tech',
    title: 'RAVEN — Borrower Verification for Community Banks',
    description:
      'One verification link. Complete borrower report in minutes. Identity, income, employment, and property data cross-referenced automatically.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RAVEN — Borrower Verification for Community Banks',
    description:
      'One verification link. Complete borrower report in minutes for community and regional banks.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
