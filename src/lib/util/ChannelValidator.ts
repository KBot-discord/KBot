import type { GuildChannel } from 'discord.js';

export class ChannelValidator {
	public canSendEmbeds(channel: GuildChannel): { valid: boolean; errors?: string[] } {
		const errors = [];
		if (!channel.viewable) {
			errors.push(' View Channel');
		}
		if (!channel.permissionsFor(channel.guild.me!).has('SEND_MESSAGES')) {
			errors.push(' Send Messages');
		}
		if (!channel.permissionsFor(channel.guild.me!).has('EMBED_LINKS')) {
			errors.push(' Embed Links');
		}
		if (errors.length > 0) {
			return { valid: false, errors };
		}
		return { valid: true };
	}
}
