// Browser-side FDIC BankFind name search, shared by the peer snapshot search
// and the audit form's bank field. BankFind allows cross-origin requests.

export interface BankMatch {
  NAME: string;
  CITY: string;
  STALP: string;
  CERT: number;
}

/** Each word becomes a case-insensitive wildcard on the institution name. */
export function searchUrl(query: string, limit = 8): string | undefined {
  const words = query.match(/[a-z0-9]{2,}/gi)?.slice(0, 4);
  if (!words) return undefined;
  const filters = ['ACTIVE:1', ...words.map((w) => `NAME:*${w}*`)].join(' AND ');
  const params = new URLSearchParams({ filters, fields: 'NAME,CITY,STALP,CERT', sort_by: 'ASSET', sort_order: 'DESC', limit: String(limit) });
  return `https://api.fdic.gov/banks/institutions?${params}`;
}

export async function searchBanks(url: string, signal: AbortSignal): Promise<BankMatch[]> {
  const res = await fetch(url, { signal });
  const body = (await res.json()) as { data?: { data: BankMatch }[] };
  return (body.data ?? []).map((d) => d.data);
}
