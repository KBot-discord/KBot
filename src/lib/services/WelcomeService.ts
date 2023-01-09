import { WelcomeRepository } from '#lib/database/repositories/WelcomeRepository';
import { container } from '@sapphire/framework';
import { HexColorString, EmbedBuilder } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import type { GuildMember, GuildTextBasedChannel } from 'discord.js';
import type { WelcomeModule } from '@prisma/client';

export class WelcomeService {
	private readonly repo;
	private readonly member;

	public constructor(member: GuildMember) {
		this.repo = new WelcomeRepository();
		this.member = member;
	}

	public async run() {
		const { client } = container;

		const config = await this.repo.getSettings(this.member.guild.id);
		if (!config?.channel) return;
		if (!config.message && !config.title && !config.description) return;

		const channel = (await client.channels.fetch(config.channel)) as GuildTextBasedChannel | null;
		if (!channel) return;

		const validPermissions = this.checkPerms(channel);
		if (!validPermissions) return;

		if (!config.message) return this.withEmbed(channel, config);
		if (!config.title && !config.description && !config.image) return this.withMessage(channel, config);
		return this.withMessageAndEmbed(channel, config);
	}

	private async withEmbed(channel: GuildTextBasedChannel, config: WelcomeModule) {
		const embed = this.createTemplateEmbed(config.color, config.image);

		if (config.title) {
			const title = this.parseText(config.title);
			embed.setTitle(title);
		}
		if (config.description) {
			const desc = this.parseText(config.description);
			embed.setDescription(desc);
		}

		return channel.send({
			embeds: [embed!]
		});
	}

	private async withMessage(channel: GuildTextBasedChannel, config: WelcomeModule) {
		const message = this.parseText(config.message!);

		return channel.send({
			content: message,
			allowedMentions: { users: [this.member.id] }
		});
	}

	private async withMessageAndEmbed(channel: GuildTextBasedChannel, config: WelcomeModule) {
		const embed = this.createTemplateEmbed(config.color, config.image);

		if (config.title) {
			const title = this.parseText(config.title);
			embed.setTitle(title);
		}
		if (config.description) {
			const desc = this.parseText(config.description);
			embed.setDescription(desc);
		}

		const message = this.parseText(config.message!);

		return channel.send({
			content: message,
			embeds: [embed],
			allowedMentions: { users: [this.member.id] }
		});
	}

	private parseText(inputString: string) {
		return inputString
			.replaceAll(/({nl})/, '\n')
			.replaceAll(/({@member})/, `<@${this.member.id}>`)
			.replaceAll(/({membertag})/, `${this.member.user.tag}`)
			.replaceAll(/({server})/, `${this.member.guild.name}`);
	}

	private createTemplateEmbed(color: string | null, image: string | null) {
		const embed = new EmbedBuilder()
			.setColor(<HexColorString>color ?? '#006BFC')
			.setFooter({ text: `Total members: ${this.member.guild.memberCount}` })
			.setTimestamp();
		if (image) embed.setImage(image);
		return embed;
	}

	private checkPerms(channel: GuildTextBasedChannel): boolean {
		const { me } = channel.guild.members;
		if (me!.permissions.has(PermissionFlagsBits.Administrator)) return true;
		if (!channel.viewable) return false;
		if (!channel.permissionsFor(me!).has(PermissionFlagsBits.SendMessages)) return false;
		return channel.permissionsFor(me!).has(PermissionFlagsBits.EmbedLinks);
	}
}
