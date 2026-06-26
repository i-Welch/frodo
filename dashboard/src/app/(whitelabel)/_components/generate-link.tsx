'use client';

import { useState } from 'react';
import type { WhiteLabelConfig } from '../_config/types';
import { client } from '../_client';
import { wlTrack } from '../_client/analytics';

/**
 * Loan-officer tool: compose a verification request for a borrower.
 *
 * In the LIVE product this sends the borrower a secure link by email/text and
 * notifies the officer when they finish. In the DEMO there's no recipient, so
 * instead of sending we hand the officer a working link (carrying the modules +
 * applicant they configured) to walk through exactly what the borrower sees.
 *
 * The link drives the data_only `verify` flow; the modules selected here become
 * the predetermined set the borrower consents to (they don't choose it).
 */

const MODULES: [string, string][] = [
  ['identity', 'Identity'],
  ['contact', 'Contact info'],
  ['employment', 'Income & employment'],
  ['residence', 'Property / residence'],
  ['financial', 'Bank accounts & assets'],
  ['credit', 'Credit'],
];
const DEFAULT_SELECTED = ['identity', 'employment', 'financial'];

export function GenerateLinkButton({ config }: { config: WhiteLabelConfig }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="gl-trigger" onClick={() => setOpen(true)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        Request verification
      </button>
      {open && <GenerateLinkModal config={config} onClose={() => setOpen(false)} />}
      <style>{triggerStyles}</style>
    </>
  );
}

