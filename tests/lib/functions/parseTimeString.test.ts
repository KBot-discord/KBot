import { describe, expect, test } from 'vitest';
import { parseTimeString } from '../../../src/lib/utilities/functions.js';

describe('parseTimeString', () => {
	test('IF valid string THEN duration', () => {
		const result = parseTimeString('5 minutes');

		expect(typeof result).toBe('number');
	});

	test('IF invalid string THEN null', () => {
		const result = parseTimeString('random text');

		expect(result).toBe(null);
	});

	test('IF null input THEN null', () => {
		const result = parseTimeString(null);

		expect(result).toBe(null);
	});
});
