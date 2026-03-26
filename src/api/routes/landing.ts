import { Elysia } from 'elysia';

/**
 * Landing page at /
 */
export const landingRoute = new Elysia()
  .get('/', () => {
    return new Response(LANDING_HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  });

const RAVEN_PATH = 'M2162.9,2626.4c17.1-6.3,35.7-13.6,48.6-20.1-51.8-.7-99,.5-146.3-2.5-162.9-10.5-321.8-40.2-475.8-94.7-166.9-59.1-321-140.7-453.7-259.6-62.1-55.7-115.4-118.4-149.3-195.7-26.4-60.1-37.6-122.5-21.4-187.2,40.1-160.7,200.7-247.3,361.8-218-40.9,6.9-78.6,15.9-111.1,38.7-32.7,22.9-58.8,51.1-72.2,91.7,36.3-26.9,91.2-50.3,120.1-51.6-2.5,1.9-4.3,3.6-6.4,5-68.4,45.2-101.9,109.3-103.6,190.8-1.5,69.4,23.3,130.2,60.2,187.1,59.4,91.5,140.5,160.3,231.8,217.9,111.4,70.2,231,119.8,354.7,155.9,104,30.3,211.3,49.4,320,51.4,13.3.2,26.7,0,40,0-6.1-6.8-12.7-10.1-19-13.8-49-29.3-81.5-73.1-106-123.2-29.6-60.7-58.7-122.2-87.8-183.2-61.6-129.2-138.6-248-238.7-351.1-71.7-73.8-152.5-134.8-247.9-174.8-6.9-2.9-11.5-7.8-15.8-13.5-29.2-38.3-54-79.1-69.9-124.8-20.3-58.6-22.5-117.4.7-175.8,26.8-67.4,77.5-111.8,140.8-143.3,59.7-29.7,123.7-45.2,189.1-56.1,85.4-14.3,171.3-19.1,257.7-11.2,26.4,2.4,52.3,8.2,79.6,12.8-1.6-3.8-2.4-6.2-3.5-8.4-2.8-5.4-5.4-10.8-8.6-16-37.3-61.5-87.7-110.2-148.5-148.2-110.1-68.9-232.1-98.4-360.2-105.6-33.6-1.9-61.3-9.6-89.6-30.3-109.5-80.1-233.4-107.2-367.7-91.9-103.9,11.8-197.9,48.4-283.8,107.6-91.3,62.8-170.3,141.4-263.4,201.4,1.3,3.6,3.6,2.7,5.4,2.8,70.6,3.8,138.8-11.9,207.7-25.2-142.7,75.7-262.1,171.7-303,338.1,41.4-38.3,88-67.6,140.8-87.1-39,42-68.8,89.9-92.5,141.4-79.6,173.1-94.5,354.4-61,539.8,31.9,177,108.7,333.6,226.4,469.8,6.6,7.6,13.6,14.9,20.7,22.1,6.6,6.8,13.5,13.3,23.1,22.7l254,162c139.8,87.7,294.6,130.1,457.6,141.8,166.5,12,330.1-7.8,489.8-57.3,12.2-3.8,24.1-8.5,36-13.1s19.2-8.2,28.5-13.1l114-60.6c31.6-16.8,64.3-31.5,97.9-43.8ZM1326.1,1075.5c50.8-26.4,106-35.6,161.9-39.4,111.3-7.5,221.7-2.3,329.1,32,28.7,9.2,56.6,20.3,85.5,35-222-20.9-439.8-17.1-656.4,43.6,23-29.9,47.6-54.5,79.8-71.3ZM1150.4,943.8c31.7.5,57,26.5,56.9,58.5,0,30.6-26.9,56.6-57.6,55.9-31.8-.8-57-27-56.6-58.8.4-31.6,25.6-56,57.3-55.5Z';

const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RAVEN — Borrower Verification for Regional Banks</title>
  <meta name="description" content="RAVEN pulls identity, credit, financial, property, and employment data from 18+ providers through a single API. Verify borrowers in seconds, not days." />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3000 3000'%3E%3Cstyle%3Epath,circle%7Bfill:%230A0A0A;stroke:%230A0A0A%7D@media(prefers-color-scheme:dark)%7Bpath,circle%7Bfill:%23fff;stroke:%23fff%7D%7D%3C/style%3E%3Cpath d='${RAVEN_PATH}'/%3E%3Ccircle cx='1500' cy='1500' r='1319.5' fill='none' stroke-width='109'/%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet" />
  <style>
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

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--black);
      color: var(--white);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* --- Nav --- */
    nav {
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
    .cta-email {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--white);
      text-decoration: none;
      padding: 0.9rem 2rem;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      display: inline-block;
      transition: all 200ms;
      letter-spacing: 0.01em;
    }
    .cta-email:hover {
      background: var(--white);
      color: var(--black);
      border-color: var(--white);
    }

    /* --- Footer --- */
    footer {
      padding: 2rem 3rem;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    footer span {
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
      nav { padding: 1rem 1.5rem; }
      .nav-links { display: none; }
      .hero { padding: 7rem 1.5rem 4rem; }
      .hero h1 { font-size: 2.2rem; }
      .hero-watermark { width: 80vw; right: -20%; opacity: 0.03; }
      .stats { grid-template-columns: repeat(2, 1fr); }
      .features { padding: 4rem 1.5rem; }
      .features-grid { grid-template-columns: 1fr; }
      .cta { padding: 4rem 1.5rem; }
      footer { padding: 1.5rem; flex-direction: column; gap: 1rem; }
      .divider { margin: 0 1.5rem; }
    }
  </style>
</head>
<body>

  <nav>
    <div class="nav-logo">
      <svg width="22" height="22" viewBox="0 0 3000 3000" fill="currentColor">
        <path d="${RAVEN_PATH}"/>
        <circle cx="1500" cy="1500" r="1319.5" fill="none" stroke="currentColor" stroke-width="109"/>
      </svg>
      <span class="nav-wordmark">RAVEN</span>
    </div>
    <div class="nav-links">
      <a href="/legal/security">Security</a>
      <a href="/legal/privacy-policy">Privacy</a>
      <a href="mailto:contact@reportraven.tech" class="nav-cta">Request Access</a>
    </div>
  </nav>

  <section class="hero">
    <svg class="hero-watermark" viewBox="0 0 3000 3000" fill="currentColor">
      <path d="${RAVEN_PATH}"/>
      <circle cx="1500" cy="1500" r="1319.5" fill="none" stroke="currentColor" stroke-width="109"/>
    </svg>
    <div class="hero-content">
      <span class="hero-tag">Borrower verification infrastructure</span>
      <h1>Verify borrowers<br/>in seconds, <em>not days.</em></h1>
      <p class="hero-sub">RAVEN aggregates identity, credit, financial, property, and employment data from 18+ providers through a single API. Built for regional banks doing CRE, small business, and mortgage lending.</p>
      <div class="hero-actions">
        <a href="mailto:contact@reportraven.tech" class="btn btn-white">Request Access</a>
        <a href="/legal/security" class="btn btn-ghost">Security &amp; Compliance</a>
      </div>
    </div>
  </section>

  <div class="stats">
    <div class="stat">
      <div class="stat-num">18+</div>
      <div class="stat-label">Data Providers</div>
    </div>
    <div class="stat">
      <div class="stat-num">1</div>
      <div class="stat-label">API Call</div>
    </div>
    <div class="stat">
      <div class="stat-num">8</div>
      <div class="stat-label">Data Modules</div>
    </div>
    <div class="stat">
      <div class="stat-num">AES-256</div>
      <div class="stat-label">Encryption at Rest</div>
    </div>
  </div>

  <section class="features">
    <div class="features-header">
      <div class="section-tag">How it works</div>
      <h2>One API call. Complete borrower profile.</h2>
      <p>Send a borrower's email or phone number. RAVEN generates a secure form, collects consent, connects their bank, and enriches every data point automatically.</p>
    </div>
    <div class="features-grid">
      <div class="feature">
        <div class="feature-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <h3>Identity Verification</h3>
        <p>Cross-reference name, SSN, and DOB across LexisNexis, Socure, and credit bureau header data. Bank-verified identity via Plaid.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        </div>
        <h3>Financial Data</h3>
        <p>Bank accounts, balances, income streams, and transaction history via Plaid, MX, or Finicity. Buying patterns analyzed automatically.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <h3>Property &amp; Residence</h3>
        <p>Ownership verification, AVMs, tax assessments, and hazard data from ATTOM, HouseCanary, Cotality, and First American.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h3>Audit Trail &amp; Encryption</h3>
        <p>Every data point event-sourced with confidence scores and provenance. Field-level AES-256-GCM encryption with per-user keys via KMS.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h3>Credit Bureau Data</h3>
        <p>Tri-merge credit reports from Experian, TransUnion, and Equifax. Scores, tradelines, inquiries, and liabilities in a single response.</p>
      </div>
      <div class="feature">
        <div class="feature-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <h3>Employment &amp; Income</h3>
        <p>Employment verification via Truework. Bank income analysis via Plaid. Degree verification via National Student Clearinghouse.</p>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <section class="cta">
    <div class="cta-inner">
      <div class="section-tag">Get started</div>
      <h2>Ready to move faster?</h2>
      <p>RAVEN is currently in early access for regional banks and lending platforms. Contact us to schedule a demo and get API credentials.</p>
      <a href="mailto:contact@reportraven.tech" class="cta-email">contact@reportraven.tech</a>
    </div>
  </section>

  <footer>
    <span>&copy; 2026 RAVEN. All rights reserved.</span>
    <div class="footer-links">
      <a href="/legal/privacy-policy">Privacy Policy</a>
      <a href="/legal/terms-of-service">Terms of Service</a>
      <a href="/legal/security">Security</a>
    </div>
  </footer>

</body>
</html>`;
