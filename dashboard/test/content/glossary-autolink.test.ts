import { describe, it, expect } from 'vitest';
import { linkGlossaryTerms } from '../../src/app/(marketing)/blog/glossary-autolink';

describe('glossary autolink', () => {
  it('links the first mention in a paragraph, once per term', () => {
    const out = linkGlossaryTerms('<p>The net interest margin rose. The net interest margin fell.</p>');
    expect(out.match(/href="\/glossary\/net-interest-margin"/g)).toHaveLength(1);
    expect(out).toContain('The <a href="/glossary/net-interest-margin">net interest margin</a> rose.');
  });

  it('leaves headings, existing links and already-linked terms alone', () => {
    const html = '<h2>Net Interest Margin</h2>\n<p>See <a href="/blog/x">net interest margin</a> and the call report.</p>';
    const out = linkGlossaryTerms(html);
    expect(out).toContain('<h2>Net Interest Margin</h2>');
    expect(out).toContain('<a href="/blog/x">net interest margin</a>');
    expect(out).toContain('the <a href="/glossary/call-report">call report</a>');
    const note = '<p><em>Updated October 22, 2026, with call report data.</em></p>';
    expect(linkGlossaryTerms(note)).toBe(note);
    const already = linkGlossaryTerms('<p><a href="/glossary/hmda">HMDA</a> data. More HMDA data.</p>');
    expect(already.match(/\/glossary\/hmda/g)).toHaveLength(1);
  });

  it('stops after three links and matches abbreviations case-sensitively', () => {
    const out = linkGlossaryTerms(
      '<p>HMDA filings, the call report, return on assets and the efficiency ratio.</p><p>Hmda is not linked.</p>',
    );
    expect(out.match(/href="\/glossary\//g)).toHaveLength(3);
    expect(out).toContain('<p>Hmda is not linked.</p>');
  });
});
