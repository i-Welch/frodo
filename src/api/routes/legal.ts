import { Elysia } from 'elysia';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LEGAL_DIR = join(process.cwd(), 'legal');

/**
 * Legal/policy pages — serves static HTML pages from the legal/ directory.
 *
 * Pages are written as markdown-like text files in legal/ and rendered
 * inside a minimal HTML layout. Each file becomes a route:
 *
 *   legal/privacy-policy.html  → GET /legal/privacy-policy
 *   legal/data-retention.html  → GET /legal/data-retention
 *   legal/terms-of-service.html → GET /legal/terms-of-service
 *
 * Also serves a legal index page at GET /legal
 */
export const legalRoutes = new Elysia({ prefix: '/legal' })
  .get('/', () => {
    const pages = getLegalPages();
    const links = pages
      .map((p) => `<li><a href="/legal/${p.slug}">${escapeHtml(p.title)}</a></li>`)
      .join('\n');

    const body = `
      <h1>Legal</h1>
      <ul>${links}</ul>
    `;

    return new Response(renderLayout('Legal — RAVEN', body), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  })
  .get('/:page', ({ params, set }) => {
    const filePath = join(LEGAL_DIR, `${params.page}.html`);

    if (!existsSync(filePath)) {
      set.status = 404;
      return new Response(renderLayout('Not Found', '<h1>Page not found</h1>'), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const content = readFileSync(filePath, 'utf-8');
    // Extract title from first <h1> tag if present, otherwise use slug
    const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1] : params.page;

    return new Response(renderLayout(`${title} — RAVEN`, content), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface LegalPage {
  slug: string;
  title: string;
}

function getLegalPages(): LegalPage[] {
  if (!existsSync(LEGAL_DIR)) return [];

  const files = readdirSync(LEGAL_DIR) as string[];

  return files
    .filter((f: string) => f.endsWith('.html'))
    .map((f: string) => {
      const slug = f.replace('.html', '');
      const content = readFileSync(join(LEGAL_DIR, f), 'utf-8');
      const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
      const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ');
      return { slug, title };
    })
    .sort((a: LegalPage, b: LegalPage) => a.title.localeCompare(b.title));
}

function renderLayout(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css" />
  <style>
    body { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .legal-nav { margin-bottom: 2rem; font-size: 0.9rem; }
    .legal-nav a { margin-right: 1rem; }
    .last-updated { color: #666; font-size: 0.85rem; margin-top: 2rem; }
  </style>
</head>
<body>
  <nav class="legal-nav">
    <a href="/legal">Legal</a>
    <a href="/legal/privacy-policy">Privacy Policy</a>
    <a href="/legal/data-retention">Data Retention</a>
    <a href="/legal/terms-of-service">Terms of Service</a>
  </nav>
  ${bodyContent}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
