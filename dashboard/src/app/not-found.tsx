import Link from 'next/link';
import { SiteShell } from './(marketing)/site-shell';

export default function NotFound() {
  return (
    <SiteShell ctaSource="404">
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '8rem 2rem',
          gap: '1.25rem',
        }}
      >
        <p
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.25em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
          }}
        >
          404
        </p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--white)' }}>
          Page not found
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--gray-400)', maxWidth: '28rem', lineHeight: 1.6 }}>
          That page doesn&rsquo;t exist or has moved.
        </p>
        <Link
          href="/"
          style={{
            marginTop: '0.75rem',
            display: 'inline-block',
            background: 'var(--white)',
            color: 'var(--black)',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Back to home
        </Link>
      </section>
    </SiteShell>
  );
}
