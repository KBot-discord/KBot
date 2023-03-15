import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildMemberUpdate
})
export class GuildListener extends Listener {
	public async run(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
		const { moderation } = this.container;

		if (
			newMember.manageable && //
			(oldMember.nickname !== newMember.nickname || oldMember.user.username !== newMember.user.username)
		) {
			const settings = await moderation.getSettings(newMember.guild.id);
			if (isNullish(settings) || !settings.enabled) return;

			await moderation.antiHoist.parseMember(newMember, settings);
		}
	}
}
