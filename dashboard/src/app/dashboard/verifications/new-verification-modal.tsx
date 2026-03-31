'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const ALL_MODULES = ['identity', 'contact', 'financial', 'credit', 'employment', 'residence'];

export function NewVerificationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { getToken, orgId } = useAuth();
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

  function reset() {
    setContactInfo('');
    setFirstName('');
    setLastName('');
    setModules(ALL_MODULES);
    setShowDetails(false);
    setResult(null);
    setError('');
    setCopied(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  if (!open) return null;

  async function handleSubmit(sendLink: boolean) {
    setLoading(true);
    setError('');

    try {
      const token = await getToken({ organizationId: orgId ?? undefined });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 rounded-lg border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">
            {result ? (result.linkSent ? 'Verification link sent' : 'Verification link ready') : 'New Verification'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {!orgId ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                Please select an organization using the switcher in the sidebar before creating a verification.
              </p>
            </div>
          ) : result ? (
            <div>
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
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { handleClose(); router.push(`/dashboard/verifications/${result.verificationId}`); }}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                >
                  View Verification
                </button>
                <button
                  onClick={reset}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Send Another
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {showDetails ? '\u25BE' : '\u25B8'} Additional details (optional)
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
          )}
        </div>
      </div>
    </div>
  );
}
