import type { Config } from '../../src/lib/types/Config';

export const getMockConfig = (valid: boolean) => {
	return valid
		? ({ a: true, b: { c: 'string', d: false }, e: { f: { g: [] } } } as unknown as Config)
		: ({ a: true, b: { c: 'string', d: undefined }, e: { f: { g: [] } } } as unknown as Config);
};
