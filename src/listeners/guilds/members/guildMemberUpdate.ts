import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { isNullOrUndefined } from '@sapphire/utilities';
import type { GuildMember, PartialGuildMember } from 'discord.js';
import { AntiHoistHandler } from '../../../lib/structures/handlers/AntiHoistHandler.js';

@ApplyOptions<Listener.Options>({
	event: Events.GuildMemberUpdate,
})
export class GuildListener extends Listener<typeof Events.GuildMemberUpdate> {
	public async run(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember): Promise<void> {
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
