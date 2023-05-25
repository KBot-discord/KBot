import { WelcomeSettingsService } from '#services';
import { isNullOrUndefined } from '#utils/functions';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import type { GuildMember } from 'discord.js';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';

@ApplyOptions<Module.Options>({
	fullName: 'Welcome Module'
})
export class WelcomeModule extends Module {
	public readonly settings: WelcomeSettingsService;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, options);

		this.settings = new WelcomeSettingsService();

		this.container.welcome = this;
	}

	public override async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullOrUndefined(guild)) return false;
		const settings = await this.settings.get(guild.id);
		return isNullOrUndefined(settings) ? false : settings.enabled;
	}

	public static formatText(text: string, member: GuildMember): string {
		return text
			.replaceAll('{nl}', '\n')
			.replaceAll('{@member}', `<@${member.id}>`)
			.replaceAll('{membertag}', `${member.user.tag}`)
			.replaceAll('{server}', `${member.guild.name}`);
	}
}

declare module '@kbotdev/plugin-modules' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Modules {
		WelcomeModule: never;
	}
}
