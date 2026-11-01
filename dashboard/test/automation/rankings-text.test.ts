import { describe, it, expect } from 'vitest';
import { rankingsPitch, rankingsPost, rankingsQueueFile, rankingsSlug } from '../../../automation/rankings-text';
import type { StateRankings } from '../../src/app/(marketing)/bank-snapshot/peer-data';

const banks = Array.from({ length: 12 }, (_, i) => ({
  cert: i + 1,
  name: `Bank ${i + 1}`,
  city: 'Town',
  assets: 300_000 + i * 10_000,
  roa: 1 + i / 10,
  nim: 3.5,
  efficiency: 40 + i,
  loanToDeposit: 80,
  community: true,
}));

const r: StateRankings = {
  stalp: 'SC',
  stateName: 'South Carolina',
  quarter: 'Q2 2026',
  repdte: '20260630',
  banks,
  medians: { roa: 1.1, nim: 3.6, efficiency: 62.6, assets: 571_000 },
};

describe('rankings LinkedIn post', () => {
  const text = rankingsPost(r)!;

  it('leads with the ranked list and follows the post rules', () => {
    expect(text.split('\n')[0]).toBe('The 10 most efficient community banks in South Carolina, ranked by efficiency ratio in Q2 2026 FDIC call reports:');
    expect(text).toContain('1. Bank 1 (Town) 40.0%');
    expect(text).toContain('spends 63 cents in operating costs');
    expect(text).not.toMatch(/—|https?:\/\//);
    expect(text.trim().split('\n').at(-1)!.match(/#\w+/g)).toHaveLength(5);
    expect(text).toContain('#SouthCarolina');
  });

  it('skips states with too few comparable banks', () => {
    expect(rankingsPost({ ...r, banks: banks.slice(0, 4) })).toBeUndefined();
  });

  it('writes queue front matter that auto-publish reads', () => {
    expect(rankingsSlug(r)).toBe('rankings-sc-2026q2');
    const file = rankingsQueueFile(r, text);
    expect(file).toMatch(/^---\nslug: rankings-sc-2026q2\ntitle: .+\ndescription: .+\nurl: https:\/\/reportraven\.tech\/bank-rankings\/south-carolina\n---\n/);
  });
});

describe('rankings pitch', () => {
  it('lists every top-ten bank, best rank first, with its badge page', () => {
    const pitch = rankingsPitch(r);
    const rows = pitch.split('\n').filter((l) => l.startsWith('- **'));
    expect(rows.length).toBe(12);
    expect(rows[0]).toMatch(/^- \*\*Bank (1|12)\*\*/);
    expect(pitch).toContain('https://reportraven.tech/bank-snapshot/1-bank-1');
    expect(pitch).toContain('https://reportraven.tech/bank-rankings/south-carolina');
  });
});
