import { ChannelPermissionsError } from '#structures/errors/ChannelPermissionsError';
import { isNullOrUndefined } from '#utils/functions';
import { canSendEmbeds, canSendMessages } from '@sapphire/discord.js-utilities';
import { channelMention } from '@discordjs/builders';
import { ChannelType, PermissionFlagsBits } from 'discord.js';
import type { Channel, GuildChannel, GuildTextBasedChannel, VoiceBasedChannel } from 'discord.js';

export class ChannelValidator {
	/**
	 * Checks if the bot has the required permissions to send messages and embeds.
	 * @param channel - The text channel
	 */
	public async canSendEmbeds(
		channel: Channel | GuildChannel | GuildTextBasedChannel | null
	): Promise<{ result: false; error: ChannelPermissionsError } | { result: true; error?: undefined }> {
		if (isNullOrUndefined(channel) || !channel.isTextBased() || channel.isDMBased()) {
			return {
				result: false,
				error: new ChannelPermissionsError({ channel: undefined })
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
			error: new ChannelPermissionsError({
				userMessage: `I don't have the required permission(s) to send messages in ${channelMention(
					channel.id //
				)}\nRequired permission(s):${errors}`,
				channel
			})
		};
	}

	/**
	 * Checks if the bot has the required permissions to mute and move users in a voice channel.
	 * @param channel - The voice channel
	 */
	public async canModerateVoice(
		channel: VoiceBasedChannel | null
	): Promise<{ result: false; error: ChannelPermissionsError } | { result: true; error?: undefined }> {
		if (isNullOrUndefined(channel) || !channel.isVoiceBased()) {
			return {
				result: false,
				error: new ChannelPermissionsError({ channel: undefined })
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
			error: new ChannelPermissionsError({
				userMessage: `I don't have the required permission(s) to manage the karaoke events in ${channelMention(
					channel.id //
				)}\nRequired permission(s):${errors}`,
				channel
			})
		};
	}
}
