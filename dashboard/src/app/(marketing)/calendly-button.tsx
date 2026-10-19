'use client';

import { track } from '@vercel/analytics';

const CALENDLY_URL = 'https://calendly.com/welchcisaac/raven-intro';
const WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css';
const WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js';

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
    };
  }
}

let widgetLoading: Promise<void> | undefined;

// Calendly's CSS and script load on the first click rather than with every
// page: the stylesheet was render-blocking and set a third-party cookie.
function loadWidget(): Promise<void> {
  widgetLoading ??= new Promise<void>((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = WIDGET_CSS;
    document.head.appendChild(css);
    const script = document.createElement('script');
    script.src = WIDGET_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Calendly failed to load'));
    document.head.appendChild(script);
  });
  return widgetLoading;
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
  async function handleClick() {
    track('get_demo_click', { source });
    try {
      await loadWidget();
      window.Calendly!.initPopupWidget({ url: CALENDLY_URL });
    } catch {
      window.open(CALENDLY_URL, '_blank', 'noopener');
    }
  }

  return (
    <button type="button" className={buttonClassName} onClick={handleClick} onPointerEnter={() => void loadWidget()}>
      {label}
    </button>
  );
}
