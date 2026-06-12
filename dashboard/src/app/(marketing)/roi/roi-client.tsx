'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { track } from '@vercel/analytics';
import { InterestForm } from '../interest-form';

/* ---------- Hook: fire once when an element scrolls into view ---------- */

function useInView(threshold = 0.4) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ---------- Animated count-up number ---------- */

export function CountUp({
  value,
  prefix = '',
  suffix = '',
  durationMs = 1400,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
}) {
  const { ref, inView } = useInView(0.6);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, durationMs]);

  return (
    <span ref={ref as React.RefObject<HTMLDivElement>}>
      {prefix}
      {display.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}

/* ---------- Animated horizontal bar chart ---------- */

export interface BarDatum {
  label: string;
  sublabel?: string;
  value: number;
  display: string;
}

export function AnimatedBars({ data, ariaLabel }: { data: BarDatum[]; ariaLabel: string }) {
  const { ref, inView } = useInView(0.35);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div ref={ref} className="roi-bars" role="img" aria-label={ariaLabel}>
      {data.map((d, i) => (
        <div className="roi-bar-row" key={d.label}>
          <div className="roi-bar-head">
            <span className="roi-bar-label">
              {d.label}
              {d.sublabel && <span className="roi-bar-sublabel"> {d.sublabel}</span>}
            </span>
            <span className="roi-bar-value">{d.display}</span>
          </div>
          <div className="roi-bar-track">
            <div
              className="roi-bar-fill"
              style={{
                width: inView ? `${Math.max((d.value / max) * 100, 2)}%` : '0%',
                transitionDelay: `${i * 140}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Scenario range visual (conservative / expected / optimistic) ---------- */

export function ScenarioRange({
  low,
  mid,
  high,
}: {
  low: number;
  mid: number;
  high: number;
}) {
  const { ref, inView } = useInView(0.5);
  const fmt = (n: number) => `$${Math.round(n / 1000)}K`;

  return (
    <div ref={ref} className={`roi-range ${inView ? 'roi-range-in' : ''}`}>
      <div className="roi-range-track">
        <div className="roi-range-fill" />
        <div className="roi-range-marker roi-range-low" style={{ left: '0%' }}>
          <span className="roi-range-num">{fmt(low)}</span>
          <span className="roi-range-tag">Conservative</span>
        </div>
        <div
          className="roi-range-marker roi-range-mid"
          style={{ left: `${((mid - low) / (high - low)) * 100}%` }}
        >
          <span className="roi-range-num">{fmt(mid)}</span>
          <span className="roi-range-tag">Expected</span>
        </div>
        <div className="roi-range-marker roi-range-high" style={{ left: '100%' }}>
          <span className="roi-range-num">{fmt(high)}</span>
          <span className="roi-range-tag">Optimistic</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Scroll-triggered white-label demo modal ---------- */

export function WhiteLabelPrompt({ bankName, slug }: { bankName: string; slug: string }) {
  const sentinel = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setDismissed(true);
    try {
      sessionStorage.setItem('raven-wl-prompt', '1');
    } catch {
      /* private browsing */
    }
  }, []);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || dismissed) return;
    try {
      if (sessionStorage.getItem('raven-wl-prompt')) return;
    } catch {
      /* private browsing */
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true);
          track('whitelabel_prompt_shown', { source: `roi:${slug}` });
          obs.disconnect();
        }
      },
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [dismissed, slug]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  return (
    <>
      <div ref={sentinel} aria-hidden="true" />
      {open &&
        createPortal(
          <div
            className="demo-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <div className="demo-modal" role="dialog" aria-modal="true" aria-label="White label demo">
              <button type="button" className="demo-modal-close" onClick={close} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <h2>See this with your bank&apos;s branding</h2>
              <p>
                We&apos;ll set up a white label demo of RAVEN, with {bankName}&apos;s name and colors
                on the borrower flow and the verification report, so you can see exactly what your
                customers would see.
              </p>
              <InterestForm source={`roi-whitelabel:${slug}`} />
            </div>
          </div>,
          document.body,
        )}
      <style>{`
        .demo-modal-overlay, .demo-modal-overlay *, .demo-modal-overlay *::before, .demo-modal-overlay *::after {
          box-sizing: border-box;
        }
        @keyframes demoOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes demoModalIn {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .demo-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(10,10,10,0.45);
          backdrop-filter: blur(16px) saturate(160%);
          -webkit-backdrop-filter: blur(16px) saturate(160%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: demoOverlayIn 250ms ease-out both;
        }
        .demo-modal { animation: demoModalIn 380ms cubic-bezier(0.22, 1, 0.36, 1) 60ms both; }
        @media (prefers-reduced-motion: reduce) {
          .demo-modal-overlay, .demo-modal { animation: none; }
        }
        @media (max-width: 768px) {
          .demo-modal-overlay {
            backdrop-filter: blur(8px) saturate(160%);
            -webkit-backdrop-filter: blur(8px) saturate(160%);
          }
        }
        .demo-modal {
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 100%;
          max-width: 560px;
          background: rgba(23,23,23,0.85);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 3rem 2.5rem 2.5rem;
          text-align: center;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
        }
        .demo-modal h2 {
          font-size: 1.6rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--white);
          margin-bottom: 0.75rem;
        }
        .demo-modal > p {
          font-size: 0.95rem;
          color: var(--gray-400);
          line-height: 1.7;
          margin-bottom: 1.75rem;
        }
        .demo-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
          padding: 0.4rem;
          line-height: 0;
          transition: color 200ms;
        }
        .demo-modal-close:hover { color: var(--white); }
        .demo-modal .form-row { gap: 0.75rem; }
        .demo-modal .form-btn { flex-basis: 100%; margin-top: 0.5rem; }
      `}</style>
    </>
  );
}
