import '#plugins/grpc';

import { pluginsFolder } from '#utils/constants';
import { registerPieces } from '#utils/sapphire';
import { gRPCStore } from '#plugins/grpc/lib/structures/gRPCStore';
import { Plugin, SapphireClient, postInitialization } from '@sapphire/framework';
import { join } from 'path';

export class RPCPlugin extends Plugin {
	public static [postInitialization](this: SapphireClient): void {
		this.stores.register(new gRPCStore());
		registerPieces('listeners', join(pluginsFolder, 'grpc'));
	}
}

SapphireClient.plugins.registerPostInitializationHook(RPCPlugin[postInitialization], 'RPC-PostInitialization');
