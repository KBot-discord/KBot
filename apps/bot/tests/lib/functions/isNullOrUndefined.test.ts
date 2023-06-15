import { describe, expect, test } from 'vitest';
import { isNullOrUndefined } from '#src/lib/utilities/functions';

describe('isNullOrUndefined', () => {
	test('IF null THEN true', () => {
		const result = isNullOrUndefined(null);

		expect(result).toBe(true);
	});

	test('IF undefined THEN true', () => {
		const result = isNullOrUndefined(undefined);

		expect(result).toBe(true);
	});

	test('IF value THEN false', () => {
		const result = isNullOrUndefined('random string');

		expect(result).toBe(false);
	});
});
