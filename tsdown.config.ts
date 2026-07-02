import { defineConfig } from 'tsdown';

export default defineConfig({
	unbundle: true,
	clean: true,
	dts: false,
	entry: ['src/**/*.ts'],
	format: ['esm'],
	minify: false,
	shims: false,
	sourcemap: true,
	target: 'esnext',
	treeshake: true,
	deps: {
		skipNodeModulesBundle: true,
	},
});
