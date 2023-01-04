import { parseTimeString } from '../../../src/lib/util/util';
import { describe, expect, test } from 'vitest';

describe('parseTimeString', () => {
	test('GIVEN null -> RETURN null', () => {
		const result = parseTimeString(null);

		expect(result).toBe(null);
	});

	test('GIVEN invalid input string -> RETURN null', () => {
		const result = parseTimeString('1d6m');

		const days = 1440 * 60000;
		const minutes = 6 * 60000;
		expect(result).toBe(days + minutes);
	});

	test('GIVEN invalid input string -> RETURN null', () => {
		const result = parseTimeString('invalid input');

		expect(result).toBe(null);
	});

	test('GIVEN valid input string -> RETURN offset', () => {
		const result = parseTimeString('5 minutes');

		expect(result).toBeTypeOf('number');
		expect(result).toBe(5 * 60000);
	});
});
