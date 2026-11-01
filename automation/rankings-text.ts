// LinkedIn post text for a state's bank rankings (see rankings-post.ts). Pure,
// so it is unit tested; follows the post rules in .claude/commands/article.md
// (data hook first, short paragraphs, no em dashes or links, one question,
// exactly five hashtags).

import {
  bankSlug,
  formatAssets,
  formatMetric,
  RANKING_MIN_ASSETS,
  stateSlug,
  stateAwards,
  awardLabel,
  topBanks,
  type StateRankings,
} from '../dashboard/src/app/(marketing)/bank-snapshot/peer-data';

export function rankingsSlug(r: Pick<StateRankings, 'stalp' | 'repdte'>): string {
  return `rankings-${r.stalp.toLowerCase()}-${r.repdte.slice(0, 4)}q${Math.ceil(Number(r.repdte.slice(4, 6)) / 3)}`;
}

export function rankingsPost(r: StateRankings): string | undefined {
  const efficient = topBanks(r.banks, 'efficiency');
  const profitable = topBanks(r.banks, 'roa', 3);
  if (efficient.length < 5) return undefined;
  const cents = (pct: number) => Math.round(pct);
  const total = r.banks.reduce((sum, b) => sum + b.assets, 0);
  const lines = [
    `The ${efficient.length} most efficient community banks in ${r.stateName}, ranked by efficiency ratio in ${r.quarter} FDIC call reports:`,
    '',
    ...efficient.map((b, i) => `${i + 1}. ${b.name} (${b.city}) ${b.efficiency.toFixed(1)}%`),
    '',
    `The median ${r.stateName} bank spends ${cents(r.medians.efficiency)} cents in operating costs to earn each dollar of revenue. The leaders run on ${cents(efficient[0].efficiency)} to ${cents(efficient.at(-1)!.efficiency)} cents.`,
    '',
    `Highest return on assets among community banks over ${formatAssets(RANKING_MIN_ASSETS)}: ${profitable.map((b) => `${b.name} (${formatMetric(b.roa, 'pct')})`).join(', ')}.`,
    '',
    `${r.banks.length} banks are headquartered in ${r.stateName}, with ${formatAssets(total)} in combined assets. The full ranking, with a peer comparison for every bank, is linked below.`,
    '',
    'What does your bank do differently to keep overhead down?',
    '',
    `#CommunityBanking #${r.stateName.replace(/\s+/g, '')} #BankPerformance #Banking #FDIC`,
  ];
  return lines.join('\n');
}

/**
 * Outreach list for Isaac: the state's top-ten banks, each with the badge they
 * earned and its embed link. A bank that adds the badge links back to us.
 */
export function rankingsPitch(r: StateRankings): string {
  const rows = r.banks
    .map((b) => ({ b, awards: stateAwards(r, b.cert) }))
    .filter((x) => x.awards.length > 0)
    .sort((x, y) => x.awards[0].rank - y.awards[0].rank)
    .map(({ b, awards }) => {
      const page = `https://reportraven.tech/bank-snapshot/${b.cert}-${bankSlug(b.name)}`;
      const site = b.website ? `, ${b.website.toLowerCase()}` : '';
      return `- **${b.name}** (${b.city})${site}: ${awards.map(awardLabel).join('; ')}. Badge and embed code: ${page}`;
    });
  return [
    '---',
    `to: marketing or communications contact at each bank below (find on the bank's site or LinkedIn)`,
    `subject: ${r.stateName} bank rankings, ${r.quarter}: your bank made the top ten`,
    '---',
    'Hi <name>,',
    '',
    `<Bank> ranks <award> in our ${r.quarter} ${r.stateName} bank rankings, built from FDIC call report data for all ${r.banks.length} banks headquartered in the state: https://reportraven.tech/bank-rankings/${stateSlug(r.stalp)}`,
    '',
    "If it's useful for your site or a press release, there's a free badge and embed code on your bank's page (link below). No strings attached.",
    '',
    'Isaac Welch, RAVEN',
    '',
    '## Banks to contact',
    '',
    ...rows,
    '',
  ].join('\n');
}

export function rankingsQueueFile(r: StateRankings, text: string): string {
  return [
    '---',
    `slug: ${rankingsSlug(r)}`,
    `title: ${r.stateName} Bank Rankings: ROA and Efficiency Ratio (${r.quarter})`,
    `description: Every bank headquartered in ${r.stateName}, ranked by return on assets and efficiency ratio from ${r.quarter} FDIC call reports.`,
    `url: https://reportraven.tech/bank-rankings/${stateSlug(r.stalp)}`,
    '---',
    text,
    '',
  ].join('\n');
}
