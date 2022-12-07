import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		root: './',
		include: ['./tests/**/*.test.ts'],
		setupFiles: './tests/vitest.setup.ts',
		reporters: ['default', 'junit'],
		outputFile: './coverage/junit.xml',
		coverage: {
			provider: 'istanbul'
		}
	}
});
