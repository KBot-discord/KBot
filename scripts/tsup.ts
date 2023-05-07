import { defineConfig } from 'tsup';
import type { Options } from 'tsup';

type TsupOptions = Omit<Options, 'tsconfig'> & Required<Pick<Options, 'tsconfig'>>;

export function defineTsupConfig(options: TsupOptions, override = false) {
	if (override) return defineConfig(options);
	return defineConfig({
		bundle: false,
		clean: true,
		dts: true,
		entry: ['src/index.ts'],
		format: ['esm', 'cjs'],
		keepNames: true,
		minify: false,
		shims: false,
		skipNodeModulesBundle: true,
		splitting: false,
		sourcemap: true,
		target: 'esnext',
		treeshake: true,
		...options
	});
}
