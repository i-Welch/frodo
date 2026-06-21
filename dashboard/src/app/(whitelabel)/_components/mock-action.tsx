'use client';

import { useState } from 'react';

/**
 * Wraps a control that is intentionally non-functional in the demo. Clicking it
 * surfaces a small popover explaining that it's mocked but works on the live
 * site, instead of silently doing nothing. Render-prop style so the caller
 * keeps full control of the trigger's markup/styling:
 *
 *   <MockAction note="...">{(toggle) => <button onClick={toggle}>…</button>}</MockAction>
 */
export function MockAction({
  note,
  title = 'Demo preview',
  placement = 'bottom',
  align = 'left',
  children,
}: {
  note: React.ReactNode;
  title?: string;
  placement?: 'top' | 'bottom';
  align?: 'left' | 'right';
  children: (toggle: (e?: { preventDefault?: () => void }) => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    setOpen((v) => !v);
  };

  return (
    <span className="mock-action">
      {children(toggle)}
      {open && (
        <span className={`mock-note mock-${placement} mock-${align}`} role="status">
          <span className="mock-note-title">{title}</span>
          <span className="mock-note-body">{note}</span>
          <button type="button" className="mock-note-x" onClick={() => setOpen(false)}>Got it</button>
        </span>
      )}
      <style>{`
        .mock-action { position: relative; display: inline-block; }
        .mock-note {
          position: absolute; z-index: 50; width: 270px; max-width: 78vw; text-align: left;
          font-size: 0.76rem; line-height: 1.5; color: #344054;
          background: #fff; border: 1px solid #e4e7ec; border-radius: 10px;
          padding: 0.75rem 0.85rem; box-shadow: 0 12px 32px rgba(16,24,40,0.16);
          animation: mockIn 160ms ease-out both;
        }
        @keyframes mockIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .mock-bottom { top: calc(100% + 8px); }
        .mock-top { bottom: calc(100% + 8px); }
        .mock-left { left: 0; }
        .mock-right { right: 0; }
        .mock-note::after { content: ''; position: absolute; border: 6px solid transparent; }
        .mock-top::after { top: 100%; border-top-color: #fff; }
        .mock-bottom::after { bottom: 100%; border-bottom-color: #fff; }
        .mock-left::after { left: 18px; }
        .mock-right::after { right: 18px; }
        .mock-note-title { display: block; font-weight: 700; color: #006242; margin-bottom: 0.25rem; }
        .mock-note-body { display: block; }
        .mock-note-x {
          display: block; margin-top: 0.65rem; font-family: inherit; font-size: 0.72rem;
          font-weight: 700; color: #006242; background: none; border: none; padding: 0; cursor: pointer;
        }
        .mock-note-x:hover { text-decoration: underline; }
      `}</style>
    </span>
  );
}
