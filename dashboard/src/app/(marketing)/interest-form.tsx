'use client';

import { useState } from 'react';

export function InterestForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app.reportraven.tech';
      const res = await fetch(`${apiUrl}/api/v1/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Something went wrong' }));
        throw new Error(data.message ?? 'Something went wrong');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'success') {
    return (
      <div className="form-success">
        <div className="form-success-check">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <p className="form-success-title">Thanks, {name.split(' ')[0]}!</p>
        <p className="form-success-sub">We&apos;ll be in touch at {email}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="interest-form">
      <div className="form-row">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-input"
        />
        <input
          type="email"
          placeholder="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
        />
        <button type="submit" disabled={status === 'submitting'} className="form-btn">
          {status === 'submitting' ? 'Sending...' : 'Get Early Access'}
        </button>
      </div>
      {status === 'error' && <p className="form-error">{errorMsg}</p>}
    </form>
  );
}
