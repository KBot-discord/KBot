import type { ClientConfig } from '#src/lib/types/Config';

export const mockValidConfig = {
	discord: {
		token: 'token',
	},
} as ClientConfig;

export const mockInvalidConfig = {
	discord: {
		token: undefined,
	},
} as unknown as ClientConfig;
