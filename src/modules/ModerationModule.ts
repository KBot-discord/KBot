import { Module } from '@kbotdev/plugin-modules';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullOrUndefined } from '@sapphire/utilities';
import { EmbedBuilder, bold, time } from 'discord.js';
import type { GuildMember } from 'discord.js';
import { ModerationSettingsService } from '../lib/services/ModerationSettingsService.js';
import { MinageHandler } from '../lib/structures/handlers/MinageHandler.js';
import { KBotModules } from '../lib/types/Enums.js';
import { EmbedColors } from '../lib/utilities/constants.js';
import { getGuildIcon } from '../lib/utilities/discord.js';

@ApplyOptions<Module.Options>({
	name: KBotModules.Moderation,
	fullName: 'Moderation Module',
})
export class ModerationModule extends Module {
	public readonly settings: ModerationSettingsService;

	public constructor(context: Module.LoaderContext, options: Module.Options) {
		super(context, options);

		this.settings = new ModerationSettingsService();

		this.container.moderation = this;
	}

	public override async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullOrUndefined(guild)) return false;
		const settings = await this.settings.get(guild.id);
		return isNullOrUndefined(settings) ? false : settings.enabled;
	}

	public formatMinageMessage(member: GuildMember, message: string, req: number, reqDate: number): string {
		const seconds = Math.floor(reqDate / 1000);
		const stampDays = time(seconds, 'R');
		const stampDate = time(seconds, 'D');

		return message
			.replaceAll('{server}', bold(member.guild.name))
			.replaceAll('{req}', bold(String(req)))
			.replaceAll('{days}', stampDays)
			.replaceAll('{date}', stampDate);
	}

	public formatMinageEmbed(
		member: GuildMember,
		msg: string | null | undefined,
		req: number,
		reqDate: number,
	): EmbedBuilder {
		const message = msg ?? MinageHandler.defaultMessage;

		const formattedMessage = this.formatMinageMessage(member, message, req, reqDate);
		const icon = getGuildIcon(member.guild);

		return new EmbedBuilder()
			.setColor(EmbedColors.Default)
			.setAuthor({ name: 'You have been kicked due to your account being too new' })
			.setThumbnail(icon ?? null)
			.setDescription(formattedMessage);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		[KBotModules.Moderation]: never;
	}
}
