import { CalendlyButton } from './calendly-button';

// Shared shell for marketing sections outside /blog (glossary, solutions).
// Mirrors the blog layout's nav/footer so the site reads as one system.

const RAVEN_PATH =
  'M2162.9,2626.4c17.1-6.3,35.7-13.6,48.6-20.1-51.8-.7-99,.5-146.3-2.5-162.9-10.5-321.8-40.2-475.8-94.7-166.9-59.1-321-140.7-453.7-259.6-62.1-55.7-115.4-118.4-149.3-195.7-26.4-60.1-37.6-122.5-21.4-187.2,40.1-160.7,200.7-247.3,361.8-218-40.9,6.9-78.6,15.9-111.1,38.7-32.7,22.9-58.8,51.1-72.2,91.7,36.3-26.9,91.2-50.3,120.1-51.6-2.5,1.9-4.3,3.6-6.4,5-68.4,45.2-101.9,109.3-103.6,190.8-1.5,69.4,23.3,130.2,60.2,187.1,59.4,91.5,140.5,160.3,231.8,217.9,111.4,70.2,231,119.8,354.7,155.9,104,30.3,211.3,49.4,320,51.4,13.3.2,26.7,0,40,0-6.1-6.8-12.7-10.1-19-13.8-49-29.3-81.5-73.1-106-123.2-29.6-60.7-58.7-122.2-87.8-183.2-61.6-129.2-138.6-248-238.7-351.1-71.7-73.8-152.5-134.8-247.9-174.8-6.9-2.9-11.5-7.8-15.8-13.5-29.2-38.3-54-79.1-69.9-124.8-20.3-58.6-22.5-117.4.7-175.8,26.8-67.4,77.5-111.8,140.8-143.3,59.7-29.7,123.7-45.2,189.1-56.1,85.4-14.3,171.3-19.1,257.7-11.2,26.4,2.4,52.3,8.2,79.6,12.8-1.6-3.8-2.4-6.2-3.5-8.4-2.8-5.4-5.4-10.8-8.6-16-37.3-61.5-87.7-110.2-148.5-148.2-110.1-68.9-232.1-98.4-360.2-105.6-33.6-1.9-61.3-9.6-89.6-30.3-109.5-80.1-233.4-107.2-367.7-91.9-103.9,11.8-197.9,48.4-283.8,107.6-91.3,62.8-170.3,141.4-263.4,201.4,1.3,3.6,3.6,2.7,5.4,2.8,70.6,3.8,138.8-11.9,207.7-25.2-142.7,75.7-262.1,171.7-303,338.1,41.4-38.3,88-67.6,140.8-87.1-39,42-68.8,89.9-92.5,141.4-79.6,173.1-94.5,354.4-61,539.8,31.9,177,108.7,333.6,226.4,469.8,6.6,7.6,13.6,14.9,20.7,22.1,6.6,6.8,13.5,13.3,23.1,22.7l254,162c139.8,87.7,294.6,130.1,457.6,141.8,166.5,12,330.1-7.8,489.8-57.3,12.2-3.8,24.1-8.5,36-13.1s19.2-8.2,28.5-13.1l114-60.6c31.6-16.8,64.3-31.5,97.9-43.8ZM1326.1,1075.5c50.8-26.4,106-35.6,161.9-39.4,111.3-7.5,221.7-2.3,329.1,32,28.7,9.2,56.6,20.3,85.5,35-222-20.9-439.8-17.1-656.4,43.6,23-29.9,47.6-54.5,79.8-71.3ZM1150.4,943.8c31.7.5,57,26.5,56.9,58.5,0,30.6-26.9,56.6-57.6,55.9-31.8-.8-57-27-56.6-58.8.4-31.6,25.6-56,57.3-55.5Z';

