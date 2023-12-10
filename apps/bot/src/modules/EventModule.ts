import { EventSettingsService, KaraokeService } from '#lib/services';
import { EmbedColors } from '#lib/utilities/constants';
import { isNullOrUndefined } from '#lib/utilities/functions';
import { Module } from '@kbotdev/plugin-modules';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder, channelMention } from 'discord.js';
import type { IsEnabledContext } from '@kbotdev/plugin-modules';
import type { KBotModules } from '#lib/types/Enums';

@ApplyOptions<Module.Options>({
	fullName: 'Event Module'
})
export class EventModule extends Module {
	public readonly settings: EventSettingsService;
	public readonly karaoke: KaraokeService;

	public constructor(context: Module.LoaderContext, options: Module.Options) {
		super(context, options);

		this.settings = new EventSettingsService();
		this.karaoke = new KaraokeService();

		this.container.events = this;
	}

	public override async isEnabled({ guild }: IsEnabledContext): Promise<boolean> {
		if (isNullOrUndefined(guild)) return false;
		const settings = await this.settings.get(guild.id);
		return isNullOrUndefined(settings) ? false : settings.enabled;
	}

	public karaokeInstructionsEmbed(eventId: string, embed = new EmbedBuilder()): EmbedBuilder {
		return embed
			.setColor(EmbedColors.Default) //
			.addFields(
				{ name: '**Voice channel:** ', value: channelMention(eventId) },
				{ name: '**Text channel:** ', value: channelMention(eventId), inline: true },
				{
					name: '**Instructions:**',
					value: [
						'**1.** Join the karaoke queue by running the `/karaoke join` slash command.',
						'**2.** Once your turn comes up, you will be invited to become a speaker on the stage.',
						'**3.** After singing, you can either leave the stage by muting your mic, clicking the "Move to audience" button, leaving the stage, or running the `/karaoke leave` slash command.'
					].join('\n')
				}
			);
	}
}

declare module '@kbotdev/plugin-modules' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Modules {
		[KBotModules.Events]: never;
	}
}
