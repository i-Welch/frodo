'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const ALL_MODULES = ['identity', 'contact', 'financial', 'credit', 'employment', 'residence'];

export default function NewVerificationPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [contactInfo, setContactInfo] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [modules, setModules] = useState<string[]>(ALL_MODULES);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ formUrl: string; verificationId: string; linkSent: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const isEmail = contactInfo.includes('@');
  const isPhone = !isEmail && contactInfo.length > 0;

  async function handleSubmit(sendLink: boolean) {
    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      const person: Record<string, string> = {};
      if (isEmail) person.email = contactInfo;
      if (isPhone) person.phone = contactInfo.startsWith('+') ? contactInfo : `+1${contactInfo.replace(/\D/g, '')}`;
      if (firstName) person.firstName = firstName;
      if (lastName) person.lastName = lastName;

      const res = await fetch('/api/v1/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          modules,
          person,
          sendLink,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Failed to create verification');
      }

      const data = await res.json();
      setResult({ formUrl: data.formUrl, verificationId: data.verificationId, linkSent: sendLink && data.linkSent });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function toggleModule(mod: string) {
    setModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  }

  async function copyLink() {
    if (result?.formUrl) {
      await navigator.clipboard.writeText(result.formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (result) {
    return (
      <div className="max-w-lg">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="text-green-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <h2 className="text-lg font-semibold">
              {result.linkSent ? 'Verification link sent' : 'Verification link ready'}
            </h2>
          </div>

          {result.linkSent ? (
            <p className="text-sm text-gray-600 mb-4">
              Sent to {contactInfo}. The borrower will receive a link to complete their verification.
            </p>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Share this link with your borrower. It expires in 24 hours.</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={result.formUrl}
                  className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono"
                />
                <button
                  onClick={copyLink}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/verifications/${result.verificationId}`)}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              View Verification
            </button>
            <button
              onClick={() => { setResult(null); setContactInfo(''); setFirstName(''); setLastName(''); }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Send Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">New Verification</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Borrower phone or email
          </label>
          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="borrower@email.com or +15551234567"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {showDetails ? '▾' : '▸'} Additional details (optional)
        </button>

        {showDetails && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Modules to verify</label>
          <div className="flex flex-wrap gap-2">
            {ALL_MODULES.map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => toggleModule(mod)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  modules.includes(mod)
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => handleSubmit(true)}
            disabled={!contactInfo || loading}
            className="flex-1 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send to Borrower'}
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={!contactInfo || loading}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate Link
          </button>
        </div>
      </div>
    </div>
  );
}
