// Imports
import { container, Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Guild } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildCreate
})
export class GuildListener extends Listener {
	public async run(guild: Guild) {
		await container.db.guild.create({
			data: {
				id: guild.id,
				staffRoles: [],
				botManagers: []
			}
		});
	}
}
