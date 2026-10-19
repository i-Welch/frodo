'use client';

import { useState } from 'react';
import { track } from '@vercel/analytics';

type Variant = 'subscribe' | 'audit';

// Latest call report figures the API returns for a confident FDIC match.
interface BankSnapshot {
  name: string;
  city: string;
  state: string;
  quarter: string;
  assets: string;
  deposits: string;
  loans: string;
  loanGrowthPct?: number;
  roaPct: number;
}

const COPY: Record<Variant, { tag: string; title: string; body: string; button: string; done: string }> = {
  subscribe: {
    tag: 'RAVEN Research',
    title: 'Get the next deep dive by email',
    body: 'New analyses of community banks and credit unions, built from FDIC, NCUA, HMDA and SEC filings. No spam, unsubscribe anytime.',
    button: 'Subscribe',
    done: "You're on the list. Check your inbox for a note from Isaac.",
  },
  audit: {
    tag: 'Free for your institution',
    title: 'Want this analysis for your bank?',
    body: "Tell us your bank or credit union and we'll send a free digital lending audit: your current borrower journey, the gaps, and what verification automation would save, built from your public call report and HMDA data.",
    button: 'Request my free audit',
    done: "Request received. We'll email your audit within a few business days.",
  },
};

export function LeadCapture({
  variant,
  source,
  title,
  defaultBank = '',
}: {
  variant: Variant;
  source: string;
  title?: string;
  /** Prefills the bank field on pages already about one bank. */
  defaultBank?: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bank, setBank] = useState(defaultBank);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [snapshot, setSnapshot] = useState<BankSnapshot | undefined>();
  const copy = COPY[variant];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/v1/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: variant,
          email,
          source,
          ...(variant === 'audit' ? { name, bank } : {}),
          ...(website ? { website } : {}),
        }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json().catch(() => ({}))) as { snapshot?: BankSnapshot };
      setSnapshot(data.snapshot);
      setStatus('success');
      track('lead_submitted', { kind: variant, source });
    } catch {
      setStatus('error');
    }
  }

  return (
    <aside className={`lead-card lead-card--${variant}`}>
      <style>{`
        .lead-card {
          margin: 2.5rem 0 1rem;
          padding: 2rem 2.25rem;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
        }
        .lead-card--audit {
          border-color: rgba(108,142,255,0.35);
          background: linear-gradient(135deg, rgba(108,142,255,0.10), rgba(255,255,255,0.02));
        }
        .lead-tag {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gray-400);
          margin-bottom: 0.6rem;
        }
        .lead-card h2 {
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          color: var(--white);
          margin: 0 0 0.5rem;
        }
        .lead-card p { font-size: 0.92rem; line-height: 1.6; color: var(--gray-400); margin: 0 0 1.25rem; }
        .lead-form { display: flex; flex-wrap: wrap; gap: 0.6rem; }
        .lead-input {
          flex: 1 1 200px;
          min-width: 0;
          font-family: inherit;
          font-size: 0.9rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(0,0,0,0.35);
          color: var(--white);
        }
        .lead-input::placeholder { color: var(--gray-500); }
        .lead-input:focus { outline: none; border-color: var(--accent); }
        .lead-btn {
          flex: 0 0 auto;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.75rem 1.4rem;
          border-radius: 8px;
          border: none;
          background: var(--white);
          color: var(--black);
          cursor: pointer;
          transition: opacity 200ms;
        }
        .lead-btn:hover { opacity: 0.85; }
        .lead-btn:disabled { opacity: 0.6; cursor: default; }
        .lead-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
        .lead-done { font-size: 0.95rem; color: var(--white); margin: 0; }
        .lead-snap { margin-top: 1.25rem; padding-top: 1.1rem; border-top: 1px solid rgba(255,255,255,0.1); }
        .lead-snap-label { font-size: 0.8rem; color: var(--gray-400); margin: 0 0 0.75rem !important; }
        .lead-snap-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
        .lead-snap-grid strong { display: block; font-size: 1.1rem; color: var(--white); font-weight: 600; }
        .lead-snap-grid span { display: block; font-size: 0.72rem; line-height: 1.35; color: var(--gray-400); }
        .lead-snap-note { font-size: 0.8rem !important; color: var(--gray-400); margin: 0.9rem 0 0 !important; }
        @media (max-width: 700px) { .lead-snap-grid { grid-template-columns: repeat(2, 1fr); } }
        .lead-error { font-size: 0.85rem; color: #ff8a8a; margin: 0.75rem 0 0; }
        @media (max-width: 700px) {
          .lead-card { padding: 1.6rem 1.25rem; }
          .lead-btn { flex: 1 1 100%; }
        }
      `}</style>
      <span className="lead-tag">{copy.tag}</span>
      <h2>{title ?? copy.title}</h2>
      {status === 'success' ? (
        <>
          <p className="lead-done">{copy.done}</p>
          {snapshot && (
            <div className="lead-snap">
              <p className="lead-snap-label">
                While you wait: {snapshot.name} ({snapshot.city}, {snapshot.state}), {snapshot.quarter} FDIC call report
              </p>
              <div className="lead-snap-grid">
                <div><strong>{snapshot.assets}</strong><span>Total assets</span></div>
                <div><strong>{snapshot.loans}</strong><span>Net loans</span></div>
                <div>
                  <strong>{snapshot.loanGrowthPct === undefined ? '–' : `${snapshot.loanGrowthPct > 0 ? '+' : ''}${snapshot.loanGrowthPct}%`}</strong>
                  <span>Loan growth, 1 yr</span>
                </div>
                <div><strong>{snapshot.roaPct}%</strong><span>Return on assets</span></div>
              </div>
              <p className="lead-snap-note">
                Your audit goes further: the borrower journey on your site today, the gaps, and what
                source-verified intake would save, from your call report and HMDA data.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <p>{copy.body}</p>
          <form className="lead-form" onSubmit={handleSubmit}>
            {variant === 'audit' && (
              <>
                <input className="lead-input" type="text" placeholder="Your name" value={name}
                  onChange={(e) => setName(e.target.value)} required maxLength={120} autoComplete="name" />
                <input className="lead-input" type="text" placeholder="Bank or credit union" value={bank}
                  onChange={(e) => setBank(e.target.value)} required maxLength={160} autoComplete="organization" />
              </>
            )}
            <input className="lead-input" type="email" placeholder="Work email" value={email}
              onChange={(e) => setEmail(e.target.value)} required maxLength={254} autoComplete="email" />
            <div className="lead-hp" aria-hidden="true">
              <input type="text" tabIndex={-1} autoComplete="off" value={website}
                onChange={(e) => setWebsite(e.target.value)} name="website" />
            </div>
            <button className="lead-btn" type="submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending...' : copy.button}
            </button>
          </form>
          {status === 'error' && <p className="lead-error">Something went wrong. Please try again.</p>}
        </>
      )}
    </aside>
  );
}
