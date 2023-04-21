import { BlankSpace, EmbedColors } from '#utils/constants';
import { YoutubeSettingsService, YoutubeSubscriptionService } from '#services';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { EmbedBuilder } from 'discord.js';
import { channelMention, roleMention } from '@discordjs/builders';
import type { YoutubeSettings } from '#prisma';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { YoutubeSubscriptionWithChannel, UpsertYoutubeSettingsData } from '#types/database';

@ApplyOptions<Module.Options>({
	name: 'YoutubeModule',
	fullName: 'Youtube Module'
})
export class YoutubeModule extends Module {
	public readonly settings: YoutubeSettingsService;
	public readonly subscriptions: YoutubeSubscriptionService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.settings = new YoutubeSettingsService();
		this.subscriptions = new YoutubeSubscriptionService();

		this.container.youtube = this;
	}

	public async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.settings.get({ guildId: guild.id });
		return isNullish(settings) ? false : settings.enabled;
	}

	public async getSettings(guildId: string): Promise<YoutubeSettings | null> {
		return this.settings.get({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertYoutubeSettingsData): Promise<YoutubeSettings> {
		return this.settings.upsert({ guildId }, data);
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
				{ name: 'Channel', value: discordChannelId ? channelMention(discordChannelId) : 'No channel set.', inline: true },
				{ name: 'Role', value: roleId ? roleMention(roleId) : 'No role set.', inline: true },
				{ name: BlankSpace, value: BlankSpace },
				{ name: 'Member Channel', value: memberDiscordChannelId ? channelMention(memberDiscordChannelId) : 'No channel set.', inline: true },
				{ name: 'Member Role', value: memberRoleId ? roleMention(memberRoleId) : 'No role set.', inline: true }
			])
			.setThumbnail(channel.image);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		YoutubeModule: never;
	}
}
