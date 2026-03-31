'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldMeta {
  value: unknown;
  confidence?: number;
  source?: string;
  allSources?: string[];
  lastUpdated?: string;
  isStale?: boolean;
  goodBy?: string;
  reconciledConfidence?: number;
  reconciliationStatus?: string;
}

interface ModuleReport {
  data: Record<string, unknown>;
  fields: Record<string, FieldMeta>;
}

interface AuditEvent {
  module: string;
  source: { source: string; actor: string };
  timestamp: string;
  changes: { field: string; newValue: unknown }[];
}

interface CrossModuleComparison {
  label: string;
  match: boolean;
  note: string;
  percentDifference?: number;
  fieldA: { source: string };
  fieldB: { source: string };
}

interface ReconciliationData {
  crossModuleComparisons?: CrossModuleComparison[];
  summary?: { confirmed: number; disputed: number; crossModuleMatches: number; crossModuleConflicts: number };
}

interface ReportData {
  userId: string;
  generatedAt: string;
  modules: Record<string, ModuleReport>;
  auditTrail: AuditEvent[];
  riskScores: Record<string, unknown>;
  linkedProviders: string[];
  reconciliation?: ReconciliationData;
  staleness: {
    staleModules: { module: string; staleCount: number; freshCount: number; totalCount: number }[];
  };
}

interface PDFReportProps {
  report: ReportData;
  borrowerName: string;
  bankName: string;
  verificationId: string;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const colors = {
  black: '#0A0A0A',
  gray900: '#171717',
  gray700: '#3F3F3F',
  gray500: '#737373',
  gray400: '#A3A3A3',
  gray300: '#D4D4D4',
  gray200: '#E5E5E5',
  gray100: '#F5F5F5',
  gray50: '#FAFAFA',
  white: '#FFFFFF',
  green: '#22C55E',
  red: '#EF4444',
  yellow: '#EAB308',
};

const s = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: colors.gray900,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingBottom: 12,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
    color: colors.gray500,
  },
  headerPage: {
    fontSize: 8,
    color: colors.gray400,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.gray400,
  },
  // Cover page
  coverCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: colors.black,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 40,
  },
  coverMeta: {
    fontSize: 10,
    color: colors.gray500,
    marginBottom: 4,
  },
  coverConfidential: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    color: colors.gray300,
  },
  // Section
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: colors.black,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 9,
    color: colors.gray500,
    marginBottom: 20,
  },
  // Field rows
  fieldRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    paddingVertical: 6,
  },
  fieldLabel: {
    width: 140,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray500,
    textTransform: 'uppercase',
  },
  fieldValue: {
    flex: 1,
    fontSize: 10,
    color: colors.gray900,
  },
  fieldSource: {
    width: 80,
    fontSize: 8,
    color: colors.gray400,
    textAlign: 'right',
  },
  // Tables
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray500,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    paddingVertical: 4,
  },
  tableCell: {
    fontSize: 9,
    color: colors.gray900,
  },
  // Risk scores
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  riskLabel: {
    fontSize: 9,
    color: colors.gray700,
  },
  riskValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  // Audit trail
  auditRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray50,
  },
  auditTime: {
    width: 120,
    fontSize: 8,
    color: colors.gray400,
  },
  auditDetail: {
    flex: 1,
    fontSize: 8,
    color: colors.gray700,
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFieldName(field: string): string {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatValue(value: unknown, field: string): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') {
    if (field === 'ssn' && value.length >= 4) return `***-**-${value.slice(-4)}`;
    return value;
  }
  if (typeof value === 'number') {
    if (['salary', 'total', 'checking', 'savings', 'investment', 'balance', 'limit', 'amount', 'value', 'price', 'payment', 'escrow'].some((k) => field.toLowerCase().includes(k))) {
      return formatCurrency(value);
    }
    if (field === 'utilization') return `${value}%`;
    return value.toLocaleString();
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
    const obj = value as Record<string, unknown>;
    if ('street' in obj || 'city' in obj) {
      return [obj.street, obj.city, obj.state, obj.zip].filter(Boolean).join(', ');
    }
    return Object.entries(obj).map(([k, v]) => `${formatFieldName(k)}: ${typeof v === 'number' ? formatCurrency(v) : v}`).join(' · ');
  }
  if (Array.isArray(value)) return `${value.length} items`;
  return String(value);
}

// ---------------------------------------------------------------------------
// Page components
// ---------------------------------------------------------------------------

