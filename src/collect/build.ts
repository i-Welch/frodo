/**
 * Bundle frodo-collect.ts into a single JS file for <script> tag delivery.
 *
 * Run with: bun run build:collect
 *
 * Output: dist/frodo-collect.js
 */
async function build() {
  const result = await Bun.build({
    entrypoints: ['src/collect/frodo-collect.ts'],
    outdir: 'dist',
    minify: true,
    naming: 'frodo-collect.js',
  });

  if (!result.success) {
    console.error('Build failed:');
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  console.log('Built dist/frodo-collect.js');
}

build();
