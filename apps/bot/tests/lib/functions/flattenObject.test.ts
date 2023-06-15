import { describe, expect, test } from 'vitest';
import { checkDepth, flattenObject } from '#src/lib/utilities/functions';
import { depth_one, depth_two } from '#mocks';

describe('flattenObject', () => {
	test('IF depth 1 THEN flattened object', () => {
		const result = flattenObject(depth_one);

		expect(checkDepth(result)).toBe(1);
	});

	test('IF depth 2 THEN flattened object', () => {
		const result = flattenObject(depth_two);

		expect(checkDepth(result)).toBe(1);
	});
});
