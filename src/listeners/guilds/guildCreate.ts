import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.GuildCreate,
})
export class GuildListener extends Listener<typeof Events.GuildCreate> {
	public async run(guild: Guild): Promise<void> {
		const isBlacklisted = await this.container.prisma.blacklist.findUnique({
			where: { guildId: guild.id },
		});

		if (isBlacklisted) {
			await guild.leave();
			return;
		}

		await this.container.core.settings.upsert(guild.id);
	}
}
