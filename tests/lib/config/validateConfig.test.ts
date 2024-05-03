import { validateConfig } from '../../../src/lib/utilities/config.js';
import { mockInvalidConfig, mockValidConfig } from '../../mocks/config.js';
import { describe, expect, test } from 'vitest';

describe('validateConfig', () => {
	test('IF valid config THEN true', () => {
		const result = validateConfig(mockValidConfig);

		expect(result).toBe(true);
	});

	test('IF no message THEN false', () => {
		const result = validateConfig(mockInvalidConfig);

		expect(result).toBe(false);
	});
});
