import { defineTsupConfig } from '../../scripts/tsup';
import { relative } from 'node:path';

export default defineTsupConfig({
	dts: false,
	entry: ['src/**/*.ts', '!src/**/*.d.ts'],
	format: ['esm'],
	tsconfig: relative(__dirname, './tsconfig.json')
});
