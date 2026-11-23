import { ProductMilestones } from "@/components/ProductMilestones";
import type { Metadata } from 'next';
import { Analytics } from "@/components/ProductAnalytics";
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { dmSans, fraunces } from './fonts';

export const metadata: Metadata = {
  metadataBase: new URL('https://reportraven.tech'),
  title: {
    default: 'RAVEN — Bank Technology Consulting',
    template: '%s — RAVEN',
  },
  description:
    'Bank technology consulting for new and community banks from Isaac Welch, who built the banking arm of Upstart and Affirm: de novo setup, core and LOS integration, AI governance, security readiness.',
  applicationName: 'RAVEN',
  authors: [{ name: 'RAVEN', url: 'https://reportraven.tech' }],
  openGraph: {
    siteName: 'RAVEN',
    type: 'website',
    locale: 'en_US',
    url: 'https://reportraven.tech',
    title: 'RAVEN — Bank Technology Consulting',
    description:
      'Technology help for new and community banks, from someone who built the banking arm of Upstart and Affirm.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RAVEN — Bank Technology Consulting',
    description:
      'Technology help for new and community banks, from someone who built the banking arm of Upstart and Affirm.',
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
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <ProductMilestones />
        {/* The Neon Auth provider and its CSS live in the dashboard and sign-in/up
            layouts, so marketing pages don't download the auth UI bundle. */}
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
