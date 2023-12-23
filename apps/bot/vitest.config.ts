import rootConfig from '../../vitest.config.mjs';
import { defaultExclude, defineProject, mergeConfig } from 'vitest/config';

export default mergeConfig(
	rootConfig,
	defineProject({
		test: {
			exclude: [
				...defaultExclude, //
				'**/tests/mocks/**'
			]
		}
	})
);
