import { defineConfig, Options } from 'tsup';

export function modernConfig(opts: Options): Options {
  return {
    entry: opts.entry,
    format: ['cjs', 'esm'],
    target: ['node16'], // Only targeting Node.js 16+
    outDir: 'dist',
    dts: true,
    sourcemap: true,
    clean: true,
  };
}

export default defineConfig([
  modernConfig({ entry: ['src/index.ts'] }),
]);
