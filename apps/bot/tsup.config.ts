import { defineTsupConfig } from '../../scripts/tsup';
import { relative } from 'node:path';

export default defineTsupConfig({
	silent: true,
	dts: false,
	bundle: true,
	splitting: true,
	entry: ['src/**/*.ts', '!src/**/*.d.ts'],
	format: ['esm'],
	tsconfig: relative(__dirname, './tsconfig.json'),
	noExternal: [
		'@kbotdev/database', //
		'@kbotdev/holodex',
		'@kbotdev/meili',
		'@kbotdev/prisma',
		'@kbotdev/proto',
		'@kbotdev/redis'
	]
});
