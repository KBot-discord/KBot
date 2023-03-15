import { KBotErrors } from '#types/Enums';
import { KBotError } from '#structures/KBotError';
import { canSendEmbeds, canSendMessages } from '@sapphire/discord.js-utilities';
import { channelMention } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { isNullish } from '@sapphire/utilities';
import type { Channel, GuildChannel, GuildTextBasedChannel } from 'discord.js';

export class ChannelValidator {
	public async canSendEmbeds(
		channel: Channel | GuildChannel | GuildTextBasedChannel | null
	): Promise<{ result: true; error?: undefined } | { result: false; error: KBotError }> {
		if (isNullish(channel) || !channel.isTextBased() || channel.isDMBased()) {
			return {
				result: false,
				error: new KBotError({
					identifier: KBotErrors.ChannelPermissions
				})
			};
		}

		if (channel.permissionsFor(await channel.guild.members.fetchMe()).has(PermissionFlagsBits.Administrator)) return { result: true };

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

		if (errors.length === 0) return { result: true };

		return {
			result: false,
			error: new KBotError({
				identifier: KBotErrors.ChannelPermissions,
				message: `I don't have the required permission(s) to send messages in ${channelMention(
					channel.id
				)}\n\nRequired permission(s):${errors}`
			})
		};
	}
}
