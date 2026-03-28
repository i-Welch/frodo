import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { api } from '@/lib/api';

export default async function DashboardHome() {
  const { getToken, orgId } = await auth();
  const token = await getToken();

  let stats = { total: 0, byStatus: {} as Record<string, number> };

  if (!orgId) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-8">Dashboard</h1>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <p className="text-sm text-yellow-800">
            Please select an organization using the switcher in the sidebar to get started.
          </p>
        </div>
      </div>
    );
  }

  try {
    stats = await api<typeof stats>('/api/v1/verifications/stats', { token: token ?? undefined });
  } catch {
    // API might not be connected yet
  }

  const pending = (stats.byStatus.created ?? 0) + (stats.byStatus.form_sent ?? 0) + (stats.byStatus.form_started ?? 0);
  const inProgress = (stats.byStatus.form_completed ?? 0) + (stats.byStatus.enriching ?? 0);
  const complete = stats.byStatus.complete ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Link
          href="/dashboard/verifications/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          New Verification
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={pending} color="yellow" />
        <StatCard label="In Progress" value={inProgress} color="blue" />
        <StatCard label="Complete" value={complete} color="green" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium mb-4">Recent Verifications</h2>
        <p className="text-sm text-gray-500">
          <Link href="/dashboard/verifications" className="text-gray-900 underline hover:no-underline">
            View all verifications →
          </Link>
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  const colors: Record<string, string> = {
    yellow: 'border-yellow-200 bg-yellow-50',
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[color ?? ''] ?? 'border-gray-200 bg-white'}`}>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
