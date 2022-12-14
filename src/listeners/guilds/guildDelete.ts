import { container, Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Guild } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildDelete
})
export class GuildListener extends Listener {
	public async run(guild: Guild) {
		await container.db.guild.delete({ where: { id: guild.id } });
		return container.redis.deleteScanKeys(`kbot:core:guilds:${guild.id}:*`);
	}
}
