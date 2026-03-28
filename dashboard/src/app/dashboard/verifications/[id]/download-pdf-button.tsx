'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { PDFReport } from '@/components/report/pdf-report';

interface DownloadPDFButtonProps {
  report: Record<string, unknown>;
  borrowerName: string;
  bankName: string;
  verificationId: string;
}

export function DownloadPDFButton({ report, borrowerName, bankName, verificationId }: DownloadPDFButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const blob = await pdf(
        <PDFReport
          report={report as any}
          borrowerName={borrowerName}
          bankName={bankName}
          verificationId={verificationId}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raven-report-${borrowerName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1.5"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {generating ? 'Generating...' : 'Download PDF'}
    </button>
  );
}
