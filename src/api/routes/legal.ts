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
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3000 3000'%3E%3Cstyle%3Epath,circle%7Bfill:%230A0A0A;stroke:%230A0A0A%7D@media(prefers-color-scheme:dark)%7Bpath,circle%7Bfill:%23fff;stroke:%23fff%7D%7D%3C/style%3E%3Cpath d='M2162.9,2626.4c17.1-6.3,35.7-13.6,48.6-20.1-51.8-.7-99,.5-146.3-2.5-162.9-10.5-321.8-40.2-475.8-94.7-166.9-59.1-321-140.7-453.7-259.6-62.1-55.7-115.4-118.4-149.3-195.7-26.4-60.1-37.6-122.5-21.4-187.2,40.1-160.7,200.7-247.3,361.8-218-40.9,6.9-78.6,15.9-111.1,38.7-32.7,22.9-58.8,51.1-72.2,91.7,36.3-26.9,91.2-50.3,120.1-51.6-2.5,1.9-4.3,3.6-6.4,5-68.4,45.2-101.9,109.3-103.6,190.8-1.5,69.4,23.3,130.2,60.2,187.1,59.4,91.5,140.5,160.3,231.8,217.9,111.4,70.2,231,119.8,354.7,155.9,104,30.3,211.3,49.4,320,51.4,13.3.2,26.7,0,40,0-6.1-6.8-12.7-10.1-19-13.8-49-29.3-81.5-73.1-106-123.2-29.6-60.7-58.7-122.2-87.8-183.2-61.6-129.2-138.6-248-238.7-351.1-71.7-73.8-152.5-134.8-247.9-174.8-6.9-2.9-11.5-7.8-15.8-13.5-29.2-38.3-54-79.1-69.9-124.8-20.3-58.6-22.5-117.4.7-175.8,26.8-67.4,77.5-111.8,140.8-143.3,59.7-29.7,123.7-45.2,189.1-56.1,85.4-14.3,171.3-19.1,257.7-11.2,26.4,2.4,52.3,8.2,79.6,12.8-1.6-3.8-2.4-6.2-3.5-8.4-2.8-5.4-5.4-10.8-8.6-16-37.3-61.5-87.7-110.2-148.5-148.2-110.1-68.9-232.1-98.4-360.2-105.6-33.6-1.9-61.3-9.6-89.6-30.3-109.5-80.1-233.4-107.2-367.7-91.9-103.9,11.8-197.9,48.4-283.8,107.6-91.3,62.8-170.3,141.4-263.4,201.4,1.3,3.6,3.6,2.7,5.4,2.8,70.6,3.8,138.8-11.9,207.7-25.2-142.7,75.7-262.1,171.7-303,338.1,41.4-38.3,88-67.6,140.8-87.1-39,42-68.8,89.9-92.5,141.4-79.6,173.1-94.5,354.4-61,539.8,31.9,177,108.7,333.6,226.4,469.8,6.6,7.6,13.6,14.9,20.7,22.1,6.6,6.8,13.5,13.3,23.1,22.7l254,162c139.8,87.7,294.6,130.1,457.6,141.8,166.5,12,330.1-7.8,489.8-57.3,12.2-3.8,24.1-8.5,36-13.1s19.2-8.2,28.5-13.1l114-60.6c31.6-16.8,64.3-31.5,97.9-43.8ZM1326.1,1075.5c50.8-26.4,106-35.6,161.9-39.4,111.3-7.5,221.7-2.3,329.1,32,28.7,9.2,56.6,20.3,85.5,35-222-20.9-439.8-17.1-656.4,43.6,23-29.9,47.6-54.5,79.8-71.3ZM1150.4,943.8c31.7.5,57,26.5,56.9,58.5,0,30.6-26.9,56.6-57.6,55.9-31.8-.8-57-27-56.6-58.8.4-31.6,25.6-56,57.3-55.5Z'/%3E%3Ccircle cx='1500' cy='1500' r='1319.5' fill='none' stroke-width='109'/%3E%3C/svg%3E" />
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
