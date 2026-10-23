// The site-wide card from app/opengraph-image.tsx. Pages that set their own
// `openGraph` metadata replace the inherited one, image included, so pages
// without their own opengraph-image file list this explicitly.
export const DEFAULT_OG_IMAGES = [
  {
    url: 'https://reportraven.tech/opengraph-image',
    width: 1200,
    height: 630,
    alt: 'RAVEN: Borrower Verification for Community Banks',
  },
];
