import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Mirror tsconfig's "@/*" path so server code importing "@/lib/..." resolves in tests.
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    env: { LEAD_ENRICHMENT: 'off' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/server/**/*.ts'],
      exclude: ['src/server/next-handler.ts', 'src/server/app.ts'],
    },
  },
});
