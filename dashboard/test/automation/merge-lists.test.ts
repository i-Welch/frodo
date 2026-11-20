import { describe, it, expect } from 'vitest';
import { keepBothInsertions } from '../../../automation/merge-lists';

// The shape git produced when an article PR and the digital lending audit both
// inserted an entry at the top of articles-index.ts (Nov 2026).
const insertedBoth = [
  'export const articles: Article[] = [',
  '  {',
  '<<<<<<< HEAD',
  "    slug: 'branch-article',",
  "    category: 'bank',",
  '  },',
  '  {',
  '||||||| d3154c2',
  '=======',
  "    slug: 'master-article',",
  "    category: 'bank',",
  '  },',
  '  {',
  '>>>>>>> origin/master',
  "    slug: 'older-article',",
  '  },',
  '];',
].join('\n');

describe('keepBothInsertions', () => {
  it('keeps both inserted entries whole, branch first', () => {
    expect(keepBothInsertions(insertedBoth)).toBe(
      [
        'export const articles: Article[] = [',
        '  {',
        "    slug: 'branch-article',",
        "    category: 'bank',",
        '  },',
        '  {',
        "    slug: 'master-article',",
        "    category: 'bank',",
        '  },',
        '  {',
        "    slug: 'older-article',",
        '  },',
        '];',
      ].join('\n'),
    );
  });

  it('handles CRLF files', () => {
    const crlf = insertedBoth.replace(/\n/g, '\r\n');
    expect(keepBothInsertions(crlf)).toBe(keepBothInsertions(insertedBoth)!.replace(/\n/g, '\r\n'));
  });

  it('resolves several conflicts in one file', () => {
    const two = ['<<<<<<< HEAD', 'a', '||||||| base', '=======', 'b', '>>>>>>> m', 'x', '<<<<<<< HEAD', 'c', '||||||| base', '=======', 'd', '>>>>>>> m'].join('\n');
    expect(keepBothInsertions(two)).toBe(['a', 'b', 'x', 'c', 'd'].join('\n'));
  });

  it('refuses a conflict that changed existing lines', () => {
    const edited = ['<<<<<<< HEAD', "  date: '2026-11-18',", '||||||| base', "  date: '2026-11-01',", '=======', "  date: '2026-11-19',", '>>>>>>> m'].join('\n');
    expect(keepBothInsertions(edited)).toBeNull();
  });

  it('refuses conflicts without a diff3 base section', () => {
    expect(keepBothInsertions(['<<<<<<< HEAD', 'a', '=======', 'b', '>>>>>>> m'].join('\n'))).toBeNull();
  });

  it('refuses an unterminated conflict', () => {
    expect(keepBothInsertions(['<<<<<<< HEAD', 'a', '||||||| base', '=======', 'b'].join('\n'))).toBeNull();
  });

  it('leaves text without conflicts unchanged', () => {
    expect(keepBothInsertions('no conflicts\nhere')).toBe('no conflicts\nhere');
  });
});
