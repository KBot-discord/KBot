import { defineTsupConfig } from '../../scripts/tsup';
import { relative } from 'node:path';

export default defineTsupConfig({
	bundle: true,
	tsconfig: relative(__dirname, './tsconfig.json')
});
