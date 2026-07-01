import { ImageResponse } from 'next/og';

// Site-wide default OG image. Applies to every route that doesn't define its
// own opengraph-image; LinkedIn/Twitter cards were blank without it.

export const alt = 'RAVEN — Borrower Verification for Community Banks';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
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
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: 12,
            color: '#6C8EFF',
            marginBottom: 36,
          }}
        >
          RAVEN
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.1,
            letterSpacing: -2,
            maxWidth: 900,
          }}
        >
          Borrower verification for community banks
        </div>
        <div
          style={{
            fontSize: 30,
            color: '#A3A3A3',
            marginTop: 32,
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          One link. Identity, income, credit, employment, and property data verified in minutes.
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            left: 96,
            fontSize: 26,
            color: '#6C8EFF',
          }}
        >
          reportraven.tech
        </div>
      </div>
    ),
    size,
  );
}
