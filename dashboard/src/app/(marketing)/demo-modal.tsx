'use client';

import { useCallback, useEffect, useState } from 'react';
import { track } from '@vercel/analytics';
import { InterestForm } from './interest-form';

export function DemoModal({
  source,
  label = 'Get a Demo',
  buttonClassName = 'demo-btn',
}: {
  source: string;
  label?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

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

  function handleOpen() {
    track('get_demo_click', { source });
    setOpen(true);
  }

  return (
    <>
      <style>{`
        .demo-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          border: none;
          background: var(--white);
          color: var(--black);
          cursor: pointer;
          transition: opacity 200ms;
          white-space: nowrap;
        }
        .demo-btn:hover { opacity: 0.85; }
        .demo-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .demo-modal {
          position: relative;
          width: 100%;
          max-width: 560px;
          background: var(--gray-900);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 3rem 2.5rem 2.5rem;
          text-align: center;
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
        @media (max-width: 768px) {
          .demo-modal { padding: 2.5rem 1.5rem 2rem; }
        }
      `}</style>

      <button type="button" className={buttonClassName} onClick={handleOpen}>
        {label}
      </button>

      {open && (
        <div className="demo-modal-overlay" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="demo-modal" role="dialog" aria-modal="true" aria-label="Get a demo">
            <button type="button" className="demo-modal-close" onClick={close} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2>See RAVEN in action</h2>
            <p>
              Leave your name and work email and we&apos;ll reach out to schedule a walkthrough
              for your bank.
            </p>
            <InterestForm source={`demo-modal:${source}`} />
          </div>
        </div>
      )}
    </>
  );
}
