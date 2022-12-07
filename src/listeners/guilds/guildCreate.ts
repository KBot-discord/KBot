import { container, Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Guild } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildCreate
})
export class GuildListener extends Listener {
	public async run(guild: Guild) {
		return container.db.guild.create({
			data: {
				id: guild.id,
				staffRoles: [],
				botManagers: [],
				moderationModule: { create: { id: guild.id } },
				notificationModule: { create: { id: guild.id } },
				utilityModule: { create: { id: guild.id } },
				welcomeModule: { create: { id: guild.id } }
			}
		});
	}
}
