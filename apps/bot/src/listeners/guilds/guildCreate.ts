import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Guild } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildCreate
})
export class GuildListener extends Listener {
	public async run(guild: Guild): Promise<void> {
		await this.container.core.upsertSettings(guild.id);
	}
}
