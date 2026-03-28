'use client';

import { useState } from 'react';

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}
