import { describe, expect, test } from 'vitest';
import { getMockConfig } from '../../mocks/config';
import { validateConfig } from '../../../src/lib/util/config';
import type { Config } from '../../../src/lib/types/Config';

describe('ConfigValidator', () => {
	test('GIVEN valid config -> RETURN config', () => {
		const config = getMockConfig(true) as Config;
		const result = validateConfig(config);

		expect(result).toBe(true);
	});

	test('GIVEN invalid config -> RETURN null', () => {
		const config = getMockConfig(false) as Config;
		const result = validateConfig(config);

		expect(result).toBe(false);
	});
});
