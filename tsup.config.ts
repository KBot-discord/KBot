import { relative } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
	bundle: false,
	clean: true,
	dts: false,
	entry: ['src/**/*.ts'],
	format: ['esm'],
	keepNames: true,
	minify: false,
	shims: false,
	skipNodeModulesBundle: true,
	splitting: false,
	sourcemap: true,
	target: 'esnext',
	treeshake: true,
	tsconfig: relative(__dirname, './tsconfig.json'),
});
