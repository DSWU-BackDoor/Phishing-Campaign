import { build } from 'esbuild'
import { rmSync } from 'node:fs'

const entries = [
  'events',
  'training-email',
  'feedback-post',
  'feedback-get',
  'stats-get',
]

rmSync('dist', { recursive: true, force: true })

await Promise.all(
  entries.map((name) =>
    build({
      entryPoints: [`${name}/index.ts`],
      outfile: `dist/${name}/index.js`,
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      sourcemap: false,
      minify: true,
    }),
  ),
)

console.log(`Built ${entries.length} lambda bundles into dist/`)
