import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		coverage: {
			provider: 'c8',
			reporter: ['text', 'lcov', 'clover']
		},
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/cypress/**',
			'**/.{idea,git,cache,output,temp}/**',
			'**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
			'**/infra',
			'**/prisma/seed'
		]
	}
});
