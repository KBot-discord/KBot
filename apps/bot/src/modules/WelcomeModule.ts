import { WelcomeSettingsService } from '#services';
import { Module } from '@kbotdev/plugin-modules';
import { isNullish } from '@sapphire/utilities';
import type { GuildMember } from 'discord.js';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';

export class WelcomeModule extends Module {
	public readonly settings: WelcomeSettingsService;

	public constructor(options?: Module.Options) {
		super({ ...options, fullName: 'Welcome Module' });

		this.settings = new WelcomeSettingsService();
	}

	public override async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullish(guild)) return false;
		const settings = await this.settings.get(guild.id);
		return isNullish(settings) ? false : settings.enabled;
	}

	public static formatText(text: string, member: GuildMember): string {
		return text
			.replaceAll('{nl}', '\n')
			.replaceAll('{@member}', `<@${member.id}>`)
			.replaceAll('{membertag}', `${member.user.tag}`)
			.replaceAll('{server}', `${member.guild.name}`);
	}
}