function PageHeader({ title }: { title: string }) {
  return (
    <View style={s.header}>
      <Text style={s.headerTitle}>RAVEN</Text>
      <Text style={s.headerPage}>{title}</Text>
    </View>
  );
}

function PageFooter({ generatedAt }: { generatedAt: string }) {
  return (
    <View style={s.footer}>
      <Text style={s.footerText}>Generated by RAVEN — reportraven.tech</Text>
      <Text style={s.footerText}>{new Date(generatedAt).toLocaleString()}</Text>
    </View>
  );
}

function FieldRow({ label, value, sources, confidence, reconciliationStatus }: { label: string; value: string; sources?: string[]; confidence?: number; reconciliationStatus?: string }) {
  const sourceText = (sources ?? []).join(', ');
  const confText = confidence != null ? `${Math.round(confidence * 100)}%` : '';
  const statusText = reconciliationStatus === 'confirmed' && (sources?.length ?? 0) > 1 ? ' [verified]' : reconciliationStatus === 'disputed' ? ' [disputed]' : '';
  const metaText = [sourceText, confText].filter(Boolean).join(' · ') + statusText;
  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value}</Text>
      <Text style={[s.fieldSource, { width: 120, color: reconciliationStatus === 'disputed' ? colors.red : colors.gray400 }]}>{metaText}</Text>
    </View>
  );
}

