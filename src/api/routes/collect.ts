import { Elysia } from 'elysia';
import { resolve, dirname } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Load the bundled library at startup (or serve a stub in dev/test)
// ---------------------------------------------------------------------------

const __dirname = typeof import.meta.dir === 'string'
  ? import.meta.dir
  : dirname(fileURLToPath(import.meta.url));

const DIST_PATH = resolve(__dirname, '../../../dist/frodo-collect.js');
const SRC_PATH = resolve(__dirname, '../../collect/frodo-collect.ts');

function loadBundle(): string {
  if (existsSync(DIST_PATH)) {
    return readFileSync(DIST_PATH, 'utf-8');
  }
  // Fallback: serve the source directly (dev/test convenience)
  if (existsSync(SRC_PATH)) {
    return readFileSync(SRC_PATH, 'utf-8');
  }
  return '// frodo-collect.js not yet built — run: bun run build:collect\n';
}

let cachedBundle: string | null = null;

function getBundle(): string {
  if (!cachedBundle) {
    cachedBundle = loadBundle();
  }
  return cachedBundle;
}

// ---------------------------------------------------------------------------
// Route: GET /frodo-collect.js
// ---------------------------------------------------------------------------

export const collectRoute = new Elysia().get('/frodo-collect.js', () => {
  const body = getBundle();
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});
