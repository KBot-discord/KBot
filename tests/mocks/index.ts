export const depth_one = {
	key_1: 'value',
	key_2: 'value',
	key_3: 'value',
};

export const depth_two = {
	key_1: 'value',
	key_2: 'value',
	key_3: {
		key_4: 'value',
		key_5: 'value',
		key_6: 'value',
	},
};

export const depth_three_with_objects = {
	key_1: 'value',
	key_2: 'value',
	key_3: {
		key_4: [],
		key_5: undefined,
		key_6: null,
		key_7: new Number('5'),
	},
};
