import { checkDepth, flattenObject } from '../../../src/lib/utilities/functions.js';
import { depth_one, depth_two } from '../../mocks/index.js';
import { describe, expect, test } from 'vitest';

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
