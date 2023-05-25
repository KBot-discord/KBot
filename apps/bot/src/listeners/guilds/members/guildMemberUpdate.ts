import { AntiHoistHandler } from '#structures/handlers/AntiHoistHandler';
import { isNullOrUndefined } from '#utils/functions';
import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.GuildMemberUpdate
})
export class GuildListener extends Listener {
	public async run(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
		const { moderation } = this.container;

		if (
			newMember.manageable && //
			(oldMember.nickname !== newMember.nickname || oldMember.user.username !== newMember.user.username)
		) {
			const settings = await moderation.settings.get(newMember.guild.id);
			if (isNullOrUndefined(settings) || !settings.enabled) return;

			await new AntiHoistHandler().parseMember(newMember, settings);
		}
	}
}