function GenerateLinkModal({ config, onClose }: { config: WhiteLabelConfig; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const [link, setLink] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const channel = email && phone ? 'email and text' : email ? 'email' : phone ? 'text message' : '';
  const canSend = name.trim().length >= 2 && (email.trim() !== '' || phone.trim() !== '') && selected.length > 0;

  function toggle(m: string) {
    setSelected((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));
  }

  async function generate() {
    if (!canSend || sending) return;
    setSending(true);
    setError(null);
    try {
      // Store the request server-side; only the opaque token travels in the link.
      const { token } = await client.createVerifyRequest({
        slug: config.slug,
        modules: selected,
        applicant: {
          fullName: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        },
      });
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setLink(`${origin}/wl/${config.slug}/verify/${token}`);
      setCopied(false);
      wlTrack('wl_lo_link_created', {
        slug: config.slug,
        modules: selected.length,
        channel: email.trim() && phone.trim() ? 'both' : email.trim() ? 'email' : 'phone',
      });
    } catch {
      setError('Could not create the verification request. Please try again.');
    } finally {
      setSending(false);
    }
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="gl-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="gl-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="gl-x" aria-label="Close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        {!link ? (
          <>
            <h3 className="gl-title">Request verification</h3>
            <p className="gl-lede">
              Send {config.branding.shortName ? `${config.branding.shortName}'s` : 'your'} borrower a secure
              link to verify the information below. No documents to upload.
            </p>

            <label className="gl-field">
              <span>Borrower name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Borrower" autoFocus />
            </label>
            <div className="gl-row">
              <label className="gl-field">
                <span>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
              </label>
              <label className="gl-field">
                <span>Mobile phone</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
              </label>
            </div>

            <div className="gl-modules-label">What to verify</div>
            <div className="gl-modules">
              {MODULES.map(([id, label]) => {
                const on = selected.includes(id);
                return (
                  <button type="button" key={id} className={`gl-module ${on ? 'gl-module-on' : ''}`} onClick={() => toggle(id)}>
                    <span className="gl-check" aria-hidden="true">
                      {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>

            <button type="button" className="gl-send" disabled={!canSend || sending} onClick={generate}>
              {sending ? 'Sending…' : 'Send verification request'}
            </button>
            {error ? (
              <p className="gl-error">{error}</p>
            ) : (
              <p className="gl-hint">
                You&rsquo;ll be notified the moment {name.trim() || 'they'} finishes.
              </p>
            )}
          </>
        ) : (
          <>
            <div className="gl-demo-badge">Demo</div>
            <h3 className="gl-title">Here&rsquo;s your test link</h3>
            <p className="gl-lede">
              In the live product, RAVEN sends this secure link to <strong>{name.trim()}</strong>
              {channel ? <> by {channel}</> : null} and notifies you when they complete it. For this demo,
              open the link below to walk through exactly what {name.trim() || 'the borrower'} would see,
              verifying {selected.length} {selected.length === 1 ? 'item' : 'items'}.
            </p>

            <div className="gl-link-box">
              <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
              <button type="button" className="gl-copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
            </div>

            <a className="gl-open" href={link} target="_blank" rel="noopener noreferrer">
              Open verification flow
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </a>

            <button type="button" className="gl-back" onClick={() => setLink(null)}>← Edit request</button>
          </>
        )}
      </div>
      <style>{modalStyles}</style>
    </div>
  );
}

const triggerStyles = `
  .gl-trigger { display: inline-flex; align-items: center; gap: 0.45rem; font-family: inherit; font-size: 0.8rem; font-weight: 600; white-space: nowrap; color: #fff; background: #006242; border: none; border-radius: 8px; padding: 0.5rem 0.85rem; cursor: pointer; transition: background 150ms; }
  .gl-trigger:hover { background: #004d34; }
`;

const modalStyles = `
  .gl-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1.25rem; background: rgba(16,24,40,0.55); backdrop-filter: blur(3px); animation: glFade 160ms ease-out both; }
  @keyframes glFade { from { opacity: 0; } to { opacity: 1; } }
  .gl-modal { position: relative; width: 480px; max-width: 100%; max-height: 90vh; overflow-y: auto; background: #fff; border-radius: 16px; padding: 1.6rem 1.6rem 1.4rem; box-shadow: 0 24px 64px rgba(16,24,40,0.28); font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; color: #171717; animation: glPop 200ms cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes glPop { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: none; } }
  .gl-x { position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #98a2b3; cursor: pointer; padding: 0.2rem; line-height: 0; }
  .gl-x:hover { color: #475467; }
  .gl-title { font-size: 1.15rem; font-weight: 700; margin: 0 0 0.35rem; letter-spacing: -0.01em; }
  .gl-lede { font-size: 0.85rem; line-height: 1.55; color: #475467; margin: 0 0 1.1rem; }
  .gl-lede strong { color: #171717; font-weight: 700; }
  .gl-field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.85rem; flex: 1; }
  .gl-field span { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: #667085; }
  .gl-field input { font-family: inherit; font-size: 0.9rem; color: #171717; background: #fff; border: 1px solid #d0d5dd; border-radius: 8px; padding: 0.6rem 0.7rem; transition: border-color 150ms, box-shadow 150ms; }
  .gl-field input:focus { outline: none; border-color: #006242; box-shadow: 0 0 0 3px rgba(0,98,66,0.12); }
  .gl-row { display: flex; gap: 0.75rem; }
  .gl-modules-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: #667085; margin: 0.4rem 0 0.5rem; }
  .gl-modules { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1.25rem; }
  .gl-module { display: flex; align-items: center; gap: 0.55rem; text-align: left; font-family: inherit; font-size: 0.84rem; font-weight: 600; color: #344054; background: #fff; border: 1px solid #d0d5dd; border-radius: 8px; padding: 0.6rem 0.7rem; cursor: pointer; transition: border-color 150ms, background 150ms; }
  .gl-module:hover { border-color: #006242; }
  .gl-module-on { border-color: #006242; background: rgba(0,98,66,0.06); }
  .gl-check { flex-shrink: 0; width: 18px; height: 18px; border-radius: 5px; border: 1px solid #d0d5dd; display: flex; align-items: center; justify-content: center; color: #fff; }
  .gl-module-on .gl-check { background: #006242; border-color: #006242; }
  .gl-send { width: 100%; font-family: inherit; font-size: 0.92rem; font-weight: 700; color: #fff; background: #006242; border: none; border-radius: 10px; padding: 0.8rem; cursor: pointer; transition: background 150ms; }
  .gl-send:hover:not(:disabled) { background: #004d34; }
  .gl-send:disabled { opacity: 0.45; cursor: not-allowed; }
  .gl-hint { font-size: 0.74rem; color: #98a2b3; text-align: center; margin: 0.7rem 0 0; }
  .gl-error { font-size: 0.78rem; color: #d92d20; text-align: center; margin: 0.7rem 0 0; }

  .gl-demo-badge { display: inline-block; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #6941c6; background: #f4ebff; border: 1px solid #e9d7fe; border-radius: 999px; padding: 0.25rem 0.6rem; margin-bottom: 0.7rem; }
  .gl-link-box { display: flex; gap: 0.5rem; margin-bottom: 0.85rem; }
  .gl-link-box input { flex: 1; min-width: 0; font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 0.78rem; color: #344054; background: #f9fafb; border: 1px solid #d0d5dd; border-radius: 8px; padding: 0.6rem 0.7rem; }
  .gl-link-box input:focus { outline: none; border-color: #006242; }
  .gl-copy { flex-shrink: 0; font-family: inherit; font-size: 0.82rem; font-weight: 600; color: #006242; background: #fff; border: 1px solid #006242; border-radius: 8px; padding: 0 0.9rem; cursor: pointer; }
  .gl-copy:hover { background: rgba(0,98,66,0.06); }
  .gl-open { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; font-family: inherit; font-size: 0.9rem; font-weight: 700; color: #fff; background: #006242; border-radius: 10px; padding: 0.8rem; cursor: pointer; text-decoration: none; transition: background 150ms; }
  .gl-open:hover { background: #004d34; }
  .gl-back { display: block; margin: 0.9rem auto 0; font-family: inherit; font-size: 0.8rem; font-weight: 600; color: #667085; background: none; border: none; cursor: pointer; }
  .gl-back:hover { color: #171717; }
  @media (max-width: 520px) { .gl-row { flex-direction: column; gap: 0; } .gl-modules { grid-template-columns: 1fr; } }
`;
