'use client';

import { useState } from 'react';
import { NewVerificationModal } from './new-verification-modal';

export function NewVerificationButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      >
        New Verification
      </button>
      <NewVerificationModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
