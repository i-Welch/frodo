import { DM_Sans, Fraunces } from 'next/font/google';

// Self-hosted by next/font: no render-blocking request to fonts.googleapis.com
// (previously @import-ed in each page's <style>, which delayed first paint).
// Pages reference these as var(--font-dm-sans) / var(--font-fraunces).

export const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
});

export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
});
