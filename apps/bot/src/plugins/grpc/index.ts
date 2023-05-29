/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { gRPCPluginOptions } from '#plugins/grpc/lib/types/gRPCPluginsOptions';
import type { gRPCStore } from '#plugins/grpc/lib/structures/gRPCStore';
import type { Http2Server } from 'http2';

export * from '#plugins/grpc/lib/structures/gRPCService';
export * from '#plugins/grpc/lib/structures/gRPCStore';
export * from '#plugins/grpc/lib/types/gRPCEvents';
export * from '#plugins/grpc/lib/types/gRPCPluginsOptions';

declare module '@sapphire/pieces' {
	interface StoreRegistryEntries {
		'grpc-services': gRPCStore;
	}
}

declare module 'discord.js' {
	interface Client {
		grpc: Http2Server;
	}

	interface ClientOptions {
		grpc?: gRPCPluginOptions;
	}
}
