import { defineTsupConfig } from '../../scripts/tsup';
import { relative } from 'node:path';

export default defineTsupConfig({
	dts: false,
	format: ['cjs'],
	sourcemap: false,
	tsconfig: relative(__dirname, './tsconfig.json')
});
