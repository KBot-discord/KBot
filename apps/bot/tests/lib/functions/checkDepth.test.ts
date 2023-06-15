import { describe, expect, test } from 'vitest';
import { checkDepth } from '#src/lib/utilities/functions';
import { depth_one, depth_three_with_objects, depth_two } from '#mocks';

describe('checkDepth', () => {
	test('IF depth 1 THEN 1', () => {
		const result = checkDepth(depth_one);

		expect(result).toBe(1);
	});

	test('IF depth 2 THEN 2', () => {
		const result = checkDepth(depth_two);

		expect(result).toBe(2);
	});

	test('IF depth 2 THEN 2', () => {
		const result = checkDepth(depth_three_with_objects);

		expect(result).toBe(3);
	});
});
