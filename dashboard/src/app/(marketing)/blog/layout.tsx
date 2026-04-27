import { InterestForm } from '../interest-form';

const RAVEN_PATH =
  'M2162.9,2626.4c17.1-6.3,35.7-13.6,48.6-20.1-51.8-.7-99,.5-146.3-2.5-162.9-10.5-321.8-40.2-475.8-94.7-166.9-59.1-321-140.7-453.7-259.6-62.1-55.7-115.4-118.4-149.3-195.7-26.4-60.1-37.6-122.5-21.4-187.2,40.1-160.7,200.7-247.3,361.8-218-40.9,6.9-78.6,15.9-111.1,38.7-32.7,22.9-58.8,51.1-72.2,91.7,36.3-26.9,91.2-50.3,120.1-51.6-2.5,1.9-4.3,3.6-6.4,5-68.4,45.2-101.9,109.3-103.6,190.8-1.5,69.4,23.3,130.2,60.2,187.1,59.4,91.5,140.5,160.3,231.8,217.9,111.4,70.2,231,119.8,354.7,155.9,104,30.3,211.3,49.4,320,51.4,13.3.2,26.7,0,40,0-6.1-6.8-12.7-10.1-19-13.8-49-29.3-81.5-73.1-106-123.2-29.6-60.7-58.7-122.2-87.8-183.2-61.6-129.2-138.6-248-238.7-351.1-71.7-73.8-152.5-134.8-247.9-174.8-6.9-2.9-11.5-7.8-15.8-13.5-29.2-38.3-54-79.1-69.9-124.8-20.3-58.6-22.5-117.4.7-175.8,26.8-67.4,77.5-111.8,140.8-143.3,59.7-29.7,123.7-45.2,189.1-56.1,85.4-14.3,171.3-19.1,257.7-11.2,26.4,2.4,52.3,8.2,79.6,12.8-1.6-3.8-2.4-6.2-3.5-8.4-2.8-5.4-5.4-10.8-8.6-16-37.3-61.5-87.7-110.2-148.5-148.2-110.1-68.9-232.1-98.4-360.2-105.6-33.6-1.9-61.3-9.6-89.6-30.3-109.5-80.1-233.4-107.2-367.7-91.9-103.9,11.8-197.9,48.4-283.8,107.6-91.3,62.8-170.3,141.4-263.4,201.4,1.3,3.6,3.6,2.7,5.4,2.8,70.6,3.8,138.8-11.9,207.7-25.2-142.7,75.7-262.1,171.7-303,338.1,41.4-38.3,88-67.6,140.8-87.1-39,42-68.8,89.9-92.5,141.4-79.6,173.1-94.5,354.4-61,539.8,31.9,177,108.7,333.6,226.4,469.8,6.6,7.6,13.6,14.9,20.7,22.1,6.6,6.8,13.5,13.3,23.1,22.7l254,162c139.8,87.7,294.6,130.1,457.6,141.8,166.5,12,330.1-7.8,489.8-57.3,12.2-3.8,24.1-8.5,36-13.1s19.2-8.2,28.5-13.1l114-60.6c31.6-16.8,64.3-31.5,97.9-43.8ZM1326.1,1075.5c50.8-26.4,106-35.6,161.9-39.4,111.3-7.5,221.7-2.3,329.1,32,28.7,9.2,56.6,20.3,85.5,35-222-20.9-439.8-17.1-656.4,43.6,23-29.9,47.6-54.5,79.8-71.3ZM1150.4,943.8c31.7.5,57,26.5,56.9,58.5,0,30.6-26.9,56.6-57.6,55.9-31.8-.8-57-27-56.6-58.8.4-31.6,25.6-56,57.3-55.5Z';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
        .blog-shell *, .blog-shell *::before, .blog-shell *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .blog-shell {
          font-family: 'DM Sans', sans-serif;
          background: var(--black);
          color: var(--white);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          min-height: 100vh;
        }

        /* --- Nav --- */
        .blog-shell nav {
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
        .blog-nav-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          color: var(--white);
        }
        .blog-nav-logo svg { opacity: 0.9; }
        .blog-nav-wordmark {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--white);
        }
        .blog-nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        .blog-nav-links a {
          color: var(--gray-400);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 400;
          transition: color 200ms;
        }
        .blog-nav-links a:hover { color: var(--white); }
        .blog-nav-cta {
          background: var(--white) !important;
          color: var(--black) !important;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-weight: 500 !important;
          transition: opacity 200ms !important;
        }
        .blog-nav-cta:hover { opacity: 0.85; color: var(--black) !important; }

        /* --- Main content area --- */
        .blog-main {
          padding-top: 5rem;
          min-height: calc(100vh - 5rem);
        }

        /* --- Article typography --- */
        .article-body h1 {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.025em;
          color: var(--white);
          margin-bottom: 1.5rem;
        }
        .article-body h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.25;
          letter-spacing: -0.015em;
          color: var(--white);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .article-body h3 {
          font-size: 1.15rem;
          font-weight: 600;
          line-height: 1.35;
          color: var(--gray-200);
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .article-body p {
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--gray-300);
          margin-bottom: 1.25rem;
        }
        .article-body strong {
          color: var(--white);
          font-weight: 600;
        }
        .article-body a {
          color: var(--gray-200);
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 200ms;
        }
        .article-body a:hover { color: var(--white); }
        .article-body ul, .article-body ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .article-body li {
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--gray-300);
          margin-bottom: 0.5rem;
        }
        .article-body hr {
          border: none;
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 2.5rem 0;
        }
        .article-body em {
          font-style: italic;
          color: var(--gray-400);
        }

        /* --- Article meta --- */
        .article-meta {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          margin-bottom: 2.5rem;
          font-size: 0.85rem;
          color: var(--gray-500);
        }
        .article-meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--gray-600);
        }

        /* --- CTA Section --- */
        .blog-cta {
          padding: 5rem 1.5rem;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: 4rem;
        }
        .blog-cta-inner {
          max-width: 520px;
          margin: 0 auto;
        }
        .blog-cta h2 {
          font-size: 2rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
          color: var(--white);
        }
        .blog-cta p {
          font-size: 1rem;
          color: var(--gray-400);
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        /* --- Interest form styles --- */
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
        .blog-cta-alt {
          margin-top: 1.25rem;
          font-size: 0.8rem;
          color: var(--gray-500);
        }
        .blog-cta-alt a {
          color: var(--gray-300);
          text-decoration: none;
          transition: color 200ms;
        }
        .blog-cta-alt a:hover { color: var(--white); }

        /* --- Footer --- */
        .blog-shell footer {
          padding: 2rem 3rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .blog-shell footer span {
          font-size: 0.75rem;
          color: var(--gray-600);
        }
        .blog-footer-links {
          display: flex;
          gap: 1.5rem;
        }
        .blog-footer-links a {
          font-size: 0.75rem;
          color: var(--gray-500);
          text-decoration: none;
          transition: color 200ms;
        }
        .blog-footer-links a:hover { color: var(--white); }

        /* --- Responsive --- */
        @media (max-width: 768px) {
          .blog-shell nav { padding: 1rem 1.5rem; }
          .blog-nav-links { display: none; }
          .blog-main { padding-top: 4rem; }
          .blog-cta { padding: 3rem 1.5rem; }
          .blog-shell footer { padding: 1.5rem; flex-direction: column; gap: 1rem; }
        }
      `}</style>

      <div className="blog-shell">
        <nav>
          <a href="/" className="blog-nav-logo">
            <svg
              width={22}
              height={22}
              viewBox="0 0 3000 3000"
              fill="currentColor"
            >
              <path d={RAVEN_PATH} />
              <circle cx="1500" cy="1500" r="1319.5" fill="none" stroke="currentColor" strokeWidth="109" />
            </svg>
            <span className="blog-nav-wordmark">RAVEN</span>
          </a>
          <div className="blog-nav-links">
            <a href="/blog">Blog</a>
            <a href="/">Home</a>
            <a href="https://app.reportraven.tech/legal/security" target="_blank" rel="noopener noreferrer">Security</a>
            <a href="https://app.reportraven.tech/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy</a>
            <a href="/#get-started" className="blog-nav-cta">
              Request Access
            </a>
          </div>
        </nav>

        <main className="blog-main">
          {children}
        </main>

        <section className="blog-cta">
          <div className="blog-cta-inner">
            <h2>Ready to move faster?</h2>
            <p>
              See how RAVEN replaces weeks of manual verification with a single link.
              Request early access for your bank.
            </p>
            <InterestForm />
            <p className="blog-cta-alt">
              Or email us at{' '}
              <a href="mailto:founders@reportraven.tech">founders@reportraven.tech</a>
            </p>
          </div>
        </section>

        <footer>
          <span>&copy; {new Date().getFullYear()} RAVEN</span>
          <div className="blog-footer-links">
            <a href="https://app.reportraven.tech/legal/security" target="_blank" rel="noopener noreferrer">Security</a>
            <a href="https://app.reportraven.tech/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy</a>
          </div>
        </footer>
      </div>
    </>
  );
}
