'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { useState } from 'react';

export default function DebugPage() {
  const { getToken, orgId, userId, orgRole } = useAuth();
  const { organization } = useOrganization();
  const [tokenInfo, setTokenInfo] = useState<string>('');

  async function inspectToken() {
    const token = await getToken();
    if (!token) {
      setTokenInfo('No token returned');
      return;
    }

    // Decode the JWT payload (without verification)
    const parts = token.split('.');
    if (parts.length !== 3) {
      setTokenInfo('Token is not a JWT: ' + token.slice(0, 50) + '...');
      return;
    }

    try {
      const payload = JSON.parse(atob(parts[1]));
      setTokenInfo(JSON.stringify(payload, null, 2));
    } catch (e) {
      setTokenInfo('Failed to decode: ' + String(e));
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Auth Debug</h1>

      <div className="rounded-lg border bg-white p-4 space-y-2 text-sm">
        <div><strong>userId:</strong> {userId ?? 'null'}</div>
        <div><strong>orgId:</strong> {orgId ?? 'null'}</div>
        <div><strong>orgRole:</strong> {orgRole ?? 'null'}</div>
        <div><strong>organization.name:</strong> {organization?.name ?? 'null'}</div>
        <div><strong>organization.id:</strong> {organization?.id ?? 'null'}</div>
      </div>

      <button
        onClick={inspectToken}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white"
      >
        Inspect JWT Token
      </button>

      {tokenInfo && (
        <pre className="rounded-lg border bg-gray-50 p-4 text-xs overflow-auto max-h-96">
          {tokenInfo}
        </pre>
      )}
    </div>
  );
}
