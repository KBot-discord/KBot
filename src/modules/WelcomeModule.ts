import { WelcomeSettingsRepository } from '#repositories';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { WelcomeSettings } from '#prisma';
import type { UpsertWelcomeSettingsData } from '#types/repositories';

@ApplyOptions<Module.Options>({
	fullName: 'Welcome Module'
})
export class WelcomeModule extends Module {
	private readonly repository: WelcomeSettingsRepository;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });

		this.repository = new WelcomeSettingsRepository();

		this.container.welcome = this;
	}

	public async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.getSettings(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}

	public async getSettings(guildId: string): Promise<WelcomeSettings | null> {
		return this.repository.findOne({ guildId });
	}

	public async upsertSettings(guildId: string, data: UpsertWelcomeSettingsData): Promise<WelcomeSettings> {
		return this.repository.upsert({ guildId }, data);
	}

	public static formatWelcomeText(text: string, member: GuildMember) {
		return text
			.replaceAll(/({nl})/g, '\n')
			.replaceAll(/({@member})/g, `<@${member.id}>`)
			.replaceAll(/({membertag})/g, `${member.user.tag}`)
			.replaceAll(/({server})/g, `${member.guild.name}`);
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		WelcomeModule: never;
	}
}
