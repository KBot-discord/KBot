import { describe, expect, test } from 'vitest';
import { isNullOrUndefinedOrEmpty } from '#src/lib/utilities/functions';

describe('isNullOrUndefinedOrEmpty', () => {
	test('IF null THEN true', () => {
		const result = isNullOrUndefinedOrEmpty(null);

		expect(result).toBe(true);
	});

	test('IF undefined THEN true', () => {
		const result = isNullOrUndefinedOrEmpty(undefined);

		expect(result).toBe(true);
	});

	test('IF empty string THEN true', () => {
		const result = isNullOrUndefinedOrEmpty('');

		expect(result).toBe(true);
	});

	test('IF valid string THEN true', () => {
		const result = isNullOrUndefinedOrEmpty('random string');

		expect(result).toBe(false);
	});

	test('IF empty array THEN false', () => {
		const result = isNullOrUndefinedOrEmpty([]);

		expect(result).toBe(true);
	});

	test('IF valid array THEN false', () => {
		const result = isNullOrUndefinedOrEmpty(['random string']);

		expect(result).toBe(false);
	});
});
