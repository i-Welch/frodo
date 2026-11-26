import { SAVINGS_ROWS, SAVINGS_UPDATED } from './savings-data';
import { SAVINGS_RATE_TOP } from './weights';
import { accessScore, clamp10, yesNo } from './scoring';
import type { ProductRow, ProductType, SavingsFacts } from './types';

type Row = ProductRow<SavingsFacts>;

const pct = (n: number | null) => (n === null ? 'Not published' : `${n.toFixed(2)}%`);
const money = (n: number | null) => (n === null ? 'Not stated' : n === 0 ? '$0' : `$${n % 1 === 0 ? n.toLocaleString('en-US') : n.toFixed(2)}`);
const yn = (v: boolean | null) => (v === null ? 'Not stated' : v ? 'Yes' : 'No');

const ratePoints = (apy: number) => clamp10((10 * apy) / SAVINGS_RATE_TOP);

/** The rate a saver can reach by meeting the condition, net of any subscription it needs. */
export function reachableApy(f: SavingsFacts): number | null {
  const base = f.apy ?? (f.noRateWithoutCondition ? 0 : null);
  if (f.conditionalApy === null) return base;
  const net = f.conditionalApy - (f.conditionMonthlyCost * 12 * 100) / 10_000;
  return Math.max(base ?? 0, net);
}

export function rateScore(f: SavingsFacts): number | null {
  const base = f.apy ?? (f.noRateWithoutCondition ? 0 : null);
  if (base === null) return null;
  return 0.7 * ratePoints(base) + 0.3 * ratePoints(reachableApy(f) ?? base);
}

export function feeScore(f: SavingsFacts): number | null {
  if (f.monthlyFee === null) return null;
  let s: number;
  if (f.monthlyFee === 0) s = 10;
  else if (f.waive === 'easy') s = 8;
  else if (f.waive === 'balance' && f.waiveBalance !== null) s = f.waiveBalance <= 500 ? 8 : f.waiveBalance <= 2_500 ? 7 : f.waiveBalance <= 10_000 ? 5 : 2;
  else if (f.waive === 'linked-account') s = 5;
  else s = 2;
  if ((f.minOpen ?? 0) >= 500) s -= 1;
  return clamp10(s);
}

export function movementScore(f: SavingsFacts): number {
  const w = f.withdrawalsPerMonth;
  const withdrawals =
    w === 'unlimited' ? 4 : w === null ? 2 : w >= 6 ? ((f.excessWithdrawalFee ?? 0) >= 5 ? 2.5 : 3) : w >= 3 ? 2 : 1;
  return clamp10(withdrawals + yesNo(f.atmAccess) + yesNo(f.externalTransfers) + (f.instantTransfers ? 2 : f.instantTransfers === null ? 0.5 : 0));
}

export const SAVINGS: ProductType<SavingsFacts> = {
  slug: 'savings',
  label: 'Savings accounts',
  singular: 'savings account',
  updated: SAVINGS_UPDATED,
  rows: SAVINGS_ROWS,
  required: ['rate', 'fees'],
  criteria: [
    {
      key: 'rate',
      label: 'Rate',
      description:
        'The APY a $10,000 balance earns with no strings attached, plus some credit for a higher rate you can reach by meeting a condition such as direct deposit. A rate that needs a paid subscription counts net of what the subscription costs.',
      score: (r) => rateScore(r.facts),
    },
    {
      key: 'fees',
      label: 'Fees',
      description:
        'Monthly maintenance fees and how easy they are to avoid: no fee scores best, then fees waived by a small balance or eStatements, then fees that need a large balance or another account. A high opening deposit costs a point.',
      score: (r) => feeScore(r.facts),
    },
    {
      key: 'movement',
      label: 'Money movement',
      description:
        'How freely money moves: withdrawal limits and excess-withdrawal fees, ATM or debit access, transfers to other banks, and instant or person-to-person payments (Zelle, pay-a-person, RTP or FedNow).',
      score: (r) => movementScore(r.facts),
    },
    {
      key: 'access',
      label: 'In-person access',
      description:
        'Branches in the state you are looking at, from FDIC and credit union branch data. Where an institution has no branches, it is scored on how you reach a person: 24/7 phone support scores best, then 24/7 chat, extended hours and business hours. The Southeast view averages the four states.',
      score: (_r, inst, state) => accessScore(inst, state),
    },
    {
      key: 'protections',
      label: 'Protections and features',
      description:
        'Deposit insurance (direct FDIC or NCUA coverage scores above coverage through a partner bank or sweep, with credit for coverage above $250,000), joint accounts, savings buckets and cash deposits.',
      score: (r, inst) =>
        (inst.insuranceKind === 'direct' ? 4 : inst.insuranceKind === 'none' ? 0 : 3) +
        (inst.extendedCoverage ? 1 : 0) +
        yesNo(r.facts.jointAccounts) +
        yesNo(r.facts.subAccounts, 1.5) +
        yesNo(r.facts.cashDeposit, 1.5),
    },
  ],
  headline: { label: 'APY on $10,000', value: (r: Row) => pct(r.facts.apy ?? (r.facts.noRateWithoutCondition ? 0 : null)) },
  facts: [
    { label: 'APY on $10,000, no conditions', value: (r) => (r.facts.noRateWithoutCondition ? '0.00% (earns nothing without the condition)' : pct(r.facts.apy)) },
    {
      label: 'With a condition',
      value: (r) => (r.facts.conditionalApy === null ? 'None' : `${pct(r.facts.conditionalApy)} ${r.facts.condition ?? ''}`.trim()),
    },
    { label: 'Rate as stated by the institution', value: (r) => (r.facts.rateAsOf ? `as of ${r.facts.rateAsOf}` : 'No date published') },
    { label: 'Rate details', value: (r) => r.facts.apyNote },
    {
      label: 'Monthly fee',
      value: (r) => (r.facts.monthlyFee === 0 && !r.facts.feeWaiver ? '$0' : `${money(r.facts.monthlyFee)}${r.facts.feeWaiver ? `. ${r.facts.feeWaiver}` : ''}`),
    },
    { label: 'Minimum to open', value: (r) => money(r.facts.minOpen) },
    { label: 'Withdrawals', value: (r) => r.facts.withdrawalLimit ?? 'Not stated' },
    { label: 'Transfers', value: (r) => r.facts.transferNotes ?? 'Not stated' },
    { label: 'ATM or debit access to savings', value: (r) => yn(r.facts.atmAccess) },
    { label: 'Joint accounts', value: (r) => yn(r.facts.jointAccounts) },
    { label: 'Savings buckets', value: (r) => yn(r.facts.subAccounts) },
    { label: 'Cash deposits', value: (r) => yn(r.facts.cashDeposit) },
    { label: 'Deposit insurance', value: (_r, i) => (i.insuranceLimit ? `${i.insurance}, ${i.insuranceLimit}` : i.insurance) },
    { label: 'Support', value: (_r, i) => i.support },
    { label: 'Who can join', value: (_r, i) => i.membership ?? 'Anyone' },
  ],
  method: [
    'Each institution is scored on the savings account a new customer would open for an emergency fund: its best-yielding savings account that is not a CD, a money market account, or a promotion that needs more than $25,000 of new money.',
    'Rates are what a $10,000 balance earns. When a rate applies to only part of the balance, the scorecard uses the blended rate for $10,000.',
    'Every fact was read on the institution’s own pages on the date shown; a rate we could not verify is marked not published, and that row is not ranked until it is.',
  ],
};
