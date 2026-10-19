/**
 * Best-effort lookup of the institution behind a lead, for the founder alert:
 * first by the lead's email domain against FDIC BankFind websites, then by the
 * typed bank name. Never throws and gives up after a few seconds, so a slow
 * FDIC API cannot hold up a signup.
 *
 * Set LEAD_ENRICHMENT=off to skip (the test suite does).
 */

const FDIC = 'https://api.fdic.gov/banks/institutions';
const FIELDS = 'NAME,CITY,STALP,ASSET,CERT,WEBADDR';
const FREE_MAIL = /^(gmail|googlemail|yahoo|outlook|hotmail|live|msn|icloud|me|aol|proton|protonmail|gmx|comcast|att)\./i;

export interface Institution {
  NAME: string;
  CITY: string;
  STALP: string;
  ASSET: number;
  CERT: number;
  WEBADDR?: string;
}

function formatAssets(thousands: number): string {
  return thousands >= 1_000_000 ? `$${(thousands / 1_000_000).toFixed(2)}B` : `$${Math.round(thousands / 1000)}M`;
}

function describe(i: Institution): string {
  return `${i.NAME}, ${i.CITY}, ${i.STALP}: ${formatAssets(i.ASSET)} assets, FDIC cert ${i.CERT}`;
}

async function fdic(params: Record<string, string>): Promise<Institution[]> {
  const url = `${FDIC}?${new URLSearchParams({ ...params, fields: FIELDS })}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) return [];
  const body = (await res.json()) as { data?: { data: Institution }[] };
  return (body.data ?? []).map((d) => d.data);
}

/** Lines to add to the founder alert, or [] when nothing useful was found. */
export async function describeInstitution(lead: { email: string; bank?: string }): Promise<string[]> {
  if (process.env.LEAD_ENRICHMENT === 'off') return [];
  try {
    const domain = lead.email.split('@')[1]?.toLowerCase() ?? '';
    const root = domain.split('.').slice(-2, -1)[0];
    if (domain && root && root.length >= 4 && !FREE_MAIL.test(domain)) {
      const [match] = await fdic({ filters: `ACTIVE:1 AND WEBADDR:*${root}*`, limit: '1' });
      if (match) return [`FDIC match (email domain): ${describe(match)}`];
    }
    if (lead.bank) {
      const matches = await fdic({ search: `NAME:"${lead.bank.replace(/"/g, '')}"`, filters: 'ACTIVE:1', limit: '3' });
      if (matches.length) return ['Possible FDIC matches (by name):', ...matches.map((m) => `  - ${describe(m)}`)];
      if (/credit union|\bcu\b/i.test(lead.bank)) return ['No FDIC match (credit unions are NCUA-insured; look up at mapping.ncua.gov).'];
    }
    return [];
  } catch {
    return [];
  }
}

export interface BankSnapshot {
  name: string;
  city: string;
  state: string;
  cert: number;
  /** Call report quarter, e.g. "Q2 2026". */
  quarter: string;
  assets: string;
  deposits: string;
  loans: string;
  /** Year-over-year net loan growth in percent, one decimal; absent without a year-ago report. */
  loanGrowthPct?: number;
  roaPct: number;
}

interface Financials {
  REPDTE: string;
  ASSET: number;
  DEP: number;
  LNLSNET: number;
  ROA: number;
}

async function oneInstitution(lead: { email: string; bank?: string }): Promise<Institution | undefined> {
  const domain = lead.email.split('@')[1]?.toLowerCase() ?? '';
  const root = domain.split('.').slice(-2, -1)[0];
  if (domain && root && root.length >= 4 && !FREE_MAIL.test(domain)) {
    const [match] = await fdic({ filters: `ACTIVE:1 AND WEBADDR:*${root}*`, limit: '1' });
    if (match) return match;
  }
  if (!lead.bank) return undefined;
  // Only a single name match is confident enough to show the visitor.
  const matches = await fdic({ search: `NAME:"${lead.bank.replace(/"/g, '')}"`, filters: 'ACTIVE:1', limit: '2' });
  return matches.length === 1 ? matches[0] : undefined;
}

export function toSnapshot(i: Institution, reports: Financials[]): BankSnapshot | undefined {
  const [latest] = reports;
  if (!latest) return undefined;
  const yearAgo = reports.find((r) => r.REPDTE === `${Number(latest.REPDTE.slice(0, 4)) - 1}${latest.REPDTE.slice(4)}`);
  const month = Number(latest.REPDTE.slice(4, 6));
  return {
    name: i.NAME,
    city: i.CITY,
    state: i.STALP,
    cert: i.CERT,
    quarter: `Q${Math.ceil(month / 3)} ${latest.REPDTE.slice(0, 4)}`,
    assets: formatAssets(latest.ASSET),
    deposits: formatAssets(latest.DEP),
    loans: formatAssets(latest.LNLSNET),
    ...(yearAgo && yearAgo.LNLSNET > 0
      ? { loanGrowthPct: Math.round(((latest.LNLSNET - yearAgo.LNLSNET) / yearAgo.LNLSNET) * 1000) / 10 }
      : {}),
    roaPct: Math.round(latest.ROA * 100) / 100,
  };
}

/**
 * Latest call report figures for the lead's bank, shown on the audit form's
 * thank-you state. Only returned for a confident match. Never throws.
 */
export async function bankSnapshot(lead: { email: string; bank?: string }): Promise<BankSnapshot | undefined> {
  if (process.env.LEAD_ENRICHMENT === 'off') return undefined;
  try {
    const inst = await oneInstitution(lead);
    if (!inst) return undefined;
    const params = new URLSearchParams({
      filters: `CERT:${inst.CERT}`,
      fields: 'REPDTE,ASSET,DEP,LNLSNET,ROA',
      sort_by: 'REPDTE',
      sort_order: 'DESC',
      limit: '5',
    });
    const res = await fetch(`https://api.fdic.gov/banks/financials?${params}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return undefined;
    const body = (await res.json()) as { data?: { data: Financials }[] };
    return toSnapshot(inst, (body.data ?? []).map((d) => d.data));
  } catch {
    return undefined;
  }
}
