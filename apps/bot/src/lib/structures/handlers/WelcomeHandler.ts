import { fetchChannel } from '#lib/utilities/discord';
import { isNullOrUndefined } from '#lib/utilities/functions';
import { container } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import type { GuildMember, GuildTextBasedChannel, HexColorString, Message } from 'discord.js';
import type { WelcomeSettings } from '@prisma/client';

export class WelcomeHandler {
	public constructor(private readonly member: GuildMember) {}

	public async run(): Promise<void> {
		const { welcome, validator } = container;

		const settings = await welcome.settings.get(this.member.guild.id);
		if (isNullOrUndefined(settings) || !settings.enabled || isNullOrUndefined(settings.channelId)) return;
		if (!settings.message && !settings.title && !settings.description) return;

		const channel = await fetchChannel<GuildTextBasedChannel>(settings.channelId);
		const { result } = await validator.channels.canSendEmbeds(channel);
		if (isNullOrUndefined(channel) || !result) return;

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

	private async withEmbed(channel: GuildTextBasedChannel, settings: WelcomeSettings): Promise<Message<true>> {
		const { welcome } = container;
		const embed = this.createTemplateEmbed(settings.color, settings.image);

		if (settings.title) {
			const title = welcome.formatText(settings.title, this.member);
			embed.setTitle(title);
		}
		if (settings.description) {
			const desc = welcome.formatText(settings.description, this.member);
			embed.setDescription(desc);
		}

		return await channel.send({
			embeds: [embed]
		});
	}

	private async withMessage(channel: GuildTextBasedChannel, settings: WelcomeSettings): Promise<Message<true>> {
		const { welcome } = container;
		const message = welcome.formatText(settings.message!, this.member);

		return await channel.send({
			content: message,
			allowedMentions: { users: [this.member.id] }
		});
	}

	private async withMessageAndEmbed(channel: GuildTextBasedChannel, settings: WelcomeSettings): Promise<Message<true>> {
		const { welcome } = container;
		const embed = this.createTemplateEmbed(settings.color, settings.image);

		if (settings.title) {
			const title = welcome.formatText(settings.title, this.member);
			embed.setTitle(title);
		}
		if (settings.description) {
			const desc = welcome.formatText(settings.description, this.member);
			embed.setDescription(desc);
		}

		const message = welcome.formatText(settings.message!, this.member);

		return await channel.send({
			content: message,
			embeds: [embed],
			allowedMentions: { users: [this.member.id] }
		});
	}

	private createTemplateEmbed(color: string | null, image: string | null): EmbedBuilder {
		const embed = new EmbedBuilder()
			.setColor((color as HexColorString | undefined) ?? '#006BFC')
			.setFooter({ text: `Total members: ${this.member.guild.memberCount}` })
			.setTimestamp();
		if (image) embed.setImage(image);
		return embed;
	}
}
