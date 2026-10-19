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

interface Institution {
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
