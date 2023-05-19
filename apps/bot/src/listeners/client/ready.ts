import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { DocumentCommand } from '#types/Meili';
import type { Client } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.ClientReady,
	once: true
})
export class ClientListener extends Listener<typeof Events.ClientReady> {
	private readonly commandsToFilter = ['help'];
	private readonly categoriesToFilter = ['Dev'];

	public async run(client: Client<true>): Promise<void> {
		await this.syncMeili();
		this.container.logger.info(`${client.user.tag} is online.`);
	}

	private async syncMeili(): Promise<void> {
		const commands = this.container.stores.get('commands');
		const documents: DocumentCommand[] = commands
			.toJSON()
			.filter((cmd) => !this.commandsToFilter.includes(cmd.name))
			.filter((cmd) => cmd.category && !this.categoriesToFilter.includes(cmd.category))
			.map((command, index) => {
				return {
					id: `${index}`,
					name: command.name,
					description: command.description
				};
			});

		await this.container.meili.resetIndex('commands', documents);
	}
}
