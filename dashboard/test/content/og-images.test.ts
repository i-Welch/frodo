import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

// A page that sets its own `openGraph` metadata replaces the inherited one,
// image included, and then shares on LinkedIn as a bare link. Each such page
// must list images or sit beside its own opengraph-image file.

const APP = resolve(__dirname, '../../src/app');

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return pages(path);
    return name === 'page.tsx' ? [path] : [];
  });
}

describe('link preview images', () => {
  it('every page that overrides openGraph has an image', () => {
    const missing = pages(APP).filter((p) => {
      const src = readFileSync(p, 'utf8');
      if (!/openGraph:\s*\{/.test(src)) return false;
      return !src.includes('images:') && !existsSync(join(dirname(p), 'opengraph-image.tsx'));
    });
    expect(missing.map((p) => p.slice(APP.length))).toEqual([]);
  });
});
