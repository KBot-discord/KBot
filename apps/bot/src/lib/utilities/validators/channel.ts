import { ChannelPermissionsError } from '#structures/errors/ChannelPermissionsError';
import { canSendEmbeds, canSendMessages } from '@sapphire/discord.js-utilities';
import { channelMention } from '@discordjs/builders';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { isNullish } from '@sapphire/utilities';
import type { KBotError } from '#structures/errors/KBotError';
import type { Channel, GuildChannel, GuildTextBasedChannel, StageChannel, VoiceChannel } from 'discord.js';

export class ChannelValidator {
	public async canSendEmbeds(
		channel: Channel | GuildChannel | GuildTextBasedChannel | null
	): Promise<{ result: false; error: KBotError } | { result: true; error?: undefined }> {
		if (isNullish(channel) || !channel.isTextBased() || channel.isDMBased()) {
			return {
				result: false,
				error: new ChannelPermissionsError()
			};
		}

		const bot = await channel.guild.members.fetchMe();
		const clientPermissions = channel.permissionsFor(bot);

		if (clientPermissions.has(PermissionFlagsBits.Administrator)) {
			return { result: true };
		}

		const errors = [];
		if (!channel.viewable) {
			errors.push(' `View Channel`');
		}
		if (!canSendMessages(channel)) {
			errors.push(' `Send Messages`');
		}
		if (!canSendEmbeds(channel)) {
			errors.push(' `Embed Links`');
		}
		if (channel.isVoiceBased() && !clientPermissions.has(PermissionFlagsBits.Connect)) {
			errors.push(' `Connect`');
		}

		if (errors.length === 0) {
			return { result: true };
		}

		return {
			result: false,
			error: new ChannelPermissionsError(
				`I don't have the required permission(s) to send messages in ${channelMention(
					channel.id //
				)}\nRequired permission(s):${errors}`
			)
		};
	}

	public async canModerateVoice(
		channel: StageChannel | VoiceChannel | null
	): Promise<{ result: false; error: KBotError } | { result: true; error?: undefined }> {
		if (isNullish(channel)) {
			return {
				result: false,
				error: new ChannelPermissionsError()
			};
		}

		const bot = await channel.guild.members.fetchMe();
		const clientPermissions = channel.permissionsFor(bot);

		if (clientPermissions.has(PermissionFlagsBits.Administrator)) {
			return { result: true };
		}

		const errors = [];
		if (channel.type === ChannelType.GuildStageVoice && !clientPermissions.has(PermissionFlagsBits.ManageChannels)) {
			errors.push(' `Manage Channel`');
		}
		if (!clientPermissions.has(PermissionFlagsBits.MuteMembers)) {
			errors.push(' `Mute Members`');
		}
		if (channel.type === ChannelType.GuildStageVoice && !clientPermissions.has(PermissionFlagsBits.MoveMembers)) {
			errors.push(' `Move Members`');
		}

		if (errors.length === 0) {
			return { result: true };
		}

		return {
			result: false,
			error: new ChannelPermissionsError(
				`I don't have the required permission(s) to manage the karaoke events in ${channelMention(
					channel.id //
				)}\nRequired permission(s):${errors}`
			)
		};
	}
}
