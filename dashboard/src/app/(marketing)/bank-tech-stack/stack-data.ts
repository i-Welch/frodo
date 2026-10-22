// Bank Tech Stack Tracker data. Every vendor here was identified from the
// institution's own site or the portal domain its buttons hand off to, as
// recorded in its audit (bank-audits.json). null = checked, not identified.
// Never infer a vendor; keep rows consistent with the audit text.

export type StackKey = 'digitalBanking' | 'consumerLending' | 'mortgage' | 'accountOpening';

export interface StackRow {
  slug: string;
  name: string;
  type: 'bank' | 'credit union';
  states: string[];
  assets: string;
  digitalBanking: string | null;
  consumerLending: string | null;
  mortgage: string | null;
  accountOpening: string | null;
  /** Link to the public /audit page. Audits on hold are left out of the tracker. */
  audit: boolean;
}

import { csvCell } from '../de-novo-watch/tracker-csv';

export const STACK_UPDATED = '2026-10-21';

export const CATEGORIES: { key: StackKey; label: string }[] = [
  { key: 'digitalBanking', label: 'Digital banking' },
  { key: 'consumerLending', label: 'Consumer loan application' },
  { key: 'mortgage', label: 'Mortgage application' },
  { key: 'accountOpening', label: 'Account opening' },
];

