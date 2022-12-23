import { canSendEmbeds, canSendMessages } from '@sapphire/discord.js-utilities';
import type { GuildChannel } from 'discord.js';

export class ChannelValidator {
	public canSendEmbeds(channel: GuildChannel): { valid: boolean; errors?: string[] } {
		if (channel.permissionsFor(channel.guild.me!).has('ADMINISTRATOR')) return { valid: true };

		const errors = [];
		if (!channel.viewable) {
			errors.push(' View Channel');
		}
		if (!canSendMessages(channel)) {
			errors.push(' Send Messages');
		}
		if (!canSendEmbeds(channel)) {
			errors.push(' Embed Links');
		}
		if (errors.length > 0) {
			return { valid: false, errors };
		}
		return { valid: true };
	}
}
