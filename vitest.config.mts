import { coverageConfigDefaults, defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		env: {
			NODE_ENV: 'test'
		},
		coverage: {
			provider: 'v8',
			reporter: ['html', 'text', 'clover'],
			exclude: [...coverageConfigDefaults.exclude, '**/tests/mocks/**']
		}
	}
});