export const STACK_ROWS: StackRow[] = [
  {
    slug: "arthur-state-bank",
    name: "Arthur State Bank",
    type: "bank",
    states: ["SC"],
    assets: "~$814M",
    digitalBanking: "Banno (Jack Henry)",
    consumerLending: null,
    mortgage: "Finastra Mortgagebot",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "optimumbank",
    name: "OptimumBank",
    type: "bank",
    states: ["FL"],
    assets: "$1.40B",
    digitalBanking: null,
    consumerLending: null,
    mortgage: null,
    accountOpening: null,
    audit: true,
  },
  {
    slug: "southern-bank-trust",
    name: "Southern Bank and Trust Company",
    type: "bank",
    states: ["NC", "VA"],
    assets: "~$5.30B",
    digitalBanking: null,
    consumerLending: "MANTL",
    mortgage: "ICE Encompass",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "first-reliance-bank",
    name: "First Reliance Bank",
    type: "bank",
    states: ["SC"],
    assets: "~$1.13B",
    digitalBanking: "Apiture",
    consumerLending: null,
    mortgage: "Finastra Mortgagebot",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "colony-bankcorp",
    name: "Colony Bank",
    type: "bank",
    states: ["GA", "AL", "FL"],
    assets: "~$3.6B",
    digitalBanking: "Fiserv",
    consumerLending: "Finastra Mortgagebot",
    mortgage: "Maxwell and ICE Encompass",
    accountOpening: "Prelim",
    audit: true,
  },
  {
    slug: "carolina-bank-trust",
    name: "Carolina Bank & Trust Co.",
    type: "bank",
    states: ["SC"],
    assets: "~$845M",
    digitalBanking: "Banno (Jack Henry)",
    consumerLending: null,
    mortgage: "ICE Encompass",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "coastal-states-bank",
    name: "Coastal States Bank",
    type: "bank",
    states: ["SC", "GA"],
    assets: "~$2.35B",
    digitalBanking: "Fiserv",
    consumerLending: null,
    mortgage: null,
    accountOpening: null,
    audit: true,
  },
  {
    slug: "oconee-federal",
    name: "Oconee Federal Savings and Loan Association",
    type: "bank",
    states: ["SC", "GA"],
    assets: "~$679M",
    digitalBanking: "Fiserv",
    consumerLending: null,
    mortgage: "ICE Encompass",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "anderson-brothers-bank",
    name: "Anderson Brothers Bank",
    type: "bank",
    states: ["SC"],
    assets: "~$2.38B",
    digitalBanking: "Banno (Jack Henry)",
    consumerLending: "defi SOLUTIONS",
    mortgage: "ICE Encompass",
    accountOpening: "MeridianLink",
    audit: true,
  },
  {
    slug: "southern-first-bank",
    name: "Southern First Bank",
    type: "bank",
    states: ["SC", "NC", "GA"],
    assets: "~$4.7B",
    digitalBanking: null,
    consumerLending: null,
    mortgage: null,
    accountOpening: null,
    audit: true,
  },
  {
    slug: "south-atlantic-bank",
    name: "South Atlantic Bank",
    type: "bank",
    states: ["SC", "NC"],
    assets: "$1.98B",
    digitalBanking: "Banno (Jack Henry)",
    consumerLending: null,
    mortgage: "ICE Encompass",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "conway-national-bank",
    name: "The Conway National Bank",
    type: "bank",
    states: ["SC"],
    assets: "$2.00B",
    digitalBanking: null,
    consumerLending: null,
    mortgage: null,
    accountOpening: null,
    audit: true,
  },
  {
    slug: "bank-of-travelers-rest",
    name: "Bank of Travelers Rest",
    type: "bank",
    states: ["SC"],
    assets: "~$1.60B",
    digitalBanking: null,
    consumerLending: null,
    mortgage: "ICE Encompass",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "security-federal-bank",
    name: "Security Federal Bank",
    type: "bank",
    states: ["SC", "GA"],
    assets: "~$1.54B",
    digitalBanking: null,
    consumerLending: "MeridianLink",
    mortgage: "ICE Encompass",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "coastal-carolina-national-bank",
    name: "Coastal Carolina National Bank",
    type: "bank",
    states: ["SC", "NC"],
    assets: "~$2.3B combined ($1.35B CCNB, Q2 2026)",
    digitalBanking: null,
    consumerLending: null,
    mortgage: "ICE Encompass",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "first-capital-bank-charleston",
    name: "First Capital Bank",
    type: "bank",
    states: ["SC", "NC"],
    assets: "~$1.32B",
    digitalBanking: "Fiserv",
    consumerLending: null,
    mortgage: null,
    accountOpening: null,
    audit: true,
  },
  {
    slug: "first-palmetto-bank",
    name: "First Palmetto Bank",
    type: "bank",
    states: ["SC"],
    assets: "~$1.10B",
    digitalBanking: "Fiserv (business banking)",
    consumerLending: null,
    mortgage: null,
    accountOpening: null,
    audit: true,
  },
  {
    slug: "beacon-community-bank",
    name: "Beacon Community Bank",
    type: "bank",
    states: ["SC"],
    assets: "~$982M",
    digitalBanking: "Banno (Jack Henry)",
    consumerLending: null,
    mortgage: null,
    accountOpening: null,
    audit: true,
  },
  {
    slug: "queensborough-national-bank",
    name: "Queensborough National Bank & Trust Company",
    type: "bank",
    states: ["GA", "SC"],
    assets: "~$2.28B",
    digitalBanking: null,
    consumerLending: null,
    mortgage: null,
    accountOpening: null,
    audit: true,
  },
  {
    slug: "first-community-bank-sc",
    name: "First Community Bank",
    type: "bank",
    states: ["SC", "GA"],
    assets: "~$2.38B",
    digitalBanking: "FIS",
    consumerLending: null,
    mortgage: "ICE Encompass",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "countybank",
    name: "Countybank",
    type: "bank",
    states: ["SC"],
    assets: "~$733M",
    digitalBanking: null,
    consumerLending: null,
    mortgage: null,
    accountOpening: null,
    audit: true,
  },
  {
    slug: "optus-bank",
    name: "Optus Bank",
    type: "bank",
    states: ["SC"],
    assets: "~$764M (Q2 2026)",
    digitalBanking: "Smiley Technologies (STI)",
    consumerLending: null,
    mortgage: null,
    accountOpening: null,
    audit: true,
  },
  {
    slug: "rev-federal-credit-union",
    name: "REV Federal Credit Union",
    type: "credit union",
    states: ["SC", "NC", "WV"],
    assets: "$1.2B (member-owned, not stock-issued)",
    digitalBanking: null,
    consumerLending: "First-party",
    mortgage: "ICE Encompass",
    accountOpening: "First-party",
    audit: true,
  },
  {
    slug: "palmetto-citizens-federal-credit-union",
    name: "Palmetto Citizens Federal Credit Union",
    type: "credit union",
    states: ["SC", "GA"],
    assets: "$1.44B",
    digitalBanking: null,
    consumerLending: "MeridianLink",
    mortgage: "Docitt",
    accountOpening: "MeridianLink",
    audit: true,
  },
  {
    slug: "champions-first-credit-union",
    name: "Champions First Credit Union",
    type: "credit union",
    states: ["FL"],
    assets: "$535.8M (member-owned, not stock-issued)",
    digitalBanking: "Banno (Jack Henry)",
    consumerLending: "MeridianLink",
    mortgage: "ICE Encompass",
    accountOpening: "MeridianLink",
    audit: true,
  },
  {
    slug: "founders-federal-credit-union",
    name: "Founders Federal Credit Union",
    type: "credit union",
    states: ["SC", "NC"],
    assets: "$5.18B (member-owned, not stock-issued)",
    digitalBanking: "Q2",
    consumerLending: "Clutch",
    mortgage: "ICE Encompass",
    accountOpening: "Clutch",
    audit: true,
  },
  {
    slug: "robins-financial-credit-union",
    name: "Robins Financial Credit Union",
    type: "credit union",
    states: ["GA"],
    assets: "$4.91B (member-owned, not stock-issued)",
    digitalBanking: "Q2",
    consumerLending: "DecisionLender",
    mortgage: "ICE Encompass",
    accountOpening: "MANTL",
    audit: true,
  },
  {
    slug: "uwharrie-bank",
    name: "Uwharrie Bank",
    type: "bank",
    states: ["NC"],
    assets: "$1.22B",
    digitalBanking: null,
    consumerLending: "Finastra Mortgagebot",
    mortgage: "Home Hub",
    accountOpening: "Fivision",
    audit: true,
  },
  {
    slug: "wilson-bank-and-trust",
    name: "Wilson Bank and Trust",
    type: "bank",
    states: ["TN"],
    assets: "$5.98B",
    digitalBanking: "Banno (Jack Henry)",
    consumerLending: "Finastra Mortgagebot",
    mortgage: "Finastra Mortgagebot",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "cogent-bank",
    name: "Cogent Bank",
    type: "bank",
    states: ["FL"],
    assets: "$2.45B",
    digitalBanking: null,
    consumerLending: null,
    mortgage: "ICE Encompass",
    accountOpening: null,
    audit: true,
  },
  {
    slug: "chesapeake-bank",
    name: "Chesapeake Bank",
    type: "bank",
    states: ["VA"],
    assets: "$1.72B",
    digitalBanking: null,
    consumerLending: null,
    mortgage: "Finastra Mortgagebot",
    accountOpening: "Salesforce",
    audit: true,
  },
  {
    slug: "bankplus",
    name: "BankPlus",
    type: "bank",
    states: ["MS", "LA", "AL", "FL"],
    assets: "$8.38B",
    digitalBanking: null,
    consumerLending: null,
    mortgage: "ICE Encompass",
    accountOpening: "MeridianLink",
    audit: true,
  },
];

