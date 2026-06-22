'use client';

const FLOW_LABEL: Record<string, string> = {
  data_only: 'Verification',
  rate_range: 'Rate check',
  full_application: 'Application',
};

const STATUS_STYLE: Record<string, string> = {
  data_ready: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  rate_ready: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  submitted: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  under_review: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  routed: 'bg-green-50 text-green-700 ring-green-600/20',
};

export interface IntakeRow {
  intakeId: string;
  applicationId?: string;
  flow: string;
  status: string;
  createdAt: string;
  amount?: number;
  product?: { label: string } | null;
  estimate?: { apr: number; termMonths: number; monthlyPayment: number } | null;
  profile: { identity: { fullName: string } };
  applicant: { email: string };
}

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function ApplicationsList({ initial }: { initial: IntakeRow[] }) {
  if (initial.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-900">No applications yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Verified intakes from your white-label borrower flows will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Borrower</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Product</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 text-right font-medium">Est. rate</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Received</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {initial.map((i) => (
            <tr key={i.intakeId} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{i.profile.identity.fullName}</div>
                <div className="text-xs text-gray-500">{i.applicant.email}</div>
                {i.applicationId && <div className="text-xs text-gray-400">{i.applicationId}</div>}
              </td>
              <td className="px-4 py-3 text-gray-700">{FLOW_LABEL[i.flow] ?? i.flow}</td>
              <td className="px-4 py-3 text-gray-700">{i.product?.label ?? 'Identity & data'}</td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                {i.amount ? usd(i.amount) : '—'}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                {i.estimate ? `${pct(i.estimate.apr)}` : '—'}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    STATUS_STYLE[i.status] ?? 'bg-gray-50 text-gray-600 ring-gray-500/20'
                  }`}
                >
                  {i.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-xs text-gray-500">{timeAgo(i.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
