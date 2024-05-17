import { describe, expect, test } from 'vitest';
import { GENERIC_ERROR, formGenericError } from '../../../src/lib/utilities/constants.js';

describe('formGenericError', () => {
	test('IF no message THEN generic message', () => {
		const result = formGenericError();

		expect(result).toStrictEqual(GENERIC_ERROR);
	});

	test('IF message THEN custom message', () => {
		const message = 'Something went wrong.';

		const result = formGenericError(message);

		expect(result).toStrictEqual(`${message} The devs have been made aware of the error and are looking into it.`);
	});
});
