'use client';

import { MockAction } from './mock-action';

/**
 * The "Download verification PDF" affordance in the loan-officer view. Mocked
 * for the demo; clicking explains that the real product generates the PDF.
 */
export function PdfButton() {
  return (
    <MockAction
      placement="top"
      align="right"
      note={
        <>
          This button is mocked up for the demo. On the live site it downloads the borrower&rsquo;s
          full verification report (identity, income, assets, property, and credit) as a PDF.
        </>
      }
    >
      {(toggle) => (
        <button type="button" className="lo-pdf-btn" onClick={toggle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Download verification PDF
        </button>
      )}
    </MockAction>
  );
}
