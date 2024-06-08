import replaceInFile from 'replace-in-file';
import { type Options, defineConfig } from 'tsup';

import packageJson from './package.json';

async function injectSdkDetails(dist: string) {
  try {
    await replaceInFile({
      files: `${dist}/**/*`,
      from: /__SDK_NAME__/g,
      to: packageJson.name,
    });
    await replaceInFile({
      files: `${dist}/**/*`,
      from: /__SDK_VERSION__/g,
      to: packageJson.version,
    });
  } catch (error) {
    console.error('[injectSdkDetails]:', error);
  }
}

export function config(opts: Options): Options {
  return {
    entry: opts.entry,
    format: ['cjs', 'esm'],
    target: ['node16'], // Only targeting Node.js 16+
    outDir: 'dist',
    dts: true,
    sourcemap: true,
    clean: true,
    async onSuccess() {
      await injectSdkDetails('dist');
    },
  };
}

export default defineConfig([config({ entry: ['src/index.ts'] })]);
