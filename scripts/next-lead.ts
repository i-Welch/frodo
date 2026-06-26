/**
 * next-lead.ts — Find the next outreach lead from Master contacts sheet.
 *
 * Reads Master contacts, finds the highest-scoring uncontacted row,
 * looks up the HQ phone from Apollo data, and prints everything needed
 * to make the call.
 *
 * Usage:
 *   bun scripts/next-lead.ts
 *   bun scripts/next-lead.ts --skip "laura@beacon.bank,srector@arthurstatebank.com"
 *
 * To log a call outcome:
 *   bun scripts/next-lead.ts --log --email "laura@beacon.bank" --status "Voicemail" --notes "Left voicemail"
 */

import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { google } from 'googleapis';

const SHEET_ID = '1RKSroGK3mVF28WD_Sj4X8laJIcNdO7F7DDpWpHtaLl8';
const SHEET_NAME = 'Master contacts';
const APOLLO_FILE = 'prospecting/data/apollo-people.jsonl';
const KEY_PATH =
  process.env.GOOGLE_SHEETS_KEY_PATH ??
  `${homedir()}/.config/gcloud-service-accounts/portfolio-sheets.json`;

// Column indices (0-based)
const COL = {
  bank: 0,
  domain: 1,
  name: 2,
  title: 3,
  buyerSurface: 4,
  priorityRank: 5,
  email: 6,
  linkedin: 7,
  tier: 8,
  score: 9,
  status: 10,
  lastCalled: 11,
  callOutcome: 12,
  callNotes: 13,
  followupSent: 14,
  followupDate: 15,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const next = args[i + 1];
      if (next === undefined || next.startsWith('--')) {
        result[key] = 'true';
      } else {
        result[key] = next;
        i++;
      }
    }
  }
  return result;
}

async function getSheets() {
  if (!existsSync(KEY_PATH)) {
    throw new Error(`Service account key not found at ${KEY_PATH}`);
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

function getHqPhone(domain: string): string {
  if (!existsSync(APOLLO_FILE)) return 'Not found';
  const lines = readFileSync(APOLLO_FILE, 'utf-8').split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const d = JSON.parse(line);
      if (d.domain === domain || d.enriched?.organization?.primary_domain === domain) {
        const phone = d.enriched?.organization?.phone;
        if (phone) return phone;
      }
    } catch {}
  }
  // fallback: grep for domain anywhere in the line
  const match = lines.find(l => l.includes(domain));
  if (match) {
    try {
      const d = JSON.parse(match);
      return d.enriched?.organization?.phone ?? 'Not found';
    } catch {}
  }
  return 'Not found';
}

async function findNextLead(skipEmails: string[]) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:P1000`,
  });

  const rows = res.data.values ?? [];
  const header = rows[0];
  const dataRows = rows.slice(1);

  // Candidates: no Status value, not in skip list
  const candidates = dataRows
    .map((row, i) => ({ row, sheetRow: i + 2 })) // +2: 1-based + header
    .filter(({ row }) => {
      const status = row[COL.status] ?? '';
      const email = row[COL.email] ?? '';
      return status.trim() === '' && !skipEmails.includes(email.trim());
    });

  if (candidates.length === 0) {
    console.log('No uncontacted leads remaining.');
    process.exit(0);
  }

  // Sort: highest score, then lowest priority rank
  candidates.sort((a, b) => {
    const scoreA = Number(a.row[COL.score] ?? 0);
    const scoreB = Number(b.row[COL.score] ?? 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    const rankA = Number(a.row[COL.priorityRank] ?? 999);
    const rankB = Number(b.row[COL.priorityRank] ?? 999);
    return rankA - rankB;
  });

  const best = candidates[0];
  const row = best.row;

  const bank = row[COL.bank] ?? '';
  const domain = row[COL.domain] ?? '';
  const name = row[COL.name] ?? '';
  const title = row[COL.title] ?? '';
  const buyerSurface = row[COL.buyerSurface] ?? '';
  const priorityRank = row[COL.priorityRank] ?? '';
  const email = row[COL.email] ?? '';
  const tier = row[COL.tier] ?? '';
  const score = row[COL.score] ?? '';
  const phone = getHqPhone(domain);

  console.log('\n========================================');
  console.log('NEXT LEAD');
  console.log('========================================');
  console.log(`Bank:          ${bank} (${tier})`);
  console.log(`Score:         ${score} | Priority Rank: ${priorityRank}`);
  console.log(`Contact:       ${name}`);
  console.log(`Title:         ${title}`);
  console.log(`Email:         ${email}`);
  console.log(`HQ Phone:      ${phone}`);
  console.log(`Buyer Surface: ${buyerSurface}`);
  console.log(`Sheet Row:     ${best.sheetRow}`);
  console.log('========================================\n');

  return best.sheetRow;
}

async function logOutcome(args: Record<string, string>) {
  const email = args['email'];
  const status = args['status'];
  const notes = args['notes'] ?? '';

  if (!email || !status) {
    console.error('--email and --status are required for --log');
    process.exit(1);
  }

  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!G1:G1000`,
  });

  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex(r => (r[0] ?? '').trim() === email.trim());
  if (rowIndex === -1) {
    console.error(`Email not found in sheet: ${email}`);
    process.exit(1);
  }

  const sheetRow = rowIndex + 1; // 1-based (row 1 is header)
  const today = new Date().toISOString().slice(0, 10);

  const callOutcomeMap: Record<string, string> = {
    'Voicemail': 'Left voicemail',
    'Rejected': 'Connected — not interested',
    'Demo Booked': 'Connected — demo booked',
    'Follow Up': 'Connected — revisit later',
    'Bad Contact': 'Bad contact info',
  };

  const callOutcome = callOutcomeMap[status] ?? status;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!K${sheetRow}:N${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[status, today, callOutcome, notes]],
    },
  });

  console.log(`✓ Logged "${status}" for ${email} at row ${sheetRow}`);
}

async function markFollowupSent(args: Record<string, string>) {
  const email = args['email'];
  if (!email) return;

  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!G1:G1000`,
  });

  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex(r => (r[0] ?? '').trim() === email.trim());
  if (rowIndex === -1) return;

  const sheetRow = rowIndex + 1;
  const today = new Date().toISOString().slice(0, 10);

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!O${sheetRow}:P${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['Yes', today]] },
  });

  console.log(`✓ Follow-up marked sent for ${email}`);
}

const args = parseArgs();
const skipEmails = args['skip'] ? args['skip'].split(',').map(s => s.trim()) : [];

if (args['log']) {
  await logOutcome(args);
  if (args['followup']) {
    await markFollowupSent(args);
  }
} else if (args['followup']) {
  await markFollowupSent(args);
} else {
  await findNextLead(skipEmails);
}
