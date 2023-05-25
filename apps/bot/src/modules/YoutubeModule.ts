import { BlankSpace, EmbedColors } from '#utils/constants';
import { YoutubeSettingsService, YoutubeSubscriptionService } from '#services';
import { isNullOrUndefined } from '#utils/functions';
import { Module } from '@kbotdev/plugin-modules';
import { EmbedBuilder } from 'discord.js';
import { channelMention, roleMention } from '@discordjs/builders';
import type { YoutubeSubscriptionWithChannel } from '@kbotdev/database';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';

export class YoutubeModule extends Module {
	public readonly settings: YoutubeSettingsService;
	public readonly subscriptions: YoutubeSubscriptionService;

	public constructor(options?: Module.Options) {
		super({ ...options, fullName: 'Youtube Module' });

		this.settings = new YoutubeSettingsService();
		this.subscriptions = new YoutubeSubscriptionService();
	}

	public override async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullOrUndefined(guild)) return false;
		const settings = await this.settings.get(guild.id);
		return isNullOrUndefined(settings) ? false : settings.enabled;
	}

	public buildSubscriptionEmbed({
		channel,
		message,
		roleId,
		discordChannelId,
		memberDiscordChannelId,
		memberRoleId
	}: YoutubeSubscriptionWithChannel): EmbedBuilder {
		return new EmbedBuilder() //
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'YouTube notification settings' })
			.setTitle(channel.name)
			.setURL(`https://www.youtube.com/channel/${channel.youtubeId}`)
			.setFields([
				{ name: 'Message', value: message ?? 'No message set.' },
				{
					name: 'Channel',
					value: discordChannelId ? channelMention(discordChannelId) : 'No channel set.',
					inline: true
				},
				{ name: 'Role', value: roleId ? roleMention(roleId) : 'No role set.', inline: true },
				{ name: BlankSpace, value: BlankSpace },
				{
					name: 'Member Channel',
					value: memberDiscordChannelId ? channelMention(memberDiscordChannelId) : 'No channel set.',
					inline: true
				},
				{
					name: 'Member Role',
					value: memberRoleId ? roleMention(memberRoleId) : 'No role set.',
					inline: true
				}
			])
			.setThumbnail(channel.image);
	}
}
