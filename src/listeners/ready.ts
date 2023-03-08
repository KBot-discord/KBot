import { container, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { DocumentCommand } from '#types/Meili';
import type { KBotClient } from '#extensions/KBotClient';

@ApplyOptions<Listener.Options>({
	name: 'ready',
	once: true
})
export class ReadyListener extends Listener {
	public async run(client: KBotClient) {
		await this.syncMeili();
		this.container.logger.info(`${client.user!.tag} is online.`);
	}

	private async syncMeili(): Promise<void> {
		const commands = this.container.stores.get('commands');
		const documents: DocumentCommand[] = [...commands.values()].map((command, index) => {
			return {
				id: `${index}`,
				name: command.name,
				description: command.description
			};
		});

		await container.meili.resetIndex('commands', documents);
	}
}
