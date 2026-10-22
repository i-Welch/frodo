// De Novo Watch tracker data. Every row must be traceable to a public source
// (FDIC pending-applications list, state regulator filings, bank press
// releases) and must stay consistent with the published deep-dive articles.
// asOf = date the row was last verified against its source.

export type DeNovoStatus = 'application-pending' | 'conditional-approval' | 'chartered' | 'open';

export interface DeNovoBank {
  name: string;
  location: string;
  status: DeNovoStatus;
  statusDetail: string;
  capital?: string;
  leadership?: string;
  techNotes?: string;
  articleSlug?: string;
  asOf: string;
}

export const STATUS_LABELS: Record<DeNovoStatus, string> = {
  'application-pending': 'Application pending',
  'conditional-approval': 'Conditional approval',
  chartered: 'Chartered',
  open: 'Open',
};

// Tracker-level context, verified against the FDIC pending deposit insurance
// applications list (as of 2026-10-20) and FDIC decisions on deposit insurance.
// countsThrough is rendered in the page's stat box ("filed nationally in 2026 through ...").
export const TRACKER_SUMMARY = {
  updated: '2026-10-21',
  countsThrough: 'mid-October',
  nationalApplications2026: 25,
  floridaApplications2026: 6,
  note: 'Deposit insurance applications received by the FDIC in 2026 through Oct. 20: 24 still pending on the FDIC list plus New South Bank, approved Sept. 28. Florida accounts for six of them (Itaú, Tidestone, Florida Bank of Finance, New South, Glades, Stark), the most of any state.',
};

// Charter moves: banks that entered a market by acquiring and relocating or
// relaunching an existing charter instead of filing a de novo application.
// Same sourcing rules as DE_NOVO_BANKS.
export interface CharterMove {
  name: string;
  charterOrigin: string;
  move: string;
  articleSlug?: string;
  asOf: string;
}

export const CHARTER_MOVES: CharterMove[] = [
  {
    name: 'Southern Bank',
    charterOrigin: 'Chartered July 2, 1945 in Sardis, GA (Bank of Sardis; Bank of Burke County from 1987; Southern Bank since 2001)',
    move: 'Recapitalized starting 2021 (equity $9.5M to $31.4M); opened in Spartanburg in 2023; headquarters redomiciled to Spartanburg, SC on April 14, 2026. $400M assets at Q1 2026. Its four Georgia branches went to Palmetto Citizens FCU on Aug 1, 2026, leaving four South Carolina offices.',
    articleSlug: 'southern-bank-spartanburg-side-door',
    asOf: '2026-10-21',
  },
  {
    name: 'First City Bank',
    charterOrigin: 'Chartered July 2, 1945 (Georgia)',
    move: 'Relaunched in Alpharetta, GA in June 2026 by a group led by CEO Bob Koncerak after a $22M+ raise (The Bank Slate, June 1, 2026).',
    asOf: '2026-07-21',
  },
];

