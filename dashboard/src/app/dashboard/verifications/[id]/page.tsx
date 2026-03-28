import { auth } from '@clerk/nextjs/server';
import { api } from '@/lib/api';

export default async function VerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { getToken } = await auth();
  const token = await getToken();

  // Fetch the verification record
  let verification: Record<string, unknown> | null = null;
  try {
    verification = await api<Record<string, unknown>>(`/api/v1/verifications/${id}`, { token: token ?? undefined });
  } catch {
    return <div className="text-red-600">Verification not found</div>;
  }

  if (!verification) return <div>Not found</div>;

  const userId = verification.userId as string;
  const status = verification.status as string;

  // If complete, fetch the full report
  let report: Record<string, unknown> | null = null;
  if (status === 'complete' || status === 'enriching' || status === 'form_completed') {
    try {
      report = await api<Record<string, unknown>>(`/api/v1/users/${userId}/report`, { token: token ?? undefined });
    } catch {
      // Report might not be ready yet
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {(verification.borrowerName as string) ?? 'Borrower Verification'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          ID: {id} &middot; Status: <StatusText status={status} /> &middot; Created: {new Date(verification.createdAt as string).toLocaleString()}
        </p>
      </div>

      {!report ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            {status === 'complete' ? 'Loading report...' : `Waiting for borrower to complete the form. Status: ${status}`}
          </p>
          {typeof verification.formUrl === 'string' && (
            <p className="text-sm text-gray-400 mt-2">
              Form URL: <code className="bg-gray-100 px-1 rounded">{verification.formUrl}</code>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Report sections */}
          {Object.entries((report.modules ?? {}) as Record<string, { data: Record<string, unknown>; fields: Record<string, unknown> }>).map(([moduleName, moduleData]) => (
            <div key={moduleName} className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{moduleName}</h2>
              </div>
              <div className="p-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(moduleData.data).map(([field, value]) => {
                    const meta = moduleData.fields[field] as { confidence?: number; source?: string; isStale?: boolean } | undefined;
                    return (
                      <div key={field} className="py-1">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{field}</dt>
                        <dd className="text-sm text-gray-900 mt-0.5">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}
                          {meta?.source && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                              {meta.source}
                            </span>
                          )}
                          {meta?.isStale && (
                            <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800">
                              stale
                            </span>
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </div>
          ))}

          {/* Audit trail */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Audit Trail</h2>
            </div>
            <div className="p-4 space-y-2">
              {((report.auditTrail ?? []) as Array<{ module: string; source: { source: string; actor: string }; timestamp: string; changes: Array<{ field: string }> }>).map((event, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-xs text-gray-400 font-mono w-36 shrink-0">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                  <span className="text-gray-600">
                    <span className="font-medium">{event.module}</span> via {event.source.source}
                    {event.changes.length > 0 && (
                      <span className="text-gray-400"> — {event.changes.map((c) => c.field).join(', ')}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusText({ status }: { status: string }) {
  const labels: Record<string, string> = {
    created: 'Created',
    form_sent: 'Link Sent',
    form_started: 'In Progress',
    form_completed: 'Form Completed',
    enriching: 'Enriching',
    complete: 'Complete',
  };
  return <span className="font-medium">{labels[status] ?? status}</span>;
}
