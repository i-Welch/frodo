/**
 * Bank Peer Snapshot: an FDIC-insured bank's latest call report figures next to
 * the median of banks its size in its state. Everything comes from the public
 * FDIC BankFind API (api.fdic.gov), cached for a day, so pages stay current as
 * new quarters post without any upkeep.
 */

const FDIC = 'https://api.fdic.gov/banks';
const DAY = 86_400;

// Peer group: same state, half to double the bank's assets. Below this many
// peers, fall back to the same asset band nationally.
const MIN_STATE_PEERS = 8;

// States RAVEN sells into; their banks are listed in the sitemap.
export const SITEMAP_STATES = ['SC', 'NC', 'GA', 'FL', 'AL', 'TN', 'VA'];

export interface Institution {
  NAME: string;
  CITY: string;
  STALP: string;
  ASSET: number;
  CERT: number;
  WEBADDR?: string;
  ESTYMD?: string;
  OFFICES?: number;
  /** FDIC community bank designation, "1" or "0". */
  CB?: string;
}

export interface Financials {
  CERT: number;
  REPDTE: string;
  ASSET: number;
  DEP: number;
  LNLSNET: number;
  ROA: number;
  NIMY: number;
  EEFFR: number;
  NUMEMP: number;
}

export interface Metric {
  key: string;
  label: string;
  bank: number;
  peerMedian: number;
  /** Share of peers this bank does better than, 0-100. Absent for neutral metrics. */
  betterThanPct?: number;
  format: 'pct' | 'ratio' | 'money';
  note: string;
}

export interface PeerReport {
  institution: Institution;
  quarter: string;
  repdte: string;
  peerCount: number;
  peerScope: string;
  metrics: Metric[];
  loanGrowthPct?: number;
  depositGrowthPct?: number;
  /** Peers nearest in total assets, for the "closest in size" links. */
  closestPeers: Pick<Institution, 'NAME' | 'CITY' | 'STALP' | 'ASSET' | 'CERT'>[];
}

const FIN_FIELDS = 'CERT,REPDTE,ASSET,DEP,LNLSNET,ROA,NIMY,EEFFR,NUMEMP';