function ModuleSection({ title, subtitle, moduleData, generatedAt, moduleName }: { title: string; subtitle?: string; moduleData: ModuleReport; generatedAt: string; moduleName?: string }) {
  const simpleFields: [string, unknown][] = [];
  const arrayFields: [string, unknown[]][] = [];

  for (const [field, value] of Object.entries(moduleData.data)) {
    // Skip risk fields in identity module — they're on the Risk page
    if (moduleName === 'identity' && RISK_FIELDS.includes(field)) continue;
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      arrayFields.push([field, value as unknown[]]);
    } else {
      simpleFields.push([field, value]);
    }
  }

  return (
    <Page size="A4" style={s.page}>
      <PageHeader title={title} />
      <Text style={s.sectionTitle}>{title}</Text>
      {subtitle && <Text style={s.sectionSubtitle}>{subtitle}</Text>}

      {/* Simple fields */}
      {simpleFields.map(([field, value]) => {
        const meta = moduleData.fields[field] as FieldMeta | undefined;
        return (
          <FieldRow
            key={field}
            label={formatFieldName(field)}
            value={formatValue(value, field)}
            sources={meta?.allSources ?? (meta?.source ? [meta.source] : undefined)}
            confidence={meta?.reconciledConfidence ?? meta?.confidence}
            reconciliationStatus={meta?.reconciliationStatus}
          />
        );
      })}

      {/* Array fields as tables */}
      {arrayFields.map(([field, items]) => {
        const meta = moduleData.fields[field] as FieldMeta | undefined;
        const keys = Object.keys(items[0] as Record<string, unknown>);
        return (
          <View key={field} style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray700 }}>{formatFieldName(field)}</Text>
              {meta?.source && <Text style={{ fontSize: 8, color: colors.gray400 }}>Source: {meta.source}</Text>}
            </View>
            <View style={s.tableHeader}>
              {keys.map((k) => (
                <Text key={k} style={[s.tableHeaderCell, { flex: 1 }]}>{formatFieldName(k)}</Text>
              ))}
            </View>
            {(items as Record<string, unknown>[]).map((item, i) => (
              <View key={i} style={s.tableRow}>
                {keys.map((k) => (
                  <Text key={k} style={[s.tableCell, { flex: 1 }]}>
                    {formatValue(item[k], k)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        );
      })}

      <PageFooter generatedAt={generatedAt} />
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Main PDF Document
// ---------------------------------------------------------------------------

/** Fields shown on the Risk page, not repeated in the Identity module section */
const RISK_FIELDS = ['kycDecision', 'fraudScore', 'syntheticIdentityScore', 'kycScore', 'watchlistScreening', 'riskScores', 'bankVerified'];

function RiskPage({ report }: { report: ReportData }) {
  const identity = report.modules.identity?.data;
  const hasModuleRisk = identity && (identity.kycDecision || identity.fraudScore != null || identity.watchlistScreening || identity.riskScores);
  const hasLegacyRisk = Object.keys(report.riskScores).length > 0;

  if (!hasModuleRisk && !hasLegacyRisk) return null;

  const riskEntries: [string, unknown][] = [];

  // Pull from module data (new approach)
  if (identity) {
    if (identity.kycDecision) riskEntries.push(['KYC Decision', identity.kycDecision]);
    if (identity.kycScore != null) riskEntries.push(['KYC Score', identity.kycScore]);
    if (identity.fraudScore != null) riskEntries.push(['Fraud Score', identity.fraudScore]);
    if (identity.syntheticIdentityScore != null) riskEntries.push(['Synthetic Identity Score', identity.syntheticIdentityScore]);

    const watchlist = identity.watchlistScreening as Record<string, unknown> | undefined;
    if (watchlist) {
      if (watchlist.watchlistScore != null) riskEntries.push(['Watchlist Score', watchlist.watchlistScore]);
      if (watchlist.globalWatchlistScore != null) riskEntries.push(['Global Watchlist Score', watchlist.globalWatchlistScore]);
      if (watchlist.watchlistHits) riskEntries.push(['Watchlist Hits', Array.isArray(watchlist.watchlistHits) ? `${(watchlist.watchlistHits as unknown[]).length} hit(s)` : watchlist.watchlistHits]);
    }

    const risks = identity.riskScores as Record<string, unknown> | undefined;
    if (risks) {
      if (risks.phoneRiskScore != null) riskEntries.push(['Phone Risk Score', risks.phoneRiskScore]);
      if (risks.emailRiskScore != null) riskEntries.push(['Email Risk Score', risks.emailRiskScore]);
      if (risks.addressRiskScore != null) riskEntries.push(['Address Risk Score', risks.addressRiskScore]);
      if (risks.namePhoneCorrelation != null) riskEntries.push(['Name-Phone Correlation', risks.namePhoneCorrelation]);
      if (risks.nameAddressCorrelation != null) riskEntries.push(['Name-Address Correlation', risks.nameAddressCorrelation]);
      if (risks.sigmaScore != null) riskEntries.push(['Sigma Score', risks.sigmaScore]);
    }

    const bankVerified = identity.bankVerified as Record<string, unknown> | undefined;
    if (bankVerified) {
      if (bankVerified.email) riskEntries.push(['Bank Verified Email', bankVerified.email]);
      if (bankVerified.phone) riskEntries.push(['Bank Verified Phone', bankVerified.phone]);
      if (bankVerified.address) riskEntries.push(['Bank Verified Address', 'Yes']);
    }
  }

  // Fallback to legacy riskScores (from event metadata)
  if (riskEntries.length === 0) {
    for (const [key, value] of Object.entries(report.riskScores)) {
      if (typeof value === 'number' || typeof value === 'string') {
        riskEntries.push([formatFieldName(key), value]);
      }
    }
  }

  return (
    <Page size="A4" style={s.page}>
      <PageHeader title="Risk & Compliance" />
      <Text style={s.sectionTitle}>Risk & Compliance</Text>
      <Text style={s.sectionSubtitle}>KYC, fraud, watchlist, and identity risk scores from verification providers.</Text>

      {riskEntries.map(([label, value], i) => (
        <View key={i} style={s.riskRow}>
          <Text style={s.riskLabel}>{String(label)}</Text>
          <Text style={[s.riskValue, {
            color: typeof value === 'number' && (value as number) > 0.7 ? colors.red
              : typeof value === 'number' && (value as number) < 0.3 ? colors.green
              : String(value) === 'ACCEPT' ? colors.green
              : String(value) === 'REJECT' ? colors.red
              : colors.gray900
          }]}>
            {typeof value === 'number' ? (value as number).toFixed(3) : String(value)}
          </Text>
        </View>
      ))}

      {Array.isArray(report.riskScores.socureTags) && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: colors.gray700, marginBottom: 6 }}>Socure Tags</Text>
          {(report.riskScores.socureTags as string[]).map((tag, i) => (
            <Text key={i} style={{ fontSize: 9, color: colors.gray500, paddingVertical: 2 }}>• {tag}</Text>
          ))}
        </View>
      )}

      <PageFooter generatedAt={report.generatedAt} />
    </Page>
  );
}

function ReconciliationPage({ report }: { report: ReportData }) {
  const recon = report.reconciliation;
  if (!recon) return null;
  const comparisons = recon.crossModuleComparisons ?? [];
  if (comparisons.length === 0 && !recon.summary?.disputed) return null;

  return (
    <Page size="A4" style={s.page}>
      <PageHeader title="Cross-Source Verification" />
      <Text style={s.sectionTitle}>Cross-Source Verification</Text>
      <Text style={s.sectionSubtitle}>Comparison of data from multiple providers to verify consistency.</Text>

      {recon.summary && (
        <View style={{ flexDirection: 'row', gap: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 9, color: colors.green }}>
            {recon.summary.confirmed} confirmed
          </Text>
          {recon.summary.disputed > 0 && (
            <Text style={{ fontSize: 9, color: colors.red }}>
              {recon.summary.disputed} disputed
            </Text>
          )}
          <Text style={{ fontSize: 9, color: colors.green }}>
            {recon.summary.crossModuleMatches} cross-module match(es)
          </Text>
          {recon.summary.crossModuleConflicts > 0 && (
            <Text style={{ fontSize: 9, color: colors.yellow }}>
              {recon.summary.crossModuleConflicts} cross-module conflict(s)
            </Text>
          )}
        </View>
      )}

      {comparisons.map((c, i) => (
        <View key={i} style={[s.riskRow, { borderBottomColor: c.match ? colors.gray100 : colors.yellow }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: c.match ? colors.green : colors.yellow }}>{c.match ? 'MATCH' : 'REVIEW'}</Text>
            <Text style={{ fontSize: 9, color: colors.gray700, marginTop: 2 }}>{c.label}</Text>
            <Text style={{ fontSize: 8, color: colors.gray400, marginTop: 1 }}>{c.note}</Text>
            <Text style={{ fontSize: 7, color: colors.gray400, marginTop: 1 }}>{c.fieldA.source} vs {c.fieldB.source}{c.percentDifference != null ? ` (${c.percentDifference}% diff)` : ''}</Text>
          </View>
        </View>
      ))}

      <PageFooter generatedAt={report.generatedAt} />
    </Page>
  );
}

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

const MODULE_ORDER = ['identity', 'contact', 'financial', 'credit', 'employment', 'residence', 'buying-patterns', 'education'];

export function PDFReport({ report, borrowerName, bankName, verificationId }: PDFReportProps) {
  const orderedModules = MODULE_ORDER.filter((m) => report.modules[m] && Object.keys(report.modules[m].data).length > 0);

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={s.page}>
        <View style={s.coverCenter}>
          <Text style={s.coverTitle}>Borrower Verification Report</Text>
          <Text style={s.coverSubtitle}>{borrowerName}</Text>

          <Text style={s.coverMeta}>Prepared for: {bankName}</Text>
          <Text style={s.coverMeta}>Report ID: {verificationId}</Text>
          <Text style={s.coverMeta}>Generated: {new Date(report.generatedAt).toLocaleString()}</Text>
          <Text style={s.coverMeta}>Data Sources: {report.linkedProviders.join(', ') || 'Multiple providers'}</Text>
          <Text style={s.coverMeta}>Modules: {orderedModules.map((m) => MODULE_TITLES[m] ?? m).join(', ')}</Text>
        </View>
        <Text style={s.coverConfidential}>CONFIDENTIAL</Text>
        <PageFooter generatedAt={report.generatedAt} />
      </Page>

      {/* Risk & Compliance Page */}
      <RiskPage report={report} />

      {/* Module Pages */}
      {orderedModules.map((moduleName) => (
        <ModuleSection
          key={moduleName}
          title={MODULE_TITLES[moduleName] ?? formatFieldName(moduleName)}
          moduleName={moduleName}
          moduleData={report.modules[moduleName]}
          generatedAt={report.generatedAt}
        />
      ))}

      {/* Reconciliation Page */}
      <ReconciliationPage report={report} />

      {/* Audit Trail Page */}
      <Page size="A4" style={s.page}>
        <PageHeader title="Audit Trail" />
        <Text style={s.sectionTitle}>Audit Trail</Text>
        <Text style={s.sectionSubtitle}>Complete record of all data changes, sources, and timestamps.</Text>

        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: 120 }]}>Timestamp</Text>
          <Text style={[s.tableHeaderCell, { width: 80 }]}>Module</Text>
          <Text style={[s.tableHeaderCell, { width: 70 }]}>Source</Text>
          <Text style={[s.tableHeaderCell, { flex: 1 }]}>Fields Changed</Text>
        </View>

        {report.auditTrail.slice(0, 40).map((event, i) => (
          <View key={i} style={s.auditRow}>
            <Text style={[s.auditTime, { width: 120 }]}>{new Date(event.timestamp).toLocaleString()}</Text>
            <Text style={[s.auditDetail, { width: 80 }]}>{event.module}</Text>
            <Text style={[s.auditDetail, { width: 70 }]}>{event.source.source}</Text>
            <Text style={[s.auditDetail, { flex: 1 }]}>{event.changes.map((c) => c.field).join(', ')}</Text>
          </View>
        ))}

        <PageFooter generatedAt={report.generatedAt} />
      </Page>
    </Document>
  );
}
