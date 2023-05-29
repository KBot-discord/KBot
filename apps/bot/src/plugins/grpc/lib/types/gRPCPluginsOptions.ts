import type { ConnectRouterOptions } from '@bufbuild/connect';

export type gRPCPluginOptions = {
	host: string;
	port: number;
	options?: ConnectRouterOptions;
};
