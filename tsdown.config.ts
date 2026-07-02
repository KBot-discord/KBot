import { defineConfig } from 'tsdown';

export default defineConfig({
	bundle: false,
	clean: true,
	dts: false,
	entry: ['src/**/*.ts'],
	format: ['esm'],
	minify: false,
	shims: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'esnext',
	treeshake: true,
});
