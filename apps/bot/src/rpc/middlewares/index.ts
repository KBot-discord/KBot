import type { AuthData } from '@sapphire/plugin-api';
import type { ConnectError } from '@bufbuild/connect';

export * from '#rpc/middlewares/authenticated';

declare module '@bufbuild/connect' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface HandlerContext {
		auth: AuthData | null;
		error: ConnectError | null;
	}
}