async function fdic<T>(path: string, params: Record<string, string>): Promise<T[]> {
  const res = await fetch(`${FDIC}/${path}?${new URLSearchParams(params)}`, {
    next: { revalidate: DAY },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`FDIC ${path} ${res.status}`);
  const body = (await res.json()) as { data?: { data: T }[] };
  return (body.data ?? []).map((d) => d.data);
}

export function median(values: number[]): number {
  const s = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (s.length === 0) return NaN;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function betterThan(value: number, peers: number[], higherIsBetter: boolean): number {
  const valid = peers.filter((v) => Number.isFinite(v));
  if (valid.length === 0) return 0;
  const beaten = valid.filter((v) => (higherIsBetter ? value > v : value < v)).length;
  return Math.round((beaten / valid.length) * 100);
}

const ratio = (a: number, b: number) => (b > 0 ? a / b : NaN);

export function quarterLabel(repdte: string): string {
  return `Q${Math.ceil(Number(repdte.slice(4, 6)) / 3)} ${repdte.slice(0, 4)}`;
}

/** Compare one bank's latest quarter with its peers. Peers exclude the bank itself. */
export function comparePeers(bank: Financials, peers: Financials[]): Metric[] {
  const others = peers.filter((p) => p.CERT !== bank.CERT);
  const defs: { key: string; label: string; get: (f: Financials) => number; higher?: boolean; format: Metric['format']; note: string }[] = [
    { key: 'roa', label: 'Return on assets', get: (f) => f.ROA, higher: true, format: 'pct', note: 'Annualized net income over average assets.' },
    { key: 'nim', label: 'Net interest margin', get: (f) => f.NIMY, higher: true, format: 'pct', note: 'Annualized net interest income over earning assets.' },
    {
      key: 'efficiency',
      label: 'Efficiency ratio',
      get: (f) => f.EEFFR,
      higher: false,
      format: 'pct',
      note: 'Noninterest expense per dollar of revenue. Lower is better.',
    },
    {
      key: 'assets-per-employee',
      label: 'Assets per employee',
      get: (f) => ratio(f.ASSET * 1000, f.NUMEMP),
      higher: true,
      format: 'money',
      note: 'Total assets over full-time-equivalent staff.',
    },
    {
      key: 'loan-to-deposit',
      label: 'Loans to deposits',
      get: (f) => ratio(f.LNLSNET, f.DEP) * 100,
      format: 'ratio',
      note: 'Net loans and leases over total deposits.',
    },
  ];
  return defs
    .map((d) => {
      const value = d.get(bank);
      const peerValues = others.map(d.get);
      return {
        key: d.key,
        label: d.label,
        bank: value,
        peerMedian: median(peerValues),
        ...(d.higher === undefined ? {} : { betterThanPct: betterThan(value, peerValues, d.higher) }),
        format: d.format,
        note: d.note,
      };
    })
    .filter((m) => Number.isFinite(m.bank) && Number.isFinite(m.peerMedian));
}

/** The n peers nearest in total assets, nearest first. */
export function nearestBySize(bank: Pick<Financials, 'CERT' | 'ASSET'>, peers: Pick<Financials, 'CERT' | 'ASSET'>[], n = 6): number[] {
  return peers
    .filter((p) => p.CERT !== bank.CERT)
    .sort((a, b) => Math.abs(a.ASSET - bank.ASSET) - Math.abs(b.ASSET - bank.ASSET))
    .slice(0, n)
    .map((p) => p.CERT);
}

// Names come from the institutions endpoint (financials has them in capitals).
// Links are a nicety, so an FDIC hiccup here leaves them out instead of failing the page.
async function institutionsByCert(certs: number[]): Promise<PeerReport['closestPeers']> {
  if (certs.length === 0) return [];
  try {
    const found = await fdic<Institution>('institutions', {
      filters: `ACTIVE:1 AND CERT:(${certs.join(' OR ')})`,
      fields: 'NAME,CITY,STALP,ASSET,CERT',
      limit: String(certs.length),
    });
    return certs.map((c) => found.find((i) => i.CERT === c)).filter((i): i is Institution => !!i);
  } catch {
    return [];
  }
}

function growth(latest: number, prior?: number): number | undefined {
  return prior && prior > 0 ? Math.round(((latest - prior) / prior) * 1000) / 10 : undefined;
}

export async function getInstitution(cert: number): Promise<Institution | undefined> {
  const [inst] = await fdic<Institution>('institutions', {
    filters: `CERT:${cert} AND ACTIVE:1`,
    fields: 'NAME,CITY,STALP,ASSET,CERT,WEBADDR,ESTYMD,OFFICES',
  });
  return inst;
}

/** Undefined when the bank is unknown, inactive, or has no call report yet. */
export async function peerReport(cert: number): Promise<PeerReport | undefined> {
  const institution = await getInstitution(cert);
  if (!institution) return undefined;
  const history = await fdic<Financials>('financials', {
    filters: `CERT:${cert}`,
    fields: FIN_FIELDS,
    sort_by: 'REPDTE',
    sort_order: 'DESC',
    limit: '5',
  });
  const [latest] = history;
  if (!latest) return undefined;
  const yearAgo = history.find((r) => r.REPDTE === `${Number(latest.REPDTE.slice(0, 4)) - 1}${latest.REPDTE.slice(4)}`);

  const band = `ASSET:[${Math.round(latest.ASSET / 2)} TO ${latest.ASSET * 2}]`;
  const query = (scope: string) =>
    fdic<Financials>('financials', { filters: `REPDTE:${latest.REPDTE} AND ${band}${scope}`, fields: FIN_FIELDS, limit: '1000' });
  let peers = await query(` AND STALP:${institution.STALP}`);
  let peerScope = `${institution.STALP} banks with half to twice its assets`;
  if (peers.filter((p) => p.CERT !== cert).length < MIN_STATE_PEERS) {
    peers = await query('');
    peerScope = 'U.S. banks with half to twice its assets';
  }

  return {
    institution,
    quarter: quarterLabel(latest.REPDTE),
    repdte: latest.REPDTE,
    peerCount: peers.filter((p) => p.CERT !== cert).length,
    peerScope,
    metrics: comparePeers(latest, peers),
    loanGrowthPct: growth(latest.LNLSNET, yearAgo?.LNLSNET),
    depositGrowthPct: growth(latest.DEP, yearAgo?.DEP),
    closestPeers: await institutionsByCert(nearestBySize(latest, peers)),
  };
}

/** Active banks in the given states, for the sitemap. Empty if FDIC is unreachable. */
export async function sitemapInstitutions(): Promise<Pick<Institution, 'NAME' | 'CERT'>[]> {
  try {
    return await fdic<Pick<Institution, 'NAME' | 'CERT'>>('institutions', {
      filters: `ACTIVE:1 AND STALP:(${SITEMAP_STATES.map((s) => `"${s}"`).join(' OR ')})`,
      fields: 'NAME,CERT',
      limit: '3000',
    });
  } catch {
    return [];
  }
}

export function bankSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** `/bank-snapshot/2102-the-conway-national-bank` -> 2102 */
export function certFromParam(param: string): number | undefined {
  const m = /^(\d{1,7})(?:-|$)/.exec(param);
  return m ? Number(m[1]) : undefined;
}

export function formatMetric(value: number, format: Metric['format']): string {
  if (format === 'money') return value >= 1e6 ? `$${(value / 1e6).toFixed(1)}M` : `$${Math.round(value / 1000)}K`;
  return `${value.toFixed(2)}%`;
}

export function formatAssets(thousands: number): string {
  return thousands >= 1_000_000 ? `$${(thousands / 1_000_000).toFixed(2)}B` : `$${Math.round(thousands / 1000)}M`;
}

export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut',
  DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

export const stateSlug = (stalp: string) => bankSlug(STATE_NAMES[stalp] ?? stalp);
export const stateFromSlug = (slug: string) => Object.keys(STATE_NAMES).find((s) => stateSlug(s) === slug);

export interface RankedBank {
  cert: number;
  name: string;
  city: string;
  assets: number;
  roa: number;
  nim: number;
  efficiency: number;
  loanToDeposit: number;
  /** FDIC community bank designation; trust companies and specialty subsidiaries are not. */
  community: boolean;
}

export interface StateRankings {
  stalp: string;
  stateName: string;
  quarter: string;
  repdte: string;
  banks: RankedBank[];
  medians: { roa: number; nim: number; efficiency: number; assets: number };
}

// Top-ten lists cover FDIC-designated community banks (trust companies and
// card or wholesale subsidiaries post ratios that are not comparable) and skip
// the smallest banks, whose ratios swing on one loan.
export const RANKING_MIN_ASSETS = 100_000;

export function topBanks(banks: RankedBank[], key: 'roa' | 'efficiency', n = 10): RankedBank[] {
  const eligible = banks.filter((b) => b.community && b.assets >= RANKING_MIN_ASSETS && Number.isFinite(b[key]) && b[key] > 0);
  return eligible.sort((a, b) => (key === 'efficiency' ? a[key] - b[key] : b[key] - a[key])).slice(0, n);
}

/** Every active bank headquartered in a state, from its latest call report. */
export async function stateRankings(stalp: string): Promise<StateRankings | undefined> {
  const stateName = STATE_NAMES[stalp];
  if (!stateName) return undefined;
  const [latest] = await fdic<Pick<Financials, 'REPDTE'>>('financials', {
    filters: `STALP:${stalp}`,
    fields: 'REPDTE',
    sort_by: 'REPDTE',
    sort_order: 'DESC',
    limit: '1',
  });
  if (!latest) return undefined;
  const [fin, inst] = await Promise.all([
    fdic<Financials>('financials', { filters: `STALP:${stalp} AND REPDTE:${latest.REPDTE}`, fields: FIN_FIELDS, limit: '2000' }),
    fdic<Institution>('institutions', { filters: `STALP:${stalp} AND ACTIVE:1`, fields: 'NAME,CITY,CERT,CB', limit: '2000' }),
  ]);
  const byCert = new Map(inst.map((i) => [i.CERT, i]));
  const banks = fin
    .filter((f) => byCert.has(f.CERT))
    .map((f) => ({
      cert: f.CERT,
      name: byCert.get(f.CERT)!.NAME,
      city: byCert.get(f.CERT)!.CITY,
      assets: f.ASSET,
      roa: f.ROA,
      nim: f.NIMY,
      efficiency: f.EEFFR,
      loanToDeposit: ratio(f.LNLSNET, f.DEP) * 100,
      community: byCert.get(f.CERT)!.CB === '1',
    }))
    .sort((a, b) => b.assets - a.assets);
  if (banks.length === 0) return undefined;
  return {
    stalp,
    stateName,
    quarter: quarterLabel(latest.REPDTE),
    repdte: latest.REPDTE,
    banks,
    medians: {
      roa: median(banks.map((b) => b.roa)),
      nim: median(banks.map((b) => b.nim)),
      efficiency: median(banks.map((b) => b.efficiency).filter((v) => v > 0)),
      assets: median(banks.map((b) => b.assets)),
    },
  };
}

export interface StateAward {
  metric: 'efficiency' | 'roa';
  rank: number;
  stalp: string;
  stateName: string;
  quarter: string;
}

/** A bank's places in its state's top-ten lists, best rank first. */
export function stateAwards(r: StateRankings, cert: number): StateAward[] {
  return (['efficiency', 'roa'] as const)
    .map((metric) => ({ metric, rank: topBanks(r.banks, metric).findIndex((b) => b.cert === cert) + 1 }))
    .filter((a) => a.rank > 0)
    .map((a) => ({ ...a, stalp: r.stalp, stateName: r.stateName, quarter: r.quarter }))
    .sort((a, b) => a.rank - b.rank);
}

export const awardLabel = (a: StateAward) =>
  `#${a.rank} ${a.metric === 'efficiency' ? 'most efficient' : 'highest return on assets'} community bank in ${a.stateName}`;
