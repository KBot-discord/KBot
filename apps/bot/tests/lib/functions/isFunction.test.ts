import { describe, expect, test } from 'vitest';
import { isFunction } from '#src/lib/utilities/functions';

describe('isFunction', () => {
	function placeholder_one(): boolean {
		return true;
	}

	const placeholder_two = (): boolean => {
		return true;
	};

	const placeholder_three = true;

	test('IF Function THEN true', () => {
		const result = isFunction(placeholder_one);

		expect(result).toBe(true);
	});

	test('IF arrow Function THEN true', () => {
		const result = isFunction(placeholder_two);

		expect(result).toBe(true);
	});

	test('IF constant THEN false', () => {
		const result = isFunction(placeholder_three);

		expect(result).toBe(false);
	});
});
