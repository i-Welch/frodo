// Settles the merge conflicts scheduled PRs make when two of them insert new
// entries at the top of the same list (articles-index.ts, published.ts, ...).
//
// Git's union driver used to do this, but it trims the lines both sides share
// out of the conflict first. Two inserted `  {` ... `  },` blocks share their
// first and last lines, so union kept one copy of each and fused the two
// entries into one object with duplicate keys. A diff3-style conflict keeps
// each side's block whole; keeping both blocks, the PR branch's first (its
// entry is the newer one), is the right resolution.

const OURS = /^<<<<<<< /;
const BASE = /^\|\|\|\|\|\|\| /;
const THEIRS = /^=======\r?$/;
const END = /^>>>>>>> /;

/**
 * Resolves every diff3 conflict in `text` whose base section is empty (both
 * sides only inserted lines) by keeping ours, then theirs. Returns null if
 * any conflict changed existing lines, which needs a person.
 */
export function keepBothInsertions(text: string): string | null {
  const out: string[] = [];
  let section: 'none' | 'ours' | 'base' | 'theirs' = 'none';
  for (const line of text.split('\n')) {
    if (section === 'none' && OURS.test(line)) section = 'ours';
    else if (section === 'ours' && BASE.test(line)) section = 'base';
    else if (section === 'ours' && THEIRS.test(line)) return null; // not diff3 style
    else if (section === 'base' && THEIRS.test(line)) section = 'theirs';
    else if (section === 'theirs' && END.test(line)) section = 'none';
    else if (section === 'base') {
      if (line.trim() !== '') return null;
    } else out.push(line);
  }
  return section === 'none' ? out.join('\n') : null;
}
