export const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const usd2 = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

/** Pick "a"/"an" for the given word (vowel-sound heuristic on the first letter,
 * good enough for bank names). Pass capitalize for sentence-initial use. */
export function indefiniteArticle(word: string, capitalize = false): string {
  const art = /^[aeiou]/i.test(word.trim()) ? 'an' : 'a';
  return capitalize ? art[0].toUpperCase() + art.slice(1) : art;
}
