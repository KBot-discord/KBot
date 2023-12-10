import { defineTsupConfig } from '../../scripts/tsup';
import { relative } from 'node:path';

export default defineTsupConfig({
	dts: false,
	bundle: true,
	splitting: true,
	entry: ['src/**/*.ts', '!src/**/*.d.ts'],
	format: ['esm'],
	tsconfig: relative(__dirname, './tsconfig.json'),
	noExternal: [
		'@kbotdev/holodex', //
		'@kbotdev/meili',
		'@kbotdev/proto'
	]
});
