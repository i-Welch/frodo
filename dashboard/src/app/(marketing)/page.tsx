import type { Metadata } from 'next';
import { InterestForm } from './interest-form';

export const metadata: Metadata = {
  title: 'RAVEN — Borrower Verification Software for Community Banks | South Carolina',
  description:
    'RAVEN automates borrower verification for community and regional banks. KYC, identity, income, credit, employment, and property data from one verification link. Serving banks in South Carolina and the Southeast. Replace manual data collection with a 5-minute digital experience.',
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
  '@type': 'SoftwareApplication',
  name: 'RAVEN',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description: 'Borrower verification platform for community and regional banks. Automates KYC, identity, income, credit, employment, and property verification through a single link.',
  url: 'https://reportraven.tech',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Contact for pricing. Early access available for community banks.',
  },
  provider: {
    '@type': 'Organization',
    name: 'RAVEN',
    url: 'https://reportraven.tech',
    areaServed: [
      { '@type': 'State', name: 'South Carolina' },
      { '@type': 'Country', name: 'United States' },
    ],
    serviceType: [
      'Borrower Verification',
      'KYC Automation',
      'BSA Compliance',
      'Identity Verification',
      'Income Verification',
      'Employment Verification',
      'Property Valuation',
    ],
  },
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
          color: var(--gray-400);
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
          color: var(--gray-400);
        }
        .hero-sub {
          font-size: 1.15rem;
          line-height: 1.7;
          color: var(--gray-400);
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
          color: var(--gray-400);
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
          color: var(--gray-500);
          line-height: 1.65;
        }

        /* --- Integrations --- */
        .integrations {
          padding: 7rem 3rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .integrations-header {
          max-width: 540px;
          margin-bottom: 4rem;
        }
        .integrations-header h2 {
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .integrations-header p {
          font-size: 1rem;
          color: var(--gray-400);
          line-height: 1.7;
        }
        .integrations-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 2.5rem;
        }
        .integration-card {
          padding: 2.5rem;
          background: var(--black);
          display: flex;
          flex-direction: column;
        }
        .integration-name {
          font-size: 1.15rem;
          font-weight: 600;
          margin-bottom: 0.35rem;
          letter-spacing: -0.01em;
        }
        .integration-type {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gray-500);
          margin-bottom: 1rem;
        }
        .integration-desc {
          font-size: 0.85rem;
          color: var(--gray-500);
          line-height: 1.65;
          flex: 1;
        }
        .integration-platforms {
          margin-top: 1.25rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .integration-platforms span {
          font-size: 0.7rem;
          color: var(--gray-400);
          padding: 0.25rem 0.6rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          white-space: nowrap;
        }
        .integrations-also {
          text-align: center;
          color: var(--gray-500);
          font-size: 0.9rem;
          line-height: 1.7;
        }
        .integrations-also strong {
          color: var(--gray-300);
          font-weight: 500;
        }

        /* --- CTA --- */
        .cta {
          padding: 7rem 3rem;
          text-align: center;
        }
        .cta-inner {
          max-width: 520px;
          margin: 0 auto;
        }
        .cta h2 {
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
        }
        .cta p {
          font-size: 1rem;
          color: var(--gray-400);
          line-height: 1.7;
          margin-bottom: 2rem;
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
          color: var(--gray-400);
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

        /* --- Responsive --- */
        @media (max-width: 768px) {
          .landing nav { padding: 1rem 1.5rem; }
          .nav-links { display: none; }
          .hero { padding: 7rem 1.5rem 4rem; }
          .hero h1 { font-size: 2.2rem; }
          .hero-watermark { width: 80vw; right: -20%; opacity: 0.03; }
          .stats { grid-template-columns: repeat(2, 1fr); }
          .features { padding: 4rem 1.5rem; }
          .features-grid { grid-template-columns: 1fr; }
          .integrations { padding: 4rem 1.5rem; }
          .integrations-grid { grid-template-columns: 1fr; }
          .cta { padding: 4rem 1.5rem; }
          .landing footer { padding: 1.5rem; flex-direction: column; gap: 1rem; }
          .divider { margin: 0 1.5rem; }
        }
      `}</style>

      <div className="landing">
        <nav>
          <div className="nav-logo">
            <RavenLogo />
            <span className="nav-wordmark">RAVEN</span>
          </div>
          <div className="nav-links">
            <a href="https://app.reportraven.tech/legal/security" target="_blank" rel="noopener noreferrer">Security</a>
            <a href="https://app.reportraven.tech/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy</a>
            <a href="#get-started" className="nav-cta">
              Request Access
            </a>
          </div>
        </nav>

        <section className="hero">
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
              <a href="#get-started" className="btn btn-white">
                Request Access
              </a>
              <a href="/legal/security" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Security &amp; Compliance
              </a>
            </div>
          </div>
        </section>

        <div className="stats">
          <div className="stat">
            <div className="stat-num">18+</div>
            <div className="stat-label">Data Sources</div>
          </div>
          <div className="stat">
            <div className="stat-num">&lt;5 min</div>
            <div className="stat-label">Borrower Experience</div>
          </div>
          <div className="stat">
            <div className="stat-num">1</div>
            <div className="stat-label">Verification Link</div>
          </div>
          <div className="stat">
            <div className="stat-num">100%</div>
            <div className="stat-label">Encrypted at Rest</div>
          </div>
        </div>

        {/* --- For Lenders --- */}
        <section className="features">
          <div className="features-header">
            <div className="section-tag">For loan officers</div>
            <h2>Send a link. Get a complete report.</h2>
            <p>
              Stop chasing documents. Enter a borrower&apos;s phone number or email, and RAVEN handles
              everything — consent collection, bank connection, identity checks, and data enrichment.
              You get a formatted report ready for your loan file.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
              </div>
              <h3>One-Click Verification</h3>
              <p>Enter a phone number or email. RAVEN sends your borrower a branded verification link — by text or email. No portals, no logins, no back-and-forth.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3>Print-Ready Reports</h3>
              <p>Every verification produces a formatted PDF report with identity, income, credit, employment, and property data — ready to drop into a loan file.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <h3>Real-Time Status</h3>
              <p>Track every verification from your dashboard. See when the borrower opens the link, completes each step, and when the report is ready to review.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3>Audit-Ready Compliance</h3>
              <p>Every data point is sourced and timestamped. Full audit trails, borrower consent records, and field-level provenance — all in one place for examiners.</p>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* --- For Borrowers --- */}
        <section className="features">
          <div className="features-header">
            <div className="section-tag">For borrowers</div>
            <h2>Five minutes. No paperwork.</h2>
            <p>
              Borrowers receive a simple link — no app downloads, no account creation, no scanning
              documents. They confirm their identity, connect their bank, and they&apos;re done.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              </div>
              <h3>Works on Any Device</h3>
              <p>Borrowers open a link on their phone, tablet, or computer. No app to install, no account to create. The entire process works in a mobile browser.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h3>Guided Identity Check</h3>
              <p>A few quick questions to confirm their identity — name, date of birth, and last four of their SSN. Verified instantly against multiple sources.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <h3>Secure Bank Connection</h3>
              <p>Borrowers connect their bank through Plaid — the same technology used by Venmo, Robinhood, and thousands of financial apps. Read-only access, no credentials shared.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>Privacy First</h3>
              <p>All data is encrypted end-to-end and only shared with the lender the borrower is working with. Clear consent at every step. Nothing is collected without permission.</p>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* --- What's in the report --- */}
        <section className="features">
          <div className="features-header">
            <div className="section-tag">What you get</div>
            <h2>Everything you need for the loan file.</h2>
            <p>
              One verification produces a comprehensive borrower report covering every dimension
              lenders need — sourced from 18+ data providers and cross-referenced automatically.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h3>Identity &amp; KYC</h3>
              <p>Name, SSN, and date of birth verified against multiple sources. Fraud risk scoring, watchlist screening, and synthetic identity detection.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3>Income &amp; Assets</h3>
              <p>Bank account balances, income streams, and transaction history. Categorized spending patterns and cash flow analysis.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3>Credit History</h3>
              <p>Credit scores, tradelines, payment history, outstanding liabilities, and utilization rates from all three bureaus.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <h3>Employment</h3>
              <p>Current and past employers, job titles, salary information, and employment dates — verified directly with employers.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h3>Property &amp; Residence</h3>
              <p>Address verification, ownership history, property valuations, tax assessments, and length of residence at current address.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3>Full Audit Trail</h3>
              <p>Every data point timestamped and sourced. Consent records, verification steps, and field-level provenance — ready for regulatory review.</p>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* --- Integrations --- */}
        <section className="integrations">
          <div className="integrations-header">
            <div className="section-tag">Integrations</div>
            <h2>Works with your core.</h2>
            <p>
              Enriched borrower data flows directly into the core banking and loan origination
              systems your team already uses. No manual re-entry.
            </p>
          </div>
          <div className="integrations-grid">
            <div className="integration-card">
              <div className="integration-name">Jack Henry</div>
              <div className="integration-type">Core Banking</div>
              <p className="integration-desc">
                Push verified borrower profiles and loan application data directly into your
                core through the jXchange API layer.
              </p>
              <div className="integration-platforms">
                <span>SilverLake</span>
                <span>CIF 20/20</span>
                <span>Symitar</span>
              </div>
            </div>
            <div className="integration-card">
              <div className="integration-name">Fiserv</div>
              <div className="integration-type">Core Banking</div>
              <p className="integration-desc">
                Export enriched customer records and credit applications via the Banking Hub
                API across all Fiserv platforms.
              </p>
              <div className="integration-platforms">
                <span>DNA</span>
                <span>Premier</span>
                <span>Precision</span>
              </div>
            </div>
            <div className="integration-card">
              <div className="integration-name">FIS</div>
              <div className="integration-type">Core Banking</div>
              <p className="integration-desc">
                Real-time event-driven sync for Modern Banking Platform, plus batch and API
                export for legacy cores.
              </p>
              <div className="integration-platforms">
                <span>MBP</span>
                <span>IBS</span>
                <span>Horizon</span>
              </div>
            </div>
          </div>
          <p className="integrations-also">
            Also works with leading loan origination systems including{' '}
            <strong>nCino</strong>, <strong>Abrigo</strong>, and <strong>Baker Hill</strong>.
          </p>
        </section>

        <div className="divider" />

        <section id="get-started" className="cta">
          <div className="cta-inner">
            <div className="section-tag">Get started</div>
            <h2>Ready to move faster?</h2>
            <p>
              RAVEN is currently in early access for regional banks and lending platforms. Leave your
              info and we&apos;ll reach out to schedule a demo.
            </p>
            <InterestForm />
            <p className="cta-alt">
              Or email us directly at{' '}
              <a href="mailto:contact@reportraven.tech">contact@reportraven.tech</a>
            </p>
          </div>
        </section>

        <footer>
          <div>
            <span>&copy; 2026 RAVEN. All rights reserved.</span>
            <span style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.65rem', color: 'var(--gray-600)', letterSpacing: '0.05em' }}>A South Carolina company</span>
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
