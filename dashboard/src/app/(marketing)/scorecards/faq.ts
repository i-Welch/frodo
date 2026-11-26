import { bestOn, rankedRows, type ScoredRow } from './scoring';
import { NATIONAL_KINDS, STATE_LABELS, type ProductType, type ScorecardView } from './types';

// Question-and-answer copy for each scorecard view, generated from the current
// rankings so it never drifts from the table. Feeds the page, FAQPage JSON-LD
// and llms-full.txt.

export interface Faq {
  q: string;
  a: string;
}

const placeName = (view: ScorecardView) => (view === 'all' ? 'the Southeast' : STATE_LABELS[view].name);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const named = (s: ScoredRow<any>) => `${s.inst.name} (${s.overall!.toFixed(1)} out of 10)`;

const branchCount = (n: number) => `${n} ${n === 1 ? 'branch' : 'branches'}`;

function list(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

/** Local institutions with a branch in the view (any of the four states for 'all'). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withBranch(rows: ScoredRow<any>[], view: ScorecardView) {
  return rows.filter((r) => r.overall !== null && (view === 'all' ? Object.values(r.inst.branches).some((n) => n > 0) : r.inst.branches[view] > 0));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function scorecardFaqs(type: ProductType<any>, view: ScorecardView): Faq[] {
  const rows = rankedRows(type, view);
  const ranked = rows.filter((r) => r.overall !== null);
  const where = placeName(view);
  const faqs: Faq[] = [];
  const top = ranked.slice(0, 3);
  if (top.length > 0) {
    faqs.push({
      q: `Where is the best ${type.singular} in ${where}?`,
      a: `On RAVEN's ${type.label.toLowerCase()} scorecard (verified ${type.updated}), the highest-scoring ${type.singular}s for ${where} are ${list(top.map(named))}, out of ${ranked.length} ranked. Scores combine rate, fees, money movement, in-person access and protections.`,
    });
  }
  const branch = withBranch(ranked, view)[0];
  if (branch) {
    faqs.push({
      q: `What is the best ${type.singular} with a branch ${view === 'all' ? 'in the Southeast' : `in ${where}`}?`,
      a: `${named(branch)}, a ${branch.inst.kind === 'credit-union' ? 'credit union' : branch.inst.kind === 'big-bank' ? 'big five bank' : 'bank'} with ${branchCount(view === 'all' ? Object.values(branch.inst.branches).reduce((a, b) => a + b, 0) : branch.inst.branches[view])} ${view === 'all' ? 'across SC, NC, GA and FL' : `in ${where}`}, is the top-scoring ${type.singular} you can also use in person.`,
    });
  }
  const rate = bestOn(rows, 'rate');
  if (rate) {
    faqs.push({
      q: `Which ${type.singular} pays the most with no strings attached?`,
      a: `${rate.inst.name} scores highest on rate (${rate.scores.rate!.toFixed(1)} out of 10): ${type.headline.value(rate.row)} on a $10,000 balance with no direct deposit or subscription required, per its own rate page as checked on ${rate.row.asOf}.`,
    });
  }
  const big = ranked.filter((r) => r.inst.kind === 'big-bank')[0];
  if (big) {
    faqs.push({
      q: `Which big bank has the best ${type.singular}?`,
      a: `Among Chase, Bank of America, Wells Fargo, Citi and U.S. Bank, ${named(big)} scores highest in ${where}. The big five score well on in-person access but pay ${type.headline.value(big.row)} or less with no conditions, below most online banks.`,
    });
  }
  const local = ranked.filter((r) => !NATIONAL_KINDS.includes(r.inst.kind))[0];
  if (local) {
    faqs.push({
      q: `What is the best local bank or credit union ${type.singular} in ${where}?`,
      a: `${named(local)} is the highest-scoring community bank or credit union ${view === 'all' ? 'in SC, NC, GA and FL' : `serving ${where}`} on the scorecard.`,
    });
  }
  faqs.push({
    q: 'How often is the scorecard updated?',
    a: `Every row is re-checked against the institution's own pages weekly, and each row shows the date it was last verified. Rates that cannot be verified are marked not published rather than estimated, and those rows are not ranked until they are.`,
  });
  return faqs;
}
