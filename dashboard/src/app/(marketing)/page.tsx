import type { Metadata } from 'next';
import { CalendlyButton } from './calendly-button';
import { ScrollReveal } from './scroll-reveal';

export const metadata: Metadata = {
  title: 'RAVEN — Borrower Verification Software for Community Banks',
  description:
    'RAVEN automates borrower verification for community banks. Identity, income, credit, employment, and property data from one link, verified in minutes.',
  keywords: [
    'borrower verification software',
    'community bank verification',
    'KYC for community banks',
    'bank onboarding automation',
    'borrower verification platform',
    'South Carolina banking technology',
    'regional bank software',
    'BSA compliance automation',
    'loan officer verification tools',
    'community bank fintech',
    'identity verification banking',
    'borrower report software',
  ],
  openGraph: {
    title: 'RAVEN — Borrower Verification for Community Banks',
    description: 'One verification link. Complete borrower report in minutes. Identity, income, credit, employment, and property data — all cross-referenced automatically.',
    url: 'https://reportraven.tech',
    siteName: 'RAVEN',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RAVEN — Borrower Verification for Community Banks',
    description: 'One verification link. Complete borrower report in minutes. Built for community and regional banks.',
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://reportraven.tech/#organization',
      name: 'RAVEN',
      legalName: 'RAVEN (Real-time Aggregation and Verification Engine)',
      url: 'https://reportraven.tech',
      logo: 'https://reportraven.tech/raven-icon.svg',
      description:
        'RAVEN provides automated borrower verification software for community and regional banks. One link delivers identity, income, employment, and property data in minutes.',
      areaServed: [
        { '@type': 'State', name: 'South Carolina' },
        { '@type': 'Country', name: 'United States' },
      ],
      knowsAbout: [
        'Borrower verification',
        'KYC automation',
        'BSA/AML compliance',
        'Identity verification',
        'Income verification',
        'Employment verification',
        'Property valuation',
        'Community banking',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'isaac@reportraven.tech',
        url: 'https://reportraven.tech',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://reportraven.tech/#website',
      url: 'https://reportraven.tech',
      name: 'RAVEN',
      publisher: { '@id': 'https://reportraven.tech/#organization' },
      inLanguage: 'en-US',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://reportraven.tech/#software',
      name: 'RAVEN',
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Borrower Verification',
      operatingSystem: 'Web',
      description:
        'Borrower verification platform for community and regional banks. Automates KYC, identity, income, credit, employment, and property verification through a single link.',
      url: 'https://reportraven.tech',
      provider: { '@id': 'https://reportraven.tech/#organization' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        description: 'Contact for pricing. Early access available for community banks.',
      },
      featureList: [
        'KYC and identity verification',
        'OFAC/PEP watchlist screening',
        'Income and asset verification via bank connection',
        'Employer-verified employment',
        'Property valuation (AVM) and tax data',
        'Cross-referenced confidence scoring',
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
              'RAVEN automates borrower verification for community and regional banks. A loan officer sends one link; the borrower connects their bank in about 5 minutes; RAVEN returns identity, income, employment, and property data cross-referenced from seven providers with a full audit trail.',
          },
        },
        {
          '@type': 'Question',
          name: 'Who is RAVEN built for?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Community banks, regional banks, and federal savings associations that originate mortgages, HELOCs, commercial real estate, and small business loans and want to compete with fintech speed without replacing their LOS.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which data sources does RAVEN use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Socure for KYC, fraud, and OFAC/PEP screening; Plaid for income, assets, and liabilities; Truework for employer-verified employment; Melissa and ATTOM for property AVM and tax data; FullContact for contact cross-reference.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does a verification take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'The borrower interaction takes about 5 minutes. Most verification data returns in minutes; employer-verified employment is asynchronous and typically completes in 1 to 3 days.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does RAVEN replace our loan origination system?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'No. RAVEN is a verification layer that runs alongside your existing LOS. It works as a standalone dashboard from day one and integrates via API with Jack Henry, Fiserv, and FIS environments.',
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

        :root {
          --black: #0A0A0A;
          --gray-900: #171717;
          --gray-800: #262626;
          --gray-600: #525252;
          --gray-500: #737373;
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
          font-family: 'DM Sans', sans-serif;
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
          font-family: 'DM Sans', sans-serif;
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
          font-family: 'DM Sans', sans-serif;
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

        /* --- Stats strip --- */
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .stat {
          padding: 3rem 2rem;
          background: var(--black);
          text-align: center;
        }
        .stat-num {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--white);
          margin-bottom: 0.3rem;
        }
        .stat-label {
          font-size: 0.8rem;
          color: var(--gray-500);
          letter-spacing: 0.05em;
        }

        /* --- How it works --- */
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

        /* --- Team split --- */
        .team-split {
          padding: 7rem 3rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .team-split-header {
          max-width: 560px;
          margin-bottom: 4rem;
        }
        .team-split-header h2 {
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .team-split-header p {
          font-size: 1rem;
          color: var(--gray-200);
          line-height: 1.7;
        }
        .split-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .split-panel {
          padding: 3rem;
          background: var(--black);
        }
        .split-panel-left {
          background: linear-gradient(150deg, rgba(108,142,255,0.05) 0%, var(--black) 55%);
        }
        .split-panel-label {
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gray-600);
          margin-bottom: 1.25rem;
        }
        .split-panel h3 {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          line-height: 1.35;
          margin-bottom: 1.75rem;
        }
        .split-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          list-style: none;
        }
        .split-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.88rem;
          color: var(--gray-300);
          line-height: 1.55;
        }
        .split-check {
          flex-shrink: 0;
          margin-top: 0.2rem;
          color: var(--accent);
          opacity: 0.75;
        }

        /* --- Report grid --- */
        .report-section {
          padding: 7rem 3rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .report-header {
          max-width: 540px;
          margin-bottom: 4rem;
        }
        .report-header h2 {
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .report-header p {
          font-size: 1rem;
          color: var(--gray-200);
          line-height: 1.7;
        }
        .report-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .report-item {
          padding: 2.25rem;
          background: var(--black);
          transition: background 250ms;
        }
        .report-item:hover { background: rgba(255,255,255,0.022); }
        .report-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(108,142,255,0.1);
          color: rgba(108,142,255,0.75);
          margin-bottom: 1rem;
        }
        .report-item h3 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.4rem;
          letter-spacing: -0.01em;
        }
        .report-item p {
          font-size: 0.82rem;
          color: var(--gray-300);
          line-height: 1.6;
        }

        /* --- Core Integration --- */
        .core-integration {
          padding: 7rem 3rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .core-integration-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: start;
        }
        .core-integration-copy h2 {
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .core-integration-copy p {
          font-size: 1rem;
          color: var(--gray-200);
          line-height: 1.7;
          margin-bottom: 2rem;
        }
        .core-integration-promise {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .promise-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .promise-check {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          margin-top: 0.05rem;
          color: var(--gray-300);
        }
        .promise-item span {
          font-size: 0.9rem;
          color: var(--gray-300);
          line-height: 1.5;
        }
        .core-logos-col {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .core-logos-group-label {
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gray-600);
          margin-bottom: 0.75rem;
        }
        .core-logos-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .core-logo-chip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          background: rgba(255,255,255,0.02);
          transition: border-color 200ms, background 200ms;
        }
        .core-logo-chip:hover {
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
        }
        .core-logo-name {
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--gray-200);
        }
        .core-logo-platforms {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .core-logo-platforms span {
          font-size: 0.65rem;
          color: var(--gray-600);
          padding: 0.2rem 0.5rem;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 100px;
          white-space: nowrap;
        }

        /* --- CTA --- */
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
          font-family: 'DM Sans', sans-serif;
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
          font-family: 'DM Sans', sans-serif;
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
          color: var(--gray-600);
        }
        .footer-links {
          display: flex;
          gap: 1.5rem;
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
          .stats { grid-template-columns: repeat(2, 1fr); }
          .how-it-works { padding: 4rem 1.5rem; }
          .steps { grid-template-columns: 1fr; }
          .features { padding: 4rem 1.5rem; }
          .features-grid { grid-template-columns: 1fr; }
          .team-split { padding: 4rem 1.5rem; }
          .split-panels { grid-template-columns: 1fr; }
          .report-section { padding: 4rem 1.5rem; }
          .report-grid { grid-template-columns: 1fr 1fr; }
          .core-integration { padding: 4rem 1.5rem; }
          .core-integration-inner { grid-template-columns: 1fr; gap: 3rem; }
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
          <a href="/blog" className="nav-blog-mobile">Blog</a>
          <div className="nav-links">
            <a href="/blog">Blog</a>
            <a href="https://app.reportraven.tech/legal/security" target="_blank" rel="noopener noreferrer">Security</a>
            <a href="https://app.reportraven.tech/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy</a>
            <a href="tel:+12293796131">(229) 379-6131</a>
            <CalendlyButton source="landing-nav" label="Request a Demo" buttonClassName="nav-cta" />
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
            <span className="hero-tag">Borrower verification software for community banks</span>
            <h1>
              Complete borrower reports,
              <br />
              <em>not paperwork.</em>
            </h1>
            <p className="hero-sub">
              RAVEN replaces weeks of manual data gathering with a single verification link. Your borrower
              clicks, connects, and consents — you get a complete, print-ready report with identity,
              income, credit, employment, and property data. Built for community and regional banks
              in South Carolina and the Southeast.
            </p>
            <div className="hero-actions">
              <CalendlyButton source="landing-hero" label="Request a Demo" buttonClassName="btn btn-white" />
              <a href="#how-it-works" className="btn btn-ghost">
                See How It Works
              </a>
            </div>
          </div>
        </section>

        <div className="stats reveal">
          <div className="stat">
            <div className="stat-num">18+</div>
            <div className="stat-label">Data Sources</div>
          </div>
          <div className="stat">
            <div className="stat-num">&lt;5 min</div>
            <div className="stat-label">Borrower Experience</div>
          </div>
          <div className="stat">
            <div className="stat-num">4–6 hrs</div>
            <div className="stat-label">Saved Per Loan</div>
          </div>
          <div className="stat">
            <div className="stat-num">100%</div>
            <div className="stat-label">Encrypted at Rest</div>
          </div>
        </div>

        {/* --- How it works --- */}
        <section id="how-it-works" className="how-it-works reveal">
          <div className="how-it-works-header">
            <div className="section-tag">How it works</div>
            <h2>Three steps. No new workflows.</h2>
            <p>
              RAVEN slots into how your loan officers already work. No software to install,
              no training sessions, no migration. You&apos;re collecting better data within
              minutes of getting access.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <div className="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
              </div>
              <h3>You send one link</h3>
              <p>Enter a borrower&apos;s name, phone number, or email. RAVEN generates a branded verification link and delivers it by text or email — no portal, no login, no back-and-forth.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <div className="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              </div>
              <h3>Borrower completes in 5 minutes</h3>
              <p>They confirm their identity, connect their bank account through Plaid, and consent to sharing their data — all from a browser on any device. No app to download.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <div className="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3>Your complete report is ready</h3>
              <p>Identity, income, credit, employment, and property data — sourced, cross-referenced, and formatted into a print-ready PDF. Ready to drop directly into your loan file.</p>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* --- Team + Borrower split --- */}
        <section className="team-split reveal">
          <div className="team-split-header">
            <div className="section-tag">Built for both sides</div>
            <h2>Simple for your team. Painless for borrowers.</h2>
            <p>
              RAVEN is designed around both the people sending the link and the people receiving it —
              fast for loan officers, frictionless for the borrower on the other end.
            </p>
          </div>
          <div className="split-panels">
            <div className="split-panel split-panel-left">
              <div className="split-panel-label">For your loan officers</div>
              <h3>Get a complete report without chasing a single document.</h3>
              <ul className="split-list">
                <li>
                  <svg className="split-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Send a verification link from your dashboard in seconds — by text or email
                </li>
                <li>
                  <svg className="split-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Receive a print-ready PDF with every data point the loan file needs
                </li>
                <li>
                  <svg className="split-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Track status in real time — see every step complete as it happens
                </li>
                <li>
                  <svg className="split-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Sourced, timestamped audit trail ready for examiners — no manual assembly
                </li>
              </ul>
            </div>
            <div className="split-panel">
              <div className="split-panel-label">For your borrowers</div>
              <h3>Five minutes. No appointments, no paperwork.</h3>
              <ul className="split-list">
                <li>
                  <svg className="split-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Opens on any phone, tablet, or computer — no download required
                </li>
                <li>
                  <svg className="split-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Guided identity check in about 2 minutes — name, DOB, last 4 SSN
                </li>
                <li>
                  <svg className="split-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Connects their bank through Plaid — read-only, no credentials ever shared
                </li>
                <li>
                  <svg className="split-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Clear consent at every step — they control exactly what gets shared
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* --- Report contents --- */}
        <section className="report-section reveal">
          <div className="report-header">
            <div className="section-tag">What you get</div>
            <h2>Everything you need for the loan file.</h2>
            <p>
              One verification produces a comprehensive borrower report covering every dimension
              lenders need — sourced from 18+ data providers and cross-referenced automatically.
            </p>
          </div>
          <div className="report-grid">
            <div className="report-item">
              <div className="report-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h3>Identity &amp; KYC</h3>
              <p>Name, SSN, and DOB verified across sources. Fraud scoring, OFAC/PEP screening, and synthetic identity detection.</p>
            </div>
            <div className="report-item">
              <div className="report-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3>Income &amp; Assets</h3>
              <p>Bank balances, income streams, and 12 months of transactions. Categorized cash flow and spending patterns.</p>
            </div>
            <div className="report-item">
              <div className="report-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3>Credit History</h3>
              <p>Scores, tradelines, payment history, liabilities, and utilization from all three bureaus.</p>
            </div>
            <div className="report-item">
              <div className="report-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <h3>Employment</h3>
              <p>Employer-verified job titles, salary, start dates, and employment history — confirmed directly with employers.</p>
            </div>
            <div className="report-item">
              <div className="report-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h3>Property &amp; Residence</h3>
              <p>Address verification, AVM valuations, tax assessments, ownership history, and length of residence.</p>
            </div>
            <div className="report-item">
              <div className="report-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3>Full Audit Trail</h3>
              <p>Every data point sourced and timestamped. Consent records and field-level provenance ready for regulatory review.</p>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* --- Core Integration --- */}
        <section className="core-integration reveal">
          <div className="core-integration-inner">
            <div className="core-integration-copy">
              <div className="section-tag">Works with your core</div>
              <h2>Live in your existing stack. In a week or less.</h2>
              <p>
                RAVEN connects directly to the core banking and loan origination systems your
                team already runs. There is nothing to rip out, nothing to migrate, and no
                IT project to scope. Our implementation team handles the integration from
                start to finish — you focus on running your bank.
              </p>
              <div className="core-integration-promise">
                <div className="promise-item">
                  <svg className="promise-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Native API integrations — no middleware, no custom ETL pipelines</span>
                </div>
                <div className="promise-item">
                  <svg className="promise-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Dedicated implementation support from day one through go-live</span>
                </div>
                <div className="promise-item">
                  <svg className="promise-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Most banks are fully operational within 5 business days</span>
                </div>
                <div className="promise-item">
                  <svg className="promise-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Works standalone from day one if your core team needs more time</span>
                </div>
              </div>
            </div>

            <div className="core-logos-col">
              <div>
                <div className="core-logos-group-label">Core banking platforms</div>
                <div className="core-logos-row">
                  <div className="core-logo-chip">
                    <span className="core-logo-name">Jack Henry</span>
                    <div className="core-logo-platforms">
                      <span>SilverLake</span>
                      <span>CIF 20/20</span>
                      <span>Symitar</span>
                    </div>
                  </div>
                  <div className="core-logo-chip">
                    <span className="core-logo-name">Fiserv</span>
                    <div className="core-logo-platforms">
                      <span>DNA</span>
                      <span>Premier</span>
                      <span>Precision</span>
                    </div>
                  </div>
                  <div className="core-logo-chip">
                    <span className="core-logo-name">FIS</span>
                    <div className="core-logo-platforms">
                      <span>MBP</span>
                      <span>IBS</span>
                      <span>Horizon</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="core-logos-group-label">Loan origination systems</div>
                <div className="core-logos-row">
                  <div className="core-logo-chip">
                    <span className="core-logo-name">nCino</span>
                    <div className="core-logo-platforms">
                      <span>Bank Operating System</span>
                    </div>
                  </div>
                  <div className="core-logo-chip">
                    <span className="core-logo-name">Abrigo</span>
                    <div className="core-logo-platforms">
                      <span>Sageworks Lending</span>
                    </div>
                  </div>
                  <div className="core-logo-chip">
                    <span className="core-logo-name">Baker Hill</span>
                    <div className="core-logo-platforms">
                      <span>NextGen</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        <section id="get-started" className="cta reveal">
          <div className="cta-inner">
            <div className="section-tag">Get started</div>
            <h2>See it running in your bank.</h2>
            <p>
              Book a 20-minute call. We&apos;ll walk through a live verification using your
              bank&apos;s branding, show you the full report output, and answer every question
              your compliance team will have.
            </p>
            <CalendlyButton source="landing-cta" label="Book a Demo Call" buttonClassName="btn btn-white" />
            <p className="cta-alt">
              Prefer email?{' '}
              <a href="mailto:isaac@reportraven.tech">isaac@reportraven.tech</a>
            </p>
          </div>
        </section>

        <footer>
          <div>
            <span>&copy; 2026 RAVEN. All rights reserved.</span>
            <span style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.65rem', color: 'var(--gray-600)', letterSpacing: '0.05em' }}>A South Carolina company</span>
            <span className="footer-contact">
              <a href="tel:+12293796131">(229) 379-6131</a>
              <span aria-hidden="true"> · </span>
              <a href="mailto:isaac@reportraven.tech">isaac@reportraven.tech</a>
            </span>
          </div>
          <div className="footer-links">
            <a href="https://app.reportraven.tech/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            <a href="https://app.reportraven.tech/legal/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            <a href="https://app.reportraven.tech/legal/security" target="_blank" rel="noopener noreferrer">Security</a>
          </div>
        </footer>
      </div>
    </>
  );
}
