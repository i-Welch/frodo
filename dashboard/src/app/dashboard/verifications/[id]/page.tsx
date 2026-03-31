import { auth } from '@clerk/nextjs/server';
import { api } from '@/lib/api';
import { CopyLinkButton } from './copy-link-button';
import { DownloadPDFButton } from './download-pdf-button';

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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {(verification.borrowerName as string) ?? 'Borrower Verification'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ID: {id} &middot; Status: <StatusText status={status} /> &middot; Created: {new Date(verification.createdAt as string).toLocaleString()}
          </p>
        </div>
        {report && (
          <DownloadPDFButton
            report={report}
            borrowerName={(verification.borrowerName as string) ?? 'Borrower'}
            bankName="RAVEN"
            verificationId={id}
          />
        )}
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
          {/* Risk & Compliance Summary */}
          <RiskSummary report={report} />

          {/* Report sections */}
          {MODULE_ORDER
            .filter((m) => (report.modules as Record<string, { data: Record<string, unknown>; fields: Record<string, unknown> }>)[m] && Object.keys((report.modules as Record<string, { data: Record<string, unknown> }>)[m].data).length > 0)
            .map((moduleName) => {
              const moduleData = (report.modules as Record<string, { data: Record<string, unknown>; fields: Record<string, unknown> }>)[moduleName];
              return (
            <div key={moduleName} className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{MODULE_TITLES[moduleName] ?? moduleName}</h2>
              </div>
              <div className="p-4">
                <dl className="space-y-3">
                  {Object.entries(moduleData.data)
                    .filter(([field]) => !RISK_FIELDS.includes(field))
                    .map(([field, value]) => {
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
              );
            })}

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

const MODULE_ORDER = ['identity', 'contact', 'financial', 'credit', 'employment', 'residence', 'buying-patterns', 'education'];

const MODULE_TITLES: Record<string, string> = {
  identity: 'Identity Verification',
  contact: 'Contact Information',
  financial: 'Financial Overview',
  credit: 'Credit Profile',
  employment: 'Employment Verification',
  residence: 'Residence & Property',
  'buying-patterns': 'Spending Patterns',
  education: 'Education',
};

/** Fields that belong in the Risk Summary card, not in the module section */
const RISK_FIELDS = ['kycDecision', 'fraudScore', 'syntheticIdentityScore', 'kycScore', 'watchlistScreening', 'riskScores', 'bankVerified'];

function RiskSummary({ report }: { report: Record<string, unknown> }) {
  const modules = report.modules as Record<string, { data: Record<string, unknown> }> | undefined;
  const identity = modules?.identity?.data;
  if (!identity) return null;

  const kycDecision = identity.kycDecision as string | undefined;
  const fraudScore = typeof identity.fraudScore === 'number' ? identity.fraudScore : undefined;
  const syntheticScore = typeof identity.syntheticIdentityScore === 'number' ? identity.syntheticIdentityScore : undefined;
  const kycScore = typeof identity.kycScore === 'number' ? identity.kycScore : undefined;
  const watchlist = identity.watchlistScreening as Record<string, unknown> | undefined;
  const risks = identity.riskScores as Record<string, unknown> | undefined;
  const bankVerified = identity.bankVerified as Record<string, unknown> | undefined;

  // Don't show if no risk data
  if (!kycDecision && fraudScore == null && !watchlist && !risks) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Risk & Compliance</h2>
      </div>
      <div className="p-4">
        {/* KYC Decision Banner */}
        {kycDecision && (
          <div className={`rounded-lg px-4 py-3 mb-4 ${
            kycDecision === 'ACCEPT' ? 'bg-green-50 border border-green-200' :
            kycDecision === 'REJECT' ? 'bg-red-50 border border-red-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Decision</span>
                <p className={`text-lg font-semibold ${
                  kycDecision === 'ACCEPT' ? 'text-green-700' :
                  kycDecision === 'REJECT' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>{kycDecision}</p>
              </div>
              {kycScore != null && (
                <div className="text-right">
                  <span className="text-xs text-gray-500">KYC Score</span>
                  <p className="text-lg font-mono font-semibold text-gray-900">{kycScore != null ? kycScore.toFixed(3) : '—'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Score Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {fraudScore != null && (
            <ScoreCard label="Fraud Score" value={fraudScore} />
          )}
          {syntheticScore != null && (
            <ScoreCard label="Synthetic Identity" value={syntheticScore} />
          )}
          {typeof watchlist?.watchlistScore === 'number' ? (
            <ScoreCard label="Watchlist" value={watchlist.watchlistScore} />
          ) : null}
          {typeof watchlist?.globalWatchlistScore === 'number' ? (
            <ScoreCard label="Global Watchlist" value={watchlist.globalWatchlistScore} />
          ) : null}
          {typeof risks?.phoneRiskScore === 'number' ? (
            <ScoreCard label="Phone Risk" value={risks.phoneRiskScore} />
          ) : null}
          {typeof risks?.emailRiskScore === 'number' ? (
            <ScoreCard label="Email Risk" value={risks.emailRiskScore} />
          ) : null}
          {typeof risks?.addressRiskScore === 'number' ? (
            <ScoreCard label="Address Risk" value={risks.addressRiskScore} />
          ) : null}
          {typeof risks?.sigmaScore === 'number' ? (
            <ScoreCard label="Sigma Score" value={risks.sigmaScore} />
          ) : null}
        </div>

        {/* Watchlist Hits */}
        {Array.isArray(watchlist?.watchlistHits) && (watchlist.watchlistHits as unknown[]).length > 0 ? (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 mb-4">
            <span className="text-xs font-medium text-red-700 uppercase tracking-wider">Watchlist Hits</span>
            <p className="text-sm text-red-800 mt-1">{(watchlist.watchlistHits as unknown[]).length} hit(s) found</p>
          </div>
        ) : null}

        {/* Bank Verified */}
        {bankVerified && (bankVerified.email || bankVerified.phone || bankVerified.address) ? (
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
            <span className="text-xs font-medium text-blue-700 uppercase tracking-wider">Bank Verified</span>
            <div className="flex flex-wrap gap-3 mt-2">
              {bankVerified.email ? (
                <span className="inline-flex items-center gap-1 text-sm text-blue-800">
                  <span className="text-blue-500">&#10003;</span> Email: {String(bankVerified.email)}
                </span>
              ) : null}
              {bankVerified.phone ? (
                <span className="inline-flex items-center gap-1 text-sm text-blue-800">
                  <span className="text-blue-500">&#10003;</span> Phone: {String(bankVerified.phone)}
                </span>
              ) : null}
              {bankVerified.address ? (
                <span className="inline-flex items-center gap-1 text-sm text-blue-800">
                  <span className="text-blue-500">&#10003;</span> Address verified
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const displayValue = typeof value === 'number' ? value.toFixed(3) : String(value);
  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  return (
    <div className="rounded-lg border border-gray-200 px-3 py-2">
      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      <p className={`text-lg font-mono font-semibold ${
        numValue > 0.7 ? 'text-red-600' : numValue < 0.3 ? 'text-green-600' : 'text-gray-900'
      }`}>{displayValue}</p>
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
    if (['salary', 'total', 'checking', 'savings', 'investment', 'balance', 'limit', 'amount', 'value', 'price', 'payment', 'escrow'].some((k) => field.toLowerCase().includes(k))) {
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
