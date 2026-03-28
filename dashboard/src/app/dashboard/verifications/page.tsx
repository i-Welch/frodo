import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Verification {
  requestId: string;
  userId: string;
  status: string;
  modules: string[];
  borrowerName?: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  createdAt: string;
}

export default async function VerificationsPage() {
  const { getToken } = await auth();
  const token = await getToken();

  let verifications: Verification[] = [];
  try {
    const result = await api<{ verifications: Verification[] }>('/api/v1/verifications?limit=50', { token: token ?? undefined });
    verifications = result.verifications;
  } catch {
    // API might not be connected yet
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Verifications</h1>
        <Link
          href="/dashboard/verifications/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          New Verification
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Borrower</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Modules</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {verifications.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No verifications yet. <Link href="/dashboard/verifications/new" className="text-gray-900 underline">Create one</Link>
                </td>
              </tr>
            ) : (
              verifications.map((v) => (
                <tr key={v.requestId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/verifications/${v.requestId}`} className="font-medium text-gray-900 hover:underline">
                      {v.borrowerName ?? v.borrowerEmail ?? v.borrowerPhone ?? v.userId.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {v.modules.join(', ')}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    created: 'bg-gray-100 text-gray-700',
    form_sent: 'bg-yellow-100 text-yellow-800',
    form_started: 'bg-yellow-100 text-yellow-800',
    form_completed: 'bg-blue-100 text-blue-800',
    enriching: 'bg-blue-100 text-blue-800',
    complete: 'bg-green-100 text-green-800',
  };

  const labels: Record<string, string> = {
    created: 'Created',
    form_sent: 'Link Sent',
    form_started: 'In Progress',
    form_completed: 'Form Done',
    enriching: 'Enriching',
    complete: 'Complete',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {labels[status] ?? status}
    </span>
  );
}
