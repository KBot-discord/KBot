import { ModerationSettingsService } from '#services';
import { MinageHandler } from '#structures/handlers/MinageHandler';
import { getGuildIcon } from '#utils/Discord';
import { EmbedColors } from '#utils/constants';
import { AntiHoistHandler } from '#structures/handlers/AntiHoistHandler';
import { Module } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import { EmbedBuilder } from 'discord.js';
import type { GuildMember } from 'discord.js';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';

export class ModerationModule extends Module {
	public readonly settings: ModerationSettingsService;
	public readonly antiHoist: AntiHoistHandler;

	public constructor(options?: Module.Options) {
		super({ ...options, fullName: 'Moderation Module' });

		this.antiHoist = new AntiHoistHandler();
		this.settings = new ModerationSettingsService();
	}

	public override async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.settings.get(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}

	public static formatMinageMessage(member: GuildMember, message: string, req: number, reqDate: number): string {
		const stampDays = `<t:${Math.floor(reqDate / 1000)}:R>`;
		const stampDate = `<t:${Math.floor(reqDate / 1000)}:D>`;

		return message
			.replaceAll('{server}', `**${member.guild.name}**`)
			.replaceAll('{req}', `**${req}**`)
			.replaceAll('{days}', `${stampDays}`)
			.replaceAll('{date}', `${stampDate}`);
	}

	public static formatMinageEmbed(member: GuildMember, msg: string | null | undefined, req: number, reqDate: number): EmbedBuilder {
		const message = msg ?? MinageHandler.defaultMessage;

		const formattedMessage = ModerationModule.formatMinageMessage(member, message, req, reqDate);
		const icon = getGuildIcon(member.guild);

		return new EmbedBuilder()
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'You have been kicked due to your account being too new' })
			.setThumbnail(icon ?? null)
			.setDescription(formattedMessage);
	}
}
