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

// Tracker-level context, verified against FDIC data in the July 2026 research.
export const TRACKER_SUMMARY = {
  updated: '2026-07-22',
  nationalApplications2026: 15,
  floridaApplications2026: 5,
  note: 'Deposit insurance applications filed nationally in 2026 through early July. Florida accounts for five of them, the most of any state.',
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
    charterOrigin: 'Chartered July 2, 1945 in Sardis, GA (Bank of Sardis, later Bank of Burke County)',
    move: 'Recapitalized starting 2021 (equity $9.5M to $31.4M); relaunched as Southern Bank; headquarters redomiciled to Spartanburg, SC on April 14, 2026. $400M assets at Q1 2026, with branches in Greenville, Aiken, and Myrtle Beach.',
    articleSlug: 'southern-bank-spartanburg-side-door',
    asOf: '2026-07-22',
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
    status: 'chartered',
    statusDetail:
      'FDIC application Aug 27, 2025; conditional approval Feb 5, 2026; Florida charter granted June 29, 2026. Soft-open by appointment; public grand opening set for September 2026.',
    capital: '$43M raised from 256 investors (FDIC required $28.0M)',
    leadership: 'Veteran Central Florida bankers; first new bank chartered in Orange County since 2008',
    techNotes: 'Charter announcement cites "agentic AI for real-time fraud detection." Core provider not yet public.',
    articleSlug: 'portrait-bank-winter-park-de-novo',
    asOf: '2026-07-11',
  },
  {
    name: 'Glades Bank and Trust',
    location: 'Plantation, FL (Broward County)',
    status: 'application-pending',
    statusDetail: 'FDIC deposit insurance application received June 2, 2026; pending.',
    capital: 'Reportedly raising $45M',
    leadership: 'Led by former Amerant executive Howard Levine',
    techNotes: 'Core named unusually early: CSI, announced while the application is still pending. gladesbank.com registered Oct 9, 2025, eight months before filing.',
    articleSlug: 'glades-bank-broward-de-novo',
    asOf: '2026-07-11',
  },
  {
    name: 'New South Bank',
    location: 'Tampa, FL',
    status: 'application-pending',
    statusDetail: 'FDIC deposit insurance application filed in 2026; pending.',
    asOf: '2026-07-11',
  },
  {
    name: 'Tidestone Bank',
    location: 'Coral Gables, FL',
    status: 'application-pending',
    statusDetail: 'FDIC deposit insurance application filed in 2026; pending.',
    asOf: '2026-07-11',
  },
  {
    name: 'Florida Bank of Finance',
    location: 'Coral Gables, FL',
    status: 'application-pending',
    statusDetail: 'FDIC deposit insurance application filed in 2026; pending.',
    asOf: '2026-07-11',
  },
  {
    name: 'Echelon Bank',
    location: 'Clearwater, FL',
    status: 'open',
    statusDetail: 'Opened April 2026.',
    asOf: '2026-07-11',
  },
  {
    name: 'BankMiami',
    location: 'Miami, FL',
    status: 'open',
    statusDetail: 'Opened March 2025.',
    asOf: '2026-07-11',
  },
];
