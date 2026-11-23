import type { Metadata } from 'next';
import { CalendlyButton } from './calendly-button';
import { ScrollReveal } from './scroll-reveal';
import { LeadCapture } from './lead-capture';
import { FOUNDER, founderJsonLd } from './founder';
import { SERVICES, ENGAGEMENT_STEPS } from './services/services-data';
import { DEFAULT_OG_IMAGES } from '@/app/og-default';

export const metadata: Metadata = {
  title: { absolute: 'RAVEN — Bank Technology Consulting for New and Community Banks' },
  description:
    'Technology consulting for new and community banks from Isaac Welch, who built the banking arm of Upstart and Affirm: de novo setup, core and LOS integration, AI governance, security readiness.',
  keywords: [
    'bank technology consulting',
    'de novo bank consultant',
    'community bank technology consultant',
    'core banking integration',
    'loan origination system integration',
    'AI governance for banks',
    'bank IT exam readiness',
    'fintech bank partnership consulting',
    'borrower verification software',
    'South Carolina banking technology',
  ],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: 'RAVEN — Bank Technology Consulting',
    description: FOUNDER.headline,
    url: 'https://reportraven.tech',
    siteName: 'RAVEN',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RAVEN — Bank Technology Consulting',
    description: 'Technology help for new and community banks, from someone who built the banking arm of Upstart and Affirm.',
  },
  alternates: {
    canonical: 'https://reportraven.tech',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'geo.region': 'US-SC',
    'geo.placename': 'South Carolina',
  },
};

const RAVEN_PATH =
  'M2162.9,2626.4c17.1-6.3,35.7-13.6,48.6-20.1-51.8-.7-99,.5-146.3-2.5-162.9-10.5-321.8-40.2-475.8-94.7-166.9-59.1-321-140.7-453.7-259.6-62.1-55.7-115.4-118.4-149.3-195.7-26.4-60.1-37.6-122.5-21.4-187.2,40.1-160.7,200.7-247.3,361.8-218-40.9,6.9-78.6,15.9-111.1,38.7-32.7,22.9-58.8,51.1-72.2,91.7,36.3-26.9,91.2-50.3,120.1-51.6-2.5,1.9-4.3,3.6-6.4,5-68.4,45.2-101.9,109.3-103.6,190.8-1.5,69.4,23.3,130.2,60.2,187.1,59.4,91.5,140.5,160.3,231.8,217.9,111.4,70.2,231,119.8,354.7,155.9,104,30.3,211.3,49.4,320,51.4,13.3.2,26.7,0,40,0-6.1-6.8-12.7-10.1-19-13.8-49-29.3-81.5-73.1-106-123.2-29.6-60.7-58.7-122.2-87.8-183.2-61.6-129.2-138.6-248-238.7-351.1-71.7-73.8-152.5-134.8-247.9-174.8-6.9-2.9-11.5-7.8-15.8-13.5-29.2-38.3-54-79.1-69.9-124.8-20.3-58.6-22.5-117.4.7-175.8,26.8-67.4,77.5-111.8,140.8-143.3,59.7-29.7,123.7-45.2,189.1-56.1,85.4-14.3,171.3-19.1,257.7-11.2,26.4,2.4,52.3,8.2,79.6,12.8-1.6-3.8-2.4-6.2-3.5-8.4-2.8-5.4-5.4-10.8-8.6-16-37.3-61.5-87.7-110.2-148.5-148.2-110.1-68.9-232.1-98.4-360.2-105.6-33.6-1.9-61.3-9.6-89.6-30.3-109.5-80.1-233.4-107.2-367.7-91.9-103.9,11.8-197.9,48.4-283.8,107.6-91.3,62.8-170.3,141.4-263.4,201.4,1.3,3.6,3.6,2.7,5.4,2.8,70.6,3.8,138.8-11.9,207.7-25.2-142.7,75.7-262.1,171.7-303,338.1,41.4-38.3,88-67.6,140.8-87.1-39,42-68.8,89.9-92.5,141.4-79.6,173.1-94.5,354.4-61,539.8,31.9,177,108.7,333.6,226.4,469.8,6.6,7.6,13.6,14.9,20.7,22.1,6.6,6.8,13.5,13.3,23.1,22.7l254,162c139.8,87.7,294.6,130.1,457.6,141.8,166.5,12,330.1-7.8,489.8-57.3,12.2-3.8,24.1-8.5,36-13.1s19.2-8.2,28.5-13.1l114-60.6c31.6-16.8,64.3-31.5,97.9-43.8ZM1326.1,1075.5c50.8-26.4,106-35.6,161.9-39.4,111.3-7.5,221.7-2.3,329.1,32,28.7,9.2,56.6,20.3,85.5,35-222-20.9-439.8-17.1-656.4,43.6,23-29.9,47.6-54.5,79.8-71.3ZM1150.4,943.8c31.7.5,57,26.5,56.9,58.5,0,30.6-26.9,56.6-57.6,55.9-31.8-.8-57-27-56.6-58.8.4-31.6,25.6-56,57.3-55.5Z';

