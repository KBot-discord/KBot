import { MinageHandler } from '#structures/handlers/MinageHandler';
import { WelcomeHandler } from '#structures/handlers/WelcomeHandler';
import { Events, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: Events.GuildMemberAdd
})
export class GuildListener extends Listener {
	public async run(member: GuildMember): Promise<void> {
		const { moderation } = this.container;

		if (member.user.bot) return;

		const settings = await moderation.getSettings(member.guild.id);
		if (isNullish(settings)) return;

		const wasKicked = await new MinageHandler(member, settings).run();
		if (wasKicked) return;

		await moderation.antiHoist.parseMember(member, settings);

		await new WelcomeHandler(member).run();

		await moderation.checkExistingMute(member, settings);
	}
}
