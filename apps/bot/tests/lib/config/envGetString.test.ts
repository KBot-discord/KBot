import { beforeAll, describe, expect, test } from 'vitest';
import { config } from 'dotenv';
import { envGetString } from '#src/lib/utilities/config';

describe('envGetString', () => {
	beforeAll(async () => {
		const path = new URL('../../.env.test', import.meta.url).pathname;
		config({ path });
	});

	test('IF string env var THEN string', () => {
		const result = envGetString('TEST_VALID_STRING');

		expect(result).toStrictEqual('string');
	});

	test('IF number env var THEN string', () => {
		const result = envGetString('TEST_INVALID_STRING');

		expect(result).toStrictEqual('1');
	});

	test('IF undefined env var THEN TypeError', () => {
		const result = (): string => {
			return envGetString('TEST_UNDEFINED_STRING');
		};

		expect(result).toThrowError(TypeError);
	});
});