export function vendorCounts(key: StackKey): [string, number][] {
  const counts = new Map<string, number>();
  for (const r of STACK_ROWS) {
    const v = r[key];
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

// Integration page slug -> how that vendor appears in the rows.
const INTEGRATION_VENDORS: Record<string, RegExp> = {
  'jack-henry': /Jack Henry/,
  fiserv: /^Fiserv/,
  fis: /^FIS$/,
  meridianlink: /MeridianLink/,
  'ice-encompass': /Encompass/,
  ncino: /nCino/,
  csi: /^CSI$/,
};

/** Institutions in the tracker that run the vendor behind an integration page. */
export function stackUsage(integrationSlug: string): { name: string; layers: string[] }[] {
  const re = INTEGRATION_VENDORS[integrationSlug];
  if (!re) return [];
  return STACK_ROWS.flatMap((r) => {
    const layers = CATEGORIES.filter((c) => re.test(r[c.key] ?? '')).map((c) => c.label.toLowerCase());
    return layers.length ? [{ name: r.name, layers }] : [];
  });
}

export interface StackFaq {
  q: string;
  a: string;
}

// One question per vendor seen at two or more institutions, built from the rows
// so the answers stay true when rows change. Rendered on the page and as FAQPage JSON-LD.
export function stackFaqs(): StackFaq[] {
  const byVendor = new Map<string, { name: string; layers: string[] }[]>();
  for (const r of STACK_ROWS) {
    for (const c of CATEGORIES) {
      const v = r[c.key];
      if (!v) continue;
      const list = byVendor.get(v) ?? [];
      const hit = list.find((x) => x.name === r.name);
      if (hit) hit.layers.push(c.label.toLowerCase());
      else list.push({ name: r.name, layers: [c.label.toLowerCase()] });
      byVendor.set(v, list);
    }
  }
  return [...byVendor.entries()]
    .filter(([, list]) => list.length >= 2)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([vendor, list]) => ({
      q: `Which Southeast banks and credit unions use ${vendor}?`,
      a: `Of the ${STACK_ROWS.length} institutions RAVEN has fingerprinted, ${list.length} run ${vendor}: ${list
        .map((x) => `${x.name} (${x.layers.join(', ')})`)
        .join('; ')}. Verified ${STACK_UPDATED}.`,
    }));
}

export function stackCsv(): string {
  const header = ['institution', 'type', 'states', 'assets', ...CATEGORIES.map((c) => c.key), 'audit_url', 'verified'];
  const rows = STACK_ROWS.map((r) => [
    r.name,
    r.type,
    r.states.join(' '),
    r.assets,
    ...CATEGORIES.map((c) => r[c.key] ?? ''),
    `https://reportraven.tech/audit/${r.slug}`,
    STACK_UPDATED,
  ]);
  return `${[header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')}\n`;
}
