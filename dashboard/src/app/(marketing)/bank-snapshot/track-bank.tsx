'use client';

import { useState } from 'react';
import { track } from '@vercel/analytics';

/** "Email me when this bank's next call report posts" (see server/api/routes/bank-tracker.ts). */
export function TrackBank({ name, cert, quarter }: { name: string; cert: number; quarter: string }) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const source = `bank-snapshot-${cert}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/v1/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'track', email, bank: name, cert, source, ...(website ? { website } : {}) }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      track('lead_submitted', { kind: 'track', source });
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="bsn-callout" role="status">
        <strong>You&rsquo;re tracking {name}.</strong> We&rsquo;ll email you when its next call report posts.
      </div>
    );
  }

  return (
    <form className="bsn-callout bsn-track" onSubmit={handleSubmit}>
      <label className="bsn-label" htmlFor="bsn-track-email">
        Get {name}&rsquo;s numbers each quarter. One email when the call report after {quarter} posts, nothing else.
      </label>
      <div className="bsn-track-row">
        <input
          id="bsn-track-email"
          className="bsn-input"
          type="email"
          required
          placeholder="you@yourbank.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="bsn-track-btn" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Saving…' : 'Track this bank'}
        </button>
      </div>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="lead-hp"
        style={{ position: 'absolute', left: '-9999px' }}
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      {status === 'error' && <p className="bsn-note">Something went wrong. Try again, or email isaac@reportraven.tech.</p>}
    </form>
  );
}