function RavenLogo({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 3000 3000"
      fill="currentColor"
      className={className}
    >
      <path d={RAVEN_PATH} />
      <circle cx="1500" cy="1500" r="1319.5" fill="none" stroke="currentColor" strokeWidth="109" />
    </svg>
  );
}

const ORG_ID = 'https://reportraven.tech/#organization';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': ORG_ID,
      name: 'RAVEN',
      legalName: 'RAVEN (Real-time Aggregation and Verification Engine)',
      url: 'https://reportraven.tech',
      logo: 'https://reportraven.tech/raven-icon.svg',
      description: FOUNDER.headline,
      areaServed: [
        { '@type': 'State', name: 'South Carolina' },
        { '@type': 'Country', name: 'United States' },
      ],
      knowsAbout: [
        'De novo bank operations',
        'Core banking conversion and modernization',
        'Loan origination systems',
        'AI governance and model risk management',
        'Third-party risk management',
        'IT examination readiness',
        'Fintech bank partnerships',
        'Borrower verification',
        'Community banking',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'isaac@reportraven.tech',
        telephone: '+1-229-379-6131',
        url: 'https://reportraven.tech',
      },
      founder: { '@id': 'https://reportraven.tech/about#founder' },
      // Org-level sameAs: add LinkedIn company page, Crunchbase, and G2 profile
      // URLs here as each profile is created (see marketing/seo-aeo-playbook.md).
    },
    { ...founderJsonLd(), worksFor: { '@id': ORG_ID } },
    {
      '@type': 'WebSite',
      '@id': 'https://reportraven.tech/#website',
      url: 'https://reportraven.tech',
      name: 'RAVEN',
      publisher: { '@id': ORG_ID },
      inLanguage: 'en-US',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://reportraven.tech/#software',
      name: 'RAVEN Borrower Verification',
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Borrower Verification',
      operatingSystem: 'Web',
      description:
        'Borrower verification software built and offered by RAVEN. Automates KYC, identity, income, credit, employment, and property verification through a single link.',
      url: 'https://reportraven.tech/services/verification-software',
      provider: { '@id': ORG_ID },
      featureList: [
        'KYC and identity verification',
        'OFAC/PEP watchlist screening',
        'Income and asset verification via bank connection',
        'Employer-verified employment',
        'Property valuation (AVM) and tax data',
        'Examiner-ready audit trail',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What does RAVEN do?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'RAVEN is a bank technology consulting practice led by Isaac Welch, who built the banking arm of Upstart and Affirm. It helps new and community banks set up operations, integrate core, LOS and verification technology, adopt AI with proper governance, prepare for IT exams, and run fintech partnerships. It also offers its own borrower verification software.',
          },
        },
        {
          '@type': 'Question',
          name: 'Who does RAVEN work with?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'New banks from FDIC filing through their first three years, and community banks modernizing an existing stack, with a focus on the Southeast.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does RAVEN resell technology vendors?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'No. RAVEN works for the bank and has no commercial relationship with the cores, origination systems or other vendors it helps banks choose and integrate.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do we have to use the RAVEN software?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'No. The verification software is one service among six. Most consulting work has nothing to do with it.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does an engagement start?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'With a 20-minute call. Operating banks can also start with a free digital lending audit built from their public call report and HMDA data.',
          },
        },
      ],
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <style>{`

        :root {
          --black: #0A0A0A;
          --gray-900: #171717;
          --gray-800: #262626;
          --gray-600: #525252;
          --gray-500: #808080;
          --gray-400: #A3A3A3;
          --gray-300: #D4D4D4;
          --gray-200: #E5E5E5;
          --gray-100: #F5F5F5;
          --gray-50: #FAFAFA;
          --white: #FFFFFF;
          --accent: #6C8EFF;
          --accent-dim: rgba(108,142,255,0.12);
        }

        html { scroll-behavior: smooth; }
        .landing *, .landing *::before, .landing *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .landing {
          font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
          background: var(--black);
          color: var(--white);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          min-height: 100vh;
        }

        /* --- Nav --- */
        .landing nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
          background: rgba(10,10,10,0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .nav-logo svg { opacity: 0.9; }
        .nav-wordmark {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--white);
        }
        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        .nav-links a {
          color: var(--gray-300);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 400;
          transition: color 200ms;
        }
        .nav-links a:hover { color: var(--white); }
        .nav-links a, .nav-cta { white-space: nowrap; }
        @media (max-width: 1100px) { .nav-links { gap: 1.25rem; } }
        @media (max-width: 1000px) { .nav-links a[href^="tel:"] { display: none; } }
        .nav-cta {
          background: var(--white) !important;
          color: var(--black) !important;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-weight: 500 !important;
          transition: opacity 200ms !important;
        }
        .nav-cta:hover { opacity: 0.85; color: var(--black) !important; }
        .nav-blog-mobile {
          display: none;
          color: var(--gray-300);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.5rem 0.9rem;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
        }
        button.nav-cta {
          font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
          font-size: 0.85rem;
          border: none;
          cursor: pointer;
        }

        /* --- Hero --- */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 8rem 3rem 6rem;
          overflow: hidden;
        }
        .hero-watermark {
          position: absolute;
          right: -8%;
          top: 50%;
          transform: translateY(-50%);
          width: 55vw;
          max-width: 700px;
          opacity: 0.04;
          pointer-events: none;
          animation: watermarkIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes watermarkIn {
          from { opacity: 0; transform: translateY(-50%) scale(0.95); }
          to { opacity: 0.04; transform: translateY(-50%) scale(1); }
        }
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-blob-1 {
          width: 750px;
          height: 750px;
          background: radial-gradient(circle, rgba(108,142,255,0.07) 0%, transparent 65%);
          top: -20%;
          left: -18%;
          animation: blob-drift 20s ease-in-out infinite alternate;
        }
        .hero-blob-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(108,142,255,0.04) 0%, transparent 65%);
          bottom: -5%;
          right: 25%;
          animation: blob-drift 26s ease-in-out infinite alternate-reverse;
        }
        @keyframes blob-drift {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(55px, 30px) scale(1.04); }
          66%  { transform: translate(-25px, 60px) scale(0.97); }
          100% { transform: translate(35px, -45px) scale(1.02); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-blob { animation: none; }
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 680px;
        }
        .hero-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gray-500);
          margin-bottom: 1.5rem;
          padding: 0.4rem 0.9rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          animation: fadeUp 800ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .hero h1 {
          font-size: clamp(2.5rem, 5.5vw, 4rem);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
          animation: fadeUp 800ms 100ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .hero h1 em {
          font-style: normal;
          color: var(--gray-300);
        }
        .hero-sub {
          font-size: 1.15rem;
          line-height: 1.7;
          color: var(--gray-200);
          max-width: 520px;
          margin-bottom: 2.5rem;
          animation: fadeUp 800ms 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
          animation: fadeUp 800ms 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.75rem;
          border-radius: 6px;
          font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 200ms;
          cursor: pointer;
          border: none;
        }
        .btn-white {
          background: var(--white);
          color: var(--black);
        }
        .btn-white:hover { opacity: 0.85; }
        .btn-ghost {
          background: transparent;
          color: var(--gray-400);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .btn-ghost:hover { color: var(--white); border-color: rgba(255,255,255,0.3); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- Scroll reveal --- */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 700ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1);
        }
        .revealed { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .revealed { opacity: 1; transform: none; transition: none; }
        }

        /* --- Divider --- */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 50%, transparent);
          margin: 0 3rem;
        }

        .how-it-works {
          padding: 7rem 3rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .how-it-works-header {
          max-width: 540px;
          margin-bottom: 4rem;
        }
        .how-it-works-header h2 {
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .how-it-works-header p {
          font-size: 1rem;
          color: var(--gray-400);
          line-height: 1.7;
        }
        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .step {
          padding: 2.5rem;
          background: var(--black);
          position: relative;
        }
        .step-num {
          font-size: 3.5rem;
          font-weight: 700;
          letter-spacing: -0.05em;
          color: rgba(108,142,255,0.35);
          line-height: 1;
          margin-bottom: 1.5rem;
          font-variant-numeric: tabular-nums;
        }
        .step-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          color: var(--gray-300);
          margin-bottom: 1.25rem;
        }
        .step h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
        }
        .step p {
          font-size: 0.85rem;
          color: var(--gray-300);
          line-height: 1.65;
        }

        /* --- Features --- */
        .features {
          padding: 7rem 3rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .features-header {
          max-width: 540px;
          margin-bottom: 4rem;
        }
        .section-tag {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gray-500);
          margin-bottom: 1rem;
        }
        .features-header h2 {
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .features-header p {
          font-size: 1rem;
          color: var(--gray-200);
          line-height: 1.7;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .feature {
          padding: 2.5rem;
          background: var(--black);
        }
        .feature-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          color: var(--gray-300);
          margin-bottom: 1.25rem;
        }
        .feature h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
        }
        .feature p {
          font-size: 0.85rem;
          color: var(--gray-300);
          line-height: 1.65;
        }
        .feature {
          transition: background 250ms;
        }
        .feature:hover { background: rgba(255,255,255,0.022); }
        a.feature { display: block; text-decoration: none; color: inherit; border-top: 3px solid transparent; }
        a.feature:hover { border-top-color: var(--accent); }
        .feature-eyebrow { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--accent); margin-bottom: 0.7rem; }
        .features-header a { color: var(--accent); text-decoration: none; }
        .features-header a:hover { text-decoration: underline; }
        /* --- Founder --- */
        .founder { padding: 7rem 3rem; max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.35fr; gap: 4rem; align-items: start; }
        .founder h2 { font-size: 2rem; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2; }
        .founder p { font-size: 1rem; color: var(--gray-300); line-height: 1.75; margin-bottom: 1.1rem; }
        .founder-experience { display: flex; flex-wrap: wrap; gap: 0.5rem; list-style: none; margin: 1.5rem 0; }
        .founder-experience li { font-size: 0.8rem; color: var(--gray-200); border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; padding: 0.3rem 0.8rem; }
        .founder-link { color: var(--accent); text-decoration: none; font-size: 0.9rem; font-weight: 500; }
        .founder-link:hover { text-decoration: underline; }
        .nav-mobile-links { display: flex; gap: 0.5rem; }

        .free-data {
          padding: 6rem 3rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .free-data h2 { font-size: 2rem; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 2.5rem; max-width: 640px; }
        .free-data-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        .free-data-card { display: block; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem; text-decoration: none; color: inherit; transition: border-color 0.2s, background 0.2s; }
        .free-data-card:hover { border-color: rgba(108,142,255,0.35); background: var(--accent-dim); }
        .free-data-card h3 { font-size: 1.05rem; font-weight: 600; color: var(--white); margin-bottom: 0.5rem; }
        .free-data-card p { font-size: 0.9rem; color: var(--gray-300); line-height: 1.6; }
        .cta {
          padding: 7rem 3rem;
          text-align: center;
        }
        .cta-inner {
          max-width: 560px;
          margin: 0 auto;
        }
        .cta h2 {
          font-size: 2.2rem;
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 1rem;
        }
        .cta p {
          font-size: 1rem;
          color: var(--gray-200);
          line-height: 1.7;
          margin-bottom: 2rem;
        }
        .cta-primary-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
        }
        .cta-primary-action button,
        .cta-primary-action a {
          font-size: 1rem !important;
          padding: 0.9rem 2.25rem !important;
        }
        .cta-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .cta-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .cta-divider-text {
          font-size: 0.75rem;
          color: var(--gray-600);
          letter-spacing: 0.05em;
        }
        .cta-email-label {
          font-size: 0.8rem;
          color: var(--gray-500);
          margin-bottom: 1rem;
        }
        .interest-form {
          max-width: 520px;
          margin: 0 auto;
        }
        .form-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .form-input {
          font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
          font-size: 0.9rem;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: var(--white);
          outline: none;
          transition: border-color 200ms;
          flex: 1;
          min-width: 160px;
        }
        .form-input::placeholder { color: var(--gray-500); }
        .form-input:focus { border-color: rgba(255,255,255,0.4); }
        .form-btn {
          font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          border: none;
          background: var(--white);
          color: var(--black);
          cursor: pointer;
          transition: opacity 200ms;
          white-space: nowrap;
        }
        .form-btn:hover { opacity: 0.85; }
        .form-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .form-error {
          color: #ef4444;
          font-size: 0.8rem;
          margin-top: 0.75rem;
        }
        .form-success {
          text-align: center;
        }
        .form-success-check {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(34,197,94,0.15);
          color: #22c55e;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .form-success-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
        }
        .form-success-sub {
          font-size: 0.9rem;
          color: var(--gray-300);
        }
        .cta-alt {
          margin-top: 1.25rem;
          font-size: 0.8rem;
          color: var(--gray-500);
        }
        .cta-alt a {
          color: var(--gray-300);
          text-decoration: none;
          transition: color 200ms;
        }
        .cta-alt a:hover { color: var(--white); }

        /* --- Footer --- */
        .landing footer {
          padding: 2rem 3rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .landing footer span {
          font-size: 0.75rem;
          color: var(--gray-500);
        }
        .footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem 1.5rem;
        }
        .footer-links a {
          font-size: 0.75rem;
          color: var(--gray-500);
          text-decoration: none;
          transition: color 200ms;
        }
        .footer-links a:hover { color: var(--white); }
        .footer-contact {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.8rem !important;
          color: var(--gray-400) !important;
        }
        .footer-contact a {
          color: var(--gray-200);
          text-decoration: none;
          transition: color 200ms;
        }
        .footer-contact a:hover { color: var(--white); }

        /* --- Responsive --- */
        @media (max-width: 768px) {
          .landing nav { padding: 1rem 1.5rem; }
          .nav-links { display: none; }
          .nav-blog-mobile { display: inline-block; }
          .hero { padding: 7rem 1.5rem 4rem; }
          .hero h1 { font-size: 2.2rem; }
          .hero-watermark { width: 80vw; right: -20%; opacity: 0.03; }
          .how-it-works { padding: 4rem 1.5rem; }
          .steps { grid-template-columns: 1fr; }
          .features { padding: 4rem 1.5rem; }
          .features-grid { grid-template-columns: 1fr; }
          .founder { padding: 4rem 1.5rem; grid-template-columns: 1fr; gap: 1.5rem; }
          .free-data { padding: 4rem 1.5rem; }
          .free-data-grid { grid-template-columns: 1fr; }
          .cta { padding: 4rem 1.5rem; }
          .landing footer { padding: 1.5rem; flex-direction: column; gap: 1rem; }
          .divider { margin: 0 1.5rem; }
        }
      `}</style>

      <div className="landing">
        <ScrollReveal />
        <nav>
          <div className="nav-logo">
            <RavenLogo />
            <span className="nav-wordmark">RAVEN</span>
          </div>
          <span className="nav-mobile-links">
            <a href="/services" className="nav-blog-mobile">Services</a>
            <a href="/blog" className="nav-blog-mobile">Blog</a>
          </span>
          <div className="nav-links">
            <a href="/services">Services</a>
            <a href="/de-novo-watch">De Novo Watch</a>
            <a href="/blog">Blog</a>
            <a href="/about">About</a>
            <a href="tel:+12293796131">(229) 379-6131</a>
            <CalendlyButton source="landing-nav" label="Book a call" buttonClassName="nav-cta" />
          </div>
        </nav>

        <section className="hero">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <svg className="hero-watermark" viewBox="0 0 3000 3000" fill="currentColor">
            <path d={RAVEN_PATH} />
            <circle
              cx="1500"
              cy="1500"
              r="1319.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="109"
            />
          </svg>
          <div className="hero-content">
            <span className="hero-tag">Bank technology consulting</span>
            <h1>
              Bank technology, from someone
              <br />
              <em>who has built it.</em>
            </h1>
            <p className="hero-sub">{FOUNDER.headline}</p>
            <div className="hero-actions">
              <CalendlyButton source="landing-hero" label="Book a call" buttonClassName="btn btn-white" />
              <a href="/services" className="btn btn-ghost">
                See services
              </a>
            </div>
          </div>
        </section>

        {/* --- Founder --- */}
        <section className="founder reveal">
          <div>
            <div className="section-tag">Who you work with</div>
            <h2>Isaac Welch built the banking arm of Upstart and Affirm.</h2>
          </div>
          <div>
            {FOUNDER.bio.slice(0, 2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <ul className="founder-experience" aria-label="Experience">
              {FOUNDER.experience.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <a href="/about" className="founder-link">More about Isaac &rarr;</a>
          </div>
        </section>

        <div className="divider" />

        {/* --- Services --- */}
        <section className="features reveal">
          <div className="features-header">
            <div className="section-tag">Services</div>
            <h2>Six ways RAVEN helps a bank.</h2>
            <p>From the first vendor decision after conditional approval to the next IT exam.</p>
          </div>
          <div className="features-grid">
            {SERVICES.map((s) => (
              <a key={s.slug} href={`/services/${s.slug}`} className="feature">
                <div className="feature-eyebrow">{s.eyebrow}</div>
                <h3>{s.navLabel}</h3>
                <p>{s.metaDescription}</p>
              </a>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* --- How an engagement works --- */}
        <section id="how-it-works" className="how-it-works reveal">
          <div className="how-it-works-header">
            <div className="section-tag">How it works</div>
            <h2>How an engagement works.</h2>
            <p>No prices on a website: every bank is different. Every engagement follows the same three steps.</p>
          </div>
          <div className="steps">
            {ENGAGEMENT_STEPS.map((step, i) => (
              <div className="step" key={step.title}>
                <div className="step-num">{String(i + 1).padStart(2, '0')}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* --- Software we built --- */}
        <section className="features reveal">
          <div className="features-header">
            <div className="section-tag">Software we built</div>
            <h2>RAVEN borrower verification.</h2>
            <p>
              RAVEN started as software. One link to the borrower returns identity, income, credit,
              employment and property data with an examiner-ready audit trail, alongside the bank&apos;s
              existing core and LOS. <a href="/services/verification-software">See the software &rarr;</a>
            </p>
          </div>
        </section>

        <div className="divider" />

        <section className="free-data reveal">
          <div className="section-tag">Free bank data</div>
          <h2>Research we publish from FDIC filings, free to use and cite.</h2>
          <div className="free-data-grid">
            <a className="free-data-card" href="/bank-snapshot">
              <h3>Bank Peer Snapshot</h3>
              <p>Any FDIC-insured bank against same-size banks in its state: ROA, margin, efficiency, assets per employee.</p>
            </a>
            <a className="free-data-card" href="/bank-rankings">
              <h3>Bank rankings by state</h3>
              <p>Every bank in a state ranked by return on assets and efficiency ratio, from the latest call reports.</p>
            </a>
            <a className="free-data-card" href="/de-novo-watch">
              <h3>De Novo Watch</h3>
              <p>Who is starting a bank in 2026: every FDIC filing, approval and opening, with capital and technology.</p>
            </a>
          </div>
        </section>

        <div className="divider" />

        <section id="get-started" className="cta reveal">
          <div className="cta-inner">
            <div className="section-tag">Get started</div>
            <h2>Talk through your bank&apos;s technology.</h2>
            <p>
              Book a 20-minute call with Isaac. Bring the core decision, the LOS project, the AI tool your
              team wants to try, or the exam on the calendar.
            </p>
            <CalendlyButton source="landing-cta" label="Book a call" buttonClassName="btn btn-white" />
            <p className="cta-alt">
              Prefer email?{' '}
              <a href="mailto:isaac@reportraven.tech">isaac@reportraven.tech</a>
            </p>
          </div>
        </section>

        {/* Lower-commitment path for visitors not ready to book a call. */}
        <div style={{ maxWidth: 760, margin: '-3rem auto 0', padding: '0 1.5rem 4rem' }}>
          <LeadCapture variant="audit" source="landing" title="Not ready for a call? Start with a free audit." />
        </div>

        <footer>
          <div>
            <span>&copy; 2026 RAVEN. All rights reserved.</span>
            <span style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.65rem', color: 'var(--gray-500)', letterSpacing: '0.05em' }}>A South Carolina company</span>
            <span className="footer-contact">
              <a href="tel:+12293796131">(229) 379-6131</a>
              <span aria-hidden="true"> · </span>
              <a href="mailto:isaac@reportraven.tech">isaac@reportraven.tech</a>
            </span>
          </div>
          <div className="footer-links">
            <a href="/services">Services</a>
            <a href="/blog">Blog</a>
            <a href="/solutions">Solutions</a>
            <a href="/glossary">Glossary</a>
            <a href="/integrations">Integrations</a>
            <a href="/de-novo-watch">De Novo Watch</a>
            <a href="/bank-snapshot">Bank Peer Snapshot</a>
            <a href="/bank-rankings">Bank Rankings</a>
            <a href="/bank-tech-stack">Bank Tech Stack</a>
            <a href="/about">About</a>
            <a href="/provenpool">ProvenPool</a>
            <a href="/legal/privacy-policy">Privacy Policy</a>
            <a href="/legal/terms-of-service">Terms of Service</a>
            <a href="/legal/security">Security</a>
            <a href="/ai-info">For AI assistants</a>
          </div>
        </footer>
      </div>
    </>
  );
}
