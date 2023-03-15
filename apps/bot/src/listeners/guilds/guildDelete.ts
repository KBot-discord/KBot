import { baseCacheKey } from '#utils/cache';
import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Guild } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildDelete
})
export class GuildListener extends Listener {
	public async run(guild: Guild): Promise<void> {
		this.container.redis.deleteScanKeys(`${baseCacheKey(guild.id)}:*`);
	}
}
