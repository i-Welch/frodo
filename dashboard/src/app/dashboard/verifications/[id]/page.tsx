import { auth } from '@clerk/nextjs/server';
import { api } from '@/lib/api';
import { CopyLinkButton } from './copy-link-button';

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

      {/* Form link info — show when not complete */}
      {status !== 'complete' && typeof verification.formUrl === 'string' && (
        <FormLinkCard
          formUrl={verification.formUrl}
          createdAt={verification.createdAt as string}
          status={status}
        />
      )}

      {!report ? (
        status === 'complete' ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">Loading report...</p>
          </div>
        ) : null
      ) : (
        <div className="space-y-6">
          {/* Report sections */}
          {Object.entries((report.modules ?? {}) as Record<string, { data: Record<string, unknown>; fields: Record<string, unknown> }>).map(([moduleName, moduleData]) => (
            <div key={moduleName} className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{moduleName}</h2>
              </div>
              <div className="p-4">
                <dl className="space-y-3">
                  {Object.entries(moduleData.data).map(([field, value]) => {
                    const meta = moduleData.fields[field] as { confidence?: number; source?: string; isStale?: boolean } | undefined;
                    return (
                      <div key={field}>
                        <dt className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          {formatFieldName(field)}
                          {meta?.source && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 normal-case tracking-normal">
                              {meta.source}
                            </span>
                          )}
                          {meta?.isStale && (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800 normal-case tracking-normal">
                              stale
                            </span>
                          )}
                          {meta?.confidence != null && (
                            <span className="text-[10px] text-gray-400 normal-case tracking-normal">
                              {Math.round(meta.confidence * 100)}%
                            </span>
                          )}
                        </dt>
                        <dd className="text-sm text-gray-900">
                          <FieldValue value={value} field={field} />
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

function FormLinkCard({ formUrl, createdAt, status }: { formUrl: string; createdAt: string; status: string }) {
  // Form tokens expire 24 hours after creation
  const created = new Date(createdAt);
  const expiresAt = new Date(created.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const msRemaining = expiresAt.getTime() - now.getTime();
  const expired = msRemaining <= 0;
  const hoursRemaining = Math.max(0, Math.floor(msRemaining / (60 * 60 * 1000)));
  const minutesRemaining = Math.max(0, Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000)));

  const statusMessages: Record<string, string> = {
    created: 'Waiting for borrower to open the link.',
    form_sent: 'Link sent to borrower. Waiting for them to start.',
    form_started: 'Borrower has opened the form and is filling it out.',
    form_completed: 'Borrower completed the form. Enrichment in progress.',
    enriching: 'Verifying borrower data with providers...',
  };

  return (
    <div className={`rounded-lg border bg-white p-5 mb-6 ${expired ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">
            {statusMessages[status] ?? 'Processing...'}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-3 py-2 font-mono text-gray-700 truncate block">
              {formUrl}
            </code>
            <CopyLinkButton url={formUrl} />
          </div>
          <p className={`text-xs ${expired ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
            {expired
              ? 'This link has expired. Create a new verification.'
              : `Expires in ${hoursRemaining}h ${minutesRemaining}m`}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Convert camelCase field names to readable labels */
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/** Format currency values */
function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

/** Smart field value renderer */
function FieldValue({ value, field }: { value: unknown; field: string }) {
  if (value === null || value === undefined) return <span className="text-gray-400">—</span>;

  // String values
  if (typeof value === 'string') {
    // Mask SSN
    if (field === 'ssn' && value.length >= 4) {
      return <span className="font-mono">***-**-{value.slice(-4)}</span>;
    }
    return <span>{value}</span>;
  }

  // Number values
  if (typeof value === 'number') {
    // Currency fields
    if (['salary', 'total', 'checking', 'savings', 'investment', 'balance', 'limit', 'amount'].some((k) => field.toLowerCase().includes(k))) {
      return <span>{formatCurrency(value)}</span>;
    }
    // Percentage fields
    if (field === 'utilization' || field.includes('percentage') || field.includes('Rate')) {
      return <span>{value}%</span>;
    }
    return <span>{value.toLocaleString()}</span>;
  }

  // Boolean values
  if (typeof value === 'boolean') {
    return <span>{value ? 'Yes' : 'No'}</span>;
  }

  // Address objects
  if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
    const obj = value as Record<string, unknown>;

    // Address-shaped object
    if ('street' in obj || 'city' in obj || 'line1' in obj) {
      const street = (obj.street ?? obj.line1 ?? '') as string;
      const city = (obj.city ?? obj.locality ?? '') as string;
      const state = (obj.state ?? obj.region ?? '') as string;
      const zip = (obj.zip ?? obj.postalCode ?? obj.postal_code ?? '') as string;
      return <span>{[street, city, state, zip].filter(Boolean).join(', ')}</span>;
    }

    // Balances object
    if ('checking' in obj || 'savings' in obj || 'total' in obj) {
      return (
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {Object.entries(obj).map(([k, v]) => (
            <span key={k} className="text-sm">
              <span className="text-gray-500 capitalize">{k}:</span>{' '}
              <span className="font-medium">{typeof v === 'number' ? formatCurrency(v) : String(v)}</span>
            </span>
          ))}
        </div>
      );
    }

    // Generic object — render as key-value pairs
    return (
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        {Object.entries(obj).map(([k, v]) => (
          <span key={k} className="text-sm">
            <span className="text-gray-500 capitalize">{formatFieldName(k)}:</span>{' '}
            <span>{typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—')}</span>
          </span>
        ))}
      </div>
    );
  }

  // Arrays — render as tables
  if (Array.isArray(value) && value.length > 0) {
    const items = value as Record<string, unknown>[];

    // Check if all items are objects
    if (typeof items[0] === 'object' && items[0] !== null) {
      const keys = Object.keys(items[0]);
      return (
        <div className="overflow-x-auto mt-1">
          <table className="text-sm w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {keys.map((k) => (
                  <th key={k} className="text-left pr-4 py-1 text-xs font-medium text-gray-400 uppercase">
                    {formatFieldName(k)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {keys.map((k) => (
                    <td key={k} className="pr-4 py-1.5 text-gray-900">
                      {typeof item[k] === 'number' && ['amount', 'balance', 'limit', 'salary', 'value', 'totalSpend'].includes(k)
                        ? formatCurrency(item[k] as number)
                        : typeof item[k] === 'object'
                          ? JSON.stringify(item[k])
                          : String(item[k] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Simple array of strings/numbers
    return <span>{value.join(', ')}</span>;
  }

  // Fallback
  return <span>{JSON.stringify(value)}</span>;
}
