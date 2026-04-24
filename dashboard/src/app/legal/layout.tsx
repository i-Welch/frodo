import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#E5E5E5', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.14em' }}>
          RAVEN
        </Link>
        <Link href="/" style={{ color: '#A3A3A3', textDecoration: 'none', fontSize: '0.85rem' }}>
          Back to home
        </Link>
      </nav>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        {children}
      </main>
      <footer style={{ padding: '2rem 3rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#525252' }}>&copy; 2026 RAVEN. All rights reserved.</span>
      </footer>
      <style>{`
        .legal h1 { font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .legal h2 { font-size: 1.3rem; font-weight: 600; color: #fff; margin-top: 2.5rem; margin-bottom: 0.75rem; }
        .legal h3 { font-size: 1.05rem; font-weight: 600; color: #D4D4D4; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .legal p { font-size: 0.9rem; line-height: 1.7; color: #A3A3A3; margin-bottom: 1rem; }
        .legal ul, .legal ol { font-size: 0.9rem; line-height: 1.7; color: #A3A3A3; margin-bottom: 1rem; padding-left: 1.5rem; }
        .legal li { margin-bottom: 0.4rem; }
        .legal code { font-size: 0.8rem; background: rgba(255,255,255,0.06); padding: 0.15rem 0.4rem; border-radius: 4px; color: #D4D4D4; }
        .legal strong { color: #D4D4D4; }
        .legal a { color: #A3A3A3; text-decoration: underline; }
        .legal a:hover { color: #fff; }
        .legal .last-updated { font-size: 0.8rem; color: #737373; margin-bottom: 2rem; }
        .legal table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.85rem; }
        .legal th, .legal td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.06); color: #A3A3A3; }
        .legal th { color: #D4D4D4; font-weight: 600; }
      `}</style>
    </div>
  );
}
