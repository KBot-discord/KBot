import { WelcomeModule } from '#modules/WelcomeModule';
import { container } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { GuildMember, GuildTextBasedChannel, HexColorString } from 'discord.js';
import type { WelcomeSettings } from '#prisma';

export class WelcomeHandler {
	public constructor(private readonly member: GuildMember) {}

	public async run(): Promise<void> {
		const { client, welcome, validator } = container;

		const settings = await welcome.getSettings(this.member.guild.id);
		if (isNullish(settings) || !settings.enabled || isNullish(settings.channelId)) return;
		if (!settings.message && !settings.title && !settings.description) return;

		const channel = (await client.channels.fetch(settings.channelId)) as GuildTextBasedChannel | null;
		const { result } = await validator.channels.canSendEmbeds(channel);
		if (isNullish(channel) || !result) return;

		if (!settings.message) {
			await this.withEmbed(channel, settings);
			return;
		}

		if (!settings.title && !settings.description && !settings.image) {
			await this.withMessage(channel, settings);
			return;
		}

		await this.withMessageAndEmbed(channel, settings);
	}

	private async withEmbed(channel: GuildTextBasedChannel, settings: WelcomeSettings) {
		const embed = this.createTemplateEmbed(settings.color, settings.image);

		if (settings.title) {
			const title = WelcomeModule.formatText(settings.title, this.member);
			embed.setTitle(title);
		}
		if (settings.description) {
			const desc = WelcomeModule.formatText(settings.description, this.member);
			embed.setDescription(desc);
		}

		return channel.send({
			embeds: [embed]
		});
	}

	private async withMessage(channel: GuildTextBasedChannel, settings: WelcomeSettings) {
		const message = WelcomeModule.formatText(settings.message!, this.member);

		return channel.send({
			content: message,
			allowedMentions: { users: [this.member.id] }
		});
	}

	private async withMessageAndEmbed(channel: GuildTextBasedChannel, settings: WelcomeSettings) {
		const embed = this.createTemplateEmbed(settings.color, settings.image);

		if (settings.title) {
			const title = WelcomeModule.formatText(settings.title, this.member);
			embed.setTitle(title);
		}
		if (settings.description) {
			const desc = WelcomeModule.formatText(settings.description, this.member);
			embed.setDescription(desc);
		}

		const message = WelcomeModule.formatText(settings.message!, this.member);

		return channel.send({
			content: message,
			embeds: [embed],
			allowedMentions: { users: [this.member.id] }
		});
	}

	private createTemplateEmbed(color: string | null, image: string | null) {
		const embed = new EmbedBuilder()
			.setColor(<HexColorString>color ?? '#006BFC')
			.setFooter({ text: `Total members: ${this.member.guild.memberCount}` })
			.setTimestamp();
		if (image) embed.setImage(image);
		return embed;
	}
}
