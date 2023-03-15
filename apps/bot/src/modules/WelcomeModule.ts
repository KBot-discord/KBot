import { WelcomeSettingsService } from '#services/welcome';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { WelcomeSettings } from '#prisma';
import type { UpsertWelcomeSettingsData } from '#types/database';

@ApplyOptions<Module.Options>({
	fullName: 'Welcome Module'
})
export class WelcomeModule extends Module {
	private readonly settings: WelcomeSettingsService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.settings = new WelcomeSettingsService();

		this.container.welcome = this;
	}

	public async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.getSettings(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}

	public async getSettings(guildId: string): Promise<WelcomeSettings | null> {
		return this.settings.get({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertWelcomeSettingsData): Promise<WelcomeSettings> {
		return this.settings.upsert({ guildId }, data);
	}

	public static formatText(text: string, member: GuildMember) {
		return text
			.replaceAll('{nl}', '\n')
			.replaceAll('{@member}', `<@${member.id}>`)
			.replaceAll('{membertag}', `${member.user.tag}`)
			.replaceAll('{server}', `${member.guild.name}`);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		WelcomeModule: never;
	}
}
