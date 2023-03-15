import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildMemberRemove
})
export class GuildListener extends Listener {
	public async run(member: GuildMember): Promise<void> {
		const {
			moderation: { mutes }
		} = this.container;

		const settings = await this.container.moderation.getSettings(member.guild.id);
		if (isNullish(settings) || !settings.enabled) return;

		const existingMute = await mutes.get({
			guildId: member.guild.id,
			userId: member.id
		});
		if (isNullish(existingMute)) return;

		await mutes.update(
			{
				guildId: member.guild.id,
				userId: member.id
			},
			{ evadeTime: BigInt(Date.now()) }
		);
		await mutes.deleteTask({ guildId: member.guild.id, userId: member.id });
	}
}
