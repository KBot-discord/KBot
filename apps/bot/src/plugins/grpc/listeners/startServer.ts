import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { connectNodeAdapter } from '@bufbuild/connect-node';
import { redBright } from 'colorette';
import { createServer } from 'http2';
import type { Client } from 'discord.js';
import type { ConnectRouter } from '@bufbuild/connect';

@ApplyOptions<Listener.Options>({
	event: Events.ClientReady,
	once: true
})
export class gRPCListener extends Listener<typeof Events.ClientReady> {
	public async run(client: Client): Promise<void> {
		const {
			options: { grpc }
		} = client;
		const { stores, logger } = this.container;

		if (grpc) {
			const routes = stores.get('grpc-services').toJSON();

			const adapter = connectNodeAdapter({
				...grpc.options,
				routes: (router: ConnectRouter): void => {
					for (const route of routes) {
						route.register(router);
					}
				}
			});

			client.grpc = createServer(adapter);

			client.grpc.listen(grpc.port, grpc.host, () => {
				logger.info(`[${redBright('gRPC Plugin')}] Server started on ${grpc.host}:${grpc.port}`);
			});
		}
	}
}