export const DE_NOVO_BANKS: DeNovoBank[] = [
  {
    name: 'Portrait Bank',
    location: 'Winter Park, FL (Orlando MSA)',
    status: 'open',
    statusDetail:
      'FDIC application Aug 27, 2025; conditional approval Feb 5, 2026; Florida charter granted June 29, 2026 (FDIC records list the bank as established June 22, 2026). Opened to the public Saturday, Sept. 19, 2026, after the article was published (Banking Dive, Sept. 22, 2026).',
    capital: '$43M raised from 256 investors (FDIC required $28.0M)',
    leadership: 'Founder and CEO Erik Weiner; CFO Jeff Jenkins, former Winter Park National Bank CFO. First new bank chartered in Orange County since 2008',
    techNotes: 'Charter announcement cites "agentic AI for real-time fraud detection." Core provider not yet public.',
    articleSlug: 'portrait-bank-winter-park-de-novo',
    asOf: '2026-10-19',
  },
  {
    name: 'New South Bank',
    location: 'Tampa, FL (Hillsborough County)',
    status: 'conditional-approval',
    statusDetail:
      'FDIC application notice published Apr 22, 2026. Florida OFR conditional approval Sept 1, 2026; FDIC deposit insurance approved with conditions Sept 28, 2026. The FDIC approval expires if insurance is not effective within one year.',
    capital: 'FDIC requires at least $25M initial paid-in capital (offering of 2.5M shares at $10)',
    leadership: 'Proposed chairman and CEO Kennard Page; proposed president and CFO Thomas Welsh',
    asOf: '2026-10-19',
  },
  {
    name: 'Glades Bank and Trust',
    location: 'Plantation, FL (Broward County)',
    status: 'application-pending',
    statusDetail: 'FDIC deposit insurance application received June 2, 2026; still pending on the FDIC list as of Oct 20, 2026. The bank says it plans to launch in the first quarter of 2027, pending regulatory approval (CSI/Apiture release, Oct 13, 2026).',
    capital: 'Reportedly raising $45M',
    leadership: 'Led by former Amerant executive Howard Levine',
    techNotes: 'Vendors named unusually early: CSI NuPoint core and Apiture digital and business banking (including treasury management), announced Oct 13, 2026 while the application is still pending. gladesbank.com registered Oct 9, 2025, eight months before filing.',
    articleSlug: 'glades-bank-broward-de-novo',
    asOf: '2026-10-21',
  },
  {
    name: 'Stark Bank, N.A.',
    location: 'Miami, FL',
    status: 'application-pending',
    statusDetail:
      'OCC national bank charter application filed July 15, 2026; FDIC deposit insurance application received Aug 10, 2026; pending as of Oct 20, 2026.',
    techNotes:
      'U.S. arm of Brazilian API-first business banking fintech Stark Bank. Filings describe a fully digital, business-only bank: treasury management, payments, corporate cards, merchant acquiring, business loans. No consumer products.',
    asOf: '2026-10-19',
  },
  {
    name: 'Itaú Bank, National Association',
    location: 'Miami, FL',
    status: 'application-pending',
    statusDetail:
      'FDIC deposit insurance application received Mar 16, 2026; pending as of Oct 20, 2026. OCC preliminary conditional approval Aug 14, 2026 (Corporate Decision #1386); Federal Reserve and FDIC approvals still required. Single Miami location serving Brazil- and Latin America-linked high-net-worth clients.',
    capital: 'OCC requires at least $507M at launch',
    leadership: "Proposed U.S. CEO Percy Moreira, head of Itaú's international private bank",
    asOf: '2026-10-19',
  },
  {
    name: 'Tidestone Bank',
    location: 'Coral Gables, FL',
    status: 'application-pending',
    statusDetail: 'FDIC deposit insurance application received Mar 23, 2026; pending as of Oct 20, 2026.',
    asOf: '2026-10-19',
  },
  {
    name: 'Florida Bank of Finance',
    location: 'Coral Gables, FL',
    status: 'application-pending',
    statusDetail: 'FDIC deposit insurance application received Apr 16, 2026; pending as of Oct 20, 2026.',
    asOf: '2026-10-19',
  },
  {
    name: 'Private Bank & Trust',
    location: 'Gainesville, GA (Hall County)',
    status: 'open',
    statusDetail: 'FDIC deposit insurance approved with conditions Apr 3, 2026; FDIC records list the bank as opened Sept 28, 2026.',
    capital: 'FDIC required at least $19M net of organizational costs; organizers targeted at least $27M',
    leadership: 'President and CEO Gregory Barrett, formerly of Chattahoochee Bank of Georgia; chairman Brian Daniel',
    asOf: '2026-10-19',
  },
  {
    name: 'Nola Bank',
    location: 'New Orleans, LA',
    status: 'open',
    statusDetail:
      'FDIC deposit insurance approved Aug 11, 2025; final regulatory approval Sept 11, 2026; opened Sept 14, 2026, the eighth de novo to open nationally in 2026 (Banking Dive).',
    capital: '$29.2M raised from investors',
    leadership: 'CEO Joe Omner; board chair Henry L. Coaxum Jr.',
    asOf: '2026-10-19',
  },
  {
    name: 'Echelon Bank',
    location: 'Clearwater, FL',
    status: 'open',
    statusDetail:
      'FDIC deposit insurance approved Jan 5, 2026; FDIC records list the bank as opened May 27, 2026. Earlier reporting, including our Glades Bank article, gave April 2026; the FDIC date supersedes it.',
    capital: '$23M minimum capital target reached January 2026',
    leadership: 'CEO Rob Shaw, formerly of USAmeriBank',
    asOf: '2026-10-19',
  },
  {
    name: 'Solutions Plus Bank',
    location: 'Albertville, AL',
    status: 'open',
    statusDetail: 'FDIC records list the bank as established Dec 4, 2025.',
    asOf: '2026-10-19',
  },
  {
    name: 'BankMiami',
    location: 'Coral Gables, FL (Miami-Dade County)',
    status: 'open',
    statusDetail: 'Opened March 2025 (FDIC records list the bank as established Mar 17, 2025).',
    asOf: '2026-10-19',
  },
];
