import { defineConfig } from 'tsup';
import { relative } from 'node:path';

export default defineConfig({
	clean: true,
	dts: true,
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	minify: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'es2021',
	tsconfig: relative(__dirname, './tsconfig.json'),
	keepNames: true,
	treeshake: true
});
