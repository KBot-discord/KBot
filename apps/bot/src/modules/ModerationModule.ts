import { AntiHoistService, ModerationSettingsService } from '#services';
import { MinageHandler } from '#structures/handlers/MinageHandler';
import { getGuildIcon } from '#utils/Discord';
import { EmbedColors } from '#utils/constants';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { EmbedBuilder } from 'discord.js';
import type { GuildMember } from 'discord.js';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { UpsertModerationSettingsData } from '#types/database';
import type { ModerationSettings } from '@kbotdev/database';

@ApplyOptions<Module.Options>({
	name: 'ModerationModule',
	fullName: 'Moderation Module'
})
export class ModerationModule extends Module {
	public readonly settings: ModerationSettingsService;
	public readonly antiHoist: AntiHoistService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.antiHoist = new AntiHoistService();
		this.settings = new ModerationSettingsService();

		this.container.moderation = this;
	}

	public override async isEnabled({ guild }: IsEnabledContext) {
		if (isNullish(guild)) return false;
		const settings = await this.getSettings(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}

	public async getSettings(guildId: string): Promise<ModerationSettings | null> {
		return this.settings.get({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertModerationSettingsData): Promise<ModerationSettings> {
		return this.settings.upsert({ guildId }, data);
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

	public static formatMinageEmbed(member: GuildMember, msg: string | undefined | null, req: number, reqDate: number) {
		const message = msg ?? MinageHandler.defaultMessage;

		const formattedMessage = ModerationModule.formatMinageMessage(member, message, req, reqDate);
		const icon = getGuildIcon(member.guild);

		return new EmbedBuilder()
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'You have been kicked due to your account being too new' })
			.setThumbnail(icon!)
			.setDescription(formattedMessage);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		ModerationModule: never;
	}
}
