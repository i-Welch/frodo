// Banned-phrase checker for marketing copy. The consulting site must not
// overclaim (vendor partnerships, credentials, employment dates), ship
// placeholders, quote prices, or slip into consultancy fluff.

const RULES: { name: string; re: RegExp }[] = [
  { name: 'partner claim', re: /\b(official|certified|preferred|authorized) partner\b/gi },
  { name: 'vendor partnership', re: /\bpartner(ed|ship)? with (Finxact|Plaid|Vesta|Upstart|Affirm|Socure|Truework)\b/gi },
  { name: 'credential', re: /\b(CISSP|CISA|CISM|OSCP|CEH)\b/g },
  { name: 'placeholder', re: /\b(TODO|TBD|lorem ipsum|placeholder)\b/gi },
  { name: 'fluff', re: /digital transformation journey|synerg|cutting-edge|best-in-class|in today's fast-paced/gi },
  { name: 'pricing', re: /\$\s?\d[\d,]*(\.\d+)?\s*(\/|per)\s*(hour|hr|month|mo|engagement)\b/gi },
  { name: 'employment dates', re: /\b(19|20)\d{2}\s*[–-]\s*((19|20)\d{2}|present)\b/gi },
];

/** Every banned phrase found in `text`, as "rule: match". Empty means clean. */
export function copyGuard(text: string): string[] {
  return RULES.flatMap(({ name, re }) => [...text.matchAll(re)].map((m) => `${name}: ${m[0]}`));
}
