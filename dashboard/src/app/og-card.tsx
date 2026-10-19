import { ImageResponse } from 'next/og';

// Shared Open Graph card for pages that render their own title (articles,
// audits), in the same style as the site-wide default in opengraph-image.tsx.

export const OG_SIZE = { width: 1200, height: 630 };

export function ogCard({
  eyebrow,
  title,
  subtitle,
  stats = [],
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string }[];
}) {
  const titleSize = title.length > 80 ? 52 : title.length > 50 ? 60 : 68;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 96px',
          background: 'linear-gradient(135deg, #0A0A0A 0%, #101322 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(108,142,255,0.25) 0%, rgba(108,142,255,0) 70%)',
          }}
        />
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: 6, color: '#6C8EFF', marginBottom: 28, textTransform: 'uppercase' }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: titleSize, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.12, letterSpacing: -1.5, maxWidth: 1000 }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 28, color: '#A3A3A3', marginTop: 28, maxWidth: 960, lineHeight: 1.4 }}>{subtitle}</div>}
        {stats.length > 0 && (
          <div style={{ display: 'flex', gap: 56, marginTop: 40 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 44, fontWeight: 700, color: '#FFFFFF' }}>{s.value}</div>
                <div style={{ fontSize: 22, color: '#A3A3A3', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 48, left: 96, right: 96, display: 'flex', justifyContent: 'space-between', fontSize: 24 }}>
          <div style={{ color: '#FFFFFF', fontWeight: 600, letterSpacing: 8 }}>RAVEN</div>
          <div style={{ color: '#6C8EFF' }}>reportraven.tech</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
