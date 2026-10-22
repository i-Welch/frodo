import { GLOSSARY_TERMS } from '../glossary/glossary-data';

// Links the first plain-text mention of a glossary term in an article's
// paragraphs and list items to its glossary entry. Runs on rendered HTML so it
// never touches headings, stat callouts, pull quotes, tables, or existing links.

const MAX_LINKS = 3;
// All-caps abbreviations distinctive enough to match on their own.
const ABBREVIATIONS = new Set(['VOE', 'VOD', 'KYC', 'CIP', 'HMDA', 'ILC']);

interface Matcher {
  slug: string;
  re: RegExp;
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const MATCHERS: Matcher[] = GLOSSARY_TERMS.flatMap((t) => {
  // Multi-word names match in any case; single words (HMDA, eCBSV) only as written.
  const flags = t.term.includes(' ') ? 'i' : '';
  const out: Matcher[] = [{ slug: t.slug, re: new RegExp(`\\b${escape(t.term)}\\b`, flags) }];
  if (t.abbreviation && ABBREVIATIONS.has(t.abbreviation)) {
    out.push({ slug: t.slug, re: new RegExp(`\\b${escape(t.abbreviation)}\\b`) });
  }
  return out;
});

export function linkGlossaryTerms(html: string): string {
  const linked = new Set(
    [...html.matchAll(/href="\/glossary\/([a-z0-9-]+)"/g)].map((m) => m[1]),
  );
  let added = 0;
  return html.replace(/<(p|li)>([\s\S]*?)<\/\1>/g, (block, tag: string, inner: string) => {
    if (added >= MAX_LINKS) return block;
    // Split into existing links, italic runs (update notes), other tags, and
    // text; only text is eligible.
    const parts = inner.split(/(<a\b[^>]*>[\s\S]*?<\/a>|<em>[\s\S]*?<\/em>|<[^>]+>)/g);
    for (let i = 0; i < parts.length && added < MAX_LINKS; i++) {
      if (parts[i].startsWith('<')) continue;
      let rest = parts[i];
      let done = '';
      while (added < MAX_LINKS) {
        // Earliest unlinked term in what remains of this text run.
        let best: { m: Matcher; index: number; text: string } | null = null;
        for (const m of MATCHERS) {
          if (linked.has(m.slug)) continue;
          const hit = rest.match(m.re);
          if (hit?.index !== undefined && (!best || hit.index < best.index)) best = { m, index: hit.index, text: hit[0] };
        }
        if (!best) break;
        done += `${rest.slice(0, best.index)}<a href="/glossary/${best.m.slug}">${best.text}</a>`;
        rest = rest.slice(best.index + best.text.length);
        linked.add(best.m.slug);
        added++;
      }
      parts[i] = done + rest;
    }
    return `<${tag}>${parts.join('')}</${tag}>`;
  });
}
