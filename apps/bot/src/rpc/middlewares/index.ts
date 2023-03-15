import type { AuthData } from '@sapphire/plugin-api';
import type { ConnectError } from '@bufbuild/connect';

export * from './authenticated';

declare module '@bufbuild/connect' {
	interface HandlerContext {
		auth: AuthData | null;
		error: ConnectError | null;
	}
}
