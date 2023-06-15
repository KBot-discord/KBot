import { beforeAll, describe, expect, test } from 'vitest';
import { config } from 'dotenv';
import { envGetNumber } from '#src/lib/utilities/config';

describe('envGetNumber', () => {
	beforeAll(async () => {
		const path = new URL('../../.env.test', import.meta.url).pathname;
		config({ path });
	});

	test('IF number env var THEN string', () => {
		const result = envGetNumber('TEST_VALID_NUMBER');

		expect(result).toStrictEqual(1);
	});

	test('IF string env var THEN TypeError', () => {
		const result = (): number => {
			return envGetNumber('TEST_INVALID_NUMBER');
		};

		expect(result).toThrowError(TypeError);
	});

	test('IF undefined env var THEN TypeError', () => {
		const result = (): number => {
			return envGetNumber('TEST_UNDEFINED_NUMBER');
		};

		expect(result).toThrowError(TypeError);
	});
});
