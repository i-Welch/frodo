'use client';

import Script from 'next/script';
import { track } from '@vercel/analytics';

const CALENDLY_URL = 'https://calendly.com/welchcisaac/raven-intro';

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
    };
  }
}

export function CalendlyButton({
  source,
  label = 'Book a Demo',
  buttonClassName = 'demo-btn',
}: {
  source: string;
  label?: string;
  buttonClassName?: string;
}) {
  function handleClick() {
    track('get_demo_click', { source });
    window.Calendly?.initPopupWidget({ url: CALENDLY_URL });
  }

  return (
    <>
      <link
        href="https://assets.calendly.com/assets/external/widget.css"
        rel="stylesheet"
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
      <button type="button" className={buttonClassName} onClick={handleClick}>
        {label}
      </button>
    </>
  );
}