export function SiteShell({ children, ctaSource }: { children: React.ReactNode; ctaSource: string }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

        :root {
          --black: #0A0A0A;
          --gray-900: #171717;
          --gray-600: #525252;
          --gray-500: #737373;
          --gray-400: #A3A3A3;
          --gray-300: #D4D4D4;
          --gray-200: #E5E5E5;
          --white: #FFFFFF;
          --accent: #6C8EFF;
          --accent-dim: rgba(108,142,255,0.12);
          --accent-border: rgba(108,142,255,0.25);
        }

        html { scroll-behavior: smooth; }
        .site-shell *, .site-shell *::before, .site-shell *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .site-shell {
          font-family: 'DM Sans', sans-serif;
          background: var(--black);
          color: var(--white);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .site-shell > nav {
          position: fixed;
          top: 0; left: 0; right: 0;
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
        .site-nav-logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: var(--white); }
        .site-nav-wordmark { font-size: 0.85rem; font-weight: 700; letter-spacing: 0.14em; color: var(--white); }
        .site-nav-links { display: flex; gap: 2rem; align-items: center; }
        .site-nav-links a { color: var(--gray-400); text-decoration: none; font-size: 0.85rem; transition: color 200ms; }
        .site-nav-links a:hover { color: var(--white); }
        .site-nav-cta {
          background: var(--white) !important;
          color: var(--black) !important;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-weight: 500 !important;
          transition: opacity 200ms !important;
        }
        .site-nav-cta:hover { opacity: 0.85; }
        button.site-nav-cta { font-family: 'DM Sans', sans-serif; font-size: 0.85rem; border: none; cursor: pointer; }
        .site-nav-mobile-link {
          display: none;
          color: var(--gray-300);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.5rem 0.9rem;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
        }

        .site-main { padding-top: 5rem; min-height: calc(100vh - 5rem); }

        .site-cta {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 4.5rem 2rem;
          text-align: center;
        }
        .site-cta-inner { max-width: 560px; margin: 0 auto; }
        .site-cta h2 { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.75rem; }
        .site-cta p { font-size: 0.95rem; color: var(--gray-400); line-height: 1.7; margin-bottom: 1.75rem; }
        .site-cta .form-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          padding: 0.85rem 1.75rem;
          border-radius: 8px;
          border: none;
          background: var(--white);
          color: var(--black);
          cursor: pointer;
          transition: opacity 200ms;
        }
        .site-cta .form-btn:hover { opacity: 0.85; }
        .site-cta-alt { margin-top: 1.5rem; font-size: 0.85rem; color: var(--gray-500); }
        .site-cta-alt a { color: var(--gray-300); }

        .site-shell footer {
          padding: 2rem 3rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .site-shell footer span { font-size: 0.75rem; color: var(--gray-600); }
        .site-footer-links { display: flex; gap: 1.5rem; }
        .site-footer-links a { font-size: 0.75rem; color: var(--gray-500); text-decoration: none; transition: color 200ms; }
        .site-footer-links a:hover { color: var(--white); }
        .site-footer-contact { margin-left: 1rem; }
        .site-footer-contact a { color: var(--gray-500); text-decoration: none; }
        .site-footer-contact a:hover { color: var(--white); }

        @media (max-width: 768px) {
          .site-shell > nav { padding: 1rem 1.5rem; }
          .site-nav-links { display: none; }
          .site-nav-mobile-link { display: inline-block; }
          .site-shell footer { padding: 1.5rem; flex-direction: column; gap: 1rem; }
        }
      `}</style>

      <div className="site-shell">
        <nav>
          <a href="/" className="site-nav-logo">
            <svg width={22} height={22} viewBox="0 0 3000 3000" fill="currentColor">
              <path d={RAVEN_PATH} />
              <circle cx="1500" cy="1500" r="1319.5" fill="none" stroke="currentColor" strokeWidth="109" />
            </svg>
            <span className="site-nav-wordmark">RAVEN</span>
          </a>
          <a href="/blog" className="site-nav-mobile-link">Blog</a>
          <div className="site-nav-links">
            <a href="/">Home</a>
            <a href="/blog">Blog</a>
            <a href="/solutions">Solutions</a>
            <a href="/integrations">Integrations</a>
            <a href="/glossary">Glossary</a>
            <a href="tel:+12293796131">(229) 379-6131</a>
            <CalendlyButton source={`${ctaSource}-nav`} label="Request a Demo" buttonClassName="site-nav-cta" />
          </div>
        </nav>

        <main className="site-main">{children}</main>

        <section className="site-cta">
          <div className="site-cta-inner">
            <h2>See it on your bank&rsquo;s loans</h2>
            <p>
              One link to the borrower, complete verification back in minutes. Book a
              20-minute call and we&rsquo;ll walk through a live demo for your bank.
            </p>
            <CalendlyButton source={`${ctaSource}-footer`} label="Book a Demo Call" buttonClassName="form-btn" />
            <p className="site-cta-alt">
              Or email us at <a href="mailto:isaac@reportraven.tech">isaac@reportraven.tech</a>
            </p>
          </div>
        </section>

        <footer>
          <span>
            &copy; {new Date().getFullYear()} RAVEN
            <span className="site-footer-contact">
              <a href="tel:+12293796131">(229) 379-6131</a>
              <span aria-hidden="true"> &middot; </span>
              <a href="mailto:isaac@reportraven.tech">isaac@reportraven.tech</a>
            </span>
          </span>
          <div className="site-footer-links">
            <a href="https://app.reportraven.tech/legal/security" target="_blank" rel="noopener noreferrer">Security</a>
            <a href="https://app.reportraven.tech/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy</a>
          </div>
        </footer>
      </div>
    </>
  );
}
