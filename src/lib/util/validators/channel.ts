import { KBotError } from '#lib/structures/KBotError';
import { KBotErrors } from '#utils/constants';
import { canSendEmbeds, canSendMessages } from '@sapphire/discord.js-utilities';
import { channelMention } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ChannelType } from 'discord.js';
import type { GuildChannel, GuildTextBasedChannel } from 'discord.js';

export class ChannelValidator {
	public canSendEmbeds(channel: GuildChannel | GuildTextBasedChannel): { result: true; error?: undefined } | { result: false; error: KBotError } {
		if (channel.type !== ChannelType.GuildText) {
			return {
				result: false,
				error: new KBotError({
					identifier: KBotErrors.ChannelPermissions
				})
			};
		}

		if (channel.permissionsFor(channel.guild.members.me!).has(PermissionFlagsBits.Administrator)) return { result: true };

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
