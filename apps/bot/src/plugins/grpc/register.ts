import '#plugins/grpc';

import { pluginsFolder } from '#utils/constants';
import { registerPieces } from '#utils/sapphire';
import { gRPCStore } from '#plugins/grpc/lib/structures/gRPCStore';
import { Plugin, SapphireClient, postInitialization } from '@sapphire/framework';
import { join } from 'path';

export class RPCPlugin extends Plugin {
	public static [postInitialization](this: SapphireClient): void {
		const { stores } = this;
		const dir = join(pluginsFolder, 'rpc');

		stores.register(new gRPCStore());
		registerPieces('listeners', dir);
	}
}

SapphireClient.plugins.registerPostInitializationHook(RPCPlugin[postInitialization], 'RPC-PostInitialization');
